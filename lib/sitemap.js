import {
  STATES, SEED_CITIES, SERVICES, COST_PAGE_CITIES,
  cityToSlug, buildSlug,
  isCityQualifiedForService, isStateQualifiedForService,
} from './cities';
import { getPlacesByState } from './nationwidePlaces';
import { getZctasByState, SERVICE_SLUGS } from './hyperlocalPlaces-server';
import { isZctaQualifiedForService } from './hyperlocalPlaces';

// High commercial-intent services exposed in ZCTA (ZIP-level) sitemaps.
// Full 15-service list is still available via city-level sitemaps; this
// filter only controls sitemap discovery at the ZIP level to reduce
// crawl explosion on fallback:'blocking' routes.
const ZCTA_SITEMAP_SERVICES = [
  'emergency',
  'leak-repair',
  'drain-cleaning',
  'water-heater-repair',
  'pipe-burst-repair',
];

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || 'https://yohomefix.com';

export const SITEMAP_URL_LIMIT = 10000;

export function buildUrlset(urls) {
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

export function buildSitemapIndex(sitemaps) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(({ loc, lastmod }) => `  <sitemap>
    <loc>${loc}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
  </sitemap>`).join('\n')}
</sitemapindex>`;
}

function getToday() { return new Date().toISOString().split('T')[0]; }

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

function staticUrlList() {
  const today = getToday();
  const guides = ['how-to-prevent-frozen-pipes','signs-you-need-a-plumber','how-to-shut-off-water-in-emergency','hard-water-effects-on-plumbing','water-heater-maintenance-guide'];
  return [
    { loc: `${DOMAIN}/`, priority: '1.0', changefreq: 'weekly', lastmod: today },
    { loc: `${DOMAIN}/plumber-usa`, priority: '0.9', changefreq: 'weekly', lastmod: today },
    { loc: `${DOMAIN}/plumbing-cost-guide`, priority: '0.8', changefreq: 'monthly', lastmod: today },
    { loc: `${DOMAIN}/about`, priority: '0.6', changefreq: 'monthly', lastmod: today },
    { loc: `${DOMAIN}/contact`, priority: '0.6', changefreq: 'monthly', lastmod: today },
    { loc: `${DOMAIN}/faq`, priority: '0.7', changefreq: 'monthly', lastmod: today },
    { loc: `${DOMAIN}/disclaimer`, priority: '0.3', changefreq: 'yearly', lastmod: today },
    { loc: `${DOMAIN}/privacy-policy`, priority: '0.3', changefreq: 'yearly', lastmod: today },
    { loc: `${DOMAIN}/terms-of-service`, priority: '0.3', changefreq: 'yearly', lastmod: today },
    ...STATES.map(s => ({ loc: `${DOMAIN}/plumber-${s.slug}`, priority: '0.8', changefreq: 'weekly', lastmod: today })),
    ...STATES.flatMap(s => SERVICES.filter(svc => isStateQualifiedForService(s.code, svc.slug)).map(svc => ({ loc: `${DOMAIN}/plumber/${s.slug}/${svc.slug}`, priority: '0.8', changefreq: 'monthly', lastmod: today }))),
    ...COST_PAGE_CITIES.map(cityName => ({ loc: `${DOMAIN}/cost/${cityToSlug(cityName)}`, priority: '0.8', changefreq: 'monthly', lastmod: today })),
    { loc: `${DOMAIN}/guides`, priority: '0.7', changefreq: 'monthly', lastmod: today },
    { loc: `${DOMAIN}/research/us-water-hardness-plumbing-risk`, priority: '0.9', changefreq: 'monthly', lastmod: today },
    { loc: `${DOMAIN}/whats-wrong-with-my-plumbing`, priority: '0.9', changefreq: 'monthly', lastmod: today },
    { loc: `${DOMAIN}/why-trust-yohomefix`, priority: '0.6', changefreq: 'monthly', lastmod: today },
    { loc: `${DOMAIN}/how-yohomefix-works`, priority: '0.6', changefreq: 'monthly', lastmod: today },
    { loc: `${DOMAIN}/authors`, priority: '0.5', changefreq: 'monthly', lastmod: today },
    ...['editorial-team','plumbing-standards-reviewer','home-services-researcher'].map(slug => ({ loc: `${DOMAIN}/authors/${slug}`, priority: '0.5', changefreq: 'monthly', lastmod: today })),
    { loc: `${DOMAIN}/editorial-policy`, priority: '0.5', changefreq: 'monthly', lastmod: today },
    { loc: `${DOMAIN}/sources`, priority: '0.5', changefreq: 'monthly', lastmod: today },
    { loc: `${DOMAIN}/press`, priority: '0.5', changefreq: 'monthly', lastmod: today },
    { loc: `${DOMAIN}/media-kit`, priority: '0.5', changefreq: 'monthly', lastmod: today },
    ...guides.map(slug => ({ loc: `${DOMAIN}/guides/${slug}`, priority: '0.7', changefreq: 'monthly', lastmod: today })),
  ];
}

export function buildStaticUrlset() {
  return buildUrlset(staticUrlList());
}

export function getStaticSitemapChunks() {
  const chunks = chunkArray(staticUrlList(), SITEMAP_URL_LIMIT);
  return chunks.map((chunk, i) => ({ chunkIndex: i, xml: buildUrlset(chunk) }));
}

export function getCityUrlList() {
  const today = getToday();
  const urls = [];
  SEED_CITIES.forEach((city) => {
    const cSlug = cityToSlug(city.name);
    SERVICES.forEach((service) => {
      if (isCityQualifiedForService(city.name, service.slug, city.stateCode)) {
        urls.push({
          loc: `${DOMAIN}/${buildSlug(cSlug, service.slug)}`,
          priority: service.slug === 'emergency' ? '0.9' : '0.8',
          changefreq: 'monthly',
          lastmod: today,
        });
      }
    });
  });
  return urls;
}

export function buildCityUrlset() {
  return buildUrlset(getCityUrlList());
}

export function getCitySitemapChunks() {
  const chunks = chunkArray(getCityUrlList(), SITEMAP_URL_LIMIT);
  return chunks.map((chunk, i) => ({ chunkIndex: i, xml: buildUrlset(chunk) }));
}

export function getStateSitemapChunks(stateObj) {
  const today = getToday();
  const urls = [];
  urls.push({ loc: `${DOMAIN}/plumber-${stateObj.slug}`, priority: '0.8', changefreq: 'weekly', lastmod: today });
  SERVICES.forEach(svc => {
    if (isStateQualifiedForService(stateObj.code, svc.slug)) {
      urls.push({ loc: `${DOMAIN}/plumber/${stateObj.slug}/${svc.slug}`, priority: '0.8', changefreq: 'monthly', lastmod: today });
    }
  });
  const seedCitiesForState = SEED_CITIES.filter(c => c.stateCode === stateObj.code);
  seedCitiesForState.forEach(city => {
    const cSlug = cityToSlug(city.name);
    SERVICES.forEach(svc => {
      if (isCityQualifiedForService(city.name, svc.slug, city.stateCode)) {
        urls.push({ loc: `${DOMAIN}/${buildSlug(cSlug, svc.slug)}`, priority: svc.slug === 'emergency' ? '0.9' : '0.8', changefreq: 'monthly', lastmod: today });
      }
    });
  });
  const seedCityNames = new Set(seedCitiesForState.map(c => c.name));
  const statePlaces = getPlacesByState(stateObj.code).filter(p => !seedCityNames.has(p.name));
  statePlaces.forEach(place => {
    SERVICES.forEach(svc => {
      if (isCityQualifiedForService(place.name, svc.slug, place.stateCode)) {
        urls.push({ loc: `${DOMAIN}/${buildSlug(place.slug, svc.slug)}`, priority: svc.slug === 'emergency' ? '0.9' : '0.7', changefreq: 'monthly', lastmod: today });
      }
    });
  });
  const chunks = chunkArray(urls, SITEMAP_URL_LIMIT);
  return chunks.map((chunk, i) => ({ chunkIndex: i, xml: buildUrlset(chunk) }));
}

export function getZctaSitemapChunks(stateObj) {
  const today = getToday();
  const urls = [];
  const stateZctas = getZctasByState(stateObj.code);
  const citySlugs = new Set();
  stateZctas.forEach(z => citySlugs.add(z.parentCitySlug));
  citySlugs.forEach(citySlug => {
    urls.push({ loc: `${DOMAIN}/areas/${citySlug}`, priority: '0.6', changefreq: 'monthly', lastmod: today });
  });
  stateZctas.forEach(zcta => {
    ZCTA_SITEMAP_SERVICES.forEach(svc => {
      if (isZctaQualifiedForService(zcta, svc)) {
        urls.push({ loc: `${DOMAIN}/areas/${zcta.parentCitySlug}/${zcta.zip}/${svc}`, priority: svc === 'emergency' ? '0.7' : '0.6', changefreq: 'monthly', lastmod: today });
      }
    });
  });
  const chunks = chunkArray(urls, SITEMAP_URL_LIMIT);
  return chunks.map((chunk, i) => ({ chunkIndex: i, xml: buildUrlset(chunk) }));
}

export function getMainSitemapIndex() {
  const today = getToday();
  const sitemaps = [];
  const staticChunks = getStaticSitemapChunks();
  staticChunks.forEach(c => sitemaps.push({ loc: `${DOMAIN}/sitemap-static/${c.chunkIndex}.xml`, lastmod: today }));
  const cityChunks = getCitySitemapChunks();
  cityChunks.forEach(c => sitemaps.push({ loc: `${DOMAIN}/sitemap-cities/${c.chunkIndex}.xml`, lastmod: today }));
  STATES.forEach(stateObj => {
    const stateChunkCount = getStateSitemapChunks(stateObj).length;
    for (let i = 0; i < stateChunkCount; i++) {
      sitemaps.push({ loc: `${DOMAIN}/sitemap-states/${stateObj.slug}/${i}.xml`, lastmod: today });
    }
  });
  STATES.forEach(stateObj => {
    const zctaChunkCount = getZctaSitemapChunks(stateObj).length;
    for (let i = 0; i < zctaChunkCount; i++) {
      sitemaps.push({ loc: `${DOMAIN}/sitemap-zcta/${stateObj.slug}/${i}.xml`, lastmod: today });
    }
  });
  return buildSitemapIndex(sitemaps);
}
