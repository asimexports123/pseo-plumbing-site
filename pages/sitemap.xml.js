import { SEED_CITIES, SERVICES, STATES, cityToSlug, buildSlug } from '../lib/cities';

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

function buildSitemapIndex(sitemaps) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(({ loc, lastmod }) => `  <sitemap>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;
}

export function buildStaticUrlset() {
  const today = new Date().toISOString().split('T')[0];
  const staticPages = [
    { loc: `${DOMAIN}/`,                  priority: '1.0', changefreq: 'weekly',  lastmod: today },
    { loc: `${DOMAIN}/plumber-usa`,       priority: '0.9', changefreq: 'weekly',  lastmod: today },
    { loc: `${DOMAIN}/about`,             priority: '0.6', changefreq: 'monthly', lastmod: today },
    { loc: `${DOMAIN}/contact`,           priority: '0.6', changefreq: 'monthly', lastmod: today },
    { loc: `${DOMAIN}/faq`,               priority: '0.7', changefreq: 'monthly', lastmod: today },
    { loc: `${DOMAIN}/disclaimer`,        priority: '0.3', changefreq: 'yearly',  lastmod: today },
    { loc: `${DOMAIN}/privacy-policy`,    priority: '0.3', changefreq: 'yearly',  lastmod: today },
    { loc: `${DOMAIN}/terms-of-service`,  priority: '0.3', changefreq: 'yearly',  lastmod: today },
    ...STATES.map((s) => ({
      loc: `${DOMAIN}/plumber-${s.slug}`,
      priority: '0.8',
      changefreq: 'weekly',
      lastmod: today,
    })),
    ...STATES.flatMap((s) =>
      SERVICES.map((svc) => ({
        loc: `${DOMAIN}/plumber/${s.slug}/${svc.slug}`,
        priority: '0.8',
        changefreq: 'weekly',
        lastmod: today,
      }))
    ),
    ...['new-york','los-angeles','chicago','houston','phoenix','dallas','san-antonio','san-diego','austin','philadelphia'].map((slug) => ({
      loc: `${DOMAIN}/cost/${slug}`,
      priority: '0.8',
      changefreq: 'monthly',
      lastmod: today,
    })),
    { loc: `${DOMAIN}/guides`, priority: '0.7', changefreq: 'monthly', lastmod: today },
    { loc: `${DOMAIN}/why-trust-yohomefix`, priority: '0.6', changefreq: 'monthly', lastmod: today },
    { loc: `${DOMAIN}/how-yohomefix-works`, priority: '0.6', changefreq: 'monthly', lastmod: today },
    { loc: `${DOMAIN}/authors`, priority: '0.5', changefreq: 'monthly', lastmod: today },
    ...['editorial-team', 'plumbing-standards-reviewer', 'home-services-researcher'].map((slug) => ({
      loc: `${DOMAIN}/authors/${slug}`,
      priority: '0.5',
      changefreq: 'monthly',
      lastmod: today,
    })),
    { loc: `${DOMAIN}/editorial-policy`, priority: '0.5', changefreq: 'monthly', lastmod: today },
    { loc: `${DOMAIN}/sources`, priority: '0.5', changefreq: 'monthly', lastmod: today },
    { loc: `${DOMAIN}/press`, priority: '0.5', changefreq: 'monthly', lastmod: today },
    { loc: `${DOMAIN}/media-kit`, priority: '0.5', changefreq: 'monthly', lastmod: today },
    ...[
      'how-to-prevent-frozen-pipes',
      'signs-you-need-a-plumber',
      'how-to-shut-off-water-in-emergency',
      'hard-water-effects-on-plumbing',
      'water-heater-maintenance-guide',
    ].map((slug) => ({
      loc: `${DOMAIN}/guides/${slug}`,
      priority: '0.7',
      changefreq: 'monthly',
      lastmod: today,
    })),
  ];
  return buildUrlset(staticPages);
}

export function buildCityUrlset() {
  const today = new Date().toISOString().split('T')[0];
  const urls = [];
  SEED_CITIES.forEach((city) => {
    const cSlug = cityToSlug(city.name);
    SERVICES.forEach((service) => {
      urls.push({
        loc: `${DOMAIN}/${buildSlug(cSlug, service.slug)}`,
        priority: service.slug === 'emergency' ? '0.9' : '0.8',
        changefreq: 'weekly',
        lastmod: today,
      });
    });
  });
  return buildUrlset(urls);
}

// Sitemap index — root /sitemap.xml points to sub-sitemaps.
// This pattern supports 50,000 URLs per sub-sitemap per Google spec.
// To scale to 1,000 cities: add more /sitemap-cities-N.xml entries here.
function generateSitemapIndex() {
  const today = new Date().toISOString().split('T')[0];
  return buildSitemapIndex([
    { loc: `${DOMAIN}/sitemap-static.xml`, lastmod: today },
    { loc: `${DOMAIN}/sitemap-cities.xml`, lastmod: today },
  ]);
}

export async function getServerSideProps({ res }) {
  const xml = generateSitemapIndex();
  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate');
  res.write(xml);
  res.end();
  return { props: {} };
}

export default function SiteMap() {
  return null;
}
