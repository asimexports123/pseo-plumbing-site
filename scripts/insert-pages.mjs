/**
 * insert-pages.mjs
 *
 * Reads engine/last-run-report.json, generates full page content for each
 * approved slug using contentGenerator, and upserts into Supabase cities_data.
 *
 * Usage:
 *   node scripts/insert-pages.mjs              — insert all approved from last run
 *   node scripts/insert-pages.mjs --dry-run    — preview only, no DB writes
 *   node scripts/insert-pages.mjs --limit 10   — insert first N pages only
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

// ── Supabase ────────────────────────────────────────────────────
const SUPABASE_URL = 'https://wrvmxapophhbwycozyvr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ei3Q32sW-BfgH--oGMyb5g_fnKKLfIU';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Imports ─────────────────────────────────────────────────────
const { generatePageContent, buildPricingGuidance } = await import('../lib/contentGenerator.js');
const { getCityData } = await import('../lib/cities.js');

// ── Services map ────────────────────────────────────────────────
const SERVICES = {
  'emergency':           { slug: 'emergency',           name: 'Emergency Plumbing',      urgencyGroup: 1 },
  'pipe-burst-repair':   { slug: 'pipe-burst-repair',   name: 'Burst Pipe Repair',        urgencyGroup: 1 },
  'leak-repair':         { slug: 'leak-repair',         name: 'Leak Detection & Repair',  urgencyGroup: 1 },
  'drain-cleaning':      { slug: 'drain-cleaning',      name: 'Drain Cleaning',           urgencyGroup: 2 },
  'water-heater-repair': { slug: 'water-heater-repair', name: 'Water Heater Repair',      urgencyGroup: 2 },
};

// ── CLI args ────────────────────────────────────────────────────
const args     = process.argv.slice(2);
const dryRun   = args.includes('--dry-run');
const limitIdx = args.indexOf('--limit');
const limit    = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : Infinity;

// ── Load last-run report ────────────────────────────────────────
const reportPath = path.join(ROOT, 'engine', 'last-run-report.json');
if (!fs.existsSync(reportPath)) {
  console.error('No last-run-report.json found. Run: node engine/run.js first.');
  process.exit(1);
}
const report   = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const approved = report.approved.slice(0, limit === Infinity ? undefined : limit);

// ── Helpers ─────────────────────────────────────────────────────
function buildMetaTitle(cityName, stateCode, serviceName) {
  return `${serviceName} in ${cityName}, ${stateCode} | YoHomeFix`;
}

function buildMetaDescription(cityName, stateCode, serviceName) {
  const descs = {
    'emergency':           `Need emergency plumbing in ${cityName}, ${stateCode}? YoHomeFix connects you with licensed plumbers available 24/7 for burst pipes, flooding, and urgent repairs.`,
    'pipe-burst-repair':   `Burst pipe in ${cityName}, ${stateCode}? Get fast professional repair from licensed plumbers. YoHomeFix connects you with local experts who respond quickly to minimize water damage.`,
    'leak-repair':         `Leak detection and repair in ${cityName}, ${stateCode}. Licensed plumbers find hidden leaks with advanced tools and fix them right the first time. Get a free quote via YoHomeFix.`,
    'drain-cleaning':      `Clogged drain in ${cityName}, ${stateCode}? Licensed plumbers clear blockages with professional-grade equipment. YoHomeFix connects you with trusted local drain specialists.`,
    'water-heater-repair': `Water heater repair and replacement in ${cityName}, ${stateCode}. Licensed plumbers diagnose and fix all brands and types. Same-day service available via YoHomeFix.`,
  };
  return descs[approved[0]?.service] ?? `Professional plumbing services in ${cityName}, ${stateCode}. Licensed and insured plumbers available via YoHomeFix.`;
}

// ── Main ─────────────────────────────────────────────────────────
console.log(`\n${'═'.repeat(60)}`);
console.log(`  YoHomeFix — Page Content Inserter`);
console.log(`  Run date  : ${new Date().toISOString().slice(0, 10)}${dryRun ? '  [DRY RUN]' : ''}`);
console.log(`  Pages to insert: ${approved.length}`);
console.log(`${'═'.repeat(60)}\n`);

let inserted = 0;
let updated  = 0;
let errors   = 0;

for (const page of approved) {
  const { slug, cityName, stateCode, service, serviceName } = page;
  const svc = SERVICES[service];
  if (!svc) {
    console.warn(`  ⚠ Unknown service "${service}" for ${slug} — skipping`);
    continue;
  }

  process.stdout.write(`  [${String(inserted + updated + errors + 1).padStart(3)}] ${slug.padEnd(52)}`);

  try {
    // Generate full page content (deterministic — no LLM)
    const content = generatePageContent(cityName, stateCode, svc);
    const pricing = buildPricingGuidance(cityName, service);

    if (dryRun) {
      console.log(`PREVIEW — ${content ? content.hero?.headline?.slice(0, 60) : 'content ok'}`);
      inserted++;
      continue;
    }

    // Check if slug already exists
    const { data: existing } = await supabase
      .from('cities_data')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    const row = {
      slug,
      city_name:        cityName,
      state:            stateCode,
      service_slug:     service,
      service_name:     serviceName || svc.name,
      meta_title:       buildMetaTitle(cityName, stateCode, svc.name),
      meta_description: buildMetaDescription(cityName, stateCode, service),
      content:          JSON.stringify(content),
      pricing_guidance: JSON.stringify(pricing),
      tier:             page.tier,
      score:            page.score,
      urgency_group:    svc.urgencyGroup,
      is_active:        true,
      updated_at:       new Date().toISOString(),
    };

    if (existing) {
      const { error } = await supabase
        .from('cities_data')
        .update(row)
        .eq('slug', slug);
      if (error) throw error;
      console.log(`✓ updated`);
      updated++;
    } else {
      const { error } = await supabase
        .from('cities_data')
        .insert({ ...row, created_at: new Date().toISOString() });
      if (error) throw error;
      console.log(`✓ inserted`);
      inserted++;
    }
  } catch (err) {
    console.log(`✗ ERROR: ${err.message?.slice(0, 80)}`);
    errors++;
  }
}

console.log(`\n${'─'.repeat(60)}`);
console.log(`  Inserted : ${inserted}`);
console.log(`  Updated  : ${updated}`);
console.log(`  Errors   : ${errors}`);
console.log(`  Total    : ${inserted + updated}/${approved.length} pages${dryRun ? ' (dry run)' : ' in Supabase'}`);
console.log(`${'═'.repeat(60)}\n`);

if (!dryRun && (inserted + updated) > 0) {
  console.log(`  ✅ Pages live at: https://yohomefix.com/{slug}`);
  console.log(`  Example: https://yohomefix.com/${approved[0]?.slug}`);
}
