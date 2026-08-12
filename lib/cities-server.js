// Server-only module — imports nationwide places dataset (us_places.json)
// Client components must NOT import from this file.
// Use lib/cities.js for client-safe exports instead.

export {
  STATES,
  CITY_DATA,
  getStateByCode,
  getStateSlug,
  SEED_CITIES,
  COST_PAGE_CITIES,
  SERVICES,
  SUMP_PUMP_QUALIFIED_CITIES,
  isCityQualifiedForService,
  isStateQualifiedForService,
  cityToSlug,
  buildSlug,
  parseSlug,
  PHONE_NUMBER,
  PHONE_DISPLAY,
} from './cities';

import { getPlaceBySlugSync, getGenericCityData, getPlaceByNameSync, ensurePlacesLoaded } from './nationwidePlaces';
import { SEED_CITIES, CITY_DATA, cityToSlug } from './cities';

// Required fields for content generation — ALL must be present and non-empty.
const REQUIRED_CITY_FIELDS = [
  'waterUtility', 'hardnessPpm', 'pipeMaterial', 'pipeEra',
  'soilType', 'dominantFailure', 'summerRiskNote', 'infraNarrative',
  'sewerSystem', 'infraClass', 'winterRisk', 'avgWinterTempF',
];

export function validateCityData(cityName, data) {
  const missing = REQUIRED_CITY_FIELDS.filter(
    f => data[f] === undefined || data[f] === null || data[f] === ''
  );
  if (missing.length > 0) {
    throw new Error(
      `[CityDataError] City "${cityName}" is missing required fields: ${missing.join(', ')}. Add complete data to CITY_DATA before deploying this city.`
    );
  }
  return data;
}

const cityDataCache = new Map();

export function getCityData(cityName) {
  if (cityDataCache.has(cityName)) {
    return cityDataCache.get(cityName);
  }
  const data = CITY_DATA[cityName];
  if (data) {
    const validated = validateCityData(cityName, data);
    cityDataCache.set(cityName, validated);
    return validated;
  }
  // Fallback: try to find the city in the nationwide places dataset
  // and return generic state-level data
  const place = getPlaceByNameSync(cityName);
  if (place) {
    const generic = getGenericCityData(cityName, place.stateCode);
    cityDataCache.set(cityName, generic);
    return generic;
  }
  // Last resort: check if it's a SEED_CITIES entry (has stateCode)
  const seedCity = SEED_CITIES.find(c => c.name === cityName);
  if (seedCity) {
    const generic = getGenericCityData(cityName, seedCity.stateCode);
    cityDataCache.set(cityName, generic);
    return generic;
  }
  throw new Error(
    `[CityDataError] City "${cityName}" has no entry in CITY_DATA or nationwide places.`
  );
}

// Keep getCitySignals as a compatibility shim — maps to new data model
export function getCitySignals(cityName) {
  const d = getCityData(cityName);
  return {
    pop:            d.pop,
    climate:        d.climate,
    waterType:      d.hardnessPpm > 200 ? 'hard' : d.hardnessPpm < 75 ? 'soft' : 'moderate',
    winterRisk:     d.winterRisk,
    avgWinterTemp:  `${d.avgWinterTempF}°F`,
    oldestPipes:    d.infraClass === 'aging',
    localFact:      d.infraNarrative.split('.')[0] + '.',
  };
}

// Get city by slug - merges SEED_CITIES with CITY_DATA
// Falls back to nationwide places dataset for non-enriched cities
export function getCityBySlug(slug) {
  // First check SEED_CITIES (enriched 155 cities)
  const seedCity = SEED_CITIES.find(c => cityToSlug(c.name) === slug);
  if (seedCity) {
    const cityData = CITY_DATA[seedCity.name];
    if (cityData) {
      return { ...seedCity, ...cityData };
    }
    // SEED_CITY without CITY_DATA — use generic data
    const genericData = getGenericCityData(seedCity.name, seedCity.stateCode);
    return { ...seedCity, ...genericData };
  }
  // Fall back to nationwide places dataset
  const place = getPlaceBySlugSync(slug);
  if (place) {
    return {
      name: place.name,
      state: place.state,
      stateCode: place.stateCode,
      nearby: [],
      ...getGenericCityData(place.name, place.stateCode),
    };
  }
  return null;
}
