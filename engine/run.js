#!/usr/bin/env node
// ================================================================
// SMART PAGE GENERATION ENGINE — Main CLI entry point
//
// Usage:
//   node engine/run.js              — live run (writes generated.json)
//   node engine/run.js --dry-run    — preview only, no files written
//   node engine/run.js --limit 10   — override daily limit
//   node engine/run.js --report     — print last run report and exit
//   node engine/run.js --queue      — show full priority queue (all eligible)
//   node engine/run.js --stats      — show pool stats without running
//
// Output:
//   engine/generated.json           — cumulative registry of all generated slugs
//   engine/last-run-report.json     — machine-readable report of last run
//   stdout                          — human-readable run report
// ================================================================

'use strict';

const fs   = require('fs');
const path = require('path');
const { CITY_POOL }     = require('./cityPool');
const { scoreAll, eligibleCombos, DAILY_LIMIT } = require('./scorer');
const { run, loadGenerated } = require('./queue');

// ── CLI arg parsing ─────────────────────────────────────────────
const args    = process.argv.slice(2);
const dryRun  = args.includes('--dry-run');
const showReport  = args.includes('--report');
const showQueue   = args.includes('--queue');
const showStats   = args.includes('--stats');
const limitIdx    = args.indexOf('--limit');
const dailyLimit  = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) || DAILY_LIMIT : DAILY_LIMIT;

// ── Helpers ─────────────────────────────────────────────────────
const LAST_REPORT_FILE = path.join(__dirname, 'last-run-report.json');
const line = (ch = '─', n = 64) => ch.repeat(n);
const pad  = (s, w) => String(s).padEnd(w);
const lpad = (s, w) => String(s).padStart(w);

function bandColor(band) {
  return { HIGH: '🟢', 'MEDIUM-HIGH': '🟡', MEDIUM: '🟠', LOW: '🔴' }[band] || '⚪';
}

function printReport(report) {
  console.log('\n' + line('═'));
  console.log('  YOHOMEFIX — SMART PAGE GENERATION ENGINE');
  console.log(`  Run date  : ${report.runDate}${report.dryRun ? '  [DRY RUN — no files written]' : ''}`);
  console.log(`  Daily limit: ${report.dailyLimit} pages/run`);
  console.log(line('═'));

  console.log('\n── SUMMARY ─────────────────────────────────────────────────');
  console.log(`  Total eligible combos  : ${report.summary.totalEligible}`);
  console.log(`  ✅ Approved this run   : ${report.summary.approved}`);
  console.log(`  ⏭  Skipped this run    : ${report.summary.skipped}`);
  console.log(`  📋 Queue depth (next)  : ${report.summary.queueDepth}`);
  console.log(`  🗃  Already generated  : ${report.summary.alreadyGenerated}`);

  console.log('\n── SKIP REASONS ────────────────────────────────────────────');
  for (const [reason, count] of Object.entries(report.skipReasons)) {
    console.log(`  ${pad(reason, 30)} ${count}`);
  }

  console.log('\n── TIER BREAKDOWN (approved) ───────────────────────────────');
  for (const [tier, count] of Object.entries(report.tierBreakdown)) {
    const label = { 1: 'Tier 1 — Major metros', 2: 'Tier 2 — Mid-size markets', 3: 'Tier 3 — Smaller markets' }[tier];
    console.log(`  ${pad(label, 34)} ${count} pages`);
  }

  console.log('\n── SERVICE BREAKDOWN (approved) ────────────────────────────');
  const svcOrder = ['emergency', 'pipe-burst-repair', 'leak-repair', 'drain-cleaning', 'water-heater-repair'];
  for (const svc of svcOrder) {
    if (report.serviceBreakdown[svc]) {
      console.log(`  ${pad(svc, 25)} ${report.serviceBreakdown[svc]} pages`);
    }
  }

  if (report.urgencyBreakdown) {
    console.log('\n── CATEGORY BREAKDOWN (approved) ───────────────────────────');
    const catLabels = {
      1: 'FIRST  — Emergency / Burst / Leak',
      2: 'SECOND — Drain / Repair',
      3: 'THIRD  — Installation / Low-Urgency',
    };
    for (const [g, label] of Object.entries(catLabels)) {
      const count = report.urgencyBreakdown[g] || 0;
      console.log(`  ${pad(label, 38)} ${count} pages`);
    }
    const firstCount = report.urgencyBreakdown[1] || 0;
    const total = report.summary.approved;
    const pct = total > 0 ? Math.round((firstCount / total) * 100) : 0;
    console.log(`  Emergency-priority share            : ${pct}% of this run`);
  }

  if (report.approved.length > 0) {
    console.log('\n── PAGES APPROVED (generation order) ───────────────────────');
    console.log(`  ${pad('#', 4)} ${pad('Slug', 48)} ${pad('Scr', 4)} Cat   Band`);
    console.log('  ' + line('─', 72));
    report.approved.forEach((a, i) => {
      const grp = a.urgencyGroup === 1 ? '[1st]' : a.urgencyGroup === 2 ? '[2nd]' : '[3rd]';
      console.log(`  ${lpad(i + 1, 3)}.  ${pad(a.slug, 48)} ${lpad(a.score, 3)}  ${grp}  ${bandColor(a.band)} ${a.band}`);
    });
  }

  if (report.skipped.filter(s => s.reason.startsWith('DAILY_LIMIT')).length > 0) {
    const queued = report.skipped.filter(s => s.reason.startsWith('DAILY_LIMIT')).slice(0, 10);
    console.log('\n── NEXT IN QUEUE (top 10) ──────────────────────────────────');
    console.log(`  ${pad('Slug', 50)} ${pad('Score', 6)} Band`);
    console.log('  ' + line('─', 62));
    for (const q of queued) {
      const slug = `plumber-${q.cityName.toLowerCase().replace(/\s+/g, '-')}-${q.service}`;
      console.log(`  ${pad(slug, 50)} ${lpad(q.score, 5)}  ${bandColor(q.band)} ${q.band}`);
    }
  }

  console.log('\n' + line('═') + '\n');
}

function printQueue(allScored) {
  const eligible = allScored.filter(c => c.band !== 'LOW' && c.dataReady);
  const generated = loadGenerated();
  const remaining = eligible.filter(c => {
    const slug = `plumber-${c.cityName.toLowerCase().replace(/\s+/g, '-')}-${c.service}`;
    return !generated.has(slug);
  });
  console.log('\n' + line('═'));
  console.log('  FULL PRIORITY QUEUE — eligible, not yet generated');
  console.log(`  ${remaining.length} combinations remaining`);
  console.log(line('═'));
  console.log(`  ${pad('Rank', 5)} ${pad('Slug', 50)} ${pad('Score', 6)} Band`);
  console.log('  ' + line('─', 70));
  remaining.slice(0, 60).forEach((c, i) => {
    const slug = `plumber-${c.cityName.toLowerCase().replace(/\s+/g, '-')}-${c.service}`;
    console.log(`  ${lpad(i + 1, 4)}  ${pad(slug, 50)} ${lpad(c.score, 5)}  ${bandColor(c.band)} ${c.band}`);
  });
  if (remaining.length > 60) console.log(`  ... and ${remaining.length - 60} more`);
  console.log('');
}

function printStats(allScored) {
  const byBand = { HIGH: 0, 'MEDIUM-HIGH': 0, MEDIUM: 0, LOW: 0 };
  const byTier = { 1: 0, 2: 0, 3: 0 };
  const byService = {};
  const notReady = allScored.filter(c => !c.dataReady).length;

  for (const c of allScored) {
    byBand[c.band] = (byBand[c.band] || 0) + 1;
    byTier[c.tier] = (byTier[c.tier] || 0) + 1;
    byService[c.service] = (byService[c.service] || 0) + 1;
  }

  console.log('\n' + line('═'));
  console.log('  CITY POOL STATS');
  console.log(line('═'));
  console.log(`  Total city+service combos scored : ${allScored.length}`);
  console.log(`  Combos blocked (dataReady=false) : ${notReady}`);
  console.log(`  Cities in pool                   : ${CITY_POOL.length}`);
  console.log(`  Cities ready for generation      : ${CITY_POOL.filter(c => c.dataReady).length}`);
  console.log('\n  Intent bands:');
  for (const [band, count] of Object.entries(byBand)) {
    console.log(`    ${bandColor(band)} ${pad(band, 16)} ${count} combos`);
  }
  console.log('\n  By city tier:');
  for (const [tier, count] of Object.entries(byTier)) {
    console.log(`    Tier ${tier}: ${count} combos`);
  }
  console.log('\n  By service:');
  for (const [svc, count] of Object.entries(byService)) {
    console.log(`    ${pad(svc, 25)} ${count}`);
  }
  console.log('');
}

// ── Main ────────────────────────────────────────────────────────
(function main() {
  const allScored = scoreAll(CITY_POOL);

  if (showReport) {
    if (!fs.existsSync(LAST_REPORT_FILE)) {
      console.log('No report found. Run without --report first.');
      process.exit(0);
    }
    printReport(JSON.parse(fs.readFileSync(LAST_REPORT_FILE, 'utf8')));
    process.exit(0);
  }

  if (showQueue) {
    printQueue(allScored);
    process.exit(0);
  }

  if (showStats) {
    printStats(allScored);
    process.exit(0);
  }

  // Normal or dry run
  const eligible = eligibleCombos(CITY_POOL);
  const report   = run(eligible, dailyLimit, dryRun);
  printReport(report);
})();
