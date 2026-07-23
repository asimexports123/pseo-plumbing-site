#!/usr/bin/env node
/**
 * Sprint #9 — IndexNow URL Submission Script
 * Submits all YoHomeFix URLs to Bing/Microsoft via IndexNow protocol
 * for immediate indexing discovery.
 *
 * Usage: node scripts/submit-indexnow.js
 */

const { SEED_CITIES, SERVICES, STATES, cityToSlug, buildSlug, isCityQualifiedForService, isStateQualifiedForService } = require('../lib/cities');

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || 'https://yohomefix.com';
const INDEXNOW_KEY = 'yohomefixindexnow2025';
const BATCH_SIZE = 500;

function buildAllUrls() {
  const urls = [];

  // Static pages
  urls.push(`${DOMAIN}/`);
  urls.push(`${DOMAIN}/plumber-usa`);
  urls.push(`${DOMAIN}/plumbing-cost-guide`);
  urls.push(`${DOMAIN}/about`);
  urls.push(`${DOMAIN}/contact`);
  urls.push(`${DOMAIN}/faq`);
  urls.push(`${DOMAIN}/whats-wrong-with-my-plumbing`);
  urls.push(`${DOMAIN}/guides`);
  urls.push(`${DOMAIN}/research/us-water-hardness-plumbing-risk`);
  urls.push(`${DOMAIN}/why-trust-yohomefix`);
  urls.push(`${DOMAIN}/how-yohomefix-works`);
  urls.push(`${DOMAIN}/editorial-policy`);
  urls.push(`${DOMAIN}/sources`);
  urls.push(`${DOMAIN}/press`);
  urls.push(`${DOMAIN}/media-kit`);

  // Guide pages
  ['how-to-prevent-frozen-pipes', 'signs-you-need-a-plumber', 'how-to-shut-off-water-in-emergency', 'hard-water-effects-on-plumbing', 'water-heater-maintenance-guide'].forEach(s => {
    urls.push(`${DOMAIN}/guides/${s}`);
  });

  // State pages
  STATES.forEach(s => {
    urls.push(`${DOMAIN}/plumber-${s.slug}`);
  });

  // State-service hub pages
  STATES.forEach(s => {
    SERVICES.forEach(svc => {
      if (isStateQualifiedForService(s.code, svc.slug)) {
        urls.push(`${DOMAIN}/plumber/${s.slug}/${svc.slug}`);
      }
    });
  });

  // City-service pages
  SEED_CITIES.forEach(city => {
    const cSlug = cityToSlug(city.name);
    SERVICES.forEach(service => {
      if (isCityQualifiedForService(city.name, service.slug)) {
        urls.push(`${DOMAIN}/${buildSlug(cSlug, service.slug)}`);
      }
    });
  });

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
    return { status: response.status, count: batch.length };
  } catch (err) {
    console.error(`  Batch ${batchNum}/${totalBatches}: ERROR — ${err.message}`);
    return { status: 0, count: batch.length, error: err.message };
  }
}

async function main() {
  const allUrls = buildAllUrls();
  console.log(`\n=== IndexNow Submission for yohomefix.com ===`);
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
    // Rate limit: wait 500ms between batches
    if (i + BATCH_SIZE < allUrls.length) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  const successCount = results.filter(r => r.status === 200 || r.status === 202).length;
  const totalSubmitted = results.reduce((sum, r) => sum + r.count, 0);
  console.log(`\n=== Summary ===`);
  console.log(`Batches succeeded: ${successCount}/${results.length}`);
  console.log(`Total URLs submitted: ${totalSubmitted}`);
  console.log(`\nNote: IndexNow accepts submissions but indexing is not guaranteed.`);
  console.log(`Check Bing Webmaster Tools for indexing status.`);
}

main().catch(console.error);
