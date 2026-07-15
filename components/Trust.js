import Link from 'next/link';

export function Trust({ pageType = 'page', lastReviewed = '2025-06-26', sourceCount = 8 }) {
  const labels = {
    guide: 'This guide was reviewed by the YoHomeFix editorial team.',
    cost: 'This cost guide was reviewed by the YoHomeFix editorial team.',
    state: 'This state page was reviewed by the YoHomeFix editorial team.',
    city: 'This city page was reviewed by the YoHomeFix editorial team.',
    page: 'This page was reviewed by the YoHomeFix editorial team.',
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 my-6 text-sm text-blue-900">
      <p className="font-semibold mb-1">✓ Editorial Review</p>
      <p className="text-blue-800 mb-2">
        {labels[pageType] || labels.page} Last updated: <time dateTime={lastReviewed}>{lastReviewed}</time>.
      </p>
      <p className="text-blue-800 mb-3">
        Sources referenced: {sourceCount} authoritative organizations. See <Link href="/sources" className="text-blue-700 font-semibold hover:underline no-underline">Sources & Methodology</Link>.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link href="/editorial-policy" className="inline-flex items-center text-blue-700 font-semibold hover:underline no-underline">
          Editorial Policy
        </Link>
        <Link href="/contact" className="inline-flex items-center text-blue-700 font-semibold hover:underline no-underline">
          Contact us
        </Link>
      </div>
    </div>
  );
}
