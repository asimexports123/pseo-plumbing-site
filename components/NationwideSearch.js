import { useState, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import { buildSlug } from '../lib/cities';
import { TOTAL_PLACES } from '../lib/nationwidePlaces';

const MIN_CHARS = 2;
const MAX_RESULTS = 50;
const MAX_ZIP_RESULTS = 30;

export function NationwideSearch() {
  const [query, setQuery] = useState('');
  const [places, setPlaces] = useState(null);
  const [zctaData, setZctaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const inputRef = useRef(null);
  const fetchedRef = useRef(false);

  const doFetch = useCallback(async () => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    setLoading(true);
    setError(false);
    try {
      const [placesRes, zctaRes] = await Promise.all([
        fetch('/nationwide-places.json').then(r => r.json()),
        fetch('/zcta-search.json').then(r => r.json()),
      ]);
      setPlaces(placesRes);
      setZctaData(zctaRes);
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const onChange = useCallback((e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.trim().length >= MIN_CHARS && !fetchedRef.current) {
      doFetch();
    }
  }, [doFetch]);

  const onClear = useCallback(() => {
    setQuery('');
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (q.length < MIN_CHARS || !places) return { cities: [], zips: [] };
    const cities = places
      .filter(p => p.n.toLowerCase().includes(q) || p.s.toLowerCase().includes(q))
      .slice(0, MAX_RESULTS);
    const zips = zctaData
      ? zctaData
          .filter(z => z.z.startsWith(q) || z.n.toLowerCase().includes(q))
          .slice(0, MAX_ZIP_RESULTS)
      : [];
    return { cities, zips };
  }, [query, places, zctaData]);

  const totalCount = results.cities.length + results.zips.length;
  const showResults = query.trim().length >= MIN_CHARS;

  return (
    <div className="max-w-lg mx-auto">
      <label htmlFor="directory-search" className="sr-only">Search by city, state, or service</label>
      <div className="relative">
        <input
          id="directory-search"
          ref={inputRef}
          type="search"
          value={query}
          onChange={onChange}
          placeholder="Search 19,000+ cities, towns, ZIP codes, or states — e.g. Chicago, 90210, Texas"
          className="w-full pl-12 pr-10 py-4 rounded-xl border-2 border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 outline-none text-gray-900 text-base"
        />
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg" aria-hidden="true">🔍</span>
        {query && (
          <button
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800 p-1 rounded"
            aria-label="Clear search"
          >
            <span aria-hidden="true">✕</span>
          </button>
        )}
      </div>
      <p className="text-center text-gray-600 text-sm mt-2" aria-live="polite">
        {!showResults
          ? `${TOTAL_PLACES.toLocaleString()}+ cities & towns — search or browse below`
          : loading
            ? 'Loading nationwide directory…'
            : error
              ? 'Unable to load search data. Please try again.'
              : totalCount === 0
                ? `No locations found for "${query}"`
                : `${totalCount} ${totalCount === 1 ? 'location' : 'locations'} found`}
      </p>

      {showResults && !loading && !error && (
        <div className="mt-4 space-y-4">
          {results.cities.length > 0 && (
            <div className="border border-blue-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-blue-50">
                <p className="font-semibold text-blue-900 text-sm">
                  {totalCount > results.cities.length
                    ? `Cities & towns matching "${query}" (${results.cities.length} shown)`
                    : `Locations matching "${query}" (${results.cities.length} shown)`}
                </p>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {results.cities.map((place) => (
                    <Link
                      key={place.u}
                      href={`/${buildSlug(place.u, 'emergency')}`}
                      className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg text-xs no-underline transition-colors font-medium"
                      title={`Emergency plumber in ${place.n}, ${place.s}`}
                    >
                      {place.n}, {place.s}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
          {results.zips.length > 0 && (
            <div className="border border-green-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-green-50">
                <p className="font-semibold text-green-900 text-sm">
                  ZIP Codes matching &quot;{query}&quot; ({results.zips.length} shown)
                </p>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {results.zips.map((z) => (
                    <Link
                      key={z.z}
                      href={`/areas/${z.u}/${z.z}/emergency`}
                      className="px-3 py-2 bg-green-50 hover:bg-green-100 text-green-800 rounded-lg text-xs no-underline transition-colors font-medium"
                      title={`Emergency plumber in ZIP ${z.z} — ${z.n}, ${z.s}`}
                    >
                      {z.z} — {z.n}, {z.s}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
