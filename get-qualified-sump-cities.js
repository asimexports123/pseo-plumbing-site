const { SEED_CITIES, getCityData } = require('./lib/cities.js');

const cityEvaluations = SEED_CITIES.map(city => {
  const d = getCityData(city.name);
  let relevanceScore = 0;
  let reasons = [];
  
  const climate = d.climate.toLowerCase();
  if (climate.includes('humid') || climate.includes('wet') || climate.includes('rain')) {
    relevanceScore += 2;
    reasons.push('Humid/wet climate');
  }
  
  if (d.winterRisk === 'high') {
    relevanceScore += 2;
    reasons.push('High winter risk');
  }
  
  const soilType = d.soilType.toLowerCase();
  if (soilType.includes('clay') || soilType.includes('expansive') || soilType.includes('caliche')) {
    relevanceScore += 1;
    reasons.push('Poor drainage soil');
  }
  
  const knownBasementCities = [
    'Chicago', 'Detroit', 'Cleveland', 'Pittsburgh', 'Buffalo', 'Milwaukee',
    'Minneapolis', 'St. Paul', 'Indianapolis', 'Columbus', 'Cincinnati',
    'St. Louis', 'Kansas City', 'Omaha', 'Baltimore', 'Philadelphia',
    'Washington DC', 'Boston', 'Rochester', 'Louisville'
  ];
  
  if (knownBasementCities.some(bc => city.name.includes(bc))) {
    relevanceScore += 3;
    reasons.push('Basement prevalence');
  }
  
  const highWaterTableCities = [
    'New Orleans', 'Miami', 'Tampa', 'Virginia Beach', 'Norfolk', 'Chesapeake',
    'Houston', 'Jacksonville', 'Orlando', 'Sacramento'
  ];
  
  if (highWaterTableCities.some(hc => city.name.includes(hc))) {
    relevanceScore += 2;
    reasons.push('High water table');
  }
  
  const lowBasementCities = [
    'Phoenix', 'Tucson', 'Las Vegas', 'Albuquerque', 'El Paso',
    'Los Angeles', 'San Diego', 'San Francisco', 'Anaheim', 'Santa Ana',
    'Long Beach', 'Riverside', 'Bakersfield', 'Fresno', 'Stockton'
  ];
  
  if (lowBasementCities.some(lc => city.name.includes(lc))) {
    relevanceScore -= 3;
    reasons.push('Basements uncommon');
  }
  
  return {
    city: city.name,
    relevanceScore: Math.max(0, relevanceScore),
    reasons: reasons
  };
});

const qualifiedCities = cityEvaluations.filter(c => c.relevanceScore >= 5);

console.log('// Qualified cities for Sump Pump Repair (score >= 5):');
console.log('const SUMP_PUMP_QUALIFIED_CITIES = [');
qualifiedCities.forEach((city, index) => {
  const comma = index < qualifiedCities.length - 1 ? ',' : '';
  console.log(`  '${city.city}'${comma}`);
});
console.log('];');
console.log(`\n// Total: ${qualifiedCities.length} cities`);
