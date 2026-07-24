// ============================================================
// NATIONWIDE US PLACES DATASET
// Source: US Census Bureau 2024 Gazetteer Files — National Places
// https://www.census.gov/geographies/reference-files/2024/geo/gazetter-file.html
//
// Contains ~19,400 incorporated US places (cities, towns, villages,
// boroughs, municipalities) across all 50 states + DC.
//
// Duplicate place names across states are disambiguated by appending
// the state code to the slug (e.g., springfield-il, springfield-ma).
// The largest place by land area keeps the plain slug.
// ============================================================

import usPlacesData from '../data/us_places.json';

// Build a lookup map: slug -> place object
const slugMap = {};
usPlacesData.forEach(p => {
  slugMap[p.slug] = p;
});

// Build a lookup map: "State Code:City Name" -> place object
const nameStateMap = {};
usPlacesData.forEach(p => {
  nameStateMap[p.stateCode + ':' + p.name] = p;
});

// Get all places
export function getAllPlaces() {
  return usPlacesData;
}

// Get place by slug
export function getPlaceBySlug(slug) {
  return slugMap[slug] || null;
}

// Get place by name and state code
export function getPlaceByNameState(name, stateCode) {
  return nameStateMap[stateCode + ':' + name] || null;
}

// Get all places for a state
export function getPlacesByState(stateCode) {
  return usPlacesData.filter(p => p.stateCode === stateCode);
}

// Total count
export const TOTAL_PLACES = usPlacesData.length;

// States covered
export const COVERED_STATES = [...new Set(usPlacesData.map(p => p.stateCode))].sort();

// ============================================================
// GENERIC CITY DATA FALLBACK
// For cities without enriched CITY_DATA, provides safe, generic
// plumbing-relevant data that works with contentGenerator.js.
// No fabricated statistics — uses state-level info and generic
// plumbing context.
// ============================================================

import { STATES } from './cities';

// Supported state codes — must match STATES array in cities.js
// Hardcoded here to avoid circular dependency issues at module init
const SUPPORTED_STATE_CODES = new Set([
  'NY','CA','TX','FL','IL','PA','AZ','OH','NC','IN','WA','CO','TN','GA',
  'MI','VA','MD','WI','OR','NV','OK','NM','MO','NE','LA','MN','KY','MA',
  'DC','AL','AR','HI','ID','IA','KS','RI','UT','AK','CT','NJ','SD','DE',
  'MS','ND','MT','WY','SC',
]);
const validPlaces = usPlacesData.filter(p => SUPPORTED_STATE_CODES.has(p.stateCode));

// States qualified for sump-pump-repair (must match STATE_SUMP_PUMP_QUALIFIED in cities.js)
const SUMP_PUMP_QUALIFIED_STATE_CODES = new Set([
  'AK', 'CO', 'CT', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'ME',
  'MD', 'MA', 'MI', 'MN', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NY', 'ND', 'OH', 'OR', 'PA', 'RI', 'SD', 'UT', 'VT', 'VA',
  'WA', 'WV', 'WI', 'WY', 'DC', 'DE', 'TN', 'NC', 'OK', 'LA',
]);

// Compute nationwide service counts at module init (not per-request)
// All services qualify for all valid places except sump-pump-repair
// which is restricted to states with basement flooding risk
export const NATIONWIDE_SERVICE_COUNTS = (() => {
  const SERVICE_SLUGS = [
    'emergency', 'leak-repair', 'drain-cleaning', 'pipe-burst-repair',
    'water-heater-repair', 'sewer-line-repair', 'toilet-repair',
    'slab-leak-repair', 'water-line-repair', 'faucet-repair',
    'garbage-disposal-repair', 'water-softener-repair',
    'whole-house-repiping', 'main-water-shutoff-valve-repair',
    'sump-pump-repair',
  ];
  const counts = {};
  SERVICE_SLUGS.forEach(slug => {
    if (slug === 'sump-pump-repair') {
      counts[slug] = validPlaces.filter(p => SUMP_PUMP_QUALIFIED_STATE_CODES.has(p.stateCode)).length;
    } else {
      counts[slug] = validPlaces.length;
    }
  });
  return counts;
})();

const STATE_WINTER_RISK = {
  AL: 'low', AK: 'high', AZ: 'low', AR: 'med', CA: 'low', CO: 'high',
  CT: 'high', DE: 'med', DC: 'med', FL: 'low', GA: 'low', HI: 'low',
  ID: 'high', IL: 'high', IN: 'high', IA: 'high', KS: 'high', KY: 'med',
  LA: 'low', ME: 'high', MD: 'med', MA: 'high', MI: 'high', MN: 'high',
  MS: 'low', MO: 'med', MT: 'high', NE: 'high', NV: 'low', NH: 'high',
  NJ: 'high', NM: 'med', NY: 'high', NC: 'med', ND: 'high', OH: 'high',
  OK: 'med', OR: 'low', PA: 'high', RI: 'high', SC: 'low', SD: 'high',
  TN: 'med', TX: 'low', UT: 'high', VT: 'high', VA: 'med', WA: 'low',
  WV: 'high', WI: 'high', WY: 'high',
};

const STATE_AVG_WINTER_TEMP = {
  AL: 42, AK: 15, AZ: 53, AR: 36, CA: 50, CO: 30, CT: 28, DE: 35,
  DC: 35, FL: 60, GA: 45, HI: 73, ID: 28, IL: 22, IN: 25, IA: 20,
  KS: 30, KY: 32, LA: 48, ME: 20, MD: 32, MA: 28, MI: 22, MN: 12,
  MS: 42, MO: 28, MT: 22, NE: 22, NV: 35, NH: 22, NJ: 30, NM: 35,
  NY: 25, NC: 40, ND: 12, OH: 28, OK: 35, OR: 40, PA: 28, RI: 30,
  SC: 42, SD: 18, TN: 35, TX: 45, UT: 28, VT: 20, VA: 35, WA: 38,
  WV: 30, WI: 18, WY: 22,
};

const STATE_INFRA_CLASS = {
  AL: 'mixed', AK: 'modern', AZ: 'modern', AR: 'mixed', CA: 'mixed',
  CT: 'aging', DE: 'mixed', DC: 'aging', FL: 'mixed', GA: 'mixed',
  HI: 'mixed', ID: 'modern', IL: 'aging', IN: 'mixed', IA: 'mixed',
  KS: 'mixed', KY: 'aging', LA: 'mixed', ME: 'aging', MD: 'aging',
  MA: 'aging', MI: 'aging', MN: 'mixed', MS: 'mixed', MO: 'mixed',
  MT: 'mixed', NE: 'mixed', NV: 'modern', NH: 'aging', NJ: 'aging',
  NM: 'modern', NY: 'aging', NC: 'mixed', ND: 'mixed', OH: 'aging',
  OK: 'mixed', OR: 'mixed', PA: 'aging', RI: 'aging', SC: 'mixed',
  SD: 'mixed', TN: 'mixed', TX: 'mixed', UT: 'modern', VT: 'aging',
  VA: 'mixed', WA: 'mixed', WV: 'aging', WI: 'mixed', WY: 'mixed',
};

const STATE_HARDNESS_PPM = {
  AL: 60, AK: 30, AZ: 280, AR: 50, CA: 180, CO: 150, CT: 60, DE: 80,
  DC: 90, FL: 120, GA: 50, HI: 40, ID: 120, IL: 140, IN: 160, IA: 170,
  KS: 200, KY: 130, LA: 70, ME: 30, MD: 90, MA: 50, MI: 130, MN: 180,
  MS: 50, MO: 160, MT: 110, NE: 180, NV: 200, NH: 50, NJ: 90, NM: 180,
  NY: 50, NC: 50, ND: 170, OH: 140, OK: 150, OR: 40, PA: 100, RI: 50,
  SC: 50, SD: 180, TN: 90, TX: 200, UT: 250, VT: 40, VA: 70, WA: 35,
  WV: 80, WI: 160, WY: 120,
};

const STATE_PIPE_ERA = {
  AL: '1960s–1990s', AK: '1980s–2000s', AZ: '1990s–2010s', AR: '1960s–1990s',
  CA: '1950s–2000s', CO: '1970s–2000s', CT: '1900s–1960s', DE: '1950s–1980s',
  DC: '1880s–1950s', FL: '1980s–2010s', GA: '1970s–2000s', HI: '1970s–2000s',
  ID: '1980s–2010s', IL: '1900s–1970s', IN: '1950s–1990s', IA: '1950s–1990s',
  KS: '1960s–1990s', KY: '1900s–1970s', LA: '1970s–2000s', ME: '1900s–1960s',
  MD: '1940s–1980s', MA: '1900s–1960s', MI: '1900s–1970s', MN: '1950s–1990s',
  MS: '1960s–1990s', MO: '1940s–1980s', MT: '1960s–1990s', NE: '1960s–1990s',
  NV: '1990s–2010s', NH: '1900s–1970s', NJ: '1900s–1970s', NM: '1970s–2000s',
  NY: '1890s–1970s', NC: '1970s–2000s', ND: '1960s–1990s', OH: '1900s–1970s',
  OK: '1960s–1990s', OR: '1970s–2000s', PA: '1880s–1960s', RI: '1900s–1960s',
  SC: '1970s–2000s', SD: '1960s–1990s', TN: '1960s–1990s', TX: '1970s–2000s',
  UT: '1980s–2010s', VT: '1900s–1970s', VA: '1940s–1990s', WA: '1970s–2000s',
  WV: '1900s–1970s', WI: '1950s–1990s', WY: '1960s–1990s',
};

const STATE_PIPE_MATERIAL = {
  AL: 'copper and PVC', AK: 'PEX and copper', AZ: 'CPVC and PEX',
  AR: 'copper and PVC', CA: 'copper and CPVC', CO: 'copper and PEX',
  CT: 'copper and cast iron in older homes', DE: 'copper and PVC',
  DC: 'cast iron and copper in older buildings', FL: 'PVC and copper',
  GA: 'copper and PVC', HI: 'copper and CPVC', ID: 'PEX and copper',
  IL: 'copper and cast iron in older areas', IN: 'copper and PVC',
  IA: 'copper and PVC', KS: 'copper and PVC', KY: 'copper and galvanized in older homes',
  LA: 'PVC and copper', ME: 'copper and PVC', MD: 'copper and cast iron in older areas',
  MA: 'copper and cast iron in older buildings', MI: 'copper and cast iron in older areas',
  MN: 'copper and PEX', MS: 'copper and PVC', MO: 'copper and PVC',
  MT: 'copper and PEX', NE: 'copper and PVC', NV: 'CPVC and PEX',
  NH: 'copper and PVC', NJ: 'copper and cast iron in older areas',
  NM: 'CPVC and copper', NY: 'copper and cast iron in older buildings',
  NC: 'copper and PVC', ND: 'copper and PEX', OH: 'copper and cast iron in older areas',
  OK: 'copper and PVC', OR: 'copper and PEX', PA: 'copper and cast iron in older areas',
  RI: 'copper and cast iron in older buildings', SC: 'copper and PVC',
  SD: 'copper and PEX', TN: 'copper and PVC', TX: 'PVC and copper',
  UT: 'PEX and copper', VT: 'copper and PVC', VA: 'copper and PVC',
  WA: 'copper and PEX', WV: 'copper and galvanized in older homes',
  WI: 'copper and PVC', WY: 'copper and PEX',
};

const STATE_SOIL_TYPE = {
  AL: 'clay and sandy loam', AK: 'permafrost and rocky', AZ: 'desert alluvium and caliche',
  AR: 'clay and alluvial', CA: 'expansive clay and alluvial fill', CO: 'clay and rocky',
  CT: 'glacial till and rocky', DE: 'sandy loam and clay', DC: 'urban fill and clay',
  FL: 'sandy and limestone', GA: 'red clay and sandy loam', HI: 'volcanic and sandy',
  ID: 'volcanic and alluvial', IL: 'glacial clay and loess', IN: 'glacial till and clay',
  IA: 'loess and glacial till', KS: 'clay and prairie loam', KY: 'limestone and clay',
  LA: 'alluvial and clay', ME: 'glacial till and rocky', MD: 'coastal plain and clay',
  MA: 'glacial till and rocky', MI: 'glacial till and sandy', MN: 'glacial till and loam',
  MS: 'clay and alluvial', MO: 'clay and loess', MT: 'rocky and alluvial',
  NE: 'loess and prairie', NV: 'desert alluvium and caliche', NH: 'glacial till and rocky',
  NJ: 'coastal plain and glacial till', NM: 'desert alluvium and rocky',
  NY: 'glacial till and bedrock', NC: 'clay and sandy loam', ND: 'glacial till and prairie',
  OH: 'glacial till and clay', OK: 'red clay and prairie', OR: 'volcanic and alluvial',
  PA: 'schist and clay', RI: 'glacial till and coastal', SC: 'clay and sandy',
  SD: 'glacial till and prairie', TN: 'clay and limestone', TX: 'expansive clay and prairie',
  UT: 'rocky and alluvial', VT: 'glacial till and rocky', VA: 'clay and coastal plain',
  WA: 'volcanic and alluvial', WV: 'rocky and clay', WI: 'glacial till and sandy',
  WY: 'rocky and prairie',
};

const STATE_SEWER_SYSTEM = {
  AL: 'separated sewer system in most areas', AK: 'modern separated sewer',
  AZ: 'modern gravity sewer with lift stations', AR: 'separated sewer system',
  CA: 'separate stormwater and sanitary systems', CO: 'modern separated sewer',
  CT: 'combined sewers in older cities, separated in newer areas',
  DE: 'separated sewer system', DC: 'combined sewer system in older areas',
  FL: 'separated sewer with lift stations', GA: 'separated sewer system',
  HI: 'modern separated sewer', ID: 'modern separated sewer',
  IL: 'combined sewers in older areas, separated in newer',
  IN: 'separated sewer system', IA: 'separated sewer system',
  KS: 'separated sewer system', KY: 'combined sewers in older cities',
  LA: 'separated sewer with lift stations in flat areas',
  ME: 'combined sewers in older coastal cities', MD: 'combined sewers in older areas',
  MA: 'combined sewers in older cities', MI: 'combined sewers in older areas',
  MN: 'combined sewers in older areas, separated in newer',
  MS: 'separated sewer system', MO: 'combined sewers in older cities',
  MT: 'separated sewer system', NE: 'separated sewer system',
  NV: 'modern separated sewer', NH: 'combined sewers in older cities',
  NJ: 'combined sewers in older areas', NM: 'modern separated sewer',
  NY: 'combined sewers in older cities, separated in newer',
  NC: 'separated sewer system', ND: 'separated sewer system',
  OH: 'combined sewers in older cities', OK: 'separated sewer system',
  OR: 'separated sewer system', PA: 'combined sewers in older cities',
  RI: 'combined sewers in older coastal areas', SC: 'separated sewer system',
  SD: 'separated sewer system', TN: 'combined sewers in older cities',
  TX: 'separated sewer system', UT: 'modern separated sewer',
  VT: 'combined sewers in older cities', VA: 'separated sewer system',
  WA: 'separated sewer system', WV: 'separated sewer system',
  WI: 'combined sewers in older areas, separated in newer', WY: 'separated sewer system',
};

function getStateInfo(stateCode) {
  return STATES.find(s => s.code === stateCode) || null;
}

// Generate generic city data for places without enriched CITY_DATA
export function getGenericCityData(cityName, stateCode) {
  const state = getStateInfo(stateCode);
  const stateFact = state?.fact || 'seasonal temperature changes create plumbing challenges';
  const winterRisk = STATE_WINTER_RISK[stateCode] || 'med';
  const avgWinterTempF = STATE_AVG_WINTER_TEMP[stateCode] || 35;
  const infraClass = STATE_INFRA_CLASS[stateCode] || 'mixed';
  const hardnessPpm = STATE_HARDNESS_PPM[stateCode] || 100;
  const pipeEra = STATE_PIPE_ERA[stateCode] || '1960s–1990s';
  const pipeMaterial = STATE_PIPE_MATERIAL[stateCode] || 'copper and PVC';
  const soilType = STATE_SOIL_TYPE[stateCode] || 'mixed soil types';
  const sewerSystem = STATE_SEWER_SYSTEM[stateCode] || 'separated sewer system';

  // Determine dominant failure based on winter risk and hardness
  let dominantFailure;
  if (winterRisk === 'high') {
    dominantFailure = 'frozen and burst pipes during winter, along with aging pipe corrosion';
  } else if (hardnessPpm > 175) {
    dominantFailure = 'hard water scale buildup in water heaters and supply lines';
  } else {
    dominantFailure = 'aging pipe corrosion and drain line blockages';
  }

  // Summer risk note based on climate
  let summerRiskNote;
  if (hardnessPpm > 175) {
    summerRiskNote = 'hard water scale accumulation accelerates during peak usage months';
  } else if (winterRisk === 'high') {
    summerRiskNote = 'rapid spring thaw creates pressure surges in aging supply lines';
  } else {
    summerRiskNote = 'high humidity and seasonal storms stress drain and sewer lines';
  }

  // Water utility — generic but state-aware
  const waterUtility = `local municipal water utility serving ${cityName}`;

  // Infra narrative — generic but state-aware, no fabricated specifics
  const infraNarrative = `${cityName}'s plumbing infrastructure reflects ${stateCode === 'DC' ? 'the region' : state?.name || 'the state'}'s broader patterns: ${pipeMaterial} installed primarily during the ${pipeEra}, with ${infraClass === 'aging' ? 'many older systems requiring ongoing maintenance and replacement' : infraClass === 'modern' ? 'relatively modern systems that still require professional attention' : 'a mix of older and newer systems depending on the neighborhood'}. ${stateFact.charAt(0).toUpperCase() + stateFact.slice(1)}, which affects plumbing systems throughout the area.`;

  return {
    waterUtility,
    hardnessPpm,
    pipeEra,
    pipeMaterial,
    infraClass,
    winterRisk,
    avgWinterTempF,
    summerRiskNote,
    dominantFailure,
    sewerSystem,
    soilType,
    infraNarrative,
    neighborhoods: [],
    zipCodes: [],
    pop: '',
    climate: '',
  };
}

// Check if a city has enriched CITY_DATA
export function hasEnrichedData(cityName) {
  // This will be checked against CITY_DATA in cities.js
  // We export this as a placeholder — the actual check happens in cities.js
  return false;
}

// Find geographically nearby places within the same state
// Uses haversine distance on lat/lon from Census data
// Returns up to `limit` places, excluding the source place itself
export function getNearbyPlaces(slug, stateCode, limit = 8) {
  const source = slugMap[slug];
  if (!source || !source.lat || !source.lon) {
    // Fallback: return first N places in the same state (deterministic)
    return usPlacesData
      .filter(p => p.stateCode === stateCode && p.slug !== slug)
      .slice(0, limit);
  }

  const sameState = usPlacesData.filter(p =>
    p.stateCode === stateCode &&
    p.slug !== slug &&
    p.lat && p.lon
  );

  // Calculate distances and sort by proximity
  const withDist = sameState.map(p => {
    const dist = haversine(source.lat, source.lon, p.lat, p.lon);
    return { ...p, dist };
  });

  withDist.sort((a, b) => a.dist - b.dist);
  return withDist.slice(0, limit);
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 3958.8; // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
