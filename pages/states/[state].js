import Head from 'next/head';

import Link from 'next/link';

import {
  STATES, SEED_CITIES, SERVICES,
  cityToSlug, buildSlug, CITY_DATA, isCityQualifiedForService, isStateQualifiedForService, COST_PAGE_CITIES,
} from '../../lib/cities';
import { getPlacesByStateSync, ensurePlacesForStateLoaded } from '../../lib/nationwidePlaces';
import { getCrawlHubPath, groupPlacesByLetter } from '../../lib/crawl';

import { RelatedGuides } from '../../components/RelatedGuides';

import { EditorialFooter } from '../../components/EditorialFooter';

import { Footer } from '../../components/Footer';

import { Author } from '../../components/Author';

import { Trust } from '../../components/Trust';

import { Sources } from '../../components/Sources';

import { buildOrganizationSchema, buildWebSiteSchema, buildPersonSchema, buildPlumberSchema, buildFAQPageSchema } from '../../lib/schemas';

import { STATE_INTROS } from '../../lib/stateIntros';

import { getStateEntityProfile, buildClimateSection, buildEmergenciesSection, buildSeasonalSection, buildStateFAQs } from '../../lib/stateEntityRollup';
import { getPageDate } from '../../lib/contentVersioning';



export async function getStaticPaths() {

  if (process.env.FULL_BUILD !== 'true') {
    return { paths: [], fallback: 'blocking' };
  }

  return {

    paths: STATES.map((s) => ({ params: { state: s.slug } })),

    fallback: 'blocking',

  };

}



export async function getStaticProps({ params }) {
  try {
    const stateObj = STATES.find((s) => s.slug === params.state);
    if (!stateObj) return { notFound: true };
    await ensurePlacesForStateLoaded(stateObj.code);

    const stateCities = SEED_CITIES.filter((c) => c.stateCode === stateObj.code);

    // Get nationwide places for this state (excluding enriched SEED_CITIES)
    const seedCityNames = new Set(stateCities.map(c => c.name));
    const additionalPlaces = getPlacesByStateSync(stateObj.code)
      .filter(p => !seedCityNames.has(p.name))
      .map(p => ({ name: p.name, stateCode: p.stateCode, slug: p.slug }))
      .sort((a, b) => a.name.localeCompare(b.name));
    const additionalGrouped = groupPlacesByLetter(additionalPlaces);

    const entityProfile = getStateEntityProfile(stateObj.code);
    const climateContent = buildClimateSection(entityProfile, stateObj);
    const emergenciesContent = buildEmergenciesSection(entityProfile, stateObj);
    const seasonalContent = buildSeasonalSection(entityProfile, stateObj);
    const stateFAQs = buildStateFAQs(entityProfile, stateObj);

    const lastReviewed = await getPageDate(`state:${stateObj.slug}`);
    return { props: { stateObj, stateCities, additionalPlaces: additionalGrouped, climateContent, emergenciesContent, seasonalContent, stateFAQs, lastReviewed } };
  } catch (err) {
    console.error(`[states/[state]] getStaticProps error for ${params.state}:`, err.message);
    return { notFound: true };
  }
}



export default function StatePage({ stateObj, stateCities, additionalPlaces = [], climateContent = '', emergenciesContent = '', seasonalContent = '', stateFAQs = [], lastReviewed }) {

  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'https://yohomefix.com';

  // Canonical is the public-facing /plumber-{state} URL (rewrite target)

  const canonical = `${domain}/plumber-${stateObj.slug}`;

  const title = `Emergency Plumber ${stateObj.name} | 24/7 | YoHomeFix`;

  const description = `24/7 emergency plumber in ${stateObj.name}. Burst pipe or flooding? Licensed plumber dispatched fast statewide. Upfront pricing. Call now.`;

  const stateIntro = STATE_INTROS[stateObj.slug] || STATE_INTROS['new-york'];



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

      buildPlumberSchema({
        url: canonical,
        description,
        areaServed: {
          '@type': 'State',
          name: stateObj.name,
          containedInPlace: { '@type': 'Country', name: 'United States' },
        },
      }),

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

      ...(stateFAQs && stateFAQs.length > 0 ? [buildFAQPageSchema({ canonical, faqs: stateFAQs })] : []),

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



      <div className="font-sans bg-white min-h-screen flex flex-col">



        {/* Header */}

        <nav className="bg-blue-900 text-white px-4 py-3 flex justify-between items-center sticky top-0 z-40 shadow-lg">

          <Link href="/" className="text-2xl font-extrabold text-white no-underline">YoHomeFix</Link>

          <a href="tel:1" className="hidden md:flex items-center gap-2 bg-brand hover:bg-brand-dark text-white px-5 py-2 rounded-full font-bold" aria-label="Call emergency dispatch">

            📞 Call Now

          </a>

          <a href="tel:1" className="md:hidden bg-brand text-white px-4 py-2 rounded-full font-bold text-sm" aria-label="Call emergency dispatch">Call Now</a>

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
        <section className="relative w-full overflow-hidden text-white" style={{ backgroundColor: '#172554' }}>
          <div className="flex flex-col md:flex-row md:items-stretch">
            <div className="relative z-10 flex-1 flex items-center px-4 sm:px-6 lg:px-12 py-10 md:py-20 lg:py-14">
              <div className="w-full max-w-2xl mx-auto md:mx-0 text-center md:text-left">
                <div className="inline-block bg-brand text-white text-sm font-bold px-3 py-1 rounded-full mb-3">⚡ 24/7 Emergency Available in {stateObj.name}</div>
                <h1 className="text-3xl md:text-4xl font-extrabold mb-3 leading-tight">
                  Emergency Plumber in {stateObj.name}
                </h1>
                <p className="speakable-intro text-lg text-white mb-2 max-w-2xl mx-auto md:mx-0">
                  In {stateObj.name}, {stateObj.fact}. YoHomeFix provides a licensed local plumber in under 60 minutes — 24/7, transparent pricing from participating providers.
                </p>
                <p className="text-white text-sm mb-5 max-w-2xl mx-auto md:mx-0">
                  Serving homeowners across the USA with ZIP code–based local plumber matching.
                </p>
                <a href="tel:1" className="inline-flex items-center gap-3 bg-brand hover:bg-brand-dark text-white px-8 py-4 rounded-full text-xl font-extrabold shadow-xl transition-transform hover:scale-105 no-underline" aria-label="Call emergency dispatch">
                  📞 Get Emergency Help
                </a>
                <p className="text-white text-sm mt-3">Live operator — answered 24/7</p>
                <div className="flex flex-wrap gap-3 mt-6 text-sm justify-center md:justify-start">
                  {['✅ Licensed & Insured', '⏱️ 60-Min Response', '💰 Upfront Pricing', '📞 No Hold Queues'].map((b) => (
                    <span key={b} className="bg-blue-800 text-blue-100 px-3 py-1 rounded-full">{b}</span>
                  ))}
                </div>
              </div>
              <div
                className="absolute top-full left-0 right-0 h-32 pointer-events-none md:hidden"
                style={{ background: 'linear-gradient(to bottom, rgba(23,37,84,1) 0%, rgba(23,37,84,0.85) 15%, rgba(23,37,84,0.55) 30%, rgba(23,37,84,0.3) 45%, rgba(23,37,84,0.12) 60%, rgba(23,37,84,0.03) 75%, rgba(23,37,84,0) 100%)' }}
              />
            </div>
            <div className="relative w-full md:w-[40%] md:flex-shrink-0 lg:w-[38%] pointer-events-none select-none">
              <img
                src="/images/plumber-service-hero.jpg"
                alt="Licensed plumber repairing pipes with professional tools"
                width={720}
                height={915}
                loading="eager"
                fetchpriority="high"
                className="w-full h-auto object-contain"
                aria-hidden="true"
                style={{ display: 'block' }}
              />
              <div
                className="absolute inset-y-0 left-0 pointer-events-none hidden md:block"
                style={{
                  width: '42%',
                  background: 'linear-gradient(to right, #172554 0%, rgba(23,37,84,0.98) 10%, rgba(23,37,84,0.92) 25%, rgba(23,37,84,0.8) 40%, rgba(23,37,84,0.6) 55%, rgba(23,37,84,0.4) 70%, rgba(23,37,84,0.2) 85%, rgba(23,37,84,0) 100%)',
                }}
              />
            </div>
          </div>
        </section>



        <main className="max-w-4xl mx-auto w-full px-4 py-10">



          {/* AI-friendly key takeaways */}

          <div className="mb-8 bg-green-50 border border-green-200 rounded-2xl p-5">

            <h2 className="text-lg font-bold text-green-900 mb-3">Key Takeaways for {stateObj.name} Homeowners</h2>

            <ul className="space-y-2 text-sm text-green-800">

              <li className="flex gap-2"><span className="font-bold">✓</span> YoHomeFix provides licensed plumbers 24/7 across {stateObj.name}.</li>

              <li className="flex gap-2"><span className="font-bold">✓</span> Local conditions: {stateObj.fact}.</li>

              <li className="flex gap-2"><span className="font-bold">✓</span> Call connects to a live operator; a plumber provides a written quote before any work begins.</li>

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

              <h2 className="text-2xl font-bold text-blue-900 mb-3">How {stateObj.name}'s Climate Affects Your Plumbing</h2>

              <p className="text-gray-700 leading-relaxed">

                {climateContent}

              </p>

            </div>

            <div>

              <h2 className="text-2xl font-bold text-blue-900 mb-3">Most Common Plumbing Emergencies in {stateObj.name}</h2>

              <p className="text-gray-700 leading-relaxed mb-4">

                {emergenciesContent}

              </p>

            </div>

            <div>

              <h2 className="text-2xl font-bold text-blue-900 mb-3">Seasonal Plumbing Preparation for {stateObj.name}</h2>

              <p className="text-gray-700 leading-relaxed">

                {seasonalContent}

              </p>

            </div>

          </div>



          {/* State-service hub links — crawlable */}

          <div className="mb-12">

            <h2 className="text-2xl font-bold text-blue-900 mb-5">Plumbing Services in {stateObj.name}</h2>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">

              {SERVICES.filter((s) => isStateQualifiedForService(stateObj.code, s.slug)).map((s) => (

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

          <div className="bg-brand text-white rounded-2xl p-5 mb-12 flex flex-col sm:flex-row items-center justify-between gap-4">

            <div>

              <p className="font-extrabold text-lg">Need a Plumber in {stateObj.name} Now?</p>

              <p className="text-white text-sm">Live operator — 60-min response — transparent pricing from participating providers</p>

            </div>

            <a href="tel:1" className="bg-white text-brand hover:bg-brand-pale px-6 py-3 rounded-full font-extrabold whitespace-nowrap transition-colors" aria-label="Call emergency dispatch">

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

                        {SERVICES.filter((s) => isCityQualifiedForService(city.name, s.slug, city.stateCode)).map((s) => (

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

              <a href="tel:1" className="inline-flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-full font-bold" aria-label="Call emergency dispatch">

                📞 Check Availability

              </a>

            </div>

          )}



          {/* Additional cities and towns in this state (nationwide expansion, grouped A-Z) */}

          {additionalPlaces.length > 0 && (

            <div className="mb-12">

              <h2 className="text-2xl font-bold text-blue-900 mb-2">

                More Cities & Towns in {stateObj.name}
              </h2>

              <p className="text-gray-500 text-sm mb-5">
                {additionalPlaces.reduce((acc, g) => acc + g.places.length, 0)} additional {additionalPlaces.length === 1 ? 'location' : 'locations'} with plumbing service coverage
              </p>

              <div className="space-y-2">
                {additionalPlaces.map((group) => (
                  <details key={group.letter} className="border border-gray-200 rounded-xl overflow-hidden group">
                    <summary className="cursor-pointer px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center gap-3 list-none [&::-webkit-details-marker]:hidden">
                      <span className="font-semibold text-blue-900 w-8">{group.letter}</span>
                      <span className="text-gray-600 text-xs flex-1">{group.places.length} {group.places.length === 1 ? 'city/town' : 'cities/towns'}</span>
                      <span className="text-gray-400 text-sm">click to expand</span>
                    </summary>
                    <div className="p-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {group.places.map((place) => (
                          <Link
                            key={place.slug}
                            href={`/${buildSlug(place.slug, 'emergency')}`}
                            className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-sm no-underline transition-colors"
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

            </div>

          )}



          <RelatedGuides serviceSlug="emergency" cityName={stateObj.name} />

          {stateFAQs && stateFAQs.length > 0 && (

            <div className="mb-12">

              <h2 className="text-2xl font-bold text-blue-900 mb-5">Frequently Asked Questions — Emergency Plumbing in {stateObj.name}</h2>

              <div className="space-y-4">

                {stateFAQs.map((faq, i) => (

                  <details key={i} className="border border-gray-200 rounded-xl overflow-hidden group">

                    <summary className="cursor-pointer px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors font-semibold text-gray-800 list-none [&::-webkit-details-marker]:hidden">

                      {faq.q}

                    </summary>

                    <div className="px-5 py-4 text-gray-700 leading-relaxed">

                      {faq.a}

                    </div>

                  </details>

                ))}

              </div>

            </div>

          )}

          <Sources pageType="page" cityName={stateObj.name} stateCode={stateObj.code} />

          <EditorialFooter pageType="state-hub" />

          <Author pageType="state-hub" lastReviewed={lastReviewed} />



          <Trust pageType="state" lastReviewed={lastReviewed} />



          {/* Navigation links */}

          <div className="mb-10 bg-gray-50 border border-gray-200 rounded-xl p-5 flex flex-wrap gap-4 items-center justify-between">

            <p className="text-gray-700 text-sm font-medium">Explore other states or all cities</p>

            <div className="flex flex-wrap gap-4 text-sm">

              <Link href="/" className="text-blue-700 font-semibold hover:underline">← YoHomeFix homepage</Link>

              <Link href="/plumber-usa" className="text-blue-700 font-semibold hover:underline">All US cities →</Link>

              {getCrawlHubPath(stateObj.slug) && (
                <Link href={getCrawlHubPath(stateObj.slug)} className="text-blue-700 font-semibold hover:underline">Plain-text index for {stateObj.name} →</Link>
              )}

            </div>

          </div>



          {/* Bottom CTA */}

          <div className="bg-blue-900 text-white rounded-2xl p-8 text-center">

            <h2 className="text-2xl font-extrabold mb-2">Need a Plumber in {stateObj.name} Right Now?</h2>

            <p className="text-white mb-5">

              24/7 dispatch — transparent pricing from participating providers — licensed technicians

            </p>

            <a href="tel:1" className="inline-flex items-center gap-3 bg-brand hover:bg-brand-dark text-white px-8 py-4 rounded-full text-xl font-extrabold transition-colors" aria-label="Call emergency dispatch">

              📞 Call Now — 24/7

            </a>

          </div>

        </main>



        <Footer />

      </div>

    </>

  );

}

