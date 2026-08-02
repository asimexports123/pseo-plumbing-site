const puppeteer = require('puppeteer');

const domain = 'https://yohomefix.com';
const routes = [
  '/',
  '/plumber-usa',
  '/plumber-new-york',
  '/cost/new-york',
  '/plumber/california/emergency',
  '/states/texas',
];

function summarizeResources(entries) {
  const js = entries.filter(e => e.initiatorType === 'script' || e.name.endsWith('.js'));
  const css = entries.filter(e => e.initiatorType === 'link' || e.name.endsWith('.css'));
  const jsSize = js.reduce((a, b) => a + (b.transferSize || 0), 0);
  const cssSize = css.reduce((a, b) => a + (b.transferSize || 0), 0);
  const topJs = js
    .sort((a, b) => (b.transferSize || 0) - (a.transferSize || 0))
    .slice(0, 10)
    .map(e => ({ name: e.name.split('/').pop(), size: e.transferSize, duration: Math.round(e.duration) }));
  return { jsCount: js.length, cssCount: css.length, jsSize, cssSize, topJs };
}

async function profileRoute(page, path) {
  const url = `${domain}${path}`;
  await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  const perf = await page.evaluate(() => {
    const t = performance.timing;
    const nav = performance.getEntriesByType('navigation')[0];
    return {
      domContentLoaded: t.domContentLoadedEventEnd - t.navigationStart,
      load: t.loadEventEnd - t.navigationStart,
      responseEnd: t.responseEnd - t.navigationStart,
      firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime,
      firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
      lcp: performance.getEntriesByType('largest-contentful-paint').slice(-1)[0]?.startTime,
      ttfb: nav ? nav.responseStart : t.responseStart - t.navigationStart,
    };
  });
  const resources = await page.evaluate(() => JSON.parse(JSON.stringify(performance.getEntriesByType('resource'))));
  const summary = summarizeResources(resources);
  const metrics = await page.metrics();
  return { path, perf, summary, metrics };
}

async function profileSearch(page) {
  await page.goto(`${domain}/`, { waitUntil: 'networkidle0' });
  const input = await page.$('input[type="search"], input[placeholder*="search" i], input[name*="search" i]');
  if (!input) return { searchInputFound: false };
  const t0 = Date.now();
  await input.type('plumber');
  // Wait a bit for any debounced API call
  await page.waitForTimeout(1000);
  const requests = await page.evaluate(() => {
    return performance.getEntriesByType('resource')
      .filter(r => r.name.includes('/api/') || r.name.includes('search'))
      .map(r => ({ name: r.name, duration: r.duration, transferSize: r.transferSize }));
  });
  return { searchInputFound: true, typeDuration: Date.now() - t0, apiRequests: requests };
}

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  const results = [];
  for (const path of routes) {
    results.push(await profileRoute(page, path));
  }
  const search = await profileSearch(page);
  await browser.close();
  console.log(JSON.stringify({ results, search }, null, 2));
})();
