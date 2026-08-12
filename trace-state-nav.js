const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();

  const dataResponses = [];
  page.on('response', async (res) => {
    const url = res.url();
    if (url.includes('_next/data')) {
      try {
        const text = await res.text();
        dataResponses.push({ status: res.status(), url, text });
      } catch (e) {
        dataResponses.push({ status: res.status(), url, error: e.message });
      }
    }
  });

  const errors = [];
  page.on('pageerror', (err) => {
    errors.push({ type: 'pageerror', message: err.message, stack: err.stack });
  });

  const consoleLogs = [];
  page.on('console', (msg) => {
    consoleLogs.push({ type: msg.type(), text: msg.text() });
  });

  const url = process.argv[2] || 'http://localhost:3000';
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

  // Click the California link (text or href)
  const california = await page.$('a[href="/plumber-california"], a[href*="/plumber-california" i]');
  if (!california) {
    console.log('Could not find California link; searching all state links');
    const links = await page.$$('a[href*="/plumber-"]');
    for (const l of links.slice(0, 5)) {
      const href = await l.evaluate(el => el.getAttribute('href'));
      console.log('Found:', href);
    }
    await browser.close();
    return;
  }

  await california.click();

  // Wait for client-side data request and render/error
  await new Promise((r) => setTimeout(r, 7000));

  let nextData = null;
  let nextRouter = null;
  try {
    nextData = await page.evaluate(() => window.__NEXT_DATA__ || null);
    nextRouter = await page.evaluate(() => {
      try {
        return window.next && window.next.router ? window.next.router : null;
      } catch (e) { return null; }
    });
  } catch (e) {
    nextData = { error: e.message };
  }

  console.log('\n=== ERRORS ===');
  console.log(JSON.stringify(errors, null, 2));

  console.log('\n=== CONSOLE ===');
  console.log(JSON.stringify(consoleLogs, null, 2));

  console.log('\n=== DATA RESPONSES ===');
  for (const d of dataResponses) {
    console.log('\nURL:', d.url);
    console.log('Status:', d.status);
    if (d.error) {
      console.log('Error reading body:', d.error);
    } else {
      console.log('Body:', d.text.slice(0, 3000));
    }
  }

  console.log('\n=== __NEXT_DATA__ ===');
  console.log(JSON.stringify(nextData, null, 2).slice(0, 3000));

  console.log('\n=== window.next.router ===');
  const routerObj = nextRouter && typeof nextRouter === 'object'
    ? { asPath: nextRouter.asPath, pathname: nextRouter.pathname, query: nextRouter.query, isReady: nextRouter.isReady }
    : nextRouter;
  console.log(JSON.stringify(routerObj, null, 2));

  await browser.close();
})();
