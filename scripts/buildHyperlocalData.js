// Build hyperlocal ZIP/ZCTA data layer from Census ZCTA-to-Place relationship file
// and ZCTA Gazetteer coordinates.
//
// Input:
//   data/tab20_zcta520_place20_natl.txt  — ZCTA-to-Place relationship (pipe-delimited)
//   data/2024_Gaz_zcta_national.txt      — ZCTA Gazetteer (tab-delimited, lat/lon)
//   data/us_places.json                  — YoHomeFix nationwide places dataset
//
// Output:
//   data/us_zctas.json                   — Normalized ZCTA records with parent city mapping

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');

// ── Load YoHomeFix places ──────────────────────────────────────
const places = JSON.parse(fs.readFileSync(path.join(dataDir, 'us_places.json'), 'utf8'));

// Build GEOID lookup for places (Census place GEOID → our place object)
// Our us_places.json uses geoid field (e.g., "0100124" for Abbeville, AL)
const placeByGeoid = {};
const placeBySlug = {};
places.forEach(p => {
  if (p.geoid && p.geoid !== 'MANUAL') {
    placeByGeoid[p.geoid] = p;
  }
  placeBySlug[p.slug] = p;
});

console.log(`Loaded ${places.length} YoHomeFix places`);
console.log(`Places with Census GEOID: ${Object.keys(placeByGeoid).length}`);

// ── Load ZCTA Gazetteer (lat/lon for each ZCTA) ────────────────
const zctaGazPath = path.join(dataDir, '2024_Gaz_zcta_national.txt');
const gazLines = fs.readFileSync(zctaGazPath, 'utf8').split('\n').filter(l => l.trim());

// Parse header to find column positions
const gazHeader = gazLines[0].split('\t').map(h => h.trim());
const colGEOID = gazHeader.indexOf('GEOID');
const colLAT = gazHeader.indexOf('INTPTLAT');
const colLON = gazHeader.indexOf('INTPTLONG');
const colALAND = gazHeader.indexOf('ALAND');

const zctaCoords = {};
for (let i = 1; i < gazLines.length; i++) {
  const parts = gazLines[i].split('\t');
  const zcta = (parts[colGEOID] || '').trim();
  const lat = parseFloat(parts[colLAT]);
  const lon = parseFloat(parts[colLON]);
  const aland = parseInt(parts[colALAND] || '0', 10);
  if (zcta && !isNaN(lat) && !isNaN(lon)) {
    zctaCoords[zcta] = { lat, lon, aland };
  }
}
console.log(`Loaded ${Object.keys(zctaCoords).length} ZCTA coordinates from Gazetteer`);

// ── Parse ZCTA-to-Place relationship file ──────────────────────
const relPath = path.join(dataDir, 'tab20_zcta520_place20_natl.txt');
const relContent = fs.readFileSync(relPath, 'utf8');

// The file is pipe-delimited but has some quirks with empty fields
// Header: OID_ZCTA5_20|GEOID_ZCTA5_20|NAMELSAD_ZCTA5_20|AREALAND_ZCTA5_20|AREAWATER_ZCTA5_20|MTFCC_ZCTA5_20|CLASSFP_ZCTA5_20|FUNCSTAT_ZCTA5_20|OID_PLACE_20|GEOID_PLACE_20|NAMELSAD_PLACE_20|AREALAND_PLACE_20|AREAWATER_PLACE_20|MTFCC_PLACE_20|CLASSFP_PLACE_20|FUNCSTAT_PLACE_20|AREALAND_PART|AREAWATER_PART

const relLines = relContent.split('\n').filter(l => l.trim());

// Skip header line(s) — the first line is the header
let startIdx = 0;
// Find first data line (one that starts with a number or pipe)
for (let i = 0; i < Math.min(5, relLines.length); i++) {
  if (/^\d+\|/.test(relLines[i]) || /^\|+\d/.test(relLines[i])) {
    startIdx = i;
    break;
  }
}

// Build ZCTA → Place mapping
// For each ZCTA, find the place with the largest AREALAND_PART overlap
const zctaToPlaces = {}; // zcta → [{ geoid, name, arealandPart }, ...]

for (let i = startIdx; i < relLines.length; i++) {
  const line = relLines[i];
  if (!line.trim()) continue;

  const parts = line.split('|').map(p => p.trim());

  // ZCTA fields might be empty (when a place exists but no ZCTA)
  const zctaGid = parts[1] || '';
  const placeGid = parts[9] || '';
  const placeName = parts[10] || '';
  const arealandPart = parseInt(parts[16] || '0', 10);

  if (!zctaGid || !placeGid) continue;

  if (!zctaToPlaces[zctaGid]) {
    zctaToPlaces[zctaGid] = [];
  }
  zctaToPlaces[zctaGid].push({
    placeGeoid: placeGid,
    placeName: placeName,
    arealandPart: arealandPart,
  });
}

console.log(`ZCTA-to-Place relationships: ${Object.keys(zctaToPlaces).length} unique ZCTAs mapped to places`);

// ── Build final ZCTA dataset ───────────────────────────────────
// For each ZCTA, find the best matching parent place (largest area overlap)
// that exists in our YoHomeFix places dataset.

const zctas = [];
let mappedCount = 0;
let unmappedCount = 0;

Object.keys(zctaToPlaces).forEach(zcta => {
  const places = zctaToPlaces[zcta];
  // Sort by overlap area descending — best match first
  places.sort((a, b) => b.arealandPart - a.arealandPart);

  // Find first place that exists in our YoHomeFix dataset
  let parentPlace = null;
  for (const p of places) {
    const ourPlace = placeByGeoid[p.placeGeoid];
    if (ourPlace) {
      parentPlace = ourPlace;
      break;
    }
  }

  const coords = zctaCoords[zcta];

  if (parentPlace && coords) {
    zctas.push({
      zip: zcta,
      lat: coords.lat,
      lon: coords.lon,
      aland: coords.aland,
      parentCity: parentPlace.name,
      parentCitySlug: parentPlace.slug,
      stateCode: parentPlace.stateCode,
      state: parentPlace.state,
    });
    mappedCount++;
  } else {
    unmappedCount++;
  }
});

console.log(`\nResults:`);
console.log(`  Total ZCTAs in relationship file: ${Object.keys(zctaToPlaces).length}`);
console.log(`  Mapped to YoHomeFix places: ${mappedCount}`);
console.log(`  Unmapped (no matching place or no coords): ${unmappedCount}`);

// ── Stats by state ─────────────────────────────────────────────
const stateCounts = {};
zctas.forEach(z => {
  stateCounts[z.stateCode] = (stateCounts[z.stateCode] || 0) + 1;
});
console.log(`\nZCTAs by state (top 10):`);
Object.entries(stateCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .forEach(([state, count]) => console.log(`  ${state}: ${count}`));

// ── Stats by parent city (top 10) ──────────────────────────────
const cityCounts = {};
zctas.forEach(z => {
  const key = `${z.parentCity}, ${z.stateCode}`;
  cityCounts[key] = (cityCounts[key] || 0) + 1;
});
console.log(`\nZCTAs by parent city (top 10):`);
Object.entries(cityCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .forEach(([city, count]) => console.log(`  ${city}: ${count}`));

// ── Write output ───────────────────────────────────────────────
const outputPath = path.join(dataDir, 'us_zctas.json');
fs.writeFileSync(outputPath, JSON.stringify(zctas));
console.log(`\nWrote ${zctas.length} ZCTA records to ${outputPath}`);
console.log(`File size: ${(fs.statSync(outputPath).size / 1024).toFixed(0)} KB`);
