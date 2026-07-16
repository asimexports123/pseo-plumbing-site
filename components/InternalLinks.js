import Link from 'next/link';
import { SERVICES, cityToSlug, buildSlug, getStateSlug, isCityQualifiedForService } from '../lib/cities';

const COST_CITIES = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
  'Dallas', 'San Antonio', 'San Diego', 'Austin', 'Philadelphia',
];

export function InternalLinks({ cityName, stateCode, serviceSlug, nearbyCities = [] }) {
  const recommendations = [];

  // Related services in the same city
  const relatedServices = SERVICES.filter((s) => s.slug !== serviceSlug).slice(0, 3);
  if (relatedServices.length > 0) {
    recommendations.push({
      title: `Related Plumbing Services in ${cityName}`,
      links: relatedServices.map((s) => ({
        href: `/${buildSlug(cityToSlug(cityName), s.slug)}`,
        label: `${s.name} in ${cityName}`,
      })),
    });
  }

  // Cost guide for this city
  if (COST_CITIES.includes(cityName)) {
    recommendations.push({
      title: `Plumbing Cost Guide`,
      links: [{ href: `/cost/${cityToSlug(cityName)}`, label: `${cityName} plumbing costs` }],
    });
  }

  // Same state hub
  if (stateCode) {
    recommendations.push({
      title: `More in ${stateCode}`,
      links: [{ href: `/plumber-${getStateSlug(stateCode)}`, label: `Emergency plumbers in ${stateCode}` }],
    });
  }

  // Nearby cities
  if (nearbyCities.length > 0) {
    const qualifiedNearbyCities = nearbyCities.filter(c => 
      isCityQualifiedForService(c.name, serviceSlug)
    );
    if (qualifiedNearbyCities.length > 0) {
      recommendations.push({
        title: `Nearby Cities`,
        links: qualifiedNearbyCities.slice(0, 3).map((c) => ({
          href: `/${buildSlug(cityToSlug(c.name), serviceSlug)}`,
          label: `${serviceSlug === 'emergency' ? 'Emergency plumber' : serviceSlug.replace(/-/g, ' ')} in ${c.name}`,
        })),
      });
    }
  }

  // Trust and policy links
  recommendations.push({
    title: 'Trust & Resources',
    links: [
      { href: '/', label: 'YoHomeFix homepage' },
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
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-blue-700 hover:underline no-underline">
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
