import { getCityData } from './cities';
import {
  pick, pickNum,
  DISPATCH_INTROS, HOW_WE_WORK_INTROS, TRUST_PHRASES, PRICING_PHRASES, RESPONSE_PHRASES,
  H_SERVICE_OVERVIEW, H_WHY_US, H_HOW_IT_WORKS, H_INFRA, H_LOCAL_CONTEXT, H_WARNING_SIGNS,
} from './contentPhrases';

// ─── PRICING GUIDANCE ───────────────────────────────────────────
// Educational cost ranges per service. Not guarantees — varies by
// market, scope, and materials. Always shown with that caveat.
const PRICING_GUIDANCE = {
  'emergency': {
    heading: 'What Does Emergency Plumbing Cost?',
    disclaimer: 'These ranges are educational estimates based on typical national service costs. Your actual quote in {city} may differ based on the specific problem, materials required, and job scope. You always receive a written upfront quote before work begins.',
    items: [
      { label: 'After-hours diagnostic visit', low: '$75', high: '$150', note: 'Assessment and diagnosis fee — applied toward repair if you proceed' },
      { label: 'Frozen pipe thaw and assessment', low: '$150', high: '$350', note: 'Thawing service and inspection for additional damage' },
      { label: 'Burst pipe section repair', low: '$200', high: '$600', note: 'Localized section cut-out and replacement; longer runs cost more' },
      { label: 'Sewer backup clearing', low: '$150', high: '$400', note: 'Main line snaking; hydro-jetting for heavy blockage runs higher' },
      { label: 'Emergency shutoff valve replacement', low: '$100', high: '$250', note: 'Main or fixture shutoff valve; labor and parts included' },
    ],
  },
  'leak-repair': {
    heading: 'What Does Leak Detection and Repair Cost?',
    disclaimer: 'These ranges reflect typical costs for leak services and are intended as educational guidance only. Your actual quote in {city} depends on leak location, pipe material, access difficulty, and required repair method. You receive a written upfront quote before any work begins.',
    items: [
      { label: 'Acoustic/thermal leak detection', low: '$150', high: '$400', note: 'Non-invasive detection using listening devices and thermal imaging' },
      { label: 'Pinhole leak repair (copper pipe)', low: '$150', high: '$350', note: 'Localized section repair; multiple holes or long runs cost more' },
      { label: 'Supply line replacement (under sink)', low: '$100', high: '$200', note: 'Flexible supply line or angle stop valve replacement' },
      { label: 'Slab leak detection + epoxy lining', low: '$500', high: '$1,500', note: 'Detection plus non-invasive epoxy pipe lining; direct-access repair runs higher' },
      { label: 'Whole-house pressure test', low: '$100', high: '$200', note: 'Confirms system integrity after repair' },
    ],
  },
  'drain-cleaning': {
    heading: 'What Does Drain Cleaning Cost?',
    disclaimer: 'These ranges are typical costs for professional drain services and are provided for educational purposes. Your actual quote in {city} depends on drain location, blockage type, pipe condition, and method required. All pricing is confirmed upfront before work begins.',
    items: [
      { label: 'Single drain snake (sink, tub, or shower)', low: '$100', high: '$200', note: 'Standard cable snaking for localized branch drain clogs' },
      { label: 'Main sewer line clearing (snake)', low: '$150', high: '$350', note: 'Snaking from cleanout to street; includes standard blockage removal' },
      { label: 'Hydro-jetting (main line)', low: '$350', high: '$650', note: 'High-pressure scour for grease, scale, or root fragments; longer lines cost more' },
      { label: 'Sewer camera inspection', low: '$150', high: '$300', note: 'Video documentation of pipe condition; often bundled with clearing' },
      { label: 'Root cutting (main line)', low: '$200', high: '$500', note: 'Mechanical root cutting in addition to standard line clearing' },
    ],
  },
  'pipe-burst-repair': {
    heading: 'What Does Burst Pipe Repair Cost?',
    disclaimer: 'These ranges are educational estimates for common burst pipe repair scenarios. Your actual quote in {city} will depend on pipe material, location, wall or slab access required, and total lineal footage affected. You receive a written upfront quote before any work begins.',
    items: [
      { label: 'Localized pipe section repair (coupling)', low: '$200', high: '$500', note: 'Single section cut-out and coupling replacement; accessible location' },
      { label: 'Pipe repair requiring wall access', low: '$400', high: '$900', note: 'Includes drywall opening; drywall patching is typically a separate contractor' },
      { label: 'Pipe rerouting (alternate wall path)', low: '$600', high: '$1,500', note: 'New run through accessible framing to bypass damaged section' },
      { label: 'Slab access pipe repair', low: '$800', high: '$2,500', note: 'Concrete breaking, repair, and patching; varies significantly by depth and access' },
      { label: 'Pre-winter pipe insulation service', low: '$100', high: '$300', note: 'Foam wrap and heat tape installation for vulnerable pipe sections' },
    ],
  },
  'water-heater-repair': {
    heading: 'What Does Water Heater Repair or Replacement Cost?',
    disclaimer: 'These ranges are educational estimates for common water heater services. Your actual quote in {city} depends on unit type, size, fuel type, installation complexity, and permit requirements. All pricing is provided in a written upfront quote before work begins.',
    items: [
      { label: 'Diagnostic service call', low: '$75', high: '$150', note: 'Assessment and diagnosis; applied toward repair if you proceed' },
      { label: 'Thermostat or heating element replacement', low: '$150', high: '$350', note: 'Gas thermostat or electric element; parts and labor included' },
      { label: 'Anode rod replacement', low: '$150', high: '$300', note: 'Extends tank life significantly; recommended every 4–6 years' },
      { label: 'Tank water heater replacement (40–50 gal)', low: '$800', high: '$1,500', note: 'Gas or electric; includes installation, old unit removal, and standard connections' },
      { label: 'Tankless water heater installation', low: '$1,500', high: '$3,000', note: 'Unit plus installation; gas line or electrical upgrades may add cost' },
    ],
  },
  'sewer-line-repair': {
    heading: 'What Does Sewer Line Repair Cost?',
    disclaimer: 'These ranges reflect typical costs for sewer line services and are provided for educational purposes. Your actual quote in {city} depends on line depth, length of damage, repair method, and local soil conditions. All pricing is confirmed upfront before work begins.',
    items: [
      { label: 'Sewer camera inspection', low: '$150', high: '$300', note: 'Video diagnosis of pipe condition; often bundled with repair' },
      { label: 'Main sewer line clearing (snake)', low: '$150', high: '$350', note: 'Standard cable snaking for blockage removal' },
      { label: 'Pipe relining (trenchless repair)', low: '$150', high: '$400', note: 'Epoxy lining for damaged sections; no excavation required' },
      { label: 'Sewer pipe section replacement', low: '$200', high: '$600', note: 'Excavation and replacement of damaged section; length affects cost' },
      { label: 'Complete sewer line replacement', low: '$3,000', high: '$8,000', note: 'Full line replacement; varies significantly by length and depth' },
    ],
  },
  'toilet-repair': {
    heading: 'What Does Toilet Repair Cost?',
    disclaimer: 'These ranges are typical costs for toilet services and are intended as educational guidance. Your actual quote in {city} depends on the problem, toilet type, parts required, and installation complexity. All pricing is provided upfront before any work begins.',
    items: [
      { label: 'Toilet diagnostic service call', low: '$75', high: '$150', note: 'Assessment and diagnosis; applied toward repair if you proceed' },
      { label: 'Flapper valve or fill valve replacement', low: '$100', high: '$200', note: 'Common internal component repair; parts and labor included' },
      { label: 'Toilet wax ring replacement', low: '$100', high: '$250', note: 'Seal replacement; may require toilet removal and reset' },
      { label: 'Toilet installation (new unit)', low: '$150', high: '$400', note: 'Removal of old unit and installation of new toilet; supply line included' },
      { label: 'Complete toilet rebuild (all components)', low: '$200', high: '$400', note: 'Replacement of all internal working parts; tank and bowl remain' },
    ],
  },
  'slab-leak-repair': {
    heading: 'What Does Slab Leak Repair Cost?',
    disclaimer: 'These ranges are educational estimates for slab leak services. Your actual quote in {city} depends on leak location, detection method, repair approach, and concrete access requirements. You receive a written upfront quote before any work begins.',
    items: [
      { label: 'Slab leak detection (acoustic/thermal)', low: '$200', high: '$500', note: 'Non-invasive location of underground leak' },
      { label: 'Epoxy pipe lining (trenchless)', low: '$500', high: '$1,500', note: 'Internal pipe coating; no concrete breaking required' },
      { label: 'Spot repair with concrete access', low: '$800', high: '$2,500', note: 'Concrete breaking, pipe repair, and patching; depth affects cost' },
      { label: 'Pipe rerouting (bypass slab)', low: '$1,000', high: '$3,000', note: 'New pipe run through walls or ceiling to bypass leak' },
      { label: 'Whole-house repipe (slab bypass)', low: '$4,000', high: '$15,000', note: 'Complete system replacement; varies by home size and access' },
    ],
  },
  'water-line-repair': {
    heading: 'What Does Water Line Repair Cost?',
    disclaimer: 'These ranges are educational estimates for water line services. Your actual quote in {city} depends on line location, depth, material, length of repair, and local utility requirements. All pricing is confirmed upfront before work begins.',
    items: [
      { label: 'Water line leak detection', low: '$150', high: '$400', note: 'Acoustic or thermal detection of underground leak' },
      { label: 'Water service line section repair', low: '$200', high: '$600', note: 'Excavation and repair of damaged section' },
      { label: 'Main water shutoff valve replacement', low: '$100', high: '$250', note: 'Exterior or interior valve replacement; includes labor and parts' },
      { label: 'Water service line replacement (per foot)', low: '$50', high: '$150', note: 'New line installation; varies by depth and material' },
      { label: 'Complete water service line replacement', low: '$1,500', high: '$4,000', note: 'Full line from street to home; varies by length and conditions' },
    ],
  },
  'faucet-repair': {
    heading: 'What Does Faucet Repair Cost?',
    disclaimer: 'These ranges are typical costs for faucet services and are provided for educational purposes. Your actual quote in {city} depends on faucet type, problem complexity, parts required, and accessibility. All pricing is confirmed upfront before any work begins.',
    items: [
      { label: 'Faucet diagnostic service call', low: '$75', high: '$150', note: 'Assessment and diagnosis; applied toward repair if you proceed' },
      { label: 'Cartridge or stem replacement', low: '$100', high: '$200', note: 'Internal component replacement; parts and labor included' },
      { label: 'Faucet O-ring or washer replacement', low: '$75', high: '$150', note: 'Common drip repair; quick fix for most faucets' },
      { label: 'Faucet installation (new unit)', low: '$120', high: '$300', note: 'Removal of old faucet and installation of new; supply lines included' },
      { label: 'Complete faucet rebuild', low: '$150', high: '$350', note: 'Replacement of all internal components; body remains' },
    ],
  },
  'garbage-disposal-repair': {
    heading: 'What Does Garbage Disposal Repair Cost?',
    disclaimer: 'These ranges are typical costs for garbage disposal services and are provided for educational purposes. Your actual quote in {city} depends on the problem, disposal type, parts required, and installation complexity. All pricing is confirmed upfront before any work begins.',
    items: [
      { label: 'Garbage disposal diagnostic service call', low: '$75', high: '$150', note: 'Assessment and diagnosis; applied toward repair if you proceed' },
      { label: 'Jam clearing and flywheel repair', low: '$100', high: '$200', note: 'Safe removal of obstructions and mechanical repair' },
      { label: 'Garbage disposal leak repair', low: '$100', high: '$250', note: 'Seal or connection replacement; may require unit removal' },
      { label: 'Garbage disposal installation (new unit)', low: '$150', high: '$400', note: 'Removal of old unit and installation of new; electrical and drain connections included' },
      { label: 'Internal component replacement', low: '$125', high: '$300', note: 'Motor, impeller, or internal mechanism repair; parts and labor included' },
    ],
  },
  'water-softener-repair': {
    heading: 'What Does Water Softener Repair Cost?',
    disclaimer: 'These ranges are typical costs for water softener services and are provided for educational purposes. Your actual quote in {city} depends on the problem, softener type, parts required, and installation complexity. All pricing is confirmed upfront before any work begins.',
    items: [
      { label: 'Water softener diagnostic service call', low: '$75', high: '$150', note: 'Assessment and diagnosis; applied toward repair if you proceed' },
      { label: 'Resin bed replacement', low: '$200', high: '$500', note: 'Resin media replacement; system size affects cost' },
      { label: 'Control valve repair or replacement', low: '$150', high: '$400', note: 'Timer, meter, or electronic valve repair or replacement' },
      { label: 'Brine tank cleaning and maintenance', low: '$100', high: '$250', note: 'Salt bridge removal, tank cleaning, and system flush' },
      { label: 'Complete softener installation (new unit)', low: '$400', high: '$1,000', note: 'Removal of old unit and installation of new; plumbing and electrical included' },
    ],
  },
  'sump-pump-repair': {
    heading: 'What Does Sump Pump Repair Cost?',
    disclaimer: 'These ranges reflect typical costs for sump pump services and are provided for educational purposes. Your actual quote in {city} depends on pump type, problem complexity, parts required, and installation complexity. All pricing is confirmed upfront before any work begins.',
    items: [
      { label: 'Sump pump diagnosis and inspection', low: '$75', high: '$175', note: 'Problem identification, electrical testing, and repair recommendation' },
      { label: 'Float switch repair or replacement', low: '$100', high: '$250', note: 'Float switch adjustment, repair, or complete replacement' },
      { label: 'Check valve replacement', low: '$100', high: '$250', note: 'Check valve repair or replacement to prevent backflow' },
      { label: 'Discharge line clearing', low: '$125', high: '$300', note: 'Clearing blockages in discharge line and proper reconnection' },
      { label: 'Sump pump motor repair', low: '$150', high: '$400', note: 'Motor repair or replacement; depends on pump type and accessibility' },
      { label: 'Complete sump pump replacement', low: '$400', high: '$900', note: 'Removal of old unit and installation of new sump pump; includes basic electrical work' },
      { label: 'Backup sump pump installation', low: '$500', high: '$1,200', note: 'Battery backup or water-powered backup system installation' },
    ],
  },
};

export function buildPricingGuidance(cityName, serviceSlug) {
  const guide = PRICING_GUIDANCE[serviceSlug] || PRICING_GUIDANCE['emergency'];
  return {
    heading: guide.heading,
    disclaimer: guide.disclaimer.replace('{city}', cityName),
    items: guide.items,
  };
}

export function generatePageContent(cityName, stateCode, service) {
  const fn = {
    'emergency':          genEmergency,
    'leak-repair':        genLeakRepair,
    'drain-cleaning':     genDrainCleaning,
    'pipe-burst-repair':  genPipeBurst,
    'water-heater-repair':genWaterHeater,
    'sewer-line-repair':  genSewerLineRepair,
    'toilet-repair':      genToiletRepair,
    'slab-leak-repair':   genSlabLeakRepair,
    'water-line-repair':  genWaterLineRepair,
    'faucet-repair':      genFaucetRepair,
    'garbage-disposal-repair': genGarbageDisposalRepair,
    'water-softener-repair': genWaterSoftenerRepair,
    'sump-pump-repair':   genSumpPumpRepair,
  }[service?.slug] || genEmergency;
  return fn(cityName, stateCode, service);
}

// ─── 5-TIER PPM CLASSIFIER ──────────────────────────────────────
// Splits on 5 distinct thresholds so cities with similar but different
// ppm values never share the same branch label.
// very-soft:<25  soft:25-99  moderate:100-174  hard:175-249  extreme:250+
function ppmTier(ppm) {
  if (ppm < 25)  return 'very soft';
  if (ppm < 100) return 'soft';
  if (ppm < 175) return 'moderately hard';
  if (ppm < 250) return 'hard';
  return 'extremely hard';
}

// ─── PER-CITY WATER IMPACT SENTENCE ────────────────────────────
// Generates a sentence unique to each city by combining its exact ppm
// value, utility name, and dominant failure mode. No two cities share
// the same sentence because all three inputs vary per city.
function waterImpactSentence(cityName, d) {
  const tier = ppmTier(d.hardnessPpm);
  const ppm = d.hardnessPpm;
  if (tier === 'very soft') {
    return `At only ${ppm} mg/L, ${cityName}'s water from the ${d.waterUtility} is among the softest in the country — but this very low mineral content gives the water a mildly aggressive pH toward metal pipes, and the ${d.dominantFailure} pattern seen locally is partly a consequence of that chemistry acting on ${d.pipeMaterial} installed during the ${d.pipeEra}.`;
  }
  if (tier === 'soft') {
    return `${cityName}'s water from the ${d.waterUtility} measures ${ppm} mg/L — soft enough that scale accumulation is slow, but the water's residual acidity still causes gradual internal corrosion of ${d.pipeMaterial} systems from the ${d.pipeEra}, contributing to the ${d.dominantFailure} failure pattern that local plumbers encounter most frequently.`;
  }
  if (tier === 'moderately hard') {
    return `At ${ppm} mg/L, ${cityName}'s ${d.waterUtility} supply sits in the moderately hard range — enough to deposit scale on heating elements and at valve seats over 2–3 years, and a contributing factor in the ${d.dominantFailure} issues that are most common in ${d.pipeMaterial} homes from the ${d.pipeEra}.`;
  }
  if (tier === 'hard') {
    return `${cityName}'s ${d.waterUtility} delivers water at ${ppm} mg/L — solidly in the hard range — and homeowners with ${d.pipeMaterial} from the ${d.pipeEra} routinely find that scale buildup is accelerating the ${d.dominantFailure} problem that defines plumbing service calls in this market.`;
  }
  // extreme
  return `At ${ppm} mg/L, ${cityName}'s water from the ${d.waterUtility} is among the hardest in the US, and the calcium deposits it leaves inside ${d.pipeMaterial} systems from the ${d.pipeEra} are the primary driver of the ${d.dominantFailure} pattern that makes water treatment and annual maintenance especially important here.`;
}

// ─── INFRA-CLASS SENTENCE ───────────────────────────────────────
// Generates a structurally different sentence per infraClass tier,
// incorporating city-specific soil and sewer data to prevent shared output.
function infraClassSentence(cityName, d) {
  if (d.infraClass === 'aging') {
    return `${cityName}'s plumbing infrastructure skews toward the aging end of the spectrum — the ${d.sewerSystem} serves neighborhoods where ${d.pipeMaterial} was the standard from the ${d.pipeEra}, and the ${d.soilType} that underlies much of the city creates persistent ground movement that stresses these older joints and connections year after year.`;
  }
  if (d.infraClass === 'modern') {
    return `${cityName}'s plumbing infrastructure is relatively modern — most residential systems use ${d.pipeMaterial} installed from the ${d.pipeEra} era — but the ${d.soilType} and the demands placed on the ${d.sewerSystem} mean that even newer systems require professional attention when local conditions push them past design limits.`;
  }
  // mixed / transitional
  return `${cityName} has a split infrastructure profile: established neighborhoods retain ${d.pipeMaterial} from the ${d.pipeEra}, while newer developments use current-standard materials — and that mix, combined with ${d.soilType} and the ${d.sewerSystem}, means plumbing conditions and common failure modes vary significantly by address across the city.`;
}

// ─── LAYER B+C builder ──────────────────────────────────────────
function buildInfraSection(cityName, stateCode, service) {
  const d = getCityData(cityName);
  const svc = service?.slug || 'emergency';
  const tier = ppmTier(d.hardnessPpm);
  const ppmLabel = `${d.hardnessPpm} mg/L`;

  const infraHeading = pick(H_INFRA, cityName, svc, 'h-infra')(cityName);
  const localHeading = pick(H_LOCAL_CONTEXT, cityName, svc, 'h-local')(cityName);

  // Layer B — unique 2-sentence infraNarrative per city (already fully unique)
  const infraBody = `${d.infraNarrative} ${infraClassSentence(cityName, d)}`;

  // Layer C water body — water supply context without repeating the impact sentence
  // (waterImpactSentence is already embedded in each service's intro paragraph)
  const waterBody = [
    `${cityName}'s water is supplied by the ${d.waterUtility} and registers ${ppmLabel} calcium carbonate — classified as ${tier} water.`,
    ` ${d.soilType ? `The underlying geology — ${d.soilType} — directly affects buried supply and drain lines in ${cityName}, particularly during seasonal moisture and temperature changes.` : ''}`,
  ].join('');

  const zipText = d.zipCodes && d.zipCodes.length > 0
    ? `We dispatch to all ${cityName} zip codes including ${d.zipCodes.slice(0, 4).join(', ')}${d.zipCodes.length > 4 ? ', and surrounding areas' : ''}.`
    : `We dispatch throughout the ${cityName} metro and surrounding communities.`;

  return [
    { heading: infraHeading, body: infraBody, list: null },
    {
      heading: localHeading,
      body: waterBody,
      list: [
        `Water supplier: ${d.waterUtility}`,
        `Water hardness: ${ppmLabel} (${tier})`,
        `Primary pipe era: ${d.pipeEra}`,
        `Dominant pipe material: ${d.pipeMaterial}`,
        `Infrastructure class: ${d.infraClass}`,
        zipText,
      ],
    },
  ];
}

// ─── PER-CITY DOMINANT FAILURE INJECTOR ─────────────────────────
// Called by every Layer C service generator to append a city-specific
// sentence that cannot be shared — it embeds dominantFailure + pipeEra
// + summerRiskNote which are all unique per city.
function dominantFailureSentence(cityName, d, svc) {
  const tier = ppmTier(d.hardnessPpm);
  const climateDetail = d.winterRisk === 'high'
    ? `winter lows averaging ${d.avgWinterTempF}°F`
    : d.winterRisk === 'med'
    ? `mild winters that can still drop unexpectedly and ${d.summerRiskNote}`
    : d.summerRiskNote;
  return `In ${cityName}, the combination of ${tier} water at ${d.hardnessPpm} mg/L from the ${d.waterUtility}, ${d.pipeMaterial} systems installed during the ${d.pipeEra}, ${d.soilType}, and ${climateDetail} creates conditions where ${d.dominantFailure} is the most commonly diagnosed plumbing failure — a pattern that shapes how our technicians approach every service call in this city.`;
}

// ─── RICH LOCAL SIGNAL BUILDER ─────────────────────────────────
// Shared across all 5 service generators.
// Returns a structured object with full per-city intelligence so
// PlumberPage can render a rich, unique local context block.
function buildLocalSignal(cityName, d) {
  return {
    localFact:      d.infraNarrative.split('.')[0] + '.',
    climate:        d.climate,
    winterRisk:     d.winterRisk,
    avgWinterTempF: d.avgWinterTempF,
    summerRiskNote: d.summerRiskNote,
    dominantFailure:d.dominantFailure,
    pipeMaterial:   d.pipeMaterial,
    pipeEra:        d.pipeEra,
    waterUtility:   d.waterUtility,
    hardnessPpm:    d.hardnessPpm,
    zipCodes:       d.zipCodes || [],
    neighborhoods:  d.neighborhoods || [],
    pop:            d.pop,
    infraClass:     d.infraClass,
  };
}

// ─── LAYER D: FAQ pool ──────────────────────────────────────────
// 15-question pool per service; pick() selects 7 per city deterministically
// so different cities get a different subset of 7 from the 15.
function pickFaqs(pool, cityName, stateCode, service) {
  const svc = service?.slug || 'emergency';
  const indices = [];
  for (let slot = 0; slot < pool.length; slot++) {
    let h = 5381;
    const key = `${cityName}|${svc}|faq${slot}`;
    for (let i = 0; i < key.length; i++) { h = ((h << 5) + h) ^ key.charCodeAt(i); h = h >>> 0; }
    indices.push({ slot, score: h });
  }
  indices.sort((a, b) => a.score - b.score);
  return indices.slice(0, 8).map(x => {
    const faq = pool[x.slot];
    return { q: faq.q(cityName, stateCode), a: faq.a(cityName, stateCode) };
  });
}

// ================================================================
// EMERGENCY SERVICE GENERATOR
// ================================================================
const EMERGENCY_FAQ_POOL = [
  { q: (c,s) => `Do you charge extra for emergency calls in ${c} after midnight?`,
    a: (c,s) => `No. Pricing is flat-rate regardless of the time your call comes in. Your technician provides an upfront quote before any work begins, and that quote doesn't change because it's 2 AM.` },
  { q: (c,s) => `How fast can a licensed plumber reach my ${c} address?`,
    a: (c,s) => `Our target response time in ${c} is under 60 minutes for emergency calls. A dispatcher confirms your address and sends the nearest available technician immediately after your call.` },
  { q: (c,s) => `Are your plumbers licensed to work in ${s || 'my state'}?`,
    a: (c,s) => `Yes. Every technician dispatched to ${c} holds an active ${s || 'state'} plumbing license and carries liability insurance. You can request to see credentials when they arrive.` },
  { q: (c,s) => `What should I do while waiting for the emergency plumber in ${c}?`,
    a: (c,s) => `If you have an active water leak, locate and shut your main water supply valve. For gas concerns, leave the building and call from outside. Our dispatcher will walk you through any immediate safety steps.` },
  { q: (c,s) => `Can you handle sewer backups in ${c}, not just pipe failures?`,
    a: (c,s) => `Yes. Sewer backups are one of the most common emergency calls we receive in ${c}. We dispatch technicians equipped for sewer line clearing and camera inspection.` },
  { q: (c,s) => `Do you handle gas line emergencies in ${c}?`,
    a: (c,s) => `Yes. Licensed plumbers dispatched to ${c} are trained to respond to gas line concerns. If you smell gas, leave your home immediately and call from outside before contacting us.` },
  { q: (c,s) => `Is same-day emergency plumbing service available throughout ${c}?`,
    a: (c,s) => `Yes. We cover the full ${c} metro area with same-day emergency dispatch, including weekends and holidays.` },
  { q: (c,s) => `What types of emergencies do you handle in ${c}?`,
    a: (c,s) => `We handle burst pipes, frozen pipes, sewer backups, gas line issues, water heater failures, flooding, sump pump failures, and any other plumbing situation that requires immediate attention in ${c}.` },
  { q: (c,s) => `Will a real plumber answer if I call at 3 AM from ${c}?`,
    a: (c,s) => `Yes. Our dispatch line is staffed 24 hours a day, 7 days a week. A live dispatcher — not an answering machine — takes your call and initiates dispatch immediately.` },
  { q: (c,s) => `How do I know the plumber dispatched to my ${c} home is trustworthy?`,
    a: (c,s) => `Every technician we dispatch in ${c} is licensed, insured, and background-checked. You're welcome to request license number verification when they arrive.` },
  { q: (c,s) => `What plumbing problems are most common in ${c} during winter?`,
    a: (c,s) => `In ${c}, the most frequently reported winter plumbing emergencies are frozen and burst pipes in exterior walls, crawl spaces, and unheated garages, followed by water heater failures that spike when demand rises during cold periods. Knowing where your main shutoff valve is located is the single most important preparation step for ${c} homeowners heading into winter.` },
  { q: (c,s) => `How does ${c}'s soil type affect my home's plumbing?`,
    a: (c,s) => `The soil composition beneath ${c} directly affects buried supply and drain lines. Expansive clay or caliche soils shift seasonally as moisture levels change, placing repeated mechanical stress on underground pipe joints and connections. This is why slab leaks and drain lateral separations are among the more common findings during plumbing inspections in ${c} homes.` },
  { q: (c,s) => `Does hard or soft water in ${c} shorten the life of my plumbing?`,
    a: (c,s) => `Yes, water chemistry has a direct impact. Hard water deposits calcium and magnesium scale inside pipes and water heaters, gradually restricting flow and reducing heating efficiency. Soft or low-mineral water can be mildly corrosive to copper and galvanized steel over long periods. Both conditions affect how quickly plumbing components wear in ${c} — your technician can assess your specific situation on arrival.` },
  { q: (c,s) => `How much does emergency plumbing typically cost in ${c}?`,
    a: (c,s) => `Emergency plumbing costs in ${c} vary based on the type of problem, time of call, and materials required. Minor repairs such as shutoff valve replacement or fixture emergencies typically run a few hundred dollars. More significant work — burst pipe repair, sewer clearing, or water heater replacement — can range from several hundred to over a thousand dollars. You receive a written upfront quote before any work begins, and that price does not change mid-job.` },
  { q: (c,s) => `What pipe material is most common in ${c} homes, and does it matter?`,
    a: (c,s) => `The predominant pipe material varies by when ${c} neighborhoods were built. Older areas typically have galvanized steel, cast iron, or copper; newer construction commonly uses PEX or CPVC. Pipe material affects failure modes, repair methods, and expected service life. Our technicians arrive familiar with the plumbing materials common in ${c}'s housing stock and bring the appropriate fittings and tools.` },
  { q: (c,s) => `How often should ${c} homeowners schedule a plumbing inspection?`,
    a: (c,s) => `We recommend a full plumbing inspection every 1 to 2 years for most ${c} homes, and annually for homes over 30 years old or those with a history of leaks, clogs, or water heater issues. Regular inspections catch deteriorating pipes, failing shutoff valves, and early leaks before they become emergency calls.` },
  { q: (c,s) => `What should I keep in a plumbing emergency kit for my ${c} home?`,
    a: (c,s) => `Every ${c} home should have: a water meter key to shut off water at the street, plumber's tape, a few adjustable wrenches, old towels and a bucket, and a printed list of shutoff valve locations. Most importantly, know where your main water shutoff is and test it once a year — a seized valve is useless in an emergency.` },
  { q: (c,s) => `Can I find an emergency plumber near me in ${c} at any time?`,
    a: (c,s) => `Yes. Our 24/7 dispatch serves ${c} around the clock — nights, weekends, and holidays included. When you search for an emergency plumber near me, our local team is available to respond to your urgent plumbing needs with licensed technicians familiar with ${c} neighborhoods.` },
  { q: (c,s) => `What makes you a 24 hour plumber in ${c}?`,
    a: (c,s) => `We maintain live dispatch and technician availability 24 hours a day. Whether it's 3 AM on a Tuesday or midnight on a Sunday, our emergency plumber team in ${c} is ready to respond to your call with fully stocked service vehicles and licensed technicians.` },
  { q: (c,s) => `Do you serve as a local emergency plumber throughout ${c}?`,
    a: (c,s) => `Yes. Our technicians are local to ${c} and familiar with the area's plumbing infrastructure and common issues. We dispatch from within the region to provide fast response times for local emergency plumbing needs across all ${c} neighborhoods.` },
];

const EMERGENCY_LISTS = [
  ['Burst and frozen pipe repair', 'Sewer line backups and overflows', 'Gas line leak response', 'Water heater emergencies', 'Sump pump failures', 'Toilet overflow and sewage backup'],
  ['Active water leak stoppage', 'Pipe rupture repair', 'Main line sewer clearing', 'Flooding response and shutoff', 'Gas line inspection', 'After-hours water heater repair'],
  ['24/7 burst pipe response', 'Sewer backup clearing', 'Frozen pipe thawing and repair', 'Emergency fixture shutoff', 'Basement flooding response', 'Utility shutoff assistance'],
];

const HOW_STEPS = [
  ['Call our 24/7 emergency line', 'Dispatcher confirms your location and issue', 'Nearest licensed technician dispatched immediately', 'Technician provides upfront quote on arrival', 'Repair completed — area left clean', 'Follow-up available if any concerns arise'],
  ['You call — a live person answers', 'We identify the problem and dispatch within minutes', 'Technician arrives with a stocked service vehicle', 'Diagnosis explained before any work begins', 'Repair carried out with your approval', 'Job documented for your records'],
  ['Live dispatcher takes your call immediately', 'Technician routed to your address in real time', 'On-site arrival — assessment begins', 'Written quote provided before any work starts', 'Repair performed and tested', 'You confirm satisfaction before technician leaves'],
];

function genEmergency(cityName, stateCode, service) {
  const d = getCityData(cityName);
  const svc = 'emergency';

  const winterContext = d.winterRisk === 'high'
    ? `With average winter lows reaching ${d.avgWinterTempF}°F, ${cityName} faces real frozen and burst pipe risk each year — particularly in homes with uninsulated crawl spaces, exterior walls, or older ${d.pipeMaterial} systems installed during the ${d.pipeEra}. The ${d.soilType} underlying ${cityName} further stresses buried supply lines as ground frost penetrates during cold snaps.`
    : d.winterRisk === 'med'
    ? `While ${cityName}'s winters are moderate, temperatures can drop unexpectedly — and ${d.pipeMaterial} systems installed during the ${d.pipeEra} in homes across ${cityName} may not have been insulated to handle sudden cold snaps. ${d.summerRiskNote} adds a warm-weather dimension to the city's plumbing risk profile.`
    : `${cityName}'s mild climate means frozen pipes are uncommon, but ${d.summerRiskNote} — creating plumbing stress that makes emergencies a year-round reality. The ${d.soilType} in ${cityName} contributes to pressure on buried supply lines operated by the ${d.waterUtility} system.`;

  const dfSentence = dominantFailureSentence(cityName, d, svc);

  const dispatchIntro = pick(DISPATCH_INTROS, cityName, svc, 'di')(cityName);
  const trustPhrase = pick(TRUST_PHRASES, cityName, svc, 'tp')(stateCode || 'your state');
  const pricingPhrase = pick(PRICING_PHRASES, cityName, svc, 'pp');
  const responsePhrase = pick(RESPONSE_PHRASES, cityName, svc, 'rp')(cityName);
  const howIntro = pick(HOW_WE_WORK_INTROS, cityName, svc, 'hwi')(cityName);

  const h1 = pick(H_SERVICE_OVERVIEW, cityName, svc, 'h1')('Emergency Plumbing', cityName);
  const h2 = pick(H_WHY_US, cityName, svc, 'h2')(cityName);
  const h3 = pick(H_HOW_IT_WORKS, cityName, svc, 'h3')(cityName);

  const serviceList = pick(EMERGENCY_LISTS, cityName, svc, 'sl');
  const howSteps = pick(HOW_STEPS, cityName, svc, 'hs');

  const infraSections = buildInfraSection(cityName, stateCode, service);

  return {
    localSignal: buildLocalSignal(cityName, d),
    intro: `${dispatchIntro} ${winterContext} ${dfSentence} ${responsePhrase} ${pricingPhrase}`,
    sections: [
      {
        heading: h1,
        body: `Our ${cityName} emergency plumbing team is dispatched around the clock to handle every crisis — from burst pipes and sewer backups to gas line concerns and failed water heaters. Technicians arrive in fully stocked service vehicles carrying the parts needed for most common repairs on the first visit. ${trustPhrase}`,
        list: serviceList,
      },
      infraSections[0],
      infraSections[1],
      {
        heading: h2,
        body: `${trustPhrase} ${pricingPhrase} ${responsePhrase}`,
        list: [
          `Licensed and insured in ${stateCode || 'your state'}`,
          `Upfront pricing — no hidden charges`,
          `Fast response — we aim for under 60 minutes`,
          `Fully stocked service vehicles`,
          `Available 24/7 including weekends and holidays`,
          `Clear communication from dispatch to completion`,
        ],
      },
      {
        heading: h3,
        body: howIntro,
        list: howSteps,
      },
    ],
    faqs: pickFaqs(EMERGENCY_FAQ_POOL, cityName, stateCode, service),
    pricing: buildPricingGuidance(cityName, 'emergency'),
  };
}

// ================================================================
// LEAK REPAIR GENERATOR
// ================================================================
const LEAK_FAQ_POOL = [
  { q: (c,s) => `How do I know if I have a hidden pipe leak in my ${c} home?`,
    a: (c,s) => `Common indicators include an unexplained increase in your water bill, the sound of running water when all fixtures are off, damp or discolored patches on walls or ceilings, and reduced water pressure. A professional leak detection assessment can confirm whether a hidden leak is present.` },
  { q: (c,s) => `Can you fix a slab leak without breaking my entire floor in ${c}?`,
    a: (c,s) => `In many cases, yes. We use trenchless pipe lining and epoxy injection techniques that allow slab leaks to be repaired with minimal floor disruption. The appropriate method depends on the leak location and pipe condition, which we assess before recommending a repair approach.` },
  { q: (c,s) => `How much does leak detection and repair cost in ${c}?`,
    a: (c,s) => `Cost depends on the leak type and location. A simple faucet or fixture repair is typically a few hundred dollars. Slab leaks or wall leaks requiring pipe rerouting can range from several hundred to a few thousand dollars. We provide a full written estimate before any work begins.` },
  { q: (c,s) => `How quickly can you respond to a suspected leak in ${c}?`,
    a: (c,s) => `For active leaks causing water damage, we dispatch within the same response window as any emergency. For suspected hidden leaks without active flooding, we offer same-day and next-day assessment appointments throughout ${c}.` },
  { q: (c,s) => `Do you fix leaks in commercial properties in ${c}?`,
    a: (c,s) => `Yes. We service both residential and commercial properties in ${c}, including office buildings, retail spaces, restaurants, and multi-unit residential buildings.` },
  { q: (c,s) => `What technology do you use to find hidden leaks in ${c} homes?`,
    a: (c,s) => `We use acoustic listening devices, thermal imaging cameras, and pressure testing to locate leaks precisely without unnecessary demolition. The goal is to find the source before opening any walls or floors.` },
  { q: (c,s) => `Can a small leak wait, or should I call immediately?`,
    a: (c,s) => `Even a slow drip inside a wall can cause mold growth, structural wood rot, and ceiling damage within weeks. In ${c}'s climate conditions, moisture-related damage progresses faster than many homeowners expect. Early detection saves significantly on repair costs.` },
  { q: (c,s) => `Will you repair the wall or floor after fixing a pipe leak in ${c}?`,
    a: (c,s) => `Our plumbers complete the pipe repair and seal any access points. Drywall patching and finish work are typically handled by a separate contractor, which we can refer you to. We'll discuss what's needed during the assessment.` },
  { q: (c,s) => `Can hard or soft water in ${c} cause pipe leaks?`,
    a: (c,s) => `Yes. Hard water deposits scale that can eventually block and stress pipes, while soft water with low mineral content can be corrosive to copper and galvanized steel. The water chemistry in ${c} directly influences how and where leaks develop in your plumbing system.` },
  { q: (c,s) => `Is leak repair covered by homeowners insurance in ${c}?`,
    a: (c,s) => `Coverage depends on your specific policy and the cause of the leak. Sudden accidental damage is often covered; gradual leaks due to aging pipes typically are not. We provide detailed repair documentation that you can submit to your insurer.` },
  { q: (c,s) => `How does ${c}'s climate affect the likelihood of hidden leaks developing?`,
    a: (c,s) => `Climate plays a significant role. In humid climates like ${c}'s, moisture accumulates inside wall cavities and slows the drying of minor seepage, allowing mold and wood rot to develop before a leak becomes visible. In dry climates, the same leak may go undetected longer because damp patches dry quickly and don't trigger obvious visual signals. Professional acoustic detection finds the source regardless of climate.` },
  { q: (c,s) => `How much does slab leak repair typically cost in ${c}?`,
    a: (c,s) => `Slab leak repair costs in ${c} depend on the repair method and leak location. Epoxy pipe lining or rerouting through accessible walls typically costs less than full concrete breaking and direct-access repair. Most slab leak projects in ${c} range from several hundred to a few thousand dollars. We provide a complete written estimate after pinpointing the leak location — before any concrete or flooring is disturbed.` },
  { q: (c,s) => `What is the difference between a slab leak and a pinhole leak in ${c} homes?`,
    a: (c,s) => `A slab leak occurs in pipes running beneath your concrete foundation — typically supply lines under pressure, which means water escapes continuously. A pinhole leak is a small perforation in a copper pipe wall caused by corrosion or pitting, and can occur anywhere in the supply system. Both require professional detection; slab leaks are more structurally urgent because of the water accumulating under the foundation.` },
  { q: (c,s) => `Can I temporarily stop a pipe leak in my ${c} home while waiting for a plumber?`,
    a: (c,s) => `Yes. Shutting off the main water supply valve eliminates water flow through the leaking pipe and stops active water damage immediately. For a leaking shutoff valve or faucet that is downstream of a working isolation valve, closing that valve alone is sufficient. Do not use pipe repair tape or epoxy compounds as a permanent fix — they are temporary measures and should not delay professional repair.` },
  { q: (c,s) => `How do I find my water meter to check for leaks in ${c}?`,
    a: (c,s) => `Your water meter is typically located near the street at the property line in a small covered box flush with the ground. Turn off all water in your home, then check if the meter dial or digital display is still moving — any movement indicates a continuous leak somewhere in your supply system. This is a reliable first-step diagnostic you can perform before calling a plumber in ${c}.` },
  { q: (c,s) => `How often should ${c} homeowners inspect visible plumbing for leaks?`,
    a: (c,s) => `We recommend a quick visual inspection every 3 to 6 months in ${c}. Check under sinks, around toilet bases, behind appliances, and near your water heater for moisture, staining, or corrosion. Homes with older ${c} pipe materials from the early development periods should be inspected more frequently.` },
  { q: (c,s) => `What maintenance reduces leak risk in ${c} homes?`,
    a: (c,s) => `The most effective leak prevention in ${c} is maintaining moderate water pressure (40–60 PSI), replacing worn supply lines and shutoff valves during fixture upgrades, annual water heater maintenance, and addressing hard water scale before it damages valves and fittings. For homes on ${c}'s older infrastructure, periodic inspection of crawl space and basement pipe runs is also valuable.` },
  { q: (c,s) => `What methods do plumbers use for professional leak detection in ${c}?`,
    a: (c,s) => `Professional leak detection in ${c} typically involves multiple methods: acoustic listening devices to hear water escaping pipes, thermal imaging cameras to detect temperature differences from active leaks, pressure testing to identify system-wide drops, and electronic moisture meters to find hidden water damage. Using multiple methods together provides accurate leak location without unnecessary wall or floor opening.` },
  { q: (c,s) => `When should I schedule professional leak detection in ${c}?`,
    a: (c,s) => `Schedule professional leak detection if you notice unexplained water bill increases, hear water running when fixtures are off, see damp spots or staining on walls/ceilings, experience reduced water pressure, or have had previous slab leaks. Early detection prevents extensive water damage and significantly reduces repair costs in ${c} homes.` },
  { q: (c,s) => `How long does professional leak detection typically take in ${c}?`,
    a: (c,s) => `Most residential leak detection assessments in ${c} are completed in 1-3 hours depending on the property size and complexity. Simple visible leaks are diagnosed quickly, while hidden slab leaks or wall leaks requiring multiple detection methods may take longer. We provide upfront time estimates when scheduling your appointment.` },
];

const LEAK_SERVICE_LISTS = [
  ['Pipe leak detection and repair', 'Faucet and fixture leak repair', 'Slab leak detection and repair', 'Hidden wall and ceiling leak repair', 'Shower pan and bathtub leak repair', 'Outdoor and irrigation line leak repair'],
  ['Acoustic and thermal leak detection', 'Pinhole pipe leak repair', 'Slab leak trenchless repair', 'Supply line leak repair', 'Drain leak sealing', 'Pressure testing and diagnosis'],
  ['Non-invasive leak location', 'Copper and PEX pipe leak repair', 'Foundation slab leak repair', 'Sink and toilet base leak repair', 'Underground supply line repair', 'Water meter leak investigation'],
];

const LEAK_PROCESS_LISTS = [
  ['Non-invasive detection using acoustic and thermal tools', 'Precise leak location — no guesswork', 'Written quote provided before any repair work', 'Repair completed with quality materials', 'Pressure test performed after repair', 'Area cleaned and restored before departure'],
  ['Thorough inspection of water meter, fixtures, and visible pipes', 'Acoustic listening for hidden pipe movement', 'Exact leak source identified and confirmed', 'Repair options explained with transparent pricing', 'Pipe repaired and flow tested', 'Follow-up check available on request'],
  ['Camera and pressure test to rule out multiple leak points', 'Single source identified — reduces unnecessary access cuts', 'Repair method selected based on pipe material and age', 'Work approved by homeowner before starting', 'Completed repair pressure-verified', 'Documentation provided for insurance or records'],
];

function genLeakRepair(cityName, stateCode, service) {
  const d = getCityData(cityName);
  const svc = 'leak-repair';
  const waterContext = `${waterImpactSentence(cityName, d)} The ${d.soilType} in ${cityName} adds a geological dimension to leak risk — ground movement during seasonal moisture cycles places repeated stress on ${d.pipeMaterial} connections at depths where visual inspection is impossible without camera equipment.`;
  const dfSentence = dominantFailureSentence(cityName, d, svc);

  const dispatchIntro = pick(DISPATCH_INTROS, cityName, svc, 'di')(cityName);
  const trustPhrase = pick(TRUST_PHRASES, cityName, svc, 'tp')(stateCode || 'your state');
  const pricingPhrase = pick(PRICING_PHRASES, cityName, svc, 'pp');
  const responsePhrase = pick(RESPONSE_PHRASES, cityName, svc, 'rp')(cityName);

  const h1 = pick(H_SERVICE_OVERVIEW, cityName, svc, 'h1')('Leak Repair', cityName);
  const h2 = pick(H_WARNING_SIGNS, cityName, svc, 'h2')(cityName);
  const h3 = pick(H_WHY_US, cityName, svc, 'h3')(cityName);

  const serviceList = pick(LEAK_SERVICE_LISTS, cityName, svc, 'sl');
  const processList = pick(LEAK_PROCESS_LISTS, cityName, svc, 'pl');
  const infraSections = buildInfraSection(cityName, stateCode, service);

  return {
    localSignal: buildLocalSignal(cityName, d),
    intro: `${dispatchIntro} ${waterContext} ${dfSentence} ${pricingPhrase}`,
    sections: [
      {
        heading: h1,
        body: `Whether the problem is a dripping faucet, a pinhole leak inside your walls, or a slab leak under your foundation, our ${cityName} leak repair plumbers use acoustic detection and thermal imaging to find the source precisely — without unnecessary demolition. ${trustPhrase}`,
        list: serviceList,
      },
      {
        heading: h2,
        body: `Many leaks in ${cityName} homes go undetected for months, quietly raising water bills and damaging structural materials. Given the ${d.pipeMaterial} systems common in ${cityName} homes — most installed during the ${d.pipeEra} — these warning signs deserve immediate attention:`,
        list: ['Unexplained increase in your water bill', 'Sound of running water when all taps and fixtures are off', 'Wet spots, staining, bubbling, or warped walls and ceilings', 'Reduced water pressure throughout the home', 'Mold, mildew smell, or discoloration near walls or floors', 'Warm patches on the floor (possible slab leak indicator)'],
      },
      infraSections[0],
      infraSections[1],
      {
        heading: h3,
        body: `${trustPhrase} ${pricingPhrase} ${responsePhrase}`,
        list: processList,
      },
    ],
    faqs: pickFaqs(LEAK_FAQ_POOL, cityName, stateCode, service),
    pricing: buildPricingGuidance(cityName, 'leak-repair'),
  };
}

// ================================================================
// DRAIN CLEANING GENERATOR
// ================================================================
const DRAIN_FAQ_POOL = [
  { q: (c,s) => `How often should drains be professionally cleaned in ${c}?`,
    a: (c,s) => `For most ${c} homes, annual professional drain cleaning is a practical maintenance interval. Homes with older cast iron or clay drain lines, mature trees near the sewer lateral, or households that produce significant cooking grease or hair buildup may benefit from cleaning every six months.` },
  { q: (c,s) => `Can you clear a completely blocked main sewer line in ${c}?`,
    a: (c,s) => `Yes. Main sewer line blockages are a routine service call in ${c}. We use hydro-jetting and video camera inspection to clear the line fully and identify the underlying cause — whether it's root intrusion, scale buildup, grease accumulation, or pipe damage.` },
  { q: (c,s) => `Why does my drain keep clogging again after I clear it in ${c}?`,
    a: (c,s) => `Recurring clogs almost always indicate a deeper problem — a partial blockage in the main line, significant scale buildup on pipe walls, active root intrusion, or a damaged pipe section that traps debris. Camera inspection reveals the true cause so it can be permanently resolved.` },
  { q: (c,s) => `Do you use chemicals to clean drains in ${c}?`,
    a: (c,s) => `No. We rely on hydro-jetting and professional drain snaking, not harsh chemicals. Chemical drain cleaners are corrosive to pipe materials and rarely clear the full blockage — they create a temporary hole through the clog without removing the surrounding buildup.` },
  { q: (c,s) => `How fast can you respond for drain cleaning in ${c}?`,
    a: (c,s) => `For emergencies where water is actively backing up, we dispatch with the same urgency as any plumbing emergency. For routine drain cleaning appointments in ${c}, we offer same-day and next-day scheduling.` },
  { q: (c,s) => `What is hydro-jetting and is it safe for my ${c} home's pipes?`,
    a: (c,s) => `Hydro-jetting uses a high-pressure water stream — typically 1,500 to 4,000 PSI — to scour the interior pipe walls and flush all debris, grease, roots, and scale completely out of the line. It's safe for cast iron, PVC, CPVC, and clay pipes when performed by a trained technician who assesses pipe condition first.` },
  { q: (c,s) => `Can tree roots really grow into my sewer line in ${c}?`,
    a: (c,s) => `Yes. Tree roots naturally seek moisture and will infiltrate sewer pipes through even hairline cracks at joints. This is particularly common in ${c} neighborhoods with mature street trees and older clay or cast iron sewer laterals. Camera inspection confirms root presence before we recommend the appropriate clearing method.` },
  { q: (c,s) => `Do you offer preventive drain maintenance plans in ${c}?`,
    a: (c,s) => `Yes. Scheduled maintenance agreements for ${c} homes and businesses are available. Preventive cleaning on a fixed schedule reduces emergency drain calls and extends the life of your drain system.` },
  { q: (c,s) => `What causes sewage smell from drains in a ${c} home?`,
    a: (c,s) => `Sewage odor from drains usually indicates a dry P-trap, a partial blockage fermenting organic material, a cracked sewer lateral, or a ventilation issue in the drain-waste-vent system. A plumber can identify the source and eliminate it during an inspection.` },
  { q: (c,s) => `Can you clean drains in commercial kitchens and restaurants in ${c}?`,
    a: (c,s) => `Yes. Grease trap cleaning and commercial kitchen drain clearing are services we provide throughout ${c}. Commercial kitchens produce grease accumulation at a much higher rate than residential drains and typically require more frequent cleaning intervals.` },
  { q: (c,s) => `How much does professional drain cleaning typically cost in ${c}?`,
    a: (c,s) => `For a standard single-drain clearing in ${c}, costs typically range from $100 to $250. Main sewer line clearing with camera inspection runs higher — generally $200 to $400. Hydro-jetting for severe buildup or root intrusion ranges from $350 to $600 or more depending on line length and severity. All pricing is confirmed upfront before work begins.` },
  { q: (c,s) => `Does ${c}'s water hardness contribute to drain buildup?`,
    a: (c,s) => `In areas with hard water like ${c}, calcium and magnesium deposits can accumulate on drain pipe walls over time, narrowing the effective pipe diameter and trapping organic material more easily. This is separate from the grease, hair, and soap scum buildup that causes most household drain clogs — but scale buildup is an additional factor that makes professional hydro-jetting more effective than chemical cleaners for homes with hard water.` },
  { q: (c,s) => `What is the difference between drain snaking and hydro-jetting in ${c}?`,
    a: (c,s) => `Drain snaking uses a rotating cable to break through or pull out a blockage — effective for hair, soap, and soft clogs. Hydro-jetting uses high-pressure water to scour the entire pipe interior, removing scale, grease coating, and root fragments from the pipe walls. For recurring clogs or main line issues in ${c} homes, hydro-jetting provides a more thorough and longer-lasting result.` },
  { q: (c,s) => `Why does my ${c} home have slow drains in multiple rooms at once?`,
    a: (c,s) => `When multiple drains in different rooms slow down simultaneously, the blockage is almost always in the main sewer line rather than individual branch drains. A partial main line obstruction restricts flow from the entire house. This is a sign to call a plumber in ${c} promptly — a full sewer backup is the next stage, and it can affect all fixtures at once.` },
  { q: (c,s) => `How do I know if my ${c} home needs a sewer camera inspection?`,
    a: (c,s) => `A camera inspection is recommended when you have recurring drain problems, are purchasing an older home in ${c}, notice sewage odors from floor drains, or have had a sewer backup. The inspection identifies root intrusion, collapsed pipe sections, offset joints, and buildup that standard clearing misses — and it shows you exactly what was found on video, which can be valuable for insurance or disclosure purposes.` },
  { q: (c,s) => `What daily habits prevent drain clogs in ${c} homes?`,
    a: (c,s) => `Avoid pouring grease, coffee grounds, or starchy water down kitchen sinks; use drain strainers to catch hair in showers and tubs; and run hot water after each sink use to help move oils through the line. In ${c}, where water hardness and soil conditions can affect drain behavior, these small habits significantly reduce the frequency of professional cleanings.` },
  { q: (c,s) => `How often should main sewer lines be inspected in ${c}?`,
    a: (c,s) => `For most ${c} homes, a main sewer camera inspection every 2 to 3 years is sufficient. Homes with mature trees near the sewer lateral, older clay or cast iron lines, or a history of backups should be inspected annually. Early identification of root intrusion or offset joints prevents the far more expensive emergency backup repair.` },
  { q: (c,s) => `When is hydro-jetting recommended over drain snaking in ${c}?`,
    a: (c,s) => `Hydro-jetting is recommended for main sewer lines with heavy scale buildup, root intrusion, or recurring blockages that snaking can't fully clear. It's also preferred for commercial properties and restaurants with grease accumulation. For simple household clogs in individual drains, snaking is typically sufficient and more cost-effective.` },
  { q: (c,s) => `What is drain jetting and how does it differ from hydro-jetting in ${c}?`,
    a: (c,s) => `Drain jetting and hydro-jetting refer to the same high-pressure water cleaning method. Both use specialized equipment to send pressurized water through drain lines to remove blockages and buildup. The terms are used interchangeably in the plumbing industry — both refer to professional-grade drain cleaning that's more thorough than basic snaking.` },
  { q: (c,s) => `Is sewer camera inspection necessary before drain cleaning in ${c}?`,
    a: (c,s) => `For simple household drain clogs, camera inspection isn't always necessary. However, for main sewer lines, recurring blockages, or when purchasing an older ${c} home, camera inspection provides valuable information about pipe condition, root intrusion, or structural issues that basic cleaning won't address. It's often recommended as a diagnostic tool before and after major drain cleaning work.` },
];

const DRAIN_SERVICE_LISTS = [
  ['Kitchen drain cleaning and degreasing', 'Bathroom sink, tub, and shower drain clearing', 'Main sewer line hydro-jetting', 'Video camera sewer inspection', 'Floor drain cleaning', 'Grease trap cleaning'],
  ['Drain snaking for standard blockages', 'Hydro-jetting for root intrusion and scale', 'Sewer lateral inspection and clearing', 'Laundry drain and utility sink clearing', 'Commercial drain cleaning', 'Preventive maintenance scheduling'],
  ['Clogged toilet and sewer backup clearing', 'Kitchen grease blockage removal', 'Tree root cutting in sewer lines', 'Multi-drain simultaneous blockage diagnosis', 'Camera inspection before and after clearing', 'Floor drain and catch basin cleaning'],
];

function genDrainCleaning(cityName, stateCode, service) {
  const d = getCityData(cityName);
  const svc = 'drain-cleaning';

  const infraContext = d.infraClass === 'aging'
    ? `${cityName}'s drain infrastructure is predominantly aging — the ${d.sewerSystem} serves neighborhoods where original ${d.pipeMaterial} drain lines from the ${d.pipeEra} are still in active use. The ${d.soilType} in ${cityName} exerts ongoing stress on these older joints, and the ${d.dominantFailure} pattern is directly tied to how the city's water from the ${d.waterUtility} interacts with decades-old pipe materials.`
    : d.infraClass === 'modern'
    ? `While much of ${cityName}'s plumbing infrastructure is relatively modern, the ${d.soilType} and the ${d.waterUtility} water supply at ${d.hardnessPpm} mg/L create conditions that challenge even newer PVC and ABS drain systems — particularly at underground joints where ${d.dominantFailure} begins to manifest over time.`
    : `${cityName} has a split drain infrastructure — established neighborhoods served by the ${d.sewerSystem} carry original ${d.pipeMaterial} drain lines from the ${d.pipeEra}, while newer areas use modern materials. The ${d.soilType} means failure modes and drain conditions vary significantly by address, and the ${d.dominantFailure} tendency in this market reflects that structural complexity.`;

  const dfSentence = dominantFailureSentence(cityName, d, svc);

  const dispatchIntro = pick(DISPATCH_INTROS, cityName, svc, 'di')(cityName);
  const trustPhrase = pick(TRUST_PHRASES, cityName, svc, 'tp')(stateCode || 'your state');
  const pricingPhrase = pick(PRICING_PHRASES, cityName, svc, 'pp');
  const responsePhrase = pick(RESPONSE_PHRASES, cityName, svc, 'rp')(cityName);

  const h1 = pick(H_SERVICE_OVERVIEW, cityName, svc, 'h1')('Drain Cleaning', cityName);
  const h2 = pick(H_WARNING_SIGNS, cityName, svc, 'h2')(cityName);
  const h3 = pick(H_HOW_IT_WORKS, cityName, svc, 'h3')(cityName);

  const serviceList = pick(DRAIN_SERVICE_LISTS, cityName, svc, 'sl');
  const infraSections = buildInfraSection(cityName, stateCode, service);

  return {
    localSignal: buildLocalSignal(cityName, d),
    intro: `${dispatchIntro} Slow drains and recurring blockages are rarely just a surface inconvenience — they often signal a developing problem deeper in your ${cityName} drain system. ${infraContext} ${dfSentence} ${pricingPhrase}`,

    sections: [
      {
        heading: h1,
        body: `Our ${cityName} drain cleaning team uses video camera inspection to diagnose the exact cause of blockages before clearing them — ensuring a complete fix rather than a temporary solution. We use hydro-jetting for thorough line clearing and drain snaking for targeted blockage removal. ${trustPhrase}`,
        list: serviceList,
      },
      {
        heading: h2,
        body: `${cityName} homeowners sometimes wait too long before calling for professional drain cleaning. These early signals indicate your drain system needs attention before a full backup occurs:`,
        list: ['Slow-draining sinks, tubs, or showers throughout the home', 'Gurgling sounds from drains or the toilet base', 'Multiple drains sluggish at the same time — often a main line issue', 'Sewage smell rising from floor drains or clean-outs', 'Water backing up in the shower when the toilet flushes', 'Recurring clogs that return within days of clearing'],
      },
      infraSections[0],
      infraSections[1],
      {
        heading: h3,
        body: `${responsePhrase} ${pricingPhrase}`,
        list: ['You call — a live dispatcher assesses the situation', 'Technician dispatched with camera and hydro-jet equipment', 'Camera inspection performed before any clearing begins', 'Blockage cause identified — root, grease, scale, or damage', 'Appropriate clearing method selected and approved by you', 'Post-clearing camera confirms the line is fully open'],
      },
    ],
    faqs: pickFaqs(DRAIN_FAQ_POOL, cityName, stateCode, service),
    pricing: buildPricingGuidance(cityName, 'drain-cleaning'),
  };
}

// ================================================================
// PIPE BURST REPAIR GENERATOR
// ================================================================
const BURST_FAQ_POOL = [
  { q: (c,s) => `Where is the main water shut-off valve in my ${c} home?`,
    a: (c,s) => `In most ${c} homes, the main shut-off is located where the water supply line enters the structure — typically in the basement, utility room, crawl space, or near the exterior water meter. If you're unsure, our dispatcher can help you locate it over the phone while a technician is en route.` },
  { q: (c,s) => `How fast can you respond to a burst pipe in ${c}?`,
    a: (c,s) => `Burst pipe calls in ${c} receive emergency priority dispatch. Our target is to have a technician at your door within 60 minutes. We operate 24 hours a day, 7 days a week, and there are no additional charges for after-hours response.` },
  { q: (c,s) => `Will my homeowners insurance cover a burst pipe repair in ${c}?`,
    a: (c,s) => `Most standard homeowners insurance policies cover sudden and accidental water damage from burst pipes. Gradual leaks or pipes that failed due to lack of maintenance may not be covered. We provide detailed repair documentation to support your claim — contact your insurer to verify your specific coverage.` },
  { q: (c,s) => `Can you repair just the burst section, or does the whole pipe need replacing?`,
    a: (c,s) => `In many cases, only the damaged section needs replacement. We use pipe couplings, clamps, and epoxy repairs for localized bursts. For extensive damage or pipe systems beyond their service life, a full section replacement is recommended. We explain the options and let you decide.` },
  { q: (c,s) => `Are my pipes at risk of bursting during ${c} winters?`,
    a: (c,s) => `That depends on your home's construction and insulation. Pipes in exterior walls, unheated garages, crawl spaces, and attics face the highest risk during cold snaps. We offer pre-winter pipe inspection and insulation services throughout ${c}.` },
  { q: (c,s) => `What should I do immediately when a pipe bursts in ${c}?`,
    a: (c,s) => `Shut off your main water supply immediately to stop the flow. Turn off electricity in flooded areas if it's safe to do so. Open faucets to drain remaining water from pipes. Move valuables away from the water and document the damage with photos for insurance. Then call us — our dispatcher will guide you through any additional steps.` },
  { q: (c,s) => `How do I prevent pipes from bursting in my ${c} home?`,
    a: (c,s) => `Key preventive measures include insulating pipes in unheated spaces, maintaining interior heat above 55°F during cold periods, knowing where your main shutoff is, and scheduling a pre-winter pipe inspection. We offer preventive insulation and inspection services throughout ${c}.` },
  { q: (c,s) => `Can water damage from a burst pipe be restored on the same visit?`,
    a: (c,s) => `The pipe repair is completed on the visit. Water extraction and structural drying typically require a separate water damage restoration contractor. We can advise on next steps and documentation after completing the pipe repair.` },
  { q: (c,s) => `Do older homes in ${c} have a higher risk of burst pipes?`,
    a: (c,s) => `Generally yes. Older pipe materials like galvanized steel and cast iron are more brittle and more likely to fail under freeze-thaw stress or pressure spikes. If your ${c} home was built during the ${c} area's earlier development periods, a plumbing inspection is a worthwhile investment.` },
  { q: (c,s) => `Is pipe burst repair available on weekends and holidays in ${c}?`,
    a: (c,s) => `Yes. Burst pipe response is available 24/7 in ${c}, including weekends, public holidays, and overnight hours. Emergency pricing is not applied — you receive the same upfront quote regardless of when you call.` },
  { q: (c,s) => `How much does burst pipe repair typically cost in ${c}?`,
    a: (c,s) => `Burst pipe repair costs in ${c} depend on the pipe material, location, and extent of damage. A localized section repair using a coupling or clamp typically costs $200 to $500. Repairs requiring pipe rerouting, wall access, or replacement of a longer run can range from $500 to $2,000 or more. Water damage remediation, if needed, is a separate cost handled by a restoration contractor. You receive a written quote before work begins.` },
  { q: (c,s) => `What happens if I don't shut off the water immediately after a pipe bursts in ${c}?`,
    a: (c,s) => `Water from a burst supply line flows continuously at full pressure — typically 40 to 80 PSI — until the main is shut off. In the time it takes a plumber to arrive in ${c}, an uncontrolled burst can release hundreds of gallons. This volume saturates subfloor material, insulation, and drywall within minutes, turning a repair job into a full remediation project. Shutting off the main immediately is the single most important action.` },
  { q: (c,s) => `Which pipes are most likely to burst in ${c} homes?`,
    a: (c,s) => `The pipes most vulnerable to bursting in ${c} are those in unheated spaces — exterior walls, crawl spaces, attics, and uninsulated garages. Galvanized steel and copper pipes in older homes are also more susceptible because age and corrosion thin the pipe wall. CPVC in hot climates can crack from thermal stress. Your home's construction era and layout determine where the highest-risk pipes are located.` },
  { q: (c,s) => `Can a burst pipe cause mold in my ${c} home?`,
    a: (c,s) => `Yes. Mold can begin developing within 24 to 48 hours in wet building materials following a burst pipe event. In ${c}'s climate, humidity levels can accelerate this timeline. After the pipe is repaired, thorough drying of affected materials using industrial dehumidifiers and air movers is essential — this is typically handled by a water damage restoration company as a follow-up to the plumbing repair.` },
  { q: (c,s) => `How do I prepare my ${c} home's pipes for cold weather before winter?`,
    a: (c,s) => `Key preventive steps for ${c} homeowners include: insulating pipes in crawl spaces, attics, and exterior walls with pipe foam or heat tape; knowing the location of your main shutoff valve; keeping interior heat above 55°F even when away; disconnecting and draining outdoor hoses; and having a plumber inspect vulnerable pipe runs before the first freeze of the season.` },
  { q: (c,s) => `What does a pre-winter plumbing inspection cover in ${c}?`,
    a: (c,s) => `A pre-winter inspection in ${c} checks pipe insulation in unheated spaces, tests the main shutoff valve, inspects hose bibs and exterior faucets, examines water heater readiness, and identifies any exposed pipe runs from older development periods that are vulnerable to freezing. The goal is to eliminate the conditions that cause burst pipes before the first freeze arrives.` },
  { q: (c,s) => `How do I protect outdoor hose bibs in ${c} during winter?`,
    a: (c,s) => `Disconnect all garden hoses before the first freeze, drain any remaining water from the bib, and install a foam insulator cover over each exterior faucet. For ${c} homes with frost-free sillcocks, the design already drains internally — but the hose must still be removed for the mechanism to work. If your ${c} home has standard hose bibs, consider upgrading to frost-free models during your next plumbing service.` },
  { q: (c,s) => `What are the safest methods for thawing frozen pipes in ${c}?`,
    a: (c,s) => `Never use an open flame or high-heat torch on frozen pipes — this creates fire risk and can damage pipe materials. Safe methods include applying heat tape designed for pipes, using a hair dryer on low heat, wrapping pipes with warm towels, or gradually warming the surrounding space with space heaters. If you're unsure about safely thawing pipes in ${c}, call a professional — improper thawing can cause pipe damage.` },
  { q: (c,s) => `How can I tell if a pipe is frozen before it bursts in ${c}?`,
    a: (c,s) => `Signs of frozen pipes include no water coming from faucets when you turn them on, frost or ice visible on exposed pipes, and strange odors near drains. If you suspect frozen pipes in ${c}, shut off the main water supply immediately and call a plumber — thawing pipes before they burst prevents the extensive water damage that follows a burst.` },
  { q: (c,s) => `Are certain types of pipes more prone to freezing in ${c}?`,
    a: (c,s) => `Pipes in exterior walls, unheated crawl spaces, attics, and garages are most vulnerable regardless of material. However, galvanized steel and copper pipes in older ${c} homes are more susceptible to freeze damage because corrosion and age weaken the pipe walls. PEX and CPVC are somewhat more flexible and can tolerate slight expansion, but no pipe material is immune to freezing.` },
];

const BURST_SERVICE_LISTS = [
  ['Emergency pipe burst repair — 24/7', 'Copper, PVC, PEX, and galvanized pipe repair', 'Frozen pipe thawing and repair', 'Water main break response', 'Whole-house inspection after burst event', 'Post-burst pressure testing'],
  ['Active burst pipe water shutoff assistance', 'Localized pipe section replacement', 'Pipe clamp and coupling repair', 'Freeze event pipe assessment', 'Crawl space and exterior wall pipe inspection', 'Insurance documentation support'],
  ['Emergency water shutoff and pipe repair', 'PEX, copper, and CPVC burst repair', 'Attic and crawl space frozen pipe thawing', 'Burst water line rerouting', 'Pressure test after all repairs', 'Pre-winter pipe insulation service'],
];

function genPipeBurst(cityName, stateCode, service) {
  const d = getCityData(cityName);
  const svc = 'pipe-burst-repair';

  const riskContext = d.winterRisk === 'high'
    ? `${cityName} winters regularly push temperatures to ${d.avgWinterTempF}°F and below — cold enough to freeze ${d.pipeMaterial} pipes in exterior walls, crawl spaces, and unheated garages within hours of sustained exposure. The ${d.soilType} in ${cityName} penetrates frost deeply, and the ${d.waterUtility} system serves neighborhoods where insulation standards during the ${d.pipeEra} were far lower than modern requirements.`
    : d.winterRisk === 'med'
    ? `While ${cityName} is not known for extreme winters, temperatures can drop unexpectedly — and when they do, ${d.pipeMaterial} systems from the ${d.pipeEra} in homes across the city can freeze quickly. ${d.summerRiskNote} adds a secondary stress layer, and the ${d.soilType} means ground movement is a year-round factor in ${cityName} pipe failures.`
    : `${cityName}'s climate means frozen pipes are uncommon, but burst pipes still occur — ${d.summerRiskNote} is the more common trigger. Pressure spikes, ${d.pipeMaterial} systems from the ${d.pipeEra}, and soil movement from ${d.soilType} are the primary causes of pipe failures, with the ${d.waterUtility} system infrastructure adding additional context.`;

  const dfSentence = dominantFailureSentence(cityName, d, svc);

  const dispatchIntro = pick(DISPATCH_INTROS, cityName, svc, 'di')(cityName);
  const trustPhrase = pick(TRUST_PHRASES, cityName, svc, 'tp')(stateCode || 'your state');
  const pricingPhrase = pick(PRICING_PHRASES, cityName, svc, 'pp');
  const responsePhrase = pick(RESPONSE_PHRASES, cityName, svc, 'rp')(cityName);

  const h1 = pick(H_SERVICE_OVERVIEW, cityName, svc, 'h1')('Pipe Burst Repair', cityName);
  const h2 = pick(H_HOW_IT_WORKS, cityName, svc, 'h2')(cityName);
  const h3 = pick(H_WHY_US, cityName, svc, 'h3')(cityName);

  const serviceList = pick(BURST_SERVICE_LISTS, cityName, svc, 'sl');
  const infraSections = buildInfraSection(cityName, stateCode, service);

  return {
    localSignal: buildLocalSignal(cityName, d),
    intro: `${dispatchIntro} ${riskContext} ${dfSentence} ${responsePhrase} ${pricingPhrase}`,
    sections: [
      {
        heading: h1,
        body: `A burst pipe releases water at a rate that can cause significant structural damage within minutes. Our ${cityName} burst pipe specialists arrive fully equipped to stop the water flow, assess the extent of damage, and complete permanent repairs in a single visit in most cases. ${trustPhrase}`,
        list: serviceList,
      },
      {
        heading: h2,
        body: `Fast action in the first few minutes after a pipe burst significantly limits the water damage. While our ${cityName} team is en route, follow these steps:`,
        list: ['Locate and shut off your main water supply valve immediately', 'Turn off electricity to any rooms where water is present, if safe', 'Open faucets throughout the home to drain remaining water from pipes', 'Move furniture, rugs, and valuables out of the affected area', 'Photograph all visible damage for insurance documentation', 'Stay on the line with our dispatcher for additional guidance'],
      },
      infraSections[0],
      infraSections[1],
      {
        heading: h3,
        body: `${trustPhrase} ${pricingPhrase} ${responsePhrase}`,
        list: ['Licensed and insured technicians in ' + (stateCode || 'your state'), 'Emergency dispatch available at any hour', 'Stocked vehicles carry most common pipe materials and fittings', 'Upfront written quote before work begins', 'Post-repair pressure test confirms complete fix', 'Insurance documentation provided on request'],
      },
    ],
    faqs: pickFaqs(BURST_FAQ_POOL, cityName, stateCode, service),
    pricing: buildPricingGuidance(cityName, 'pipe-burst-repair'),
  };
}

// ================================================================
// WATER HEATER REPAIR GENERATOR
// ================================================================
const WATER_HEATER_FAQ_POOL = [
  { q: (c,s) => `How long should a water heater last in ${c}'s water conditions?`,
    a: (c,s) => `Standard tank water heaters typically last 8 to 12 years, though water hardness significantly affects this. In ${c}, where water hardness is a factor, units without annual maintenance often show performance decline earlier. Tankless units generally last 15 to 20 years with proper servicing.` },
  { q: (c,s) => `Can you replace my water heater the same day in ${c}?`,
    a: (c,s) => `In most cases, yes. We stock commonly used tank and tankless models and can complete same-day installation across ${c}. Call in the morning and you'll typically have restored hot water by evening.` },
  { q: (c,s) => `Should I repair or replace my water heater?`,
    a: (c,s) => `If the unit is under six years old and the repair cost is less than half the replacement cost, repair is generally the better option. For units older than ten years showing signs of failure, replacement is usually more cost-effective and reliable over the next decade.` },
  { q: (c,s) => `Are tankless water heaters a good choice for ${c} homes?`,
    a: (c,s) => `For most ${c} homeowners, tankless units offer meaningful advantages: continuous hot water on demand, 20 to 30 percent lower energy consumption than tank units, and a longer service life. The higher upfront cost is typically recovered in energy savings over five to seven years.` },
  { q: (c,s) => `What brands of water heaters do you install in ${c}?`,
    a: (c,s) => `We install and service all major brands, including Rheem, Bradford White, A.O. Smith, Navien, Rinnai, Noritz, and State. We recommend specific models based on your household size, water hardness, and energy goals rather than brand preference alone.` },
  { q: (c,s) => `What causes the rumbling and popping sounds from my water heater in ${c}?`,
    a: (c,s) => `Those sounds are almost always sediment — mineral scale that has settled on the bottom of the tank and is being heated unevenly by the burner. In ${c}, where water mineral content varies, this buildup can occur within 18 to 24 months without regular flushing. Annual tank flushing prevents this.` },
  { q: (c,s) => `Is rusty or discolored hot water dangerous in a ${c} home?`,
    a: (c,s) => `Discolored hot water typically indicates an aging anode rod that has failed, allowing the tank lining to corrode. This is a sign the unit is nearing end of life. Have the unit assessed — if the tank itself is rusting internally, replacement is necessary rather than repair.` },
  { q: (c,s) => `Can you service commercial water heaters in ${c}?`,
    a: (c,s) => `Yes. We service commercial tank and tankless water heater systems in ${c}, including high-capacity units in restaurants, hotels, office buildings, and multi-unit residential properties.` },
  { q: (c,s) => `How much does water heater replacement cost in ${c}?`,
    a: (c,s) => `Cost depends on unit type, capacity, and installation requirements. A standard tank replacement typically ranges from several hundred to over a thousand dollars including installation. Tankless units have a higher upfront cost but lower operating costs. We provide a full written estimate before any work begins.` },
  { q: (c,s) => `Do I need a permit for water heater replacement in ${c}?`,
    a: (c,s) => `Most jurisdictions in ${c} require a permit for water heater replacement, particularly for gas units. We handle permit pulling where required as part of the installation service.` },
  { q: (c,s) => `How much does water heater replacement typically cost in ${c} for a standard home?`,
    a: (c,s) => `A standard 40- or 50-gallon gas or electric tank replacement in ${c} including installation typically ranges from $800 to $1,500. Tankless units run higher — generally $1,500 to $3,000 or more installed — but offer longer service life and lower ongoing energy costs. All pricing is provided in a written upfront quote before work begins, with no surprise charges.` },
  { q: (c,s) => `Does ${c}'s water hardness damage water heaters faster than average?`,
    a: (c,s) => `Yes, where water hardness is elevated in ${c}'s supply. Calcium and magnesium dissolved in hard water deposit as sediment inside tank water heaters, insulating the heating element and forcing the unit to run longer per heating cycle. This accelerates wear and increases energy use. Annual tank flushing significantly extends heater life in hard water areas.` },
  { q: (c,s) => `What is the difference between a tank and tankless water heater for ${c} homes?`,
    a: (c,s) => `A tank water heater stores a reserve of preheated water — typically 30 to 80 gallons — ready for immediate use. A tankless unit heats water on demand as it flows through, eliminating standby heat loss but requiring adequate gas or electric supply capacity. For ${c} homes with high simultaneous hot water demand, a properly sized tankless unit can reduce energy costs meaningfully over a 10- to 15-year horizon.` },
  { q: (c,s) => `What causes rusty or smelly hot water from my ${c} water heater?`,
    a: (c,s) => `Rusty hot water typically means the tank's anode rod — a sacrificial metal rod that prevents internal tank corrosion — has been depleted, allowing the steel tank lining to oxidize. A sulfur or rotten-egg smell usually indicates a bacterial reaction in the tank. Both conditions are diagnosable during a service visit; anode rod replacement can sometimes resolve the issue without full unit replacement if the tank body is still sound.` },
  { q: (c,s) => `How do I know if my ${c} water heater needs repair or full replacement?`,
    a: (c,s) => `Age is the primary decision factor: tank water heaters have a typical service life of 8 to 12 years. A unit under 8 years old with a failed element, thermostat, or valve is usually worth repairing. A unit over 10 years old with rust, persistent sediment noise, or a leak at the tank body is almost always more economical to replace. Our technicians provide an honest assessment on arrival rather than defaulting to replacement.` },
  { q: (c,s) => `How often should a water heater be flushed in ${c}?`,
    a: (c,s) => `In most ${c} homes, tank water heaters should be flushed at least once a year. In areas with elevated water hardness, flushing every 6 months is better. Annual flushing removes sediment and scale that would otherwise insulate the heating element, reduce efficiency, and shorten the unit's service life.` },
  { q: (c,s) => `What routine maintenance extends water heater life in ${c}?`,
    a: (c,s) => `The three most effective maintenance tasks are: annual tank flushing to remove sediment, anode rod inspection every 3 to 5 years (replacement when depleted), and annual testing of the temperature and pressure relief valve. For ${c} homes with hard water, a water softener or descaling schedule can also reduce scale-related wear.` },
  { q: (c,s) => `What are common tankless water heater failure symptoms in ${c}?`,
    a: (c,s) => `Common tankless water heater problems include insufficient hot water, fluctuating water temperature, error codes on the display unit, reduced water flow, strange noises during operation, and the unit shutting down unexpectedly. These issues often indicate scale buildup, a failing heat exchanger, or problems with the gas or electrical supply components in ${c} homes.` },
  { q: (c,s) => `How is tankless water heater repair different from tank water heater repair in ${c}?`,
    a: (c,s) => `Tankless units have more complex components including heat exchangers, flow sensors, and electronic control boards. Repairs often require specialized diagnostic equipment and manufacturer-specific parts. Tank units have simpler mechanical components but require tank sediment management. Both types require licensed technicians, but tankless repairs typically cost more due to the specialized components involved.` },
  { q: (c,s) => `When should I repair vs replace a tankless water heater in ${c}?`,
    a: (c,s) => `Repair tankless units under 10 years old if the repair cost is less than 50% of replacement cost. Replace units over 15 years old or those with failed heat exchangers, which are expensive to replace. Consider replacement if your household's hot water demand has outgrown the current unit's capacity, as upgrading to a higher-capacity model may be more cost-effective than multiple repairs.` },
  { q: (c,s) => `Does hard water in ${c} affect tankless water heaters more than tank units?`,
    a: (c,s) => `Yes, tankless units are more sensitive to hard water scale buildup. Scale can accumulate in the narrow heat exchanger passages, reducing efficiency and potentially causing overheating. Regular descaling every 6 to 12 months is recommended for tankless units in ${c}, especially in areas with elevated water hardness. This maintenance extends service life and maintains efficiency.` },
];

const WH_SERVICE_LISTS = [
  ['Water heater repair — all brands and types', 'Tankless water heater repair and installation', 'Emergency same-day water heater replacement', 'Anode rod inspection and replacement', 'Thermostat and heating element repair', 'Commercial water heater service'],
  ['Tank flushing and sediment removal', 'Gas and electric water heater repair', 'Tankless unit descaling and maintenance', 'Pressure relief valve inspection and replacement', 'Water heater installation with permit', 'Energy-efficient upgrade consultation'],
  ['Emergency water heater diagnosis', 'All-brand water heater service', 'Hybrid heat pump water heater installation', 'Expansion tank installation', 'Gas line connection for water heaters', 'Old unit removal and proper disposal'],
];

const WH_REPLACEMENT_LISTS = [
  ['Same-day water heater installation available', 'Tank and tankless models in stock', 'Correct sizing assessment for your home', 'Old unit removed and disposed of properly', 'Permit pulled where required', 'Post-installation pressure and temperature check'],
  ['Gas and electric installation — all fuel types', 'Tankless conversion available', 'Energy Star models available', 'Expansion tank installation if required by code', 'All connections tested and verified', 'Documentation provided for permits and warranty'],
  ['In-stock units for immediate installation', 'Proper sizing based on household demand', 'Manufacturer warranty preserved with professional install', 'Gas shutoff and reconnection handled safely', 'Code-compliant installation throughout', 'Final inspection and operational confirmation'],
];

function genWaterHeater(cityName, stateCode, service) {
  const d = getCityData(cityName);
  const svc = 'water-heater-repair';
  const waterHeaterContext = `${waterImpactSentence(cityName, d)} For ${cityName} homes with ${d.pipeMaterial} systems from the ${d.pipeEra}, water heater maintenance schedules should account for local water hardness and pipe material interaction, which directly influences sediment accumulation rates in tank units.`;
  const dfSentence = dominantFailureSentence(cityName, d, svc);

  const dispatchIntro = pick(DISPATCH_INTROS, cityName, svc, 'di')(cityName);
  const trustPhrase = pick(TRUST_PHRASES, cityName, svc, 'tp')(stateCode || 'your state');
  const pricingPhrase = pick(PRICING_PHRASES, cityName, svc, 'pp');
  const responsePhrase = pick(RESPONSE_PHRASES, cityName, svc, 'rp')(cityName);

  const h1 = pick(H_SERVICE_OVERVIEW, cityName, svc, 'h1')('Water Heater Repair', cityName);
  const h2 = pick(H_WARNING_SIGNS, cityName, svc, 'h2')(cityName);
  const h3 = pick(H_WHY_US, cityName, svc, 'h3')(cityName);

  const serviceList = pick(WH_SERVICE_LISTS, cityName, svc, 'sl');
  const replacementList = pick(WH_REPLACEMENT_LISTS, cityName, svc, 'rl');
  const infraSections = buildInfraSection(cityName, stateCode, service);

  return {
    localSignal: buildLocalSignal(cityName, d),
    intro: `${dispatchIntro} ${waterHeaterContext} ${dfSentence} ${responsePhrase} ${pricingPhrase}`,
    sections: [
      {
        heading: h1,
        body: `Our ${cityName} water heater technicians service all brands and types — traditional tank units, tankless on-demand systems, heat pump models, and commercial water heaters. We carry the most common replacement parts and units in our service vehicles, allowing most repairs and replacements to be completed in a single visit. ${trustPhrase}`,
        list: serviceList,
      },
      {
        heading: h2,
        body: `${cityName} homeowners often wait until a complete failure before calling — but these warning signs indicate your water heater needs attention before you lose hot water entirely:`,
        list: ['No hot water, or water that doesn\'t reach the expected temperature', 'Rusty, discolored, or metallic-smelling water from hot taps only', 'Rumbling, popping, or banging sounds during heating cycles', 'Water pooling around the base of the tank', 'Unit is 10 or more years old and showing performance decline', 'Energy bills increasing without changes in usage patterns'],
      },
      infraSections[0],
      infraSections[1],
      {
        heading: h3,
        body: `When repair is not cost-effective, we offer same-day water heater replacement throughout ${cityName}. ${pricingPhrase}`,
        list: replacementList,
      },
    ],
    faqs: pickFaqs(WATER_HEATER_FAQ_POOL, cityName, stateCode, service),
    pricing: buildPricingGuidance(cityName, 'water-heater-repair'),
  };
}

// ================================================================
// SEWER LINE REPAIR GENERATOR
// ================================================================
const SEWER_FAQ_POOL = [
  { q: (c,s) => `How do I know if my main sewer line is damaged in ${c}?`,
    a: (c,s) => `Common signs include slow drains throughout your home, gurgling sounds from drains, sewage odors, frequent drain clogs that return after clearing, and patches of extra-green grass in your yard. A sewer camera inspection can definitively diagnose the problem.` },
  { q: (c,s) => `What causes sewer line damage in ${c} homes?`,
    a: (c,s) => `Common causes include tree root intrusion, aging pipe deterioration, ground movement from soil conditions, and pipe bellies or sagging sections. Local soil conditions and sewer system characteristics influence which problems are most common in your area.` },
  { q: (c,s) => `Do you offer trenchless sewer line repair in ${c}?`,
    a: (c,s) => `Yes. We offer pipe relining and trenchless repair methods that can fix many sewer line problems without extensive excavation. The appropriate method depends on the pipe condition and location, which we assess with camera inspection before recommending a repair approach.` },
  { q: (c,s) => `How much does sewer line repair cost in ${c}?`,
    a: (c,s) => `Cost depends on the repair method and extent of damage. Camera inspection and clearing typically cost a few hundred dollars. Pipe relining or spot repair ranges from several hundred to a few thousand. Complete line replacement costs more. We provide a complete written estimate after inspection.` },
  { q: (c,s) => `How long does sewer line repair take in ${c}?`,
    a: (c,s) => `Most sewer repairs can be completed in one day. Camera inspection takes 1-2 hours. Clearing blockages typically takes 2-4 hours. Pipe relining or spot repairs usually take 1-2 days. Complete line replacement may take 2-5 days depending on length and conditions.` },
  { q: (c,s) => `Will sewer line repair damage my yard or landscaping in ${c}?`,
    a: (c,s) => `Trenchless methods like pipe relining minimize yard disruption. When excavation is necessary, we restore the area as much as possible, though some landscaping impact is unavoidable. We discuss the expected disruption before starting work and can recommend landscaping contractors for restoration.` },
  { q: (c,s) => `Does homeowners insurance cover sewer line repair in ${c}?`,
    a: (c,s) => `Coverage depends on your specific policy and the cause of damage. Sudden accidental damage from external forces is often covered; gradual deterioration due to age or tree roots typically is not. We provide detailed documentation you can submit to your insurer.` },
  { q: (c,s) => `How can I prevent sewer line problems in my ${c} home?`,
    a: (c,s) => `Preventive measures include avoiding flushing non-biodegradable items, having periodic camera inspections for older lines, managing tree roots near sewer lines, and addressing slow drains promptly rather than waiting for complete blockage.` },
  { q: (c,s) => `What is pipe relining and how does it work in ${c}?`,
    a: (c,s) => `Pipe relining is a trenchless repair method where we insert a resin-coated liner into the existing pipe, then cure it in place to create a new pipe within the old one. This method avoids excavation and is often suitable for repairing cracks, root intrusion, and moderate pipe deterioration.` },
  { q: (c,s) => `Do you handle sewer line emergencies in ${c}?`,
    a: (c,s) => `Yes. Sewer backups are considered plumbing emergencies and we prioritize them accordingly. If you have sewage backing up into your home, call immediately and we'll dispatch a technician as quickly as possible to stop the backup and begin repair.` },
  { q: (c,s) => `How does ${c}'s sewer system affect my sewer line?`,
    a: (c,s) => `The municipal sewer system serving ${c} influences what happens at your property line. Combined sewer systems versus separate systems, local maintenance practices, and municipal infrastructure age all affect how your lateral connects and what problems are most common in your area.` },
  { q: (c,s) => `Can you repair sewer lines under concrete slabs in ${c}?`,
    a: (c,s) => `Yes. We have equipment and methods for accessing and repairing sewer lines under slabs, driveways, and other concrete surfaces. The approach depends on the pipe depth and condition, which we assess before recommending the most appropriate repair method.` },
  { q: (c,s) => `What materials do you use for sewer line repair in ${c}?`,
    a: (c,s) => `We use code-approved materials appropriate for ${c}'s requirements, typically PVC or ABS for new installations, and epoxy liners for trenchless repairs. All materials meet local plumbing codes and are designed for long-term durability in local soil conditions.` },
  { q: (c,s) => `How do you locate sewer lines under my ${c} property?`,
    a: (c,s) => `We use electronic locators and camera inspection to trace sewer lines from your home to the street connection. This allows us to map the line path accurately before any excavation, minimizing unnecessary digging and ensuring we access the exact problem area.` },
  { q: (c,s) => `Should I replace or repair my sewer line in ${c}?`,
    a: (c,s) => `The decision depends on the pipe's overall condition. If your line has multiple damaged sections, is extensively corroded, or is very old, replacement may be more cost-effective than repeated repairs. We provide camera inspection and assessment to help you make the right decision for your ${c} property.` },
];

const SEWER_SERVICE_LISTS = [
  ['Main sewer line repair and replacement', 'Sewer camera inspection and diagnosis', 'Trenchless pipe relining', 'Root removal and pipe clearing', 'Sewer backup emergency response', 'Bellied pipe correction'],
  ['Sewer line location and mapping', 'Excavation and pipe replacement', 'Epoxy pipe lining installation', 'Root cutting and prevention', 'Cleanout installation and repair', 'Sewer to street connection repair'],
  ['Video sewer inspection', 'Sectional pipe repair', 'Complete sewer line replacement', 'Trenchless sewer rehabilitation', 'Root intrusion treatment', 'Sewer lateral repair'],
];

const SEWER_PROCESS_LISTS = [
  ['Camera inspection of sewer line', 'Problem identification and location', 'Repair method recommendation', 'Excavation or trenchless repair', 'Line testing and verification', 'Site restoration'],
  ['Sewer line assessment', 'Repair plan and cost estimate', 'Permit and utility coordination if needed', 'Repair execution with minimal disruption', 'Final inspection and cleanup', 'Warranty documentation'],
  ['Video diagnosis of sewer condition', 'Problem area pinpointing', 'Repair method selection based on condition', 'Professional repair or replacement', 'Flow testing and verification', 'Area restoration and cleanup'],
];

function genSewerLineRepair(cityName, stateCode, service) {
  const d = getCityData(cityName);
  const svc = 'sewer-line-repair';
  const sewerContext = `${cityName}'s ${d.sewerSystem} serves neighborhoods where ${d.pipeMaterial} was commonly installed during the ${d.pipeEra}. The ${d.soilType} underlying ${cityName} directly affects sewer line longevity, with expansive soils and tree root activity being the primary causes of lateral damage in this area.`;
  const dfSentence = dominantFailureSentence(cityName, d, svc);

  const dispatchIntro = pick(DISPATCH_INTROS, cityName, svc, 'di')(cityName);
  const trustPhrase = pick(TRUST_PHRASES, cityName, svc, 'tp')(stateCode || 'your state');
  const pricingPhrase = pick(PRICING_PHRASES, cityName, svc, 'pp');
  const responsePhrase = pick(RESPONSE_PHRASES, cityName, svc, 'rp')(cityName);

  const h1 = pick(H_SERVICE_OVERVIEW, cityName, svc, 'h1')('Sewer Line Repair', cityName);
  const h2 = pick(H_WHY_US, cityName, svc, 'h2')(cityName);
  const h3 = pick(H_HOW_IT_WORKS, cityName, svc, 'h3')(cityName);

  const serviceList = pick(SEWER_SERVICE_LISTS, cityName, svc, 'sl');
  const processList = pick(SEWER_PROCESS_LISTS, cityName, svc, 'pl');
  const infraSections = buildInfraSection(cityName, stateCode, service);

  return {
    localSignal: buildLocalSignal(cityName, d),
    intro: `${dispatchIntro} ${sewerContext} ${dfSentence} ${responsePhrase} ${pricingPhrase}`,
    sections: [
      {
        heading: h1,
        body: `Our ${cityName} sewer line repair team handles every aspect of main sewer line problems — from camera inspection and diagnosis to trenchless repair and complete replacement. We understand the ${d.sewerSystem} and local soil conditions that affect sewer lines in this area. ${trustPhrase}`,
        list: serviceList,
      },
      infraSections[0],
      infraSections[1],
      {
        heading: h2,
        body: `${trustPhrase} ${pricingPhrase} ${responsePhrase}`,
        list: [
          `Licensed and insured in ${stateCode || 'your state'}`,
          `Sewer camera inspection technology`,
          `Trenchless repair options when possible`,
          `Upfront pricing with detailed estimates`,
          `Emergency sewer backup response`,
          `Complete project documentation`,
        ],
      },
      {
        heading: h3,
        body: `Sewer line repair in ${cityName} begins with accurate diagnosis. We don't guess at the problem — we use camera inspection to see inside your sewer line and pinpoint the exact location and nature of the damage.`,
        list: processList,
      },
    ],
    faqs: pickFaqs(SEWER_FAQ_POOL, cityName, stateCode, service),
    pricing: buildPricingGuidance(cityName, 'sewer-line-repair'),
  };
}

// ================================================================
// TOILET REPAIR GENERATOR
// ================================================================
const TOILET_FAQ_POOL = [
  { q: (c,s) => `Why is my toilet constantly running in my ${c} home?`,
    a: (c,s) => `The most common cause is a worn flapper valve that doesn't seal properly, allowing water to continuously flow from tank to bowl. Other causes include a faulty fill valve, improper chain length, or a misaligned flush valve. These are typically quick repairs that can be completed in one visit.` },
  { q: (c,s) => `How much does toilet repair cost in ${c}?`,
    a: (c,s) => `Simple internal component repairs like flapper or fill valve replacement typically cost a few hundred dollars. More complex repairs like wax ring replacement or complete rebuilds cost more. New toilet installation including removal of the old unit typically ranges from several hundred to a few hundred dollars depending on the toilet selected.` },
  { q: (c,s) => `Should I repair or replace my toilet in ${c}?`,
    a: (c,s) => `Consider replacement if your toilet is over 15-20 years old, has cracks in the tank or bowl, requires frequent repairs, or uses excessive water. Modern high-efficiency toilets use significantly less water and may pay for themselves in water savings over time. We can assess your toilet and recommend the most cost-effective option.` },
  { q: (c,s) => `How do I know if my toilet wax ring needs replacement in ${c}?`,
    a: (c,s) => `Signs include water pooling around the toilet base, unpleasant odors coming from the base, a wobbly toilet that doesn't sit firmly on the floor, or water damage on the ceiling below if the toilet is on an upper floor. These indicate the seal between toilet and drain pipe has failed.` },
  { q: (c,s) => `Can you install any brand of toilet in ${c}?`,
    a: (c,s) => `Yes. We work with all major toilet brands and can install any model you choose, or recommend options based on your bathroom layout, budget, and water efficiency preferences. We handle removal of your old toilet, installation of the new unit, and all necessary connections.` },
  { q: (c,s) => `Why does my toilet clog frequently in ${c}?`,
    a: (c,s) => `Frequent clogging can indicate a partial blockage in the drain line, issues with the toilet's trap design, flushing problems with low-flow models, or items being flushed that shouldn't be. If plunging doesn't resolve the issue, professional inspection can identify the underlying cause.` },
  { q: (c,s) => `Do you handle toilet emergencies in ${c}?`,
    a: (c,s) => `Yes. Toilets that are overflowing, leaking significantly, or completely non-functional are considered urgent. We prioritize these calls and can typically dispatch a technician the same day to prevent water damage and restore functionality.` },
  { q: (c,s) => `How does water hardness affect my toilet in ${c}?`,
    a: (c,s) => `Hard water causes mineral buildup inside toilet tanks and on flush valves, which can lead to running toilets, weak flushes, and component failure. Local water hardness means regular maintenance can extend your toilet's life and prevent common problems caused by scale accumulation.` },
  { q: (c,s) => `What are the signs my toilet needs repair in ${c}?`,
    a: (c,s) => `Watch for constant running, weak flushing, phantom flushing (tank refilling without being used), water around the base, slow drainage, unusual noises during flushing, or cracks in the porcelain. Addressing these signs early can prevent water waste and more extensive damage.` },
  { q: (c,s) => `Can a toilet leak increase my water bill significantly in ${c}?`,
    a: (c,s) => `Yes. A running toilet can waste hundreds of gallons per day, which can substantially increase your water bill. Even a small leak that's not immediately visible can waste significant water over time. If you notice an unexplained increase in your water bill, check your toilet for leaks or have it professionally inspected.` },
  { q: (c,s) => `Do you repair commercial toilets in ${c}?`,
    a: (c,s) => `Yes. We service toilets in commercial properties including office buildings, restaurants, retail spaces, and multi-unit residential buildings. Commercial toilets often have different components and requirements than residential units, and our technicians are experienced with both types.` },
  { q: (c,s) => `How long does toilet repair typically take in ${c}?`,
    a: (c,s) => `Most toilet repairs can be completed in 1-2 hours. Simple component replacements like flappers or fill valves are often completed in under an hour. Wax ring replacement or complete rebuilds may take 2-3 hours. New toilet installation typically takes 2-4 hours including removal of the old unit.` },
  { q: (c,s) => `What should I do if my toilet overflows in ${c}?`,
    a: (c,s) => `First, stop the water flow by lifting the float ball or turning off the shutoff valve behind the toilet. Don't flush again. Clean up the water to prevent damage, then call a plumber. If the overflow is caused by a sewer backup, avoid using any drains in your home until the problem is resolved.` },
  { q: (c,s) => `Do you work with tankless toilets and smart toilets in ${c}?`,
    a: (c,s) => `Yes. We service modern toilet technologies including tankless models, pressure-assisted flush systems, and smart toilets with electronic features. These units have specialized components that require specific expertise, which our technicians have.` },
  { q: (c,s) => `How can I extend my toilet's life in ${c}?`,
    a: (c,s) => `Regular maintenance helps: avoid flushing non-biodegradable items, address running toilets promptly, check for leaks periodically, and clean mineral buildup from tank components if you have hard water. For homes with hard water, annual inspection can catch scale-related problems before they cause failure.` },
];

const TOILET_SERVICE_LISTS = [
  ['Toilet repair and troubleshooting', 'Flapper and fill valve replacement', 'Wax ring replacement and reseating', 'Complete toilet rebuild', 'New toilet installation', 'Commercial toilet service'],
  ['Running toilet repair', 'Leaking toilet diagnosis and repair', 'Weak flush repair', 'Toilet component replacement', 'Bathroom plumbing assessment', 'Emergency toilet service'],
  ['All toilet makes and models serviced', 'Internal component repair', 'Toilet installation and setup', 'Supply line replacement', 'Drain connection repair', 'Preventive maintenance'],
];

function genToiletRepair(cityName, stateCode, service) {
  const d = getCityData(cityName);
  const svc = 'toilet-repair';
  const toiletContext = `${waterImpactSentence(cityName, d)} For ${cityName} homes, water hardness at ${d.hardnessPpm} mg/L directly affects toilet component longevity — scale buildup on flush valves and fill valves is a common cause of running toilets and weak flushes in this area.`;
  const dfSentence = dominantFailureSentence(cityName, d, svc);

  const dispatchIntro = pick(DISPATCH_INTROS, cityName, svc, 'di')(cityName);
  const trustPhrase = pick(TRUST_PHRASES, cityName, svc, 'tp')(stateCode || 'your state');
  const pricingPhrase = pick(PRICING_PHRASES, cityName, svc, 'pp');
  const responsePhrase = pick(RESPONSE_PHRASES, cityName, svc, 'rp')(cityName);

  const h1 = pick(H_SERVICE_OVERVIEW, cityName, svc, 'h1')('Toilet Repair', cityName);
  const h2 = pick(H_WHY_US, cityName, svc, 'h2')(cityName);
  const h3 = pick(H_HOW_IT_WORKS, cityName, svc, 'h3')(cityName);

  const serviceList = pick(TOILET_SERVICE_LISTS, cityName, svc, 'sl');
  const infraSections = buildInfraSection(cityName, stateCode, service);

  return {
    localSignal: buildLocalSignal(cityName, d),
    intro: `${dispatchIntro} ${toiletContext} ${dfSentence} ${responsePhrase} ${pricingPhrase}`,
    sections: [
      {
        heading: h1,
        body: `Our ${cityName} toilet repair technicians handle every toilet problem — from running toilets and constant leaks to complete rebuilds and new installations. We understand how ${d.hardnessPpm} mg/L water hardness affects toilet components in this area. ${trustPhrase}`,
        list: serviceList,
      },
      infraSections[0],
      infraSections[1],
      {
        heading: h2,
        body: `${trustPhrase} ${pricingPhrase} ${responsePhrase}`,
        list: [
          `Licensed and insured in ${stateCode || 'your state'}`,
          `All toilet brands and models serviced`,
          `Same-day service for urgent problems`,
          `Upfront pricing with written estimates`,
          `New toilet installation available`,
          `Warranty on all repairs and installations`,
        ],
      },
      {
        heading: h3,
        body: `Toilet repair in ${cityName} begins with accurate diagnosis. We identify whether the problem is a simple component issue like a flapper or fill valve, or a more complex problem requiring wax ring replacement or complete rebuild.`,
        list: [
          'Thorough inspection of toilet and connections',
          'Problem identification and repair options',
          'Component replacement or rebuild as needed',
          'Testing for proper operation and water efficiency',
          'Cleanup and area restoration',
          'Preventive maintenance recommendations',
        ],
      },
    ],
    faqs: pickFaqs(TOILET_FAQ_POOL, cityName, stateCode, service),
    pricing: buildPricingGuidance(cityName, 'toilet-repair'),
  };
}

// ================================================================
// SLAB LEAK REPAIR GENERATOR
// ================================================================
const SLAB_FAQ_POOL = [
  { q: (c,s) => `How do I know if I have a slab leak in my ${c} home?`,
    a: (c,s) => `Common signs include unexplained high water bills, warm spots on the floor, sound of running water when fixtures are off, cracks in walls or flooring, and moisture or mold appearing near baseboards. Professional detection using acoustic and thermal equipment can confirm the diagnosis.` },
  { q: (c,s) => `What causes slab leaks in ${c} homes?`,
    a: (c,s) => `Slab leaks are caused by pipe corrosion, abrasion from pipes rubbing against concrete, poor installation, ground movement from soil conditions, and high water pressure. Local soil conditions and construction practices influence which factors are most common in this area.` },
  { q: (c,s) => `Can slab leaks be repaired without breaking concrete in ${c}?`,
    a: (c,s) => `Yes, in many cases. We offer trenchless repair methods including epoxy pipe lining and pipe rerouting through walls or ceilings. The appropriate method depends on the leak location, pipe condition, and accessibility, which we assess before recommending a repair approach.` },
  { q: (c,s) => `How much does slab leak repair cost in ${c}?`,
    a: (c,s) => `Cost depends on the detection method and repair approach. Detection typically costs a few hundred dollars. Epoxy lining or pipe rerouting costs less than concrete breaking and direct repair. Most slab leak projects range from several hundred to a few thousand dollars. We provide a complete written estimate after detection.` },
  { q: (c,s) => `How do you detect slab leaks in ${c}?`,
    a: (c,s) => `We use acoustic listening devices to hear the sound of escaping water, thermal imaging cameras to detect temperature differences from wet areas, and pressure testing to confirm leak location. This non-invasive approach allows us to pinpoint the leak before any concrete is disturbed.` },
  { q: (c,s) => `Will slab leak repair damage my flooring in ${c}?`,
    a: (c,s) => `Trenchless methods like epoxy lining minimize floor disruption. When concrete access is necessary, we break only the area needed for repair and patch it afterward. Some flooring damage is unavoidable with direct-access repair, and we discuss this before starting work. We can recommend flooring contractors for restoration.` },
  { q: (c,s) => `Does homeowners insurance cover slab leak repair in ${c}?`,
    a: (c,s) => `Coverage depends on your specific policy and the cause of the leak. Sudden accidental damage is often covered; gradual corrosion due to age typically is not. We provide detailed documentation including detection reports and repair descriptions that you can submit to your insurer.` },
  { q: (c,s) => `How long does slab leak repair take in ${c}?`,
    a: (c,s) => `Detection typically takes 2-4 hours. Epoxy lining repairs are usually completed in one day. Concrete access repairs may take 2-3 days including concrete breaking, repair, and patching. Pipe rerouting through walls typically takes 1-2 days.` },
  { q: (c,s) => `What is epoxy pipe lining for slab leaks in ${c}?`,
    a: (c,s) => `Epoxy pipe lining is a trenchless repair method where we insert a resin-coated liner into the damaged pipe, then cure it in place to create a new pipe within the old one. This method avoids concrete breaking and is suitable for many slab leak situations where the pipe is still accessible.` },
  { q: (c,s) => `Do you handle slab leak emergencies in ${c}?`,
    a: (c,s) => `Yes. Active slab leaks causing water damage are considered emergencies. We prioritize these calls and can typically dispatch within the same response window as other emergencies to minimize damage and begin repair quickly.` },
  { q: (c,s) => `How does soil affect slab leaks in ${c}?`,
    a: (c,s) => `Local soil conditions directly affect slab leak risk. Expansive soils shift seasonally and stress underground pipes. Sandy or loose soils allow pipes to shift and rub against concrete. Local soil conditions are a primary factor in slab leak occurrence in this area.` },
  { q: (c,s) => `Can you reroute pipes to avoid slab leaks in ${c}?`,
    a: (c,s) => `Yes. Pipe rerouting is often the best solution for homes with recurring slab leaks or pipes in poor condition. We run new pipes through walls, ceilings, or attics to bypass the slab entirely, eliminating the risk of future slab leaks in those lines.` },
  { q: (c,s) => `What types of pipes are most prone to slab leaks in ${c}?`,
    a: (c,s) => `Copper pipes are most susceptible to slab leaks due to corrosion, particularly in homes with hard water or aggressive soil conditions. PEX and CPVC are more resistant but can still fail from abrasion or poor installation. Local pipe materials and installation eras influence slab leak patterns.` },
  { q: (c,s) => `Should I repair or reroute a slab leak in ${c}?`,
    a: (c,s) => `The decision depends on pipe condition and leak history. If you have multiple slab leaks or pipes in poor condition, rerouting may be more cost-effective than repeated repairs. For isolated leaks in otherwise good pipes, epoxy lining or direct repair may be appropriate. We assess your specific situation and recommend the best approach.` },
  { q: (c,s) => `How can I prevent future slab leaks in my ${c} home?`,
    a: (c,s) => `Prevention includes maintaining moderate water pressure (40-60 PSI), addressing water leaks promptly, monitoring for early signs, and considering pipe rerouting if you have recurring problems. For homes in ${c} with slab foundations and older pipes, periodic inspection can catch problems early.` },
];

const SLAB_SERVICE_LISTS = [
  ['Slab leak detection and location', 'Epoxy pipe lining repair', 'Concrete access slab repair', 'Pipe rerouting and bypass', 'Water shutoff and isolation', 'Slab leak emergency response'],
  ['Acoustic and thermal leak detection', 'Trenchless slab leak repair', 'Foundation pipe repair', 'Underground pipe replacement', 'Pressure testing and verification', 'Concrete restoration'],
  ['Non-invasive leak location', 'Epoxy pipe coating installation', 'Pipe rerouting through accessible spaces', 'Slab foundation plumbing assessment', 'Water system isolation', 'Damage prevention consultation'],
];

function genSlabLeakRepair(cityName, stateCode, service) {
  const d = getCityData(cityName);
  const svc = 'slab-leak-repair';
  const slabContext = `${cityName} homes with slab foundations face specific leak risks. The ${d.soilType} underlying ${cityName} and the ${d.pipeMaterial} commonly used during the ${d.pipeEra} create conditions where underground pipe corrosion and abrasion are leading causes of slab leaks in this area.`;
  const dfSentence = dominantFailureSentence(cityName, d, svc);

  const dispatchIntro = pick(DISPATCH_INTROS, cityName, svc, 'di')(cityName);
  const trustPhrase = pick(TRUST_PHRASES, cityName, svc, 'tp')(stateCode || 'your state');
  const pricingPhrase = pick(PRICING_PHRASES, cityName, svc, 'pp');
  const responsePhrase = pick(RESPONSE_PHRASES, cityName, svc, 'rp')(cityName);

  const h1 = pick(H_SERVICE_OVERVIEW, cityName, svc, 'h1')('Slab Leak Repair', cityName);
  const h2 = pick(H_WHY_US, cityName, svc, 'h2')(cityName);
  const h3 = pick(H_HOW_IT_WORKS, cityName, svc, 'h3')(cityName);

  const serviceList = pick(SLAB_SERVICE_LISTS, cityName, svc, 'sl');
  const infraSections = buildInfraSection(cityName, stateCode, service);

  return {
    localSignal: buildLocalSignal(cityName, d),
    intro: `${dispatchIntro} ${slabContext} ${dfSentence} ${responsePhrase} ${pricingPhrase}`,
    sections: [
      {
        heading: h1,
        body: `Our ${cityName} slab leak repair team specializes in detecting and repairing underground pipe leaks beneath concrete foundations. We understand the ${d.soilType} and local construction practices that affect slab leaks in this area. ${trustPhrase}`,
        list: serviceList,
      },
      infraSections[0],
      infraSections[1],
      {
        heading: h2,
        body: `${trustPhrase} ${pricingPhrase} ${responsePhrase}`,
        list: [
          `Licensed and insured in ${stateCode || 'your state'}`,
          `Advanced leak detection technology`,
          `Trenchless repair options when possible`,
          `Minimal concrete disruption`,
          `Upfront pricing with detailed estimates`,
          `Emergency slab leak response available`,
        ],
      },
      {
        heading: h3,
        body: `Slab leak repair in ${cityName} begins with precise detection. We don't guess at the leak location — we use acoustic listening devices and thermal imaging to pinpoint the exact source before any concrete is disturbed.`,
        list: [
          'Acoustic and thermal leak detection',
          'Leak location and assessment',
          'Repair method recommendation',
          'Trenchless or direct-access repair',
          'Testing and verification',
          'Concrete restoration if needed',
        ],
      },
    ],
    faqs: pickFaqs(SLAB_FAQ_POOL, cityName, stateCode, service),
    pricing: buildPricingGuidance(cityName, 'slab-leak-repair'),
  };
}

// ================================================================
// WATER LINE REPAIR GENERATOR
// ================================================================
const WATERLINE_FAQ_POOL = [
  { q: (c,s) => `How do I know if my water service line is damaged in ${c}?`,
    a: (c,s) => `Signs include unexplained high water bills, low water pressure throughout your home, wet spots in your yard, unusual sounds from pipes, or discolored water. If your water meter runs when all fixtures are off, you may have a service line leak. Professional detection can confirm the problem.` },
  { q: (c,s) => `What causes water line damage in ${c} homes?`,
    a: (c,s) => `Common causes include pipe corrosion from aging or aggressive soil, ground movement from soil conditions, tree root intrusion, high water pressure, and poor installation practices. Local water sources and soil conditions influence which problems are most common in this area.` },
  { q: (c,s) => `How much does water line repair cost in ${c}?`,
    a: (c,s) => `Cost depends on the leak location, depth, and repair method. Detection typically costs a few hundred dollars. Section repair ranges from several hundred to a few thousand. Complete line replacement costs more depending on length and depth. We provide a complete written estimate after detection.` },
  { q: (c,s) => `Do you handle water line emergencies in ${c}?`,
    a: (c,s) => `Yes. Water service line leaks that are causing significant water loss or low pressure are considered urgent. We prioritize these calls and can typically dispatch quickly to isolate the leak and begin repair, especially if water damage is occurring.` },
  { q: (c,s) => `How do you locate water line leaks in ${c}?`,
    a: (c,s) => `We use acoustic listening devices to hear the sound of escaping water, electronic locators to trace the pipe path, and pressure testing to confirm leak location. This allows us to pinpoint the leak before any excavation, minimizing unnecessary digging.` },
  { q: (c,s) => `Will water line repair damage my yard or landscaping in ${c}?`,
    a: (c,s) => `When excavation is necessary, we dig only the area needed for repair and restore it as much as possible. Some landscaping impact is unavoidable with underground pipe repair. We discuss the expected disruption before starting and can recommend landscaping contractors for restoration.` },
  { q: (c,s) => `Does homeowners insurance cover water line repair in ${c}?`,
    a: (c,s) => `Coverage depends on your specific policy and the cause of damage. Sudden accidental damage is often covered; gradual deterioration due to age typically is not. We provide detailed documentation including detection reports that you can submit to your insurer.` },
  { q: (c,s) => `How long does water line repair take in ${c}?`,
    a: (c,s) => `Detection typically takes 2-4 hours. Section repairs can often be completed in one day. Complete line replacement may take 2-5 days depending on length, depth, and conditions. We provide time estimates after assessment.` },
  { q: (c,s) => `What materials do you use for water line repair in ${c}?`,
    a: (c,s) => `We use code-approved materials appropriate for ${c}'s requirements, typically copper, PEX, or HDPE for new installations. All materials meet local plumbing codes and are designed for long-term durability in local soil conditions.` },
  { q: (c,s) => `How does ${c}'s water utility affect my service line?`,
    a: (c,s) => `The connection point where your service line meets the municipal main is critical. The local water utility has specific requirements for connections, metering, and backflow prevention. We understand these local requirements and ensure all repairs meet utility standards.` },
  { q: (c,s) => `Can you replace my entire water service line in ${c}?`,
    a: (c,s) => `Yes. If your service line has multiple damaged sections, is extensively corroded, or is very old, complete replacement may be more cost-effective than repeated repairs. We assess the line's overall condition and recommend the most appropriate solution.` },
  { q: (c,s) => `What is the difference between water line and drain line?`,
    a: (c,s) => `Your water service line brings clean water from the street to your home under pressure. Your drain line carries wastewater away from your home to the sewer main by gravity. They are separate systems with different problems and repair methods. We service both types of lines.` },
  { q: (c,s) => `Do you work with the water utility for repairs in ${c}?`,
    a: (c,s) => `Yes. We coordinate with the local water utility when repairs affect the meter or connection point. We understand local utility requirements and ensure all work meets their standards for connection, metering, and backflow prevention.` },
  { q: (c,s) => `Should I repair or replace my water line in ${c}?`,
    a: (c,s) => `The decision depends on the pipe's overall condition and leak history. If you have multiple leaks or the pipe is extensively corroded, replacement may be more cost-effective. For isolated leaks in otherwise good pipe, section repair may be appropriate. We assess your specific situation and recommend the best approach.` },
  { q: (c,s) => `How can I prevent water line problems in my ${c} home?`,
    a: (c,s) => `Prevention includes maintaining moderate water pressure, addressing leaks promptly, avoiding planting large trees near the line, and periodic inspection for older lines. For homes with older pipe lines, periodic inspection can catch problems before they cause failure.` },
];

const WATERLINE_SERVICE_LISTS = [
  ['Water service line repair and replacement', 'Water line leak detection', 'Main shutoff valve replacement', 'Pipe section repair', 'Complete line replacement', 'Utility coordination and meter work'],
  ['Electronic pipe location and mapping', 'Excavation and pipe repair', 'PEX and copper line installation', 'Trenching and backfilling', 'Pressure testing and verification', 'Site restoration'],
  ['Water line assessment and diagnosis', 'Sectional pipe replacement', 'Full service line installation', 'Meter and connection repair', 'Backflow prevention device installation', 'Emergency water line shut-off'],
];

function genWaterLineRepair(cityName, stateCode, service) {
  const d = getCityData(cityName);
  const svc = 'water-line-repair';
  const waterLineContext = `${cityName}'s water service lines deliver water from the ${d.waterUtility} to homes throughout the area. The ${d.pipeMaterial} commonly installed during the ${d.pipeEra} and the ${d.soilType} conditions directly affect how these lines age and fail in this market.`;
  const dfSentence = dominantFailureSentence(cityName, d, svc);

  const dispatchIntro = pick(DISPATCH_INTROS, cityName, svc, 'di')(cityName);
  const trustPhrase = pick(TRUST_PHRASES, cityName, svc, 'tp')(stateCode || 'your state');
  const pricingPhrase = pick(PRICING_PHRASES, cityName, svc, 'pp');
  const responsePhrase = pick(RESPONSE_PHRASES, cityName, svc, 'rp')(cityName);

  const h1 = pick(H_SERVICE_OVERVIEW, cityName, svc, 'h1')('Water Line Repair', cityName);
  const h2 = pick(H_WHY_US, cityName, svc, 'h2')(cityName);
  const h3 = pick(H_HOW_IT_WORKS, cityName, svc, 'h3')(cityName);

  const serviceList = pick(WATERLINE_SERVICE_LISTS, cityName, svc, 'sl');
  const infraSections = buildInfraSection(cityName, stateCode, service);

  return {
    localSignal: buildLocalSignal(cityName, d),
    intro: `${dispatchIntro} ${waterLineContext} ${dfSentence} ${responsePhrase} ${pricingPhrase}`,
    sections: [
      {
        heading: h1,
        body: `Our ${cityName} water line repair team handles every aspect of water service line problems — from leak detection and section repair to complete line replacement and utility coordination. We understand the ${d.waterUtility} system and local soil conditions affecting these lines. ${trustPhrase}`,
        list: serviceList,
      },
      infraSections[0],
      infraSections[1],
      {
        heading: h2,
        body: `${trustPhrase} ${pricingPhrase} ${responsePhrase}`,
        list: [
          `Licensed and insured in ${stateCode || 'your state'}`,
          `Advanced leak detection technology`,
          `Utility coordination for meter work`,
          `Upfront pricing with detailed estimates`,
          `Emergency water line response`,
          `Complete project documentation`,
        ],
      },
      {
        heading: h3,
        body: `Water line repair in ${cityName} begins with accurate detection and location. We don't guess at the problem — we use electronic locators and acoustic detection to pinpoint the leak location before any excavation, minimizing unnecessary digging and yard disruption.`,
        list: [
          'Electronic pipe location and mapping',
          'Leak detection and assessment',
          'Repair method recommendation',
          'Excavation and repair or replacement',
          'Pressure testing and verification',
          'Utility coordination and site restoration',
        ],
      },
    ],
    faqs: pickFaqs(WATERLINE_FAQ_POOL, cityName, stateCode, service),
    pricing: buildPricingGuidance(cityName, 'water-line-repair'),
  };
}

// ================================================================
// FAUCET REPAIR GENERATOR
// ================================================================
const FAUCET_FAQ_POOL = [
  { q: (c,s) => `Why is my faucet dripping in my ${c} home?`,
    a: (c,s) => `The most common cause is a worn-out washer, O-ring, or cartridge that doesn't seal properly. Other causes include loose connections, corroded valve seats, or high water pressure. These are typically simple repairs that can be completed in one visit with standard replacement parts.` },
  { q: (c,s) => `How much does faucet repair cost in ${c}?`,
    a: (c,s) => `Simple component repairs like washer or cartridge replacement typically cost a few hundred dollars. More complex repairs like valve seat replacement or complete faucet rebuilds cost more. New faucet installation including removal of the old unit typically ranges from a couple hundred to several hundred dollars depending on the faucet selected.` },
  { q: (c,s) => `Should I repair or replace my faucet in ${c}?`,
    a: (c,s) => `Consider replacement if your faucet is over 10-15 years old, has extensive corrosion, parts are no longer available, or you want to upgrade to a more efficient or modern style. For quality faucets in good condition, repair is often more cost-effective. We can assess your faucet and recommend the best option.` },
  { q: (c,s) => `How does water hardness affect my faucets in ${c}?`,
    a: (c,s) => `Hard water causes mineral buildup on aerators, cartridges, and internal components, which can lead to reduced flow, dripping, and component failure. Local water hardness means regular cleaning and maintenance can extend faucet life and prevent common scale-related problems.` },
  { q: (c,s) => `Can you repair any brand of faucet in ${c}?`,
    a: (c,s) => `Yes. We service all major faucet brands and can repair most models, or recommend replacements if parts are no longer available. We carry common replacement parts for major brands and can source specialty components when needed.` },
  { q: (c,s) => `Do you handle faucet emergencies in ${c}?`,
    a: (c,s) => `Yes. Faucets that are spraying water, leaking significantly, or causing water damage are considered urgent. We prioritize these calls and can typically dispatch same-day to stop the water damage and repair or replace the faucet.` },
  { q: (c,s) => `What are the signs my faucet needs repair in ${c}?`,
    a: (c,s) => `Watch for persistent dripping, reduced water flow, strange noises when operating, difficulty turning handles, water leaking from handles or base, visible corrosion, or inconsistent water temperature. Addressing these signs early can prevent water waste and more extensive damage.` },
  { q: (c,s) => `Can a dripping faucet increase my water bill significantly in ${c}?`,
    a: (c,s) => `Yes. A faucet dripping once per second can waste thousands of gallons per year, which can substantially increase your water bill. Even a slow drip wastes significant water over time. Repairing dripping faucets is one of the most cost-effective water conservation measures.` },
  { q: (c,s) => `Do you repair kitchen and bathroom faucets in ${c}?`,
    a: (c,s) => `Yes. We service all types of faucets including kitchen faucets, bathroom sink faucets, tub and shower faucets, outdoor spigots, and utility sink faucets. Each type has specific components and repair methods, which our technicians are experienced with.` },
  { q: (c,s) => `How long does faucet repair typically take in ${c}?`,
    a: (c,s) => `Most faucet repairs can be completed in 1-2 hours. Simple component replacements like cartridges or washers are often completed in under an hour. Complete rebuilds or new installations may take 2-3 hours. We complete most work in a single visit.` },
  { q: (c,s) => `What causes low water pressure in my ${c} faucet?`,
    a: (c,s) => `Common causes include clogged aerators from mineral buildup, partially closed shut-off valves, corroded pipes, or problems with the faucet cartridge. In ${c}, hard water makes aerator clogging a common issue. We identify the cause and restore proper flow.` },
  { q: (c,s) => `Do you work with touchless and smart faucets in ${c}?`,
    a: (c,s) => `Yes. We service modern faucet technologies including touchless sensors, smart home integration, electronic temperature controls, and pull-down or pull-out sprayers. These units have specialized components that require specific expertise, which our technicians have.` },
  { q: (c,s) => `Can you install water-saving faucets in ${c}?`,
    a: (c,s) => `Yes. We can recommend and install WaterSense-labeled and other water-efficient faucets that reduce water usage without sacrificing performance. These are particularly valuable in ${c} given local water conditions and can reduce both water bills and environmental impact.` },
  { q: (c,s) => `What should I do if my faucet breaks off in ${c}?`,
    a: (c,s) => `First, shut off the water supply using the shutoff valves under the sink. Don't force the handle or try to repair it yourself. Call a plumber immediately — a broken faucet can cause significant water damage quickly. We can typically dispatch same-day for this type of emergency.` },
  { q: (c,s) => `How can I extend my faucet's life in ${c}?`,
    a: (c,s) => `Regular maintenance helps: clean aerators periodically to remove mineral buildup, avoid excessive force when operating handles, address drips promptly, and check for leaks regularly. For ${c} homes with hard water, annual inspection and cleaning can prevent scale-related problems.` },
];

const FAUCET_SERVICE_LISTS = [
  ['Faucet repair and troubleshooting', 'Cartridge and stem replacement', 'Washer and O-ring replacement', 'Complete faucet rebuild', 'New faucet installation', 'Kitchen and bathroom faucet service'],
  ['Dripping faucet repair', 'Low water pressure diagnosis', 'Handle and spout repair', 'Aerator cleaning and replacement', 'Supply line replacement', 'Faucet leak repair'],
  ['All faucet brands and types serviced', 'Internal component repair', 'Faucet installation and setup', 'Touchless and smart faucet service', 'Water-saving faucet upgrades', 'Emergency faucet shut-off'],
];

function genFaucetRepair(cityName, stateCode, service) {
  const d = getCityData(cityName);
  const svc = 'faucet-repair';
  const faucetContext = `${waterImpactSentence(cityName, d)} For ${cityName} homes, water hardness at ${d.hardnessPpm} mg/L directly affects faucet longevity — scale buildup on cartridges and aerators is a common cause of dripping and reduced flow in this area.`;
  const dfSentence = dominantFailureSentence(cityName, d, svc);

  const dispatchIntro = pick(DISPATCH_INTROS, cityName, svc, 'di')(cityName);
  const trustPhrase = pick(TRUST_PHRASES, cityName, svc, 'tp')(stateCode || 'your state');
  const pricingPhrase = pick(PRICING_PHRASES, cityName, svc, 'pp');
  const responsePhrase = pick(RESPONSE_PHRASES, cityName, svc, 'rp')(cityName);

  const h1 = pick(H_SERVICE_OVERVIEW, cityName, svc, 'h1')('Faucet Repair', cityName);
  const h2 = pick(H_WHY_US, cityName, svc, 'h2')(cityName);
  const h3 = pick(H_HOW_IT_WORKS, cityName, svc, 'h3')(cityName);

  const serviceList = pick(FAUCET_SERVICE_LISTS, cityName, svc, 'sl');
  const infraSections = buildInfraSection(cityName, stateCode, service);

  return {
    localSignal: buildLocalSignal(cityName, d),
    intro: `${dispatchIntro} ${faucetContext} ${dfSentence} ${responsePhrase} ${pricingPhrase}`,
    sections: [
      {
        heading: h1,
        body: `Our ${cityName} faucet repair technicians handle every faucet problem — from persistent drips and low flow to complete rebuilds and new installations. We understand how ${d.hardnessPpm} mg/L water hardness affects faucet components in this area. ${trustPhrase}`,
        list: serviceList,
      },
      infraSections[0],
      infraSections[1],
      {
        heading: h2,
        body: `${trustPhrase} ${pricingPhrase} ${responsePhrase}`,
        list: [
          `Licensed and insured in ${stateCode || 'your state'}`,
          `All faucet brands and models serviced`,
          `Same-day service for urgent problems`,
          `Upfront pricing with written estimates`,
          `Water-saving faucet options available`,
          `Warranty on all repairs and installations`,
        ],
      },
      {
        heading: h3,
        body: `Faucet repair in ${cityName} begins with accurate diagnosis. We identify whether the problem is a simple component issue like a washer or cartridge, or a more complex problem requiring complete rebuild or replacement.`,
        list: [
          'Thorough inspection of faucet and connections',
          'Problem identification and repair options',
          'Component replacement or rebuild as needed',
          'Testing for proper operation and water flow',
          'Cleanup and area restoration',
          'Preventive maintenance recommendations',
        ],
      },
    ],
    faqs: pickFaqs(FAUCET_FAQ_POOL, cityName, stateCode, service),
    pricing: buildPricingGuidance(cityName, 'faucet-repair'),
  };
}

// ================================================================
// GARBAGE DISPOSAL REPAIR GENERATOR
// ================================================================
const GARBAGE_DISPOSAL_FAQ_POOL = [
  { q: (c,s) => `Why is my garbage disposal humming but not grinding in ${c}?`,
    a: (c,s) => `This usually indicates a jammed flywheel or impeller. The motor is running but the grinding mechanism is stuck. Common causes include foreign objects like utensils, glass, or fibrous food waste. We can safely clear the jam and restore operation without damaging the unit.` },
  { q: (c,s) => `What should I do if my garbage disposal is leaking in ${c}?`,
    a: (c,s) => `First, stop using the unit and check for visible leaks around the mounting assembly, drain connection, or dishwasher connection. Leaks can occur from worn seals, loose connections, or cracks in the unit. Don't attempt to repair internal components yourself — call a plumber to diagnose and fix the leak safely.` },
  { q: (c,s) => `How much does garbage disposal repair cost in ${c}?`,
    a: (c,s) => `Simple repairs like resetting a tripped unit or clearing minor jams typically cost a few hundred dollars. More complex repairs like replacing worn internal components, fixing leaks, or complete unit replacement cost more. New disposal installation including removal of the old unit typically ranges from a couple hundred to several hundred dollars depending on the unit selected.` },
  { q: (c,s) => `Should I repair or replace my garbage disposal in ${c}?`,
    a: (c,s) => `Consider replacement if your unit is over 8-10 years old, has frequent breakdowns, has extensive rust or corrosion, or you want to upgrade to a more powerful or quieter model. For quality units in good condition, repair is often more cost-effective. We can assess your disposal and recommend the best option.` },
  { q: (c,s) => `What causes garbage disposal odors in ${c}?`,
    a: (c,s) => `Odors typically come from food waste buildup on the grinding chamber walls, splash guard, or drain line. Fibrous foods, grease, and small particles can accumulate and decompose. Regular cleaning with ice cubes and citrus peels helps, but persistent odors may indicate a need for professional cleaning or drain line inspection.` },
  { q: (c,s) => `Can you repair any brand of garbage disposal in ${c}?`,
    a: (c,s) => `Yes. We service all major disposal brands and can repair most models, or recommend replacements if parts are no longer available or the unit is beyond repair. We carry common replacement parts for major brands and can source specialty components when needed.` },
  { q: (c,s) => `What foods should I avoid putting in my garbage disposal in ${c}?`,
    a: (c,s) => `Avoid fibrous foods like celery, corn husks, and onion skins, which can wrap around the grinding mechanism. Also avoid grease, oil, fat, expandable foods like rice and pasta, hard items like bones and fruit pits, and non-food items. Following these guidelines prevents most common disposal problems.` },
  { q: (c,s) => `How do I reset my garbage disposal in ${c}?`,
    a: (c,s) => `Most disposals have a reset button on the bottom of the unit. First, turn off the disposal and unplug it if possible. Wait a few minutes for the motor to cool, then press the reset button. If the unit still doesn't work, check for tripped breakers or call a professional for diagnosis.` },
  { q: (c,s) => `Why does my garbage disposal keep tripping the breaker in ${c}?`,
    a: (c,s) => `This typically indicates an electrical problem or motor overload. Causes include jammed grinding mechanisms, worn motor bearings, electrical shorts, or ground faults. The breaker trips to prevent fire or damage. This is a safety issue that requires professional diagnosis and repair.` },
  { q: (c,s) => `How long does garbage disposal repair typically take in ${c}?`,
    a: (c,s) => `Most repairs can be completed in 1-2 hours. Simple jam clearing or reset issues are often completed in under an hour. Component replacements or leak repairs may take 2-3 hours. Complete unit replacement typically takes 2-4 hours. We complete most work in a single visit.` },
  { q: (c,s) => `Can a garbage disposal be installed in any sink in ${c}?`,
    a: (c,s) => `Most standard kitchen sinks can accommodate a garbage disposal, but requirements include adequate cabinet space, proper electrical wiring, and a compatible drain configuration. Some sinks or installations may need modifications. We can assess your setup and recommend the best installation approach.` },
  { q: (c,s) => `How does water hardness affect my garbage disposal in ${c}?`,
    a: (c,s) => `Hard water can cause mineral buildup on the grinding chamber and internal components, which may reduce grinding efficiency and increase wear. Local water hardness means regular cleaning and maintenance can help maintain optimal performance and extend the unit's lifespan.` },
];

const GARBAGE_DISPOSAL_SERVICE_LISTS = [
  ['Garbage disposal repair and troubleshooting', 'Jam clearing and flywheel repair', 'Leak detection and repair', 'Motor and electrical repair', 'Unit replacement and installation', 'All major brands serviced'],
  ['Disposal not grinding repair', 'Strange noises diagnosis', 'Leaking disposal repair', 'Reset and electrical issues', 'Drain line clearing', 'Preventive maintenance'],
  ['Complete disposal installation', 'Old unit removal and disposal', 'Electrical wiring and connections', 'Dishwasher hookup', 'Noise reduction solutions', 'Upgraded disposal options'],
];

function genGarbageDisposalRepair(cityName, stateCode, service) {
  const d = getCityData(cityName);
  const svc = 'garbage-disposal-repair';
  const disposalContext = `${waterImpactSentence(cityName, d)} For ${cityName} homes, water hardness at ${d.hardnessPpm} mg/L can affect disposal performance — mineral buildup on grinding components may reduce efficiency over time in this area.`;
  const dfSentence = dominantFailureSentence(cityName, d, svc);

  const dispatchIntro = pick(DISPATCH_INTROS, cityName, svc, 'di')(cityName);
  const trustPhrase = pick(TRUST_PHRASES, cityName, svc, 'tp')(stateCode || 'your state');
  const pricingPhrase = pick(PRICING_PHRASES, cityName, svc, 'pp');
  const responsePhrase = pick(RESPONSE_PHRASES, cityName, svc, 'rp')(cityName);

  const h1 = pick(H_SERVICE_OVERVIEW, cityName, svc, 'h1')('Garbage Disposal Repair', cityName);
  const h2 = pick(H_WHY_US, cityName, svc, 'h2')(cityName);
  const h3 = pick(H_HOW_IT_WORKS, cityName, svc, 'h3')(cityName);

  const serviceList = pick(GARBAGE_DISPOSAL_SERVICE_LISTS, cityName, svc, 'sl');
  const infraSections = buildInfraSection(cityName, stateCode, service);

  return {
    localSignal: buildLocalSignal(cityName, d),
    intro: `${dispatchIntro} ${disposalContext} ${dfSentence} ${responsePhrase} ${pricingPhrase}`,
    sections: [
      {
        heading: h1,
        body: `Our ${cityName} garbage disposal repair technicians handle every disposal problem — from units that won't grind to strange noises, leaks, and complete failures. We understand how ${d.hardnessPpm} mg/L water hardness affects disposal performance in this area. ${trustPhrase}`,
        list: serviceList,
      },
      infraSections[0],
      infraSections[1],
      {
        heading: h2,
        body: `${trustPhrase} ${pricingPhrase} ${responsePhrase}`,
        list: [
          `Licensed and insured in ${stateCode || 'your state'}`,
          `All disposal brands and models serviced`,
          `Same-day service for urgent problems`,
          `Upfront pricing with written estimates`,
          `New disposal installation available`,
          `Warranty on all repairs and installations`,
        ],
      },
      {
        heading: h3,
        body: `Garbage disposal repair in ${cityName} begins with accurate diagnosis. We identify whether the problem is a simple jam or reset issue, or a more complex problem requiring component replacement or complete unit replacement.`,
        list: [
          'Thorough inspection of disposal and connections',
          'Problem identification and repair options',
          'Jam clearing and component replacement as needed',
          'Testing for proper operation and drainage',
          'Cleanup and area restoration',
          'Preventive maintenance recommendations',
        ],
      },
    ],
    faqs: pickFaqs(GARBAGE_DISPOSAL_FAQ_POOL, cityName, stateCode, service),
    pricing: buildPricingGuidance(cityName, 'garbage-disposal-repair'),
  };
}

// ================================================================
// WATER SOFTENER REPAIR GENERATOR
// ================================================================
const WATER_SOFTENER_FAQ_POOL = [
  { q: (c,s) => `How do I know if my water softener is working in ${c}?`,
    a: (c,s) => `Signs of a properly working softener include slippery-feeling water when washing, reduced soap scum and scale buildup, and water that lathers easily with soap. If you notice hard water spots returning, soap not lathering properly, or scale buildup on fixtures, your softener may need service.` },
  { q: (c,s) => `Why is my water softener using too much salt in ${c}?`,
    a: (c,s) => `Excessive salt usage can indicate a brine tank problem, control valve issue, or incorrect settings. Common causes include salt bridging, a malfunctioning brine valve, incorrect regeneration frequency, or a timer that's not working properly. We can diagnose the specific cause and adjust or repair as needed.` },
  { q: (c,s) => `How much does water softener repair cost in ${c}?`,
    a: (c,s) => `Simple repairs like brine valve replacement or timer adjustment typically cost a few hundred dollars. More complex repairs like resin bed replacement or control valve replacement cost more. Complete softener installation including removal of the old unit typically ranges from several hundred to a thousand dollars depending on the unit selected.` },
  { q: (c,s) => `Should I repair or replace my water softener in ${c}?`,
    a: (c,s) => `Consider replacement if your softener is over 10-15 years old, the resin bed is exhausted, repair costs exceed 50% of replacement cost, or you want to upgrade to a more efficient model. For quality units in good condition, repair is often more cost-effective. We can assess your softener and recommend the best option.` },
  { q: (c,s) => `What causes salt bridges in water softeners in ${c}?`,
    a: (c,s) => `Salt bridges occur when hardened salt forms a solid layer above the water level in the brine tank, preventing salt from dissolving properly. This is often caused by high humidity, using the wrong type of salt, or overfilling the tank. We can safely break up salt bridges and prevent recurrence.` },
  { q: (c,s) => `How often should I regenerate my water softener in ${c}?`,
    a: (c,s) => `Regeneration frequency depends on your water hardness, water usage, and softener capacity. Most systems regenerate every 2-7 days. Your local water hardness of ${c} means your specific setting should be calibrated accordingly. We can optimize your regeneration schedule for efficiency and effectiveness.` },
  { q: (c,s) => `Can you repair any brand of water softener in ${c}?`,
    a: (c,s) => `Yes. We service all major softener brands and can repair most models, or recommend replacements if parts are no longer available or the unit is beyond repair. We carry common replacement parts for major brands and can source specialty components when needed.` },
  { q: (c,s) => `What are the signs my resin bed needs replacement in ${c}?`,
    a: (c,s) => `Signs of resin bed exhaustion include hard water returning despite proper salt levels, reduced water flow, increased salt usage, and resin beads appearing in your plumbing. Resin beds typically last 10-15 years depending on water quality and usage. We can test your resin and recommend replacement if needed.` },
  { q: (c,s) => `How does water hardness affect my appliances in ${c}?`,
    a: (c,s) => `Hard water causes scale buildup in water heaters, dishwashers, washing machines, and plumbing fixtures, reducing efficiency and lifespan. Local water hardness means water softeners provide significant appliance protection and energy savings in this area. A properly functioning softener can extend appliance life by years.` },
  { q: (c,s) => `How long does water softener repair typically take in ${c}?`,
    a: (c,s) => `Most repairs can be completed in 1-2 hours. Simple repairs like brine valve replacement or timer adjustment are often completed in under an hour. Resin bed replacement or complete unit replacement may take 3-4 hours. We complete most work in a single visit.` },
  { q: (c,s) => `Do I need a water softener in ${c}?`,
    a: (c,s) => `The need depends on your local water hardness and personal preferences. Given local water hardness levels, a water softener can provide benefits like reduced scale buildup, longer appliance life, better soap efficiency, and softer skin and hair. We can test your water and recommend whether softening is right for your situation.` },
  { q: (c,s) => `What maintenance does my water softener need in ${c}?`,
    a: (c,s) => `Regular maintenance includes checking salt levels, cleaning the brine tank periodically, checking for salt bridges, and ensuring the control valve is functioning properly. Annual professional inspection can catch problems early and extend your softener's life. We provide maintenance services and can set up a schedule.` },
];

const WATER_SOFTENER_SERVICE_LISTS = [
  ['Water softener repair and troubleshooting', 'Resin bed replacement', 'Control valve repair', 'Brine tank cleaning and maintenance', 'Salt bridge removal', 'All major brands serviced'],
  ['Softener not softening water repair', 'Excessive salt usage diagnosis', 'Regeneration system repair', 'Timer and meter repair', 'Leak detection and repair', 'System optimization'],
  ['Complete softener installation', 'Old unit removal and disposal', 'Plumbing and electrical connections', 'System sizing and recommendation', 'Water quality testing', 'Preventive maintenance'],
];

function genWaterSoftenerRepair(cityName, stateCode, service) {
  const d = getCityData(cityName);
  const svc = 'water-softener-repair';
  const ppm = d.hardnessPpm;
  const tier = ppm < 25 ? 'very soft' : ppm < 100 ? 'soft' : ppm < 175 ? 'moderately hard' : ppm < 250 ? 'hard' : 'extremely hard';
  const softenerContext = `${cityName}'s water from ${d.waterUtility} measures ${ppm} mg/L — ${tier} — which directly impacts water softener needs and maintenance frequency in this area. Hard water causes scale buildup in appliances and plumbing fixtures, and a properly functioning water softener protects your home's water systems from this damage.`;
  const dfSentence = dominantFailureSentence(cityName, d, svc);

  const dispatchIntro = pick(DISPATCH_INTROS, cityName, svc, 'di')(cityName);
  const trustPhrase = pick(TRUST_PHRASES, cityName, svc, 'tp')(stateCode || 'your state');
  const pricingPhrase = pick(PRICING_PHRASES, cityName, svc, 'pp');
  const responsePhrase = pick(RESPONSE_PHRASES, cityName, svc, 'rp')(cityName);

  const h1 = pick(H_SERVICE_OVERVIEW, cityName, svc, 'h1')('Water Softener Repair', cityName);
  const h2 = pick(H_WHY_US, cityName, svc, 'h2')(cityName);
  const h3 = pick(H_HOW_IT_WORKS, cityName, svc, 'h3')(cityName);

  const serviceList = pick(WATER_SOFTENER_SERVICE_LISTS, cityName, svc, 'sl');
  const infraSections = buildInfraSection(cityName, stateCode, service);

  return {
    localSignal: buildLocalSignal(cityName, d),
    intro: `${dispatchIntro} ${softenerContext} ${dfSentence} ${responsePhrase} ${pricingPhrase}`,
    sections: [
      {
        heading: h1,
        body: `Our ${cityName} water softener repair technicians handle every softener problem — from units that won't soften water to control valve failures, resin bed exhaustion, and complete system replacements. We understand how ${ppm} mg/L water hardness affects softener performance and home water systems in this area. ${trustPhrase}`,
        list: serviceList,
      },
      infraSections[0],
      infraSections[1],
      {
        heading: h2,
        body: `${trustPhrase} ${pricingPhrase} ${responsePhrase}`,
        list: [
          `Licensed and insured in ${stateCode || 'your state'}`,
          `All softener brands and models serviced`,
          `Same-day service for urgent problems`,
          `Upfront pricing with written estimates`,
          `New softener installation available`,
          `Warranty on all repairs and installations`,
        ],
      },
      {
        heading: h3,
        body: `Water softener repair in ${cityName} begins with accurate diagnosis. We identify whether the problem is a simple maintenance issue like salt bridging or timer adjustment, or a more complex problem requiring resin bed replacement or complete unit replacement.`,
        list: [
          'Thorough inspection of softener and components',
          'Water hardness testing and system calibration',
          'Problem identification and repair options',
          'Component replacement or system rebuild as needed',
          'Testing for proper operation and water quality',
          'Preventive maintenance recommendations',
        ],
      },
    ],
    faqs: pickFaqs(WATER_SOFTENER_FAQ_POOL, cityName, stateCode, service),
    pricing: buildPricingGuidance(cityName, 'water-softener-repair'),
  };
}

// ================================================================
// SUMP PUMP REPAIR GENERATOR
// ================================================================
const SUMP_PUMP_FAQ_POOL = [
  { q: (c,s) => `How do I know if my sump pump is failing in ${c}?`,
    a: (c,s) => `Common signs include unusual noises during operation, the pump running continuously without stopping, visible rust or corrosion, the pump not turning on when water rises, and frequent cycling on and off. If you notice any of these issues in ${c}, call for service before the pump fails completely.` },
  { q: (c,s) => `Do you repair all types of sump pumps in ${c}?`,
    a: (c,s) => `Yes. We service pedestal pumps, submersible pumps, battery backup systems, and water-powered backup pumps throughout ${c}. We work with all major brands and can recommend the best replacement if your current unit is beyond repair.` },
  { q: (c,s) => `How fast can you respond to a failed sump pump in ${c}?`,
    a: (c,s) => `Sump pump failures are treated as emergencies in ${c} because of the risk of basement flooding. We dispatch immediately and aim to have a technician at your home within 60 minutes to prevent water damage.` },
  { q: (c,s) => `Should I repair or replace my sump pump in ${c}?`,
    a: (c,s) => `If the pump is under 7 years old and the repair cost is less than 50% of replacement, repair is usually the better option. For pumps over 10 years old or those with motor failure, replacement is typically more cost-effective and reliable.` },
  { q: (c,s) => `Do I need a backup sump pump system in ${c}?`,
    a: (c,s) => `Backup systems are recommended in ${c} because primary pumps can fail during power outages, mechanical breakdowns, or overwhelming water volume. Battery backup or water-powered systems provide protection when your primary pump can't operate.` },
  { q: (c,s) => `What causes sump pump failure in ${c} homes?`,
    a: (c,s) => `Common causes include power outages, float switch problems, clogged discharge lines, motor burnout, and improper sizing. In ${c}, storm events and power fluctuations can also contribute to sudden pump failures. Regular maintenance reduces these risks.` },
  { q: (c,s) => `How often should sump pumps be maintained in ${c}?`,
    a: (c,s) => `We recommend annual sump pump inspection and testing in ${c}. During maintenance, we check the float switch operation, test the backup system, clear the discharge line, and inspect the pump for wear. Homes with frequent water intrusion may need more frequent service.` },
  { q: (c,s) => `Can you install a new sump pump system in ${c}?`,
    a: (c,s) => `Yes. We install complete sump pump systems including the pump, basin, discharge line, and check valve. We can also install battery backup systems to protect your basement during power outages common in ${c}.` },
  { q: (c,s) => `What size sump pump do I need for my ${c} home?`,
    a: (c,s) => `Pump sizing depends on your basement size, water table level, and typical water volume. Most residential homes in ${c} need a 1/3 to 1/2 horsepower pump. We assess your specific situation during the service call and recommend the appropriate size.` },
  { q: (c,s) => `Does ${c}'s water table affect sump pump requirements?`,
    a: (c,s) => `Yes. Areas with high water tables require more powerful pumps and more frequent operation. In ${c}, where groundwater conditions vary, proper pump sizing and discharge line installation are critical for reliable basement protection.` },
  { q: (c,s) => `How much does sump pump repair typically cost in ${c}?`,
    a: (c,s) => `Simple repairs like float switch replacement typically cost $100 to $250. Motor repair or complete pump replacement ranges from $400 to $900. Backup system installation runs $500 to $1,200. We provide a written upfront quote before any work begins.` },
  { q: (c,s) => `What should I do if my basement floods in ${c}?`,
    a: (c,s) => `First, ensure electrical safety — do not enter standing water if electrical outlets or appliances are submerged. Call us immediately for emergency water removal and sump pump repair. We can dispatch quickly to minimize damage and restore your pump system.` },
  { q: (c,s) => `How long do sump pumps typically last in ${c}?`,
    a: (c,s) => `Most sump pumps last 7 to 10 years with proper maintenance. Submersible pumps typically last longer than pedestal pumps. Regular annual maintenance significantly extends service life in ${c} homes.` },
  { q: (c,s) => `Can a clogged discharge line cause sump pump failure in ${c}?`,
    a: (c,s) => `Yes. A clogged discharge line prevents water from being pumped away, causing the pump to work harder and potentially overheat. In ${c}, debris, ice in winter, and improper installation can cause discharge line blockages. Regular inspection prevents this issue.` },
  { q: (c,s) => `Do you offer sump pump maintenance plans in ${c}?`,
    a: (c,s) => `Yes. We offer annual maintenance agreements for ${c} homeowners that include inspection, testing, and priority emergency response. Regular maintenance prevents unexpected failures and extends pump life.` },
];

const SUMP_PUMP_SERVICE_LISTS = [
  ['Sump pump repair and replacement', 'Float switch repair and adjustment', 'Discharge line clearing', 'Check valve replacement', 'Battery backup system installation', 'Emergency flood response'],
  ['Pedestal and submersible pump service', 'Pump motor repair and replacement', 'Basin and pit cleaning', 'Water-powered backup systems', 'Complete system installation', 'Annual maintenance programs'],
  ['24/7 emergency sump pump repair', 'All major brands serviced', 'Backup battery replacement', 'Discharge line routing and repair', 'Sump pit installation', 'Water intrusion assessment'],
];

function genSumpPumpRepair(cityName, stateCode, service) {
  const d = getCityData(cityName);
  const svc = 'sump-pump-repair';

  const dispatchIntro = pick(DISPATCH_INTROS, cityName, svc, 'di')(cityName);
  const trustPhrase = pick(TRUST_PHRASES, cityName, svc, 'tp')(stateCode || 'your state');
  const pricingPhrase = pick(PRICING_PHRASES, cityName, svc, 'pp');
  const responsePhrase = pick(RESPONSE_PHRASES, cityName, svc, 'rp')(cityName);

  const h1 = pick(H_SERVICE_OVERVIEW, cityName, svc, 'h1')('Sump Pump Repair', cityName);
  const h2 = pick(H_WHY_US, cityName, svc, 'h2')(cityName);
  const h3 = pick(H_HOW_IT_WORKS, cityName, svc, 'h3')(cityName);

  const serviceList = pick(SUMP_PUMP_SERVICE_LISTS, cityName, svc, 'sl');
  const infraSections = buildInfraSection(cityName, stateCode, service);

  return {
    localSignal: buildLocalSignal(cityName, d),
    intro: `${dispatchIntro} Basement water intrusion can cause extensive structural damage and mold growth in ${cityName}. Your sump pump is the first line of defense, and when it fails, every minute counts. ${responsePhrase} ${pricingPhrase}`,
    sections: [
      {
        heading: h1,
        body: `Our ${cityName} sump pump repair technicians handle every pump problem — from failed float switches and clogged discharge lines to complete motor failure and system replacement. We understand the local water table conditions and storm patterns that affect basement flooding risk in this area. ${trustPhrase}`,
        list: serviceList,
      },
      infraSections[0],
      infraSections[1],
      {
        heading: h2,
        body: `${trustPhrase} ${pricingPhrase} ${responsePhrase}`,
        list: [
          `Licensed and insured in ${stateCode || 'your state'}`,
          `All sump pump brands and types serviced`,
          `24/7 emergency response for pump failures`,
          `Upfront pricing with written estimates`,
          `Backup system installation available`,
          `Annual maintenance programs offered`,
        ],
      },
      {
        heading: h3,
        body: `Sump pump repair in ${cityName} begins with a complete diagnostic. We test the pump motor, check float switch operation, inspect the discharge line, and evaluate the backup system if present. This thorough approach ensures we identify the root cause and recommend the right solution.`,
        list: [
          'Complete pump system inspection',
          'Float switch and electrical testing',
          'Discharge line inspection and clearing',
          'Repair or replacement recommendation',
          'System testing after repair',
          'Preventive maintenance guidance',
        ],
      },
    ],
    faqs: pickFaqs(SUMP_PUMP_FAQ_POOL, cityName, stateCode, service),
    pricing: buildPricingGuidance(cityName, 'sump-pump-repair'),
  };
}
