// Build-time precomputation script.
// Splits us_places.json and us_zctas.json into per-state shards
// and precomputes lookup indices and metadata.
//
// Usage: node scripts/precompute-shards.js
//
// Generates files in public/data/:
//   places_slug_state.json     — { slug: stateCode } for all places
//   places_state_{XX}.json     — per-state place arrays
//   zctas_state_{XX}.json      — per-state ZCTA arrays
//   places_meta.json           — totals + nationwide service counts
//   zctas_meta.json            — totals + zip service url count

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.cwd(), 'data');
const OUT_DIR = path.join(process.cwd(), 'public', 'data');

const SUPPORTED_STATE_CODES = new Set([
  'NY','CA','TX','FL','IL','PA','AZ','OH','NC','IN','WA','CO','TN','GA',
  'MI','VA','MD','WI','OR','NV','OK','NM','MO','NE','LA','MN','KY','MA',
  'DC','AL','AR','HI','ID','IA','KS','RI','UT','AK','CT','NJ','SD','DE',
  'MS','ND','MT','WY','SC',
]);

const SUMP_PUMP_QUALIFIED_STATE_CODES = new Set([
  'AK', 'CO', 'CT', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'ME',
  'MD', 'MA', 'MI', 'MN', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NY', 'ND', 'OH', 'OR', 'PA', 'RI', 'SD', 'UT', 'VT', 'VA',
  'WA', 'WV', 'WI', 'WY', 'DC', 'DE', 'TN', 'NC', 'OK', 'LA',
]);

const SVC_SLUGS = [
  'emergency', 'leak-repair', 'drain-cleaning', 'pipe-burst-repair',
  'water-heater-repair', 'sewer-line-repair', 'toilet-repair',
  'slab-leak-repair', 'water-line-repair', 'faucet-repair',
  'garbage-disposal-repair', 'water-softener-repair',
  'whole-house-repiping', 'main-water-shutoff-valve-repair',
  'sump-pump-repair',
];

const SERVICE_SLUGS_FOR_ZCTA = [
  'emergency', 'leak-repair', 'drain-cleaning', 'pipe-burst-repair',
  'water-heater-repair', 'sewer-line-repair', 'toilet-repair',
  'slab-leak-repair', 'water-line-repair', 'faucet-repair',
  'garbage-disposal-repair', 'water-softener-repair',
  'whole-house-repiping', 'main-water-shutoff-valve-repair',
  'sump-pump-repair',
];

function isZctaQualifiedForService(stateCode, serviceSlug) {
  if (serviceSlug === 'sump-pump-repair') {
    return SUMP_PUMP_QUALIFIED_STATE_CODES.has(stateCode);
  }
  return true;
}

function ensureOutDir() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }
}

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(fileName, data) {
  const filePath = path.join(OUT_DIR, fileName);
  fs.writeFileSync(filePath, JSON.stringify(data));
  const sizeKB = Math.round(fs.statSync(filePath).size / 1024);
  console.log(`  ${fileName} — ${sizeKB} KB`);
}

function precomputePlaces() {
  console.log('Processing us_places.json...');
  const places = loadJson(path.join(DATA_DIR, 'us_places.json'));
  console.log(`  Total places: ${places.length}`);

  // 1. Slug → stateCode index
  const slugState = {};
  places.forEach(p => { slugState[p.slug] = p.stateCode; });
  writeJson('places_slug_state.json', slugState);

  // 2. Per-state place arrays
  const byState = {};
  places.forEach(p => {
    if (!byState[p.stateCode]) byState[p.stateCode] = [];
    byState[p.stateCode].push(p);
  });
  for (const [stateCode, statePlaces] of Object.entries(byState)) {
    writeJson(`places_state_${stateCode}.json`, statePlaces);
  }

  // 3. Metadata
  const coveredStates = [...new Set(places.map(p => p.stateCode))].sort();
  const valid = places.filter(p => SUPPORTED_STATE_CODES.has(p.stateCode));
  const nationwideServiceCounts = {};
  SVC_SLUGS.forEach(slug => {
    if (slug === 'sump-pump-repair') {
      nationwideServiceCounts[slug] = valid.filter(p => SUMP_PUMP_QUALIFIED_STATE_CODES.has(p.stateCode)).length;
    } else {
      nationwideServiceCounts[slug] = valid.length;
    }
  });
  const placesMeta = {
    totalPlaces: places.length,
    coveredStates,
    nationwideServiceCounts,
  };
  writeJson('places_meta.json', placesMeta);
}

function precomputeZctas() {
  console.log('Processing us_zctas.json...');
  const zctas = loadJson(path.join(DATA_DIR, 'us_zctas.json'));
  console.log(`  Total ZCTAs: ${zctas.length}`);

  // 1. Per-state ZCTA arrays
  const byState = {};
  zctas.forEach(z => {
    if (!byState[z.stateCode]) byState[z.stateCode] = [];
    byState[z.stateCode].push(z);
  });
  for (const [stateCode, stateZctas] of Object.entries(byState)) {
    writeJson(`zctas_state_${stateCode}.json`, stateZctas);
  }

  // 2. Metadata
  const cityZctasSet = new Set();
  zctas.forEach(z => cityZctasSet.add(z.parentCitySlug));
  let totalZipServiceUrls = 0;
  zctas.forEach(z => {
    SERVICE_SLUGS_FOR_ZCTA.forEach(svc => {
      if (isZctaQualifiedForService(z.stateCode, svc)) totalZipServiceUrls++;
    });
  });
  const zctasMeta = {
    totalZctas: zctas.length,
    citiesWithZctasCount: cityZctasSet.size,
    totalZipServiceUrls,
  };
  writeJson('zctas_meta.json', zctasMeta);
}

function main() {
  console.log('Precomputing data shards...');
  ensureOutDir();
  precomputePlaces();
  precomputeZctas();
  console.log('Done.');
}

main();
