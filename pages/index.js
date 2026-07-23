import Head from 'next/head';
import Link from 'next/link';
import { SEED_CITIES, SERVICES, STATES, cityToSlug, buildSlug, PHONE_NUMBER } from '../lib/cities';
import { EditorialFooter } from '../components/EditorialFooter';

function trackCall(label) {
  try {
    const key = 'yhf_call_clicks';
    const existing = JSON.parse(localStorage.getItem(key) || '{}');
    existing[label] = (existing[label] || 0) + 1;
    existing['__total'] = (existing['__total'] || 0) + 1;
    existing['__last'] = new Date().toISOString();
    localStorage.setItem(key, JSON.stringify(existing));
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'call_click', {
        cta_location: label,
        page_path: typeof window !== 'undefined' ? window.location.pathname : '',
        page_location: typeof window !== 'undefined' ? window.location.href : '',
      });
    }
  } catch (_) {}
}

// Top 10 cities for authority hub links (emergency + leak-repair clusters)
const TOP_CITIES = [
  'New York','Los Angeles','Chicago','Houston','Phoenix',
  'Philadelphia','San Antonio','Dallas','San Diego','Austin',
];
const LEAK_CITIES = [
  'San Jose','Fort Worth','Columbus','Charlotte','Indianapolis',
  'San Francisco','Seattle','Denver','Nashville','Jacksonville',
];

export default function Home() {
  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'https://yohomefix.com';
  const title = 'Emergency Plumber | 24 Hour Plumbing Service | YoHomeFix';
  const description =
    'Burst pipe, flooding, or no hot water? YoHomeFix connects you with a licensed local plumber in under 60 min — available 24/7, no hold queues, upfront pricing. Call now.';

  const orgSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${domain}/#organization`,
        name: 'YoHomeFix',
        url: domain,
        logo: {
          '@type': 'ImageObject',
          url: `${domain}/og-image.png`,
          width: 1200,
          height: 630,
        },
        telephone: PHONE_NUMBER,
        description: 'An emergency plumbing call connection platform routing homeowners to verified local plumbing technicians, available 24/7 across the United States.',
        areaServed: { '@type': 'Country', name: 'United States' },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: PHONE_NUMBER,
          contactType: 'customer service',
          contactOption: 'TollFree',
          availableLanguage: 'English',
          hoursAvailable: {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
            opens: '00:00',
            closes: '23:59',
          },
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${domain}/#website`,
        url: domain,
        name: 'YoHomeFix',
        inLanguage: 'en-US',
        copyright: `© ${new Date().getFullYear()} YoHomeFix. All rights reserved.`,
        description: 'Find licensed emergency plumbers across the USA — 24/7 dispatch, upfront pricing, 60-minute response.',
        publisher: { '@id': `${domain}/#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${domain}/plumber-usa?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'WebPage',
        '@id': `${domain}/#webpage`,
        url: `${domain}/`,
        name: title,
        description,
        isPartOf: { '@id': `${domain}/#website` },
        about: { '@id': `${domain}/#organization` },
        speakable: {
          '@type': 'SpeakableSpecification',
          cssSelector: ['h1', '.speakable-intro'],
        },
      },
    ],
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`${domain}/`} />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${domain}/`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={`${domain}/og-image.png`} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      </Head>

      {/* Sticky mobile CTA — height fixed to prevent CLS */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-red-600 md:hidden" style={{ height: 64 }}>
        <a
          href={`tel:${PHONE_NUMBER}`}
          onClick={() => trackCall('sticky-mobile-home')}
          data-track="sticky-mobile-home"
          className="flex items-center justify-center gap-3 h-full text-white font-extrabold text-xl w-full"
          aria-label="Call emergency dispatch"
        >
          <span>📞</span>
          <span>CALL NOW — 24/7</span>
        </a>
      </div>

      <div className="font-sans bg-white min-h-screen flex flex-col pb-16 md:pb-0">

        {/* Header */}
        <nav className="bg-blue-900 text-white px-4 py-3 flex justify-between items-center sticky top-0 z-40 shadow-lg">
          <Link href="/" className="text-2xl font-extrabold text-white no-underline">YoHomeFix</Link>
          <a
            href={`tel:${PHONE_NUMBER}`}
            onClick={() => trackCall('nav-desktop-home')}
            data-track="nav-desktop-home"
            className="hidden md:flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-full font-bold transition-colors"
            aria-label="Call emergency dispatch"
          >
            📞 Call Now
          </a>
          <a
            href={`tel:${PHONE_NUMBER}`}
            onClick={() => trackCall('nav-mobile-home')}
            data-track="nav-mobile-home"
            className="md:hidden bg-red-600 text-white px-4 py-2 rounded-full font-bold text-sm"
            aria-label="Call emergency dispatch"
          >
            Call Now
          </a>
        </nav>

        <main className="flex-1">

        {/* ── HERO ──────────────────────────────────────────────── */}
        <section className="bg-gradient-to-br from-blue-900 to-blue-700 text-white px-4 py-14 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-block bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-full mb-4">
              ⚡ 24/7 Emergency Dispatch — Live Operators Standing By
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
              24/7 Emergency Plumbing Dispatch
            </h1>
            <p className="speakable-intro text-xl text-white mb-2 max-w-2xl mx-auto">
              Burst pipe? Flooding? No hot water? We connect you with a licensed local plumber in under 60 minutes — no hold queues, no automated menus.
            </p>
            <p className="text-white text-base mb-8 max-w-xl mx-auto">
              Licensed &amp; insured technicians. Upfront pricing before any work begins.
            </p>
            <a
              href={`tel:${PHONE_NUMBER}`}
              onClick={() => trackCall('hero-home')}
              data-track="hero-home"
              className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white px-8 py-5 rounded-full text-xl font-extrabold shadow-xl transition-transform hover:scale-105"
              aria-label="Call emergency dispatch"
            >
              📞 Get Emergency Help Now
            </a>
            <p className="text-white text-sm mt-3">Tap to call — live dispatcher answers 24/7</p>
            <div className="flex flex-wrap justify-center gap-4 mt-8 text-sm">
              {['✅ Licensed & Insured', '⏱️ 60-Min Response Target', '💰 Upfront Pricing', '📞 No Hold Queues', '🏅 Verified Technicians'].map((b) => (
                <span key={b} className="bg-blue-800 text-blue-100 px-3 py-1 rounded-full">{b}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ── TRUST STATS BAR ───────────────────────────────────── */}
        <div className="bg-blue-950 text-white py-3 px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { stat: '50+', label: 'Cities Served' },
              { stat: '24/7', label: 'Live Dispatch' },
              { stat: '60 min', label: 'Response Target' },
              { stat: 'US', label: 'Nationwide Coverage' },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-2xl font-extrabold text-white">{item.stat}</p>
                <p className="text-white text-xs">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── HOW IT WORKS ──────────────────────────────────────── */}
        <section className="max-w-4xl mx-auto w-full px-4 py-12">
          <h2 className="text-3xl font-bold text-blue-900 text-center mb-2">How YoHomeFix Works</h2>
          <p className="text-gray-500 text-center mb-10 max-w-xl mx-auto">
            We are a call connection platform — not a plumbing company. When you call, we route you to the nearest available verified technician in your area.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '1', icon: '📞', title: 'You Call', desc: 'Call our 24/7 dispatch line. A live operator answers immediately — no automated menus, no hold queues.' },
              { step: '2', icon: '🔗', title: 'We Connect', desc: 'We route your call to the nearest available, licensed plumbing technician in your city or zip code.' },
              { step: '3', icon: '🔧', title: 'Tech Arrives', desc: 'Your local technician arrives, diagnoses the issue, and provides a written quote before any work begins.' },
            ].map((item) => (
              <div key={item.step} className="p-6 border border-gray-200 rounded-2xl text-center">
                <div className="w-10 h-10 bg-blue-900 text-white rounded-full flex items-center justify-center font-extrabold text-lg mx-auto mb-3">{item.step}</div>
                <p className="text-3xl mb-2">{item.icon}</p>
                <p className="font-bold text-blue-900 text-lg mb-2">{item.title}</p>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── DIAGNOSTIC TOOL CTA ────────────────────────────────── */}
        <section className="bg-blue-50 px-4 py-10">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-block bg-blue-900 text-white text-sm font-bold px-3 py-1 rounded-full mb-3">🔧 Free Tool</div>
            <h2 className="text-2xl md:text-3xl font-bold text-blue-900 mb-3">Not Sure What's Wrong?</h2>
            <p className="text-gray-600 mb-6 max-w-lg mx-auto">
              Use our free plumbing symptom checker. Select your symptom to get immediate safety guidance, likely problem category, and urgency level.
            </p>
            <Link
              href="/whats-wrong-with-my-plumbing"
              className="inline-flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-full font-bold transition-colors no-underline"
            >
              🔧 Try the Diagnostic Tool
            </Link>
          </div>
        </section>

        {/* ── SERVICE AUTHORITY GRID (Phase 2 — crawlable links) ── */}
        <section className="bg-gray-50 px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-blue-900 text-center mb-2">Plumbing Services We Dispatch</h2>
            <p className="text-gray-500 text-center mb-8">Every service dispatched 24/7 — licensed technicians, upfront pricing, no overtime surcharges</p>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { icon: '🚨', slug: 'emergency',           name: 'Emergency Plumbing',    urgency: 'Burst pipe, flooding, gas shutoff — dispatched in under 60 min',   city: 'New York' },
                { icon: '💧', slug: 'leak-repair',         name: 'Leak Repair',           urgency: 'Pinhole, slab, or supply line leak — stop damage before it spreads', city: 'Los Angeles' },
                { icon: '🌀', slug: 'drain-cleaning',      name: 'Drain Cleaning',        urgency: 'Clogged sink, tub, or sewer line — same-day clearing available',     city: 'Chicago' },
                { icon: '🔥', slug: 'water-heater-repair', name: 'Water Heater Repair',   urgency: 'No hot water or leaking tank — fast diagnosis and repair',           city: 'Houston' },
              ].map((s) => (
                <Link
                  key={s.slug}
                  href={`/${buildSlug(cityToSlug(s.city), s.slug)}`}
                  className="block bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-500 hover:shadow-md transition-all no-underline group"
                >
                  <p className="text-3xl mb-3">{s.icon}</p>
                  <p className="font-extrabold text-blue-900 text-base mb-2 group-hover:text-blue-700">{s.name}</p>
                  <p className="text-gray-500 text-xs leading-relaxed mb-3">{s.urgency}</p>
                  <span className="text-blue-600 text-xs font-bold group-hover:underline">Find local service →</span>
                </Link>
              ))}
            </div>
            {/* Mid-page CTA — after service grid */}
            <div className="bg-red-600 text-white rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="font-extrabold text-lg">Need a Plumber Right Now?</p>
                <p className="text-white text-sm">Live dispatcher — 60-min response target — no overtime charges</p>
              </div>
              <a
                href={`tel:${PHONE_NUMBER}`}
                onClick={() => trackCall('mid-cta-home')}
                data-track="mid-cta-home"
                className="bg-white text-red-600 hover:bg-red-50 px-6 py-3 rounded-full font-extrabold whitespace-nowrap transition-colors"
              >
                📞 Call Now
              </a>
            </div>
          </div>
        </section>

        {/* ── EMERGENCY SERVICE CLUSTER ─────────────────────────── */}
        <section className="max-w-4xl mx-auto w-full px-4 py-12">
          <h2 className="text-2xl font-bold text-blue-900 mb-1">Emergency Plumbing by City</h2>
          <p className="text-gray-500 text-sm mb-6">Select your city for local emergency plumbing dispatch information and direct call access.</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
            {TOP_CITIES.map((name) => {
              const city = SEED_CITIES.find((c) => c.name === name);
              if (!city) return null;
              return (
                <Link
                  key={name}
                  href={`/${buildSlug(cityToSlug(name), 'emergency')}`}
                  className="p-3 bg-red-50 border border-red-200 rounded-lg hover:border-red-500 hover:bg-red-100 text-center no-underline transition-all"
                >
                  <p className="font-semibold text-red-800 text-sm">{name}</p>
                  <p className="text-white text-xs">{city.stateCode} · Emergency</p>
                </Link>
              );
            })}
          </div>

          <h2 className="text-2xl font-bold text-blue-900 mb-1">Leak Repair by City</h2>
          <p className="text-gray-500 text-sm mb-6">Pinhole leaks, slab leaks, and supply line failures — find your city&apos;s leak repair page.</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
            {LEAK_CITIES.map((name) => {
              const city = SEED_CITIES.find((c) => c.name === name);
              if (!city) return null;
              return (
                <Link
                  key={name}
                  href={`/${buildSlug(cityToSlug(name), 'leak-repair')}`}
                  className="p-3 bg-blue-50 border border-blue-200 rounded-lg hover:border-blue-500 hover:bg-blue-100 text-center no-underline transition-all"
                >
                  <p className="font-semibold text-blue-800 text-sm">{name}</p>
                  <p className="text-blue-400 text-xs">{city.stateCode} · Leak Repair</p>
                </Link>
              );
            })}
          </div>

          {/* Drain + Water Heater city clusters */}
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">Emergency Drain Service by City</h3>
              <div className="grid grid-cols-2 gap-2">
                {['Atlanta','Kansas City','Nashville','Memphis','Louisville','Baltimore','Milwaukee','Portland','Las Vegas','Oklahoma City'].map((name) => {
                  const city = SEED_CITIES.find((c) => c.name === name);
                  if (!city) return null;
                  return (
                    <Link key={name} href={`/${buildSlug(cityToSlug(name), 'drain-cleaning')}`}
                      className="p-2 bg-green-50 border border-green-200 rounded-lg hover:border-green-500 text-center no-underline transition-all"
                      title={`Emergency drain service in ${name}`}>
                      <p className="font-semibold text-green-800 text-xs">{name}</p>
                      <p className="text-green-400 text-xs">Drain Service</p>
                    </Link>
                  );
                })}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">Water Heater Repair by City</h3>
              <div className="grid grid-cols-2 gap-2">
                {['Minneapolis','Virginia Beach','New Orleans','St. Louis','Richmond','Sacramento','Mesa','Fresno','Colorado Springs','Cleveland'].map((name) => {
                  const city = SEED_CITIES.find((c) => c.name === name);
                  if (!city) return null;
                  return (
                    <Link key={name} href={`/${buildSlug(cityToSlug(name), 'water-heater-repair')}`}
                      className="p-2 bg-orange-50 border border-orange-200 rounded-lg hover:border-orange-500 text-center no-underline transition-all">
                      <p className="font-semibold text-orange-800 text-xs">{name}</p>
                      <p className="text-orange-400 text-xs">{city.stateCode}</p>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── ALL CITIES GRID ────────────────────────────────────── */}
        <section className="bg-gray-50 px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-blue-900 text-center mb-2">All {SEED_CITIES.length} Cities We Serve</h2>
            <p className="text-gray-500 text-center mb-8">Click your city for local plumber dispatch and service pages</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {SEED_CITIES.map((city) => {
                const slug = buildSlug(cityToSlug(city.name), 'emergency');
                return (
                  <Link
                    key={city.name}
                    href={`/${slug}`}
                    className="p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow text-center no-underline transition-all"
                  >
                    <p className="font-semibold text-blue-900 text-sm">{city.name}</p>
                    <p className="text-gray-700 text-xs">{city.stateCode}</p>
                  </Link>
                );
              })}
            </div>
            <div className="text-center mt-6">
              <Link href="/plumber-usa" className="inline-block bg-blue-900 text-white px-6 py-3 rounded-full font-bold hover:bg-blue-800 transition-colors no-underline">
                Browse emergency plumbers in every US city
              </Link>
            </div>
          </div>
        </section>

        {/* ── COST GUIDES HUB ─────────────────────────────────── */}
        <section className="max-w-4xl mx-auto w-full px-4 py-12">
          <h2 className="text-2xl font-bold text-blue-900 mb-2 text-center">Plumbing Cost Guides</h2>
          <p className="text-gray-500 text-center mb-6 max-w-xl mx-auto">
            See city-adjusted pricing for common services before you call.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {['New York','Los Angeles','Chicago','Houston','Phoenix','Dallas','San Antonio','San Diego','Austin','Philadelphia'].map((name) => (
              <Link
                key={name}
                href={`/cost/${cityToSlug(name)}`}
                className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:border-yellow-500 text-center no-underline transition-all"
                title={`Plumbing cost guide for ${name}`}
              >
                <p className="font-semibold text-yellow-800 text-sm">{name}</p>
                <p className="text-yellow-600 text-xs">Cost guide</p>
              </Link>
            ))}
          </div>
        </section>

        {/* ── STATE COVERAGE HUB (Phase 3) ──────────────────────── */}
        <section className="max-w-4xl mx-auto w-full px-4 py-12">
          <h2 className="text-3xl font-bold text-blue-900 text-center mb-2">Plumber Coverage by State</h2>
          <p className="text-gray-500 text-center mb-8 max-w-xl mx-auto">
            YoHomeFix operates across {STATES.length} states. Select your state for local plumber information, city coverage, and direct dispatch.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {STATES.slice(0, 32).map((s) => (
              <Link
                key={s.code}
                href={`/plumber-${s.slug}`}
                className="flex items-center gap-2 p-3 border border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 no-underline transition-all group"
                title={`Emergency plumber in ${s.name}`}
              >
                <span className="text-xs font-extrabold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">{s.code}</span>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-800 truncate">{s.name} emergency plumber</span>
              </Link>
            ))}
          </div>
          {STATES.length > 32 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {STATES.slice(32).map((s) => (
                <Link key={s.code} href={`/plumber-${s.slug}`}
                  className="px-3 py-1 border border-gray-200 rounded-full text-xs text-blue-700 font-semibold hover:border-blue-400 hover:bg-blue-50 no-underline transition-colors"
                  title={`Emergency plumber in ${s.name}`}>
                  Emergency plumber in {s.name}
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ── TRUST SECTION (Phase 4) ────────────────────────────── */}
        <section className="bg-blue-900 text-white px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-extrabold text-center mb-2">Why Homeowners Trust YoHomeFix</h2>
            <p className="text-white text-center mb-10 max-w-xl mx-auto">Every technician in our dispatch network is verified. Every job starts with an upfront written quote.</p>
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              {[
                { icon: '🏅', title: 'Licensed & Insured', desc: 'Every technician holds a valid state plumbing license and carries liability insurance. Credentials are verified before network admission.' },
                { icon: '⏱️', title: '24/7 Dispatch — 60-Min Target', desc: 'Live operators available around the clock. We aim to have a technician at your door within 60 minutes. No overtime surcharges — ever.' },
                { icon: '💰', title: 'Upfront Pricing Only', desc: 'Written quote before any work begins. The price you agree to is the price you pay — no hidden fees, no mid-job surprises.' },
                { icon: '📞', title: 'Live Dispatcher — No Menus', desc: 'A real person answers your call. No automated phone trees, no callback lists. You are routed to a local technician in seconds.' },
                { icon: '📍', title: 'Truly Local Technicians', desc: 'Your call routes to a contractor who works in your area — familiar with local codes, infrastructure, and permit requirements.' },
                { icon: '🔧', title: 'Full-Scope Plumbing', desc: 'Emergency, leak repair, drain cleaning, pipe burst, water heater — our network handles the complete range of residential plumbing needs.' },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 p-5 bg-blue-800 rounded-2xl">
                  <div className="flex-shrink-0 w-11 h-11 bg-blue-700 rounded-full flex items-center justify-center text-2xl">{item.icon}</div>
                  <div>
                    <p className="font-bold text-white mb-1 text-sm">{item.title}</p>
                    <p className="text-white text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Bottom CTA */}
            <div className="text-center">
              <h3 className="text-2xl font-extrabold mb-3">Plumbing Emergency? Call Now — We Route You Instantly.</h3>
              <p className="text-white mb-2">Live dispatchers available 24/7. No hold queues. No automated menus.</p>
              <p className="text-white text-sm mb-6">YoHomeFix is a call connection platform — your call goes directly to a verified local technician.</p>
              <a
                href={`tel:${PHONE_NUMBER}`}
                onClick={() => trackCall('bottom-cta-home')}
                data-track="bottom-cta-home"
                className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white px-8 py-5 rounded-full text-xl font-extrabold shadow-xl transition-colors"
              >
                📞 Call Today — 24/7
              </a>
            </div>
          </div>
        </section>

        {/* ── EXPERIENCES ───────────────────────────────────────── */}
        <section className="bg-gray-50 px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-blue-900 text-center mb-2">What Homeowners Experience</h2>
            <p className="text-gray-500 text-center mb-8 max-w-xl mx-auto">Representative experiences from homeowners who used our dispatch network. Individual results may vary.</p>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { quote: 'The technician arrived within the hour. Diagnosed the burst pipe immediately and had the repair done before it caused further damage.', label: 'Emergency Pipe Repair' },
                { quote: 'Called at midnight for a flooding issue. A live person answered right away and had someone at our door faster than I expected.', label: 'After-Hours Dispatch' },
                { quote: 'Was given a clear price before any work started. No hidden fees, no pressure. Exactly what I needed during a stressful situation.', label: 'Upfront Pricing' },
                { quote: 'The drain had been slow for weeks. One call and the problem was resolved same day. Simple, professional, no upselling.', label: 'Drain Cleaning' },
                { quote: 'Water heater stopped working on a cold morning. The network found a local technician quickly and the fix was straightforward.', label: 'Water Heater Service' },
                { quote: 'Appreciated that the dispatcher asked the right questions upfront. The technician who arrived already knew what to bring.', label: 'Leak Repair' },
              ].map((item) => (
                <div key={item.label} className="bg-white border border-gray-200 rounded-xl p-5">
                  <p className="text-gray-700 text-sm leading-relaxed mb-3">&ldquo;{item.quote}&rdquo;</p>
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">{item.label}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-700 mt-6 text-center">These are representative experiences based on common service outcomes. They do not represent specific individuals or guaranteed results.</p>
          </div>
        </section>

        {/* ── GUIDES & RESOURCES ────────────────────────────────── */}
        <section className="max-w-4xl mx-auto w-full px-4 py-12">
          <h2 className="text-2xl font-bold text-blue-900 mb-6">Plumbing Guides & Resources</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { href: '/guides/how-to-prevent-frozen-pipes',       label: 'How to Prevent Frozen Pipes' },
              { href: '/guides/signs-you-need-a-plumber',          label: 'Signs You Need a Plumber' },
              { href: '/guides/how-to-shut-off-water-in-emergency',label: 'How to Shut Off Water in an Emergency' },
              { href: '/guides/hard-water-effects-on-plumbing',    label: 'Hard Water Effects on Plumbing' },
              { href: '/guides/water-heater-maintenance-guide',    label: 'Water Heater Maintenance Guide' },
              { href: '/guides',                                    label: 'View All Guides →' },
            ].map((g) => (
              <Link key={g.href} href={g.href}
                className="block p-4 border border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-sm no-underline transition-all group">
                <p className="text-sm font-semibold text-blue-800 group-hover:text-blue-600">{g.label}</p>
              </Link>
            ))}
          </div>
        </section>

        <div className="max-w-4xl mx-auto w-full px-4">
          <EditorialFooter pageType="homepage" />
        </div>

        </main>

        {/* ── FOOTER ────────────────────────────────────────────── */}
        <footer className="bg-gray-900 text-gray-300 px-4 py-10">
          <div className="max-w-4xl mx-auto flex flex-wrap justify-between gap-6 mb-6">
            <div>
              <p className="text-white font-bold text-lg mb-1">YoHomeFix</p>
              <p className="text-gray-400 text-xs mb-2">Emergency plumbing call connection platform</p>
              <a href={`tel:${PHONE_NUMBER}`} onClick={() => trackCall('footer-home')} data-track="footer-home" className="text-white font-bold">
                Call Now — 24/7
              </a>
            </div>
            <div>
              <p className="text-white font-semibold mb-2">Top Cities</p>
              <ul className="space-y-1 text-sm">
                {TOP_CITIES.slice(0, 6).map((name) => (
                  <li key={name}>
                    <Link href={`/${buildSlug(cityToSlug(name), 'emergency')}`} className="text-gray-300 hover:text-white underline underline-offset-4 hover:no-underline py-2 inline-block min-h-[44px] flex items-center">Emergency plumber in {name}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-white font-semibold mb-2">State Hubs</p>
              <ul className="space-y-1 text-sm">
                {['california','texas','florida','new-york','illinois','georgia','washington','colorado'].map((slug) => {
                  const s = STATES.find((st) => st.slug === slug);
                  return s ? (
                    <li key={slug}>
                      <Link href={`/plumber-${slug}`} className="text-gray-300 hover:text-white underline underline-offset-4 hover:no-underline py-2 inline-block min-h-[44px] flex items-center">Emergency plumber in {s.name}</Link>
                    </li>
                  ) : null;
                })}
              </ul>
            </div>
            <div>
              <p className="text-white font-semibold mb-2">Services</p>
              <ul className="space-y-1 text-sm">
                {[
                  { href: `/${buildSlug(cityToSlug('New York'), 'emergency')}`,           label: 'Emergency plumber in New York' },
                  { href: `/${buildSlug(cityToSlug('Los Angeles'), 'leak-repair')}`,      label: 'Leak repair in Los Angeles' },
                  { href: `/${buildSlug(cityToSlug('Chicago'), 'drain-cleaning')}`,       label: 'Drain cleaning in Chicago' },
                  { href: `/${buildSlug(cityToSlug('Houston'), 'pipe-burst-repair')}`,    label: 'Pipe burst repair in Houston' },
                  { href: `/${buildSlug(cityToSlug('Phoenix'), 'water-heater-repair')}`,  label: 'Water heater repair in Phoenix' },
                ].map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-gray-300 hover:text-white underline underline-offset-4 hover:no-underline py-2 inline-block min-h-[44px] flex items-center">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-white font-semibold mb-2">Resources</p>
              <ul className="space-y-1 text-sm">
                <li><Link href="/guides" className="text-gray-300 hover:text-white underline underline-offset-4 hover:no-underline py-2 inline-block min-h-[44px] flex items-center">Plumbing guides</Link></li>
                <li><Link href="/plumber-usa" className="text-gray-300 hover:text-white underline underline-offset-4 hover:no-underline py-2 inline-block min-h-[44px] flex items-center">Emergency plumbers in every city</Link></li>
                <li><Link href="/faq" className="text-gray-300 hover:text-white underline underline-offset-4 hover:no-underline py-2 inline-block min-h-[44px] flex items-center">Frequently asked questions</Link></li>
                <li><Link href="/about" className="text-gray-300 hover:text-white underline underline-offset-4 hover:no-underline py-2 inline-block min-h-[44px] flex items-center">About YoHomeFix</Link></li>
                <li><Link href="/how-yohomefix-works" className="text-gray-300 hover:text-white underline underline-offset-4 hover:no-underline py-2 inline-block min-h-[44px] flex items-center">How YoHomeFix works</Link></li>
                <li><Link href="/contact" className="text-gray-300 hover:text-white underline underline-offset-4 hover:no-underline py-2 inline-block min-h-[44px] flex items-center">Contact us</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-white font-semibold mb-2">Editorial & Trust</p>
              <ul className="space-y-1 text-sm">
                <li><Link href="/why-trust-yohomefix" className="text-gray-300 hover:text-white underline underline-offset-4 hover:no-underline py-2 inline-block min-h-[44px] flex items-center">Why trust YoHomeFix</Link></li>
                <li><Link href="/authors" className="text-gray-300 hover:text-white underline underline-offset-4 hover:no-underline py-2 inline-block min-h-[44px] flex items-center">Authors</Link></li>
                <li><Link href="/editorial-policy" className="text-gray-300 hover:text-white underline underline-offset-4 hover:no-underline py-2 inline-block min-h-[44px] flex items-center">Editorial policy</Link></li>
                <li><Link href="/sources" className="text-gray-300 hover:text-white underline underline-offset-4 hover:no-underline py-2 inline-block min-h-[44px] flex items-center">Sources & methodology</Link></li>
                <li><Link href="/press" className="text-gray-300 hover:text-white underline underline-offset-4 hover:no-underline py-2 inline-block min-h-[44px] flex items-center">Press</Link></li>
                <li><Link href="/media-kit" className="text-gray-300 hover:text-white underline underline-offset-4 hover:no-underline py-2 inline-block min-h-[44px] flex items-center">Media kit</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-white font-semibold mb-2">Legal</p>
              <ul className="space-y-1 text-sm">
                <li><Link href="/disclaimer" className="text-gray-300 hover:text-white underline underline-offset-4 hover:no-underline py-2 inline-block min-h-[44px] flex items-center">Service disclaimer</Link></li>
                <li><Link href="/privacy-policy" className="text-gray-300 hover:text-white underline underline-offset-4 hover:no-underline py-2 inline-block min-h-[44px] flex items-center">Privacy policy</Link></li>
                <li><Link href="/terms-of-service" className="text-gray-300 hover:text-white underline underline-offset-4 hover:no-underline py-2 inline-block min-h-[44px] flex items-center">Terms of service</Link></li>
                <li><Link href="/sitemap.xml" className="text-gray-300 hover:text-white underline underline-offset-4 hover:no-underline py-2 inline-block min-h-[44px] flex items-center">Sitemap</Link></li>
              </ul>
            </div>
          </div>
          <div className="max-w-4xl mx-auto border-t border-gray-800 pt-4 text-center text-sm">
            <p className="mb-2">© {new Date().getFullYear()} YoHomeFix. All rights reserved. YoHomeFix is a call connection platform, not a licensed plumbing contractor.</p>
            <p className="mb-2">YoHomeFix is a free service to assist homeowners in connecting with local service providers. All contractors/providers are independent and YoHomeFix does not warrant or guarantee any work performed. It is the responsibility of the homeowner to verify that the hired contractor furnishes the necessary license and insurance required for the work being performed. All persons depicted in a photo or video are actors or models and not contractors listed on YoHomeFix.</p>
            <p>Same-day and 24/7 emergency services are subject to provider participation, location, technician availability, and demand. Availability is not guaranteed and may vary by market and appointment capacity.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
