// Verify live title and meta description on sample pages
const PAGES = [
  { url: 'https://yohomefix.com/plumber-oklahoma-city-emergency', label: 'Oklahoma City Emergency (city+service)' },
  { url: 'https://yohomefix.com/plumber-houston-emergency', label: 'Houston Emergency (city+service)' },
  { url: 'https://yohomefix.com/plumber-new-york-emergency', label: 'New York Emergency (city+service)' },
  { url: 'https://yohomefix.com/plumber-oklahoma-city-water-heater-repair', label: 'OKC Water Heater (city+service)' },
  { url: 'https://yohomefix.com/plumber-oklahoma', label: 'Oklahoma State Hub (state page)' },
  { url: 'https://yohomefix.com/cost/houston', label: 'Houston Cost Guide (cost page)' },
];

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.text();
}

function extractTitle(html) {
  const match = html.match(/<title[^>]*>(.*?)<\/title>/i);
  return match ? match[1].trim() : null;
}

function extractMetaDescription(html) {
  const match = html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']\s*\/?>/i);
  return match ? match[1].trim() : null;
}

function extractH1(html) {
  const match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
  if (!match) return null;
  return match[1].replace(/<[^>]+>/g, '').trim();
}

async function main() {
  console.log('='.repeat(70));
  console.log('LIVE TITLE & META DESCRIPTION VERIFICATION');
  console.log('='.repeat(70));

  let allPass = true;

  for (const { url, label } of PAGES) {
    console.log(`\n${'─'.repeat(70)}`);
    console.log(`Page: ${label}`);
    console.log(`URL:  ${url}`);
    console.log('─'.repeat(70));

    try {
      const html = await fetchHtml(url);
      const title = extractTitle(html);
      const meta = extractMetaDescription(html);
      const h1 = extractH1(html);

      if (!title) {
        console.log('  ❌ No <title> tag found');
        allPass = false;
      } else {
        console.log(`  <title>:       (${title.length} chars) ${title}`);
        if (title.length > 60) {
          console.log(`  ⚠️  Title over 60 chars (${title.length})`);
        } else {
          console.log(`  ✅ Title length OK (${title.length} chars)`);
        }
        if (!title.includes('YoHomeFix')) {
          console.log('  ⚠️  Title missing "YoHomeFix" brand');
        } else {
          console.log('  ✅ Brand "YoHomeFix" present');
        }
      }

      if (!meta) {
        console.log('  ❌ No meta description found');
        allPass = false;
      } else {
        console.log(`  <meta desc>:   (${meta.length} chars) ${meta.substring(0, 100)}${meta.length > 100 ? '...' : ''}`);
        if (meta.length > 155) {
          console.log(`  ⚠️  Meta description over 155 chars (${meta.length})`);
        } else {
          console.log(`  ✅ Meta length OK (${meta.length} chars)`);
        }
      }

      if (h1) {
        console.log(`  <h1>:          ${h1.substring(0, 80)}`);
      }

      // Check no unintended content changes — verify page rendered
      if (html.length < 1000) {
        console.log('  ❌ Page HTML suspiciously short — possible error page');
        allPass = false;
      } else {
        console.log(`  ✅ Page rendered (${html.length} bytes)`);
      }

    } catch (err) {
      console.log(`  ❌ Fetch error: ${err.message}`);
      allPass = false;
    }
  }

  console.log(`\n${'='.repeat(70)}`);
  if (allPass) {
    console.log('✅ ALL PAGES VERIFIED — Title and meta optimization is live');
  } else {
    console.log('❌ ISSUES DETECTED — See details above');
  }
  console.log('='.repeat(70));
}

main().catch(e => console.error('Fatal:', e.message));
