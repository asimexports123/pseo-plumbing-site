const { SEED_CITIES, SERVICES, cityToSlug, buildSlug } = require('./lib/cities.js');

const baseUrl = 'https://yohomefix.com';
const auditResults = {
  totalExpectedUrls: 0,
  successfulUrls: 0,
  failedUrls: 0,
  failedUrlList: [],
  httpStatusCodes: {},
  tests: {}
};

async function checkUrl(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return { status: response.status, ok: response.status === 200 };
  } catch (error) {
    return { status: 'ERROR', ok: false };
  }
}

async function auditAllUrls() {
  console.log('=== PHASE 6: TECHNICAL SEO & SCALE AUDIT ===\n');
  
  // Test 1: Check all expected city × service URLs
  console.log('Test 1: Checking all expected city × service URLs...');
  auditResults.totalExpectedUrls = SEED_CITIES.length * SERVICES.length;
  
  for (const city of SEED_CITIES) {
    const citySlug = cityToSlug(city.name);
    for (const service of SERVICES) {
      const url = `${baseUrl}/${buildSlug(citySlug, service.slug)}`;
      const result = await checkUrl(url);
      
      if (result.ok) {
        auditResults.successfulUrls++;
      } else {
        auditResults.failedUrls++;
        auditResults.failedUrlList.push({ url, status: result.status });
      }
      
      auditResults.httpStatusCodes[result.status] = (auditResults.httpStatusCodes[result.status] || 0) + 1;
      
      process.stdout.write(`\rProgress: ${auditResults.successfulUrls + auditResults.failedUrls}/${auditResults.totalExpectedUrls}`);
    }
  }
  
  console.log(`\n\nResults:`);
  console.log(`Total Expected URLs: ${auditResults.totalExpectedUrls}`);
  console.log(`Successful (200): ${auditResults.successfulUrls}`);
  console.log(`Failed: ${auditResults.failedUrls}`);
  console.log(`Success Rate: ${((auditResults.successfulUrls / auditResults.totalExpectedUrls) * 100).toFixed(2)}%`);
  
  console.log(`\nHTTP Status Code Distribution:`);
  Object.entries(auditResults.httpStatusCodes).sort((a, b) => b[1] - a[1]).forEach(([code, count]) => {
    console.log(`  ${code}: ${count}`);
  });
  
  if (auditResults.failedUrls > 0) {
    console.log(`\nFailed URLs (first 20):`);
    auditResults.failedUrlList.slice(0, 20).forEach(({ url, status }) => {
      console.log(`  ${url} - Status: ${status}`);
    });
  }
  
  // Test 2: Check sitemap
  console.log(`\n\nTest 2: Checking sitemap...`);
  try {
    const sitemapResponse = await fetch(`${baseUrl}/sitemap.xml`);
    if (sitemapResponse.ok) {
      const sitemapText = await sitemapResponse.text();
      const urlCount = (sitemapText.match(/<loc>/g) || []).length;
      console.log(`Sitemap accessible: Yes`);
      console.log(`URLs in sitemap: ${urlCount}`);
      console.log(`Expected URLs: ${auditResults.totalExpectedUrls}`);
      console.log(`Sitemap completeness: ${((urlCount / auditResults.totalExpectedUrls) * 100).toFixed(2)}%`);
    } else {
      console.log(`Sitemap accessible: No (Status: ${sitemapResponse.status})`);
    }
  } catch (error) {
    console.log(`Sitemap accessible: No (Error: ${error.message})`);
  }
  
  // Test 3: Check homepage
  console.log(`\n\nTest 3: Checking homepage...`);
  const homeResult = await checkUrl(baseUrl);
  console.log(`Homepage status: ${homeResult.status}`);
  
  // Test 4: Sample content check for a few URLs
  console.log(`\n\nTest 4: Sample content check for representative URLs...`);
  const sampleUrls = [
    `${baseUrl}/plumber-new-york-emergency`,
    `${baseUrl}/plumber-chicago-drain-cleaning`,
    `${baseUrl}/plumber-houston-leak-repair`,
    `${baseUrl}/plumber-los-angeles-water-heater-repair`,
    `${baseUrl}/plumber-miami-toilet-repair`
  ];
  
  for (const url of sampleUrls) {
    try {
      const response = await fetch(url);
      const html = await response.text();
      const hasTitle = html.includes('<title>');
      const hasMetaDescription = html.includes('name="description"');
      const hasCanonical = html.includes('canonical');
      const hasH1 = html.includes('<h1');
      
      console.log(`\n${url}:`);
      console.log(`  Status: ${response.status}`);
      console.log(`  Has Title: ${hasTitle ? 'Yes' : 'No'}`);
      console.log(`  Has Meta Description: ${hasMetaDescription ? 'Yes' : 'No'}`);
      console.log(`  Has Canonical: ${hasCanonical ? 'Yes' : 'No'}`);
      console.log(`  Has H1: ${hasH1 ? 'Yes' : 'No'}`);
    } catch (error) {
      console.log(`\n${url}: Error - ${error.message}`);
    }
  }
  
  // Test 5: Check for malformed slugs
  console.log(`\n\nTest 5: Checking for malformed service slugs...`);
  const malformedSlugs = SERVICES.filter(s => s.slug !== s.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
  if (malformedSlugs.length > 0) {
    console.log(`Found ${malformedSlugs.length} potentially malformed slugs:`);
    malformedSlugs.forEach(s => console.log(`  ${s.slug}`));
  } else {
    console.log(`All service slugs appear well-formed`);
  }
  
  // Summary
  console.log(`\n\n=== AUDIT SUMMARY ===`);
  console.log(`Total URLs Expected: ${auditResults.totalExpectedUrls}`);
  console.log(`Successful URLs: ${auditResults.successfulUrls}`);
  console.log(`Failed URLs: ${auditResults.failedUrls}`);
  console.log(`Success Rate: ${((auditResults.successfulUrls / auditResults.totalExpectedUrls) * 100).toFixed(2)}%`);
  
  if (auditResults.failedUrls === 0) {
    console.log(`\n✓ All expected URLs are returning HTTP 200`);
  } else {
    console.log(`\n✗ ${auditResults.failedUrls} URLs failed - review failed URL list above`);
  }
}

auditAllUrls().catch(console.error);
