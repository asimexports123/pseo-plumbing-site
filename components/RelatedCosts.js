import Link from 'next/link';
import { COST_PAGE_CITIES, cityToSlug } from '../lib/cities';

export function RelatedCosts({ cityName }) {
  if (!COST_PAGE_CITIES.includes(cityName)) {
    return (
      <div className="mb-10 bg-yellow-50 border border-yellow-200 rounded-xl p-5">
        <p className="text-sm text-yellow-800">
          <strong>Planning ahead?</strong>{' '}
          <Link href="/plumbing-cost-guide" className="text-blue-700 font-semibold hover:underline no-underline">
            Read the national plumbing cost guide
          </Link>{' '}
          to understand typical pricing before you call.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-10 bg-yellow-50 border border-yellow-200 rounded-xl p-5">
      <p className="text-sm text-yellow-900 mb-2">
        <strong>Planning for plumbing costs in {cityName}?</strong>
      </p>
      <p className="text-sm text-yellow-800 mb-3">
        See local, city-adjusted pricing ranges for emergency plumbing, leak repair, drain cleaning, pipe burst repair, and water heater service.
      </p>
      <Link
        href={`/cost/${cityToSlug(cityName)}`}
        className="inline-block text-sm font-semibold text-blue-700 hover:underline no-underline"
      >
        View {cityName} plumbing cost guide →
      </Link>
    </div>
  );
}
