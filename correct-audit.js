// Correct audit to fix factual contradictions
const { SEED_CITIES, STATES, SUMP_PUMP_QUALIFIED_CITIES } = require('./lib/cities.js');

console.log('=== CORRECTED CURRENT STATE COVERAGE ===\n');

const citiesByState = {};
SEED_CITIES.forEach(city => {
  if (!citiesByState[city.stateCode]) {
    citiesByState[city.stateCode] = [];
  }
  citiesByState[city.stateCode].push(city.name);
});

const coveredStates = Object.keys(citiesByState).sort();
const uncoveredStates = STATES.filter(s => !coveredStates.includes(s.code));

console.log(`Total cities: ${SEED_CITIES.length}`);
console.log(`Total states covered: ${coveredStates.length}`);
console.log(`Total states in STATES array: ${STATES.length}`);
console.log(`States with no coverage: ${uncoveredStates.length}\n`);

console.log('=== STATES WITH NO COVERAGE ===\n');
uncoveredStates.forEach(state => {
  console.log(`${state.name} (${state.code})`);
});

console.log('\n=== CURRENT PAGE COUNT CALCULATION ===\n');
const totalServices = 12; // Universal services
const selectiveServiceCount = 1; // Sump Pump Repair
const qualifiedForSumpPump = SEED_CITIES.filter(c => SUMP_PUMP_QUALIFIED_CITIES.includes(c.name)).length;

console.log(`Universal services: ${totalServices}`);
console.log(`Selective services: ${selectiveServiceCount} (Sump Pump Repair)`);
console.log(`Cities qualified for Sump Pump: ${qualifiedForSumpPump}`);
console.log(`Cities not qualified for Sump Pump: ${SEED_CITIES.length - qualifiedForSumpPump}`);

const universalPages = SEED_CITIES.length * totalServices;
const selectivePages = qualifiedForSumpPump * selectiveServiceCount;
const totalCityServicePages = universalPages + selectivePages;

console.log(`\nUniversal service pages: ${universalPages} (${SEED_CITIES.length} × ${totalServices})`);
console.log(`Selective service pages: ${selectivePages} (${qualifiedForSumpPump} × ${selectiveServiceCount})`);
console.log(`Total city × service pages: ${totalCityServicePages}`);
