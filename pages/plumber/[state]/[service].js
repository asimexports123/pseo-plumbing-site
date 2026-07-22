import Head from 'next/head';
import Link from 'next/link';
import {
  STATES, SEED_CITIES, SERVICES, PHONE_NUMBER,
  cityToSlug, buildSlug, CITY_DATA, isCityQualifiedForService, isStateQualifiedForService,
} from '../../../lib/cities';
import { RelatedGuides } from '../../../components/RelatedGuides';
import { EditorialFooter } from '../../../components/EditorialFooter';
import { Footer } from '../../../components/Footer';
import { Author } from '../../../components/Author';
import { Trust } from '../../../components/Trust';
import { Sources } from '../../../components/Sources';
import { buildOrganizationSchema, buildWebSiteSchema } from '../../../lib/schemas';
import { getDeterministicLastReviewed } from '../../../lib/dateUtils';

// ── State × Service intro paragraphs ──────────────────────────
const SERVICE_STATE_INTROS = {
  'emergency': (s, cities) =>
    `Emergency plumbing calls in ${s.name} spike during two distinct periods: the freeze season — when pipes in crawl spaces, attics, and exterior walls fail under sustained cold — and storm season, when aging sewer infrastructure backs up under heavy rainfall. In ${s.name}, ${s.fact}. Our dispatchers connect homeowners in ${cities.map(c => c.name).join(', ')}, and surrounding communities with a licensed technician within 60 minutes, 24 hours a day.`,

  'leak-repair': (s, cities) =>
    `Hidden water leaks cause more cumulative property damage in ${s.name} than any other single plumbing failure category. The state's combination of ${s.fact} means that leaks often go undetected longer than in more temperate markets. Our leak detection technicians serve ${cities.map(c => c.name).join(', ')}, and surrounding metro areas using acoustic listening equipment and thermal imaging cameras — non-invasive methods that locate the source precisely before any wall or floor material is opened.`,

  'drain-cleaning': (s, cities) =>
    `Drain blockages in ${s.name} follow predictable seasonal patterns tied to the state's climate and housing stock. In older neighborhoods with clay or cast iron sewer laterals, root infiltration during wet seasons creates partial blockages that become full backups by mid-year. In newer construction zones with hard water, scale buildup narrows drain pipe interiors over time. Our drain clearing technicians cover ${cities.map(c => c.name).join(', ')}, and surrounding areas with hydro-jetting, camera inspection, and snaking services available same-day.`,

  'pipe-burst-repair': (s, cities) =>
    `Burst pipe events in ${s.name} cluster tightly around freeze events and post-freeze thaw periods when ice-expanded pipe sections crack or joints pull apart as pressure returns. In ${s.name}, ${s.fact}. The result is a predictable surge in emergency pipe repair calls across ${cities.map(c => c.name).join(', ')}, and neighboring communities every winter season. Our technicians respond within 60 minutes and arrive stocked with the pipe materials and fittings most common in ${s.name}'s housing stock.`,

  'water-heater-repair': (s, cities) =>
    `Water heater failures in ${s.name} are concentrated in two failure modes shaped by the state's infrastructure profile. In areas with hard water, calcium scale builds up on heating elements and tank floors, reducing efficiency and accelerating wear. In older neighborhoods, aging anode rods and corroded tank linings lead to rust and sediment. Our water heater technicians serve ${cities.map(c => c.name).join(', ')}, and the wider ${s.name} metro, stocking both tank and tankless replacement units for same-day installation.`,

  'whole-house-repiping': (s, cities) =>
    `Whole-house repiping is a planned replacement project for homes where recurring leaks, corrosion, restricted flow, or aging pipe materials make continued spot repairs unreliable. Across ${s.name}, technicians assess the existing system, access routes, fixture count, and documented repair history before recommending a targeted reroute or full repipe for homeowners in ${cities.map(c => c.name).join(', ')}, and nearby communities.`,

  'main-water-shutoff-valve-repair': (s, cities) =>
    `A reliable main water shutoff valve limits damage when a pipe, appliance line, or fitting fails. Across ${s.name}, technicians inspect valves that leak, seize, or fail to close fully, confirm the proper water-isolation point, and safely repair or replace the component for homeowners in ${cities.map(c => c.name).join(', ')}, and surrounding areas.`,
};

// ── State × Service FAQs ───────────────────────────────────────
const SERVICE_STATE_FAQS = {
  'emergency': (s) => [
    { q: `How quickly can an emergency plumber reach me in ${s.name}?`, a: `Our target response time throughout ${s.name} is under 60 minutes from the time you call. A live dispatcher — not an answering service — confirms your exact address and dispatches the nearest available technician immediately.` },
    { q: `Do you charge extra for emergency calls in ${s.name} on weekends or holidays?`, a: `No. Pricing in ${s.name} is flat-rate regardless of when you call. Your technician provides a written upfront quote on arrival, and that quote does not change because it's a Sunday or a holiday.` },
    { q: `What are the most common plumbing emergencies in ${s.name}?`, a: `The most frequent emergency calls across ${s.name} involve burst or frozen pipes during cold weather, sewer line backups following heavy rain, water heater failures, and active supply line leaks that have reached the point of flooding. ${s.fact.charAt(0).toUpperCase() + s.fact.slice(1)}, which makes emergency preparedness particularly important for ${s.name} homeowners.` },
    { q: `Is emergency plumbing service available in smaller ${s.name} cities and towns?`, a: `Yes. Our network covers major metros and surrounding communities throughout ${s.name}. When you call, the dispatcher confirms exact service availability at your address before sending a technician.` },
  ],
  'leak-repair': (s) => [
    { q: `How do you find hidden leaks in ${s.name} homes without tearing up walls?`, a: `We use acoustic listening devices and thermal imaging cameras to pinpoint leak locations without destructive access. These tools detect the sound signature and heat trace of active water movement through walls, floors, and slabs — letting us identify the precise location before opening any surface.` },
    { q: `Does homeowners insurance cover leak repair in ${s.name}?`, a: `Coverage depends on your policy and the cause of the leak. Sudden, accidental damage is frequently covered; gradual leaks from aging pipes generally are not. We provide detailed written documentation of the repair that you can submit to your insurer.` },
    { q: `What causes slab leaks in ${s.name} homes?`, a: `Slab leaks in ${s.name} are primarily caused by soil movement beneath the foundation — expansive clay or caliche soils shift as moisture levels change, repeatedly flexing supply lines embedded in or under concrete until a joint or pipe wall gives way. Hard water chemistry can also accelerate internal pipe corrosion.` },
    { q: `How long does leak detection and repair typically take in ${s.name}?`, a: `A standard leak detection visit in ${s.name} takes 1–2 hours for the diagnostic phase. Simple pipe repairs are typically completed the same day. Slab leak repairs or complex rerouting projects may require a second visit.` },
  ],
  'drain-cleaning': (s) => [
    { q: `What drain cleaning method is best for ${s.name} homes?`, a: `Drain snaking is appropriate for localized clogs in branch drains. Hydro-jetting is the preferred method for main sewer lines, root intrusion, and scale buildup — it scours the full pipe interior rather than simply breaking through the clog.` },
    { q: `How often should ${s.name} homeowners have their drains professionally cleaned?`, a: `Most ${s.name} homeowners benefit from a main sewer line inspection every 2–3 years, particularly in older neighborhoods with clay sewer laterals and mature trees nearby. Kitchens with heavy cooking use typically need drain cleaning annually.` },
    { q: `Can tree roots really block drains in ${s.name}?`, a: `Yes. Tree roots actively seek moisture and will infiltrate sewer pipe joints through hairline cracks. This is particularly common in established ${s.name} neighborhoods with mature street trees and older clay sewer laterals. Camera inspection confirms root presence; hydro-jetting cuts and flushes the roots.` },
    { q: `What are the signs my main sewer line is blocked in ${s.name}?`, a: `Multiple slow drains in different rooms simultaneously, gurgling sounds from toilets when other fixtures are used, sewage odors from floor drains, and water backing up into the lowest fixtures in the house are all indicators of a main line obstruction.` },
  ],
  'pipe-burst-repair': (s) => [
    { q: `What should I do immediately if a pipe bursts in my ${s.name} home?`, a: `Shut off your main water supply valve immediately — this stops all water flow from the burst pipe. Then move valuables away from the water, turn off electricity in flooded areas if safe, and call our emergency line. A dispatcher will guide you through additional steps while a technician is en route.` },
    { q: `Which pipes are most likely to burst in ${s.name} homes?`, a: `In ${s.name}, the highest-risk pipes are those in unheated or poorly insulated spaces — crawl spaces, attics, exterior walls, and uninsulated garages. Older galvanized steel and copper pipes are more susceptible because age and corrosion thin the pipe wall.` },
    { q: `Is burst pipe repair covered by homeowners insurance in ${s.name}?`, a: `Sudden accidental pipe bursts — particularly freeze events — are frequently covered by standard homeowners insurance policies. Gradual leaks that were ignored are typically not covered. Document the damage with photos immediately and provide written repair documentation to your insurer.` },
    { q: `How can I prevent pipe bursts in my ${s.name} home before cold weather?`, a: `Insulate pipes in crawl spaces, attics, and exterior walls; locate and test your main shutoff valve before winter; keep interior heat above 55°F even when away; disconnect outdoor hoses; and schedule a pre-winter inspection for older homes with vulnerable pipe runs.` },
  ],
  'water-heater-repair': (s) => [
    { q: `How long should a water heater last in ${s.name}?`, a: `Standard tank water heaters in ${s.name} typically last 8 to 12 years. Units in hard water areas often fail closer to 8 years without regular maintenance flushing. Tankless units last 15 to 20 years with proper annual servicing.` },
    { q: `What are the signs I need water heater repair in ${s.name}?`, a: `Warning signs include: discolored or rusty hot water, a rotten egg smell from hot taps, rumbling or popping sounds from the tank, water pooling around the base of the unit, inconsistent hot water temperature, and noticeably higher energy bills.` },
    { q: `Can I get same-day water heater replacement in ${s.name}?`, a: `Yes, in most cases. We stock the most commonly used 40- and 50-gallon gas and electric tank units, as well as popular tankless models, and can complete same-day replacement throughout ${s.name}.` },
    { q: `Is a tankless water heater a good choice for a ${s.name} home?`, a: `For most ${s.name} homeowners, a properly sized tankless unit offers meaningful advantages: continuous hot water on demand, 20–30% lower energy consumption than tank units, and a longer service life of 15–20 years. The higher upfront installation cost is typically recovered in energy savings over 5–7 years.` },
  ],
  'whole-house-repiping': (s) => [
    { q: `When does a ${s.name} home need whole-house repiping?`, a: `Recurring leaks on several pipe runs, poor flow at multiple fixtures, corroded piping, and mounting spot-repair costs are signals to schedule a full assessment. The appropriate scope depends on the home's verified pipe condition and access.` },
    { q: `Can I repipe only part of my ${s.name} home?`, a: `Yes. A targeted reroute or branch replacement can be appropriate when failures are limited to part of the system. The recommendation should compare the remaining pipe condition with the cost of repeated repairs.` },
    { q: `What affects repiping cost in ${s.name}?`, a: `Home size, fixture count, pipe material, access, routing, permits, and restoration requirements all affect cost. A written assessment is the reliable way to compare a targeted repair with a complete repipe.` },
    { q: `Will repiping disrupt water service in ${s.name}?`, a: `The project plan should identify expected interruptions and sequence work to minimize disruption. Timing depends on the home's layout, routing options, and inspection requirements.` },
  ],
  'main-water-shutoff-valve-repair': (s) => [
    { q: `What are signs that a main water shutoff valve needs replacement in ${s.name}?`, a: `A valve that leaks, will not turn, will not fully stop water flow, or has visible corrosion needs professional assessment. Reliable isolation is important during any active plumbing emergency.` },
    { q: `Can a plumber replace a seized main water shutoff valve in ${s.name}?`, a: `Yes. The technician identifies the valve location, pipe material, ownership boundary, and safe isolation method before replacement. Corroded adjacent piping can increase the scope.` },
    { q: `Should I test my main water shutoff valve in ${s.name}?`, a: `Periodic testing helps confirm that the valve can limit water damage during a burst pipe or major leak. Avoid forcing a valve that is seized or heavily corroded.` },
    { q: `What affects main shutoff valve replacement cost in ${s.name}?`, a: `Valve location, pipe material, corrosion, access, and any utility coordination affect the scope. An accessible interior replacement is typically simpler than a meter-adjacent or heavily corroded valve.` },
  ],
};

function getCityCardData(city) {
  const d = CITY_DATA[city.name];
  if (!d) return null;
  return {
    name: city.name,
    stateCode: city.stateCode,
    slug: cityToSlug(city.name),
    infraClass: d.infraClass,
    dominantFailure: d.dominantFailure,
    neighborhoods: d.neighborhoods || [],
  };
}

export async function getStaticPaths() {
  const paths = [];
  STATES.forEach((s) => {
    SERVICES.filter((svc) => isStateQualifiedForService(s.code, svc.slug)).forEach((svc) => {
      paths.push({ params: { state: s.slug, service: svc.slug } });
    });
  });
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const { state: stateSlug, service: serviceSlug } = params;
  const stateObj = STATES.find((s) => s.slug === stateSlug);
  if (!stateObj) return { notFound: true };
  const serviceObj = SERVICES.find((s) => s.slug === serviceSlug);
  if (!serviceObj) return { notFound: true };
  const stateCities = SEED_CITIES.filter((c) => c.stateCode === stateObj.code);
  const qualifiedStateCities = stateCities.filter((c) => isCityQualifiedForService(c.name, serviceObj.slug));
  const cityCards = qualifiedStateCities.map(getCityCardData).filter(Boolean);
  return { props: { stateObj, serviceObj, stateCities: qualifiedStateCities, cityCards } };
}

export default function StateServiceHub({ stateObj, serviceObj, stateCities, cityCards }) {
  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'https://yohomefix.com';
  const canonical = `${domain}/plumber/${stateObj.slug}/${serviceObj.slug}`;
  const title = serviceObj.slug === 'emergency'
    ? `Emergency Plumbing Service in ${stateObj.name} | 24/7 Licensed Dispatch | YoHomeFix`
    : serviceObj.slug === 'drain-cleaning'
    ? `Emergency Drain Cleaning in ${stateObj.name} | 24/7 Licensed Service | YoHomeFix`
    : `Emergency Plumber in ${stateObj.name} — ${serviceObj.shortName} | 24/7 Licensed Service | YoHomeFix`;
  const description = serviceObj.slug === 'emergency'
    ? `24/7 emergency plumbing dispatch across all of ${stateObj.name}. YoHomeFix connects you with a licensed plumber for burst pipes, severe leaks, sewer backups, and water heater failures — upfront pricing, no overtime charges. Call now.`
    : serviceObj.slug === 'pipe-burst-repair'
    ? `Burst pipe in ${stateObj.name}? Licensed emergency plumber dispatched in under 60 minutes — 24/7 live dispatch across all of ${stateObj.name}. Upfront pricing. Get help now.`
    : serviceObj.slug === 'leak-repair'
    ? `Water leak in ${stateObj.name}? Licensed emergency plumber dispatched in 60 min — slab, pinhole, or supply line. 24/7 availability across ${stateObj.name}. Upfront pricing. Call now.`
    : serviceObj.slug === 'drain-cleaning'
    ? `Emergency drain service across ${stateObj.name} — 24/7 drain cleaning, sewer clearing, and clog removal. Licensed plumbers dispatched fast. Upfront pricing. Call now.`
    : serviceObj.slug === 'whole-house-repiping'
    ? `Recurring pipe leaks in ${stateObj.name}? Licensed plumber assesses whole-house repiping, targeted reroutes, and replacement options. Written scope and upfront pricing. Call now.`
    : serviceObj.slug === 'main-water-shutoff-valve-repair'
    ? `Main water shutoff valve leaking or stuck in ${stateObj.name}? Licensed plumber provides safe valve repair and replacement with upfront pricing. Call now.`
    : `No hot water in ${stateObj.name}? Licensed emergency plumber dispatched in under 60 min — water heater repair and replacement, 24/7 live dispatch. Upfront pricing. Call now.`;
  const lastReviewed = getDeterministicLastReviewed(`plumber-${stateObj.slug}-${serviceObj.slug}`);

  const breadcrumbs = [
    { name: 'Home', url: `${domain}/` },
    { name: `Plumber ${stateObj.name}`, url: `${domain}/plumber-${stateObj.slug}` },
    { name: serviceObj.name, url: canonical },
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
        '@id': `${canonical}#service`,
        name: 'YoHomeFix',
        description,
        telephone: PHONE_NUMBER,
        url: canonical,
        priceRange: '$$',
        areaServed: { '@type': 'State', name: stateObj.name },
        serviceType: serviceObj.name,
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
        },
      },
      ...(cityCards.length > 0 ? [{
        '@type': 'ItemList',
        name: `${serviceObj.name} Cities in ${stateObj.name}`,
        numberOfItems: cityCards.length,
        itemListElement: cityCards.map((card, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: `${serviceObj.name} in ${card.name}, ${card.stateCode}`,
          url: `${domain}/${buildSlug(card.slug, serviceObj.slug)}`,
        })),
      }] : []),
      {
        '@type': 'FAQPage',
        mainEntity: (SERVICE_STATE_FAQS[serviceObj.slug] || SERVICE_STATE_FAQS['emergency'])(stateObj).map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: { '@type': 'Answer', text: faq.a },
        })),
      },
      buildOrganizationSchema(),
      buildWebSiteSchema(),
      {
        '@type': 'WebPage',
        '@id': canonical,
        url: canonical,
        name: title,
        description,
        datePublished: '2025-01-15',
        dateModified: lastReviewed,
        breadcrumb: { '@id': `${canonical}#breadcrumb` },
        isPartOf: { '@type': 'WebSite', '@id': `${domain}/#website` },
      },
    ],
  };

  const introText = (SERVICE_STATE_INTROS[serviceObj.slug] || SERVICE_STATE_INTROS['emergency'])(stateObj, stateCities);
  const faqs = (SERVICE_STATE_FAQS[serviceObj.slug] || SERVICE_STATE_FAQS['emergency'])(stateObj);

  const infraClassColor = { aging: 'bg-red-100 text-red-700', modern: 'bg-green-100 text-green-700', mixed: 'bg-yellow-100 text-yellow-800' };
  const infraClassLabel = { aging: 'Aging Infra', modern: 'Modern Infra', mixed: 'Mixed Infra' };

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

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-red-600 md:hidden" style={{ height: 64 }}>
        <a href={`tel:${PHONE_NUMBER}`} className="flex items-center justify-center gap-3 h-full text-white font-extrabold text-xl w-full" aria-label="Call emergency dispatch">
          📞 CALL NOW — 24/7
        </a>
      </div>

      <div className="font-sans bg-white min-h-screen flex flex-col pb-16 md:pb-0">
        <nav className="bg-blue-900 text-white px-4 py-3 flex justify-between items-center sticky top-0 z-40 shadow-lg">
          <Link href="/" className="text-2xl font-extrabold text-white no-underline">YoHomeFix</Link>
          <a href={`tel:${PHONE_NUMBER}`} className="hidden md:flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-full font-bold" aria-label="Call emergency dispatch">
            📞 Call Now
          </a>
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
            <div className="inline-block bg-red-600 text-sm font-bold px-3 py-1 rounded-full mb-4">⚡ Available 24/7 — All of {stateObj.name}</div>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-4">
              {serviceObj.slug === 'emergency'
                ? `Emergency Plumber in ${stateObj.name}`
                : serviceObj.slug === 'drain-cleaning'
                ? `Emergency Drain Cleaning in ${stateObj.name}`
                : `Emergency Plumber in ${stateObj.name} — ${serviceObj.shortName}`}
            </h1>
            <p className="text-lg text-white mb-6 max-w-2xl mx-auto">
              Licensed {serviceObj.name.toLowerCase()} technicians across {stateObj.name}. {stateObj.fact.charAt(0).toUpperCase() + stateObj.fact.slice(1)}.
            </p>
            <a href={`tel:${PHONE_NUMBER}`} className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white px-8 py-5 rounded-full text-xl font-extrabold shadow-xl transition-transform hover:scale-105" aria-label="Call emergency dispatch">
              📞 Get Help Now
            </a>
            <p className="text-white text-sm mt-3">Live dispatcher — 60-minute response target — no overtime charges</p>
          </div>
        </section>

        <main className="max-w-4xl mx-auto w-full px-4 py-10">

          {/* AI-friendly key takeaways */}
          <div className="mb-8 bg-green-50 border border-green-200 rounded-2xl p-5">
            <h2 className="text-lg font-bold text-green-900 mb-3">Key Takeaways — {serviceObj.name} in {stateObj.name}</h2>
            <ul className="space-y-2 text-sm text-green-800">
              <li className="flex gap-2"><span className="font-bold">✓</span> {serviceObj.name} is available 24/7 across {stateObj.name} through licensed, insured technicians.</li>
              <li className="flex gap-2"><span className="font-bold">✓</span> Local conditions matter: {stateObj.fact}.</li>
              <li className="flex gap-2"><span className="font-bold">✓</span> Technicians provide a written upfront quote before any work begins.</li>
            </ul>
          </div>

          <div className="mb-10">
            <h2 className="text-2xl font-bold text-blue-900 mb-3">{serviceObj.name} Across {stateObj.name}</h2>
            <p className="text-gray-700 leading-relaxed text-base">{introText}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { icon: '⏱️', label: '60-Min Response', sub: `Across ${stateObj.name}` },
              { icon: '📋', label: 'Upfront Quote', sub: 'Price locked before work' },
              { icon: '🛡️', label: 'Licensed & Insured', sub: `${stateObj.name} certified` },
              { icon: '🔧', label: serviceObj.shortName, sub: serviceObj.description },
            ].map(({ icon, label, sub }) => (
              <div key={label} className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
                <div className="text-2xl mb-1">{icon}</div>
                <div className="font-bold text-blue-900 text-sm">{label}</div>
                <div className="text-gray-500 text-xs mt-1">{sub}</div>
              </div>
            ))}
          </div>

          {cityCards.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-blue-900 mb-2">
                {serviceObj.name} by City in {stateObj.name}
              </h2>
              <p className="text-gray-500 text-sm mb-5">
                Click a city to see local infrastructure details and book {serviceObj.name.toLowerCase()} service.
              </p>
              <div className="grid md:grid-cols-2 gap-5">
                {cityCards.map((card) => (
                  <Link
                    key={card.slug}
                    href={`/${buildSlug(card.slug, serviceObj.slug)}`}
                    className="block border border-gray-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-sm transition-all no-underline group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-blue-900 group-hover:text-blue-700 text-base">{card.name}, {card.stateCode}</span>
                      {card.infraClass && (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${infraClassColor[card.infraClass] || 'bg-gray-100 text-gray-600'}`}>
                          {infraClassLabel[card.infraClass] || card.infraClass}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm leading-snug mb-2">{card.dominantFailure}</p>
                    {card.neighborhoods.length > 0 && (
                      <p className="text-gray-700 text-xs">
                        Serving: {card.neighborhoods.slice(0, 4).join(', ')}{card.neighborhoods.length > 4 ? ' & more' : ''}
                      </p>
                    )}
                    <span className="inline-block mt-3 text-blue-600 text-sm font-semibold group-hover:underline">
                      Book {serviceObj.name.toLowerCase()} in {card.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {cityCards.length === 0 && (
            <div className="mb-10 bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
              <p className="text-blue-800 mb-3">We&apos;re expanding {serviceObj.name.toLowerCase()} coverage in {stateObj.name}. Call us to check availability.</p>
              <a href={`tel:${PHONE_NUMBER}`} className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-full font-bold">
                📞 Check Availability
              </a>
            </div>
          )}

          <div className="mb-12 grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
              <h2 className="text-xl font-bold text-blue-900 mb-3">When to Call for {serviceObj.name} in {stateObj.name}</h2>
              <p className="text-gray-700 text-sm leading-relaxed">
                Call immediately if you notice active flooding, no water, multiple drains backing up at once, a water heater leaking from the base, or a burst pipe. In {stateObj.name}, {stateObj.fact}. Early intervention prevents the secondary damage that makes emergency calls far more expensive.
              </p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
              <h2 className="text-xl font-bold text-yellow-900 mb-3">What Affects {serviceObj.name} Cost in {stateObj.name}</h2>
              <p className="text-gray-700 text-sm leading-relaxed">
                The three largest cost drivers are access difficulty, pipe or fixture location, and local material costs. Jobs inside walls, under slabs, or in crawl spaces require more labor time. Your technician provides a written quote before work begins so you can approve the scope and price.
              </p>
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">All Plumbing Services in {stateObj.name}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {SERVICES.filter((s) => isStateQualifiedForService(stateObj.code, s.slug)).map((s) => {
                const isActive = s.slug === serviceObj.slug;
                return (
                  <Link
                    key={s.slug}
                    href={`/plumber/${stateObj.slug}/${s.slug}`}
                    aria-current={isActive ? 'page' : undefined}
                    className={`p-3 rounded-lg text-center text-sm font-semibold border transition-colors no-underline ${
                      isActive ? 'bg-blue-900 text-white border-blue-900' : 'bg-white text-blue-800 border-blue-200 hover:border-blue-600'
                    }`}
                    title={isActive ? `${s.name} in ${stateObj.name}` : `${s.name} in ${stateObj.name}`}
                  >
                    {isActive ? s.name : `${s.name} in ${stateObj.name}`}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-2xl font-bold text-blue-900 mb-6">
              Frequently Asked Questions — {serviceObj.name} in {stateObj.name}
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => {
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

          <div className="mb-10 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-5">
              <p className="text-gray-700 text-sm">
                View all plumbing services in {stateObj.name}:{' '}
                <Link href={`/plumber-${stateObj.slug}`} className="text-blue-700 font-semibold hover:underline">
                  {stateObj.name} emergency plumber directory
                </Link>
              </p>
            </div>
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-5">
              <p className="text-gray-700 text-sm">
                Looking for plumbers in other states?{' '}
                <Link href="/plumber-usa" className="text-blue-700 font-semibold hover:underline">
                  Browse emergency plumbers across the USA
                </Link>
              </p>
            </div>
          </div>

          <RelatedGuides serviceSlug={serviceObj.slug} cityName={stateObj.name} />
          <Trust pageType="state" lastReviewed={lastReviewed} />
          <Sources pageType="page" stateName={stateObj.name} stateCode={stateObj.code} />
          <EditorialFooter pageType="state-service" />
          <Author pageType="state-service" lastReviewed={lastReviewed} />

          <div className="bg-blue-900 text-white rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-extrabold mb-2">Need {serviceObj.name} in {stateObj.name} Right Now?</h2>
            <p className="text-white mb-5">Our dispatchers cover all of {stateObj.name} — 24/7, no overtime charges, upfront pricing</p>
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
