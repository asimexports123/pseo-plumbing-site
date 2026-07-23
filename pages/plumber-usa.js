import Head from 'next/head';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { SEED_CITIES, SERVICES, STATES, cityToSlug, buildSlug, PHONE_NUMBER, isCityQualifiedForService } from '../lib/cities';
import { EditorialFooter } from '../components/EditorialFooter';
import { Footer } from '../components/Footer';
import { Author } from '../components/Author';
import { buildPageSchema } from '../lib/schemas';

const SERVICE_ICONS = {
  'emergency': '🚨',
  'leak-repair': '💧',
  'drain-cleaning': '🌀',
  'pipe-burst-repair': '🔩',
  'water-heater-repair': '🔥',
  'sewer-line-repair': '🚿',
  'toilet-repair': '🚽',
  'slab-leak-repair': '🏗️',
  'water-line-repair': '🚰',
  'faucet-repair': '🚧',
  'garbage-disposal-repair': '♻️',
  'water-softener-repair': '💎',
  'whole-house-repiping': '🔧',
  'main-water-shutoff-valve-repair': '⏹️',
  'sump-pump-repair': '🏊',
};

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

  const [searchQuery, setSearchQuery] = useState('');
  const [activeService, setActiveService] = useState('all');

  // Group cities by state for directory layout
  const citiesByState = useMemo(() => {
    const groups = {};
    SEED_CITIES.forEach(city => {
      if (!groups[city.stateCode]) {
        const stateInfo = STATES.find(s => s.code === city.stateCode);
        groups[city.stateCode] = { stateCode: city.stateCode, stateName: stateInfo?.name || city.stateCode, cities: [] };
      }
      groups[city.stateCode].cities.push(city);
    });
    return Object.values(groups).sort((a, b) => a.stateName.localeCompare(b.stateName));
  }, []);

  // Filtered cities based on search
  const filteredStates = useMemo(() => {
    if (!searchQuery.trim()) return citiesByState;
    const q = searchQuery.toLowerCase().trim();
    return citiesByState
      .map(group => ({
        ...group,
        cities: group.cities.filter(c => c.name.toLowerCase().includes(q) || group.stateName.toLowerCase().includes(q)),
      }))
      .filter(g => g.cities.length > 0);
  }, [searchQuery, citiesByState]);

  // Count cities per service
  const serviceCityCounts = useMemo(() => {
    const counts = {};
    SERVICES.forEach(s => {
      counts[s.slug] = SEED_CITIES.filter(c => isCityQualifiedForService(c.name, s.slug)).length;
    });
    return counts;
  }, []);

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
        <a href={`tel:${PHONE_NUMBER}`} data-track="plumber-usa-sticky-mobile" className="flex items-center justify-center gap-3 h-full text-white font-extrabold text-xl w-full" aria-label="Call emergency dispatch">
          <span>📞</span><span>CALL NOW — 24/7</span>
        </a>
      </div>

      <div className="font-sans bg-white min-h-screen flex flex-col pb-16 md:pb-0">

        {/* Header */}
        <nav className="bg-blue-900 text-white px-4 py-3 flex justify-between items-center sticky top-0 z-40 shadow-lg">
          <Link href="/" className="text-2xl font-extrabold text-white no-underline">YoHomeFix</Link>
          <a href={`tel:${PHONE_NUMBER}`} data-track="plumber-usa-nav-desktop" className="hidden md:flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-full font-bold transition-colors" aria-label="Call emergency dispatch">
            📞 Call Now
          </a>
          <a href={`tel:${PHONE_NUMBER}`} data-track="plumber-usa-nav-mobile" className="md:hidden bg-red-600 text-white px-4 py-2 rounded-full font-bold text-sm" aria-label="Call emergency dispatch">Call Now</a>
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
            <a href={`tel:${PHONE_NUMBER}`} data-track="plumber-usa-hero" className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-full text-xl font-extrabold shadow-xl transition-transform hover:scale-105" aria-label="Call emergency dispatch">
              📞 Get Emergency Help
            </a>
          </div>
        </section>

        <main className="max-w-5xl mx-auto w-full px-4 py-12">

          {/* Services Hub — filterable cards */}
          <section className="mb-14">
            <h2 className="text-2xl font-bold text-blue-900 mb-6 text-center">Our Plumbing Services</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {SERVICES.map((s) => (
                <a key={s.slug} href={`#${s.slug}-cities`}
                  className={`p-4 border-2 rounded-xl hover:shadow-md transition-all text-center no-underline ${activeService === s.slug ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-400'}`}
                  onClick={() => setActiveService(s.slug)}>
                  <div className="text-2xl mb-1">{SERVICE_ICONS[s.slug] || '🔧'}</div>
                  <p className="font-bold text-blue-900 text-sm">{s.name}</p>
                  <p className="text-gray-500 text-xs mt-1">{serviceCityCounts[s.slug]} cities</p>
                </a>
              ))}
            </div>
          </section>

          {/* Search bar */}
          <section className="mb-10">
            <div className="max-w-md mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search city or state..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none text-gray-800"
                  aria-label="Search cities"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Clear search"
                  >✕</button>
                )}
              </div>
              <p className="text-center text-gray-400 text-xs mt-2">
                {filteredStates.reduce((sum, s) => sum + s.cities.length, 0)} of {SEED_CITIES.length} cities shown
              </p>
            </div>
          </section>

          {/* Cities by Service — compact grids */}
          {SERVICES.map((service) => {
            const cities = SEED_CITIES.filter((city) => isCityQualifiedForService(city.name, service.slug));
            const filteredCities = searchQuery.trim()
              ? cities.filter(c => {
                  const q = searchQuery.toLowerCase().trim();
                  return c.name.toLowerCase().includes(q) || c.stateCode.toLowerCase().includes(q);
                })
              : cities;
            if (filteredCities.length === 0) return null;

            return (
              <section key={service.slug} id={`${service.slug}-cities`} className="mb-12 scroll-mt-20">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{SERVICE_ICONS[service.slug] || '🔧'}</span>
                  <h2 className="text-xl font-bold text-blue-900">{service.name} — All Cities</h2>
                  <span className="text-gray-400 text-sm">({filteredCities.length})</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {filteredCities.map((city) => {
                    const href = `/${buildSlug(cityToSlug(city.name), service.slug)}`;
                    return (
                      <Link key={`${service.slug}-${city.name}`} href={href}
                        className="px-3 py-2 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg text-sm text-gray-700 hover:text-blue-800 no-underline transition-all text-center"
                        title={`${service.name} in ${city.name}, ${city.stateCode}`}>
                        {service.shortName} in {city.name}
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}

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

          {/* City Directory — grouped by state with search */}
          <section className="mb-14">
            <h2 className="text-2xl font-bold text-blue-900 mb-2 text-center">Browse by City</h2>
            <p className="text-gray-500 text-center text-sm mb-6">All {SEED_CITIES.length} cities across {filteredStates.length} states — click any city for emergency plumbing services</p>
            <div className="space-y-4">
              {filteredStates.map((group) => (
                <div key={group.stateCode} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <h3 className="font-bold text-blue-900 text-sm">{group.stateName} ({group.stateCode}) <span className="text-gray-400 font-normal">— {group.cities.length} cities</span></h3>
                  </div>
                  <div className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {group.cities.map((city) => (
                        <Link key={city.name}
                          href={`/${buildSlug(cityToSlug(city.name), 'emergency')}`}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs no-underline transition-colors font-medium"
                          title={`Emergency plumber in ${city.name}, ${city.stateCode}`}>
                          {city.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              {filteredStates.length === 0 && (
                <p className="text-center text-gray-400 py-8">No cities found for &quot;{searchQuery}&quot;</p>
              )}
            </div>
          </section>

          <EditorialFooter pageType="national-hub" />
          <Author pageType="national-hub" />

          {/* Bottom CTA */}
          <div className="bg-blue-900 text-white rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-extrabold mb-2">Need a Plumber Right Now?</h2>
            <p className="text-white mb-5">Our dispatchers are standing by 24/7 across the USA</p>
            <a href={`tel:${PHONE_NUMBER}`} data-track="plumber-usa-bottom-cta" className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-full text-xl font-extrabold transition-colors" aria-label="Call emergency dispatch">
              📞 Call Today
            </a>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
