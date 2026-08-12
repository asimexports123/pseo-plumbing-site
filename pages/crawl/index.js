import Head from 'next/head';
import Link from 'next/link';
import { STATES } from '../../lib/cities';
import { getTotalPlacesSync, ensurePlacesLoaded } from '../../lib/nationwidePlaces';
import { Footer } from '../../components/Footer';

export default function CrawlIndex({ totalPlaces, states }) {
  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'https://yohomefix.com';
  const title = 'Crawl Hub — All States and Cities | YoHomeFix';
  const description = `HTML crawl index for YoHomeFix's nationwide plumbing service directory: ${totalPlaces.toLocaleString()}+ US cities and towns across all 50 states.`;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href={`${domain}/crawl`} />
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
              <li><span className="text-gray-700 font-medium">Crawl Hub</span></li>
            </ol>
          </nav>

          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900 mb-2">Crawl Hub: Nationwide City Index</h1>
          <p className="text-gray-600 mb-8">
            HTML sitemap hub for search-engine discovery. Browse all {totalPlaces.toLocaleString()} US cities and towns by state. 
            <Link href="/sitemap.xml" className="text-blue-700 hover:underline no-underline">XML sitemap index →</Link>
          </p>

          <section aria-label="All US states">
            <h2 className="text-xl font-bold text-blue-900 mb-4">States Covered</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {states.map((s) => (
                <Link
                  key={s.code}
                  href={`/crawl/${s.slug}`}
                  className="px-3 py-2 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 text-gray-700 rounded-lg text-sm no-underline transition-colors font-medium text-center"
                  title={`Crawl index for ${s.name}`}
                >
                  {s.name} <span className="text-gray-400">({s.code})</span>
                </Link>
              ))}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}

export async function getStaticProps() {
  await ensurePlacesLoaded();
  return {
    props: {
      totalPlaces: getTotalPlacesSync(),
      states: STATES.map((s) => ({ name: s.name, code: s.code, slug: s.slug })),
    },
  };
}
