const { SEED_CITIES, CITY_DATA } = require('./lib/cities.js');

console.log('=== CITY DATA AUDIT ===\n');

// Extract all cities from CITY_DATA
const cityDataCities = Object.keys(CITY_DATA);
console.log(`1. Cities in CITY_DATA: ${cityDataCities.length}`);
console.log(cityDataCities.join(', '));
console.log();

// Extract cities from SEED_CITIES
const seedCities = SEED_CITIES.map(c => c.name);
console.log(`2. Cities in SEED_CITIES: ${seedCities.length}`);
console.log(seedCities.join(', '));
console.log();

// Identify unused CITY_DATA cities
const unusedCities = cityDataCities.filter(city => !seedCities.includes(city));
console.log(`3. Unused CITY_DATA cities: ${unusedCities.length}`);
console.log(unusedCities.join(', '));
console.log();

// Verify data completeness for unused cities
console.log('4. Data completeness for unused CITY_DATA cities:');
unusedCities.forEach(city => {
  const data = CITY_DATA[city];
  const requiredFields = ['neighborhoods', 'waterUtility', 'hardnessPpm', 'pipeEra', 'pipeMaterial', 'infraClass', 'winterRisk', 'avgWinterTempF', 'summerRiskNote', 'dominantFailure', 'sewerSystem', 'soilType', 'zipCodes', 'pop', 'climate', 'infraNarrative'];
  const missingFields = requiredFields.filter(field => !data[field] || data[field].length === 0);
  console.log(`   ${city}: ${missingFields.length === 0 ? '✓ COMPLETE' : '✗ MISSING: ' + missingFields.join(', ')}`);
});
console.log();

// Current page count
const currentCityCount = seedCities.length;
const serviceCount = 10;
const currentPageCount = currentCityCount * serviceCount;
console.log(`5. Current page count: ${currentCityCount} cities × ${serviceCount} services = ${currentPageCount} pages`);
