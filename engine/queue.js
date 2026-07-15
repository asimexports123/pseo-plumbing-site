// ================================================================
// QUEUE MANAGER — Duplicate control + daily limit enforcement
//
// State files (auto-created in engine/):
//   generated.json      — all slugs ever approved for generation
//   last-run-report.json — output from the most recent run()
//
// Duplicate rule: a city+service combination is skipped if its
// slug already appears in generated.json (exact match).
//
// Daily limit: DAILY_LIMIT combos max per run() invocation.
// Remaining eligible combos stay in the priority queue for the
// next run.
// ================================================================

'use strict';

const fs   = require('fs');
const path = require('path');

const ENGINE_DIR        = path.join(__dirname);
const GENERATED_FILE    = path.join(ENGINE_DIR, 'generated.json');
const LAST_REPORT_FILE  = path.join(ENGINE_DIR, 'last-run-report.json');

function buildSlug(cityName, serviceSlug) {
  const citySlug = cityName.toLowerCase().replace(/\s+/g, '-');
  return `plumber-${citySlug}-${serviceSlug}`;
}

function loadGenerated() {
  if (!fs.existsSync(GENERATED_FILE)) return new Set();
  try {
    const data = JSON.parse(fs.readFileSync(GENERATED_FILE, 'utf8'));
    return new Set(Array.isArray(data.slugs) ? data.slugs : []);
  } catch (_) {
    return new Set();
  }
}

function saveGenerated(slugSet) {
  fs.writeFileSync(
    GENERATED_FILE,
    JSON.stringify({ updatedAt: new Date().toISOString(), slugs: [...slugSet].sort() }, null, 2)
  );
}

function saveReport(report) {
  fs.writeFileSync(LAST_REPORT_FILE, JSON.stringify(report, null, 2));
}

// ── Main run function ───────────────────────────────────────────
// eligibleList  — scored+sorted combos from scorer.eligibleCombos()
// dailyLimit    — max pages this run (default DAILY_LIMIT from scorer)
// dryRun        — if true, nothing is written to disk
function run(eligibleList, dailyLimit, dryRun = false) {
  const generated = loadGenerated();
  const runDate   = new Date().toISOString().slice(0, 10);

  const approved  = [];
  const skipped   = [];

  for (const combo of eligibleList) {
    const slug = buildSlug(combo.cityName, combo.service);

    // Duplicate check
    if (generated.has(slug)) {
      skipped.push({ slug, cityName: combo.cityName, service: combo.service, reason: 'DUPLICATE — already generated', score: combo.score, band: combo.band });
      continue;
    }

    // Daily limit check
    if (approved.length >= dailyLimit) {
      skipped.push({ slug, cityName: combo.cityName, service: combo.service, reason: 'DAILY_LIMIT — queued for next run', score: combo.score, band: combo.band });
      continue;
    }

    // Data-readiness check (safety net — scorer already filters, but belt-and-suspenders)
    if (!combo.dataReady) {
      skipped.push({ slug, cityName: combo.cityName, service: combo.service, reason: 'DATA_NOT_READY — author CITY_DATA entry first', score: combo.score, band: combo.band });
      continue;
    }

    const urgencyCategory = combo.urgencyGroup === 1 ? 'FIRST — Emergency/Burst/Leak'
      : combo.urgencyGroup === 2 ? 'SECOND — Drain/Repair'
      : 'THIRD — Installation/Low-Urgency';
    approved.push({ slug, cityName: combo.cityName, stateCode: combo.stateCode, tier: combo.tier, service: combo.service, serviceName: combo.serviceName, urgencyGroup: combo.urgencyGroup, urgencyCategory, score: combo.score, band: combo.band, url: `https://yohomefix.com/${slug}` });
  }

  // Tier breakdown of approved
  const tierBreakdown = { 1: 0, 2: 0, 3: 0 };
  const serviceBreakdown = {};
  const urgencyBreakdown = { 1: 0, 2: 0, 3: 0 };
  for (const a of approved) {
    tierBreakdown[a.tier] = (tierBreakdown[a.tier] || 0) + 1;
    serviceBreakdown[a.service] = (serviceBreakdown[a.service] || 0) + 1;
    urgencyBreakdown[a.urgencyGroup] = (urgencyBreakdown[a.urgencyGroup] || 0) + 1;
  }

  // Skip reason summary
  const skipReasons = {};
  for (const s of skipped) {
    const key = s.reason.split(' — ')[0];
    skipReasons[key] = (skipReasons[key] || 0) + 1;
  }

  const queueDepth = skipped.filter(s => s.reason.startsWith('DAILY_LIMIT')).length;

  const report = {
    runDate,
    dryRun,
    dailyLimit,
    summary: {
      totalEligible:   eligibleList.length,
      approved:        approved.length,
      skipped:         skipped.length,
      queueDepth,
      alreadyGenerated: generated.size,
    },
    tierBreakdown,
    serviceBreakdown,
    urgencyBreakdown,
    skipReasons,
    approved,
    skipped,
  };

  if (!dryRun) {
    for (const a of approved) generated.add(a.slug);
    saveGenerated(generated);
    saveReport(report);
  }

  return report;
}

module.exports = { run, loadGenerated, buildSlug };
