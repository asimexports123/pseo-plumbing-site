import Head from 'next/head';

import Link from 'next/link';

import {

  STATES, SEED_CITIES, SERVICES, PHONE_NUMBER,

  cityToSlug, buildSlug, CITY_DATA, isCityQualifiedForService, COST_PAGE_CITIES,

} from '../../lib/cities';

import { RelatedGuides } from '../../components/RelatedGuides';

import { EditorialFooter } from '../../components/EditorialFooter';

import { Footer } from '../../components/Footer';

import { Author } from '../../components/Author';

import { Trust } from '../../components/Trust';

import { Sources } from '../../components/Sources';

import { buildOrganizationSchema, buildWebSiteSchema, buildPersonSchema } from '../../lib/schemas';

import { STATE_INTROS } from '../../lib/stateIntros';

import { getDeterministicLastReviewed } from '../../lib/dateUtils';



export async function getStaticPaths() {

  return {

    paths: STATES.map((s) => ({ params: { state: s.slug } })),

    fallback: false,

  };

}



export async function getStaticProps({ params }) {

  const stateObj = STATES.find((s) => s.slug === params.state);

  if (!stateObj) return { notFound: true };

  const stateCities = SEED_CITIES.filter((c) => c.stateCode === stateObj.code);

  return { props: { stateObj, stateCities } };

}



export default function StatePage({ stateObj, stateCities }) {

  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'https://yohomefix.com';

  // Canonical is the public-facing /plumber-{state} URL (rewrite target)

  const canonical = `${domain}/plumber-${stateObj.slug}`;

  const title = `Emergency Plumber in ${stateObj.name} | 24 Hour Plumbing Service | YoHomeFix`;

  const description = `Burst pipe or flooding in ${stateObj.name}? YoHomeFix dispatches a licensed emergency plumber in under 60 min — live dispatcher answers 24/7 across all of ${stateObj.name}, no overtime charges. Call now.`;

  const stateIntro = STATE_INTROS[stateObj.slug] || STATE_INTROS['new-york'];

  const lastReviewed = getDeterministicLastReviewed(`state-${stateObj.slug}`);



  const breadcrumbs = [

    { name: 'Home', url: `${domain}/` },

    { name: `Plumber ${stateObj.name}`, url: canonical },

  ];



  const schema = {

    '@context': 'https://schema.org',

    '@graph': [

      {

        '@type': 'BreadcrumbList',

        itemListElement: breadcrumbs.map((b, i) => ({

          '@type': 'ListItem', position: i + 1, name: b.name, item: b.url,

        })),

      },

      {

        '@type': 'PlumbingService',

        name: 'YoHomeFix',

        description,

        telephone: PHONE_NUMBER,

        url: canonical,

        priceRange: '$$',

        areaServed: { '@type': 'State', name: stateObj.name },

      },

      {

        '@type': 'ItemList',

        name: `Cities Served in ${stateObj.name}`,

        itemListElement: stateCities.map((city, i) => ({

          '@type': 'ListItem',

          position: i + 1,

          name: city.name,

          url: `${domain}/${buildSlug(cityToSlug(city.name), 'emergency')}`,

        })),

      },

      buildOrganizationSchema(),

      buildWebSiteSchema(),

      {

        '@type': 'Article',

        '@id': `${canonical}#article`,

        headline: title,

        description,

        url: canonical,

        datePublished: '2025-01-15',

        dateModified: lastReviewed,

        author: buildPersonSchema({

          slug: 'plumbing-standards-reviewer',

          name: 'Plumbing Standards Reviewer',

          title: 'Plumbing Standards Reviewer',

          bio: 'The Plumbing Standards Reviewer verifies that all state and city plumbing content on YoHomeFix reflects current codes, regional failure patterns, and safe emergency practices.',

          expertise: ['Residential plumbing codes', 'Regional plumbing failure patterns', 'Water system research', 'Emergency repair protocols'],

          image: `${domain}/og-image.png`,

        }),

        publisher: { '@type': 'Organization', name: 'YoHomeFix', url: domain },

      },

    ],

  };



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

        <meta property="og:image" content={`${domain}/og-image.png`} />

        <meta name="twitter:card" content="summary_large_image" />

        <meta name="twitter:title" content={title} />

        <meta name="twitter:description" content={description} />

        <meta name="twitter:image" content={`${domain}/og-image.png`} />

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      </Head>



      {/* Sticky mobile CTA */}

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-red-600 md:hidden" style={{ height: 64 }}>

        <a href={`tel:${PHONE_NUMBER}`} className="flex items-center justify-center gap-3 h-full text-white font-extrabold text-xl w-full" aria-label="Call emergency dispatch">

          📞 CALL NOW — 24/7

        </a>

      </div>



      <div className="font-sans bg-white min-h-screen flex flex-col pb-16 md:pb-0">



        {/* Header */}

        <nav className="bg-blue-900 text-white px-4 py-3 flex justify-between items-center sticky top-0 z-40 shadow-lg">

          <Link href="/" className="text-2xl font-extrabold text-white no-underline">YoHomeFix</Link>

          <a href={`tel:${PHONE_NUMBER}`} className="hidden md:flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-full font-bold" aria-label="Call emergency dispatch">

            📞 Call Now

          </a>

          <a href={`tel:${PHONE_NUMBER}`} className="md:hidden bg-red-600 text-white px-4 py-2 rounded-full font-bold text-sm" aria-label="Call emergency dispatch">Call Now</a>

        </nav>



        {/* Trust bar */}

        <div className="bg-blue-950 text-white py-2 px-4 text-center text-xs font-semibold">

          ✅ Licensed & Insured · ⏱️ 60-Min Response · 💰 Upfront Pricing · 📞 24/7 Dispatch

        </div>



        {/* Breadcrumb */}

        <nav aria-label="Breadcrumb" className="max-w-4xl mx-auto w-full px-4 py-2 text-sm text-gray-500">

          <ol className="flex flex-wrap items-center gap-1">

            {breadcrumbs.map((b, i) => (

              <li key={b.url} className="flex items-center gap-1">

                {i > 0 && <span className="text-gray-300">›</span>}

                {i < breadcrumbs.length - 1

                  ? <Link href={b.url.replace(domain, '')} className="text-blue-600 hover:underline no-underline">{b.name}</Link>

                  : <span className="text-gray-700 font-medium">{b.name}</span>}

              </li>

            ))}

          </ol>

        </nav>



        {/* Hero */}

        <section className="bg-gradient-to-br from-blue-900 to-blue-700 text-white px-4 py-12 text-center">

          <div className="max-w-3xl mx-auto">

            <div className="inline-block bg-red-600 text-sm font-bold px-3 py-1 rounded-full mb-4">⚡ 24/7 Emergency Available in {stateObj.name}</div>

            <h1 className="text-3xl md:text-5xl font-extrabold mb-4">

              Emergency Plumber in {stateObj.name}

            </h1>

            <p className="speakable-intro text-lg text-white mb-6 max-w-2xl mx-auto">

              In {stateObj.name}, {stateObj.fact}. YoHomeFix connects you with a licensed local plumber in under 60 minutes — 24/7, no overtime surcharges.

            </p>

            <a href={`tel:${PHONE_NUMBER}`} className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white px-8 py-5 rounded-full text-xl font-extrabold shadow-xl transition-transform hover:scale-105" aria-label="Call emergency dispatch">

              📞 Get Emergency Help

            </a>

            <p className="text-white text-sm mt-3">Live dispatcher — answered 24/7</p>

            <div className="flex flex-wrap justify-center gap-3 mt-6 text-sm">

              {['✅ Licensed & Insured', '⏱️ 60-Min Response', '💰 Upfront Pricing', '📞 No Hold Queues'].map((b) => (

                <span key={b} className="bg-blue-800 text-blue-100 px-3 py-1 rounded-full">{b}</span>

              ))}

            </div>

          </div>

        </section>



        <main className="max-w-4xl mx-auto w-full px-4 py-10">



          {/* AI-friendly key takeaways */}

          <div className="mb-8 bg-green-50 border border-green-200 rounded-2xl p-5">

            <h2 className="text-lg font-bold text-green-900 mb-3">Key Takeaways for {stateObj.name} Homeowners</h2>

            <ul className="space-y-2 text-sm text-green-800">

              <li className="flex gap-2"><span className="font-bold">✓</span> YoHomeFix dispatches licensed plumbers 24/7 across {stateObj.name}.</li>

              <li className="flex gap-2"><span className="font-bold">✓</span> Local conditions: {stateObj.fact}.</li>

              <li className="flex gap-2"><span className="font-bold">✓</span> Call connects to a live dispatcher; a technician provides a written quote before any work begins.</li>

            </ul>

          </div>



          {/* State intro */}

          <div className="mb-10 bg-blue-50 border border-blue-200 rounded-2xl p-6">

            <h2 className="text-2xl font-bold text-blue-900 mb-3">Plumbing Services Across {stateObj.name}</h2>

            <div className="text-gray-700 leading-relaxed whitespace-pre-line">

              {stateIntro}

            </div>

          </div>



          {/* State-specific deep content */}

          <div className="mb-12 space-y-8">

            <div>

              <h2 className="text-2xl font-bold text-blue-900 mb-3">Why Plumbing Conditions Vary Across {stateObj.name}</h2>

              <p className="text-gray-700 leading-relaxed">

                Plumbing in {stateObj.name} is not uniform. Urban centers, older suburbs, rural areas, and coastal zones each have different pipe materials,

                water sources, and soil conditions. The age of local housing stock determines whether a home has cast iron, galvanized steel, copper, or PVC.

                Licensed plumbers in {stateObj.name} must follow state code while also understanding local water chemistry, freeze risk, and drainage patterns.

                Matching a homeowner with a technician who works in the same region improves diagnostic speed and repair durability.

              </p>

            </div>

            <div>

              <h2 className="text-2xl font-bold text-blue-900 mb-3">Most Common Plumbing Emergencies in {stateObj.name}</h2>

              <p className="text-gray-700 leading-relaxed mb-4">

                The most frequent emergency calls in {stateObj.name} are burst pipes, severe leaks, water heater failures, sewer backups, and clogged drains.

                These problems cluster around predictable triggers: winter freezes, summer heat, heavy rainfall, aging pipe materials, and hard water scale.

                A fast response matters because standing water causes structural damage within hours and mold growth within days. The first step in any emergency

                is to locate the main water shutoff valve and stop the flow before a technician arrives.

              </p>

            </div>

            <div>

              <h2 className="text-2xl font-bold text-blue-900 mb-3">Seasonal Plumbing Preparation for {stateObj.name}</h2>

              <p className="text-gray-700 leading-relaxed">

                Preventive maintenance reduces emergency calls and repair costs. Before cold weather, homeowners should disconnect garden hoses, drain outdoor

                faucets, and insulate exposed pipes in crawl spaces, garages, and attics. Testing the main water shutoff valve annually ensures it will close

                when needed. Water heaters should be flushed to remove sediment, especially in areas with hard water. Sump pumps should be tested before the

                rainy season, and drains should be kept clear of grease, hair, and wipes.

              </p>

            </div>

          </div>



          {/* State-service hub links — crawlable */}

          <div className="mb-12">

            <h2 className="text-2xl font-bold text-blue-900 mb-5">Plumbing Services in {stateObj.name}</h2>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">

              {SERVICES.map((s) => (

                <Link

                  key={s.slug}

                  href={`/plumber/${stateObj.slug}/${s.slug}`}

                  className="block p-5 border border-gray-200 rounded-2xl hover:border-blue-500 hover:shadow-md transition-all no-underline group"

                  title={`${s.name} in ${stateObj.name}`}

                >

                  <p className="font-bold text-blue-900 mb-1 group-hover:text-blue-700">{s.name}</p>

                  <p className="text-gray-500 text-sm mb-3">{s.description}</p>

                  <span className="text-blue-600 text-xs font-semibold group-hover:underline">

                    Find {s.shortName.toLowerCase()} in {stateObj.name}

                  </span>

                </Link>

              ))}

            </div>

          </div>



          {/* Mid-page CTA */}

          <div className="bg-red-600 text-white rounded-2xl p-5 mb-12 flex flex-col sm:flex-row items-center justify-between gap-4">

            <div>

              <p className="font-extrabold text-lg">Need a Plumber in {stateObj.name} Now?</p>

              <p className="text-white text-sm">Live dispatcher — 60-min response — no overtime charges</p>

            </div>

            <a href={`tel:${PHONE_NUMBER}`} className="bg-white text-red-600 hover:bg-red-50 px-6 py-3 rounded-full font-extrabold whitespace-nowrap transition-colors" aria-label="Call emergency dispatch">

              📞 Call Now

            </a>

          </div>



          {/* Cities in this state */}

          {stateCities.length > 0 && (

            <div className="mb-12">

              <h2 className="text-2xl font-bold text-blue-900 mb-2">

                Cities We Serve in {stateObj.name}

              </h2>

              <p className="text-gray-500 text-sm mb-5">

                {stateCities.length} {stateCities.length === 1 ? 'city' : 'cities'} with dedicated plumber dispatch pages

              </p>

              <div className="grid md:grid-cols-2 gap-4">

                {stateCities.map((city) => {

                  const citySlug = cityToSlug(city.name);

                  const hasCostPage = COST_PAGE_CITIES.includes(city.name);

                  return (

                    <div key={city.name} className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">

                      <p className="font-bold text-blue-900 mb-3">

                        <Link href={`/${buildSlug(citySlug, 'emergency')}`} className="hover:underline no-underline">

                          Emergency plumber in {city.name}, {city.stateCode}

                        </Link>

                      </p>

                      <div className="flex flex-wrap gap-2">

                        {SERVICES.filter((s) => isCityQualifiedForService(city.name, s.slug)).map((s) => (

                          <Link

                            key={s.slug}

                            href={`/${buildSlug(citySlug, s.slug)}`}

                            className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-xs no-underline transition-colors"

                            title={`${s.name} in ${city.name}`}

                          >

                            {s.shortName} in {city.name}

                          </Link>

                        ))}

                        {hasCostPage && (

                          <Link

                            href={`/cost/${citySlug}`}

                            className="px-2 py-1 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded text-xs no-underline transition-colors"

                            title={`${city.name} plumbing cost guide`}

                          >

                            {city.name} costs

                          </Link>

                        )}

                      </div>

                    </div>

                  );

                })}

              </div>

            </div>

          )}



          {/* No cities fallback */}

          {stateCities.length === 0 && (

            <div className="mb-10 bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">

              <p className="text-blue-800 mb-3">We&apos;re expanding coverage in {stateObj.name}. Call us to check availability in your area.</p>

              <a href={`tel:${PHONE_NUMBER}`} className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-full font-bold" aria-label="Call emergency dispatch">

                📞 Check Availability

              </a>

            </div>

          )}



          <RelatedGuides serviceSlug="emergency" cityName={stateObj.name} />

          <Sources pageType="page" cityName={stateObj.name} stateCode={stateObj.code} />

          <EditorialFooter pageType="state-hub" />

          <Author pageType="state-hub" lastReviewed={lastReviewed} />



          <Trust pageType="state" lastReviewed={lastReviewed} />



          {/* Navigation links */}

          <div className="mb-10 bg-gray-50 border border-gray-200 rounded-xl p-5 flex flex-wrap gap-4 items-center justify-between">

            <p className="text-gray-700 text-sm font-medium">Explore other states or all cities</p>

            <div className="flex gap-4 text-sm">

              <Link href="/" className="text-blue-700 font-semibold hover:underline">← YoHomeFix homepage</Link>

              <Link href="/plumber-usa" className="text-blue-700 font-semibold hover:underline">All US cities →</Link>

            </div>

          </div>



          {/* Bottom CTA */}

          <div className="bg-blue-900 text-white rounded-2xl p-8 text-center">

            <h2 className="text-2xl font-extrabold mb-2">Need a Plumber in {stateObj.name} Right Now?</h2>

            <p className="text-white mb-5">

              24/7 dispatch — upfront pricing — licensed technicians — no overtime charges

            </p>

            <a href={`tel:${PHONE_NUMBER}`} className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-full text-xl font-extrabold transition-colors" aria-label="Call emergency dispatch">

              📞 Call Now — 24/7

            </a>

          </div>

        </main>



        <Footer />

      </div>

    </>

  );

}

