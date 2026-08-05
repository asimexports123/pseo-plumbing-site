// Check multiple pages with cache-busting to see if new deploy is live
const PAGES = [
  'https://yohomefix.com/plumber-oklahoma-city-emergency',
  'https://yohomefix.com/cost/houston',
  'https://yohomefix.com/plumber-oklahoma',
];

async function check(url) {
  const res = await fetch(url + '?_cb=' + Date.now(), {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      'Accept': 'text/html',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    },
  });

  const html = await res.text();
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].replace(/&amp;/g, '&') : 'NOT FOUND';

  const headers = {};
  for (const [key, value] of res.headers.entries()) {
    if (key === 'age' || key === 'x-vercel-cache' || key === 'x-vercel-id' || key === 'cache-control') {
      headers[key] = value;
    }
  }

  const isNew = title.includes('| 24/7 |') || (title.includes('Cost') && !title.includes('—'));
  const isOld = title.includes('| 24 Hour Plumber') || title.includes('— Pricing Guide');

  console.log(`URL: ${url}`);
  console.log(`  Title: ${title.substring(0, 80)}...`);
  console.log(`  Length: ${title.length} chars`);
  console.log(`  Vercel cache: ${headers['x-vercel-cache'] || 'N/A'}`);
  console.log(`  Age: ${headers['age'] || 'N/A'}s`);
  console.log(`  Status: ${isNew ? '✅ NEW' : isOld ? '❌ OLD' : '❓ UNKNOWN'}`);
  console.log('');
}

async function main() {
  for (const url of PAGES) {
    await check(url);
  }
}

main().catch(e => console.error(e.message));
