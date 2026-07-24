#!/usr/bin/env node
/**
 * Nationwide IndexNow URL Submission Script
 * Submits all YoHomeFix URLs (including nationwide expansion) to IndexNow.
 *
 * Usage: node scripts/submit-indexnow-nationwide.js
 */

const fs = require('fs');
const path = require('path');

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || 'https://yohomefix.com';
const INDEXNOW_KEY = 'yohomefixindexnow2025';
const BATCH_SIZE = 10000; // IndexNow supports up to 10,000 URLs per batch

// Load data directly from JSON files
const usPlaces = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'us_places.json'), 'utf8'));

// State definitions (matching STATES in cities.js)
const STATES = [
  { name: 'New York', slug: 'new-york', code: 'NY' },
  { name: 'California', slug: 'california', code: 'CA' },
  { name: 'Texas', slug: 'texas', code: 'TX' },
  { name: 'Florida', slug: 'florida', code: 'FL' },
  { name: 'Illinois', slug: 'illinois', code: 'IL' },
  { name: 'Pennsylvania', slug: 'pennsylvania', code: 'PA' },
  { name: 'Arizona', slug: 'arizona', code: 'AZ' },
  { name: 'Ohio', slug: 'ohio', code: 'OH' },
  { name: 'North Carolina', slug: 'north-carolina', code: 'NC' },
  { name: 'Indiana', slug: 'indiana', code: 'IN' },
  { name: 'Washington', slug: 'washington', code: 'WA' },
  { name: 'Colorado', slug: 'colorado', code: 'CO' },
  { name: 'Tennessee', slug: 'tennessee', code: 'TN' },
  { name: 'Georgia', slug: 'georgia', code: 'GA' },
  { name: 'Michigan', slug: 'michigan', code: 'MI' },
  { name: 'Virginia', slug: 'virginia', code: 'VA' },
  { name: 'Maryland', slug: 'maryland', code: 'MD' },
  { name: 'Wisconsin', slug: 'wisconsin', code: 'WI' },
  { name: 'Oregon', slug: 'oregon', code: 'OR' },
  { name: 'Nevada', slug: 'nevada', code: 'NV' },
  { name: 'Oklahoma', slug: 'oklahoma', code: 'OK' },
  { name: 'New Mexico', slug: 'new-mexico', code: 'NM' },
  { name: 'Missouri', slug: 'missouri', code: 'MO' },
  { name: 'Nebraska', slug: 'nebraska', code: 'NE' },
  { name: 'Louisiana', slug: 'louisiana', code: 'LA' },
  { name: 'Minnesota', slug: 'minnesota', code: 'MN' },
  { name: 'Kentucky', slug: 'kentucky', code: 'KY' },
  { name: 'Massachusetts', slug: 'massachusetts', code: 'MA' },
  { name: 'District of Columbia', slug: 'district-of-columbia', code: 'DC' },
  { name: 'Alabama', slug: 'alabama', code: 'AL' },
  { name: 'Arkansas', slug: 'arkansas', code: 'AR' },
  { name: 'Hawaii', slug: 'hawaii', code: 'HI' },
  { name: 'Idaho', slug: 'idaho', code: 'ID' },
  { name: 'Iowa', slug: 'iowa', code: 'IA' },
  { name: 'Kansas', slug: 'kansas', code: 'KS' },
  { name: 'Rhode Island', slug: 'rhode-island', code: 'RI' },
  { name: 'Utah', slug: 'utah', code: 'UT' },
  { name: 'Alaska', slug: 'alaska', code: 'AK' },
  { name: 'Connecticut', slug: 'connecticut', code: 'CT' },
  { name: 'New Jersey', slug: 'new-jersey', code: 'NJ' },
  { name: 'South Dakota', slug: 'south-dakota', code: 'SD' },
  { name: 'Delaware', slug: 'delaware', code: 'DE' },
  { name: 'Mississippi', slug: 'mississippi', code: 'MS' },
  { name: 'North Dakota', slug: 'north-dakota', code: 'ND' },
  { name: 'Montana', slug: 'montana', code: 'MT' },
  { name: 'Wyoming', slug: 'wyoming', code: 'WY' },
  { name: 'South Carolina', slug: 'south-carolina', code: 'SC' },
];

const SERVICES = [
  'emergency', 'leak-repair', 'drain-cleaning', 'pipe-burst-repair',
  'water-heater-repair', 'sewer-line-repair', 'toilet-repair',
  'slab-leak-repair', 'water-line-repair', 'faucet-repair',
  'garbage-disposal-repair', 'water-softener-repair',
  'whole-house-repiping', 'main-water-shutoff-valve-repair',
  'sump-pump-repair',
];

// Sump-pump qualified states (matching isStateQualifiedForService in cities.js)
const SUMP_PUMP_STATES = new Set([
  'NY', 'IL', 'IN', 'OH', 'MI', 'WI', 'MN', 'IA', 'MO', 'KY',
  'PA', 'NJ', 'CT', 'MA', 'MD', 'VA', 'NC', 'TN', 'GA', 'AR',
  'OK', 'KS', 'NE', 'SD', 'ND', 'MT', 'ID', 'WY', 'UT', 'CO',
  'WA', 'OR', 'DC', 'RI', 'DE', 'MS', 'AL', 'LA', 'SC',
]);

const stateCodes = new Set(STATES.map(s => s.code));

function buildAllUrls() {
  const urls = [];

  // Static pages
  const staticPages = [
    '/', '/plumber-usa', '/plumbing-cost-guide', '/about', '/contact',
    '/faq', '/whats-wrong-with-my-plumbing', '/guides',
    '/research/us-water-hardness-plumbing-risk', '/why-trust-yohomefix',
    '/how-yohomefix-works', '/editorial-policy', '/sources', '/press',
    '/media-kit',
  ];
  staticPages.forEach(p => urls.push(`${DOMAIN}${p}`));

  // Guide pages
  ['how-to-prevent-frozen-pipes', 'signs-you-need-a-plumber',
   'how-to-shut-off-water-in-emergency', 'hard-water-effects-on-plumbing',
   'water-heater-maintenance-guide'].forEach(s => {
    urls.push(`${DOMAIN}/guides/${s}`);
  });

  // State hub pages
  STATES.forEach(s => urls.push(`${DOMAIN}/plumber-${s.slug}`));

  // State-service hub pages
  STATES.forEach(s => {
    SERVICES.forEach(svc => {
      if (svc === 'sump-pump-repair' && !SUMP_PUMP_STATES.has(s.code)) return;
      urls.push(`${DOMAIN}/plumber/${s.slug}/${svc}`);
    });
  });

  // Nationwide city-service pages
  const validPlaces = usPlaces.filter(p => stateCodes.has(p.stateCode));
  let cityServiceCount = 0;
  validPlaces.forEach(place => {
    SERVICES.forEach(svc => {
      if (svc === 'sump-pump-repair' && !SUMP_PUMP_STATES.has(place.stateCode)) return;
      urls.push(`${DOMAIN}/${place.slug}-${svc}`);
      cityServiceCount++;
    });
  });

  // Sitemap URLs
  urls.push(`${DOMAIN}/sitemap.xml`);
  urls.push(`${DOMAIN}/sitemap-static.xml`);
  urls.push(`${DOMAIN}/sitemap-cities.xml`);
  STATES.forEach(s => urls.push(`${DOMAIN}/sitemap-states/${s.slug}.xml`));

  console.log(`  Static + hub URLs: ${urls.length - cityServiceCount - STATES.length - 1}`);
  console.log(`  City-service URLs: ${cityServiceCount}`);
  console.log(`  Sitemap URLs: ${STATES.length + 3}`);

  return urls;
}

async function submitBatch(batch, batchNum, totalBatches) {
  const body = {
    host: 'yohomefix.com',
    key: INDEXNOW_KEY,
    keyLocation: `${DOMAIN}/${INDEXNOW_KEY}.txt`,
    urlList: batch,
  };

  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body),
    });

    console.log(`  Batch ${batchNum}/${totalBatches}: ${response.status} ${response.statusText} (${batch.length} URLs)`);
    return { status: response.status, count: batch.length, ok: response.status === 200 || response.status === 202 };
  } catch (err) {
    console.error(`  Batch ${batchNum}/${totalBatches}: ERROR — ${err.message}`);
    return { status: 0, count: batch.length, ok: false, error: err.message };
  }
}

async function main() {
  const allUrls = buildAllUrls();
  console.log(`\n=== Nationwide IndexNow Submission for yohomefix.com ===`);
  console.log(`Total URLs: ${allUrls.length}`);
  console.log(`Batch size: ${BATCH_SIZE}`);
  console.log(`Batches: ${Math.ceil(allUrls.length / BATCH_SIZE)}\n`);

  const results = [];
  for (let i = 0; i < allUrls.length; i += BATCH_SIZE) {
    const batch = allUrls.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(allUrls.length / BATCH_SIZE);
    const result = await submitBatch(batch, batchNum, totalBatches);
    results.push(result);
    // Rate limit: wait 1s between batches
    if (i + BATCH_SIZE < allUrls.length) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  const successCount = results.filter(r => r.ok).length;
  const totalSubmitted = results.reduce((sum, r) => sum + r.count, 0);
  const totalAccepted = results.filter(r => r.ok).reduce((sum, r) => sum + r.count, 0);
  const totalFailed = results.filter(r => !r.ok).reduce((sum, r) => sum + r.count, 0);

  console.log(`\n=== Summary ===`);
  console.log(`Batches succeeded: ${successCount}/${results.length}`);
  console.log(`URLs submitted: ${totalSubmitted}`);
  console.log(`URLs accepted (200/202): ${totalAccepted}`);
  console.log(`URLs failed: ${totalFailed}`);
  console.log(`\nNote: IndexNow acceptance ≠ indexed. Check Bing Webmaster Tools for indexing status.`);
}

main().catch(console.error);
