import { STATES } from '../../lib/cities';
import { getZctasByState, isZctaQualifiedForService, SERVICE_SLUGS } from '../../lib/hyperlocalPlaces';

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

function generateStateZctaSitemap(stateObj) {
  const today = new Date().toISOString().split('T')[0];
  const urls = [];

  const stateZctas = getZctasByState(stateObj.code);

  // Group ZCTAs by parent city slug for directory pages
  const citySlugs = new Set();
  stateZctas.forEach(z => citySlugs.add(z.parentCitySlug));

  // Add city ZIP directory pages
  citySlugs.forEach(citySlug => {
    urls.push({
      loc: `${DOMAIN}/areas/${citySlug}`,
      priority: '0.6',
      changefreq: 'monthly',
      lastmod: today,
    });
  });

  // Add ZIP-service URLs
  stateZctas.forEach(zcta => {
    SERVICE_SLUGS.forEach(svc => {
      if (isZctaQualifiedForService(zcta, svc)) {
        urls.push({
          loc: `${DOMAIN}/areas/${zcta.parentCitySlug}/${zcta.zip}/${svc}`,
          priority: svc === 'emergency' ? '0.7' : '0.6',
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

  const xml = generateStateZctaSitemap(stateObj);
  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate');
  res.write(xml);
  res.end();
  return { props: {} };
}

export default function StateZctaSitemap() {
  return null;
}
