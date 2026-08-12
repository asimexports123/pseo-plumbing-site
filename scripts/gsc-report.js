/**
 * Google Search Console API Integration
 *
 * Lightweight reporting system that:
 * - Pulls daily impressions, clicks, CTR, and average position
 * - Stores daily snapshots as JSON files for trend comparison
 * - Generates reports: top pages, queries, gains/losses, new/lost queries
 *
 * Usage:
 *   node scripts/gsc-report.js fetch       — Pull today's data from GSC API
 *   node scripts/gsc-report.js report      — Generate comparison report
 *   node scripts/gsc-report.js report 7    — Report comparing last 7 days vs prior 7 days
 *   node scripts/gsc-report.js status      — Show stored snapshots and coverage
 *
 * Required env vars (set in .env or shell):
 *   GSC_SERVICE_ACCOUNT_EMAIL — service account email (xxx@yyy.iam.gserviceaccount.com)
 *   GSC_PRIVATE_KEY           — service account private key (PEM format)
 *   GSC_SITE_URL              — verified site URL in Search Console (https://yohomefix.com/)
 *
 * See SETUP.md for detailed setup instructions.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ── .env loader (no external dependency) ──────────────────────
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.substring(0, eqIdx).trim();
    const value = trimmed.substring(eqIdx + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

// ── Config ────────────────────────────────────────────────────
const DATA_DIR = path.join(__dirname, '..', 'gsc-data');
const SITE_URL = process.env.GSC_SITE_URL || 'https://yohomefix.com/';
const SERVICE_ACCOUNT_EMAIL = process.env.GSC_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = (process.env.GSC_PRIVATE_KEY || '').replace(/\\n/g, '\n');

// ── JWT Authentication (no external deps) ─────────────────────
// Implements RS256 JWT signing for Google OAuth2 service account auth

function base64UrlEncode(buf) {
  return Buffer.from(buf).toString('base64url');
}

function createJwt(payload) {
  const header = { alg: 'RS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signInput = `${encodedHeader}.${encodedPayload}`;

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signInput);
  const signature = sign.sign(PRIVATE_KEY, 'base64url');

  return `${signInput}.${signature}`;
}

async function getAccessToken() {
  if (!SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY) {
    throw new Error(
      'Missing credentials. Set GSC_SERVICE_ACCOUNT_EMAIL and GSC_PRIVATE_KEY env vars.\n' +
      'See SETUP.md for instructions.'
    );
  }

  const now = Math.floor(Date.now() / 1000);
  const jwt = createJwt({
    iss: SERVICE_ACCOUNT_EMAIL,
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  });

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OAuth token request failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  return data.access_token;
}

// ── GSC API calls ─────────────────────────────────────────────

async function querySearchConsole(accessToken, startDate, endDate, dimensions, rowLimit = 1000) {
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`;
  const body = {
    startDate,
    endDate,
    dimensions,
    rowLimit,
    startRow: 0,
  };

  const allRows = [];
  let startRow = 0;

  while (true) {
    body.startRow = startRow;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`GSC API request failed (${res.status}): ${text}`);
    }

    const data = await res.json();
    if (!data.rows || data.rows.length === 0) break;

    allRows.push(...data.rows);
    if (data.rows.length < rowLimit) break;
    startRow += rowLimit;

    // Safety limit: max 5000 rows per dimension set
    if (startRow >= 5000) break;
  }

  return allRows;
}

// ── Data storage ──────────────────────────────────────────────

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getSnapshotPath(date) {
  return path.join(DATA_DIR, `snapshot-${date}.json`);
}

function saveSnapshot(date, data) {
  ensureDataDir();
  const filepath = getSnapshotPath(date);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  console.log(`  Saved snapshot: ${filepath}`);
}

function loadSnapshot(date) {
  const filepath = getSnapshotPath(date);
  if (!fs.existsSync(filepath)) return null;
  return JSON.parse(fs.readFileSync(filepath, 'utf8'));
}

function listSnapshots() {
  ensureDataDir();
  const files = fs.readdirSync(DATA_DIR)
    .filter(f => f.startsWith('snapshot-') && f.endsWith('.json'))
    .sort();
  return files.map(f => f.replace('snapshot-', '').replace('.json', ''));
}

// ── Fetch command ─────────────────────────────────────────────

async function fetchDay(dateStr) {
  const date = dateStr || new Date().toISOString().split('T')[0];
  console.log(`\nFetching GSC data for ${date}...`);

  const token = await getAccessToken();

  // GSC data has a 2-day delay — use date-2 as the latest available
  const fetchDate = new Date(date);
  fetchDate.setDate(fetchDate.getDate() - 2);
  const dataDate = fetchDate.toISOString().split('T')[0];

  console.log(`  API date (2-day delay): ${dataDate}`);

  // Fetch by page
  console.log('  Fetching page data...');
  const pageRows = await querySearchConsole(token, dataDate, dataDate, ['page']);
  console.log(`    ${pageRows.length} pages`);

  // Fetch by query
  console.log('  Fetching query data...');
  const queryRows = await querySearchConsole(token, dataDate, dataDate, ['query']);
  console.log(`    ${queryRows.length} queries`);

  // Fetch by device
  console.log('  Fetching device data...');
  const deviceRows = await querySearchConsole(token, dataDate, dataDate, ['device']);
  console.log(`    ${deviceRows.length} device entries`);

  // Fetch by country
  console.log('  Fetching country data...');
  const countryRows = await querySearchConsole(token, dataDate, dataDate, ['country']);
  console.log(`    ${countryRows.length} country entries`);

  const snapshot = {
    date: dataDate,
    fetchedAt: new Date().toISOString(),
    siteUrl: SITE_URL,
    summary: {
      totalImpressions: pageRows.reduce((s, r) => s + r.impressions, 0),
      totalClicks: pageRows.reduce((s, r) => s + r.clicks, 0),
      avgCtr: 0,
      avgPosition: 0,
    },
    pages: pageRows.map(r => ({
      url: r.keys[0],
      impressions: r.impressions,
      clicks: r.clicks,
      ctr: r.ctr,
      position: r.position,
    })),
    queries: queryRows.map(r => ({
      query: r.keys[0],
      impressions: r.impressions,
      clicks: r.clicks,
      ctr: r.ctr,
      position: r.position,
    })),
    devices: deviceRows.map(r => ({
      device: r.keys[0],
      impressions: r.impressions,
      clicks: r.clicks,
      ctr: r.ctr,
      position: r.position,
    })),
    countries: countryRows.map(r => ({
      country: r.keys[0],
      impressions: r.impressions,
      clicks: r.clicks,
      ctr: r.ctr,
      position: r.position,
    })),
  };

  snapshot.summary.avgCtr = snapshot.summary.totalImpressions > 0
    ? snapshot.summary.totalClicks / snapshot.summary.totalImpressions : 0;
  snapshot.summary.avgPosition = pageRows.length > 0
    ? pageRows.reduce((s, r) => s + r.position * r.impressions, 0) / snapshot.summary.totalImpressions : 0;

  saveSnapshot(dataDate, snapshot);

  console.log(`\n  Summary: ${snapshot.summary.totalImpressions} impressions, ${snapshot.summary.totalClicks} clicks, ${(snapshot.summary.avgCtr * 100).toFixed(3)}% CTR, pos ${snapshot.summary.avgPosition.toFixed(2)}`);

  return snapshot;
}

// ── Report command ────────────────────────────────────────────

function generateReport(daysBack = 7) {
  const snapshots = listSnapshots();
  if (snapshots.length < 2) {
    console.log('Not enough snapshots to generate a report. Need at least 2.');
    console.log(`Available snapshots: ${snapshots.length}`);
    return;
  }

  // Get the most recent N days and the prior N days for comparison
  const recent = snapshots.slice(-daysBack);
  const prior = snapshots.slice(-(daysBack * 2), -daysBack);

  if (prior.length === 0) {
    console.log(`Not enough snapshots for a ${daysBack}-day comparison.`);
    console.log(`Need ${daysBack * 2} snapshots, have ${snapshots.length}.`);
    console.log(`Run 'fetch' for ${daysBack * 2 - snapshots.length} more days, or use a smaller window.`);
    return;
  }

  console.log('='.repeat(70));
  console.log(`SEARCH CONSOLE REPORT — ${daysBack}-DAY COMPARISON`);
  console.log('='.repeat(70));
  console.log(`Recent period:  ${recent[0]} to ${recent[recent.length - 1]} (${recent.length} days)`);
  console.log(`Prior period:   ${prior[0]} to ${prior[prior.length - 1]} (${prior.length} days)`);
  console.log('');

  // Load all snapshots
  const recentData = recent.map(d => loadSnapshot(d)).filter(Boolean);
  const priorData = prior.map(d => loadSnapshot(d)).filter(Boolean);

  // Aggregate metrics across days
  function aggregate(snapshots) {
    const pages = {};
    const queries = {};
    let totalImpressions = 0;
    let totalClicks = 0;

    for (const snap of snapshots) {
      totalImpressions += snap.summary.totalImpressions;
      totalClicks += snap.summary.totalClicks;

      for (const p of snap.pages) {
        if (!pages[p.url]) pages[p.url] = { impressions: 0, clicks: 0, positions: [], positionWeights: 0 };
        pages[p.url].impressions += p.impressions;
        pages[p.url].clicks += p.clicks;
        pages[p.url].positions.push(p.position);
        pages[p.url].positionWeights += p.position * p.impressions;
      }

      for (const q of snap.queries) {
        if (!queries[q.query]) queries[q.query] = { impressions: 0, clicks: 0, positions: [], positionWeights: 0 };
        queries[q.query].impressions += q.impressions;
        queries[q.query].clicks += q.clicks;
        queries[q.query].positions.push(q.position);
        queries[q.query].positionWeights += q.position * q.impressions;
      }
    }

    // Calculate averages
    for (const key of Object.keys(pages)) {
      const p = pages[key];
      p.ctr = p.impressions > 0 ? p.clicks / p.impressions : 0;
      p.avgPosition = p.positionWeights > 0 ? p.positionWeights / p.impressions : 0;
    }
    for (const key of Object.keys(queries)) {
      const q = queries[key];
      q.ctr = q.impressions > 0 ? q.clicks / q.impressions : 0;
      q.avgPosition = q.positionWeights > 0 ? q.positionWeights / q.impressions : 0;
    }

    return { pages, queries, totalImpressions, totalClicks };
  }

  const recentAgg = aggregate(recentData);
  const priorAgg = aggregate(priorData);

  // 1. Overall summary
  console.log('─'.repeat(70));
  console.log('1. OVERALL SUMMARY');
  console.log('─'.repeat(70));
  const recentCtr = recentAgg.totalImpressions > 0 ? recentAgg.totalClicks / recentAgg.totalImpressions : 0;
  const priorCtr = priorAgg.totalImpressions > 0 ? priorAgg.totalClicks / priorAgg.totalImpressions : 0;
  console.log(`  Metric         Recent          Prior          Change`);
  console.log(`  Impressions    ${recentAgg.totalImpressions.toString().padStart(10)}    ${priorAgg.totalImpressions.toString().padStart(10)}    ${recentAgg.totalImpressions - priorAgg.totalImpressions > 0 ? '+' : ''}${(recentAgg.totalImpressions - priorAgg.totalImpressions).toLocaleString()}`);
  console.log(`  Clicks         ${recentAgg.totalClicks.toString().padStart(10)}    ${priorAgg.totalClicks.toString().padStart(10)}    ${recentAgg.totalClicks - priorAgg.totalClicks > 0 ? '+' : ''}${(recentAgg.totalClicks - priorAgg.totalClicks).toLocaleString()}`);
  console.log(`  CTR            ${(recentCtr * 100).toFixed(3).padStart(9)}%   ${(priorCtr * 100).toFixed(3).padStart(9)}%   ${((recentCtr - priorCtr) * 100).toFixed(3) > 0 ? '+' : ''}${((recentCtr - priorCtr) * 100).toFixed(3)}%`);
  console.log('');

  // 2. Top 100 pages by impressions
  console.log('─'.repeat(70));
  console.log('2. TOP 100 PAGES BY IMPRESSIONS (recent period)');
  console.log('─'.repeat(70));
  const topPages = Object.entries(recentAgg.pages)
    .map(([url, data]) => ({ url, ...data }))
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 100);

  console.log(`  #  Impr     Clicks  CTR      Pos    URL`);
  for (let i = 0; i < topPages.length; i++) {
    const p = topPages[i];
    console.log(`  ${String(i + 1).padStart(3)} ${p.impressions.toString().padStart(7)} ${p.clicks.toString().padStart(7)} ${(p.ctr * 100).toFixed(2).padStart(6)}% ${p.avgPosition.toFixed(1).padStart(5)}  ${p.url.substring(0, 50)}`);
  }
  console.log('');

  // 3. Top 100 queries by impressions
  console.log('─'.repeat(70));
  console.log('3. TOP 100 QUERIES BY IMPRESSIONS (recent period)');
  console.log('─'.repeat(70));
  const topQueries = Object.entries(recentAgg.queries)
    .map(([query, data]) => ({ query, ...data }))
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 100);

  console.log(`  #  Impr     Clicks  CTR      Pos    Query`);
  for (let i = 0; i < topQueries.length; i++) {
    const q = topQueries[i];
    console.log(`  ${String(i + 1).padStart(3)} ${q.impressions.toString().padStart(7)} ${q.clicks.toString().padStart(7)} ${(q.ctr * 100).toFixed(2).padStart(6)}% ${q.avgPosition.toFixed(1).padStart(5)}  ${q.query.substring(0, 50)}`);
  }
  console.log('');

  // 4. Biggest ranking gains (position improved)
  console.log('─'.repeat(70));
  console.log('4. BIGGEST RANKING GAINS (position improved, min 10 impressions)');
  console.log('─'.repeat(70));
  const rankingGains = [];
  for (const [url, recentData] of Object.entries(recentAgg.pages)) {
    if (recentData.impressions < 10) continue;
    const priorPage = priorAgg.pages[url];
    if (!priorPage || priorPage.impressions < 10) continue;
    const change = priorPage.avgPosition - recentData.avgPosition;
    if (change > 0.5) {
      rankingGains.push({ url, recentPos: recentData.avgPosition, priorPos: priorPage.avgPosition, change, impressions: recentData.impressions });
    }
  }
  rankingGains.sort((a, b) => b.change - a.change);
  if (rankingGains.length === 0) {
    console.log('  No significant ranking gains detected.');
  } else {
    console.log(`  URL${' '.repeat(47)} Prior  Recent  Change  Impr`);
    for (const g of rankingGains.slice(0, 20)) {
      console.log(`  ${g.url.substring(0, 50).padEnd(50)} ${g.priorPos.toFixed(1).padStart(5)} ${g.recentPos.toFixed(1).padStart(6)} ${'+'}${g.change.toFixed(1).padStart(5)} ${g.impressions.toString().padStart(6)}`);
    }
  }
  console.log('');

  // 5. Biggest ranking losses (position worsened)
  console.log('─'.repeat(70));
  console.log('5. BIGGEST RANKING LOSSES (position worsened, min 10 impressions)');
  console.log('─'.repeat(70));
  const rankingLosses = [];
  for (const [url, recentData] of Object.entries(recentAgg.pages)) {
    if (recentData.impressions < 10) continue;
    const priorPage = priorAgg.pages[url];
    if (!priorPage || priorPage.impressions < 10) continue;
    const change = recentData.avgPosition - priorPage.avgPosition;
    if (change > 0.5) {
      rankingLosses.push({ url, recentPos: recentData.avgPosition, priorPos: priorPage.avgPosition, change, impressions: recentData.impressions });
    }
  }
  rankingLosses.sort((a, b) => b.change - a.change);
  if (rankingLosses.length === 0) {
    console.log('  No significant ranking losses detected.');
  } else {
    console.log(`  URL${' '.repeat(47)} Prior  Recent  Change  Impr`);
    for (const l of rankingLosses.slice(0, 20)) {
      console.log(`  ${l.url.substring(0, 50).padEnd(50)} ${l.priorPos.toFixed(1).padStart(5)} ${l.recentPos.toFixed(1).padStart(6)} ${'-'}${l.change.toFixed(1).padStart(5)} ${l.impressions.toString().padStart(6)}`);
    }
  }
  console.log('');

  // 6. CTR gains and losses
  console.log('─'.repeat(70));
  console.log('6. CTR CHANGES (min 50 impressions in both periods)');
  console.log('─'.repeat(70));
  const ctrChanges = [];
  for (const [url, recentData] of Object.entries(recentAgg.pages)) {
    if (recentData.impressions < 50) continue;
    const priorPage = priorAgg.pages[url];
    if (!priorPage || priorPage.impressions < 50) continue;
    const change = (recentData.ctr - priorPage.ctr) * 100;
    if (Math.abs(change) > 0.05) {
      ctrChanges.push({ url, recentCtr: recentData.ctr, priorCtr: priorPage.ctr, change, impressions: recentData.impressions });
    }
  }
  ctrChanges.sort((a, b) => b.change - a.change);
  if (ctrChanges.length === 0) {
    console.log('  No significant CTR changes detected.');
  } else {
    console.log(`  Top CTR GAINS:`);
    for (const c of ctrChanges.filter(c => c.change > 0).slice(0, 10)) {
      console.log(`    ${(c.priorCtr * 100).toFixed(3)}% → ${(c.recentCtr * 100).toFixed(3)}% (+${c.change.toFixed(3)}%)  ${c.impressions} impr  ${c.url.substring(0, 45)}`);
    }
    console.log(`  Top CTR LOSSES:`);
    for (const c of ctrChanges.filter(c => c.change < 0).slice(-10).reverse()) {
      console.log(`    ${(c.priorCtr * 100).toFixed(3)}% → ${(c.recentCtr * 100).toFixed(3)}% (${c.change.toFixed(3)}%)  ${c.impressions} impr  ${c.url.substring(0, 45)}`);
    }
  }
  console.log('');

  // 7. New queries (appeared in recent but not in prior)
  console.log('─'.repeat(70));
  console.log('7. NEW QUERIES (appeared in recent period, not in prior)');
  console.log('─'.repeat(70));
  const newQueries = [];
  for (const [query, data] of Object.entries(recentAgg.queries)) {
    if (!priorAgg.queries[query]) {
      newQueries.push({ query, ...data });
    }
  }
  newQueries.sort((a, b) => b.impressions - a.impressions);
  if (newQueries.length === 0) {
    console.log('  No new queries detected.');
  } else {
    console.log(`  ${newQueries.length} new queries found. Top 20 by impressions:`);
    console.log(`  Impr     Clicks  Pos    Query`);
    for (const q of newQueries.slice(0, 20)) {
      console.log(`  ${q.impressions.toString().padStart(7)} ${q.clicks.toString().padStart(7)} ${q.avgPosition.toFixed(1).padStart(5)}  ${q.query.substring(0, 50)}`);
    }
  }
  console.log('');

  // 8. Lost queries (in prior but not in recent)
  console.log('─'.repeat(70));
  console.log('8. LOST QUERIES (in prior period, not in recent)');
  console.log('─'.repeat(70));
  const lostQueries = [];
  for (const [query, data] of Object.entries(priorAgg.queries)) {
    if (!recentAgg.queries[query]) {
      lostQueries.push({ query, ...data });
    }
  }
  lostQueries.sort((a, b) => b.impressions - a.impressions);
  if (lostQueries.length === 0) {
    console.log('  No lost queries detected.');
  } else {
    console.log(`  ${lostQueries.length} lost queries. Top 20 by prior impressions:`);
    console.log(`  Impr     Clicks  Pos    Query`);
    for (const q of lostQueries.slice(0, 20)) {
      console.log(`  ${q.impressions.toString().padStart(7)} ${q.clicks.toString().padStart(7)} ${q.avgPosition.toFixed(1).padStart(5)}  ${q.query.substring(0, 50)}`);
    }
  }
  console.log('');

  // 9. Device breakdown
  console.log('─'.repeat(70));
  console.log('9. DEVICE BREAKDOWN (recent period)');
  console.log('─'.repeat(70));
  const recentDevices = {};
  for (const snap of recentData) {
    for (const d of snap.devices || []) {
      if (!recentDevices[d.device]) recentDevices[d.device] = { impressions: 0, clicks: 0 };
      recentDevices[d.device].impressions += d.impressions;
      recentDevices[d.device].clicks += d.clicks;
    }
  }
  for (const [device, data] of Object.entries(recentDevices)) {
    const ctr = data.impressions > 0 ? (data.clicks / data.impressions * 100).toFixed(3) : '0.000';
    console.log(`  ${device.padEnd(10)}  ${data.impressions.toString().padStart(8)} impr  ${data.clicks.toString().padStart(5)} clicks  ${ctr}% CTR`);
  }
  console.log('');

  console.log('='.repeat(70));
  console.log('END OF REPORT');
  console.log('='.repeat(70));
}

// ── Status command ────────────────────────────────────────────

function showStatus() {
  const snapshots = listSnapshots();
  console.log('='.repeat(70));
  console.log('GSC DATA STATUS');
  console.log('='.repeat(70));
  console.log(`Site URL:        ${SITE_URL}`);
  console.log(`Data directory:  ${DATA_DIR}`);
  console.log(`Snapshots:       ${snapshots.length}`);
  console.log(`Credentials:     ${SERVICE_ACCOUNT_EMAIL ? '✅ Set' : '❌ Missing'}`);
  console.log('');

  if (snapshots.length > 0) {
    console.log(`First snapshot:  ${snapshots[0]}`);
    console.log(`Last snapshot:   ${snapshots[snapshots.length - 1]}`);
    console.log('');

    // Load last snapshot for quick stats
    const last = loadSnapshot(snapshots[snapshots.length - 1]);
    if (last) {
      console.log(`Last snapshot summary:`);
      console.log(`  Date:         ${last.date}`);
      console.log(`  Impressions:  ${last.summary.totalImpressions}`);
      console.log(`  Clicks:       ${last.summary.totalClicks}`);
      console.log(`  CTR:          ${(last.summary.avgCtr * 100).toFixed(3)}%`);
      console.log(`  Avg Position: ${last.summary.avgPosition.toFixed(2)}`);
      console.log(`  Pages:        ${last.pages.length}`);
      console.log(`  Queries:      ${last.queries.length}`);
    }
  }

  if (!SERVICE_ACCOUNT_EMAIL) {
    console.log('\n⚠️  Credentials not set. See SETUP.md for instructions.');
    console.log('   Required env vars: GSC_SERVICE_ACCOUNT_EMAIL, GSC_PRIVATE_KEY');
  }
}

// ── Main ──────────────────────────────────────────────────────

const command = process.argv[2] || 'status';

(async () => {
  try {
    switch (command) {
      case 'fetch':
        await fetchDay(process.argv[3]);
        break;
      case 'report':
        generateReport(parseInt(process.argv[3]) || 7);
        break;
      case 'status':
        showStatus();
        break;
      default:
        console.log('Usage: node scripts/gsc-report.js [fetch|report|status] [date|days]');
        console.log('');
        console.log('Commands:');
        console.log('  fetch [date]  — Pull GSC data for date (default: today - 2 days)');
        console.log('  report [N]    — Generate N-day comparison report (default: 7)');
        console.log('  status        — Show stored snapshots and credential status');
    }
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
