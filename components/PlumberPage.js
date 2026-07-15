import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useCallback } from 'react';
import {
  PHONE_NUMBER, SERVICES, SEED_CITIES,
  cityToSlug, buildSlug, getStateSlug, CITY_DATA,
} from '../lib/cities';
import { CITY_COORDS } from '../lib/cityCoords';
import { getDeterministicLastReviewed } from '../lib/dateUtils';
import { TrustBar } from './ConversionLayer';

const QuoteForm = dynamic(() => import('./ConversionLayer').then((m) => m.QuoteForm));
const MidPageCTA = dynamic(() => import('./ConversionLayer').then((m) => m.MidPageCTA));
const ExitIntentPopup = dynamic(() => import('./ConversionLayer').then((m) => m.ExitIntentPopup));
const RelatedGuides = dynamic(() => import('./RelatedGuides').then((m) => m.RelatedGuides));
const RelatedCosts = dynamic(() => import('./RelatedCosts').then((m) => m.RelatedCosts));
import { EditorialFooter } from './EditorialFooter';
import { buildOrganizationSchema, buildWebSiteSchema } from '../lib/schemas';
import { Footer } from './Footer';
import { Author } from './Author';
import { Trust } from './Trust';
import { Sources } from './Sources';
import { InternalLinks } from './InternalLinks';

function trackCall(label) {
  try {
    const key = 'yhf_call_clicks';
    const existing = JSON.parse(localStorage.getItem(key) || '{}');
    existing[label] = (existing[label] || 0) + 1;
    existing['__total'] = (existing['__total'] || 0) + 1;
    existing['__last'] = new Date().toISOString();
    localStorage.setItem(key, JSON.stringify(existing));
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'call_click', { event_label: label });
    }
  } catch (_) {}
}

const CTA_TEXT = {
  'hero':       'Get Emergency Help',
  'mid-page':   'Call Now — 24/7',
  'bottom':     'Call Today',
  'nav-desktop':'Call Now',
};

function CallButton({ label, size = 'lg', className = '' }) {
  const handleClick = useCallback(() => trackCall(label), [label]);
  const base = size === 'lg'
    ? 'inline-flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white rounded-full font-extrabold shadow-xl transition-transform hover:scale-105 px-8 py-5 text-xl'
    : 'inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold transition-colors px-5 py-2';
  const text = CTA_TEXT[label] || 'Call Now';
  return (
    <a
      href={`tel:${PHONE_NUMBER}`}
      onClick={handleClick}
      data-track={label}
      className={`${base} ${className}`}
      aria-label={`Call ${text} emergency dispatch`}
    >
      📞 {text}
    </a>
  );
}


const SERVICE_INTROS = {
  'emergency':          (city) => `When a plumbing emergency strikes in ${city}, knowing what's covered helps you act faster.`,
  'leak-repair':        (city) => `Leak repair in ${city} can range from a minor drip to a pressurized supply failure — here's the full scope of what our network handles.`,
  'drain-cleaning':     (city) => `Drain issues in ${city} vary by pipe age, soil type, and usage — our network covers the full range of cleaning and clearing needs.`,
  'pipe-burst-repair':  (city) => `Burst pipe situations in ${city} often require immediate triage followed by longer-term repair — here's what's included.`,
  'water-heater-repair':(city) => `Water heater problems in ${city} span from sediment buildup to full unit failure — our network covers all of it.`,
};

const SERVICES_COVERED = [
  { icon: '🚨', text: 'Emergency plumbing services for urgent issues like leaks and burst pipes' },
  { icon: '🔧', text: 'Repairs and maintenance for long-term system reliability' },
  { icon: '🌀', text: 'Drain cleaning to remove blockages and buildup' },
  { icon: '🔩', text: 'Replacement of damaged or failed plumbing components' },
  { icon: '🏗️', text: 'New plumbing installations for upgrades and renovations' },
];

function CityDeepContent({ cityName, stateCode, serviceSlug }) {
  const data = CITY_DATA[cityName];
  if (!data) return null;

  const serviceName = SERVICES.find((s) => s.slug === serviceSlug)?.name || 'plumbing service';
  const winterText = data.winterRisk === 'high'
    ? 'Winter freeze risk is high here.'
    : data.winterRisk === 'med'
      ? 'Occasional hard freezes can damage unprotected plumbing.'
      : 'Freezing temperatures are rare but outdoor fixtures can still be exposed during cold snaps.';

  return (
    <div className="mb-10 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-blue-900 mb-3">Common Plumbing Problems in {cityName}</h2>
        <p className="text-gray-700 leading-relaxed">
          The most common plumbing issue reported in {cityName} is {data.dominantFailure}. Local homes built during the {data.pipeEra} era typically have {data.pipeMaterial},
          which influences how leaks develop and how repairs are completed. The {data.climate} climate, combined with {data.soilType}, means plumbers often see
          {data.summerRiskNote}. {data.infraNarrative} These patterns make local experience valuable when diagnosing a problem quickly.
        </p>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-blue-900 mb-3">When to Call an Emergency Plumber in {cityName}</h2>
        <p className="text-gray-700 leading-relaxed">
          Call an emergency plumber in {cityName} if you have water actively leaking, a burst pipe, sewage backing up into the home, no hot water, or a fixture that cannot be
          shut off. {winterText} In summer, {data.summerRiskNote}. If you smell gas near a water heater, see water stains spreading on walls or ceilings, or hear water running when
          no taps are open, treat it as urgent. The first step is always to turn off the main water supply, then call for a licensed technician who knows the local {data.waterUtility} system and the typical infrastructure in {cityName} neighborhoods.
        </p>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-blue-900 mb-3">Preventive Plumbing Tips for {cityName} Homeowners</h2>
        <p className="text-gray-700 leading-relaxed">
          Preventive maintenance reduces the risk of a {serviceName.toLowerCase()} emergency. In {cityName}, homeowners should flush the water heater at least once a year to manage sediment
          {data.hardnessPpm > 120 ? `— especially important because local water hardness is ${data.hardnessPpm} ppm` : ''}. Outdoor hose bibs should be drained and insulated before cold weather, and exposed pipes in crawl spaces, garages, or attics should be wrapped.
          Test the main shutoff valve annually so it turns freely when needed. Avoid pouring grease or coffee grounds down drains, and use drain screens to catch hair. If your home has {data.pipeMaterial}, consider periodic inspections for corrosion, scale, or movement-related stress.
        </p>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-blue-900 mb-3">Local Water & Weather Considerations in {cityName}</h2>
        <p className="text-gray-700 leading-relaxed">
          {cityName} receives water from {data.waterUtility}. Water hardness is approximately {data.hardnessPpm} ppm, which affects scale buildup inside water heaters and fixtures. The local climate is classified as {data.climate}, with {data.summerRiskNote} and winter conditions that put pipes at {data.winterRisk} freeze risk. The sewer system uses {data.sewerSystem}. Soil conditions in {cityName} are {data.soilType}, which influences slab plumbing, foundation drainage, and the long-term durability of underground repairs. Understanding these local conditions helps explain why {data.dominantFailure} is the most frequently reported issue in the area.
        </p>
      </div>
    </div>
  );
}

const WHY_CHOOSE_US = [
  {
    icon: '🚨',
    title: 'Fast Response',
    desc: 'Our dispatch network is available around the clock. When you call, a live operator connects you to the nearest available technician — no hold queues, no callbacks.',
  },
  {
    icon: '🏅',
    title: 'Experienced Plumbing Professionals',
    desc: 'Every technician in our network holds a valid state plumbing license and carries liability insurance. Credentials are required before any contractor joins our dispatch network.',
  },
  {
    icon: '💬',
    title: 'Upfront Communication',
    desc: 'You receive a written quote before any work begins. Our network technicians are required to explain the scope and cost clearly — no surprise charges after the job.',
  },
  {
    icon: '🔧',
    title: 'Comprehensive Leak & Plumbing Solutions',
    desc: 'From pinhole leaks and burst pipes to drain blockages and water heater failures — our network covers the full range of residential plumbing needs in a single call.',
  },
  {
    icon: '📍',
    title: 'Local Service Coverage',
    desc: 'We dispatch locally. Your call routes to a technician who operates in your area — not a distant contractor unfamiliar with local infrastructure, codes, or conditions.',
  },
  {
    icon: '🤝',
    title: 'Customer-First Approach',
    desc: 'Our dispatchers are trained to listen, assess urgency, and connect you with the right technician quickly. You are kept informed at every step — from dispatch to arrival.',
  },
];

function WhyChooseUs() {
  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold text-blue-900 mb-1">Why Homeowners Choose Us</h2>
      <p className="text-gray-500 text-sm mb-6">What sets our dispatch network apart from a standard plumbing call center.</p>
      <div className="grid md:grid-cols-2 gap-4">
        {WHY_CHOOSE_US.map((item) => (
          <div key={item.title} className="flex gap-4 p-5 border border-gray-200 rounded-xl">
            <div className="flex-shrink-0 w-11 h-11 bg-blue-50 rounded-full flex items-center justify-center text-2xl">{item.icon}</div>
            <div>
              <p className="font-bold text-gray-900 mb-1 text-sm">{item.title}</p>
              <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ServicesCovered({ serviceSlug, cityName }) {
  const intro = (SERVICE_INTROS[serviceSlug] || SERVICE_INTROS['emergency'])(cityName);
  return (
    <div className="mb-10 border border-gray-200 rounded-2xl p-6">
      <h2 className="text-xl font-bold text-blue-900 mb-2">Services We Cover</h2>
      <p className="text-gray-600 text-sm mb-4">{intro}</p>
      <ul className="space-y-2">
        {SERVICES_COVERED.map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-gray-700 text-sm">
            <span className="flex-shrink-0 mt-0.5">{item.icon}</span>
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Helper function to extract clean city name for display
// Removes state suffix from city names like "Arlington TX" → "Arlington"
function getCityDisplayName(cityName, stateCode) {
  if (!cityName || !stateCode) return cityName;
  // Check if city name already ends with the state code (with or without space)
  const suffixes = [` ${stateCode}`, stateCode];
  for (const suffix of suffixes) {
    if (cityName.endsWith(suffix)) {
      return cityName.slice(0, -suffix.length).trim();
    }
  }
  return cityName;
}

export default function PlumberPage({ cityName, stateCode, service, content, pageSlug, nearbyCities }) {
  const cleanCityName = getCityDisplayName(cityName, stateCode);
  const location = stateCode ? `${cleanCityName}, ${stateCode}` : cityName;
  const serviceName = service?.name || 'Emergency Plumbing';
  const serviceSlug = service?.slug || 'emergency';
  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'https://yohomefix.com';
  const canonical = `${domain}/${pageSlug}`;
  const stateHubSlug = stateCode ? `plumber-${getStateSlug(stateCode)}` : null;
  const cityBaseSlug = buildSlug(cityToSlug(cityName), 'emergency');
  const lastReviewed = getDeterministicLastReviewed(pageSlug);

  const pageTitle = serviceSlug === 'emergency'
    ? `Emergency Plumber in ${location}`
    : serviceSlug === 'pipe-burst-repair'
    ? `Emergency Plumber in ${location} — Burst Pipe Repair`
    : serviceSlug === 'leak-repair'
    ? `Emergency Plumber in ${location} — Leak Repair`
    : serviceSlug === 'drain-cleaning'
    ? `Emergency Plumber in ${location} — Drain Cleaning`
    : serviceSlug === 'water-heater-repair'
    ? `Emergency Plumber in ${location} — Water Heater Repair`
    : serviceSlug === 'sewer-line-repair'
    ? `Emergency Plumber in ${location} — Sewer Line Repair`
    : serviceSlug === 'toilet-repair'
    ? `Emergency Plumber in ${location} — Toilet Repair`
    : serviceSlug === 'slab-leak-repair'
    ? `Emergency Plumber in ${location} — Slab Leak Repair`
    : serviceSlug === 'water-line-repair'
    ? `Emergency Plumber in ${location} — Water Line Repair`
    : serviceSlug === 'faucet-repair'
    ? `Emergency Plumber in ${location} — Faucet Repair`
    : `Emergency Plumber in ${location}`;
  const title = `${pageTitle} | 24/7 Licensed Service | YoHomeFix`;

  const description = serviceSlug === 'emergency'
    ? `Burst pipe or flooding in ${location}? YoHomeFix dispatches a licensed emergency plumber in under 60 min — live dispatcher answers 24/7, no overtime charges. Call now.`
    : serviceSlug === 'pipe-burst-repair'
    ? `Burst pipe in ${location}? Stop water damage now. Licensed emergency plumber on-site in under 60 minutes — 24/7 dispatch, upfront pricing, no overtime charges. Get help now.`
    : serviceSlug === 'leak-repair'
    ? `Water leak in ${location}? Pinhole, slab, or supply line — licensed emergency plumber dispatched in 60 min. 24/7 availability, upfront pricing before work begins. Call now.`
    : serviceSlug === 'drain-cleaning'
    ? `Clogged drain in ${location}? Licensed emergency plumber dispatched same-day — 24/7 availability, 60-min response target, upfront pricing before any work begins. Dispatch now.`
    : serviceSlug === 'water-heater-repair'
    ? `Need water heater repair in ${location}? Licensed emergency plumber dispatched in under 60 min — 24/7 live dispatch, no hot water crisis handled fast. Upfront pricing. Call now.`
    : serviceSlug === 'sewer-line-repair'
    ? `Sewer line problems in ${location}? Licensed emergency plumber handles main line repair, camera inspection, and trenchless repair. 24/7 dispatch, upfront pricing. Call now.`
    : serviceSlug === 'toilet-repair'
    ? `Toilet problems in ${location}? Licensed emergency plumber handles running toilets, clogs, leaks, and new installation. 24/7 dispatch, upfront pricing. Call now.`
    : serviceSlug === 'slab-leak-repair'
    ? `Slab leak in ${location}? Licensed emergency plumber provides detection, epoxy lining, and repair. 24/7 dispatch, upfront pricing. Call now.`
    : serviceSlug === 'water-line-repair'
    ? `Water line problems in ${location}? Licensed emergency plumber handles leak detection, section repair, and line replacement. 24/7 dispatch, upfront pricing. Call now.`
    : serviceSlug === 'faucet-repair'
    ? `Faucet problems in ${location}? Licensed emergency plumber handles dripping faucets, cartridge replacement, and new installation. 24/7 dispatch, upfront pricing. Call now.`
    : `Need water heater repair in ${location}? Licensed emergency plumber dispatched in under 60 min — 24/7 live dispatch, no hot water crisis handled fast. Upfront pricing. Call now.`;

  // Breadcrumb items
  const breadcrumbs = [
    { name: 'Home', url: `${domain}/` },
    ...(stateHubSlug ? [{ name: `Plumber ${stateCode}`, url: `${domain}/${stateHubSlug}` }] : []),
    { name: `Plumber ${cityName}`, url: `${domain}/${cityBaseSlug}` },
    ...(serviceSlug !== 'emergency' ? [{ name: serviceName, url: canonical }] : []),
  ];

  const coords = CITY_COORDS[cityName];
  const cityDataEntry = CITY_DATA[cityName];
  const neighborhoods = cityDataEntry?.neighborhoods || [];

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonical}#breadcrumb`,
        itemListElement: breadcrumbs.map((b, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: b.name,
          item: b.url,
        })),
      },
      buildOrganizationSchema(),
      buildWebSiteSchema(),
      {
        '@type': 'PlumbingService',
        '@id': `${domain}/#plumbingservice-${cityToSlug(cityName)}`,
        name: 'YoHomeFix',
        description,
        telephone: PHONE_NUMBER,
        url: canonical,
        priceRange: '$$',
        image: `${domain}/og-image.png`,
        areaServed: [
          {
            '@type': 'City',
            name: cityName,
            containedInPlace: { '@type': 'State', name: stateCode },
          },
          ...neighborhoods.map((n) => ({
            '@type': 'Place',
            name: `${n}, ${cityName}`,
          })),
        ],
        ...(coords ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: coords.lat,
            longitude: coords.lng,
          },
          hasMap: `https://www.google.com/maps/search/${encodeURIComponent(`plumber ${cityName} ${stateCode}`)}`,
        } : {}),
        openingHoursSpecification: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
          opens: '00:00',
          closes: '23:59',
        },
        availableChannel: {
          '@type': 'ServiceChannel',
          serviceUrl: canonical,
          servicePhone: PHONE_NUMBER,
          availableLanguage: 'English',
          serviceLocation: {
            '@type': 'Place',
            name: cityName,
            address: {
              '@type': 'PostalAddress',
              addressLocality: cityName,
              addressRegion: stateCode,
              addressCountry: 'US',
            },
          },
        },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: `${serviceName} in ${cityName}`,
          itemListElement: SERVICES.map((s) => ({
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: s.name,
              url: `${domain}/${buildSlug(cityToSlug(cityName), s.slug)}`,
            },
          })),
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: (content?.faqs || []).map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: { '@type': 'Answer', text: faq.a },
        })),
      },
      {
        '@type': 'WebPage',
        '@id': canonical,
        url: canonical,
        name: title,
        description,
        datePublished: '2025-01-15',
        dateModified: lastReviewed,
        speakable: {
          '@type': 'SpeakableSpecification',
          cssSelector: ['h1', '.speakable-intro'],
        },
        breadcrumb: { '@id': `${canonical}#breadcrumb` },
        isPartOf: { '@type': 'WebSite', '@id': `${domain}/#website` },
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </Head>

      {/* Sticky mobile CTA — no layout shift (fixed height reserved via pb-16) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden" style={{ height: 64, background: '#dc2626' }}>
        <a
          href={`tel:${PHONE_NUMBER}`}
          onClick={() => trackCall('sticky-mobile')}
          data-track="sticky-mobile"
          className="flex items-center justify-center gap-3 h-full w-full"
          style={{ color: '#ffffff', fontWeight: 900, fontSize: '1.2rem', letterSpacing: '0.01em', textDecoration: 'none' }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.6)', flexShrink: 0 }}>📞</span>
          <span>CALL NOW — 24/7 Emergency</span>
        </a>
      </div>

      <ExitIntentPopup cityName={cityName} serviceName={serviceName} />

      <div className="font-sans bg-white min-h-screen flex flex-col pb-16 md:pb-0">

        {/* Trust Bar */}
        <TrustBar cityName={cityName} />

        {/* Header */}
        <nav className="bg-blue-900 text-white px-4 py-3 flex justify-between items-center sticky top-0 z-40 shadow-lg">
          <Link href="/" className="text-2xl font-extrabold text-white no-underline">YoHomeFix</Link>
          <CallButton label="nav-desktop" size="sm" className="hidden md:inline-flex" />
          <a href={`tel:${PHONE_NUMBER}`} onClick={() => trackCall('nav-mobile')} className="md:hidden bg-red-600 text-white px-4 py-2 rounded-full font-bold text-sm" aria-label="Call emergency dispatch">Call Now</a>
        </nav>

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

        <main className="flex-1">

        {/* Hero — py reduced to py-6 so CTA is above fold on 1366x768 */}
        <section className="bg-gradient-to-br from-blue-900 to-blue-700 text-white px-4 py-6 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-block bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-full mb-3">
              ⚡ Emergency Available — 24/7
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
              {serviceSlug === 'emergency'
                ? `Emergency Plumber in ${location}`
                : `Emergency Plumber in ${location} — ${service?.shortName || serviceName}`}
            </h1>
            <p className="speakable-intro text-lg md:text-xl text-white mb-5 max-w-2xl mx-auto">
              Licensed plumber dispatched fast. We aim for 60-minute response. Upfront pricing before any work begins.
            </p>
            <CallButton label="hero" />
            <p className="text-white text-sm mt-2 mb-4">Tap to call — answered by a live dispatcher, 24/7</p>
            <div className="flex flex-wrap justify-center gap-3 text-sm">
              {['✅ Licensed & Insured', '⏱️ Fast Response', '💰 Upfront Pricing', '🔧 All Plumbing Jobs'].map((badge) => (
                <span key={badge} className="bg-blue-800 text-blue-100 px-3 py-1 rounded-full">{badge}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Secondary CTA strip — below hero, above main content */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-gray-700 text-sm font-medium text-center sm:text-left">
              🚨 Plumbing emergency? A live dispatcher is standing by right now.
            </p>
            <div className="flex items-center gap-3 flex-shrink-0">
              <a
                href={`tel:${PHONE_NUMBER}`}
                onClick={() => trackCall('secondary-cta')}
                data-track="secondary-cta"
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-full font-bold text-sm transition-colors no-underline"
              >
                📞 Call Now
              </a>
              <a
                href={`sms:${PHONE_NUMBER}`}
                onClick={() => trackCall('secondary-cta-sms')}
                data-track="secondary-cta-sms"
                className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-5 py-2 rounded-full font-bold text-sm transition-colors no-underline"
              >
                💬 Text Us
              </a>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto w-full px-4 py-10">

          {/* AI-friendly key takeaways */}
          <div className="mb-8 bg-green-50 border border-green-200 rounded-2xl p-5">
            <h2 className="text-lg font-bold text-green-900 mb-3">Key Takeaways — {serviceName} in {cityName}</h2>
            <ul className="space-y-2 text-sm text-green-800">
              <li className="flex gap-2"><span className="font-bold">✓</span> {serviceName} is available 24/7 in {cityName} through licensed, insured plumbers.</li>
              <li className="flex gap-2"><span className="font-bold">✓</span> Target response time is under 60 minutes; a live dispatcher answers every call.</li>
              <li className="flex gap-2"><span className="font-bold">✓</span> You receive a written upfront quote before any work begins.</li>
            </ul>
          </div>

          {/* Rich local context block — unique per city */}
          {content?.localSignal && (() => {
            const ls = content.localSignal;
            const winterBadge = ls.winterRisk === 'high' ? { label: `Cold-Weather Risk: High (avg ${ls.avgWinterTempF}°F)`, color: 'bg-blue-100 text-blue-800' }
              : ls.winterRisk === 'med' ? { label: `Cold-Weather Risk: Moderate (avg ${ls.avgWinterTempF}°F)`, color: 'bg-yellow-100 text-yellow-800' }
              : { label: `Mild Winter Climate (avg ${ls.avgWinterTempF}°F)`, color: 'bg-green-100 text-green-800' };
            return (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-8">
                <h2 className="text-lg font-bold text-blue-900 mb-3">📍 Plumbing Conditions in {cityName}</h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${winterBadge.color}`}>{winterBadge.label}</span>
                  {ls.climate && <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-700">{ls.climate} climate</span>}
                  {ls.pop && <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-700">Pop. {ls.pop}</span>}
                  {ls.infraClass && <span className={`text-xs font-semibold px-3 py-1 rounded-full ${ls.infraClass === 'aging' ? 'bg-red-100 text-red-700' : ls.infraClass === 'modern' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'}`}>Infrastructure: {ls.infraClass}</span>}
                </div>
                <div className="grid md:grid-cols-2 gap-3 text-sm text-blue-800">
                  <div><span className="font-semibold">Most common failure:</span> {ls.dominantFailure}</div>
                  <div><span className="font-semibold">Pipe era:</span> {ls.pipeMaterial}, {ls.pipeEra}</div>
                  <div className="md:col-span-2"><span className="font-semibold">Local risk note:</span> {ls.summerRiskNote}</div>
                  {ls.zipCodes && ls.zipCodes.length > 0 && (
                    <div className="md:col-span-2"><span className="font-semibold">Service zip codes:</span> {ls.zipCodes.join(', ')}</div>
                  )}
                  {ls.neighborhoods && ls.neighborhoods.length > 0 && (
                    <div className="md:col-span-2"><span className="font-semibold">Neighborhoods served:</span> {ls.neighborhoods.join(', ')}, and surrounding areas</div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Intro */}
          {content?.intro && (
            <p className="text-lg text-gray-700 leading-relaxed mb-8 border-l-4 border-blue-600 pl-4">
              {content.intro}
            </p>
          )}

          {/* Content Sections */}
          {(content?.sections || []).map((section, i) => (
            <div key={i} className="mb-10">
              <h2 className="text-2xl font-bold text-blue-900 mb-3">{section.heading}</h2>
              <p className="text-gray-700 leading-relaxed mb-4">{section.body}</p>
              {section.list && (
                <ul className="grid md:grid-cols-2 gap-2">
                  {section.list.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 font-bold mt-0.5 flex-shrink-0">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          {/* Topical authority — maintenance & emergency prep */}
          <div className="mb-10 bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-blue-900 mb-3">Preventive Maintenance & Emergency Prep for {cityName} Homeowners</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The best way to avoid an emergency {serviceName.toLowerCase()} call in {cityName} is to catch problems early. Locate your main water shutoff valve and test it once a year. In winter, keep interior temperatures above 55°F and insulate pipes in crawl spaces or attics. If your home has hard water or aging pipes, schedule a professional inspection every 1–2 years. Knowing these basics reduces damage and gives you faster control if a leak or burst does happen.
            </p>
            <div className="grid sm:grid-cols-2 gap-3 text-sm text-gray-700">
              <div className="flex gap-2"><span className="font-bold">✓</span> Test the main shutoff valve annually.</div>
              <div className="flex gap-2"><span className="font-bold">✓</span> Keep heat above 55°F during cold snaps.</div>
              <div className="flex gap-2"><span className="font-bold">✓</span> Insulate exposed pipes in unheated spaces.</div>
              <div className="flex gap-2"><span className="font-bold">✓</span> Schedule inspections every 1–2 years.</div>
            </div>
          </div>

          {/* Mid-page CTA */}
          <MidPageCTA cityName={cityName} serviceName={serviceName} />

          {/* Quote Form */}
          <QuoteForm cityName={cityName} defaultService={serviceSlug} />

          {/* Trust signals — icon-card layout with border emphasis */}
          <div className="mb-10">
            <h2 className="text-xl font-bold text-blue-900 mb-4">How We Work in {cityName}</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex gap-4 items-start p-5 bg-green-50 border-2 border-green-200 rounded-2xl">
                <div className="flex-shrink-0 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">✅</div>
                <div>
                  <p className="font-bold text-green-900 text-sm mb-1">Licensed &amp; Insured</p>
                  <p className="text-green-800 text-sm leading-relaxed">Every technician dispatched holds a valid state license and carries liability insurance.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start p-5 bg-yellow-50 border-2 border-yellow-300 rounded-2xl">
                <div className="flex-shrink-0 w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">💰</div>
                <div>
                  <p className="font-bold text-yellow-900 text-sm mb-1">Upfront Pricing</p>
                  <p className="text-yellow-800 text-sm leading-relaxed">You receive a written quote before any work begins. The price doesn&apos;t change mid-job.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start p-5 bg-blue-50 border-2 border-blue-300 rounded-2xl">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">⏱️</div>
                <div>
                  <p className="font-bold text-blue-900 text-sm mb-1">Fast Dispatch</p>
                  <p className="text-blue-800 text-sm leading-relaxed">We aim to have a technician at your {cityName} address within 60 minutes of your call.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Services Navigation */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">All Plumbing Services in {cityName}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {SERVICES.map((s) => {
                const href = `/${buildSlug(cityToSlug(cityName), s.slug)}`;
                const isActive = s.slug === serviceSlug;
                return (
                  <Link
                    key={s.slug}
                    href={href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`p-3 rounded-lg text-center text-sm font-semibold border transition-colors ${
                      isActive
                        ? 'bg-blue-900 text-white border-blue-900'
                        : 'bg-white text-blue-800 border-blue-200 hover:border-blue-600'
                    }`}
                    title={isActive ? `${s.name} in ${cityName}` : `Book ${s.name.toLowerCase()} in ${cityName}`}
                  >
                    {isActive ? s.name : `Book ${s.name} in ${cityName}`}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Services Covered — conversion support layer */}
          <ServicesCovered serviceSlug={serviceSlug} cityName={cityName} />

          {/* Pricing Guidance Section */}
          {content?.pricing && (
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-blue-900 mb-2">{content.pricing.heading}</h2>
              <p className="text-sm text-gray-500 mb-5 leading-relaxed">{content.pricing.disclaimer}</p>
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-blue-50 text-blue-900">
                      <th className="text-left px-4 py-3 font-semibold">Service</th>
                      <th className="text-left px-4 py-3 font-semibold">Typical Range</th>
                      <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {content.pricing.items.map((item, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 font-medium text-gray-800">{item.label}</td>
                        <td className="px-4 py-3 text-blue-700 font-semibold whitespace-nowrap">{item.low} – {item.high}</td>
                        <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{item.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-700 mt-3">* Ranges are national estimates for informational purposes only. Actual costs vary by location, scope, and materials. Your technician provides a written upfront quote before any work begins.</p>
            </div>
          )}

          {/* FAQ Section */}
          {content?.faqs && content.faqs.length > 0 && (
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-blue-900 mb-6">
                Frequently Asked Questions — {serviceName} in {cityName}
              </h2>
              <div className="space-y-4">
                {content.faqs.map((faq, i) => {
                  const firstSentenceMatch = faq.a.match(/^([^\.]+\.\s*)/);
                  const immediate = firstSentenceMatch ? firstSentenceMatch[1].trim() : faq.a;
                  const explanation = firstSentenceMatch ? faq.a.slice(firstSentenceMatch[0].length).trim() : '';
                  return (
                    <details key={i} className="border border-gray-200 rounded-xl p-4 group">
                      <summary className="font-semibold text-gray-800 cursor-pointer list-none flex justify-between items-center">
                        <h3 className="text-base m-0 font-semibold">{faq.q}</h3>
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
          )}

          {/* Nearby Cities — internal linking */}
          {nearbyCities && nearbyCities.length > 0 && (
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-blue-900 mb-2">Also Serving Nearby Cities</h2>
              <p className="text-gray-500 text-sm mb-4">
                YoHomeFix dispatches licensed plumbers across the wider {stateCode} region. Select a nearby city for local service details.
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                {nearbyCities.map((nearbyCity) => (
                  <div key={nearbyCity.slug} className="border border-gray-200 rounded-xl p-3">
                    <p className="font-semibold text-gray-800 text-sm mb-2">{nearbyCity.name}, {nearbyCity.stateCode}</p>
                    <div className="flex flex-wrap gap-1">
                      <Link
                        href={`/${buildSlug(nearbyCity.slug, serviceSlug)}`}
                        className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-semibold no-underline hover:bg-blue-700 transition-colors"
                        title={`${serviceName} in ${nearbyCity.name}, ${nearbyCity.stateCode}`}
                      >
                        {serviceName} in {nearbyCity.name}
                      </Link>
                      {serviceSlug !== 'emergency' && (
                        <Link
                          href={`/${buildSlug(nearbyCity.slug, 'emergency')}`}
                          className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs no-underline transition-colors"
                          title={`Emergency plumber in ${nearbyCity.name}, ${nearbyCity.stateCode}`}
                        >
                          Emergency Plumber
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* State Hub Link */}
          {stateHubSlug && (
            <div className="mb-4 bg-gray-50 border border-gray-200 rounded-xl p-5">
              <p className="text-gray-700 text-sm">
                Looking for plumbers across {stateCode}?{' '}
                <Link href={`/${stateHubSlug}`} className="text-blue-700 font-semibold hover:underline">
                  View all {stateCode} emergency plumbers and services
                </Link>
              </p>
            </div>
          )}
          {stateHubSlug && serviceSlug && (
            <div className="mb-10 bg-blue-50 border border-blue-200 rounded-xl p-5">
              <p className="text-blue-800 text-sm">
                See all {serviceName} providers across {stateCode}:{' '}
                <Link href={`/plumber/${stateHubSlug.replace('plumber-', '')}/${serviceSlug}`} className="text-blue-700 font-semibold hover:underline">
                  {serviceName} in {stateCode} — city-by-city directory
                </Link>
              </p>
            </div>
          )}

          {/* Cost page link — only for cities with a cost page */}
          {['New York','Los Angeles','Chicago','Houston','Phoenix','Dallas','San Antonio','San Diego','Austin','Philadelphia'].includes(cityName) && (
            <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-xl p-5 flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">💰</span>
              <div>
                <p className="font-semibold text-yellow-900 mb-1">Wondering what this will cost in {cityName}?</p>
                <p className="text-yellow-800 text-sm mb-2">See local pricing data for every plumbing service — adjusted for the {cityName} market.</p>
                <Link href={`/cost/${cityToSlug(cityName)}`} className="text-yellow-700 font-bold hover:underline text-sm">
                  {cityName} plumbing cost guide and 2025 pricing data
                </Link>
              </div>
            </div>
          )}

          {/* Why Homeowners Choose Us */}
          <WhyChooseUs />

          {/* City-specific deep content */}
          <CityDeepContent cityName={cityName} stateCode={stateCode} serviceSlug={serviceSlug} />

          {/* Topical authority — related guides and costs */}
          <RelatedGuides serviceSlug={serviceSlug} cityName={cityName} />
          <RelatedCosts cityName={cityName} />
          <InternalLinks cityName={cityName} stateCode={stateCode} serviceSlug={serviceSlug} nearbyCities={nearbyCities} />

          <Trust pageType="city" sourceCount={6} lastReviewed={lastReviewed} />
          <Sources pageType="city" cityName={cityName} stateCode={stateCode} />

          {/* EEAT footer */}
          <EditorialFooter pageType="city-service" />
          <Author pageType="city-service" lastReviewed={lastReviewed} />

          {/* Final CTA */}
          <div className="bg-blue-900 text-white rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-extrabold mb-2">Ready for Fast, Reliable Help in {cityName}?</h2>
            <p className="text-white mb-6">Licensed plumbers available right now. Upfront pricing before any work begins.</p>
            <CallButton label="bottom" />
          </div>

          {/* Availability disclaimer */}
          <p className="text-xs text-gray-700 text-center mt-6 leading-relaxed">
            Same-day and 24/7 emergency services are subject to provider participation, location, technician availability, and demand. Availability is not guaranteed and may vary by market and appointment capacity.
          </p>
        </div>

        </main>

        <Footer />
      </div>
    </>
  );
}
