import Link from 'next/link';
import { SERVICES, SEED_CITIES, STATES, cityToSlug, buildSlug, getStateSlug, isCityQualifiedForService } from '../lib/cities';
import { getRelatedServices, getCrawlHubPath } from '../lib/crawl';
import { isZctaQualifiedForService } from '../lib/hyperlocalPlaces';
import { HIGH_PRIORITY_SLUGS } from '../lib/prioritySeo';

const COST_CITIES = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
  'Dallas', 'San Antonio', 'San Diego', 'Austin', 'Philadelphia',
];

function displayFromSlug(slug) {
  const noPrefix = slug.replace(/^plumber-/, '');
  const sortedServices = [...SERVICES].sort((a, b) => b.slug.length - a.slug.length);
  const service = sortedServices.find(s => noPrefix.endsWith(`-${s.slug}`));
  const citySlug = service ? noPrefix.slice(0, -(service.slug.length + 1)) : noPrefix;
  const state = STATES.find(s => s.slug === citySlug);
  if (state) return { label: `Plumbers in ${state.name}`, isState: true };
  const seed = SEED_CITIES.find(c => cityToSlug(c.name) === citySlug);
  const placeName = seed ? seed.name : citySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  return service
    ? { label: `${service.shortName} in ${placeName}`, isState: false }
    : { label: `Plumbers in ${placeName}`, isState: false };
}

// Clean city name for labels when it carries a state suffix
function displayCity(cityName, stateCode) {
  if (!cityName || !stateCode) return cityName;
  const suffixes = [` ${stateCode}`, stateCode];
  for (const suffix of suffixes) {
    if (cityName.endsWith(suffix)) return cityName.slice(0, -suffix.length).trim();
  }
  return cityName;
}

export function CrawlLinks({
  cityName,
  stateCode,
  serviceSlug = 'emergency',
  nearbyCities = [],
  zip = null,
  nearbyZips = [],
  pageSlug,
}) {
  if (!cityName) return null;

  const recommendations = [];
  const cleanCity = displayCity(cityName, stateCode);
  const citySlug = cityToSlug(cityName);
  const stateHubSlug = stateCode ? `plumber-${getStateSlug(stateCode)}` : null;
  const cityEmergencySlug = buildSlug(citySlug, 'emergency');
  const currentService = SERVICES.find(s => s.slug === serviceSlug) || { name: 'Emergency Plumbing', shortName: 'Emergency' };

  // Parent city (for non-emergency service pages)
  if (serviceSlug !== 'emergency') {
    recommendations.push({
      title: `${cleanCity} overview`,
      links: [
        { href: `/${cityEmergencySlug}`, label: `Emergency plumber in ${cleanCity}` },
      ],
    });
  }

  // Parent state hub
  if (stateHubSlug) {
    const stateSlug = getStateSlug(stateCode);
    recommendations.push({
      title: `More in ${stateCode}`,
      links: [
        { href: { pathname: '/states/[state]', query: { state: stateSlug } }, as: `/${stateHubSlug}`, label: `Plumbers in ${stateCode}` },
        ...(getCrawlHubPath(stateCode) ? [{ href: getCrawlHubPath(stateCode), label: `All cities in ${stateCode}` }] : []),
      ],
    });
  }

  // Other plumbing services in the same city/ZIP
  const otherServices = SERVICES.filter(s => {
    if (s.slug === serviceSlug) return false;
    if (zip) {
      return isZctaQualifiedForService({ stateCode }, s.slug);
    }
    return isCityQualifiedForService(cityName, s.slug, stateCode);
  }).slice(0, 8);

  if (otherServices.length > 0) {
    recommendations.push({
      title: `Other services in ${cleanCity}${zip ? ` ZIP ${zip}` : ''}`,
      links: otherServices.map(s => ({
        href: zip ? `/areas/${citySlug}/${zip}/${s.slug}` : `/${buildSlug(citySlug, s.slug)}`,
        label: `${s.shortName} in ${cleanCity}`,
      })),
    });
  }

  // Related services (priority order)
  const relatedServices = getRelatedServices(serviceSlug, 4)
    .filter(s => !otherServices.find(o => o.slug === s.slug));
  if (relatedServices.length > 0) {
    recommendations.push({
      title: `Related services for ${cleanCity}`,
      links: relatedServices
        .filter(s => isCityQualifiedForService(cityName, s.slug, stateCode))
        .map(s => ({
          href: `/${buildSlug(citySlug, s.slug)}`,
          label: `${s.shortName} in ${cleanCity}`,
        })),
    });
  }

  // Nearby cities for the same service
  if (nearbyCities.length > 0) {
    recommendations.push({
      title: `Same service in nearby cities`,
      links: nearbyCities.slice(0, 8).map(c => {
        const name = displayCity(c.name, c.stateCode);
        return {
          href: `/${buildSlug(c.slug, serviceSlug)}`,
          label: `${currentService.shortName} in ${name}, ${c.stateCode}`,
        };
      }),
    });
  }

  // Nearby ZIP codes (hyperlocal pages only)
  if (zip && nearbyZips.length > 0) {
    recommendations.push({
      title: `Nearby ZIP codes for ${currentService.shortName}`,
      links: nearbyZips.slice(0, 8).map(nz => ({
        href: `/areas/${citySlug}/${nz.zip}/${serviceSlug}`,
        label: `${currentService.shortName} in ZIP ${nz.zip}, ${nz.parentCity || cleanCity}`,
      })),
    });
  }

  // Cost guide for this city
  if (COST_CITIES.includes(cityName)) {
    recommendations.push({
      title: 'Plumbing Cost Guide',
      links: [{ href: `/cost/${citySlug}`, label: `${cleanCity} plumbing costs` }],
    });
  }

  // High-priority service areas from the Decision Engine for PageRank distribution
  const priorityLinks = HIGH_PRIORITY_SLUGS
    .filter(s => s !== pageSlug)
    .slice(0, 12)
    .map(s => {
      const { label } = displayFromSlug(s);
      return { href: `/${s}`, label };
    });
  if (priorityLinks.length > 0) {
    recommendations.push({
      title: 'High-Priority Service Areas',
      links: priorityLinks,
    });
  }

  // Trust / policy
  recommendations.push({
    title: 'Trust & Resources',
    links: [
      { href: '/', label: 'YoHomeFix homepage' },
      { href: '/plumber-usa', label: 'Browse all US cities' },
      { href: '/editorial-policy', label: 'Editorial policy' },
      { href: '/sources', label: 'Sources & methodology' },
    ],
  });

  if (recommendations.length === 0) return null;

  return (
    <div className="mb-10 border border-gray-200 rounded-2xl p-5">
      <h2 className="text-lg font-bold text-blue-900 mb-4">Related Pages</h2>
      <div className="grid sm:grid-cols-2 gap-5">
        {recommendations.map((rec) => (
          <div key={rec.title}>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">{rec.title}</h3>
            <ul className="space-y-1">
              {rec.links.map((l) => (
                <li key={l.as || (typeof l.href === 'string' ? l.href : l.href.pathname)}>
                  <Link href={l.href} as={l.as} className="text-sm text-blue-700 hover:underline no-underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
