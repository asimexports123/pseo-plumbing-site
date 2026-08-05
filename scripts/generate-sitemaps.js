// Standalone Sitemap Generator
//
// Generates all sitemap XML files into public/ without running next build.
// This is the same logic as pages/sitemap-build-assets.js getStaticProps,
// extracted into a standalone script so it can run independently.
//
// Usage:
//   node scripts/generate-sitemaps.js
//
// Output:
//   public/sitemap.xml              (index)
//   public/sitemap-static/0.xml     (static pages)
//   public/sitemap-cities/0.xml     (SEED_CITIES x SERVICES)
//   public/sitemap-states/{state}/0.xml  (state x service + nationwide places)
//   public/sitemap-zcta/{state}/0.xml    (ZIP x service)

import fs from 'fs';
import path from 'path';
import {
  STATES, SEED_CITIES, SERVICES, COST_PAGE_CITIES,
  cityToSlug, buildSlug,
  isCityQualifiedForService, isStateQualifiedForService,
} from '../lib/cities.js';
import { getPlacesByState } from '../lib/nationwidePlaces.js';
import { getZctasByState, SERVICE_SLUGS } from '../lib/hyperlocalPlaces-server.js';
import { isZctaQualifiedForService } from '../lib/hyperlocalPlaces.js';
import { getPageDate } from '../lib/contentVersioning.js';

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || 'https://yohomefix.com';
const SITEMAP_URL_LIMIT = 10000;

const ZCTA_SITEMAP_SERVICES = [
  'emergency',
  'leak-repair',
  'drain-cleaning',
  'water-heater-repair',
  'pipe-burst-repair',
];

const GUIDES = [
  'how-to-prevent-frozen-pipes',
  'signs-you-need-a-plumber',
  'how-to-shut-off-water-in-emergency',
  'hard-water-effects-on-plumbing',
  'water-heater-maintenance-guide',
];

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

function buildUrlset(urls) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(({ loc, priority, changefreq, lastmod }) => `  <url>
    <loc>${loc}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('\n')}
</urlset>`;
}

function buildSitemapIndex(sitemaps) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(({ loc, lastmod }) => `  <sitemap>
    <loc>${loc}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
  </sitemap>`).join('\n')}
</sitemapindex>`;
}

function writePublic(filePath, content) {
  const fullPath = path.join(process.cwd(), 'public', filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
}

function staticUrlList() {
  return [
    { loc: `${DOMAIN}/`, priority: '1.0', changefreq: 'weekly', lastmod: getPageDate('static:home') },
    { loc: `${DOMAIN}/plumber-usa`, priority: '0.9', changefreq: 'weekly', lastmod: getPageDate('static:plumber-usa') },
    { loc: `${DOMAIN}/plumbing-cost-guide`, priority: '0.8', changefreq: 'monthly', lastmod: getPageDate('static:plumbing-cost-guide') },
    { loc: `${DOMAIN}/about`, priority: '0.6', changefreq: 'monthly', lastmod: getPageDate('static:about') },
    { loc: `${DOMAIN}/contact`, priority: '0.6', changefreq: 'monthly', lastmod: getPageDate('static:contact') },
    { loc: `${DOMAIN}/faq`, priority: '0.7', changefreq: 'monthly', lastmod: getPageDate('static:faq') },
    { loc: `${DOMAIN}/disclaimer`, priority: '0.3', changefreq: 'yearly', lastmod: getPageDate('static:disclaimer') },
    { loc: `${DOMAIN}/privacy-policy`, priority: '0.3', changefreq: 'yearly', lastmod: getPageDate('static:privacy-policy') },
    { loc: `${DOMAIN}/terms-of-service`, priority: '0.3', changefreq: 'yearly', lastmod: getPageDate('static:terms-of-service') },
    ...STATES.map(s => ({ loc: `${DOMAIN}/plumber-${s.slug}`, priority: '0.8', changefreq: 'weekly', lastmod: getPageDate(`state:${s.slug}`) })),
    ...STATES.flatMap(s => SERVICES.filter(svc => isStateQualifiedForService(s.code, svc.slug)).map(svc => ({ loc: `${DOMAIN}/plumber/${s.slug}/${svc.slug}`, priority: '0.8', changefreq: 'monthly', lastmod: getPageDate(`state-service:${s.slug}:${svc.slug}`) }))),
    ...COST_PAGE_CITIES.map(cityName => ({ loc: `${DOMAIN}/cost/${cityToSlug(cityName)}`, priority: '0.8', changefreq: 'monthly', lastmod: getPageDate(`cost:${cityToSlug(cityName)}`) })),
    { loc: `${DOMAIN}/guides`, priority: '0.7', changefreq: 'monthly', lastmod: getPageDate('static:guides') },
    { loc: `${DOMAIN}/research/us-water-hardness-plumbing-risk`, priority: '0.9', changefreq: 'monthly', lastmod: getPageDate('static:research-us-water-hardness') },
    { loc: `${DOMAIN}/whats-wrong-with-my-plumbing`, priority: '0.9', changefreq: 'monthly', lastmod: getPageDate('static:whats-wrong') },
    { loc: `${DOMAIN}/why-trust-yohomefix`, priority: '0.6', changefreq: 'monthly', lastmod: getPageDate('static:why-trust') },
    { loc: `${DOMAIN}/how-yohomefix-works`, priority: '0.6', changefreq: 'monthly', lastmod: getPageDate('static:how-works') },
    { loc: `${DOMAIN}/authors`, priority: '0.5', changefreq: 'monthly', lastmod: getPageDate('static:authors') },
    ...['editorial-team','plumbing-standards-reviewer','home-services-researcher'].map(slug => ({ loc: `${DOMAIN}/authors/${slug}`, priority: '0.5', changefreq: 'monthly', lastmod: getPageDate(`author:${slug}`) })),
    { loc: `${DOMAIN}/editorial-policy`, priority: '0.5', changefreq: 'monthly', lastmod: getPageDate('static:editorial-policy') },
    { loc: `${DOMAIN}/sources`, priority: '0.5', changefreq: 'monthly', lastmod: getPageDate('static:sources') },
    { loc: `${DOMAIN}/press`, priority: '0.5', changefreq: 'monthly', lastmod: getPageDate('static:press') },
    { loc: `${DOMAIN}/media-kit`, priority: '0.5', changefreq: 'monthly', lastmod: getPageDate('static:media-kit') },
    ...GUIDES.map(slug => ({ loc: `${DOMAIN}/guides/${slug}`, priority: '0.7', changefreq: 'monthly', lastmod: getPageDate(`guide:${slug}`) })),
  ];
}

function getStaticSitemapChunks() {
  const chunks = chunkArray(staticUrlList(), SITEMAP_URL_LIMIT);
  return chunks.map((chunk, i) => ({ chunkIndex: i, xml: buildUrlset(chunk) }));
}

function getCityUrlList() {
  const urls = [];
  SEED_CITIES.forEach((city) => {
    const cSlug = cityToSlug(city.name);
    SERVICES.forEach((service) => {
      if (isCityQualifiedForService(city.name, service.slug, city.stateCode)) {
        const fullSlug = buildSlug(cSlug, service.slug);
        urls.push({
          loc: `${DOMAIN}/${fullSlug}`,
          priority: service.slug === 'emergency' ? '0.9' : '0.8',
          changefreq: 'monthly',
          lastmod: getPageDate(`city-service:${fullSlug}`),
        });
      }
    });
  });
  return urls;
}

function getCitySitemapChunks() {
  const chunks = chunkArray(getCityUrlList(), SITEMAP_URL_LIMIT);
  return chunks.map((chunk, i) => ({ chunkIndex: i, xml: buildUrlset(chunk) }));
}

function getStateSitemapChunks(stateObj) {
  const urls = [];
  urls.push({ loc: `${DOMAIN}/plumber-${stateObj.slug}`, priority: '0.8', changefreq: 'weekly', lastmod: getPageDate(`state:${stateObj.slug}`) });
  SERVICES.forEach(svc => {
    if (isStateQualifiedForService(stateObj.code, svc.slug)) {
      urls.push({ loc: `${DOMAIN}/plumber/${stateObj.slug}/${svc.slug}`, priority: '0.8', changefreq: 'monthly', lastmod: getPageDate(`state-service:${stateObj.slug}:${svc.slug}`) });
    }
  });
  const seedCitiesForState = SEED_CITIES.filter(c => c.stateCode === stateObj.code);
  seedCitiesForState.forEach(city => {
    const cSlug = cityToSlug(city.name);
    SERVICES.forEach(svc => {
      if (isCityQualifiedForService(city.name, svc.slug, city.stateCode)) {
        const fullSlug = buildSlug(cSlug, svc.slug);
        urls.push({ loc: `${DOMAIN}/${fullSlug}`, priority: svc.slug === 'emergency' ? '0.9' : '0.8', changefreq: 'monthly', lastmod: getPageDate(`city-service:${fullSlug}`) });
      }
    });
  });
  const seedCityNames = new Set(seedCitiesForState.map(c => c.name));
  const statePlaces = getPlacesByState(stateObj.code).filter(p => !seedCityNames.has(p.name));
  statePlaces.forEach(place => {
    SERVICES.forEach(svc => {
      if (isCityQualifiedForService(place.name, svc.slug, place.stateCode)) {
        const fullSlug = buildSlug(place.slug, svc.slug);
        urls.push({ loc: `${DOMAIN}/${fullSlug}`, priority: svc.slug === 'emergency' ? '0.9' : '0.7', changefreq: 'monthly', lastmod: getPageDate(`city-service:${fullSlug}`) });
      }
    });
  });
  const chunks = chunkArray(urls, SITEMAP_URL_LIMIT);
  return chunks.map((chunk, i) => ({ chunkIndex: i, xml: buildUrlset(chunk) }));
}

function getZctaSitemapChunks(stateObj) {
  const urls = [];
  const stateZctas = getZctasByState(stateObj.code);
  const citySlugs = new Set();
  stateZctas.forEach(z => citySlugs.add(z.parentCitySlug));
  citySlugs.forEach(citySlug => {
    urls.push({ loc: `${DOMAIN}/areas/${citySlug}`, priority: '0.6', changefreq: 'monthly', lastmod: getPageDate(`zcta-city:${citySlug}`) });
  });
  stateZctas.forEach(zcta => {
    ZCTA_SITEMAP_SERVICES.forEach(svc => {
      if (isZctaQualifiedForService(zcta, svc)) {
        urls.push({ loc: `${DOMAIN}/areas/${zcta.parentCitySlug}/${zcta.zip}/${svc}`, priority: svc === 'emergency' ? '0.7' : '0.6', changefreq: 'monthly', lastmod: getPageDate(`zcta-service:${zcta.parentCitySlug}:${zcta.zip}:${svc}`) });
      }
    });
  });
  const chunks = chunkArray(urls, SITEMAP_URL_LIMIT);
  return chunks.map((chunk, i) => ({ chunkIndex: i, xml: buildUrlset(chunk) }));
}

function main() {
  const startTime = Date.now();
  console.log('[sitemaps] Generating sitemap files...');

  const today = getToday();

  const staticChunks = getStaticSitemapChunks();
  const cityChunks = getCitySitemapChunks();
  const stateMap = new Map();
  const zctaMap = new Map();

  for (const stateObj of STATES) {
    stateMap.set(stateObj, getStateSitemapChunks(stateObj));
    zctaMap.set(stateObj, getZctaSitemapChunks(stateObj));
  }

  // static sitemap chunks
  for (const chunk of staticChunks) {
    writePublic(`sitemap-static/${chunk.chunkIndex}.xml`, chunk.xml);
  }

  // city sitemap chunks
  for (const chunk of cityChunks) {
    writePublic(`sitemap-cities/${chunk.chunkIndex}.xml`, chunk.xml);
  }

  // state and zcta chunks
  let totalUrls = 0;
  for (const stateObj of STATES) {
    for (const chunk of stateMap.get(stateObj)) {
      writePublic(`sitemap-states/${stateObj.slug}/${chunk.chunkIndex}.xml`, chunk.xml);
    }
    for (const chunk of zctaMap.get(stateObj)) {
      writePublic(`sitemap-zcta/${stateObj.slug}/${chunk.chunkIndex}.xml`, chunk.xml);
    }
  }

  // main sitemap index
  const sitemaps = [];
  for (const chunk of staticChunks) {
    sitemaps.push({ loc: `${DOMAIN}/sitemap-static/${chunk.chunkIndex}.xml`, lastmod: today });
  }
  for (const chunk of cityChunks) {
    sitemaps.push({ loc: `${DOMAIN}/sitemap-cities/${chunk.chunkIndex}.xml`, lastmod: today });
  }
  for (const stateObj of STATES) {
    for (const chunk of stateMap.get(stateObj)) {
      sitemaps.push({ loc: `${DOMAIN}/sitemap-states/${stateObj.slug}/${chunk.chunkIndex}.xml`, lastmod: today });
    }
    for (const chunk of zctaMap.get(stateObj)) {
      sitemaps.push({ loc: `${DOMAIN}/sitemap-zcta/${stateObj.slug}/${chunk.chunkIndex}.xml`, lastmod: today });
    }
  }

  writePublic('sitemap.xml', buildSitemapIndex(sitemaps));

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`[sitemaps] Generated ${sitemaps.length} sitemap files in ${elapsed}s`);
}

main();
