import Head from 'next/head';
import Link from 'next/link';
import { SERVICES, cityToSlug, buildSlug, getStateSlug } from '../../../lib/cities';
import { getCityBySlug } from '../../../lib/cities-server';
import { getZctasByCity, getCitiesWithZctas } from '../../../lib/hyperlocalPlaces-server';
import { Footer } from '../../../components/Footer';
import { EditorialFooter } from '../../../components/EditorialFooter';
import { Author } from '../../../components/Author';
import { buildOrganizationSchema, buildWebSiteSchema } from '../../../lib/schemas';

export async function getStaticPaths() {
  const citySlugs = getCitiesWithZctas();
  const paths = citySlugs.map(citySlug => ({ params: { citySlug } }));
  return { paths, fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const { citySlug } = params;

  const knownCity = getCityBySlug(citySlug);
  if (!knownCity) {
    return { notFound: true };
  }

  const zctas = getZctasByCity(citySlug);
  if (zctas.length === 0) {
    return { notFound: true };
  }

  const cityName = knownCity.name;
  const stateCode = knownCity.stateCode;
  const stateName = zctas[0].state;

  return {
    props: {
      cityName,
      stateCode,
      stateName,
      citySlug,
      zipCount: zctas.length,
      zctas: zctas.map(z => ({ zip: z.zip, lat: z.lat, lon: z.lon })),
    },
  };
}

export default function CityZipDirectory({ cityName, stateCode, stateName, citySlug, zipCount, zctas }) {
  const title = `ZIP Codes Served in ${cityName}, ${stateCode} | YoHomeFix`;
  const description = `YoHomeFix serves ${zipCount} ZIP Code areas in ${cityName}, ${stateCode}. Find plumbing services in your neighborhood — emergency plumber, leak repair, drain cleaning, and more.`;
  const canonical = `https://yohomefix.com/areas/${citySlug}`;
  const stateHubSlug = `plumber-${getStateSlug(stateCode)}`;
  const cityServiceSlug = buildSlug(cityToSlug(cityName), 'emergency');

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonical} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildOrganizationSchema()) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildWebSiteSchema()) }} />
      </Head>

      {/* Sticky mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden" style={{ height: 64, background: '#dc2626' }}>
        <a
          href="tel:1"
          data-track="zip-dir-sticky-mobile"
          className="flex items-center justify-center gap-3 h-full w-full"
          style={{ color: '#ffffff', fontWeight: 900, fontSize: '1.2rem', letterSpacing: '0.01em', textDecoration: 'none' }}
          aria-label="Call emergency dispatch"
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.6)', flexShrink: 0 }}>📞</span>
          <span>CALL NOW — 24/7 Emergency</span>
        </a>
      </div>

      <div className="font-sans bg-white min-h-screen flex flex-col pb-16 md:pb-0">
        {/* Header */}
        <nav className="bg-blue-900 text-white px-4 py-3 flex justify-between items-center sticky top-0 z-40 shadow-lg">
          <Link href="/" className="text-2xl font-extrabold text-white no-underline">YoHomeFix</Link>
          <a href="tel:1" data-track="zip-dir-nav" className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-full font-bold transition-colors no-underline" aria-label="Call emergency dispatch">
            <span aria-hidden="true">📞</span> Call Now
          </a>
        </nav>

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="max-w-4xl mx-auto w-full px-4 py-2 text-sm text-gray-600">
          <ol className="flex flex-wrap items-center gap-1">
            <li><Link href="/" className="text-blue-700 hover:underline no-underline">Home</Link></li>
            <li><span className="text-gray-400 mx-1" aria-hidden="true">›</span></li>
            <li><Link href="/plumber-usa" className="text-blue-700 hover:underline no-underline">All Cities</Link></li>
            <li><span className="text-gray-400 mx-1" aria-hidden="true">›</span></li>
            <li><Link href={`/${stateHubSlug}`} className="text-blue-700 hover:underline no-underline">{stateCode}</Link></li>
            <li><span className="text-gray-400 mx-1" aria-hidden="true">›</span></li>
            <li><Link href={`/${cityServiceSlug}`} className="text-blue-700 hover:underline no-underline">{cityName}</Link></li>
            <li><span className="text-gray-400 mx-1" aria-hidden="true">›</span></li>
            <li><span className="text-gray-800 font-medium" aria-current="page">ZIP Codes</span></li>
          </ol>
        </nav>

        {/* Hero */}
        <section className="bg-gradient-to-br from-blue-900 to-blue-700 text-white px-4 py-10 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
              ZIP Codes Served in {cityName}, {stateCode}
            </h1>
            <p className="text-lg text-blue-50 mb-2">
              {zipCount} ZIP Code areas in {cityName}, {stateName}
            </p>
            <p className="text-sm text-blue-100 mb-6">
              Select your ZIP Code to find plumbing services in your area of {cityName}.
            </p>
            <a href="tel:1" data-track="zip-dir-hero" className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-full text-xl font-extrabold shadow-xl transition-transform hover:scale-105 no-underline" aria-label="Call emergency dispatch now">
              <span aria-hidden="true">📞</span> Get Emergency Help
            </a>
          </div>
        </section>

        <main className="max-w-4xl mx-auto w-full px-4 py-8 md:py-12">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Areas We Serve in {cityName}</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              YoHomeFix connects homeowners across {cityName} with licensed plumbing professionals. We serve {zipCount} ZIP Code areas throughout {cityName}. Select your ZIP Code below to find plumbing services available in your area.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {zctas.map(z => (
                <Link
                  key={z.zip}
                  href={`/areas/${citySlug}/${z.zip}/emergency`}
                  className="px-3 py-2 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 text-gray-700 rounded-lg text-sm no-underline transition-colors font-medium text-center"
                >
                  {z.zip}
                </Link>
              ))}
            </div>
          </section>

          {/* Service-specific ZIP browsing */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-blue-900 mb-3">Browse {cityName} ZIP Codes by Service</h2>
            <p className="text-gray-600 text-sm mb-4">
              Select a service to view all ZIP Code areas in {cityName} where that service is available.
            </p>
            <div className="flex flex-wrap gap-2">
              {SERVICES.map(s => (
                <Link
                  key={s.slug}
                  href={`/${buildSlug(citySlug, s.slug)}`}
                  className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm no-underline transition-colors font-medium"
                >
                  {s.shortName} in {cityName}
                </Link>
              ))}
            </div>
          </section>

          {/* Back to city page */}
          <section className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
            <h2 className="text-xl font-bold text-blue-900 mb-2">Full {cityName} Coverage</h2>
            <p className="text-gray-600 text-sm mb-4">
              View all plumbing services available throughout {cityName}, {stateCode}
            </p>
            <Link
              href={`/${cityServiceSlug}`}
              className="inline-block bg-blue-900 text-white px-6 py-3 rounded-full font-bold hover:bg-blue-800 transition-colors no-underline"
            >
              Emergency Plumber in {cityName} →
            </Link>
          </section>

          <EditorialFooter pageType="zip-directory" />
          <Author pageType="zip-directory" />
        </main>

        <Footer />
      </div>
    </>
  );
}
