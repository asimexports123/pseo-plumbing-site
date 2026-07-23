import { SEED_CITIES, CITY_DATA, cityToSlug } from './cities';

// ── Water Hardness Classification (USGS-aligned) ──────────────────
// Source: U.S. Geological Survey water hardness classifications
// https://www.usgs.gov/special-topics/water-science-school/science/hardness-water
//
// mg/L as CaCO₃ equivalent:
//   0–60    → Soft
//   61–120  → Moderately Hard
//   121–180 → Hard
//   181+    → Very Hard

export function classifyHardness(ppm) {
  if (ppm <= 60) return 'Soft';
  if (ppm <= 120) return 'Moderately Hard';
  if (ppm <= 180) return 'Hard';
  return 'Very Hard';
}

export const HARDNESS_COLORS = {
  'Soft': '#3b82f6',
  'Moderately Hard': '#f59e0b',
  'Hard': '#f97316',
  'Very Hard': '#dc2626',
};

// ── Plumbing Implication by Hardness Level ────────────────────────
export const HARDNESS_IMPLICATIONS = {
  'Soft': 'Minimal scale buildup. Lower risk of pipe narrowing and appliance efficiency loss. Potential for slightly higher corrosion in older copper pipes due to lower mineral buffering.',
  'Moderately Hard': 'Moderate scale accumulation over time. Annual water heater flushing recommended. Showerheads and aerators may need periodic descaling.',
  'Hard': 'Significant scale buildup in pipes, water heaters, and fixtures. Water heater efficiency declines noticeably within 2–3 years without maintenance. Scale-related drain blockages become common.',
  'Very Hard': 'Severe and rapid scale accumulation. Tank water heaters may lose 30%+ efficiency within 3 years. Pipe diameter narrowing accelerates. Whole-house water treatment strongly recommended.',
};

// ── Infrastructure Risk Score ─────────────────────────────────────
// Composite score (0–10) combining infrastructure age, winter risk,
// and water hardness — all factors that independently affect plumbing
// failure frequency.
//
// Components:
//   infraClass:  aging=3, mixed=2, modern=1
//   winterRisk:  high=3,  med=2,   low=1
//   hardness:    Very Hard=3, Hard=2, Moderately Hard=1, Soft=0
//   (plus 1 base point so range is 3–10)

export function computeRiskScore({ infraClass, winterRisk, hardnessPpm }) {
  const infraScore = infraClass === 'aging' ? 3 : infraClass === 'mixed' ? 2 : 1;
  const winterScore = winterRisk === 'high' ? 3 : winterRisk === 'med' ? 2 : 1;
  const hardClass = classifyHardness(hardnessPpm);
  const hardScore = hardClass === 'Very Hard' ? 3 : hardClass === 'Hard' ? 2 : hardClass === 'Moderately Hard' ? 1 : 0;
  return infraScore + winterScore + hardScore + 1;
}

export function classifyRisk(score) {
  if (score >= 8) return 'High';
  if (score >= 6) return 'Elevated';
  if (score >= 4) return 'Moderate';
  return 'Low';
}

export const RISK_COLORS = {
  'High': '#dc2626',
  'Elevated': '#f97316',
  'Moderate': '#f59e0b',
  'Low': '#22c55e',
};

// ── Build Research Dataset ────────────────────────────────────────
export function buildResearchDataset() {
  const rows = SEED_CITIES.map((city) => {
    const d = CITY_DATA[city.name];
    if (!d) return null;
    const hardnessClass = classifyHardness(d.hardnessPpm);
    const riskScore = computeRiskScore({
      infraClass: d.infraClass,
      winterRisk: d.winterRisk,
      hardnessPpm: d.hardnessPpm,
    });
    const riskClass = classifyRisk(riskScore);
    return {
      city: city.name,
      state: city.stateCode,
      stateName: city.state,
      slug: cityToSlug(city.name),
      waterUtility: d.waterUtility,
      hardnessPpm: d.hardnessPpm,
      hardnessClass,
      infraClass: d.infraClass,
      winterRisk: d.winterRisk,
      avgWinterTempF: d.avgWinterTempF,
      climate: d.climate,
      pipeMaterial: d.pipeMaterial,
      pipeEra: d.pipeEra,
      sewerSystem: d.sewerSystem,
      soilType: d.soilType,
      dominantFailure: d.dominantFailure,
      riskScore,
      riskClass,
      implication: HARDNESS_IMPLICATIONS[hardnessClass],
    };
  }).filter(Boolean);

  return rows;
}

// ── Calculated Findings ───────────────────────────────────────────
export function computeFindings(dataset) {
  const hardnessValues = dataset.map(d => d.hardnessPpm).sort((a, b) => a - b);
  const median = hardnessValues[Math.floor(hardnessValues.length / 2)];
  const mean = Math.round(hardnessValues.reduce((a, b) => a + b, 0) / hardnessValues.length);

  const classCounts = {};
  dataset.forEach(d => {
    classCounts[d.hardnessClass] = (classCounts[d.hardnessClass] || 0) + 1;
  });

  const riskCounts = {};
  dataset.forEach(d => {
    riskCounts[d.riskClass] = (riskCounts[d.riskClass] || 0) + 1;
  });

  const hardest = [...dataset].sort((a, b) => b.hardnessPpm - a.hardnessPpm).slice(0, 10);
  const softest = [...dataset].sort((a, b) => a.hardnessPpm - b.hardnessPpm).slice(0, 10);

  // Regional analysis
  const regions = {};
  dataset.forEach(d => {
    const region = getRegion(d.state);
    if (!regions[region]) regions[region] = { count: 0, total: 0 };
    regions[region].count++;
    regions[region].total += d.hardnessPpm;
  });
  const regionalAverages = Object.entries(regions).map(([region, data]) => ({
    region,
    avgHardness: Math.round(data.total / data.count),
    cityCount: data.count,
  })).sort((a, b) => b.avgHardness - a.avgHardness);

  // States with highest average hardness
  const stateMap = {};
  dataset.forEach(d => {
    if (!stateMap[d.stateName]) stateMap[d.stateName] = { count: 0, total: 0 };
    stateMap[d.stateName].count++;
    stateMap[d.stateName].total += d.hardnessPpm;
  });
  const stateAverages = Object.entries(stateMap)
    .filter(([_, data]) => data.count >= 2)
    .map(([state, data]) => ({ state, avgHardness: Math.round(data.total / data.count), cityCount: data.count }))
    .sort((a, b) => b.avgHardness - a.avgHardness)
    .slice(0, 10);

  return {
    totalCities: dataset.length,
    median,
    mean,
    min: hardnessValues[0],
    max: hardnessValues[hardnessValues.length - 1],
    classCounts,
    riskCounts,
    hardest,
    softest,
    regionalAverages,
    stateAverages,
  };
}

function getRegion(stateCode) {
  const regions = {
    'Northeast': ['CT', 'DE', 'DC', 'MA', 'MD', 'ME', 'NH', 'NJ', 'NY', 'PA', 'RI', 'VA', 'VT', 'WV'],
    'Southeast': ['AL', 'FL', 'GA', 'KY', 'LA', 'MS', 'NC', 'SC', 'TN'],
    'Midwest': ['IA', 'IL', 'IN', 'KS', 'MI', 'MN', 'MO', 'ND', 'NE', 'OH', 'SD', 'WI'],
    'South Central': ['AR', 'OK', 'TX'],
    'Mountain': ['AZ', 'CO', 'ID', 'MT', 'NM', 'NV', 'UT', 'WY'],
    'Pacific': ['AK', 'CA', 'HI', 'OR', 'WA'],
  };
  for (const [region, codes] of Object.entries(regions)) {
    if (codes.includes(stateCode)) return region;
  }
  return 'Other';
}
