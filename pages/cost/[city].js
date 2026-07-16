import Head from 'next/head';
import Link from 'next/link';
import {
  PHONE_NUMBER, SERVICES, SEED_CITIES, COST_PAGE_CITIES,
  cityToSlug, buildSlug, getStateSlug, CITY_DATA, isCityQualifiedForService,
} from '../../lib/cities';
import { CITY_COORDS } from '../../lib/cityCoords';
import { RelatedGuides } from '../../components/RelatedGuides';
import { EditorialFooter } from '../../components/EditorialFooter';
import { Footer } from '../../components/Footer';
import { Author } from '../../components/Author';
import { Trust } from '../../components/Trust';
import { Sources } from '../../components/Sources';
import { buildOrganizationSchema, buildWebSiteSchema, buildPersonSchema } from '../../lib/schemas';
import { getDeterministicLastReviewed } from '../../lib/dateUtils';

const CITY_COST_PROFILE = {
  'New York':      { factor: 1.45, tier: 'Premium Market', note: 'NYC labor costs run 40-50% above national average due to high cost of living, union labor prevalence, and parking/access surcharges in dense boroughs.' },
  'Los Angeles':   { factor: 1.35, tier: 'Premium Market', note: 'LA metro plumbing costs reflect high labor rates, traffic time costs between jobs, and elevated material costs due to California regulations.' },
  'Chicago':       { factor: 1.20, tier: 'Above Average',  note: "Chicago's union plumber labor rates and older housing stock (requiring more complex repairs) push costs above the national midpoint." },
  'Houston':       { factor: 0.95, tier: 'Near Average',   note: "Houston's competitive plumbing market and lower cost of living keep rates near or slightly below national averages despite high service volume." },
  'Phoenix':       { factor: 1.05, tier: 'Near Average',   note: 'Phoenix costs are near the national average, though summer peak demand can affect scheduling premiums.' },
  'Dallas':        { factor: 0.98, tier: 'Near Average',   note: "Dallas-Fort Worth's large contractor base creates competitive pricing — most residential plumbing rates fall within the national average range." },
  'San Antonio':   { factor: 0.90, tier: 'Below Average',  note: 'San Antonio has one of the lower plumbing cost profiles among major US metros, reflecting lower overall cost of living and strong local contractor supply.' },
  'San Diego':     { factor: 1.30, tier: 'Premium Market', note: 'San Diego labor and material costs track closely with other Southern California markets — elevated by state licensing requirements and high living costs.' },
  'Austin':        { factor: 1.15, tier: 'Above Average',  note: "Austin's rapid growth has created high plumber demand relative to supply, pushing rates above Texas averages." },
  'Philadelphia':  { factor: 1.25, tier: 'Above Average',  note: "Philadelphia's aging housing stock and union labor prevalence push rates above the national midpoint." },
};

function getCostTable(cityName) {
  const profile = CITY_COST_PROFILE[cityName] || { factor: 1.0 };
  const m = profile.factor;
  function adj(low, high) {
    return { low: `$${Math.round(low * m / 5) * 5}`, high: `$${Math.round(high * m / 5) * 5}` };
  }
  return [
    {
      service: 'Emergency Plumbing', slug: 'emergency', icon: '🚨',
      rows: [
        { label: 'After-hours diagnostic visit', ...adj(75, 150), note: 'Applied toward repair cost if you proceed' },
        { label: 'Frozen / burst pipe repair (localized)', ...adj(200, 600), note: 'Single section; longer runs or wall access costs more' },
        { label: 'Sewer backup clearing (main line snake)', ...adj(150, 400), note: 'Hydro-jetting for heavy blockage runs higher' },
        { label: 'Emergency shutoff valve replacement', ...adj(100, 250), note: 'Main or fixture shutoff; labor and parts' },
      ],
    },
    {
      service: 'Leak Detection & Repair', slug: 'leak-repair', icon: '💧',
      rows: [
        { label: 'Non-invasive leak detection (acoustic/thermal)', ...adj(150, 400), note: 'Locates leak without opening walls' },
        { label: 'Pinhole leak repair (copper pipe)', ...adj(150, 350), note: 'Single section; multiple leaks priced separately' },
        { label: 'Supply line replacement (under sink)', ...adj(100, 200), note: 'Flexible supply line or angle stop valve' },
        { label: 'Slab leak detection + epoxy lining', ...adj(500, 1500), note: 'Non-invasive method; direct access repair runs higher' },
      ],
    },
    {
      service: 'Drain Cleaning', slug: 'drain-cleaning', icon: '🌀',
      rows: [
        { label: 'Single drain snake (sink, tub, or shower)', ...adj(100, 200), note: 'Standard branch drain clog removal' },
        { label: 'Main sewer line clearing (snake)', ...adj(150, 350), note: 'From cleanout to street; standard blockage' },
        { label: 'Hydro-jetting (main line)', ...adj(350, 650), note: 'High-pressure scour for grease, scale, roots' },
        { label: 'Sewer camera inspection', ...adj(150, 300), note: 'Often bundled with line clearing' },
      ],
    },
    {
      service: 'Pipe Burst Repair', slug: 'pipe-burst-repair', icon: '🔩',
      rows: [
        { label: 'Localized section repair (coupling)', ...adj(200, 500), note: 'Accessible location; single section' },
        { label: 'Repair requiring wall access', ...adj(400, 900), note: 'Drywall patching typically separate contractor' },
        { label: 'Pipe rerouting (alternate wall path)', ...adj(600, 1500), note: 'New run through accessible framing' },
        { label: 'Slab access repair', ...adj(800, 2500), note: 'Concrete breaking varies by depth and access' },
      ],
    },
    {
      service: 'Water Heater Repair & Replacement', slug: 'water-heater-repair', icon: '🔥',
      rows: [
        { label: 'Diagnostic service call', ...adj(75, 150), note: 'Applied toward repair if you proceed' },
        { label: 'Thermostat or element replacement', ...adj(150, 350), note: 'Gas thermostat or electric element; parts + labor' },
        { label: 'Anode rod replacement', ...adj(150, 300), note: 'Extends tank life; every 4-6 years recommended' },
        { label: 'Tank water heater replacement (40-50 gal)', ...adj(800, 1500), note: 'Gas or electric; installation + old unit removal' },
        { label: 'Tankless installation', ...adj(1500, 3000), note: 'Unit + installation; gas/electric upgrades may add cost' },
      ],
    },
  ];
}

function getCostFaqs(cityName, profile) {
  return [
    {
      q: `How should I use the ${cityName} plumbing cost ranges?`,
      a: `This guide applies a market-context factor to educational national benchmarks; it is not verified ${cityName} contractor rate data. ${profile.note} Your actual quote depends on diagnosis, access, materials, permits, and the approved scope of work.`,
    },
    {
      q: `Why do plumbing costs in ${cityName} differ from national averages?`,
      a: `${profile.note} The figures are illustrative benchmarks, not a verified survey of ${cityName} contractor rates. Your actual quote reflects the diagnosed issue, access, materials, permits, and the approved scope of work.`,
    },
    {
      q: `Does YoHomeFix charge extra for emergency plumbing in ${cityName}?`,
      a: `No. YoHomeFix does not apply overtime surcharges or after-hours premiums. The written upfront quote you receive on arrival is the same whether you call at 2 PM or 2 AM, including weekends and holidays.`,
    },
    {
      q: `What affects the cost of a plumbing job in ${cityName}?`,
      a: `The four main factors are: (1) job scope; (2) access difficulty — pipes inside walls, under slabs, or in crawl spaces take more labor time; (3) materials — copper, PEX, and CPVC vary in price; and (4) permits. Your technician explains all factors before beginning.`,
    },
    {
      q: `How can I get an accurate plumbing cost estimate in ${cityName}?`,
      a: `The most reliable method is an on-site assessment. Call our ${cityName} dispatch line and a technician will provide a written upfront quote before starting any work.`,
    },
  ];
}

export async function getStaticPaths() {
  return {
    paths: COST_PAGE_CITIES.map((name) => ({ params: { city: cityToSlug(name) } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const cityName = COST_PAGE_CITIES.find((n) => cityToSlug(n) === params.city);
  if (!cityName) return { notFound: true };
  const cityEntry = SEED_CITIES.find((c) => c.name === cityName);
  if (!cityEntry) return { notFound: true };
  const profile = CITY_COST_PROFILE[cityName] || { factor: 1.0, tier: 'Near Average', note: '' };
  const costTable = getCostTable(cityName);
  const faqs = getCostFaqs(cityName, profile);
  const cityData = CITY_DATA[cityName] || {};
  return { props: { cityName, stateCode: cityEntry.stateCode, profile, costTable, faqs, cityData } };
}

export default function CostPage({ cityName, stateCode, profile, costTable, faqs, cityData }) {
  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'https://yohomefix.com';
  const slug = cityToSlug(cityName);
  const canonical = `${domain}/cost/${slug}`;
  const coords = CITY_COORDS[cityName];

  const title = `Plumber Cost in ${cityName}, ${stateCode} — Pricing Guide | YoHomeFix`;
  const description = `Educational plumbing cost ranges for ${cityName}: national benchmarks, market-context factors, and pricing considerations for emergency plumbing, drains, leaks, pipes, and water heaters.`;
  const lastReviewed = getDeterministicLastReviewed(`cost-${slug}`);

  const breadcrumbs = [
    { name: 'Home', url: `${domain}/` },
    { name: `Plumber ${stateCode}`, url: `${domain}/plumber-${getStateSlug(stateCode)}` },
    { name: `Plumber ${cityName}`, url: `${domain}/${buildSlug(slug, 'emergency')}` },
    { name: 'Cost Guide', url: canonical },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((b, i) => ({ '@type': 'ListItem', position: i + 1, name: b.name, item: b.url })),
      },
      {
        '@type': 'Article',
        '@id': `${canonical}#article`,
        headline: title,
        description,
        url: canonical,
        datePublished: '2025-01-15',
        dateModified: lastReviewed,
        author: buildPersonSchema({
          slug: 'home-services-researcher',
          name: 'Home Services Researcher',
          title: 'Home Services Research Lead',
          bio: 'The Home Services Researcher compiles and verifies local data, pricing benchmarks, and municipal infrastructure references used across YoHomeFix city and state pages.',
          expertise: ['Municipal data research', 'Regional cost analysis', 'Water utility mapping', 'Climate risk assessment'],
          image: `${domain}/og-image.png`,
        }),
        publisher: { '@type': 'Organization', name: 'YoHomeFix', url: domain },
        ...(coords ? { contentLocation: { '@type': 'Place', name: cityName, geo: { '@type': 'GeoCoordinates', latitude: coords.lat, longitude: coords.lng } } } : {}),
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      },
      {
        '@type': 'PlumbingService',
        name: 'YoHomeFix', url: canonical, telephone: PHONE_NUMBER, priceRange: '$$',
        areaServed: { '@type': 'City', name: cityName, containedInPlace: { '@type': 'State', name: stateCode } },
      },
      buildOrganizationSchema(),
      buildWebSiteSchema(),
    ],
  };

  const tierColor = {
    'Premium Market': 'bg-red-100 text-red-700',
    'Above Average':  'bg-yellow-100 text-yellow-800',
    'Near Average':   'bg-green-100 text-green-700',
    'Below Average':  'bg-blue-100 text-blue-700',
  }[profile.tier] || 'bg-gray-100 text-gray-700';

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={`${domain}/og-image.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={`${domain}/og-image.png`} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </Head>

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-red-600 md:hidden" style={{ height: 64 }}>
        <a href={`tel:${PHONE_NUMBER}`} className="flex items-center justify-center gap-3 h-full text-white font-extrabold text-xl w-full" aria-label="Call emergency dispatch">📞 CALL NOW — 24/7</a>
      </div>

      <div className="font-sans bg-white min-h-screen flex flex-col pb-16 md:pb-0">
        <div className="bg-blue-950 text-white py-2 px-4 text-center text-xs font-semibold">
          ✅ Licensed & Insured · ⏱️ 60-Min Response · 💰 Upfront Pricing · 📞 24/7 Live Dispatcher
        </div>

        <nav className="bg-blue-900 text-white px-4 py-3 flex justify-between items-center sticky top-0 z-40 shadow-lg">
          <Link href="/" className="text-2xl font-extrabold text-white no-underline">YoHomeFix</Link>
          <a href={`tel:${PHONE_NUMBER}`} className="hidden md:flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-full font-bold" aria-label="Call emergency dispatch">📞 Call Now</a>
          <a href={`tel:${PHONE_NUMBER}`} className="md:hidden bg-red-600 text-white px-4 py-2 rounded-full font-bold text-sm" aria-label="Call emergency dispatch">Call Now</a>
        </nav>

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

        <section className="bg-gradient-to-br from-blue-900 to-blue-700 text-white px-4 py-12 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-center gap-2 mb-4">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${tierColor}`}>{profile.tier}</span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-700 text-white">National benchmark ranges</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-4">Plumber Cost in {cityName}, {stateCode}</h1>
            <p className="speakable-intro text-white text-lg mb-6 max-w-2xl mx-auto">
              Educational national plumbing cost benchmarks with {cityName} market context. Your technician provides an upfront written quote after diagnosis.
            </p>
            <a href={`tel:${PHONE_NUMBER}`} className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-full text-lg font-extrabold shadow-xl">
              📞 Get a Free Quote
            </a>
            <p className="text-white text-sm mt-3">Live dispatcher — no obligation — upfront pricing</p>
          </div>
        </section>

        <main className="max-w-4xl mx-auto w-full px-4 py-10">

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-10">
            <h2 className="text-xl font-bold text-blue-900 mb-3">{cityName} Plumbing Cost Context</h2>
            <p className="text-gray-700 leading-relaxed mb-4">{profile.note}</p>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
              <div className="bg-white rounded-xl border border-blue-100 p-4 text-center">
                <p className="text-gray-500 mb-1">Market context</p>
                <p className={`font-bold text-sm px-2 py-1 rounded-full inline-block ${tierColor}`}>{profile.tier}</p>
              </div>
              <div className="bg-white rounded-xl border border-blue-100 p-4 text-center">
                <p className="text-gray-500 mb-1">Modeled factor</p>
                <p className="font-bold text-blue-900 text-lg">
                  {profile.factor > 1 ? `+${Math.round((profile.factor - 1) * 100)}%` : profile.factor < 1 ? `-${Math.round((1 - profile.factor) * 100)}%` : 'Baseline'}
                </p>
              </div>
              <div className="bg-white rounded-xl border border-blue-100 p-4 text-center">
                <p className="text-gray-500 mb-1">Pipe Infrastructure</p>
                <p className="font-bold text-blue-900 text-sm capitalize">{cityData.infraClass || 'Mixed'}</p>
              </div>
              <div className="bg-white rounded-xl border border-blue-100 p-4 text-center">
                <p className="text-gray-500 mb-1">Water Hardness</p>
                <p className="font-bold text-blue-900 text-sm">{cityData.hardnessPpm ? `${cityData.hardnessPpm} mg/L` : 'Varies'}</p>
              </div>
            </div>
            {cityData.waterUtility && (
              <p className="text-sm text-gray-600">
                <strong>Local infrastructure context:</strong> {cityData.waterUtility}.
                {cityData.pipeMaterial && ` Common pipe materials in ${cityName}: ${cityData.pipeMaterial}.`}
                {cityData.dominantFailure && ` A common local issue is ${cityData.dominantFailure}.`}
                {' '}This context can affect repair scope, but it does not verify local contractor rates.
              </p>
            )}
          </div>

          {costTable.map((svc) => (
            <div key={svc.slug} className="mb-12">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-2xl font-bold text-blue-900">{svc.icon} {svc.service}</h2>
                <Link href={`/${buildSlug(slug, svc.slug)}`} className="text-sm text-blue-600 font-semibold hover:underline no-underline">
                  Book {svc.service.toLowerCase()} in {cityName}
                </Link>
              </div>
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-blue-50 text-blue-900">
                      <th className="text-left px-4 py-3 font-semibold">Service</th>
                      <th className="text-left px-4 py-3 font-semibold whitespace-nowrap">Illustrative range</th>
                      <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {svc.rows.map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 font-medium text-gray-800">{row.label}</td>
                        <td className="px-4 py-3 font-bold text-blue-700 whitespace-nowrap">{row.low} – {row.high}</td>
                        <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{row.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-700 mt-2">* Educational national benchmarks adjusted by a market-context model, not verified local contractor rates. Actual cost depends on scope, access, materials, and local conditions. Upfront written quote before work begins.</p>
            </div>
          ))}

          <div className="bg-red-600 text-white rounded-2xl p-6 mb-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-extrabold text-xl">Get Your Exact {cityName} Quote Now</p>
              <p className="text-white text-sm">Live dispatcher — 60-min response — no obligation</p>
            </div>
            <a href={`tel:${PHONE_NUMBER}`} className="bg-white text-red-600 hover:bg-red-50 px-6 py-3 rounded-full font-extrabold whitespace-nowrap">📞 Call Now</a>
          </div>

          <div className="mb-10">
            <h2 className="text-2xl font-bold text-blue-900 mb-6">Plumber Cost FAQs — {cityName}</h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => {
                const firstSentenceMatch = faq.a.match(/^([^\.]+\.\s*)/);
                const immediate = firstSentenceMatch ? firstSentenceMatch[1].trim() : faq.a;
                const explanation = firstSentenceMatch ? faq.a.slice(firstSentenceMatch[0].length).trim() : '';
                return (
                  <details key={i} className="border border-gray-200 rounded-xl p-4">
                    <summary className="font-semibold text-gray-800 cursor-pointer list-none flex justify-between items-center">
                      <span>{faq.q}</span>
                      <span className="text-blue-600 ml-2 flex-shrink-0">▼</span>
                    </summary>
                    <div className="text-gray-600 mt-3 leading-relaxed">
                      <p className="font-semibold text-gray-700">{immediate}</p>
                      {explanation && <p className="mt-2">{explanation}</p>}
                    </div>
                  </details>
                );
              })}
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-xl font-bold text-blue-900 mb-4">Book a Plumber in {cityName}</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {SERVICES.filter((s) => isCityQualifiedForService(cityName, s.slug)).map((s) => (
                <Link key={s.slug} href={`/${buildSlug(slug, s.slug)}`} className="block border border-gray-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-sm transition-all no-underline group">
                  <p className="font-semibold text-blue-900 group-hover:text-blue-700 text-sm">{s.name} in {cityName}</p>
                  <p className="text-gray-700 text-xs mt-1">{s.description}</p>
                  <span className="text-blue-600 text-xs font-semibold mt-2 block">Book {s.name.toLowerCase()} now →</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="mb-10 bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-blue-900 mb-4">Plumber Cost in Other Cities</h2>
            <div className="flex flex-wrap gap-2">
              {COST_PAGE_CITIES.filter((c) => c !== cityName).map((c) => (
                <Link key={c} href={`/cost/${cityToSlug(c)}`} className="px-3 py-1 border border-gray-200 rounded-full text-sm text-blue-700 hover:border-blue-400 hover:bg-blue-50 transition-colors no-underline" title={`Plumbing cost guide for ${c}`}>
                  {c} plumbing costs
                </Link>
              ))}
            </div>
          </div>

          <RelatedGuides serviceSlug="emergency" cityName={cityName} />
          <Trust pageType="cost" lastReviewed={lastReviewed} />
          <Sources pageType="page" cityName={cityName} stateCode={stateCode} />
          <EditorialFooter pageType="cost-guide" />
          <Author pageType="cost-guide" authorSlug="home-services-researcher" reviewedBy="Home Services Researcher" lastReviewed={lastReviewed} />

          <div className="bg-blue-900 text-white rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-extrabold mb-2">Ready for an Exact Quote in {cityName}?</h2>
            <p className="text-white mb-5">24/7 dispatch — upfront written pricing — no overtime charges</p>
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
