// lib/verticals/sitemapEngine.js
// Generate URL lists for any vertical. Keeps existing sitemap philosophy.

import { cityToSlug, isCityQualifiedForService as _isCityQualifiedForService } from '../cities.js';
import { buildStateHubUrl } from './router.js';
import { getTotalPlacesFromMetaSync } from '../nationwidePlaces.js';
import { getPageDate } from '../contentVersioning.js';
import { getZctasByStateSync } from '../hyperlocalPlaces-server.js';
import { ROOFING_AUTHORITY_PAGES } from '../roofing/authorityPages.js';

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || 'https://yohomefix.com';
export const SITEMAP_URL_LIMIT = 10000;

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

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

export function getVerticalStaticUrls(vertical) {
  const urls = [];
  urls.push({ loc: `${DOMAIN}${vertical.nationalHub}`, priority: '0.9', changefreq: 'weekly', lastmod: getPageDate(`static:${vertical.slug}-usa`) });
  vertical.states.forEach((s) => {
    urls.push({ loc: `${DOMAIN}${buildStateHubUrl(vertical, s.slug)}`, priority: '0.8', changefreq: 'weekly', lastmod: getPageDate(`state:${vertical.slug}:${s.slug}`) });
    vertical.services.forEach((svc) => {
      urls.push({ loc: `${DOMAIN}/${vertical.urlPrefix}/${s.slug}/${svc.slug}`, priority: '0.8', changefreq: 'monthly', lastmod: getPageDate(`state-service:${vertical.slug}:${s.slug}:${svc.slug}`) });
    });
  });

  if (vertical.slug === 'roofing') {
    ROOFING_AUTHORITY_PAGES.forEach((g) => {
      urls.push({ loc: `${DOMAIN}/roofing/guides/${g.slug}`, priority: '0.7', changefreq: 'monthly', lastmod: getPageDate(`roofing-guide:${g.slug}`) });
    });
  }

  return urls;
}

export function getVerticalCityUrls(vertical, cities, placesByState = false) {
  const urls = [];
  const isQualified = (city, svc) => {
    if (vertical.slug === 'plumbing') {
      return _isCityQualifiedForService(city.name, svc.slug, city.stateCode);
    }
    return true;
  };

  cities.forEach((city) => {
    if (!city.name) return;
    const cSlug = cityToSlug(city.name);
    if (!cSlug || /[^a-z0-9-]/.test(cSlug)) return;
    vertical.services.forEach((svc) => {
      if (isQualified(city, svc)) {
        const fullSlug = `/${vertical.urlPrefix}-${cSlug}-${svc.slug}`;
        urls.push({ loc: `${DOMAIN}${fullSlug}`, priority: svc.slug === 'emergency' ? '0.9' : '0.8', changefreq: 'monthly', lastmod: getPageDate(`city-service:${vertical.slug}:${cSlug}:${svc.slug}`) });
      }
    });
  });

  if (placesByState) {
    // Nationwide places handled by state-specific pass.
  }

  return urls;
}

export function getVerticalStateSitemapChunks(vertical, stateObj, seedCities, getPlacesByStateSync) {
  const urls = [];

  // State hub and state×service
  urls.push({ loc: `${DOMAIN}${buildStateHubUrl(vertical, stateObj.slug)}`, priority: '0.8', changefreq: 'weekly', lastmod: getPageDate(`state:${vertical.slug}:${stateObj.slug}`) });
  vertical.services.forEach((svc) => {
    urls.push({ loc: `${DOMAIN}/${vertical.urlPrefix}/${stateObj.slug}/${svc.slug}`, priority: '0.8', changefreq: 'monthly', lastmod: getPageDate(`state-service:${vertical.slug}:${stateObj.slug}:${svc.slug}`) });
  });

  // Cities in this state
  const isQualified = (place, svc) => {
    if (vertical.slug === 'plumbing') {
      return _isCityQualifiedForService(place.name, svc.slug, place.stateCode);
    }
    return true;
  };

  const seedNames = new Set(seedCities.map((c) => c.name));
  const allCities = [...seedCities];

  if (getPlacesByStateSync) {
    allCities.push(...getPlacesByStateSync(stateObj.code).filter((p) => !seedNames.has(p.name)));
  }

  allCities.forEach((city) => {
    const cSlug = city.slug || cityToSlug(city.name);
    vertical.services.forEach((svc) => {
      if (isQualified(city, svc)) {
        const fullSlug = `/${vertical.urlPrefix}-${cSlug}-${svc.slug}`;
        const priority = seedCities.some((c) => c.name === city.name) ? (svc.slug === 'emergency' ? '0.9' : '0.8') : (svc.slug === 'emergency' ? '0.9' : '0.7');
        urls.push({ loc: `${DOMAIN}${fullSlug}`, priority, changefreq: 'monthly', lastmod: getPageDate(`city-service:${vertical.slug}:${cSlug}:${svc.slug}`) });
      }
    });
  });

  return chunkArray(urls, SITEMAP_URL_LIMIT).map((chunk, i) => ({ chunkIndex: i, xml: buildUrlset(chunk) }));
}

export function getVerticalZctaSitemapChunks(vertical, stateObj, zctaServices = [], getZctasByStateSync) {
  const urls = [];
  const stateZctas = getZctasByStateSync ? getZctasByStateSync(stateObj.code) : getZctasByStateSync(stateObj.code);

  if (!stateZctas || stateZctas.length === 0) return [];

  const citySlugs = new Set();
  stateZctas.forEach((z) => citySlugs.add(z.parentCitySlug));
  citySlugs.forEach((citySlug) => {
    urls.push({ loc: `${DOMAIN}/${vertical.areasPrefix}/${citySlug}`, priority: '0.6', changefreq: 'monthly', lastmod: getPageDate(`zcta-city:${vertical.slug}:${citySlug}`) });
  });

  const zctaServiceSlugs = zctaServices.length > 0 ? zctaServices : vertical.services.map((s) => s.slug).slice(0, 6);
  stateZctas.forEach((zcta) => {
    zctaServiceSlugs.forEach((svcSlug) => {
      urls.push({ loc: `${DOMAIN}/${vertical.areasPrefix}/${zcta.parentCitySlug}/${zcta.zip}/${svcSlug}`, priority: svcSlug === 'emergency' ? '0.7' : '0.6', changefreq: 'monthly', lastmod: getPageDate(`zcta-service:${vertical.slug}:${zcta.parentCitySlug}:${zcta.zip}:${svcSlug}`) });
    });
  });

  return chunkArray(urls, SITEMAP_URL_LIMIT).map((chunk, i) => ({ chunkIndex: i, xml: buildUrlset(chunk) }));
}

export function getVerticalMainSitemapIndex(vertical, stateChunks, zctaChunks) {
  const today = getToday();
  const sitemaps = [];

  const staticUrls = getVerticalStaticUrls(vertical);
  chunkArray(staticUrls, SITEMAP_URL_LIMIT).forEach((_, i) => {
    sitemaps.push({ loc: `${DOMAIN}/sitemap-${vertical.slug}-static/${i}.xml`, lastmod: today });
  });

  stateChunks.forEach((c, i) => {
    sitemaps.push({ loc: `${DOMAIN}/sitemap-${vertical.slug}-states/${i}.xml`, lastmod: today });
  });

  zctaChunks.forEach((c, i) => {
    sitemaps.push({ loc: `${DOMAIN}/sitemap-${vertical.slug}-zcta/${i}.xml`, lastmod: today });
  });

  return buildSitemapIndex(sitemaps);
}
