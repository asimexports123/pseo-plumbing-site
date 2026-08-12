// Fetch and analyze LIVE robots.txt from production
const ROBOTS_URL = 'https://yohomefix.com/robots.txt';

// Parse robots.txt into groups
function parseRobots(txt) {
  const lines = txt.split('\n');
  const groups = [];
  let current = null;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const uaMatch = trimmed.match(/^User-agent:\s*(.+)$/i);
    const disallowMatch = trimmed.match(/^Disallow:\s*(.*)$/i);
    const allowMatch = trimmed.match(/^Allow:\s*(.*)$/i);
    if (uaMatch) {
      const ua = uaMatch[1].trim();
      if (current && current.rules.length === 0) {
        current.userAgents.push(ua);
      } else {
        current = { userAgents: [ua], rules: [] };
        groups.push(current);
      }
    } else if (disallowMatch && current) {
      current.rules.push({ type: 'Disallow', path: disallowMatch[1].trim() });
    } else if (allowMatch && current) {
      current.rules.push({ type: 'Allow', path: allowMatch[1].trim() });
    }
  }
  return groups;
}

// Find which group applies to a user-agent
function getGroupForUA(groups, userAgent) {
  // Try exact match first (case-insensitive)
  let matched = null;
  for (const g of groups) {
    for (const ua of g.userAgents) {
      if (ua.toLowerCase() === userAgent.toLowerCase()) {
        return g;
      }
    }
  }
  // Try prefix match (e.g. "Googlebot-News" matches "Googlebot")
  for (const g of groups) {
    for (const ua of g.userAgents) {
      if (ua !== '*' && userAgent.toLowerCase().startsWith(ua.toLowerCase())) {
        return g;
      }
    }
  }
  // Fall back to *
  for (const g of groups) {
    if (g.userAgents.includes('*')) return g;
  }
  return null;
}

(async () => {
  const res = await fetch(ROBOTS_URL, { headers: { 'User-Agent': 'Mozilla/5.0', 'Cache-Control': 'no-cache' } });
  const txt = await res.text();
  console.log('Fetched from:', ROBOTS_URL);
  console.log('Status:', res.status);
  console.log();

  const groups = parseRobots(txt);
  const bots = [
    ['Google', 'Googlebot'],
    ['Bing', 'Bingbot'],
    ['Yahoo', 'Slurp'],
    ['DuckDuckGo', 'DuckDuckBot'],
    ['Apple', 'Applebot'],
    ['Apple (Extended)', 'Applebot-Extended'],
    ['GPTBot (AI training)', 'GPTBot'],
    ['ClaudeBot (AI training)', 'ClaudeBot'],
    ['Google-Extended (AI training)', 'Google-Extended'],
    ['CCBot (AI training)', 'CCBot'],
  ];

  console.log('═'.repeat(70));
  console.log('LIVE ROBOTS.TXT ANALYSIS — Per RFC 9309');
  console.log('═'.repeat(70));
  console.log();

  for (const [name, ua] of bots) {
    const group = getGroupForUA(groups, ua);
    const hasSpecific = groups.some(g => g.userAgents.some(u => u.toLowerCase() === ua.toLowerCase()));
    const isBlocked = group && group.rules.some(r => r.path === '/');

    console.log(`${name} (${ua}):`);
    console.log(`  Specific rule: ${hasSpecific ? 'YES' : 'NO'}`);
    if (group) {
      console.log(`  Matched: ${group.userAgents.join(', ')}`);
      console.log(`  Rules: ${group.rules.map(r => `${r.type}: ${r.path}`).join(', ')}`);
    }
    console.log(`  VERDICT: ${isBlocked ? 'BLOCKED' : 'ALLOWED'}`);
    console.log();
  }
})();
