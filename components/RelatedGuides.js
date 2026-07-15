import Link from 'next/link';

const SERVICE_GUIDE_MAP = {
  'emergency': [
    { slug: 'how-to-shut-off-water-in-emergency', label: 'How to Shut Off Water in an Emergency', context: 'First step before the plumber arrives' },
    { slug: 'signs-you-need-a-plumber', label: '10 Signs You Need a Plumber', context: 'Know when to call for emergency help' },
  ],
  'leak-repair': [
    { slug: 'signs-you-need-a-plumber', label: '10 Signs You Need a Plumber', context: 'Spot hidden leaks before they spread' },
    { slug: 'how-to-shut-off-water-in-emergency', label: 'How to Shut Off Water in an Emergency', context: 'Stop active water damage fast' },
  ],
  'drain-cleaning': [
    { slug: 'signs-you-need-a-plumber', label: '10 Signs You Need a Plumber', context: 'Recognize drain warning signs' },
    { slug: 'hard-water-effects-on-plumbing', label: 'Hard Water Effects on Plumbing', context: 'How water chemistry affects drain buildup' },
  ],
  'pipe-burst-repair': [
    { slug: 'how-to-prevent-frozen-pipes', label: 'How to Prevent Frozen Pipes', context: 'Avoid the burst-pipe scenario' },
    { slug: 'how-to-shut-off-water-in-emergency', label: 'How to Shut Off Water in an Emergency', context: 'First response when a pipe bursts' },
  ],
  'water-heater-repair': [
    { slug: 'water-heater-maintenance-guide', label: 'Water Heater Maintenance Guide', context: 'Extend your water heater life' },
    { slug: 'hard-water-effects-on-plumbing', label: 'Hard Water Effects on Plumbing', context: 'How scale damages water heaters' },
  ],
};

export function RelatedGuides({ serviceSlug, cityName }) {
  const guides = SERVICE_GUIDE_MAP[serviceSlug] || SERVICE_GUIDE_MAP['emergency'];
  if (!guides || guides.length === 0) return null;

  return (
    <div className="mb-10 bg-blue-50 border border-blue-200 rounded-2xl p-5">
      <h2 className="text-lg font-bold text-blue-900 mb-3">
        {cityName ? `Helpful Plumbing Guides for ${cityName}` : 'Helpful Plumbing Guides'}
      </h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {guides.map((g) => (
          <Link
            key={g.slug}
            href={`/guides/${g.slug}`}
            className="block bg-white border border-blue-100 rounded-xl p-3 hover:border-blue-400 transition-colors no-underline group"
          >
            <p className="text-sm font-semibold text-blue-800 group-hover:text-blue-600">{g.label}</p>
            <p className="text-xs text-gray-500 mt-1">{g.context}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
