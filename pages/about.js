import Head from 'next/head';
import Link from 'next/link';
import { PHONE_NUMBER, SERVICES, STATES, SEED_CITIES, cityToSlug, buildSlug } from '../lib/cities';
import { buildPageSchema } from '../lib/schemas';
import { Footer } from '../components/Footer';
import { Author } from '../components/Author';

const domain = process.env.NEXT_PUBLIC_DOMAIN || 'https://yohomefix.com';

export default function About() {
  const title = 'About YoHomeFix — 24/7 Emergency Plumbing Services';
  const description = 'YoHomeFix provides 24/7 emergency plumbing services across 50+ US cities. Licensed, insured plumbers, upfront pricing, 60-minute response target. Learn about our mission and editorial standards.';
  const canonical = `${domain}/about`;
  const schema = buildPageSchema({
    title,
    description,
    path: '/about',
    breadcrumbs: [
      { name: 'Home', url: `${domain}/` },
      { name: 'About', url: `${domain}/about` },
    ],
  });

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

        <nav className="bg-blue-900 text-white px-4 py-3 flex justify-between items-center sticky top-0 z-40 shadow-lg">
          <Link href="/" className="text-2xl font-extrabold text-white no-underline">YoHomeFix</Link>
          <a href={`tel:${PHONE_NUMBER}`} className="bg-red-600 text-white px-4 py-2 rounded-full font-bold text-sm" aria-label="Call emergency dispatch">📞 Call Now</a>
        </nav>

        <nav aria-label="Breadcrumb" className="max-w-3xl mx-auto w-full px-4 py-2 text-sm text-gray-500">
          <ol className="flex flex-wrap items-center gap-1">
            <li><Link href="/" className="text-blue-600 hover:underline no-underline">Home</Link></li>
            <li><span className="text-gray-300 mx-1">›</span></li>
            <li><span className="text-gray-700 font-medium">About</span></li>
          </ol>
        </nav>

        <main className="max-w-3xl mx-auto w-full px-4 py-10 flex-1">

          <h1 className="text-3xl font-extrabold text-blue-900 mb-4">About YoHomeFix</h1>

          <p className="speakable-intro text-lg text-gray-700 leading-relaxed mb-8 border-l-4 border-blue-600 pl-4">
            YoHomeFix provides 24/7 emergency plumbing services across {SEED_CITIES.length}+ cities in {STATES.length} states. Licensed, insured plumbers — upfront pricing, 60-minute response target.
          </p>

          {/* Trust stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { stat: `${SEED_CITIES.length}+`, label: 'Cities Served' },
              { stat: '24/7', label: 'Live Service' },
              { stat: '60 min', label: 'Response Target' },
              { stat: `${STATES.length}`, label: 'States Covered' },
            ].map((item) => (
              <div key={item.label} className="bg-blue-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-extrabold text-blue-900">{item.stat}</p>
                <p className="text-gray-500 text-xs mt-1">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="space-y-8 text-gray-700 leading-relaxed">

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-2">Our Mission</h2>
              <p>
                Plumbing emergencies don&apos;t wait for business hours. Our mission is to make it simple for any homeowner — in any US city — to reach a qualified, licensed plumber quickly, any time of day or night, without paying a premium for urgency.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-2">How YoHomeFix Works</h2>
              <p>
                When you call YoHomeFix, a live operator confirms your location and plumbing issue, then sends the nearest available licensed plumber to your door. We are available 24/7 with upfront pricing and no overtime charges.
              </p>
              <ul className="list-disc ml-5 mt-3 space-y-1 text-sm">
                <li>You call our 24/7 line.</li>
                <li>A live operator records your location and the problem.</li>
                <li>The nearest available licensed plumber is notified.</li>
                <li>The plumber calls or arrives with a written upfront quote.</li>
                <li>You approve the work before any repair begins.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-2">How Service Calls Work</h2>
              <p>
                Our 24/7 line routes calls based on service type and location. We aim to have a licensed plumber at your door within 60 minutes. Availability varies by time, location, and demand.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-2">How Plumbers Are Selected</h2>
              <p>
                Plumbers who work with YoHomeFix are independent professionals. We verify, to the best of our ability, that they meet the following standards before they are eligible to receive service calls:
              </p>
              <ul className="list-disc ml-5 mt-3 space-y-1 text-sm">
                <li>Active state plumbing license in the state where they operate.</li>
                <li>Current general liability insurance (minimum $1M coverage).</li>
                <li>Agreement to provide written, upfront pricing before starting work.</li>
                <li>No active disciplinary actions or patterns of unresolved complaints on their state licensing board record.</li>
              </ul>
              <p className="text-sm text-gray-500 mt-3">
                We do not directly employ, supervise, or warrant the work of any plumber. Licensing and insurance verification is performed at onboarding and periodically rechecked.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-2">Quality Standards</h2>
              <p>
                We expect every plumber we work with to treat homeowners professionally, communicate clearly, leave work areas clean, and honor the upfront quote provided. We track complaints and stop working with plumbers who repeatedly fail to meet these standards.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-2">Consumer-First Philosophy</h2>
              <p>
                We believe homeowners deserve transparency, not pressure. That means upfront pricing, no hidden fees, and the freedom to decline any recommended work. We also publish educational guides and cost information so homeowners can understand their options before calling.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-2">Why Homeowners Choose YoHomeFix</h2>
              <p>
                Homeowners turn to YoHomeFix because we make emergency plumbing simple. Instead of searching through listings, waiting on callbacks, or guessing who is available, one call gets a licensed plumber to your door.
              </p>
              <ul className="list-disc ml-5 mt-3 space-y-1 text-sm">
                <li>Live 24/7 service — no automated phone menus.</li>
                <li>Licensed, insured plumbers in 50+ cities.</li>
                <li>Written upfront pricing before any work begins.</li>
                <li>Educational guides and transparent cost expectations.</li>
                <li>Consumer-focused, no-pressure approach.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-2">Editorial Commitment</h2>
              <p>
                Every guide, cost page, and local service page is built from verified public data, reviewed by our editorial team, and updated when source information changes. We do not accept payment for placement, we do not publish sponsored contractor reviews, and we correct factual errors when they are identified.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-2">Service Transparency</h2>
              <p>
                YoHomeFix provides plumbing services across the United States. We do not set warranties or control pricing. Every job starts with a written upfront quote before any work begins.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-2">Who YoHomeFix Is For</h2>
              <p>
                YoHomeFix is for homeowners and renters in the United States who need emergency plumbing help or want to understand plumbing maintenance, repair costs, and local water infrastructure. We serve residential customers, including single-family homes, apartments, condos, and rental properties.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-2">Who Should NOT Use YoHomeFix</h2>
              <p>
                YoHomeFix is not the right choice if you are looking for a specific plumbing company, require guaranteed same-day or guaranteed arrival times, or need work covered by a specific warranty. We are also not a substitute for municipal emergency services — for gas leaks, evacuate first and call 911 or your gas utility.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-2">Services We Provide</h2>
              <div className="grid md:grid-cols-2 gap-3 mt-3">
                {SERVICES.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/${buildSlug(cityToSlug('New York'), s.slug)}`}
                    className="flex items-start gap-2 p-3 border border-gray-200 rounded-xl hover:border-blue-400 no-underline transition-colors group"
                    title={`${s.name} in New York`}
                  >
                    <span className="text-green-500 font-bold mt-0.5 flex-shrink-0">✓</span>
                    <div>
                      <p className="font-semibold text-blue-900 text-sm group-hover:text-blue-700">{s.name} in New York</p>
                      <p className="text-gray-500 text-xs mt-0.5">{s.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-3">States We Cover</h2>
              <div className="flex flex-wrap gap-2 mt-3">
                {STATES.map((s) => (
                  <Link key={s.slug} href={`/plumber-${s.slug}`}
                    className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full text-sm no-underline transition-colors"
                    title={`Emergency plumber in ${s.name}`}>
                    Emergency plumber in {s.name}
                  </Link>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-3">Plumbing Guides & Resources</h2>
              <p className="text-gray-500 text-sm mb-4">Our editorial team publishes guides to help homeowners understand and prevent plumbing issues.</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { href: '/guides/how-to-prevent-frozen-pipes',        label: 'How to Prevent Frozen Pipes' },
                  { href: '/guides/signs-you-need-a-plumber',           label: '10 Signs You Need a Plumber Now' },
                  { href: '/guides/how-to-shut-off-water-in-emergency', label: 'How to Shut Off Water in an Emergency' },
                  { href: '/guides/hard-water-effects-on-plumbing',     label: 'Hard Water Effects on Plumbing' },
                  { href: '/guides/water-heater-maintenance-guide',     label: 'Water Heater Maintenance Guide' },
                  { href: '/guides',                                     label: 'View all plumbing guides' },
                ].map((g) => (
                  <Link key={g.href} href={g.href}
                    className="block p-3 border border-gray-200 rounded-xl hover:border-blue-400 no-underline transition-all group">
                    <p className="text-sm font-semibold text-blue-800 group-hover:text-blue-600">{g.label}</p>
                  </Link>
                ))}
              </div>
            </section>

            <section className="bg-gray-50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-blue-900 mb-3">Editorial Methodology</h2>
              <p className="text-gray-700 text-sm leading-relaxed mb-3">
                Our city and state service pages are built from a structured data model that includes verified municipal water utility names, water hardness measurements, pipe era and material estimates, dominant local failure modes, climate classifications, and representative zip codes. Each page combines these data points with service-specific guidance to produce locally relevant information.
              </p>
              <p className="text-sm text-gray-600">
                Learn more in our <Link href="/editorial-policy" className="text-blue-600 hover:underline no-underline">Editorial Policy</Link> and view the <Link href="/sources" className="text-blue-600 hover:underline no-underline">Sources & References</Link> we use.
              </p>
            </section>

            <section className="bg-gray-50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-blue-900 mb-3">Important Disclosures</h2>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>YoHomeFix provides plumbing services across the United States.</li>
                <li>Response times are targets, not guarantees. Availability varies by location and demand.</li>
                <li>All pricing is provided upfront in writing before any work begins.</li>
                <li>Warranty terms vary by job and are confirmed in writing before work starts.</li>
              </ul>
            </section>

          </div>

          <Author pageType="about" />

          <div className="mt-10 bg-blue-900 text-white rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-extrabold mb-2">Ready for a Local Plumber?</h2>
            <p className="text-white mb-5">Our team is standing by 24/7 across the USA — 60-minute response target, upfront pricing.</p>
            <a href={`tel:${PHONE_NUMBER}`} className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-full text-xl font-extrabold transition-colors" aria-label="Call emergency dispatch">
              📞 Get Emergency Help
            </a>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
