import Head from 'next/head';
import Link from 'next/link';
import { PHONE_NUMBER, STATES, SEED_CITIES, cityToSlug, buildSlug } from '../lib/cities';
import { EditorialFooter } from '../components/EditorialFooter';
import { Footer } from '../components/Footer';
import { Author } from '../components/Author';
import { buildPageSchema } from '../lib/schemas';

const FAQS = [
  {
    q: 'What is your average response time for emergency plumbing calls?',
    a: 'Our target response time is under 60 minutes for emergency plumbing calls across our US service areas. We dispatch the nearest available licensed technician immediately upon receiving your call. Actual arrival times may vary based on location, traffic, and technician availability.',
  },
  {
    q: 'Do you charge extra for emergency or after-hours service?',
    a: 'We aim to keep pricing consistent regardless of when you call. Our technicians provide a written quote before any work begins. Always confirm pricing directly with your technician prior to service.',
  },
  {
    q: 'What areas do you serve?',
    a: 'We serve homeowners across major US cities including New York, Los Angeles, Chicago, Houston, Phoenix, Dallas, San Antonio, San Diego, and many more. Visit our city pages to confirm coverage in your area.',
  },
  {
    q: 'Are your plumbers licensed and insured?',
    a: 'All plumbers in our network are required to hold valid state plumbing licenses and maintain liability insurance. We encourage customers to request proof of credentials before work begins.',
  },
  {
    q: 'What types of plumbing emergencies do you handle?',
    a: 'Our technicians handle burst pipes, water main breaks, sewer line backups, water heater failures, gas line concerns, sump pump failures, drain blockages, and more. Most repairs are completed on the first visit.',
  },
  {
    q: 'How is pricing determined?',
    a: 'Pricing is set by the individual licensed technician based on the scope of work. You will receive a written estimate before any work begins. There are no hidden fees — the quoted price is what you pay.',
  },
  {
    q: 'Do technicians offer warranties on their work?',
    a: 'Warranty terms vary by technician and the type of repair performed. Ask your technician about warranty coverage before work begins. We require all network members to stand behind their workmanship.',
  },
  {
    q: 'What should I do while waiting for the plumber to arrive?',
    a: 'If you have a major water leak, locate and shut off your main water supply valve. For gas concerns, leave the building and call your gas provider from outside. For smaller issues, avoid using affected fixtures and contain water with towels or buckets.',
  },
  {
    q: 'Do you offer preventive maintenance services?',
    a: 'Many technicians in our network offer annual plumbing inspections, drain cleaning, water heater maintenance, and pipe assessments. Ask your technician about maintenance plans when they visit.',
  },
  {
    q: 'How do I schedule non-emergency plumbing service?',
    a: 'Call our dispatch line and let us know your preferred timing. We can typically accommodate same-day or next-day appointments for non-emergency work across most service areas.',
  },
  {
    q: 'How often should I schedule a plumbing inspection?',
    a: 'We recommend a full plumbing inspection every 1 to 2 years for most homes, and annually for homes over 30 years old or those with a history of leaks, clogs, or water heater issues. Regular inspections catch deteriorating pipes, failing shutoff valves, and early leaks before they become emergency calls.',
  },
  {
    q: 'What is the best way to prevent frozen pipes?',
    a: 'Insulate pipes in unheated spaces, keep your thermostat above 55°F during cold weather, disconnect outdoor hoses, and know where your main water shutoff is located. For homes in cold climates, a pre-winter inspection is the best preventive step.',
  },
  {
    q: 'Does hard water really damage plumbing?',
    a: 'Yes. Hard water deposits calcium and magnesium scale inside pipes and water heaters, gradually restricting flow and reducing heating efficiency. In hard water areas, annual water heater flushing and periodic descaling significantly extend the life of your plumbing.',
  },
  {
    q: 'How does YoHomeFix dispatch work?',
    a: 'When you call our 24/7 line, a live dispatcher records your location and plumbing issue, then routes the request to the nearest available licensed plumber in our network. The contractor contacts you directly to confirm arrival time and provide a written quote before any work begins.',
  },
  {
    q: 'Is YoHomeFix a plumbing company?',
    a: 'No. YoHomeFix is a call-connection platform that connects homeowners with independent, licensed plumbers. We do not perform repairs, set prices, or provide warranties. All work is done by the independent contractor you are connected with.',
  },
  {
    q: 'How do you vet plumbers in your network?',
    a: 'We verify that each plumber holds an active state license, carries general liability insurance, agrees to upfront pricing, and has no pattern of unresolved disciplinary actions. We recheck credentials periodically and track homeowner feedback.',
  },
  {
    q: 'Where does YoHomeFix content come from?',
    a: 'Our guides and local pages are researched from authoritative public sources such as the EPA, USGS, NOAA, CDC, U.S. Census Bureau, and local water utilities. Each page is reviewed by our editorial team before publication.',
  },
  {
    q: 'Can I request a specific plumber?',
    a: 'No. We connect you with the nearest available licensed plumber who can respond to your service request. Availability depends on location, time, weather, and demand.',
  },
  {
    q: 'What if I am not satisfied with the service?',
    a: 'Service quality is the responsibility of the independent contractor. We track complaints and remove providers from the network who repeatedly fail to meet our standards. For disputes, contact the contractor directly and report the issue to us at hello@yohomefix.com.',
  },
];

const domain = process.env.NEXT_PUBLIC_DOMAIN || 'https://yohomefix.com';

export default function FAQ() {
  const title = 'FAQ — Emergency Plumbing Questions Answered | YoHomeFix';
  const description = 'Answers to common questions about YoHomeFix emergency plumbing services: response times, pricing, licensing, service areas, and warranties.';
  const canonical = `${domain}/faq`;

  const pageSchema = buildPageSchema({
    title,
    description,
    path: '/faq',
    breadcrumbs: [
      { name: 'Home', url: `${domain}/` },
      { name: 'FAQ', url: `${domain}/faq` },
    ],
  });
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      ...pageSchema['@graph'],
      {
        '@type': 'FAQPage',
        '@id': `${canonical}#faq`,
        mainEntity: FAQS.map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: { '@type': 'Answer', text: faq.a },
        })),
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
          <a href={`tel:${PHONE_NUMBER}`} className="bg-red-600 text-white px-4 py-2 rounded-full font-bold text-sm" aria-label="Call emergency dispatch">
            📞 Call Now
          </a>
        </nav>

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="max-w-3xl mx-auto w-full px-4 py-2 text-sm text-gray-500">
          <ol className="flex items-center gap-1">
            <li><Link href="/" className="text-blue-600 hover:underline no-underline">Home</Link></li>
            <li><span className="text-gray-300 mx-1">›</span></li>
            <li><span className="text-gray-700 font-medium">FAQ</span></li>
          </ol>
        </nav>

        <main className="max-w-3xl mx-auto w-full px-4 py-10 flex-1">
          <h1 className="text-3xl font-extrabold text-blue-900 mb-2">Frequently Asked Questions</h1>
          <p className="text-gray-500 mb-10">Everything you need to know about our emergency plumbing dispatch service.</p>

          <div className="space-y-4">
            {FAQS.map((faq, i) => {
              const firstSentenceMatch = faq.a.match(/^([^\.]+\.\s*)/);
              const immediate = firstSentenceMatch ? firstSentenceMatch[1].trim() : faq.a;
              const explanation = firstSentenceMatch ? faq.a.slice(firstSentenceMatch[0].length).trim() : '';
              return (
                <details key={i} className="border border-gray-200 rounded-xl p-5 group">
                  <summary className="font-semibold text-gray-800 cursor-pointer list-none flex justify-between items-start gap-3">
                    <h2 className="text-base font-semibold m-0">{faq.q}</h2>
                    <span className="text-blue-600 flex-shrink-0 mt-0.5">▼</span>
                  </summary>
                  <div className="text-gray-600 mt-3 leading-relaxed">
                    <p className="font-semibold text-gray-700">{immediate}</p>
                    {explanation && <p className="mt-2">{explanation}</p>}
                  </div>
                </details>
              );
            })}
          </div>

          <div className="mt-10 bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
            <h2 className="text-xl font-bold text-blue-900 mb-2">Still Have Questions?</h2>
            <p className="text-gray-600 mb-4">Our dispatchers are available 24/7 to answer any questions.</p>
            <a href={`tel:${PHONE_NUMBER}`} className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-full font-bold no-underline" aria-label="Call emergency dispatch">
              📞 Call Now — 24/7
            </a>
          </div>

          {/* Internal links — top city pages */}
          <div className="mt-10">
            <h2 className="text-lg font-bold text-blue-900 mb-4">Find a Plumber in Your City</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SEED_CITIES.slice(0, 12).map((city) => (
                <Link key={city.name} href={`/${buildSlug(cityToSlug(city.name), 'emergency')}`}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-blue-700 hover:border-blue-400 hover:bg-blue-50 no-underline transition-colors text-center"
                  title={`Emergency plumber in ${city.name}`}>
                  Emergency plumber in {city.name}
                </Link>
              ))}
            </div>
            <div className="text-center mt-3">
              <Link href="/plumber-usa" className="text-blue-600 text-sm font-semibold hover:underline">Browse emergency plumbers in all {SEED_CITIES.length} cities</Link>
            </div>
          </div>

          {/* Internal links — state hubs */}
          <div className="mt-8">
            <h2 className="text-lg font-bold text-blue-900 mb-4">Find a Plumber by State</h2>
            <div className="flex flex-wrap gap-2">
              {STATES.slice(0, 16).map((s) => (
                <Link key={s.slug} href={`/plumber-${s.slug}`}
                  className="px-3 py-1 border border-gray-200 rounded-full text-sm text-blue-700 hover:border-blue-400 hover:bg-blue-50 no-underline transition-colors"
                  title={`Emergency plumber in ${s.name}`}>
                  Emergency plumber in {s.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Internal links — cost guides */}
          <div className="mt-8">
            <h2 className="text-lg font-bold text-blue-900 mb-4">Plumbing Cost Guides</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {['New York','Los Angeles','Chicago','Houston','Phoenix','Dallas','San Antonio','San Diego','Austin','Philadelphia'].map((city) => (
                <Link key={city} href={`/cost/${cityToSlug(city)}`}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-yellow-700 hover:border-yellow-400 hover:bg-yellow-50 no-underline transition-colors text-center"
                  title={`Plumbing cost guide for ${city}`}>
                  {city} plumbing costs
                </Link>
              ))}
            </div>
          </div>

          {/* Internal links — guides */}
          <div className="mt-8 mb-4">
            <h2 className="text-lg font-bold text-blue-900 mb-4">Plumbing Guides</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { href: '/guides/how-to-prevent-frozen-pipes',        label: 'How to Prevent Frozen Pipes' },
                { href: '/guides/signs-you-need-a-plumber',           label: '10 Signs You Need a Plumber' },
                { href: '/guides/how-to-shut-off-water-in-emergency', label: 'Shut Off Water in an Emergency' },
                { href: '/guides/water-heater-maintenance-guide',     label: 'Water Heater Maintenance Guide' },
              ].map((g) => (
                <Link key={g.href} href={g.href}
                  className="block p-3 border border-gray-200 rounded-xl hover:border-blue-400 no-underline transition-all group">
                  <p className="text-sm font-semibold text-blue-800 group-hover:text-blue-600">{g.label}</p>
                </Link>
              ))}
            </div>
          </div>

          <EditorialFooter pageType="faq" />
          <Author pageType="faq" />
        </main>

        <Footer />
      </div>
    </>
  );
}
