const { SEED_CITIES, getCityData } = require('./lib/cities.js');

// Get cities with different hardness levels
const citiesByHardness = SEED_CITIES.map(city => ({
  name: city.name,
  hardness: getCityData(city.name).hardnessPpm,
  utility: getCityData(city.name).waterUtility,
})).sort((a, b) => a.hardness - b.hardness);

console.log('=== CITIES BY WATER HARDNESS (ppm) ===\n');
citiesByHardness.forEach(city => {
  const tier = city.hardness < 25 ? 'very soft' : city.hardness < 100 ? 'soft' : city.hardness < 175 ? 'moderately hard' : city.hardness < 250 ? 'hard' : 'extremely hard';
  console.log(`${city.name}: ${city.hardness} mg/L (${tier}) - ${city.utility}`);
});

console.log('\n=== SELECTED CITIES FOR QUALITY CHECK (different hardness tiers) ===\n');
// Select one city from each hardness tier
const selectedCities = [
  citiesByHardness.find(c => c.hardness < 25) || citiesByHardness[0], // very soft
  citiesByHardness.find(c => c.hardness >= 25 && c.hardness < 100) || citiesByHardness[10], // soft
  citiesByHardness.find(c => c.hardness >= 100 && c.hardness < 175) || citiesByHardness[25], // moderately hard
  citiesByHardness.find(c => c.hardness >= 175 && c.hardness < 250) || citiesByHardness[50], // hard
  citiesByHardness.find(c => c.hardness >= 250) || citiesByHardness[74], // extremely hard
];

selectedCities.forEach(city => {
  const tier = city.hardness < 25 ? 'very soft' : city.hardness < 100 ? 'soft' : city.hardness < 175 ? 'moderately hard' : city.hardness < 250 ? 'hard' : 'extremely hard';
  console.log(`${city.name}: ${city.hardness} mg/L (${tier}) - ${city.utility}`);
});

console.log('\n=== WATER SOFTENER REPAIR URLs FOR QUALITY CHECK ===\n');
selectedCities.forEach(city => {
  const citySlug = city.name.toLowerCase().replace(/\s+/g, '-');
  console.log(`https://yohomefix.com/plumber-${citySlug}-water-softener-repair`);
});
