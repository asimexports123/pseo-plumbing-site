/**
 * Validates the LIVE production robots.txt against Google's parser rules.
 * Fetches https://yohomefix.com/robots.txt at runtime — no assumptions.
 */

const PRODUCTION_URL = 'https://yohomefix.com/robots.txt';

function parseRobots(txt) {
  const lines = txt.split('\n');
  const groups = [];
  let current = null;
  let sitemaps = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const match = trimmed.match(/^(User-agent|Allow|Disallow|Sitemap|Content-Signal):\s*(.*)$/i);
    if (!match) continue;

    const [, key, value] = match;
    const keyLower = key.toLowerCase();

    if (keyLower === 'user-agent') {
      // Check if we should merge with previous group (consecutive User-agent lines)
      if (current && current.rules.length === 0 && current.contentSignals.length === 0) {
        // Previous group has no rules yet — this is a consecutive user-agent, merge
        current.userAgents.push(value);
      } else {
        // Start new group
        if (current) groups.push(current);
        current = { userAgents: [value], rules: [], contentSignals: [] };
      }
    } else if (keyLower === 'allow' || keyLower === 'disallow') {
      if (current) current.rules.push({ type: keyLower, path: value });
    } else if (keyLower === 'content-signal') {
      if (current) current.contentSignals.push(value);
    } else if (keyLower === 'sitemap') {
      sitemaps.push(value);
    }
  }
  if (current) groups.push(current);

  return { groups, sitemaps };
}

function checkPath(group, testPath) {
  let allowed = true;
  let matchedRule = null;
  let matchedLength = -1;

  for (const rule of group.rules) {
    if (testPath.startsWith(rule.path)) {
      if (rule.path.length > matchedLength) {
        matchedLength = rule.path.length;
        matchedRule = rule;
        allowed = rule.type === 'allow';
      } else if (rule.path.length === matchedLength) {
        // Tie: Allow wins per Google's parser
        if (rule.type === 'allow') {
          allowed = true;
          matchedRule = rule;
        }
      }
    }
  }

  return { allowed, rule: matchedRule };
}

function findGroup(groups, botName) {
  // Google's parser: most specific user-agent match wins
  // If bot name contains a listed user-agent string, that group applies
  let match = null;
  let matchLen = 0;
  for (const group of groups) {
    for (const ua of group.userAgents) {
      if (ua === '*') continue;
      if (botName.toLowerCase().includes(ua.toLowerCase()) || ua.toLowerCase().includes(botName.toLowerCase())) {
        if (ua.length > matchLen) {
          match = group;
          matchLen = ua.length;
        }
      }
    }
  }
  // Fall back to * groups (there may be multiple — Google merges them)
  if (!match) {
    const starGroups = groups.filter(g => g.userAgents.includes('*'));
    if (starGroups.length > 0) {
      // Merge all * groups
      match = { userAgents: ['*'], rules: [], contentSignals: [] };
      for (const g of starGroups) {
        match.rules.push(...g.rules);
        match.contentSignals.push(...g.contentSignals);
      }
    }
  }
  return match;
}

async function main() {
  console.log('='.repeat(70));
  console.log('PRODUCTION ROBOTS.TXT VALIDATION');
  console.log('Fetching live file from: ' + PRODUCTION_URL);
  console.log('='.repeat(70));

  let prodTxt;
  try {
    const res = await fetch(PRODUCTION_URL);
    if (!res.ok) {
      console.log(`❌ Failed to fetch production robots.txt: HTTP ${res.status}`);
      process.exit(1);
    }
    prodTxt = await res.text();
    console.log(`✅ Fetched ${prodTxt.length} bytes\n`);
  } catch (err) {
    console.log(`❌ Error fetching production robots.txt: ${err.message}`);
    process.exit(1);
  }

  // Check for Cloudflare managed content
  console.log('─'.repeat(70));
  console.log('1. CLOUDFLARE MANAGED CONTENT DETECTION');
  console.log('─'.repeat(70));

  const hasCloudflareHeader = prodTxt.includes('BEGIN Cloudflare Managed content');
  const hasCloudflareFooter = prodTxt.includes('END Cloudflare Managed Content');
  const hasContentSignal = prodTxt.includes('Content-Signal:');
  const hasCloudflareAllowAll = prodTxt.includes('User-agent: *\nContent-Signal:') && prodTxt.includes('Allow: /');

  console.log(`  "BEGIN Cloudflare Managed content" marker: ${hasCloudflareHeader ? '✅ Present' : '❌ Absent'}`);
  console.log(`  "END Cloudflare Managed Content" marker:   ${hasCloudflareFooter ? '✅ Present' : '❌ Absent'}`);
  console.log(`  Content-Signal directives:                 ${hasContentSignal ? '✅ Present' : '❌ Absent'}`);
  console.log(`  Cloudflare User-agent: * with Allow: /:    ${hasCloudflareAllowAll ? '⚠️  PRESENT — CONFLICT' : '❌ Absent'}`);

  if (hasCloudflareHeader) {
    console.log('\n  ⚠️  CLOUDFLARE IS INJECTING MANAGED ROBOTS.TXT CONTENT');
    console.log('  Source: Cloudflare → Security → Bots → AI Audit feature');
    console.log('  This injects a User-agent: * group with Allow: / BEFORE your local rules.');
    console.log('  Google\'s parser merges duplicate User-agent: * groups.');
    console.log('  When Allow: / (length 1) ties with Disallow: / (length 1), Allow WINS.');
    console.log('  → Your catch-all "deny all other crawlers" is INEFFECTIVE in production.');
  } else {
    console.log('\n  ✅ No Cloudflare managed content detected.');
  }

  // Parse the full production robots.txt
  const { groups, sitemaps } = parseRobots(prodTxt);

  console.log(`\n  Total groups parsed: ${groups.length}`);
  console.log(`  Total sitemaps: ${sitemaps.length}`);

  // Check for duplicate user-agents
  console.log('\n─'.repeat(70));
  console.log('2. DUPLICATE USER-AGENT GROUP CHECK');
  console.log('─'.repeat(70));

  const uaGroups = {};
  for (const group of groups) {
    for (const ua of group.userAgents) {
      if (!uaGroups[ua]) uaGroups[ua] = [];
      uaGroups[ua].push(group);
    }
  }

  let duplicatesFound = false;
  for (const [ua, grpList] of Object.entries(uaGroups)) {
    if (grpList.length > 1) {
      duplicatesFound = true;
      const rules = grpList.map(g => g.rules.map(r => `${r.type}: ${r.path}`).join(', ') || '(no rules)').join(' | ');
      console.log(`  ❌ "${ua}" appears in ${grpList.length} groups: [${rules}]`);
    }
  }
  if (!duplicatesFound) {
    console.log('  ✅ No duplicate user-agent groups');
  }

  // Check catch-all conflict
  console.log('\n─'.repeat(70));
  console.log('3. CATCH-ALL (User-agent: *) CONFLICT ANALYSIS');
  console.log('─'.repeat(70));

  const starGroups = groups.filter(g => g.userAgents.includes('*'));
  console.log(`  Number of User-agent: * groups: ${starGroups.length}`);

  if (starGroups.length > 1) {
    console.log('  ⚠️  MULTIPLE User-agent: * groups detected — Google merges these:');
    for (let i = 0; i < starGroups.length; i++) {
      const g = starGroups[i];
      const rules = g.rules.map(r => `${r.type}: ${r.path}`).join(', ') || '(none)';
      const signals = g.contentSignals.join(', ') || '(none)';
      console.log(`    Group ${i + 1}: rules=[${rules}], contentSignals=[${signals}]`);
    }

    // Merge and check for Allow/Disallow / conflict
    const allRules = starGroups.flatMap(g => g.rules);
    const hasAllowRoot = allRules.some(r => r.type === 'allow' && r.path === '/');
    const hasDisallowRoot = allRules.some(r => r.type === 'disallow' && r.path === '/');

    if (hasAllowRoot && hasDisallowRoot) {
      console.log('\n  ❌ CRITICAL CONFLICT: Merged * group has BOTH Allow: / and Disallow: /');
      console.log('  Google\'s parser: path length tie (both = 1) → Allow wins');
      console.log('  RESULT: Unlisted crawlers are ALLOWED to crawl all pages in production');
    } else if (hasDisallowRoot && !hasAllowRoot) {
      console.log('\n  ✅ Merged * group has Disallow: / only → unlisted crawlers blocked');
    } else if (hasAllowRoot && !hasDisallowRoot) {
      console.log('\n  ⚠️  Merged * group has Allow: / only → unlisted crawlers allowed');
    }
  } else if (starGroups.length === 1) {
    const g = starGroups[0];
    const hasAllowRoot = g.rules.some(r => r.type === 'allow' && r.path === '/');
    const hasDisallowRoot = g.rules.some(r => r.type === 'disallow' && r.path === '/');
    if (hasAllowRoot && hasDisallowRoot) {
      console.log('  ❌ CONFLICT: Allow: / and Disallow: / in same group → Allow wins');
    } else if (hasDisallowRoot) {
      console.log('  ✅ Disallow: / only → unlisted crawlers blocked');
    } else {
      console.log('  ⚠️  No Disallow: / → unlisted crawlers allowed');
    }
  }

  // Bot behavior verification
  console.log('\n─'.repeat(70));
  console.log('4. BOT BEHAVIOR VERIFICATION (production robots.txt)');
  console.log('─'.repeat(70));

  const testBots = [
    { name: 'Googlebot', type: 'search', expected: { '/': 'ALLOW', '/dashboard': 'BLOCK', '/api/test': 'BLOCK' } },
    { name: 'Googlebot-Image', type: 'search', expected: { '/': 'ALLOW', '/dashboard': 'BLOCK', '/api/test': 'BLOCK' } },
    { name: 'Googlebot-News', type: 'search', expected: { '/': 'ALLOW', '/dashboard': 'BLOCK', '/api/test': 'BLOCK' } },
    { name: 'Googlebot-Video', type: 'search', expected: { '/': 'ALLOW', '/dashboard': 'BLOCK', '/api/test': 'BLOCK' } },
    { name: 'GoogleOther', type: 'search', expected: { '/': 'ALLOW', '/dashboard': 'BLOCK', '/api/test': 'BLOCK' } },
    { name: 'AdsBot-Google', type: 'search', expected: { '/': 'ALLOW', '/dashboard': 'BLOCK', '/api/test': 'BLOCK' } },
    { name: 'Bingbot', type: 'search', expected: { '/': 'ALLOW', '/dashboard': 'BLOCK', '/api/test': 'BLOCK' } },
    { name: 'ChatGPT-User', type: 'ai-fetcher', expected: { '/': 'ALLOW', '/dashboard': 'BLOCK', '/api/test': 'BLOCK' } },
    { name: 'PerplexityBot', type: 'ai-fetcher', expected: { '/': 'ALLOW', '/dashboard': 'BLOCK', '/api/test': 'BLOCK' } },
    { name: 'Claude-SearchBot', type: 'ai-fetcher', expected: { '/': 'ALLOW', '/dashboard': 'BLOCK', '/api/test': 'BLOCK' } },
    { name: 'GPTBot', type: 'blocked', expected: { '/': 'BLOCK' } },
    { name: 'ClaudeBot', type: 'blocked', expected: { '/': 'BLOCK' } },
    { name: 'Google-Extended', type: 'blocked', expected: { '/': 'BLOCK' } },
    { name: 'CCBot', type: 'blocked', expected: { '/': 'BLOCK' } },
    { name: 'Bytespider', type: 'blocked', expected: { '/': 'BLOCK' } },
    { name: 'Applebot', type: 'blocked', expected: { '/': 'BLOCK' } },
    { name: 'Amazonbot', type: 'blocked', expected: { '/': 'BLOCK' } },
    { name: 'meta-externalagent', type: 'blocked', expected: { '/': 'BLOCK' } },
    // Test an unlisted bot to check catch-all
    { name: 'SemrushBot', type: 'unlisted', expected: { '/': 'BLOCK' } },
    { name: 'AhrefsBot', type: 'unlisted', expected: { '/': 'BLOCK' } },
  ];

  const testPaths = ['/', '/dashboard', '/api/test', '/plumber-oklahoma-city-emergency'];

  let allPass = true;
  for (const bot of testBots) {
    const group = findGroup(groups, bot.name);
    if (!group) {
      console.log(`  ⚠️  ${bot.name}: No matching group (allowed by default)`);
      allPass = false;
      continue;
    }

    const results = {};
    for (const p of testPaths) {
      results[p] = checkPath(group, p).allowed ? 'ALLOW' : 'BLOCK';
    }

    let status = '✅';
    for (const [path, expected] of Object.entries(bot.expected)) {
      if (results[path] !== expected) {
        status = '❌';
        allPass = false;
      }
    }

    const summary = testPaths.map(p => `${p}→${results[p]}`).join(', ');
    console.log(`  ${status} ${bot.name.padEnd(20)} ${summary}`);
  }

  // Cloudflare fix instructions
  if (hasCloudflareHeader) {
    console.log('\n─'.repeat(70));
    console.log('5. CLOUDFLARE FIX INSTRUCTIONS');
    console.log('─'.repeat(70));
    console.log('  To resolve the catch-all conflict:');
    console.log('');
    console.log('  Option A (recommended): Disable AI Audit robots.txt injection');
    console.log('    1. Cloudflare Dashboard → yohomefix.com');
    console.log('    2. Security → Bots → AI Audit');
    console.log('    3. Toggle OFF "Add to robots.txt" (or disable AI Audit entirely)');
    console.log('    4. Purge cache: Caching → Configuration → Purge Everything');
    console.log('    5. Re-run this validator to confirm fix');
    console.log('');
    console.log('  Option B: Use a Cloudflare Configuration Rule to override');
    console.log('    1. Rules → Configuration Rules → Create rule');
    console.log('    2. Match: URI Path equals "/robots.txt"');
    console.log('    3. Setting: Override robots.txt → paste the local public/robots.txt content');
    console.log('    4. Purge cache');
    console.log('');
    console.log('  After either fix, the production robots.txt will match the local');
    console.log('  public/robots.txt (which has no conflicts).');
  }

  console.log('\n' + '='.repeat(70));
  if (allPass && !hasCloudflareHeader) {
    console.log('✅ ALL CHECKS PASSED — Production robots.txt is clean');
  } else if (allPass && hasCloudflareHeader) {
    console.log('⚠️  BOT RULES PASS but Cloudflare catch-all conflict exists');
    console.log('   Specific bot rules work correctly (they have their own groups)');
    console.log('   The catch-all deny is broken for UNLISTED crawlers only');
  } else {
    console.log('❌ ISSUES DETECTED — See details above');
  }
  console.log('='.repeat(70));
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
