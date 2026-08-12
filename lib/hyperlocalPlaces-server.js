// Server-only module — imports us_zctas.json (3.5MB)
// Client components must NOT import from this file.
// Use lib/hyperlocalPlaces.js for client-safe exports instead.

import { isZctaQualifiedForService, SERVICE_SLUGS } from './hyperlocalPlaces.js';

function _readJsonSync(filePath) {
  const _req = (typeof process !== 'undefined' && process.mainModule && process.mainModule.require) || (typeof globalThis !== 'undefined' && globalThis.__non_webpack_require__) || eval('require');
  const fs = _req('fs');
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

// Re-export client-safe items
export { isZctaQualifiedForService, SERVICE_SLUGS };

let zctaData = null;
let zipMap = {};
let cityZctas = {};
let _totalZctas = 0;
let _citiesWithZctasCount = 0;
let _totalZipServiceUrls = 0;
let _loadingPromise = null;

// ── Sharded loading state (per-state) ─────────────────────────
let _loadedZctaStates = new Set();
let _zctaStateShardPromises = {};

export async function ensureZctasLoaded() {
  if (zctaData) return;
  if (_loadingPromise) return _loadingPromise;
  _loadingPromise = (async () => {
    let data;
    try {
      data = _readJsonSync(
        process.cwd() + '/data/us_zctas.json'
      );
    } catch {
      const { getCloudflareContext } = await import('@opennextjs/cloudflare');
      const ctx = getCloudflareContext({ async: true });
      const res = await ctx.env.ASSETS.fetch(new Request('https://local/us-zctas-full.json'));
      data = await res.json();
    }
    zctaData = data;
    // ZIP → ZCTA record
    zipMap = {};
    data.forEach(z => { zipMap[z.zip] = z; });
    // Parent city slug → array of ZCTAs
    cityZctas = {};
    data.forEach(z => {
      if (!cityZctas[z.parentCitySlug]) cityZctas[z.parentCitySlug] = [];
      cityZctas[z.parentCitySlug].push(z);
    });
    // Sort each city's ZCTAs by ZIP code for deterministic ordering
    Object.keys(cityZctas).forEach(slug => {
      cityZctas[slug].sort((a, b) => a.zip.localeCompare(b.zip));
    });
    _totalZctas = data.length;
    _citiesWithZctasCount = Object.keys(cityZctas).length;
    // Compute total valid ZIP-service URLs
    _totalZipServiceUrls = 0;
    data.forEach(z => {
      SERVICE_SLUGS.forEach(svc => {
        if (isZctaQualifiedForService(z, svc)) _totalZipServiceUrls++;
      });
    });
  })();
  return _loadingPromise;
}

// ── Sharded loading (per-state) ───────────────────────────────
// Loads only one state's ZCTA shard instead of the full 3.41MB dataset.

export async function ensureZctasForStateLoaded(stateCode) {
  if (!stateCode) return;
  if (_loadedZctaStates.has(stateCode)) return;
  if (_zctaStateShardPromises[stateCode]) return _zctaStateShardPromises[stateCode];
  _zctaStateShardPromises[stateCode] = (async () => {
    let data;
    try {
      data = _readJsonSync(
        process.cwd() + '/public/data/zctas_state_' + stateCode + '.json'
      );
    } catch {
      const { getCloudflareContext } = await import('@opennextjs/cloudflare');
      const ctx = getCloudflareContext({ async: true });
      const res = await ctx.env.ASSETS.fetch(new Request(`https://local/data/zctas_state_${stateCode}.json`));
      data = await res.json();
    }
    if (!zctaData) zctaData = [];
    data.forEach(z => {
      zctaData.push(z);
      zipMap[z.zip] = z;
      if (!cityZctas[z.parentCitySlug]) cityZctas[z.parentCitySlug] = [];
      cityZctas[z.parentCitySlug].push(z);
    });
    Object.keys(cityZctas).forEach(slug => {
      cityZctas[slug].sort((a, b) => a.zip.localeCompare(b.zip));
    });
    _loadedZctaStates.add(stateCode);
  })();
  return _zctaStateShardPromises[stateCode];
}

// ── Public API ─────────────────────────────────────────────────

export async function getTotalZctas() {
  await ensureZctasLoaded();
  return _totalZctas;
}

// Get ZCTA record by ZIP code
export async function getZctaByZip(zip) {
  await ensureZctasLoaded();
  return zipMap[zip] || null;
}

// Get all ZCTAs for a parent city (by city slug)
export async function getZctasByCity(citySlug) {
  await ensureZctasLoaded();
  return cityZctas[citySlug] || [];
}

// Get all ZCTAs for a state
export async function getZctasByState(stateCode) {
  await ensureZctasLoaded();
  return zctaData.filter(z => z.stateCode === stateCode);
}

// Get all unique parent city slugs that have ZCTAs
export async function getCitiesWithZctas() {
  await ensureZctasLoaded();
  return Object.keys(cityZctas);
}

// Count of cities with at least 1 ZCTA
export async function getCitiesWithZctasCount() {
  await ensureZctasLoaded();
  return _citiesWithZctasCount;
}

// Get nearby ZCTAs by geographic distance (using lat/lon)
// Returns up to `limit` nearby ZCTAs sorted by distance
export async function getNearbyZctas(zip, limit = 6) {
  await ensureZctasLoaded();
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
    const regional = await getNearbyZctasRegional(zip, limit)
      .filter(r => !candidates.find(c => c.zip === r.zip))
      .slice(0, limit - candidates.length);
    return [...candidates, ...regional];
  }

  return candidates;
}

// Get nearby ZCTAs across city boundaries (for rural areas with few ZCTAs)
export async function getNearbyZctasRegional(zip, limit = 6) {
  await ensureZctasLoaded();
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

export async function getTotalZipServiceUrls() {
  await ensureZctasLoaded();
  return _totalZipServiceUrls;
}

// ── Sync variants (use after ensureZctasLoaded() has been awaited) ──

export function getZctaByZipSync(zip) {
  return zipMap[zip] || null;
}

export function getZctasByCitySync(citySlug) {
  return cityZctas[citySlug] || [];
}

export function getZctasByStateSync(stateCode) {
  return zctaData ? zctaData.filter(z => z.stateCode === stateCode) : [];
}

export function getCitiesWithZctasSync() {
  return Object.keys(cityZctas);
}

export function getNearbyZctasSync(zip, limit = 6) {
  const source = zipMap[zip];
  if (!source) return [];
  const candidates = zctaData
    .filter(z => z.parentCitySlug === source.parentCitySlug && z.zip !== source.zip)
    .map(z => ({ ...z, distance: haversine(source.lat, source.lon, z.lat, z.lon) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
  if (candidates.length < 3) {
    const regional = getNearbyZctasRegionalSync(zip, limit)
      .filter(r => !candidates.find(c => c.zip === r.zip))
      .slice(0, limit - candidates.length);
    return [...candidates, ...regional];
  }
  return candidates;
}

export function getNearbyZctasRegionalSync(zip, limit = 6) {
  const source = zipMap[zip];
  if (!source) return [];
  return zctaData
    .filter(z => z.stateCode === source.stateCode && z.zip !== source.zip)
    .map(z => ({ ...z, distance: haversine(source.lat, source.lon, z.lat, z.lon) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
}
