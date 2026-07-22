const { SEED_CITIES, getCityData } = require('./lib/cities.js');

// Evaluate each city for sump pump relevance based on existing CITY_DATA
const cityEvaluations = SEED_CITIES.map(city => {
  const d = getCityData(city.name);
  
  // Factors indicating sump pump relevance
  let relevanceScore = 0;
  let reasons = [];
  
  // Climate analysis
  const climate = d.climate.toLowerCase();
  if (climate.includes('humid') || climate.includes('wet') || climate.includes('rain')) {
    relevanceScore += 2;
    reasons.push('Humid/wet climate indicates higher groundwater');
  }
  
  // Winter risk indicates freeze-thaw cycles that create basement water issues
  if (d.winterRisk === 'high') {
    relevanceScore += 2;
    reasons.push('High winter risk indicates freeze-thaw basement water issues');
  }
  
  // Soil types that indicate poor drainage
  const soilType = d.soilType.toLowerCase();
  if (soilType.includes('clay') || soilType.includes('expansive') || soilType.includes('caliche')) {
    relevanceScore += 1;
    reasons.push('Soil type indicates drainage challenges');
  }
  
  // Geographic regions known for basement prevalence
  const basementProneRegions = ['Midwest', 'Northeast', 'Great Lakes', 'Mid-Atlantic'];
  const cityRegion = `${city.name} ${d.climate}`; // Use city name + climate as proxy
  basementProneRegions.forEach(region => {
    if (cityRegion.includes(region) || (d.climate.includes('cold') && d.winterRisk === 'high')) {
      relevanceScore += 2;
      reasons.push('Region known for basement construction');
    }
  });
  
  // Summer risk notes that might indicate storm water issues
  if (d.summerRiskNote && (d.summerRiskNote.toLowerCase().includes('rain') || d.summerRiskNote.toLowerCase().includes('storm'))) {
    relevanceScore += 1;
    reasons.push('Summer storm risk indicates water intrusion concerns');
  }
  
  // Cities with known basement prevalence based on geographic knowledge
  const knownBasementCities = [
    'Chicago', 'Detroit', 'Cleveland', 'Pittsburgh', 'Buffalo', 'Milwaukee',
    'Minneapolis', 'St. Paul', 'Indianapolis', 'Columbus', 'Cincinnati',
    'St. Louis', 'Kansas City', 'Omaha', 'Baltimore', 'Philadelphia',
    'Washington DC', 'Boston', 'Rochester', 'Syracuse', 'Albany'
  ];
  
  if (knownBasementCities.some(bc => city.name.includes(bc))) {
    relevanceScore += 3;
    reasons.push('Known basement prevalence in this city');
  }
  
  // Cities with high water table/flood risk based on climate and infrastructure
  const highWaterTableCities = [
    'New Orleans', 'Miami', 'Tampa', 'Virginia Beach', 'Norfolk', 'Chesapeake',
    'Houston', 'Jacksonville', 'Orlando', 'Sacramento', 'San Jose', 'Oakland'
  ];
  
  if (highWaterTableCities.some(hc => city.name.includes(hc))) {
    relevanceScore += 2;
    reasons.push('High water table or flood risk area');
  }
  
  // Exclude cities where basements are uncommon (desert Southwest, coastal California)
  const lowBasementCities = [
    'Phoenix', 'Tucson', 'Las Vegas', 'Albuquerque', 'El Paso',
    'Los Angeles', 'San Diego', 'San Francisco', 'Anaheim', 'Santa Ana',
    'Long Beach', 'Riverside', 'Bakersfield', 'Fresno', 'Stockton'
  ];
  
  if (lowBasementCities.some(lc => city.name.includes(lc))) {
    relevanceScore -= 3;
    reasons.push('Basements uncommon in this region');
  }
  
  return {
    city: city.name,
    state: d.state || 'N/A',
    relevanceScore: Math.max(0, relevanceScore),
    reasons: reasons,
    climate: d.climate,
    winterRisk: d.winterRisk,
    soilType: d.soilType
  };
});

// Sort by relevance score
cityEvaluations.sort((a, b) => b.relevanceScore - a.relevanceScore);

console.log('=== SUMP PUMP REPAIR RELEVANCE EVALUATION ===\n');
console.log('Scoring criteria:');
console.log('+3 points: Known basement prevalence');
console.log('+2 points: Humid/wet climate, high winter risk, basement-prone region, high water table');
console.log('+1 point: Poor drainage soil, summer storm risk');
console.log('-3 points: Basements uncommon in region');
console.log('');

// Set threshold for inclusion (cities with score >= 3 are considered relevant)
const threshold = 3;
const qualifiedCities = cityEvaluations.filter(c => c.relevanceScore >= threshold);

console.log(`QUALIFIED CITIES (${qualifiedCities.length} of 75):`);
qualifiedCities.forEach(city => {
  console.log(`${city.city}: ${city.relevanceScore} points - ${city.reasons.join(', ')}`);
});

console.log(`\nEXCLUDED CITIES (${75 - qualifiedCities.length} of 75):`);
cityEvaluations.filter(c => c.relevanceScore < threshold).forEach(city => {
  console.log(`${city.city}: ${city.relevanceScore} points - ${city.reasons.join(', ') || 'Low relevance'}`);
});

console.log(`\n=== SUMMARY ===`);
console.log(`Qualified cities for Sump Pump Repair: ${qualifiedCities.length}`);
console.log(`Excluded cities: ${75 - qualifiedCities.length}`);
console.log(`Total pages to create: ${qualifiedCities.length}`);
