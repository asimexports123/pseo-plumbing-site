import Head from 'next/head';
import Link from 'next/link';
import { SEED_CITIES, SERVICES, cityToSlug, buildSlug, PHONE_NUMBER, isCityQualifiedForService } from '../lib/cities';
import { EditorialFooter } from '../components/EditorialFooter';
import { Footer } from '../components/Footer';
import { Author } from '../components/Author';
import { buildPageSchema } from '../lib/schemas';

export default function PlumberUSA() {
  const title = 'Plumber USA — Emergency Plumbing Services in Every US City | YoHomeFix';
  const description =
    `Find local emergency plumbers in ${SEED_CITIES.length} US cities. YoHomeFix connects you with licensed, insured plumbers available 24/7. Burst pipes, leaks, drain cleaning & more.`;
  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'https://yohomefix.com';

  const canonical = `${domain}/plumber-usa`;
  const schema = buildPageSchema({
    title,
    description,
    path: '/plumber-usa',
    breadcrumbs: [
      { name: 'Home', url: `${domain}/` },
      { name: 'Plumber USA', url: `${domain}/plumber-usa` },
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

      {/* Sticky mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-red-600 md:hidden">
        <a href={`tel:${PHONE_NUMBER}`} className="flex items-center justify-center gap-3 py-4 text-white font-extrabold text-xl w-full" aria-label="Call emergency dispatch">
          <span>📞</span><span>CALL NOW — 24/7</span>
        </a>
      </div>

      <div className="font-sans bg-white min-h-screen flex flex-col pb-16 md:pb-0">

        {/* Header */}
        <nav className="bg-blue-900 text-white px-4 py-3 flex justify-between items-center sticky top-0 z-40 shadow-lg">
          <Link href="/" className="text-2xl font-extrabold text-white no-underline">YoHomeFix</Link>
          <a href={`tel:${PHONE_NUMBER}`} className="hidden md:flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-full font-bold transition-colors" aria-label="Call emergency dispatch">
            📞 Call Now
          </a>
          <a href={`tel:${PHONE_NUMBER}`} className="md:hidden bg-red-600 text-white px-4 py-2 rounded-full font-bold text-sm" aria-label="Call emergency dispatch">Call Now</a>
        </nav>

        <nav aria-label="Breadcrumb" className="max-w-5xl mx-auto w-full px-4 py-2 text-sm text-gray-500">
          <ol className="flex flex-wrap items-center gap-1">
            <li><Link href="/" className="text-blue-600 hover:underline no-underline">Home</Link></li>
            <li><span className="text-gray-300 mx-1">›</span></li>
            <li><span className="text-gray-700 font-medium">All US Cities</span></li>
          </ol>
        </nav>

        {/* Hero */}
        <section className="bg-gradient-to-br from-blue-900 to-blue-700 text-white px-4 py-12 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-extrabold mb-4">Emergency Plumbers in Every US City</h1>
            <p className="text-lg text-white mb-6">Licensed plumbers dispatched in 60 minutes. Available 24/7 with no overtime charges.</p>
            <a href={`tel:${PHONE_NUMBER}`} className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-full text-xl font-extrabold shadow-xl transition-transform hover:scale-105" aria-label="Call emergency dispatch">
              📞 Get Emergency Help
            </a>
          </div>
        </section>

        <main className="max-w-5xl mx-auto w-full px-4 py-12">

          {/* Services Hub — anchor links */}
          <section className="mb-14">
            <h2 className="text-2xl font-bold text-blue-900 mb-6 text-center">Our Plumbing Services</h2>
            <div className="grid md:grid-cols-5 gap-3">
              {SERVICES.map((s) => (
                <a key={s.slug} id={s.slug} href={`#${s.slug}-cities`}
                  className="p-4 border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all text-center no-underline">
                  <p className="font-bold text-blue-900 text-sm">{s.name}</p>
                  <p className="text-gray-700 text-xs mt-1">{SEED_CITIES.length} cities</p>
                </a>
              ))}
            </div>
          </section>

          {/* Cities by Service */}
          {SERVICES.map((service) => (
            <section key={service.slug} id={`${service.slug}-cities`} className="mb-14 scroll-mt-20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-blue-900">{service.name} — All Cities</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {SEED_CITIES.filter((city) => isCityQualifiedForService(city.name, service.slug)).map((city) => {
                  const href = `/${buildSlug(cityToSlug(city.name), service.slug)}`;
                  return (
                    <Link key={`${service.slug}-${city.name}`} href={href}
                      className="px-3 py-2 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg text-sm text-gray-700 hover:text-blue-800 no-underline transition-all text-center"
                      title={`${service.name} in ${city.name}`}>
                      {service.shortName} in {city.name}
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}

          {/* Cost Guides Section */}
          <section className="mb-14 bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-blue-900 mb-3 text-center">Plumbing Cost Guides by City</h2>
            <p className="text-gray-600 text-center text-sm mb-6">
              See city-specific pricing before you call. Each guide breaks down typical costs for emergency plumbing, leaks, drains, burst pipes, and water heaters.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {['New York','Los Angeles','Chicago','Houston','Phoenix','Dallas','San Antonio','San Diego','Austin','Philadelphia'].map((city) => (
                <Link key={city} href={`/cost/${cityToSlug(city)}`}
                  className="px-3 py-2 bg-white border border-yellow-300 rounded-lg text-sm text-yellow-800 hover:bg-yellow-100 no-underline transition-all text-center"
                  title={`Plumbing cost guide for ${city}`}>
                  {city} costs
                </Link>
              ))}
            </div>
          </section>

          {/* Guides Section */}
          <section className="mb-14">
            <h2 className="text-2xl font-bold text-blue-900 mb-6 text-center">Plumbing Guides & Resources</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { slug: 'how-to-prevent-frozen-pipes', title: 'How to Prevent Frozen Pipes', desc: 'Insulation, thermostat, and shutoff tips' },
                { slug: 'signs-you-need-a-plumber', title: '10 Signs You Need a Plumber', desc: 'Warning signals that need immediate attention' },
                { slug: 'how-to-shut-off-water-in-emergency', title: 'Shut Off Water in an Emergency', desc: 'Main valve, fixture valves, and meter key' },
                { slug: 'hard-water-effects-on-plumbing', title: 'Hard Water Effects on Plumbing', desc: 'Scale, water heater damage, and solutions' },
                { slug: 'water-heater-maintenance-guide', title: 'Water Heater Maintenance Guide', desc: 'Flushing, anode rods, and pressure relief' },
              ].map((g) => (
                <Link key={g.slug} href={`/guides/${g.slug}`}
                  className="block border border-gray-200 rounded-xl p-4 hover:border-blue-400 transition-colors no-underline group">
                  <p className="font-semibold text-blue-900 group-hover:text-blue-700">{g.title}</p>
                  <p className="text-gray-500 text-xs mt-1">{g.desc}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* City Hub — all services per city */}
          <section className="mb-14">
            <h2 className="text-2xl font-bold text-blue-900 mb-6 text-center">Browse by City</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {SEED_CITIES.map((city) => (
                <div key={city.name} className="border border-gray-200 rounded-xl p-4">
                  <p className="font-bold text-blue-900 mb-2">
                    <Link href={`/${buildSlug(cityToSlug(city.name), 'emergency')}`} className="hover:underline no-underline">
                      Emergency plumber in {city.name}, {city.stateCode}
                    </Link>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SERVICES.filter((s) => isCityQualifiedForService(city.name, s.slug)).map((s) => {
                      const href = `/${buildSlug(cityToSlug(city.name), s.slug)}`;
                      return (
                        <Link key={s.slug} href={href}
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-xs no-underline transition-colors"
                          title={`${s.name} in ${city.name}`}>
                          {s.shortName} in {city.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <EditorialFooter pageType="national-hub" />
          <Author pageType="national-hub" />

          {/* Bottom CTA */}
          <div className="bg-blue-900 text-white rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-extrabold mb-2">Need a Plumber Right Now?</h2>
            <p className="text-white mb-5">Our dispatchers are standing by 24/7 across the USA</p>
            <a href={`tel:${PHONE_NUMBER}`} className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-full text-xl font-extrabold transition-colors" aria-label="Call emergency dispatch">
              📞 Call Today
            </a>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
