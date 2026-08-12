const puppeteer = require('puppeteer');

(async () => {
  const baseUrl = process.argv[2] || 'http://localhost:3000';
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  const page = (await browser.pages())[0];

  const client = await page.target().createCDPSession();
  await client.send('Runtime.enable');
  await client.send('Debugger.enable');
  await client.send('Network.enable');
  await client.send('Page.enable');

  const dataResponses = [];
  client.on('Network.responseReceived', async (params) => {
    if (params.response.url.includes('_next/data')) {
      try {
        const { body } = await client.send('Network.getResponseBody', { requestId: params.requestId });
        dataResponses.push({ url: params.response.url, status: params.response.status, body });
      } catch (e) {}
    }
  });

  client.on('Debugger.paused', async (params) => {
    const cf = params.callFrames[0];
    const evalInFrame = async (expr) => {
      try {
        const res = await client.send('Debugger.evaluateOnCallFrame', {
          callFrameId: cf.callFrameId,
          expression: expr,
          returnByValue: true,
          generatePreview: true,
        });
        if (res.exceptionDetails) return { error: res.exceptionDetails.text };
        if (res.result && res.result.value !== undefined) return res.result.value;
        if (res.result && res.result.objectId) return { objectId: res.result.objectId, type: res.result.type };
        return res.result;
      } catch (e) {
        return { error: e.message };
      }
    };

    const locals = await (async () => {
      try {
        const localScope = cf.scopeChain.find(s => s.type === 'local');
        if (!localScope) return null;
        const props = await client.send('Runtime.getProperties', { objectId: localScope.object.objectId, ownProperties: true });
        return props.result.map(p => ({ name: p.name, value: p.value ? p.value.value : undefined, type: p.value ? p.value.type : undefined }));
      } catch (e) { return { error: e.message }; }
    })();

    const propsFromArgs = await evalInFrame('typeof arguments !== "undefined" ? JSON.stringify(arguments[0]) : null');
    const stateObjFromArgs = await evalInFrame('typeof arguments !== "undefined" && arguments[0] ? JSON.stringify(arguments[0].stateObj) : null');
    const allSlugs = await evalInFrame('(function(){ var l=[]; try { for (let i in window) { if (i.includes && i.includes("slug")) l.push(i); } }catch(e){} return l; })()');

    const stack = (params.callFrames || []).map(f => ({
      functionName: f.functionName || '(anonymous)',
      url: f.url,
      line: f.lineNumber,
      column: f.columnNumber,
    }));

    console.log('\n=== DEBUGGER PAUSED ===');
    console.log('reason:', params.reason);
    console.log('exception:', JSON.stringify(params.data && params.data.description ? params.data.description : null));
    console.log('stack:', JSON.stringify(stack, null, 2).slice(0, 2000));
    console.log('localScope:', JSON.stringify(locals, null, 2).slice(0, 2000));
    console.log('arguments[0] (props):', propsFromArgs ? propsFromArgs.slice(0, 3000) : null);
    console.log('arguments[0].stateObj:', stateObjFromArgs ? stateObjFromArgs.slice(0, 3000) : null);

    await client.send('Debugger.resume');
  });

  await client.send('Debugger.setPauseOnExceptions', { state: 'all' });

  await client.send('Debugger.setBlackboxPatterns', { patterns: [
    '/node_modules/.*',
    '/_next/static/chunks/main-.*\\.js',
    '/_next/static/chunks/webpack-.*\\.js',
    '/_next/static/chunks/framework-.*\\.js',
    '/_next/static/chunks/polyfills-.*\\.js',
  ]});

  await page.goto(baseUrl, { waitUntil: 'networkidle2', timeout: 30000 });

  const georgia = await page.$('a[href="/plumber-georgia"], a[href*="plumber-georgia" i]');
  if (!georgia) {
    const links = await page.$$('a[href*="/plumber-"]');
    const hrefs = await Promise.all(links.slice(0, 10).map(l => l.evaluate(el => el.getAttribute('href'))));
    console.log('Georgia link not found; available:', hrefs);
  } else {
    await georgia.click();
  }

  await new Promise(r => setTimeout(r, 12000));

  console.log('\n=== DATA RESPONSES ===');
  for (const d of dataResponses) {
    console.log('\nURL:', d.url, 'Status:', d.status);
    try {
      const parsed = JSON.parse(d.body);
      console.log('pageProps keys:', Object.keys(parsed.pageProps || {}));
      console.log('stateObj:', JSON.stringify(parsed.pageProps && parsed.pageProps.stateObj, null, 2).slice(0, 3000));
    } catch (e) {
      console.log('Body:', d.body.slice(0, 1000));
    }
  }

  console.log('\n=== __NEXT_DATA__ ===');
  const nextData = await page.evaluate(() => {
    try { return window.__NEXT_DATA__ || null; } catch (e) { return { error: e.message }; }
  });
  console.log(JSON.stringify(nextData, (k, v) => (typeof v === 'object' && v && v.length > 5000 ? `[array ${v.length}]` : v), 2).slice(0, 5000));

  console.log('\n=== ROUTER ===');
  const router = await page.evaluate(() => {
    try {
      return window.next && window.next.router ? { asPath: window.next.router.asPath, pathname: window.next.router.pathname, query: window.next.router.query, isReady: window.next.router.isReady } : null;
    } catch (e) { return { error: e.message }; }
  });
  console.log(JSON.stringify(router, null, 2));

  await browser.close();
})();
