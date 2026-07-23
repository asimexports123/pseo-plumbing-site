#!/usr/bin/env node
/**
 * Sprint #7 — Automated Opportunity Monitor
 *
 * Analyzes a GSC Queries.csv export and identifies ranking opportunities
 * based on position, impressions, and intent classification.
 *
 * Usage:
 *   node scripts/opportunity-monitor.js <path-to-queries.csv> [--baseline <path-to-baseline.json>]
 *
 * Output:
 *   - Tier 1: High-impression queries in positions 11-30 (page 2-3, close to page 1)
 *   - Tier 2: Medium-impression queries in positions 31-50 (page 3-5, needs authority)
 *   - Tier 3: Low-position queries with commercial intent (long-term targets)
 *   - Movement: Compare against baseline if provided
 *
 * Baseline format (JSON):
 *   { "query": { "position": 29.48, "impressions": 19292, "date": "2026-07-23" }, ... }
 */

const fs = require('fs');
const path = require('path');

// Commercial intent keywords that indicate money-page potential
const COMMERCIAL_INTENT = [
  'emergency', 'repair', 'service', 'plumber', 'drain', 'leak',
  'burst', 'water heater', 'sewer', 'clog', 'backup', '24 hour',
  '24/7', 'fix', 'install', 'replace', 'cost', 'price',
];

const EXCLUDE_PATTERNS = [
  /what is/i, /how to/i, /diy/i, /home remedy/i, /baking soda/i,
  /vinegar/i, /natural/i, /without plumber/i,
];

function parseCsv(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];

  // Detect delimiter and parse header
  const header = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const idx = {
    query: header.findIndex(h => h.toLowerCase().includes('quer') || h.toLowerCase().includes('keyword') || h.toLowerCase().includes('search')),
    impressions: header.findIndex(h => h.toLowerCase().includes('impression')),
    clicks: header.findIndex(h => h.toLowerCase().includes('click')),
    ctr: header.findIndex(h => h.toLowerCase().includes('ctr')),
    position: header.findIndex(h => h.toLowerCase().includes('position')),
  };

  if (idx.query === -1 || idx.position === -1) {
    console.error('ERROR: Could not find Query and Position columns in CSV');
    process.exit(1);
  }

  const queries = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    if (cols.length < Math.max(idx.query, idx.position) + 1) continue;

    const query = cols[idx.query]?.replace(/"/g, '').trim();
    const impressions = parseInt(cols[idx.impressions]?.replace(/"/g, '').replace(/,/g, '').trim() || '0', 10);
    const clicks = parseInt(cols[idx.clicks]?.replace(/"/g, '').replace(/,/g, '').trim() || '0', 10);
    const position = parseFloat(cols[idx.position]?.replace(/"/g, '').trim() || '0', 10);

    if (!query || !position) continue;
    queries.push({ query, impressions, clicks, position, ctr: clicks / Math.max(impressions, 1) });
  }

  return queries;
}

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function hasCommercialIntent(query) {
  if (EXCLUDE_PATTERNS.some(p => p.test(query))) return false;
  return COMMERCIAL_INTENT.some(kw => query.toLowerCase().includes(kw));
}

function classifyOpportunity(q) {
  if (!hasCommercialIntent(q.query)) return null;

  if (q.impressions >= 500 && q.position >= 11 && q.position <= 30) {
    return { ...q, tier: 1, label: 'Page 2-3, high impressions — closest to page 1' };
  }
  if (q.impressions >= 200 && q.position >= 31 && q.position <= 50) {
    return { ...q, tier: 2, label: 'Page 3-5, medium impressions — needs authority push' };
  }
  if (q.impressions >= 50 && q.position > 50) {
    return { ...q, tier: 3, label: 'Deep positions, low impressions — long-term target' };
  }
  return null;
}

function loadBaseline(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function computeMovement(queries, baseline) {
  if (!baseline) return null;
  const movements = [];
  for (const q of queries) {
    const base = baseline[q.query];
    if (base) {
      const delta = base.position - q.position;
      if (Math.abs(delta) >= 1) {
        movements.push({
          query: q.query,
          baselinePosition: base.position,
          currentPosition: q.position,
          delta: parseFloat(delta.toFixed(2)),
          direction: delta > 0 ? 'IMPROVED' : 'DECLINED',
          impressions: q.impressions,
        });
      }
    }
  }
  return movements.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: node scripts/opportunity-monitor.js <queries.csv> [--baseline <baseline.json>]');
    process.exit(1);
  }

  const csvPath = args[0];
  let baselinePath = null;
  const baselineIdx = args.indexOf('--baseline');
  if (baselineIdx !== -1 && args[baselineIdx + 1]) {
    baselinePath = args[baselineIdx + 1];
  }

  if (!fs.existsSync(csvPath)) {
    console.error(`ERROR: File not found: ${csvPath}`);
    process.exit(1);
  }

  const queries = parseCsv(csvPath);
  console.log(`\n=== YoHomeFix Opportunity Monitor ===`);
  console.log(`Parsed ${queries.length} queries from ${path.basename(csvPath)}\n`);

  const opportunities = queries
    .map(classifyOpportunity)
    .filter(Boolean)
    .sort((a, b) => a.tier - b.tier || b.impressions - a.impressions);

  const tier1 = opportunities.filter(o => o.tier === 1);
  const tier2 = opportunities.filter(o => o.tier === 2);
  const tier3 = opportunities.filter(o => o.tier === 3);

  console.log(`--- Tier 1: Close to Page 1 (${tier1.length} queries) ---`);
  tier1.slice(0, 15).forEach(o => {
    console.log(`  [${o.position.toFixed(1)}] "${o.query}" — ${o.impressions} imps, ${o.clicks} clicks`);
  });

  console.log(`\n--- Tier 2: Authority Push Needed (${tier2.length} queries) ---`);
  tier2.slice(0, 10).forEach(o => {
    console.log(`  [${o.position.toFixed(1)}] "${o.query}" — ${o.impressions} imps`);
  });

  console.log(`\n--- Tier 3: Long-Term (${tier3.length} queries) ---`);
  tier3.slice(0, 5).forEach(o => {
    console.log(`  [${o.position.toFixed(1)}] "${o.query}" — ${o.impressions} imps`);
  });

  const baseline = loadBaseline(baselinePath);
  if (baseline) {
    const movements = computeMovement(queries, baseline);
    if (movements && movements.length > 0) {
      console.log(`\n--- Ranking Movement (vs baseline) ---`);
      movements.slice(0, 20).forEach(m => {
        const arrow = m.direction === 'IMPROVED' ? '↑' : '↓';
        console.log(`  ${arrow} ${m.query}: ${m.baselinePosition} → ${m.currentPosition} (${m.delta > 0 ? '+' : ''}${m.delta})`);
      });
    } else {
      console.log(`\n--- Ranking Movement: No significant changes detected ---`);
    }
  }

  // Summary
  console.log(`\n=== Summary ===`);
  console.log(`Total commercial queries: ${opportunities.length}`);
  console.log(`Tier 1 (page 2-3): ${tier1.length}`);
  console.log(`Tier 2 (page 3-5): ${tier2.length}`);
  console.log(`Tier 3 (deep): ${tier3.length}`);
  console.log(`Total impressions (all tiers): ${opportunities.reduce((s, o) => s + o.impressions, 0)}`);
  console.log(`Total clicks (all tiers): ${opportunities.reduce((s, o) => s + o.clicks, 0)}`);

  // Save baseline for next run
  const baselineOut = {};
  queries.forEach(q => {
    baselineOut[q.query] = { position: q.position, impressions: q.impressions, clicks: q.clicks, date: new Date().toISOString().split('T')[0] };
  });
  const outPath = path.join(path.dirname(csvPath), 'opportunity-baseline.json');
  fs.writeFileSync(outPath, JSON.stringify(baselineOut, null, 2));
  console.log(`\nBaseline saved to: ${outPath}`);
  console.log(`Use --baseline ${outPath} on next run to track movement.\n`);
}

main();
