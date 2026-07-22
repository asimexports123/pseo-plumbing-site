const { SEED_CITIES, SERVICES, cityToSlug, buildSlug } = require('./lib/cities.js');

const baseUrl = 'https://yohomefix.com';
let passCount = 0;
let failCount = 0;
const failedUrls = [];

async function testUrl(url) {
  try {
    const response = await fetch(url);
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

async function testAllUrls() {
  const totalUrls = SEED_CITIES.length * SERVICES.length;
  console.log(`Testing ${totalUrls} URLs (${SEED_CITIES.length} cities × ${SERVICES.length} services)...`);
  
  for (const city of SEED_CITIES) {
    const citySlug = cityToSlug(city.name);
    for (const service of SERVICES) {
      const url = `${baseUrl}/${buildSlug(citySlug, service.slug)}`;
      const passed = await testUrl(url);
      if (passed) {
        passCount++;
      } else {
        failCount++;
        failedUrls.push(url);
      }
      process.stdout.write(`\rProgress: ${passCount + failCount}/${totalUrls} (${Math.round((passCount + failCount) / totalUrls * 100)}%)`);
    }
  }
  
  console.log(`\n\nResults:`);
  console.log(`Pass: ${passCount}`);
  console.log(`Fail: ${failCount}`);
  console.log(`Total: ${totalUrls}`);
  
  if (failCount > 0) {
    console.log(`\nFailed URLs (${failCount}):`);
    failedUrls.forEach(url => console.log(`  - ${url}`));
  }
}

testAllUrls().catch(console.error);
