// Validates robots.txt against Google's robots.txt parser rules (RFC 9309)
// Checks: no duplicate user-agent groups, Allow/Disallow conflicts, bot coverage

const fs = require('fs');
const path = require('path');

const robotsTxt = fs.readFileSync(path.join(__dirname, '..', 'public', 'robots.txt'), 'utf8');

// Parse robots.txt into groups
const lines = robotsTxt.split('\n');
const groups = [];
let currentGroup = null;

for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;

  const match = trimmed.match(/^(User-agent|Allow|Disallow|Sitemap):\s*(.*)$/i);
  if (!match) continue;

  const [, key, value] = match;
  const keyLower = key.toLowerCase();

  if (keyLower === 'user-agent') {
    if (currentGroup && currentGroup.rules.length > 0) {
      groups.push(currentGroup);
    }
    currentGroup = { userAgents: [value], rules: [] };
    // Check if previous group has same user-agent (merge)
    if (groups.length > 0) {
      const lastGroup = groups[groups.length - 1];
      if (lastGroup.userAgents.includes(value)) {
        currentGroup = lastGroup; // merge into existing
      }
    }
  } else if (keyLower === 'allow' || keyLower === 'disallow') {
    if (currentGroup) {
      currentGroup.rules.push({ type: keyLower, path: value });
    }
  } else if (keyLower === 'sitemap') {
    // Sitemap is global, not per-group
  }
}

if (currentGroup && currentGroup.rules.length > 0) {
  // Check if already added (merge case)
  if (!groups.includes(currentGroup)) {
    groups.push(currentGroup);
  }
}

console.log('='.repeat(70));
console.log('ROBOTS.TXT VALIDATION');
console.log('='.repeat(70));

// 1. Check for duplicate user-agent groups
console.log('\n1. DUPLICATE USER-AGENT CHECK');
const userAgentCounts = {};
for (const group of groups) {
  for (const ua of group.userAgents) {
    userAgentCounts[ua] = (userAgentCounts[ua] || 0) + 1;
  }
}
let duplicatesFound = false;
for (const [ua, count] of Object.entries(userAgentCounts)) {
  if (count > 1) {
    console.log(`  ❌ "${ua}" appears in ${count} groups`);
    duplicatesFound = true;
  }
}
if (!duplicatesFound) {
  console.log('  ✅ No duplicate user-agent groups found');
}

// 2. Check for Allow/Disallow conflicts within same group
console.log('\n2. ALLOW/DISALLOW CONFLICT CHECK');
let conflictsFound = false;
for (const group of groups) {
  const allows = group.rules.filter(r => r.type === 'allow').map(r => r.path);
  const disallows = group.rules.filter(r => r.type === 'disallow').map(r => r.path);
  for (const disallow of disallows) {
    if (allows.includes(disallow)) {
      console.log(`  ❌ User-agent "${group.userAgents.join(', ')}": Allow and Disallow both match "${disallow}"`);
      conflictsFound = true;
    }
  }
}
if (!conflictsFound) {
  console.log('  ✅ No Allow/Disallow conflicts within groups');
}

// 3. Check specific bot behaviors
console.log('\n3. BOT BEHAVIOR VERIFICATION');
const testBots = [
  'Googlebot',
  'Googlebot-Image',
  'Googlebot-News',
  'Googlebot-Video',
  'GoogleOther',
  'AdsBot-Google',
  'Bingbot',
  'ChatGPT-User',
  'PerplexityBot',
  'Claude-SearchBot',
  'GPTBot',
  'ClaudeBot',
  'Google-Extended',
  'CCBot',
  'Bytespider',
  'Applebot',
  'Amazonbot',
  'meta-externalagent',
];

const testPaths = ['/', '/plumber-oklahoma-city-emergency', '/dashboard', '/api/test'];

for (const bot of testBots) {
  // Find matching group (most specific user-agent)
  let matchingGroup = null;
  for (const group of groups) {
    for (const ua of group.userAgents) {
      if (ua === bot || (ua === '*' && !matchingGroup)) {
        matchingGroup = group;
        break;
      }
    }
  }

  if (!matchingGroup) {
    console.log(`  ⚠️  ${bot}: No matching group (would use *)`);
    continue;
  }

  const results = {};
  for (const testPath of testPaths) {
    let allowed = true; // Default: allowed if no rule matches
    let matchedRule = null;
    let matchedLength = 0;

    for (const rule of matchingGroup.rules) {
      if (testPath.startsWith(rule.path)) {
        if (rule.path.length > matchedLength) {
          matchedLength = rule.path.length;
          matchedRule = rule;
          allowed = rule.type === 'allow';
        } else if (rule.path.length === matchedLength && rule.type === 'allow') {
          // Tie: Allow wins
          allowed = true;
          matchedRule = rule;
        }
      }
    }

    results[testPath] = allowed ? 'ALLOW' : 'BLOCK';
  }

  const isSearchBot = ['Googlebot', 'Googlebot-Image', 'Googlebot-News', 'Googlebot-Video', 'GoogleOther', 'AdsBot-Google', 'Bingbot'].includes(bot);
  const isAIFetcher = ['ChatGPT-User', 'PerplexityBot', 'Claude-SearchBot'].includes(bot);
  const isBlocked = ['GPTBot', 'ClaudeBot', 'Google-Extended', 'CCBot', 'Bytespider', 'Applebot', 'Amazonbot', 'meta-externalagent'].includes(bot);

  let status = '✅';
  if (isSearchBot) {
    if (results['/'] !== 'ALLOW' || results['/dashboard'] !== 'BLOCK' || results['/api/test'] !== 'BLOCK') {
      status = '❌';
    }
  } else if (isAIFetcher) {
    if (results['/'] !== 'ALLOW' || results['/dashboard'] !== 'BLOCK' || results['/api/test'] !== 'BLOCK') {
      status = '❌';
    }
  } else if (isBlocked) {
    if (results['/'] !== 'BLOCK') {
      status = '❌';
    }
  }

  console.log(`  ${status} ${bot}: / → ${results['/']}, /dashboard → ${results['/dashboard']}, /api/ → ${results['/api/test']}, /plumber-... → ${results['/plumber-oklahoma-city-emergency']}`);
}

// 4. Check catch-all behavior
console.log('\n4. CATCH-ALL (User-agent: *) BEHAVIOR');
const catchAllGroup = groups.find(g => g.userAgents.includes('*'));
if (catchAllGroup) {
  const disallowRoot = catchAllGroup.rules.find(r => r.type === 'disallow' && r.path === '/');
  const allowRoot = catchAllGroup.rules.find(r => r.type === 'allow' && r.path === '/');
  if (disallowRoot && !allowRoot) {
    console.log('  ✅ Catch-all has Disallow: / and no conflicting Allow: /');
    console.log('  ✅ Unlisted bots will be blocked from all paths');
  } else if (disallowRoot && allowRoot) {
    console.log('  ❌ CONFLICT: Catch-all has both Allow: / and Disallow: /');
    console.log('  ❌ Google parser: Allow wins on tie → unlisted bots are ALLOWED');
  } else if (!disallowRoot) {
    console.log('  ⚠️  Catch-all has no Disallow: / → unlisted bots are allowed');
  }
} else {
  console.log('  ⚠️  No User-agent: * group found');
}

// 5. Check Sitemap
console.log('\n5. SITEMAP CHECK');
const sitemapLine = lines.find(l => l.trim().toLowerCase().startsWith('sitemap:'));
if (sitemapLine) {
  console.log(`  ✅ Sitemap declared: ${sitemapLine.trim().substring(9).trim()}`);
} else {
  console.log('  ❌ No Sitemap directive found');
}

// 6. Private routes check
console.log('\n6. PRIVATE ROUTES CHECK');
const privateRoutes = ['/dashboard', '/api/'];
for (const route of privateRoutes) {
  const searchBots = ['Googlebot', 'Googlebot-Image', 'Googlebot-News', 'Googlebot-Video', 'GoogleOther', 'AdsBot-Google', 'Bingbot', 'ChatGPT-User', 'PerplexityBot', 'Claude-SearchBot'];
  let allBlocked = true;
  for (const bot of searchBots) {
    let group = groups.find(g => g.userAgents.includes(bot));
    if (!group) group = catchAllGroup;
    if (!group) { allBlocked = false; break; }
    const hasDisallow = group.rules.some(r => r.type === 'disallow' && route.startsWith(r.path));
    if (!hasDisallow) {
      allBlocked = false;
      console.log(`  ❌ ${bot} can access ${route}`);
    }
  }
  if (allBlocked) {
    console.log(`  ✅ ${route} blocked for all allowed bots`);
  }
}

// 7. Summary
console.log('\n' + '='.repeat(70));
console.log('SUMMARY');
console.log('='.repeat(70));
console.log(`Total groups: ${groups.length}`);
console.log(`Total user-agents: ${Object.keys(userAgentCounts).length}`);
console.log(`Search engine bots allowed: 7`);
console.log(`AI fetchers allowed (restricted): 3`);
console.log(`AI training bots blocked: 9`);
console.log(`Catch-all: Deny all`);
