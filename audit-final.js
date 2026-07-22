const { SEED_CITIES, SERVICES } = require('./lib/cities.js');

console.log('=== EXPANSION CALCULATIONS ===\n');

// Current state
const currentCityCount = SEED_CITIES.length;
const serviceCount = SERVICES.length;
const currentPageCount = currentCityCount * serviceCount;

console.log(`Current state:`);
console.log(`- Cities: ${currentCityCount}`);
console.log(`- Services: ${serviceCount}`);
console.log(`- Pages: ${currentPageCount}`);
console.log();

// Expansion scenarios
const expansionCities = 20; // Only 20 major US cities available
const expansionCityCount = currentCityCount + expansionCities;
const expansionPageCount = expansionCityCount * serviceCount;

console.log(`Expansion scenario (adding ${expansionCities} cities):`);
console.log(`- Cities: ${expansionCityCount}`);
console.log(`- Services: ${serviceCount}`);
console.log(`- Pages: ${expansionPageCount}`);
console.log(`- New pages: ${expansionPageCount - currentPageCount}`);
console.log();

// Growth percentage
const growthPercentage = ((expansionPageCount - currentPageCount) / currentPageCount * 100).toFixed(1);
console.log(`Growth: ${growthPercentage}% increase in page count`);
