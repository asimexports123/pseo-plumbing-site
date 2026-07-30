// Server-only module — imports us_zctas.json (3.5MB)
// Client components must NOT import from this file.
// Use lib/hyperlocalPlaces.js for client-safe exports instead.

import zctaData from '../data/us_zctas.json';
import { isZctaQualifiedForService, SERVICE_SLUGS } from './hyperlocalPlaces';

// Re-export client-safe items
export { isZctaQualifiedForService, SERVICE_SLUGS };

// ── Build lookup maps at module init ───────────────────────────

// ZIP → ZCTA record
const zipMap = {};
zctaData.forEach(z => { zipMap[z.zip] = z; });

// Parent city slug → array of ZCTAs
const cityZctas = {};
zctaData.forEach(z => {
  if (!cityZctas[z.parentCitySlug]) cityZctas[z.parentCitySlug] = [];
  cityZctas[z.parentCitySlug].push(z);
});

// Sort each city's ZCTAs by ZIP code for deterministic ordering
Object.keys(cityZctas).forEach(slug => {
  cityZctas[slug].sort((a, b) => a.zip.localeCompare(b.zip));
});

// ── Public API ─────────────────────────────────────────────────

export const TOTAL_ZCTAS = zctaData.length;

// Get ZCTA record by ZIP code
export function getZctaByZip(zip) {
  return zipMap[zip] || null;
}

// Get all ZCTAs for a parent city (by city slug)
export function getZctasByCity(citySlug) {
  return cityZctas[citySlug] || [];
}

// Get all ZCTAs for a state
export function getZctasByState(stateCode) {
  return zctaData.filter(z => z.stateCode === stateCode);
}

// Get all unique parent city slugs that have ZCTAs
export function getCitiesWithZctas() {
  return Object.keys(cityZctas);
}

// Count of cities with at least 1 ZCTA
export const CITIES_WITH_ZCTAS_COUNT = Object.keys(cityZctas).length;

// Get nearby ZCTAs by geographic distance (using lat/lon)
// Returns up to `limit` nearby ZCTAs sorted by distance
export function getNearbyZctas(zip, limit = 6) {
  const source = zipMap[zip];
  if (!source) return [];

  const candidates = zctaData
    .filter(z =>
      z.parentCitySlug === source.parentCitySlug &&
      z.zip !== source.zip
    )
    .map(z => {
      const dist = haversine(source.lat, source.lon, z.lat, z.lon);
      return { ...z, distance: dist };
    })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);

  // If fewer than 3 within-city results, supplement with regional
  if (candidates.length < 3) {
    const regional = getNearbyZctasRegional(zip, limit)
      .filter(r => !candidates.find(c => c.zip === r.zip))
      .slice(0, limit - candidates.length);
    return [...candidates, ...regional];
  }

  return candidates;
}

// Get nearby ZCTAs across city boundaries (for rural areas with few ZCTAs)
export function getNearbyZctasRegional(zip, limit = 6) {
  const source = zipMap[zip];
  if (!source) return [];

  const candidates = zctaData
    .filter(z =>
      z.stateCode === source.stateCode &&
      z.zip !== source.zip
    )
    .map(z => {
      const dist = haversine(source.lat, source.lon, z.lat, z.lon);
      return { ...z, distance: dist };
    })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);

  return candidates;
}

// Haversine distance in miles
function haversine(lat1, lon1, lat2, lon2) {
  const R = 3959; // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Compute total valid ZIP-service URLs at module init ────────
let _totalZipServiceUrls = 0;
zctaData.forEach(z => {
  SERVICE_SLUGS.forEach(svc => {
    if (isZctaQualifiedForService(z, svc)) _totalZipServiceUrls++;
  });
});

export const TOTAL_ZIP_SERVICE_URLS = _totalZipServiceUrls;
