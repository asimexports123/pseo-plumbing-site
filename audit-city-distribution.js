// Audit current city distribution by state and identify gaps
const { SEED_CITIES, STATES } = require('./lib/cities.js');

console.log('=== CURRENT CITY DISTRIBUTION BY STATE ===\n');

const citiesByState = {};
SEED_CITIES.forEach(city => {
  if (!citiesByState[city.stateCode]) {
    citiesByState[city.stateCode] = [];
  }
  citiesByState[city.stateCode].push(city.name);
});

// Sort by city count
const sortedStates = Object.entries(citiesByState).sort((a, b) => b[1].length - a[1].length);

sortedStates.forEach(([stateCode, cities]) => {
  const stateName = STATES.find(s => s.code === stateCode)?.name || stateCode;
  console.log(`${stateName} (${stateCode}): ${cities.length} cities`);
  cities.forEach(city => console.log(`  - ${city}`));
});

console.log('\n=== STATES WITH NO COVERAGE ===\n');
const coveredStates = new Set(Object.keys(citiesByState));
STATES.forEach(state => {
  if (!coveredStates.has(state.code)) {
    console.log(`${state.name} (${state.code}): 0 cities`);
  }
});

console.log('\n=== SUMMARY ===\n');
console.log(`Total cities: ${SEED_CITIES.length}`);
console.log(`Total states covered: ${Object.keys(citiesByState).length}/${STATES.length}`);
console.log(`States with no coverage: ${STATES.length - Object.keys(citiesByState).length}`);
