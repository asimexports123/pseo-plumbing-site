import Link from 'next/link';

const ORG_LINKS = {
  EPA: 'https://www.epa.gov',
  NOAA: 'https://www.noaa.gov',
  USGS: 'https://www.usgs.gov',
  CDC: 'https://www.cdc.gov',
  'Census Bureau': 'https://www.census.gov',
  DOE: 'https://www.energy.gov',
  'Local Water Department': 'https://www.epa.gov/water-community-resources',
};

const GUIDE_SOURCES = {
  'how-to-prevent-frozen-pipes': ['NOAA', 'USGS', 'EPA', 'Local Water Department'],
  'signs-you-need-a-plumber': ['EPA', 'USGS', 'Local Water Department'],
  'how-to-shut-off-water-in-emergency': ['EPA', 'Local Water Department', 'CDC'],
  'hard-water-effects-on-plumbing': ['USGS', 'EPA', 'Local Water Department'],
  'water-heater-maintenance-guide': ['DOE', 'EPA', 'CDC'],
};

const DEFAULT_SOURCES = ['EPA', 'USGS', 'NOAA', 'Census Bureau', 'Local Water Department'];

export function Sources({ guideSlug = null, cityName = null, stateName = null, stateCode = null, pageType = 'page' }) {
  let orgs = DEFAULT_SOURCES;

  if (pageType === 'guide' && guideSlug && GUIDE_SOURCES[guideSlug]) {
    orgs = GUIDE_SOURCES[guideSlug];
  }

  if (pageType === 'guide' && !guideSlug) {
    orgs = ['EPA', 'USGS', 'Local Water Department'];
  }

  return (
    <section className="bg-gray-50 border border-gray-200 rounded-xl p-5 mt-6">
      <h2 className="text-lg font-bold text-blue-900 mb-3">Sources</h2>
      <p className="text-sm text-gray-600 mb-3">
        This {pageType === 'guide' ? 'guide' : 'page'} is based on information from the following authoritative organizations. For localized data, we also reference municipal water utilities and state licensing boards.
      </p>
      <ul className="flex flex-wrap gap-2 mb-3">
        {orgs.map((org) => (
          <li key={org}>
            <a
              href={ORG_LINKS[org] || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-3 py-1 bg-white border border-gray-200 rounded-full text-sm text-blue-700 hover:border-blue-400 transition-colors no-underline"
            >
              {org}
            </a>
          </li>
        ))}
      </ul>
      <p className="text-xs text-gray-500">
        See our full <Link href="/sources" className="text-blue-600 hover:underline no-underline">Sources & Methodology</Link> for methodology and additional references.
      </p>
      {cityName && (
        <p className="text-xs text-gray-500 mt-2">
          Local data for {cityName}{stateName || stateCode ? `, ${stateName || stateCode}` : ''} is synthesized from public records where available.
        </p>
      )}
    </section>
  );
}
