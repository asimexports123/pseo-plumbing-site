import { CITY_DATA, SEED_CITIES, STATES } from './cities';

const HARD_WATER_THRESHOLDS = { soft: 60, moderate: 120, hard: 180 };

function classifyHardness(ppm) {
  if (ppm < HARD_WATER_THRESHOLDS.soft) return 'soft';
  if (ppm < HARD_WATER_THRESHOLDS.moderate) return 'moderate';
  if (ppm < HARD_WATER_THRESHOLDS.hard) return 'hard';
  return 'very hard';
}

function mode(arr) {
  const counts = {};
  let max = 0, result = arr[0];
  arr.forEach(v => { counts[v] = (counts[v] || 0) + 1; if (counts[v] > max) { max = counts[v]; result = v; } });
  return result;
}

function avg(nums) {
  if (!nums || nums.length === 0) return null;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

const HURRICANE_STATES = new Set(['FL','LA','TX','NC','VA','MD','SC','AL','MS','GA','NY','NJ','CT','MA','RI','DE','HI']);
const SLAB_FOUNDATION_STATES = new Set(['FL','TX','GA','NC','SC','AL','MS','LA','OK','AZ','NM','NV','CA','AR','TN','VA','MD','DE']);
const FREEZE_STATES = new Set(['NY','IL','PA','OH','MI','WI','MN','MA','CT','NJ','NH','VT','ME','WV','IN','MO','NE','IA','SD','ND','MT','WY','CO','UT','ID','AK','DC','DE','RI','KY','MD','VA','KS','OK','WA','OR','TN','NC']);

export function getStateEntityProfile(stateCode) {
  const stateObj = STATES.find(s => s.code === stateCode);
  if (!stateObj) return null;

  const cities = SEED_CITIES.filter(c => c.stateCode === stateCode);
  const cityDataEntries = cities.map(c => CITY_DATA[c.name]).filter(Boolean);

  if (cityDataEntries.length === 0) {
    return {
      stateName: stateObj.name,
      stateCode,
      hasCityData: false,
      freezeRisk: FREEZE_STATES.has(stateCode) ? 'high' : 'low',
      avgWinterTempF: null,
      hardWaterLevel: 'moderate',
      waterHardnessPpm: null,
      dominantFailure: stateObj.fact,
      dominantPipeMaterial: null,
      pipeEra: null,
      infrastructureClass: 'mixed',
      soilType: null,
      hasExpansiveClay: false,
      hasCombinedSewer: false,
      hasSewerBackups: false,
      hasTreeRootIntrusion: false,
      hasFrozenPipes: FREEZE_STATES.has(stateCode),
      hasSlabLeaks: SLAB_FOUNDATION_STATES.has(stateCode),
      hasWaterHeaterFailures: false,
      hasHurricaneRisk: HURRICANE_STATES.has(stateCode),
      hasCorrosionRisk: false,
      hasLeadServiceLines: false,
      summerRiskNote: null,
      sewerSystemType: null,
      waterUtility: null,
      climate: null,
    };
  }

  const winterRisks = cityDataEntries.map(d => d.winterRisk).filter(Boolean);
  const temps = cityDataEntries.map(d => d.avgWinterTempF).filter(Boolean);
  const hardnessValues = cityDataEntries.map(d => d.hardnessPpm).filter(Boolean);
  const infraClasses = cityDataEntries.map(d => d.infraClass).filter(Boolean);
  const soilTypes = cityDataEntries.map(d => d.soilType).filter(Boolean);
  const pipeMaterials = cityDataEntries.map(d => d.pipeMaterial).filter(Boolean);
  const pipeEras = cityDataEntries.map(d => d.pipeEra).filter(Boolean);
  const failures = cityDataEntries.map(d => d.dominantFailure).filter(Boolean);
  const sewerSystems = cityDataEntries.map(d => d.sewerSystem).filter(Boolean);
  const summerNotes = cityDataEntries.map(d => d.summerRiskNote).filter(Boolean);
  const climates = cityDataEntries.map(d => d.climate).filter(Boolean);
  const utilities = cityDataEntries.map(d => d.waterUtility).filter(Boolean);

  const avgTemp = avg(temps);
  const avgHardness = avg(hardnessValues);
  const dominantWinterRisk = mode(winterRisks);
  const dominantInfra = mode(infraClasses);
  const dominantSoil = soilTypes[0] || null;
  const dominantPipe = pipeMaterials[0] || null;
  const dominantEra = pipeEras[0] || null;
  const dominantFailure = failures[0] || stateObj.fact;
  const dominantSewer = sewerSystems[0] || null;
  const dominantSummer = summerNotes[0] || null;
  const dominantClimate = climates[0] || null;
  const dominantUtility = utilities[0] || null;

  const soilLower = (dominantSoil || '').toLowerCase();
  const hasExpansiveClay = soilLower.includes('clay') && (soilLower.includes('expansive') || soilLower.includes('piedmont') || soilLower.includes('red clay'));
  const hasCombinedSewer = (dominantSewer || '').toLowerCase().includes('combined');
  const hasSewerBackups = hasCombinedSewer || (dominantSewer || '').toLowerCase().includes('backup') || (dominantSewer || '').toLowerCase().includes('overflow');
  const hasTreeRootIntrusion = (dominantFailure || '').toLowerCase().includes('tree root') || (dominantSewer || '').toLowerCase().includes('root');
  const hasFrozenPipes = dominantWinterRisk === 'high' || dominantWinterRisk === 'med' || FREEZE_STATES.has(stateCode);
  const hasSlabLeaks = hasExpansiveClay || SLAB_FOUNDATION_STATES.has(stateCode) || (dominantFailure || '').toLowerCase().includes('slab');
  const hasWaterHeaterFailures = avgHardness >= 120 || (dominantFailure || '').toLowerCase().includes('water heater') || (dominantFailure || '').toLowerCase().includes('scale');
  const hasHurricaneRisk = HURRICANE_STATES.has(stateCode);
  const hasCorrosionRisk = (dominantFailure || '').toLowerCase().includes('corros') || (dominantFailure || '').toLowerCase().includes('salt air') || (dominantPipe || '').toLowerCase().includes('galvanized');
  const hasLeadServiceLines = (dominantPipe || '').toLowerCase().includes('lead') || (dominantFailure || '').toLowerCase().includes('lead');
  const hardWaterLevel = avgHardness ? classifyHardness(avgHardness) : 'moderate';

  const freezeRisk = dominantWinterRisk === 'high' ? 'high' : dominantWinterRisk === 'med' ? 'med' : (FREEZE_STATES.has(stateCode) ? 'med' : 'low');

  return {
    stateName: stateObj.name,
    stateCode,
    hasCityData: true,
    freezeRisk,
    avgWinterTempF: avgTemp,
    hardWaterLevel,
    waterHardnessPpm: avgHardness,
    dominantFailure,
    dominantPipeMaterial: dominantPipe,
    pipeEra: dominantEra,
    infrastructureClass: dominantInfra,
    soilType: dominantSoil,
    hasExpansiveClay,
    hasCombinedSewer,
    hasSewerBackups,
    hasTreeRootIntrusion,
    hasFrozenPipes,
    hasSlabLeaks,
    hasWaterHeaterFailures,
    hasHurricaneRisk,
    hasCorrosionRisk,
    hasLeadServiceLines,
    summerRiskNote: dominantSummer,
    sewerSystemType: dominantSewer,
    waterUtility: dominantUtility,
    climate: dominantClimate,
  };
}

export function buildClimateSection(profile, stateObj) {
  const parts = [];

  if (profile.hasFrozenPipes) {
    const tempPhrase = profile.avgWinterTempF
      ? `Average winter temperatures of ${profile.avgWinterTempF}°F`
      : 'Sub-freezing winter temperatures';
    parts.push(`${tempPhrase} mean frozen pipes in uninsulated basements, crawl spaces, and exterior walls are the top cold-weather emergency. When the spring thaw arrives, previously frozen lines can burst as water pressure returns — so a pipe that survived January may still fail in March.`);
  }

  if (profile.hasHurricaneRisk) {
    parts.push(`${stateObj.name}'s coastal exposure brings hurricane and tropical storm risk during summer and fall. Storm-driven sewer backups and flooding are common in low-lying areas with high water tables, and salt air corrosion attacks copper lines and metal fixtures in coastal neighborhoods.`);
  }

  if (profile.hasExpansiveClay) {
    parts.push(`Expansive clay soils across ${stateObj.name} expand when wet and shrink during dry spells, shifting foundations and stressing slab plumbing. This movement is a leading cause of slab leaks — underground pipe failures that waste water, drive up bills, and can damage foundations if left unrepaired.`);
  }

  if (profile.hardWaterLevel === 'hard' || profile.hardWaterLevel === 'very hard') {
    const ppmPhrase = profile.waterHardnessPpm ? ` (averaging ${profile.waterHardnessPpm} ppm)` : '';
    parts.push(`Hard water${ppmPhrase} is widespread across ${stateObj.name}, depositing mineral scale inside water heaters, faucets, and supply lines. Over time this scale narrows pipe openings, reduces water heater efficiency, and shortens appliance life — making annual flushing and a water softener worthwhile investments.`);
  }

  if (profile.hasCorrosionRisk && !profile.hasHurricaneRisk) {
    parts.push(`Corrosion is a persistent issue in ${stateObj.name}'s older neighborhoods, where galvanized steel and cast iron pipes are reaching the end of their service life. Pinhole leaks in copper lines and corroded drain stacks can cause sudden water damage — often in homes built before 1970 that still have original plumbing.`);
  }

  if (parts.length === 0) {
    parts.push(`${stateObj.name}'s climate and geology create a distinct set of plumbing challenges. ${stateObj.fact}. Understanding these local conditions helps homeowners prepare for emergencies and choose the right preventive maintenance.`);
  }

  return parts.join(' ');
}

export function buildEmergenciesSection(profile, stateObj) {
  const emergencies = [];

  if (profile.hasFrozenPipes) {
    emergencies.push(`Frozen and burst pipes — the top winter emergency, especially in homes with uninsulated basements or exterior wall plumbing. A single burst pipe can flood a room in minutes.`);
  }

  if (profile.hasSlabLeaks) {
    emergencies.push(`Slab leaks from expansive clay soil movement — underground pipe failures beneath concrete foundations that waste water and can crack slabs if not detected early.`);
  }

  if (profile.hasWaterHeaterFailures) {
    emergencies.push(`Water heater failures from hard water scale buildup${profile.waterHardnessPpm ? ` (${profile.waterHardnessPpm} ppm average hardness)` : ''} — sediment reduces heating efficiency and eventually causes tank leaks or complete failure.`);
  }

  if (profile.hasSewerBackups) {
    emergencies.push(`Sewer backups${profile.hasCombinedSewer ? ' from combined sewer overflows during heavy rain' : ' from aging sewer laterals and tree root intrusion'} — contaminated water can flood basements and create health hazards.`);
  }

  if (profile.hasCorrosionRisk) {
    emergencies.push(`Corroded pipe failures in older homes — galvanized steel and cast iron pipes${profile.hasLeadServiceLines ? ', including lead service lines,' : ''} that rust from within and eventually leak or burst without warning.`);
  }

  if (profile.hasHurricaneRisk) {
    emergencies.push(`Storm-driven plumbing damage — hurricanes and tropical storms cause sewer backups, flood-damaged water heaters, and pipe failures from debris impact and foundation shifting.`);
  }

  if (emergencies.length === 0) {
    emergencies.push(`Burst pipes, severe leaks, water heater failures, sewer backups, and clogged drains are the most frequent emergency calls in ${stateObj.name}.`);
  }

  emergencies.push(`In every case, the first step is the same: locate your main water shutoff valve and stop the flow before a technician arrives. Standing water causes structural damage within hours and mold growth within 24 to 48 hours.`);

  return emergencies.join(' ');
}

export function buildSeasonalSection(profile, stateObj) {
  const tips = [];

  if (profile.hasFrozenPipes) {
    tips.push(`Before cold weather arrives: disconnect garden hoses, drain outdoor faucets, and insulate exposed pipes in crawl spaces, garages, and attics. If winter temperatures in your area drop below 20°F, consider heat tape for vulnerable pipes. Know where your main shutoff valve is before you need it.`);
  }

  if (profile.hasHurricaneRisk) {
    tips.push(`Before hurricane season: test your sump pump, clear gutters and downspouts, and check that backflow preventers on sewer lines are functioning. After a storm, have a plumber inspect water heaters and supply lines for flood damage before restoring service.`);
  }

  if (profile.hardWaterLevel === 'hard' || profile.hardWaterLevel === 'very hard') {
    tips.push(`Year-round: flush your water heater at least annually to remove mineral sediment${profile.waterHardnessPpm ? ` — especially important in ${stateObj.name}, where water hardness averages ${profile.waterHardnessPpm} ppm` : ''}. Consider a water softener if you notice white scale on faucets or reduced water pressure.`);
  }

  if (profile.hasExpansiveClay) {
    tips.push(`Foundation care: maintain consistent soil moisture around your foundation to minimize clay soil movement. Sudden changes — waterlogging after heavy rain or cracking during drought — stress slab plumbing and can trigger slab leaks.`);
  }

  if (profile.hasSewerBackups) {
    tips.push(`Drain care: avoid pouring grease down drains, and schedule a camera inspection of older sewer laterals every few years${profile.hasTreeRootIntrusion ? ' — tree root intrusion is common in clay sewer lines' : ''}. Install a backflow valve if your neighborhood is prone to sewer backups.`);
  }

  if (tips.length < 3) {
    tips.push(`Test your main water shutoff valve annually to ensure it closes fully. Keep emergency plumber contact information accessible, and don't wait — small leaks become major failures within hours.`);
  }

  return tips.join(' ');
}

export function buildStateFAQs(profile, stateObj) {
  const faqs = [];

  faqs.push({
    q: `How fast can an emergency plumber reach me in ${stateObj.name}?`,
    a: `YoHomeFix dispatches licensed plumbers across ${stateObj.name} with a target response time of 60 minutes or less. A live operator answers 24/7 — no hold queues, no voicemail. The plumber provides a written quote before any work begins.`,
  });

  if (profile.hasFrozenPipes) {
    faqs.push({
      q: `What should I do if my pipes freeze in ${stateObj.name}?`,
      a: `First, shut off your main water valve to prevent flooding if the pipe has already burst. Do not use an open flame to thaw pipes — use a hair dryer or heat tape on the affected section. Call a licensed plumber immediately, as frozen pipes often burst during the thaw. In ${stateObj.name}, freeze-related emergencies are most common from December through March${profile.avgWinterTempF ? ` when average temperatures drop to ${profile.avgWinterTempF}°F` : ''}.`,
    });
  }

  if (profile.hasSlabLeaks) {
    faqs.push({
      q: `How do I know if I have a slab leak in my ${stateObj.name} home?`,
      a: `Common signs include an unexplained increase in your water bill, the sound of running water when no fixtures are in use, warm spots on the floor, or cracks in walls or flooring. ${stateObj.name}'s expansive clay soils shift with moisture changes, stressing slab plumbing. A licensed plumber can confirm a slab leak with electronic detection equipment.`,
    });
  }

  if (profile.hardWaterLevel === 'hard' || profile.hardWaterLevel === 'very hard') {
    faqs.push({
      q: `Does ${stateObj.name} have hard water, and will it damage my plumbing?`,
      a: `Yes. ${stateObj.name} water${profile.waterHardnessPpm ? ` averages ${profile.waterHardnessPpm} ppm hardness` : ''}, which is classified as ${profile.hardWaterLevel}. Hard water deposits mineral scale inside water heaters, pipes, and fixtures, reducing efficiency and shortening appliance life. Annual water heater flushing and a whole-house water softener are the most effective preventive measures.`,
    });
  }

  if (profile.hasSewerBackups) {
    faqs.push({
      q: `What causes sewer backups in ${stateObj.name}, and how can I prevent them?`,
      a: `${profile.hasCombinedSewer ? 'Combined sewer systems in older neighborhoods can overflow during heavy rain, pushing sewage back into basement drains. ' : ''}${profile.hasTreeRootIntrusion ? 'Tree roots invading clay sewer laterals are another common cause. ' : ''}Install a backflow valve on your sewer line, avoid pouring grease down drains, and schedule a camera inspection every few years if your home was built before 1980.`,
    });
  }

  if (profile.hasHurricaneRisk) {
    faqs.push({
      q: `How should I prepare my plumbing for hurricane season in ${stateObj.name}?`,
      a: `Before hurricane season, test your sump pump, clear gutters and downspouts, and inspect backflow preventers on sewer lines. After a storm, have a plumber check water heaters and supply lines for flood damage before restoring service. Shut off the main water valve if you evacuate.`,
    });
  }

  faqs.push({
    q: `Are plumbers in ${stateObj.name} licensed and insured?`,
    a: `Yes. All plumbers dispatched through YoHomeFix in ${stateObj.name} are fully licensed and insured. ${profile.hasLeadServiceLines ? 'If your home was built before 1950, ask the plumber about lead service line replacement during any major repair. ' : ''}You receive a written quote before work begins, and all work is backed by the provider's guarantee.`,
  });

  return faqs.slice(0, 8);
}
