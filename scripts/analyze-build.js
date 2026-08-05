const fs = require('fs');
const path = require('path');

function countUrlsInDir(dir) {
  let total = 0;
  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      total += countUrlsInDir(fullPath);
    } else if (entry.endsWith('.xml')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const matches = content.match(/<loc>/g);
      total += matches ? matches.length : 0;
    }
  }
  return total;
}

const publicDir = path.join(__dirname, '..', 'public');
const entries = fs.readdirSync(publicDir);
const sitemapDirs = entries.filter(d => d.startsWith('sitemap'));

let grandTotal = 0;
const breakdown = {};

for (const dir of sitemapDirs) {
  const fullPath = path.join(publicDir, dir);
  const stat = fs.statSync(fullPath);
  if (stat.isDirectory()) {
    const count = countUrlsInDir(fullPath);
    breakdown[dir] = count;
    grandTotal += count;
  } else if (dir.endsWith('.xml')) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const matches = content.match(/<loc>/g);
    const count = matches ? matches.length : 0;
    breakdown[dir] = count;
    grandTotal += count;
  }
}

console.log('Sitemap URL Breakdown:');
console.log('─'.repeat(50));
for (const [dir, count] of Object.entries(breakdown).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${dir.padEnd(30)} ${count.toLocaleString()} URLs`);
}
console.log('─'.repeat(50));
console.log(`  ${'TOTAL'.padEnd(30)} ${grandTotal.toLocaleString()} URLs`);

// Also count what gets pre-built vs on-demand
console.log('\nBuild Path Analysis:');
console.log('─'.repeat(50));
const { SEED_CITIES, SERVICES, COST_PAGE_CITIES, STATES } = require('../lib/cities');
console.log(`  SEED_CITIES:           ${SEED_CITIES.length}`);
console.log(`  SERVICES:              ${SERVICES.length}`);
console.log(`  City×Service (pre-built): ~${SEED_CITIES.length * SERVICES.length}`);
console.log(`  State×Service (pre-built): ~${STATES.length * SERVICES.length}`);
console.log(`  Cost pages (pre-built):    ${COST_PAGE_CITIES.length}`);
console.log(`  State hub pages (pre-built): ${STATES.length}`);
console.log(`  Total pre-built pages:     ~${SEED_CITIES.length * SERVICES.length + STATES.length * SERVICES.length + COST_PAGE_CITIES.length + STATES.length}`);
console.log(`  Nationwide places (on-demand): 19,432`);
console.log(`  ZCTAs (on-demand):              22,858`);
console.log(`  ZIP×Service potential:          ~22,858 × ${SERVICES.length} = ~${22858 * SERVICES.length}`);
