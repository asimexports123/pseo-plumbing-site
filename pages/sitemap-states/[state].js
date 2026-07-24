import {
  STATES, SEED_CITIES, SERVICES,
  cityToSlug, buildSlug,
  isCityQualifiedForService, isStateQualifiedForService,
} from '../../lib/cities';
import { getPlacesByState } from '../../lib/nationwidePlaces';

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || 'https://yohomefix.com';

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

function generateStateSitemap(stateObj) {
  const today = new Date().toISOString().split('T')[0];
  const urls = [];

  urls.push({
    loc: `${DOMAIN}/plumber-${stateObj.slug}`,
    priority: '0.8',
    changefreq: 'weekly',
    lastmod: today,
  });

  SERVICES.forEach(svc => {
    if (isStateQualifiedForService(stateObj.code, svc.slug)) {
      urls.push({
        loc: `${DOMAIN}/plumber/${stateObj.slug}/${svc.slug}`,
        priority: '0.8',
        changefreq: 'weekly',
        lastmod: today,
      });
    }
  });

  const seedCitiesForState = SEED_CITIES.filter(c => c.stateCode === stateObj.code);
  seedCitiesForState.forEach(city => {
    const cSlug = cityToSlug(city.name);
    SERVICES.forEach(svc => {
      if (isCityQualifiedForService(city.name, svc.slug)) {
        urls.push({
          loc: `${DOMAIN}/${buildSlug(cSlug, svc.slug)}`,
          priority: svc.slug === 'emergency' ? '0.9' : '0.8',
          changefreq: 'weekly',
          lastmod: today,
        });
      }
    });
  });

  const seedCityNames = new Set(seedCitiesForState.map(c => c.name));
  const statePlaces = getPlacesByState(stateObj.code).filter(p => !seedCityNames.has(p.name));
  statePlaces.forEach(place => {
    SERVICES.forEach(svc => {
      if (isCityQualifiedForService(place.name, svc.slug)) {
        urls.push({
          loc: `${DOMAIN}/${buildSlug(place.slug, svc.slug)}`,
          priority: svc.slug === 'emergency' ? '0.9' : '0.7',
          changefreq: 'weekly',
          lastmod: today,
        });
      }
    });
  });

  return buildUrlset(urls);
}

export async function getServerSideProps({ res, params }) {
  const { state } = params;
  const stateObj = STATES.find(s => s.slug === state);
  if (!stateObj) {
    res.statusCode = 404;
    res.end();
    return { props: {} };
  }

  const xml = generateStateSitemap(stateObj);
  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate');
  res.write(xml);
  res.end();
  return { props: {} };
}

export default function StateSitemap() {
  return null;
}
