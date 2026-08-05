// Check if new deploy is live by comparing response headers and HTML
const url = 'https://yohomefix.com/plumber-oklahoma-city-emergency';

async function check() {
  // Fetch with cache-busting query param
  const res = await fetch(url + '?_t=' + Date.now(), {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      'Accept': 'text/html',
      'Cache-Control': 'no-cache',
    },
  });

  console.log('Status:', res.status);
  console.log('Headers:');
  for (const [key, value] of res.headers.entries()) {
    if (key.startsWith('x-') || key === 'age' || key === 'cache-control' || key === 'etag' || key === 'date' || key === 'server') {
      console.log(`  ${key}: ${value}`);
    }
  }

  const html = await res.text();
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  console.log('\nTitle:', titleMatch ? titleMatch[1] : 'NOT FOUND');
  console.log('HTML length:', html.length);

  // Check for new vs old title pattern
  if (titleMatch) {
    const title = titleMatch[1];
    if (title.includes('| 24/7 |')) {
      console.log('✅ NEW title format detected');
    } else if (title.includes('| 24 Hour Plumber')) {
      console.log('❌ OLD title format — deploy not yet live');
    }
  }
}

check().catch(e => console.error(e.message));
