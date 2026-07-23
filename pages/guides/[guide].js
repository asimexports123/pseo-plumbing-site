import Head from 'next/head';
import Link from 'next/link';
import { PHONE_NUMBER, SERVICES, STATES, SEED_CITIES, cityToSlug, buildSlug, isCityQualifiedForService } from '../../lib/cities';
import { EditorialFooter } from '../../components/EditorialFooter';
import { Footer } from '../../components/Footer';
import { Author } from '../../components/Author';
import { Trust } from '../../components/Trust';
import { buildOrganizationSchema, buildWebSiteSchema, buildPersonSchema } from '../../lib/schemas';
import { Sources } from '../../components/Sources';
import { getDeterministicLastReviewed } from '../../lib/dateUtils';

const GUIDES = {
  'how-to-prevent-frozen-pipes': {
    title: "How to Prevent Frozen Pipes — A Homeowner's Complete Guide",
    metaTitle: 'How to Prevent Frozen Pipes | Homeowner Guide | YoHomeFix',
    metaDesc: 'Step-by-step guide to preventing frozen pipes before winter. Insulation tips, thermostat settings, pipe locations to check, and what to do if a pipe freezes.',
    category: 'Winter Plumbing',
    readTime: '8 min read',
    intro: 'Frozen pipes cause more preventable water damage than almost any other residential plumbing failure. Most burst pipe emergencies happen not during the coldest night, but the morning after — when temperatures rise and ice-expanded pipe sections crack as pressure returns. This guide covers every prevention step, from identifying vulnerable pipe locations to pre-winter insulation and thermostat management.',
    sections: [
      { h2: 'Why Pipes Freeze and Burst', body: 'Water expands approximately 9% when it freezes. Since pipes are rigid, that expansion creates internal pressure exceeding 2,000 PSI — far beyond what copper or galvanized steel can sustain. The burst happens when the ice thaws and water rushes through the crack at full supply pressure (40–80 PSI). A single ½-inch crack can release hundreds of gallons before it is discovered.' },
      { h2: 'Which Pipes Are at Highest Risk', body: 'The risk is proportional to how much cold air surrounds the pipe. Exterior walls with minimal insulation, unheated crawl spaces, attics, unheated garages, and outdoor hose bibs are the highest-risk locations in order of frequency. Interior pipes in heated spaces almost never freeze — all risk is concentrated at the boundary between heated and unheated zones.' },
      { h2: 'How to Insulate Pipes Before Winter', body: 'Polyethylene foam tube insulation is the standard DIY solution — split tubes that snap around pipes and are secured with duct tape at all seams. For crawl spaces and attics with sustained temperatures below 10°F, self-regulating heat tape provides active protection. Apply extra insulation at elbows, joints, and any section within 12 inches of an exterior wall penetration — these are the points where cold air infiltrates around the insulation.' },
      { h2: 'Thermostat and Home Temperature', body: 'The minimum safe interior temperature during a freeze is 55°F — but this assumes no unheated zones in the structure. For homes with crawl space or attic pipe runs, 60°F is a safer floor. For vacation properties left unoccupied: either maintain heat above 55°F with a smart thermostat and remote monitoring, or fully shut off and drain the plumbing system. Turning off heat entirely in a cold-climate vacation home is the single most common cause of burst pipe disasters.' },
      { h2: 'What to Do If a Pipe Freezes', body: 'If a faucet produces no water during a cold snap, turn off the main water supply immediately — if the pipe has a stress crack, shutting off water prevents flooding when it thaws. Open the affected faucet to relieve pressure. Apply gentle warmth (hair dryer on low, heating pad) to the suspected frozen section. Never use an open flame. If water doesn\'t restore within 30 minutes or you cannot locate the frozen section, call a plumber — thermal imaging can locate the blockage without opening walls.' },
      { h2: 'Pre-Winter Checklist', body: 'Complete these steps every fall before the first hard freeze: (1) Disconnect and drain all outdoor hoses. (2) Shut off and drain irrigation systems. (3) Confirm foam insulation on all crawl space and attic pipe runs. (4) Test your main shutoff valve — turn it off and back on to verify it operates smoothly. (5) Open cabinet doors under sinks on exterior walls during severe cold snaps. (6) Schedule a plumber inspection if your home was built before 1980 or has a history of frozen pipes.' },
    ],
    relatedServices: ['pipe-burst-repair', 'emergency'],
    relatedGuides: ['signs-you-need-a-plumber', 'how-to-shut-off-water-in-emergency'],
  },

  'signs-you-need-a-plumber': {
    title: '10 Signs You Need to Call a Plumber Right Now',
    metaTitle: '10 Signs You Need a Plumber Immediately | YoHomeFix Guide',
    metaDesc: 'Know when a plumbing problem needs professional attention. These 10 warning signs mean you should call a licensed plumber now — before a small issue becomes costly damage.',
    category: 'Plumbing Basics',
    readTime: '6 min read',
    intro: 'Most plumbing failures give homeowners a warning window before they become emergencies. Recognizing these signals early is the difference between a routine service call and an emergency with significant water damage. These ten signs apply regardless of house age, pipe material, or climate.',
    sections: [
      { h2: '1. Unexplained Water Bill Increase', body: 'A 15%+ increase in your water bill with no change in usage is a reliable indicator of a hidden leak. Even a small pinhole at 60 PSI loses approximately 600 gallons per day. Compare bills month-over-month and year-over-year — if the spike doesn\'t match seasonal irrigation patterns, call for a leak detection assessment.' },
      { h2: '2. Slow Drains in Multiple Rooms', body: 'A single slow drain is usually a localized clog. Multiple slow drains in different rooms simultaneously indicate a main sewer line obstruction. This is urgent — a partial blockage that produces slow drains today becomes a full sewage backup quickly. A backup, where wastewater rises into showers and floor drains, is one of the most damaging events a homeowner can face.' },
      { h2: '3. Discolored Water from Faucets', body: 'Brown or reddish water from cold taps suggests corrosion inside iron or galvanized pipes. Rusty water from hot taps only points to a depleted water heater anode rod allowing internal tank corrosion. Neither condition is safe to ignore — corroding pipes contaminate supply water and will eventually fail.' },
      { h2: '4. Low Water Pressure Throughout the House', body: 'Pressure loss at one fixture usually means a clogged aerator you can clean yourself. Pressure loss throughout the house — at every fixture simultaneously — indicates a supply line leak, a failing pressure regulator, or galvanized pipe that has narrowed internally from scale accumulation over decades.' },
      { h2: '5. Water Stains on Ceilings or Walls', body: 'A water stain is evidence of a leak inside the structure. Even a stain that looks dry typically has an ongoing slow source. Do not paint over water stains without finding and repairing the source first — the structural material behind the drywall may be saturated or growing mold.' },
      { h2: '6. Sound of Running Water When Nothing Is On', body: 'Water movement sounds inside walls when all fixtures are closed almost certainly means a pressurized supply leak. Supply lines are always under pressure — any crack releases water continuously, not only when a faucet is open. Shut off the main water supply and call for emergency leak detection.' },
      { h2: '7. Sewage Odor From Drains or the Yard', body: 'Persistent sewage smell from floor drains, cleanouts, or the yard near the sewer line indicates a venting problem, a dried P-trap, or a cracked sewer pipe leaching wastewater into surrounding soil. Sewer gas contains hydrogen sulfide and methane — health hazards at elevated concentrations that warrant immediate investigation.' },
      { h2: '8. Water Heater Over 10 Years with Warning Signs', body: 'Tank water heaters have a typical service life of 8–12 years. A unit over 10 years old producing rusty water, making rumbling sounds, losing heating speed, or showing moisture around the base is in the final stage of its service life. Proactive replacement costs the same as emergency replacement — without the flood damage.' },
      { h2: '9. Gurgling Sounds from Toilets or Drains', body: 'Gurgling from a toilet when you run the washing machine, or bubbling in shower drains when the toilet flushes, indicates a drain venting problem or partial main line obstruction. Air is traveling through the wrong pathway in the drain-waste-vent system — left unaddressed, this causes drain failure throughout the house.' },
      { h2: '10. Visible Corrosion on Pipe Fittings', body: 'Green staining on copper joints, white calcium deposits on fittings, or orange rust on iron connections are signs of active corrosion at the weakest points in your supply system. Visible corrosion means the process is well advanced. A plumber can assess whether the section needs immediate replacement or targeted treatment.' },
    ],
    relatedServices: ['emergency', 'leak-repair', 'drain-cleaning'],
    relatedGuides: ['how-to-prevent-frozen-pipes', 'how-to-shut-off-water-in-emergency'],
  },

  'how-to-shut-off-water-in-emergency': {
    title: 'How to Shut Off Your Water in a Plumbing Emergency',
    metaTitle: 'How to Shut Off Water in a Plumbing Emergency | YoHomeFix Guide',
    metaDesc: 'Know your shutoff valve locations before an emergency. This guide covers the main shutoff, fixture shutoffs, and the street meter — with step-by-step instructions.',
    category: 'Emergency Preparedness',
    readTime: '5 min read',
    intro: 'When a pipe bursts or a supply line fails, every minute of water flow adds to the damage. A ¾-inch supply line at 60 PSI releases approximately 8 gallons per minute. Knowing exactly where your shutoff valves are — and practicing how to use them — is the most important emergency preparation a homeowner can do.',
    sections: [
      { h2: 'The Main Water Shutoff Valve', body: 'The main shutoff controls all water entering the house. In cold climates, it is typically inside the structure where the water main enters — basement, utility room, or crawl space near the front foundation wall. In warm climates and slab-on-grade homes, it may be outside near the meter, in the garage, or under the kitchen sink. Gate valves (round wheel handle) require multiple clockwise turns to close. Ball valves (lever handle) close with a quarter-turn perpendicular to the pipe. Test yours once a year — a main shutoff that hasn\'t moved in decades may be seized when you most need it.' },
      { h2: 'Fixture and Appliance Shutoffs', body: 'Toilets: the oval chrome valve on the wall behind the toilet. Turn clockwise. Sinks: hot and cold supply valves under the cabinet, behind the supply lines. Washing machine: inline valves on the hot and cold hoses at the wall connection. Water heater: the cold-side supply valve on the top of the unit. Refrigerator ice maker: typically a small saddle valve on the cold water line under the sink or behind the unit. Knowing each of these lets you stop water at one fixture without shutting off the whole house.' },
      { h2: 'The Street-Side Meter Shutoff', body: 'If the main inside shutoff fails or is inaccessible, every home has a second shutoff at the water meter near the street. This is inside a covered underground box — typically a round or rectangular lid flush with the ground near the curb or property line. Closing the meter shutoff requires a water meter key (a T-shaped tool available at hardware stores for under $10). Keep one accessible. This is the last resort before calling the utility company.' },
      { h2: 'What to Do After Shutting Off Water', body: 'After shutting off the main: (1) Open the lowest faucet in the house to drain pressure from the supply lines. (2) Document the damage with photos for insurance purposes. (3) Turn off the water heater (gas: turn to PILOT; electric: turn off the breaker) — heating an empty tank damages the heating element. (4) Call a licensed plumber. Turning the water back on before the damaged section is repaired causes immediate re-flooding.' },
      { h2: 'Practice Before You Need It', body: 'The correct time to learn your shutoff locations is now — not during an emergency at 2 AM with water flowing into your kitchen. Walk through your home and locate: the main shutoff, the toilet shutoffs in each bathroom, the sink shutoffs under each sink, and the water heater shutoff. Confirm each valve turns. Consider attaching a label to the main shutoff valve so any household member or house-sitter can find it instantly.' },
    ],
    relatedServices: ['emergency', 'pipe-burst-repair'],
    relatedGuides: ['how-to-prevent-frozen-pipes', 'signs-you-need-a-plumber'],
  },

  'hard-water-effects-on-plumbing': {
    title: 'Hard Water and Your Plumbing — What Every Homeowner Should Know',
    metaTitle: 'Hard Water Effects on Plumbing | Homeowner Guide | YoHomeFix',
    metaDesc: 'Hard water costs homeowners thousands in water heater damage and pipe scale. Learn what hard water does to your plumbing and how to protect it.',
    category: 'Water Quality',
    readTime: '7 min read',
    intro: 'Hard water — water with elevated calcium and magnesium content — affects more than 85% of US homes. Its effects on plumbing are gradual, invisible, and expensive: scale accumulation inside water heaters, restricted pipe flow, premature appliance failure, and increased soap consumption. Understanding how hard water works and what to do about it is practical homeowner knowledge regardless of where you live.',
    sections: [
      { h2: 'What "Hard Water" Actually Means', body: 'Water hardness is measured by the concentration of dissolved calcium carbonate (CaCO3), reported in milligrams per liter (mg/L) or parts per million (ppm). Water below 75 mg/L is considered soft; 75–150 mg/L is moderately hard; 150–300 mg/L is hard; above 300 mg/L is very hard. US cities with Colorado River or groundwater sources frequently exceed 300 mg/L — including Phoenix, Las Vegas, Tucson, San Diego, and Los Angeles. Cities drawing from mountain snowmelt like Seattle (17 mg/L) or Portland (18 mg/L) have among the softest municipal water in the country.' },
      { h2: 'How Scale Builds Up in Water Heaters', body: 'When hard water is heated above 130°F, dissolved calcium precipitates out of solution and deposits as calcium carbonate scale on the tank floor and heating element. This scale layer — which can reach ½ inch thick within 2–3 years in a hard water market without maintenance — acts as an insulator between the burner and the water. The water heater must burn longer to reach temperature, energy consumption rises, the tank bottom overheats, and the unit life shortens from the expected 10–12 years to 6–8 years or less. Annual tank flushing removes accumulated sediment and significantly extends unit life.' },
      { h2: 'Scale Accumulation in Pipes and Fixtures', body: 'Scale also deposits on the interior walls of supply pipes, showerheads, faucet aerators, and appliance water inlets. In copper pipes this reduces effective interior diameter over time, lowering flow and pressure. In CPVC and PEX pipes the deposits are typically less adherent and flush out more easily. Showerheads and aerators in hard water areas clog visibly within months — soaking in white vinegar dissolves calcium deposits and restores full flow.' },
      { h2: 'Which Appliances Are Most Affected', body: 'Tank water heaters accumulate scale the fastest because they heat water repeatedly. Dishwashers develop scale on spray arms and heating elements. Ice makers and refrigerator water dispensers clog at inlet screens and valves. Washing machines accumulate scale on heating elements in heated cycles. In commercial settings — restaurants, hotels, apartment buildings — hard water descaling is a recurring operational cost.' },
      { h2: 'Solutions: From Maintenance to Water Treatment', body: 'Annual water heater tank flushing removes loose sediment and is the most cost-effective maintenance step. Magnetic descaling devices claim to alter scale crystallization with mixed evidence. Ion-exchange water softeners (salt-based) are the most effective whole-house solution — they replace calcium and magnesium ions with sodium, producing soft water throughout the house. Whole-house salt-free conditioners (template-assisted crystallization systems) are an alternative for homeowners who want to avoid sodium. Under-sink reverse osmosis systems address drinking water quality but do not protect appliances.' },
    ],
    relatedServices: ['water-heater-repair', 'leak-repair', 'drain-cleaning'],
    relatedGuides: ['signs-you-need-a-plumber', 'how-to-prevent-frozen-pipes'],
  },

  'water-heater-maintenance-guide': {
    title: 'Water Heater Maintenance Guide — Extend the Life of Your Water Heater',
    metaTitle: 'Water Heater Maintenance Guide | YoHomeFix',
    metaDesc: 'Annual water heater maintenance extends unit life by years and prevents emergency failures. This guide covers tank flushing, anode rod inspection, temperature settings, and more.',
    category: 'Appliance Maintenance',
    readTime: '7 min read',
    intro: 'The average tank water heater fails 2–4 years earlier than its rated life because of neglected maintenance. Scale buildup, a depleted anode rod, and excessive temperature settings are the three most common causes of premature water heater failure — all of which are addressable with annual maintenance that takes under two hours. This guide covers every maintenance task, when to perform it, and the signs that indicate a professional service call is needed.',
    sections: [
      { h2: 'Annual Tank Flushing', body: 'Sediment — calcium and magnesium scale plus rust particles — settles on the tank floor and insulates the heating element from the water above it, causing the unit to work harder and overheat at the bottom. Flushing once a year removes this accumulation. Process: (1) Turn the unit to PILOT or switch off the circuit breaker. (2) Attach a garden hose to the drain valve at the tank base. (3) Run the hose to a floor drain or outside. (4) Open the drain valve and let the tank empty — the water will run cloudy or rusty with sediment. (5) Briefly open the cold supply valve to stir and flush remaining sediment. (6) Close the drain valve, refill the tank, restore power. In hard water areas (above 200 mg/L), flush every 6 months.' },
      { h2: 'Anode Rod Inspection and Replacement', body: 'The anode rod is a sacrificial magnesium or aluminum rod suspended inside the tank. It corrodes preferentially to the steel tank lining — as long as the anode rod is intact, the tank resists internal corrosion. When the rod is depleted, the steel tank begins to corrode, producing rusty water and eventually leaking. Inspect the anode rod every 3–5 years. The rod screws into the top of the tank (may be under the top cover or sheet metal casing). A rod reduced to the steel core wire, or coated in thick calcium deposits, needs replacement. Replacement cost is $20–$50 for the part — far less than a new water heater.' },
      { h2: 'Temperature Setting', body: 'The recommended water heater temperature setting is 120°F — hot enough to prevent Legionella bacterial growth, cool enough to minimize scale accumulation rate, and safe enough to prevent scalding at fixtures. Settings above 130°F dramatically accelerate scale deposition: the rate of calcium carbonate precipitation roughly doubles for every 10°C increase in water temperature. Settings below 120°F create conditions where Legionella pneumophila, the bacterium that causes Legionnaires\' disease, can proliferate in the tank.' },
      { h2: 'Pressure Relief Valve Testing', body: 'The temperature and pressure relief (T&P) valve is a safety device that prevents tank overpressurization — it opens automatically if tank temperature exceeds 210°F or pressure exceeds 150 PSI, releasing water to prevent a catastrophic tank failure. Test the T&P valve annually by lifting the test lever and allowing a small amount of water to discharge through the drain pipe. If the valve leaks after testing, or if it has never been tested and is over 5 years old, replace it — a failed T&P valve on an overpressurized tank is a serious safety hazard.' },
      { h2: 'When to Call a Professional', body: 'Schedule a professional service call when you observe: rusty or discolored hot water (anode rod depleted or tank corroding internally), rumbling or popping sounds during heating cycles (heavy sediment requiring professional descaling), water pooling around the tank base (failing tank — replacement is imminent), inconsistent hot water temperature (thermostat, dip tube, or element failure), or the unit is 10+ years old and showing any of the above signs. A professional technician can assess whether repair or replacement is the better economic choice for your specific unit and usage pattern.' },
    ],
    relatedServices: ['water-heater-repair'],
    relatedGuides: ['hard-water-effects-on-plumbing', 'signs-you-need-a-plumber'],
  },
};

export async function getStaticPaths() {
  return {
    paths: Object.keys(GUIDES).map((slug) => ({ params: { guide: slug } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const guide = GUIDES[params.guide];
  if (!guide) return { notFound: true };
  return { props: { guide, slug: params.guide } };
}

export default function GuidePage({ guide, slug }) {
  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'https://yohomefix.com';
  const canonical = `${domain}/guides/${slug}`;
  const lastReviewed = getDeterministicLastReviewed(`guide-${slug}`);

  const breadcrumbs = [
    { name: 'Home', url: `${domain}/` },
    { name: 'Guides', url: `${domain}/guides` },
    { name: guide.title, url: canonical },
  ];

  const isHowTo = ['how-to-prevent-frozen-pipes', 'how-to-shut-off-water-in-emergency'].includes(slug);

  const howToSchema = isHowTo ? {
    '@type': 'HowTo',
    name: guide.title,
    description: guide.intro,
    totalTime: slug === 'how-to-prevent-frozen-pipes' ? 'PT2H' : 'PT15M',
    supply: slug === 'how-to-prevent-frozen-pipes'
      ? [
          { '@type': 'HowToSupply', name: 'Pipe foam insulation tubes' },
          { '@type': 'HowToSupply', name: 'Self-regulating heat tape' },
          { '@type': 'HowToSupply', name: 'Expanding spray foam' },
          { '@type': 'HowToSupply', name: 'Duct tape' },
        ]
      : [
          { '@type': 'HowToSupply', name: 'Water meter key (T-bar tool)' },
        ],
    step: guide.sections.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.h2,
      text: s.body.split('\n\n')[0],
      url: `${canonical}#step-${i + 1}`,
    })),
  } : null;

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
        '@type': 'Article',
        '@id': `${canonical}#article`,
        headline: guide.title,
        description: guide.metaDesc,
        url: canonical,
        datePublished: '2025-01-15',
        dateModified: lastReviewed,
        author: buildPersonSchema({
          slug: 'editorial-team',
          name: 'YoHomeFix Editorial Team',
          title: 'Senior Editorial Team',
          bio: 'The YoHomeFix editorial team researches and reviews all homeowner-facing plumbing content.',
          expertise: ['Home services research', 'Plumbing content review', 'Data journalism'],
          image: `${domain}/og-image.png`,
        }),
        publisher: {
          '@type': 'Organization',
          '@id': `${domain}/#organization`,
          name: 'YoHomeFix',
          url: domain,
          logo: {
            '@type': 'ImageObject',
            url: `${domain}/og-image.png`,
          },
        },
        mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
        speakable: {
          '@type': 'SpeakableSpecification',
          cssSelector: ['h1', '.speakable-intro'],
        },
      },
      buildOrganizationSchema(),
      buildWebSiteSchema(),
      ...(howToSchema ? [howToSchema] : []),
    ],
  };

  const relatedServiceObjs = guide.relatedServices
    .map((slug) => SERVICES.find((s) => s.slug === slug))
    .filter(Boolean);

  const allGuideEntries = Object.entries(GUIDES);
  const relatedGuideEntries = guide.relatedGuides
    .map((rSlug) => allGuideEntries.find(([s]) => s === rSlug))
    .filter(Boolean);

  const sampleCities = SEED_CITIES.slice(0, 10);

  return (
    <>
      <Head>
        <title>{guide.metaTitle}</title>
        <meta name="description" content={guide.metaDesc} />
        <link rel="canonical" href={canonical} />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content={guide.metaTitle} />
        <meta property="og:description" content={guide.metaDesc} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={`${domain}/og-image.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={guide.metaTitle} />
        <meta name="twitter:description" content={guide.metaDesc} />
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

        <nav aria-label="Breadcrumb" className="max-w-3xl mx-auto w-full px-4 py-2 text-sm text-gray-500">
          <ol className="flex flex-wrap items-center gap-1">
            {breadcrumbs.map((b, i) => (
              <li key={b.url} className="flex items-center gap-1">
                {i > 0 && <span className="text-gray-300">›</span>}
                {i < breadcrumbs.length - 1
                  ? <Link href={b.url.replace(domain, '')} className="text-blue-600 hover:underline no-underline">{b.name}</Link>
                  : <span className="text-gray-700 font-medium truncate max-w-xs">{b.name}</span>}
              </li>
            ))}
          </ol>
        </nav>

        <main className="max-w-3xl mx-auto w-full px-4 py-10">

          {/* Article header */}
          <div className="mb-8">
            <div className="flex gap-3 mb-3">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-700">{guide.category}</span>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-600">{guide.readTime}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900 mb-4 leading-tight">{guide.title}</h1>
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
              <span>By <Link href="/authors/editorial-team" className="text-blue-600 hover:underline no-underline font-medium">YoHomeFix Editorial Team</Link></span>
              <span>·</span>
              <span>Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              <span>·</span>
              <span>{guide.readTime}</span>
            </div>
            <p className="speakable-intro text-lg text-gray-600 leading-relaxed border-l-4 border-blue-600 pl-4">{guide.intro}</p>
          </div>

          {/* Emergency CTA */}
          <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <p className="font-bold text-red-800 mb-1">Have an active plumbing emergency?</p>
              <p className="text-red-700 text-sm">Don&apos;t finish the guide — call now. Licensed plumbers available 24/7.</p>
            </div>
            <a href={`tel:${PHONE_NUMBER}`} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-bold text-sm whitespace-nowrap transition-colors" aria-label="Call emergency dispatch">
              📞 Call Now
            </a>
          </div>

          {/* Guide sections */}
          <div className="space-y-8 mb-12">
            {guide.sections.map((section, i) => (
              <div key={i}>
                <h2 className="text-xl font-bold text-blue-900 mb-3">{section.h2}</h2>
                <div className="text-gray-700 leading-relaxed space-y-3">
                  {section.body.split('\n\n').map((para, j) => (
                    <p key={j}>{para}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Related services */}
          {relatedServiceObjs.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xl font-bold text-blue-900 mb-4">Related Plumbing Services</h2>
              <p className="text-gray-500 text-sm mb-4">Need professional help with issues covered in this guide? Our licensed technicians are available 24/7 across the US.</p>
              <div className="grid sm:grid-cols-2 gap-4">
                {relatedServiceObjs.map((svc) => (
                  <div key={svc.slug} className="border border-gray-200 rounded-xl p-4">
                    <p className="font-bold text-blue-900 mb-1">{svc.name}</p>
                    <p className="text-gray-500 text-sm mb-3">{svc.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {sampleCities.filter((city) => isCityQualifiedForService(city.name, svc.slug)).map((city) => (
                        <Link
                          key={city.name}
                          href={`/${buildSlug(cityToSlug(city.name), svc.slug)}`}
                          className="text-xs text-blue-600 hover:underline no-underline"
                          title={`${svc.name} in ${city.name}`}
                        >
                          {svc.name} in {city.name}
                        </Link>
                      ))}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {sampleCities.filter((c) => ['New York','Los Angeles','Chicago','Houston','Phoenix','Dallas','San Antonio','San Diego','Austin','Philadelphia'].includes(c.name)).map((city) => (
                        <Link
                          key={city.name}
                          href={`/cost/${cityToSlug(city.name)}`}
                          className="text-xs text-yellow-700 hover:underline no-underline"
                        >
                          {city.name} cost guide
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related guides */}
          {relatedGuideEntries.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xl font-bold text-blue-900 mb-4">Related Guides</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {relatedGuideEntries.map(([rSlug, rGuide]) => (
                  <Link
                    key={rSlug}
                    href={`/guides/${rSlug}`}
                    className="block border border-gray-200 rounded-xl p-4 hover:border-blue-400 transition-colors no-underline group"
                  >
                    <span className="text-xs font-semibold text-blue-600 block mb-1">{rGuide.category}</span>
                    <p className="font-semibold text-gray-800 group-hover:text-blue-700 leading-snug">{rGuide.title}</p>
                    <p className="text-gray-700 text-xs mt-1">{rGuide.readTime}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* State hub links */}
          <div className="mb-10">
            <h2 className="text-xl font-bold text-blue-900 mb-4">Find a Plumber in Your State</h2>
            <div className="flex flex-wrap gap-2">
              {STATES.map((s) => (
                <Link
                  key={s.slug}
                  href={`/plumber-${s.slug}`}
                  className="px-3 py-1 border border-gray-200 rounded-full text-sm text-blue-700 hover:border-blue-400 hover:bg-blue-50 transition-colors no-underline"
                  title={`Emergency plumber in ${s.name}`}
                >
                  Emergency plumber in {s.name}
                </Link>
              ))}
            </div>
          </div>

          {slug === 'hard-water-effects-on-plumbing' && (
            <div className="mb-10 bg-blue-50 rounded-xl border border-blue-200 p-6">
              <h2 className="text-xl font-bold text-blue-900 mb-2">US City Water Hardness Data</h2>
              <p className="text-sm text-gray-600 mb-3">
                See measured water hardness levels for {155} US cities, including hardness classifications,
                plumbing risk scores, and regional patterns.
              </p>
              <Link
                href="/research/us-water-hardness-plumbing-risk"
                className="inline-block text-sm text-blue-600 hover:underline font-bold"
              >
                Explore the Water Hardness Index →
              </Link>
            </div>
          )}

          <Trust pageType="guide" lastReviewed={lastReviewed} />
          <Sources pageType="guide" guideSlug={slug} />
          <EditorialFooter pageType="guide" />
          <Author pageType="guide" authorSlug="editorial-team" reviewedBy="YoHomeFix Editorial Team" lastReviewed={lastReviewed} />

          {/* Bottom CTA */}
          <div className="bg-blue-900 text-white rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-extrabold mb-2">Need a Licensed Plumber Now?</h2>
            <p className="text-white mb-5">24/7 dispatch across the US — upfront pricing, 60-minute response target</p>
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
