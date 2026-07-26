import Head from 'next/head';
import Link from 'next/link';
import { STATES, buildSlug } from '../../lib/cities';
import { getSeedCitiesForState, getAdditionalPlacesForState, groupPlacesByLetter } from '../../lib/crawl';
import { Footer } from '../../components/Footer';

const MAX_SEED_ON_HUB = 50;

export default function StateCrawl({ stateObj, seedCities, additionalGroups, totalCount }) {
  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'https://yohomefix.com';
  const title = `Crawl Index: ${stateObj.name} Cities and Towns | YoHomeFix`;
  const description = `HTML crawl index for ${stateObj.name} — ${totalCount.toLocaleString()} cities and towns with emergency plumber coverage. Browse A-Z.`;

  const majorCities = seedCities.slice(0, MAX_SEED_ON_HUB);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href={`${domain}/crawl/${stateObj.slug}`} />
      </Head>

      <div className="font-sans bg-white min-h-screen flex flex-col">
        <nav className="bg-blue-900 text-white px-4 py-3 flex justify-between items-center sticky top-0 z-40 shadow-lg">
          <Link href="/" className="text-2xl font-extrabold text-white no-underline">YoHomeFix</Link>
          <Link href="/plumber-usa" className="text-white text-sm font-semibold hover:underline no-underline">All Cities</Link>
        </nav>

        <main className="max-w-5xl mx-auto w-full px-4 py-10 flex-1">
          <nav aria-label="Breadcrumb" className="text-sm text-gray-500 mb-6">
            <ol className="flex flex-wrap items-center gap-1">
              <li><Link href="/" className="text-blue-600 hover:underline no-underline">Home</Link></li>
              <li><span className="text-gray-300">›</span></li>
              <li><Link href="/crawl" className="text-blue-600 hover:underline no-underline">Crawl Hub</Link></li>
              <li><span className="text-gray-300">›</span></li>
              <li><span className="text-gray-700 font-medium">{stateObj.name}</span></li>
            </ol>
          </nav>

          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900 mb-2">Crawl Index: {stateObj.name}</h1>
          <p className="text-gray-600 mb-8">
            {totalCount.toLocaleString()} cities and towns in {stateObj.name} with YoHomeFix emergency plumber coverage. 
            <Link href={`/plumber-${stateObj.slug}`} className="text-blue-700 hover:underline no-underline">View {stateObj.name} state page →</Link>
          </p>

          {majorCities.length > 0 && (
            <section className="mb-10" aria-label="Major cities">
              <h2 className="text-xl font-bold text-blue-900 mb-4">Major Cities</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {majorCities.map((city) => (
                  <Link
                    key={city.name}
                    href={`/${buildSlug(city.slug, 'emergency')}`}
                    className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm no-underline transition-colors text-center"
                    title={`Emergency plumber in ${city.name}, ${city.stateCode}`}
                  >
                    {city.name}
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section aria-label="Additional cities and towns by letter">
            <h2 className="text-xl font-bold text-blue-900 mb-4">All {stateObj.name} Cities & Towns (A-Z)</h2>
            {additionalGroups.length === 0 && (
              <p className="text-gray-500 text-sm">All covered cities are listed above.</p>
            )}
            <div className="space-y-2">
              {additionalGroups.map((group) => (
                <details key={group.letter} className="border border-gray-200 rounded-xl overflow-hidden group">
                  <summary className="cursor-pointer px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center gap-3 list-none [&::-webkit-details-marker]:hidden">
                    <span className="font-semibold text-blue-900 w-8">{group.letter}</span>
                    <span className="text-gray-600 text-xs flex-1">{group.places.length} {group.places.length === 1 ? 'location' : 'locations'}</span>
                    <span className="text-gray-400 text-sm">click to expand</span>
                  </summary>
                  <div className="p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                      {group.places.map((place) => (
                        <Link
                          key={place.slug}
                          href={`/${buildSlug(place.slug, 'emergency')}`}
                          className="px-3 py-2 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 text-gray-700 rounded-lg text-sm no-underline transition-colors text-center"
                          title={`Emergency plumber in ${place.name}, ${place.stateCode}`}
                        >
                          {place.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}

export async function getStaticPaths() {
  return {
    paths: STATES.map((s) => ({ params: { state: s.slug } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const stateObj = STATES.find((s) => s.slug === params.state);
  if (!stateObj) return { notFound: true };

  const seedCities = getSeedCitiesForState(stateObj.code);
  const additional = getAdditionalPlacesForState(stateObj.code);
  const additionalGroups = groupPlacesByLetter(additional);
  const totalCount = seedCities.length + additional.length;

  return {
    props: {
      stateObj,
      seedCities: seedCities.map((c) => ({ name: c.name, slug: c.slug, stateCode: c.stateCode })),
      additionalGroups,
      totalCount,
    },
  };
}
