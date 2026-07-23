import Head from 'next/head';
import Link from 'next/link';
import { PHONE_NUMBER } from '../lib/cities';
import { Footer } from '../components/Footer';
import { EditorialFooter } from '../components/EditorialFooter';
import { Author } from '../components/Author';
import { Trust } from '../components/Trust';
import { Sources } from '../components/Sources';
import { buildOrganizationSchema, buildWebSiteSchema } from '../lib/schemas';
import { getDeterministicLastReviewed } from '../lib/dateUtils';

const costSections = [
  {
    title: 'Emergency Plumbing Costs',
    items: [
      ['Emergency diagnostic visit', '$75–$150', 'Diagnosis and an upfront repair recommendation.'],
      ['Localized burst-pipe repair', '$200–$600', 'Accessible pipe section repair; wall or slab access can increase scope.'],
      ['Emergency shutoff valve replacement', '$100–$250', 'Accessible fixture or main valve replacement; corroded pipe can increase cost.'],
      ['Sewer backup clearing', '$150–$400', 'Standard main-line clearing; hydro-jetting and camera work may cost more.'],
    ],
  },
  {
    title: 'Leak, Drain, and Sewer Costs',
    items: [
      ['Non-invasive leak detection', '$150–$400', 'Acoustic or thermal diagnosis before opening finished surfaces.'],
      ['Pinhole or supply-line repair', '$100–$350', 'Localized repair; access, material, and multiple failures affect scope.'],
      ['Single-drain cleaning', '$100–$200', 'Typical cable clearing for a localized sink, tub, or shower clog.'],
      ['Main-line hydro-jetting', '$350–$650', 'Used for grease, scale, or roots after evaluating pipe condition.'],
    ],
  },
  {
    title: 'Water Heater and Replacement Costs',
    items: [
      ['Water-heater diagnostic visit', '$75–$150', 'Applied toward repair when you proceed in many cases.'],
      ['Heating element or thermostat repair', '$150–$350', 'Common electric or gas control repair.'],
      ['Tank water-heater replacement', '$800–$1,500', 'Typical 40–50 gallon replacement with standard connections.'],
      ['Tankless water-heater installation', '$1,500–$3,000', 'Fuel, venting, gas-line, or electrical upgrades may add cost.'],
    ],
  },
];

const faqs = [
  {
    q: 'Why do plumbing prices vary so much?',
    a: 'The main variables are the type of failure, access to the pipe or fixture, required materials, permit or inspection requirements, and whether restoration is needed after work inside a wall, ceiling, slab, or crawl space.',
  },
  {
    q: 'Are emergency plumbing prices higher?',
    a: 'Emergency work can involve urgent service calls, water isolation, damage prevention, and more complex access. Ask for a written price before work begins. YoHomeFix communicates an upfront quote before approved work starts.',
  },
  {
    q: 'When is replacement better than another repair?',
    a: 'Replacement may be the better value when a component has repeated failures, repair cost approaches replacement cost, parts are unavailable, or the remaining system condition is poor. A technician should explain both scopes before you decide.',
  },
  {
    q: 'Do national plumbing price ranges guarantee my quote?',
    a: 'No. These ranges are educational national benchmarks, not quotes or promises. Your price depends on your property, the diagnosed issue, local labor and material conditions, access, and approved repair scope.',
  },
];

export default function PlumbingCostGuide() {
  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'https://yohomefix.com';
  const canonical = `${domain}/plumbing-cost-guide`;
  const title = 'Plumbing Cost Guide | Typical Repair & Emergency Prices | YoHomeFix';
  const description = 'Understand typical plumbing costs for emergencies, leaks, drains, sewer lines, water heaters, and replacements. Learn what affects pricing before requesting an upfront quote.';
  const lastReviewed = getDeterministicLastReviewed('plumbing-cost-guide');
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${domain}/` },
          { '@type': 'ListItem', position: 2, name: 'Plumbing Cost Guide', item: canonical },
        ],
      },
      {
        '@type': 'Article',
        headline: title,
        description,
        url: canonical,
        datePublished: '2025-01-15',
        dateModified: lastReviewed,
        author: { '@type': 'Organization', name: 'YoHomeFix' },
        publisher: { '@type': 'Organization', name: 'YoHomeFix', url: domain },
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: { '@type': 'Answer', text: faq.a },
        })),
      },
      buildOrganizationSchema(),
      buildWebSiteSchema(),
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
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={`${domain}/og-image.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </Head>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-red-600 md:hidden" style={{ height: 64 }}>
        <a href={`tel:${PHONE_NUMBER}`} className="flex items-center justify-center gap-3 h-full text-white font-extrabold text-xl w-full" aria-label="Call emergency dispatch">📞 CALL NOW — 24/7</a>
      </div>
      <div className="font-sans bg-white min-h-screen flex flex-col pb-16 md:pb-0">
        <nav className="bg-blue-900 text-white px-4 py-3 flex justify-between items-center sticky top-0 z-40 shadow-lg">
          <Link href="/" className="text-2xl font-extrabold text-white no-underline">YoHomeFix</Link>
          <a href={`tel:${PHONE_NUMBER}`} className="hidden md:flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-full font-bold" aria-label="Call emergency dispatch">📞 Call Now</a>
          <a href={`tel:${PHONE_NUMBER}`} className="md:hidden bg-red-600 text-white px-4 py-2 rounded-full font-bold text-sm" aria-label="Call emergency dispatch">Call Now</a>
        </nav>
        <nav aria-label="Breadcrumb" className="max-w-4xl mx-auto w-full px-4 py-2 text-sm text-gray-500">
          <ol className="flex flex-wrap items-center gap-1">
            <li><Link href="/" className="text-blue-600 hover:underline no-underline">Home</Link></li>
            <li><span className="text-gray-300 mx-1">›</span></li>
            <li><span className="text-gray-700 font-medium">Plumbing Cost Guide</span></li>
          </ol>
        </nav>
        <section className="bg-gradient-to-br from-blue-900 to-blue-700 text-white px-4 py-12 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-4">Plumbing Cost Guide</h1>
            <p className="speakable-intro text-lg text-white mb-6">Typical national plumbing price ranges, the factors behind your quote, and how to evaluate repair versus replacement.</p>
            <a href={`tel:${PHONE_NUMBER}`} className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-full text-lg font-extrabold shadow-xl" aria-label="Call for an upfront plumbing quote">📞 Get an Upfront Quote</a>
          </div>
        </section>
        <main className="max-w-4xl mx-auto w-full px-4 py-10">
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-10">
            <h2 className="text-xl font-bold text-blue-900 mb-3">How to Use These Price Ranges</h2>
            <p className="text-gray-700 leading-relaxed">The figures below are educational national benchmarks for common residential plumbing work. They are not local price guarantees and do not replace an on-site diagnosis. Your written quote depends on the issue, access, materials, property conditions, permits, and the approved scope of work.</p>
          </div>
          {costSections.map((section) => (
            <section key={section.title} className="mb-10">
              <h2 className="text-2xl font-bold text-blue-900 mb-4">{section.title}</h2>
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                  <thead><tr className="bg-blue-50 text-blue-900"><th className="text-left px-4 py-3 font-semibold">Service</th><th className="text-left px-4 py-3 font-semibold whitespace-nowrap">Typical range</th><th className="text-left px-4 py-3 font-semibold hidden md:table-cell">What is included</th></tr></thead>
                  <tbody>{section.items.map(([service, range, note], index) => <tr key={service} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}><td className="px-4 py-3 font-medium text-gray-800">{service}</td><td className="px-4 py-3 font-bold text-blue-700 whitespace-nowrap">{range}</td><td className="px-4 py-3 text-gray-500 hidden md:table-cell">{note}</td></tr>)}</tbody>
                </table>
              </div>
            </section>
          ))}
          <section className="grid md:grid-cols-2 gap-6 mb-10">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6"><h2 className="text-xl font-bold text-blue-900 mb-3">What Affects Plumbing Cost?</h2><ul className="space-y-2 text-gray-700 text-sm"><li>Access to pipes, fixtures, walls, slabs, or crawl spaces</li><li>Pipe material, replacement parts, and required equipment</li><li>Repair complexity and risk of water damage</li><li>Permit, inspection, or utility coordination requirements</li><li>Restoration after access openings or excavation</li></ul></div>
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6"><h2 className="text-xl font-bold text-red-900 mb-3">Emergency Pricing Considerations</h2><p className="text-gray-700 text-sm leading-relaxed">For active leaks, burst pipes, or sewer backups, the first priority is stopping damage safely. Ask what the diagnostic visit covers, whether immediate isolation is needed, and which repair choices are available. Do not authorize work until you understand the written scope and price.</p></div>
          </section>
          <section className="mb-10"><h2 className="text-2xl font-bold text-blue-900 mb-3">Repair or Replace?</h2><p className="text-gray-700 leading-relaxed">A repair is usually appropriate for a localized, accessible failure in an otherwise sound system. Replacement can be more economical when equipment repeatedly fails, repairs are extensive, parts are obsolete, or the remaining pipe or appliance condition creates a high likelihood of another failure. A qualified technician should compare the immediate repair with the expected scope and lifespan of replacement.</p></section>
          <section className="mb-10"><h2 className="text-2xl font-bold text-blue-900 mb-5">Plumbing Cost Guide FAQs</h2><div className="space-y-4">{faqs.map((faq) => <details key={faq.q} className="border border-gray-200 rounded-xl p-4"><summary className="font-semibold text-gray-800 cursor-pointer">{faq.q}</summary><p className="text-gray-600 mt-3 leading-relaxed">{faq.a}</p></details>)}</div></section>
          <div className="mb-10 bg-blue-50 border border-blue-200 rounded-2xl p-6"><h2 className="text-xl font-bold text-blue-900 mb-3">Find Local Pricing</h2><p className="text-gray-700 mb-4">City-specific pricing guides are available for selected major markets. Use the city guide when available, then request an on-site quote for your actual repair scope.</p><div className="flex flex-wrap gap-3"><Link href="/cost/chicago" className="text-blue-700 font-semibold hover:underline">Chicago costs</Link><Link href="/cost/houston" className="text-blue-700 font-semibold hover:underline">Houston costs</Link><Link href="/cost/los-angeles" className="text-blue-700 font-semibold hover:underline">Los Angeles costs</Link><Link href="/plumber-usa" className="text-blue-700 font-semibold hover:underline">Find a plumber by city</Link></div></div>
          <Trust pageType="cost" lastReviewed={lastReviewed} />
          <Sources pageType="page" />
          <EditorialFooter pageType="cost-guide" />
          <Author pageType="cost-guide" authorSlug="home-services-researcher" reviewedBy="Home Services Researcher" lastReviewed={lastReviewed} />
        </main>
        <Footer />
      </div>
    </>
  );
}
