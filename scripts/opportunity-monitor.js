#!/usr/bin/env node
/**
 * Sprint #7-8 — Automated Opportunity Monitor + Post-Change Comparison
 *
 * Analyzes a GSC Queries.csv export and identifies ranking opportunities
 * based on position, impressions, and intent classification.
 *
 * Usage:
 *   node scripts/opportunity-monitor.js <path-to-queries.csv> [--baseline <path-to-baseline.json>] [--gsc-baseline <path-to-gsc-baseline.json>]
 *
 * Output:
 *   - Tier 1: High-impression queries in positions 11-30 (page 2-3, close to page 1)
 *   - Tier 2: Medium-impression queries in positions 31-50 (page 3-5, needs authority)
 *   - Tier 3: Low-position queries with commercial intent (long-term targets)
 *   - Movement: Compare against baseline if provided
 *   - Post-Change Comparison: impression/click/CTR/position changes, new queries,
 *     Top 10/20 entries, significant ranking gains/losses
 *   - First-Call Signals: alerts for target page movement and new high-intent queries
 *
 * Baseline format (JSON):
 *   { "query": { "position": 29.48, "impressions": 19292, "date": "2026-07-23" }, ... }
 *
 * GSC Baseline format (JSON):
 *   { "baselineDate": "2026-07-23", "targetPages": [...] }
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
          baselineImpressions: base.impressions,
          impressionChange: q.impressions - base.impressions,
        });
      }
    }
  }
  return movements.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
}

// ============================================================
// POST-CHANGE COMPARISON
// ============================================================

const SIGNIFICANT_POSITION_CHANGE = 3.0;
const SIGNIFICANT_IMPRESSION_CHANGE_PCT = 20;

function computeFullComparison(queries, baseline) {
  if (!baseline) return null;

  const currentMap = {};
  queries.forEach(q => { currentMap[q.query] = q; });

  const matched = [];
  const newQueries = [];
  const lostQueries = [];

  for (const q of queries) {
    const base = baseline[q.query];
    if (base) {
      const impChange = q.impressions - base.impressions;
      const impChangePct = base.impressions > 0 ? ((impChange / base.impressions) * 100).toFixed(1) : 'N/A';
      const clickChange = q.clicks - base.clicks;
      const baseCtr = base.clicks / Math.max(base.impressions, 1);
      const currCtr = q.clicks / Math.max(q.impressions, 1);
      const ctrChange = ((currCtr - baseCtr) * 100).toFixed(2);
      const posDelta = base.position - q.position;

      matched.push({
        query: q.query,
        baselinePosition: base.position,
        currentPosition: q.position,
        positionDelta: parseFloat(posDelta.toFixed(2)),
        baselineImpressions: base.impressions,
        currentImpressions: q.impressions,
        impressionChange: impChange,
        impressionChangePct: parseFloat(impChangePct),
        baselineClicks: base.clicks,
        currentClicks: q.clicks,
        clickChange,
        baselineCtr: parseFloat((baseCtr * 100).toFixed(2)),
        currentCtr: parseFloat((currCtr * 100).toFixed(2)),
        ctrChange: parseFloat(ctrChange),
      });
    } else {
      if (hasCommercialIntent(q.query)) {
        newQueries.push(q);
      }
    }
  }

  for (const [query, base] of Object.entries(baseline)) {
    if (!currentMap[query]) {
      lostQueries.push({ query, ...base });
    }
  }

  const enteredTop10 = matched.filter(m => m.baselinePosition > 10 && m.currentPosition <= 10);
  const enteredTop20 = matched.filter(m => m.baselinePosition > 20 && m.currentPosition <= 20 && m.currentPosition > 10);
  const significantGains = matched.filter(m => m.positionDelta >= SIGNIFICANT_POSITION_CHANGE)
    .sort((a, b) => b.positionDelta - a.positionDelta);
  const significantLosses = matched.filter(m => m.positionDelta <= -SIGNIFICANT_POSITION_CHANGE)
    .sort((a, b) => a.positionDelta - b.positionDelta);
  const impressionGrowth = matched.filter(m => m.impressionChangePct >= SIGNIFICANT_IMPRESSION_CHANGE_PCT && m.impressionChange > 0)
    .sort((a, b) => b.impressionChangePct - a.impressionChangePct);

  return {
    matched: matched.sort((a, b) => Math.abs(b.positionDelta) - Math.abs(a.positionDelta)),
    newCommercialQueries: newQueries.sort((a, b) => b.impressions - a.impressions),
    lostQueries,
    enteredTop10,
    enteredTop20,
    significantGains: significantGains.slice(0, 30),
    significantLosses: significantLosses.slice(0, 30),
    impressionGrowth: impressionGrowth.slice(0, 20),
    summary: {
      totalMatched: matched.length,
      totalNew: newQueries.length,
      totalLost: lostQueries.length,
      top10Entries: enteredTop10.length,
      top20Entries: enteredTop20.length,
      significantGains: significantGains.length,
      significantLosses: significantLosses.length,
    },
  };
}

// ============================================================
// FIRST-CALL SIGNALS
// ============================================================

const TARGET_PAGES = [
  { label: 'OKC Drain', page: 'plumber-oklahoma-city-drain-cleaning', queries: ['emergency drain service', 'drain cleaning okc', 'oklahoma city drain cleaning', 'drain cleaning oklahoma city', 'okc drain cleaning', 'drain clearing service oklahoma city ok'] },
  { label: 'Baltimore Drain', page: 'plumber-baltimore-drain-cleaning', queries: ['drain clearing baltimore md', 'emergency plumbing baltimore', 'emergency plumber baltimore', 'emergency plumber baltimore md', 'emergency plumbing services baltimore md'] },
  { label: 'New Orleans Water Heater', page: 'plumber-new-orleans-water-heater-repair', queries: ['water heater repair new orleans', 'water heater installation in new orleans louisiana', 'heater replacement new orleans la', 'tankless water heater repair new orleans'] },
  { label: 'OKC Emergency Plumber', page: 'plumber-oklahoma-city-emergency', queries: ['emergency plumber okc', 'oklahoma city emergency plumber', 'emergency plumber oklahoma city', 'okc emergency plumber', 'emergency plumbing services oklahoma city ok'] },
];

const MATERIAL_UPWARD = 2.0;

function checkFirstCallSignals(comparison, queries) {
  const signals = [];

  if (!comparison) return signals;

  for (const target of TARGET_PAGES) {
    const targetMatched = comparison.matched.filter(m => target.queries.includes(m.query));

    for (const m of targetMatched) {
      if (m.positionDelta >= MATERIAL_UPWARD) {
        signals.push({
          type: 'TARGET_RANKING_GAIN',
          severity: 'HIGH',
          target: target.label,
          query: m.query,
          message: `${target.label} moved UP: "${m.query}" ${m.baselinePosition} -> ${m.currentPosition} (+${m.positionDelta} positions)`,
        });
      }
      if (m.currentClicks > 0 && m.baselineClicks === 0) {
        signals.push({
          type: 'TARGET_NEW_CLICKS',
          severity: 'HIGH',
          target: target.label,
          query: m.query,
          message: `${target.label} received NEW organic clicks: "${m.query}" -- ${m.currentClicks} clicks (was 0)`,
        });
      }
      if (m.baselinePosition > 10 && m.currentPosition <= 10) {
        signals.push({
          type: 'TARGET_TOP10',
          severity: 'CRITICAL',
          target: target.label,
          query: m.query,
          message: `${target.label} entered TOP 10: "${m.query}" position ${m.currentPosition}`,
        });
      }
    }
  }

  for (const m of comparison.enteredTop10) {
    if (!TARGET_PAGES.some(t => t.queries.includes(m.query))) {
      signals.push({
        type: 'COMMERCIAL_TOP10',
        severity: 'CRITICAL',
        query: m.query,
        message: `Commercial query entered TOP 10: "${m.query}" position ${m.currentPosition}`,
      });
    }
  }

  const highIntentNew = comparison.newCommercialQueries.filter(q => q.position >= 4 && q.position <= 20);
  for (const q of highIntentNew) {
    signals.push({
      type: 'NEW_HIGH_INTENT_QUERY',
      severity: 'MEDIUM',
      query: q.query,
      message: `New high-intent query in positions 4-20: "${q.query}" -- position ${q.position}, ${q.impressions} impressions`,
    });
  }

  return signals;
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: node scripts/opportunity-monitor.js <queries.csv> [--baseline <baseline.json>]');
    process.exit(1);
  }

  const csvPath = args[0];
  let baselinePath = null;
  let gscBaselinePath = null;
  const baselineIdx = args.indexOf('--baseline');
  if (baselineIdx !== -1 && args[baselineIdx + 1]) {
    baselinePath = args[baselineIdx + 1];
  }
  const gscBaselineIdx = args.indexOf('--gsc-baseline');
  if (gscBaselineIdx !== -1 && args[gscBaselineIdx + 1]) {
    gscBaselinePath = args[gscBaselineIdx + 1];
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

    const comparison = computeFullComparison(queries, baseline);
    if (comparison) {
      console.log(`\n--- Post-Change Comparison ---`);
      console.log(`  Matched queries: ${comparison.summary.totalMatched}`);
      console.log(`  New commercial queries: ${comparison.summary.totalNew}`);
      console.log(`  Lost queries: ${comparison.summary.totalLost}`);
      console.log(`  Entered Top 10: ${comparison.summary.top10Entries}`);
      console.log(`  Entered Top 20: ${comparison.summary.top20Entries}`);
      console.log(`  Significant gains (>=${SIGNIFICANT_POSITION_CHANGE} pos): ${comparison.summary.significantGains}`);
      console.log(`  Significant losses (>=${SIGNIFICANT_POSITION_CHANGE} pos): ${comparison.summary.significantLosses}`);

      if (comparison.enteredTop10.length > 0) {
        console.log(`\n  >> Queries ENTERING TOP 10:`);
        comparison.enteredTop10.forEach(m => {
          console.log(`     + "${m.query}" -- ${m.baselinePosition} -> ${m.currentPosition}`);
        });
      }

      if (comparison.enteredTop20.length > 0) {
        console.log(`\n  >> Queries ENTERING TOP 20 (11-20):`);
        comparison.enteredTop20.forEach(m => {
          console.log(`     + "${m.query}" -- ${m.baselinePosition} -> ${m.currentPosition}`);
        });
      }

      if (comparison.significantGains.length > 0) {
        console.log(`\n  >> SIGNIFICANT RANKING GAINS (>=${SIGNIFICANT_POSITION_CHANGE} positions):`);
        comparison.significantGains.slice(0, 15).forEach(m => {
          console.log(`     ↑ "${m.query}" -- ${m.baselinePosition} -> ${m.currentPosition} (+${m.positionDelta})`);
        });
      }

      if (comparison.significantLosses.length > 0) {
        console.log(`\n  >> SIGNIFICANT RANKING LOSSES (>=${SIGNIFICANT_POSITION_CHANGE} positions):`);
        comparison.significantLosses.slice(0, 15).forEach(m => {
          console.log(`     ↓ "${m.query}" -- ${m.baselinePosition} -> ${m.currentPosition} (${m.positionDelta})`);
        });
      }

      if (comparison.impressionGrowth.length > 0) {
        console.log(`\n  >> IMPRESSION GROWTH (>=${SIGNIFICANT_IMPRESSION_CHANGE_PCT}% increase):`);
        comparison.impressionGrowth.slice(0, 10).forEach(m => {
          console.log(`     + "${m.query}" -- ${m.baselineImpressions} -> ${m.currentImpressions} (+${m.impressionChangePct}%)`);
        });
      }

      if (comparison.newCommercialQueries.length > 0) {
        console.log(`\n  >> NEW COMMERCIAL QUERIES (not in baseline):`);
        comparison.newCommercialQueries.slice(0, 15).forEach(q => {
          console.log(`     NEW "${q.query}" -- ${q.impressions} imps, position ${q.position}`);
        });
      }

      console.log(`\n  >> RANKING MOVEMENT vs IMPRESSION GROWTH (separated):`);
      console.log(`     Ranking-only changes (position moved, impressions stable):`);
      const rankOnly = comparison.matched.filter(m => Math.abs(m.positionDelta) >= 1 && Math.abs(m.impressionChangePct) < SIGNIFICANT_IMPRESSION_CHANGE_PCT);
      rankOnly.slice(0, 10).forEach(m => {
        const dir = m.positionDelta > 0 ? '↑' : '↓';
        console.log(`     ${dir} "${m.query}" -- pos ${m.baselinePosition} -> ${m.currentPosition}, imps ${m.baselineImpressions} -> ${m.currentImpressions}`);
      });
      console.log(`     Impression-only growth (impressions grew, position stable):`);
      const impOnly = comparison.matched.filter(m => m.impressionChangePct >= SIGNIFICANT_IMPRESSION_CHANGE_PCT && Math.abs(m.positionDelta) < 1);
      impOnly.slice(0, 10).forEach(m => {
        console.log(`     + "${m.query}" -- imps ${m.baselineImpressions} -> ${m.currentImpressions} (+${m.impressionChangePct}%), pos ${m.baselinePosition} -> ${m.currentPosition}`);
      });

      const signals = checkFirstCallSignals(comparison, queries);
      if (signals.length > 0) {
        console.log(`\n--- FIRST-CALL SIGNALS (${signals.length}) ---`);
        signals.forEach(s => {
          const icon = s.severity === 'CRITICAL' ? '!!' : s.severity === 'HIGH' ? '!' : '*';
          console.log(`  [${icon}] [${s.severity}] ${s.message}`);
        });
      } else {
        console.log(`\n--- FIRST-CALL SIGNALS: None detected ---`);
      }
    }
  }

  if (gscBaselinePath && fs.existsSync(gscBaselinePath)) {
    const gscBaseline = JSON.parse(fs.readFileSync(gscBaselinePath, 'utf-8'));
    console.log(`\n--- Target Page Baseline (from GSC baseline file) ---`);
    console.log(`  Baseline date: ${gscBaseline.baselineDate}`);
    console.log(`  GSC date range: ${gscBaseline.gscDateRange}`);
    for (const tp of gscBaseline.targetPages) {
      console.log(`\n  [${tp.label}]`);
      console.log(`    URL: ${tp.page}`);
      console.log(`    Primary query: ${tp.primaryCommercialQuery}`);
      console.log(`    Impressions: ${tp.impressions} | Clicks: ${tp.clicks} | CTR: ${tp.ctr} | Avg Position: ${tp.pageAveragePosition}`);
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
