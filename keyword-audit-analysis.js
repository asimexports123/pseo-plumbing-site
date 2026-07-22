// Current 11 services analysis
const currentServices = [
  { slug: 'emergency', name: 'Emergency Plumbing', description: '24/7 emergency plumbing dispatch', keywords: ['emergency plumber', '24/7 plumber', 'urgent plumbing'] },
  { slug: 'leak-repair', name: 'Leak Repair', description: 'Fast pipe and faucet leak detection and repair', keywords: ['leak repair', 'pipe leak', 'water leak'] },
  { slug: 'drain-cleaning', name: 'Drain Cleaning', description: 'Professional drain cleaning and sewer clearing', keywords: ['drain cleaning', 'clogged drain', 'blocked drain'] },
  { slug: 'pipe-burst-repair', name: 'Pipe Burst Repair', description: 'Emergency burst and frozen pipe repair', keywords: ['burst pipe', 'broken pipe', 'frozen pipe'] },
  { slug: 'water-heater-repair', name: 'Water Heater Repair', description: 'Water heater repair, replacement, and installation', keywords: ['water heater repair', 'hot water heater', 'tankless'] },
  { slug: 'sewer-line-repair', name: 'Sewer Line Repair', description: 'Main sewer line repair and replacement', keywords: ['sewer line repair', 'sewer pipe replacement', 'main line repair'] },
  { slug: 'toilet-repair', name: 'Toilet Repair', description: 'Toilet repair and installation services', keywords: ['toilet repair', 'toilet installation', 'bathroom plumbing'] },
  { slug: 'slab-leak-repair', name: 'Slab Leak Repair', description: 'Slab leak detection and repair', keywords: ['slab leak', 'underground leak', 'concrete leak repair'] },
  { slug: 'water-line-repair', name: 'Water Line Repair', description: 'Water supply line repair and replacement', keywords: ['water line repair', 'main water line', 'supply line replacement'] },
  { slug: 'faucet-repair', name: 'Faucet Repair', description: 'Faucet repair and replacement services', keywords: ['faucet repair', 'faucet replacement', 'kitchen and bathroom faucets'] },
  { slug: 'garbage-disposal-repair', name: 'Garbage Disposal Repair', description: 'Garbage disposal repair, replacement, and installation', keywords: ['garbage disposal repair', 'disposal unit repair', 'kitchen disposal'] },
];

console.log('=== CURRENT SERVICE ARCHITECTURE ===\n');
currentServices.forEach((service, index) => {
  console.log(`${index + 1}. ${service.name} (${service.slug})`);
  console.log(`   Description: ${service.description}`);
  console.log(`   Keywords: ${service.keywords.join(', ')}`);
  console.log();
});

console.log('=== KEYWORD COVERAGE ANALYSIS ===\n');

// CORE LOCAL / EMERGENCY keywords
const coreKeywords = [
  'plumber',
  'plumber near me',
  'local plumber',
  'emergency plumber',
  'emergency plumber near me',
  '24 hour plumber',
  '24/7 plumber',
  'same day plumber'
];

console.log('CORE LOCAL / EMERGENCY KEYWORDS:');
coreKeywords.forEach(keyword => {
  const mappedService = currentServices.find(s => s.keywords.some(k => k.includes(keyword.split(' ')[0])) || s.description.toLowerCase().includes(keyword.toLowerCase()));
  console.log(`- ${keyword}: ${mappedService ? 'COVERED by ' + mappedService.name : 'NOT DIRECTLY COVERED - captured via city pages'}`);
});
console.log();

// EXISTING-SERVICE VARIANTS
const existingVariants = [
  'drain plumber near me',
  'water heater plumber near me',
  'plumber repair near me',
  'leak detection',
  'frozen pipe repair',
  'tankless water heater repair',
  'hydro jetting',
  'drain jetting',
  'sewer camera inspection'
];

console.log('EXISTING-SERVICE VARIANTS:');
existingVariants.forEach(keyword => {
  let mappedService = null;
  let coverage = 'NOT COVERED';
  
  if (keyword.includes('drain')) {
    mappedService = currentServices.find(s => s.slug === 'drain-cleaning');
    coverage = 'PARTIAL - drain-cleaning covers drain services';
  } else if (keyword.includes('water heater')) {
    mappedService = currentServices.find(s => s.slug === 'water-heater-repair');
    coverage = 'PARTIAL - water-heater-repair covers water heater services';
  } else if (keyword.includes('leak detection')) {
    mappedService = currentServices.find(s => s.slug === 'leak-repair');
    coverage = 'PARTIAL - leak-repair includes detection';
  } else if (keyword.includes('frozen pipe')) {
    mappedService = currentServices.find(s => s.slug === 'pipe-burst-repair');
    coverage = 'STRONG - pipe-burst-repair explicitly covers frozen pipes';
  } else if (keyword.includes('tankless')) {
    mappedService = currentServices.find(s => s.slug === 'water-heater-repair');
    coverage = 'PARTIAL - water-heater-repair includes tankless in keywords';
  } else if (keyword.includes('jetting')) {
    mappedService = currentServices.find(s => s.slug === 'drain-cleaning');
    coverage = 'WEAK - drain-cleaning mentions hydro-jetting in pricing but not prominently';
  } else if (keyword.includes('sewer camera')) {
    mappedService = currentServices.find(s => s.slug === 'sewer-line-repair');
    coverage = 'PARTIAL - sewer-line-repair includes camera inspection in pricing';
  }
  
  console.log(`- ${keyword}: ${coverage}`);
});
console.log();

// POTENTIAL NEW DISTINCT SERVICES
const potentialNewServices = [
  'sump pump repair',
  'septic tank pumping',
  'septic tank cleaning',
  'septic system repair',
  'well pump repair',
  'water softener repair',
  'gas line repair',
  'gas leak repair',
  'water heater installation',
  'water heater replacement'
];

console.log('POTENTIAL NEW DISTINCT SERVICES:');
potentialNewServices.forEach(service => {
  let overlap = 'NO OVERLAP';
  let geographic = 'UNIVERSAL';
  
  if (service.includes('sump pump')) {
    overlap = 'NO OVERLAP - basement/flood control not covered';
    geographic = 'SELECTIVE - flood-prone areas only';
  } else if (service.includes('septic')) {
    overlap = 'NO OVERLAP - septic systems not covered';
    geographic = 'SELECTIVE - rural/suburban areas only';
  } else if (service.includes('well pump')) {
    overlap = 'NO OVERLAP - well systems not covered';
    geographic = 'SELECTIVE - rural areas with well water only';
  } else if (service.includes('water softener')) {
    overlap = 'NO OVERLAP - water treatment not covered';
    geographic = 'UNIVERSAL - hard water areas benefit most';
  } else if (service.includes('gas')) {
    overlap = 'NO OVERLAP - gas systems not covered (plumbing is water-focused)';
    geographic = 'UNIVERSAL - gas plumbing is universal';
  } else if (service.includes('water heater installation') || service.includes('water heater replacement')) {
    overlap = 'HIGH OVERLAP - water-heater-repair already covers installation/replacement';
    geographic = 'N/A - should be merged into existing service';
  }
  
  console.log(`- ${service}: ${overlap}, Geographic: ${geographic}`);
});
