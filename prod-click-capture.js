const puppeteer = require('puppeteer');

(async () => {
  const baseUrl = process.argv[2] || 'http://localhost:3000';
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  const page = (await browser.pages())[0];

  const consoleMsgs = [];
  const pageErrors = [];
  page.on('console', msg => consoleMsgs.push({ type: msg.type(), text: msg.text() }));
  page.on('pageerror', err => pageErrors.push({ message: err.message, stack: err.stack }));

  const client = await page.target().createCDPSession();
  await client.send('Network.enable');

  const requests = [];
  const responses = new Map();

  client.on('Network.requestWillBeSent', (params) => {
    if (params.request.url.includes('_next/data')) {
      requests.push({
        requestId: params.requestId,
        url: params.request.url,
        initiator: params.initiator,
        type: params.type,
        method: params.request.method,
        timestamp: params.timestamp,
      });
    }
  });

  client.on('Network.responseReceived', async (params) => {
    if (params.response.url.includes('_next/data')) {
      try {
        const { body } = await client.send('Network.getResponseBody', { requestId: params.requestId });
        responses.set(params.requestId, {
          url: params.response.url,
          status: params.response.status,
          mimeType: params.response.mimeType,
          body,
        });
      } catch (e) {
        responses.set(params.requestId, {
          url: params.response.url,
          status: params.response.status,
          mimeType: params.response.mimeType,
          error: e.message,
        });
      }
    }
  });

  await page.goto(baseUrl, { waitUntil: 'networkidle2', timeout: 30000 });

  // Get the rendered HTML of the Georgia link
  const georgiaLink = await page.$('a[href="/plumber-georgia"], a[href*="plumber-georgia" i]');
  let linkHtml = 'Georgia link not found';
  if (georgiaLink) {
    linkHtml = await georgiaLink.evaluate((el) => el.outerHTML);
  } else {
    const links = await page.$$('a[href*="/plumber-"]');
    const hrefs = await Promise.all(links.slice(0, 10).map(l => l.evaluate(el => el.outerHTML)));
    linkHtml = 'Candidates:\n' + hrefs.join('\n');
  }

  // Clear prefetch noise before the actual click
  requests.length = 0;
  responses.clear();

  if (georgiaLink) {
    console.log('--- BEFORE CLICK ---');
    console.log('Georgia link outerHTML:', linkHtml);
    await georgiaLink.click();
    await new Promise(r => setTimeout(r, 8000));
  } else {
    console.log('No Georgia link to click');
  }

  console.log('\n=== CLICK-TRIGGERED _next/data REQUESTS ===\n');
  for (const req of requests) {
    const res = responses.get(req.requestId);
    console.log('Request URL:', req.url);
    console.log('Method:', req.method);
    console.log('Initiator type:', req.initiator ? req.initiator.type : 'n/a');
    console.log('Initiator:', JSON.stringify(req.initiator, null, 2).slice(0, 1000));
    if (res) {
      console.log('Response status:', res.status);
      console.log('Mime type:', res.mimeType);
      const isJson = res.body && res.body.trim().startsWith('{');
      if (isJson) {
        try {
          const parsed = JSON.parse(res.body);
          console.log('Response body (parsed pageProps keys):', Object.keys(parsed.pageProps || {}));
          console.log('stateObj:', JSON.stringify(parsed.pageProps && parsed.pageProps.stateObj, null, 2).slice(0, 1500));
        } catch (e) {
          console.log('Response body (first 500 chars):', res.body.slice(0, 500));
        }
      } else {
        console.log('Response body (first 500 chars):', res.body ? res.body.slice(0, 500) : res.error);
      }
    } else {
      console.log('Response: not captured');
    }
    console.log('\n---\n');
  }

  const georgiaReqs = requests.filter(r => r.url.includes('georgia'));
  console.log('\n=== GEORGIA-RELATED SUMMARY ===\n');
  for (const req of georgiaReqs) {
    const res = responses.get(req.requestId);
    console.log('URL:', req.url);
    console.log('Initiator type:', req.initiator ? req.initiator.type : 'n/a');
    console.log('Response status:', res ? res.status : 'n/a');
    console.log('Is JSON:', res ? (res.body && res.body.trim().startsWith('{')) : 'n/a');
    console.log('---');
  }

  console.log('\n=== CONSOLE / PAGE ERROR SUMMARY ===');
  console.log('Page errors:', JSON.stringify(pageErrors, null, 2));
  console.log('Console non-log messages:', JSON.stringify(consoleMsgs.filter(m => m.type !== 'log'), null, 2));

  await browser.close();
})();
