const { SEED_CITIES, cityToSlug } = require('./lib/cities.js');

// Current cities
const currentCities = SEED_CITIES.map(c => c.name);

// Highest-value US cities not currently active (based on population, economic activity, plumbing demand)
const expansionCandidates = [
  'San Antonio', // Already in current
  'San Diego', // Already in current
  'Dallas', // Already in current
  'San Jose', // Already in current
  'Austin', // Already in current
  'Jacksonville', // Already in current
  'Fort Worth', // Already in current
  'Columbus', // Already in current
  'Charlotte', // Already in current
  'Indianapolis', // Already in current
  'San Francisco', // Already in current
  'Seattle', // Already in current
  'Denver', // Already in current
  'El Paso', // Already in current
  'Memphis', // Already in current
  'Louisville', // Already in current
  'Baltimore', // Already in current
  'Milwaukee', // Already in current
  'Portland', // Already in current
  'Las Vegas', // Already in current
  'Oklahoma City', // Already in current
  'Albuquerque', // Already in current
  'Tucson', // Already in current
  'Atlanta', // Already in current
  'Kansas City', // Already in current
  'Omaha', // Already in current
  'Raleigh', // Already in current
  'Minneapolis', // Already in current
  'Virginia Beach', // Already in current
  'New Orleans', // Already in current
  'Tampa', // Already in current
  'St. Louis', // Already in current
  'Richmond', // Already in current
  'Sacramento', // Already in current
  'Mesa', // Already in current
  'Fresno', // Already in current
  'Long Beach', // Already in current
  'Colorado Springs', // Already in current
  'Cleveland', // Already in current
  'Pittsburgh', // Already in current
  'Cincinnati', // Already in current
  'Detroit', // Already in current
  'St. Paul', // Already in current
  'Nashville', // Already in current
  'Boston', // Already in current
  'Washington DC', // Already in current
  'Miami', // Already in current
  'Orlando', // Already in current
  'Anaheim', // Already in current
  'Santa Ana', // Already in current
  'Riverside', // Already in current
  'Bakersfield', // Already in current
  'Stockton', // Already in current
  'Newark', // Already in current
  'Buffalo', // Already in current
  'Rochester', // Already in current
  'Arlington TX', // Already in current
  'Plano', // Already in current
  'Corpus Christi', // Already in current
  'Durham', // Already in current
  'Greensboro', // Already in current
  'Chesapeake', // Already in current
  'Norfolk', // Already in current
  'Baton Rouge', // Already in current
  'Madison', // Already in current
  'Arlington VA', // Already in current
  'Irvine', // Already in current
  'Chandler', // Already in current
  'Gilbert', // Already in current
];

// Top 25 US cities by population not currently in the system
const top25ExpansionCities = [
  'Fort Worth', // Already present
  'Columbus', // Already present
  'Charlotte', // Already present
  'Indianapolis', // Already present
  'San Francisco', // Already present
  'Seattle', // Already present
  'Denver', // Already present
  'El Paso', // Already present
  'Memphis', // Already present
  'Louisville', // Already present
  'Baltimore', // Already present
  'Milwaukee', // Already present
  'Portland', // Already present
  'Las Vegas', // Already present
  'Oklahoma City', // Already present
  'Albuquerque', // Already present
  'Tucson', // Already present
  'Atlanta', // Already present
  'Kansas City', // Already present
  'Omaha', // Already present
  'Raleigh', // Already present
  'Minneapolis', // Already present
  'Virginia Beach', // Already present
  'New Orleans', // Already present
  'Tampa', // Already present
  'St. Louis', // Already present
];

// Let me identify the actual top 25 US cities by population that are NOT currently in the system
const majorUSCities = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia',
  'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville',
  'Fort Worth', 'Columbus', 'Charlotte', 'Indianapolis', 'San Francisco', 'Seattle',
  'Denver', 'El Paso', 'Detroit', 'Washington DC', 'Boston', 'Nashville', 'Portland',
  'Las Vegas', 'Baltimore', 'Louisville', 'Milwaukee', 'Albuquerque', 'Tucson',
  'Fresno', 'Sacramento', 'Mesa', 'Kansas City', 'Atlanta', 'Omaha', 'Colorado Springs',
  'Raleigh', 'Miami', 'Long Beach', 'Virginia Beach', 'Oakland', 'Minneapolis',
  'Tulsa', 'Arlington TX', 'Tampa', 'New Orleans', 'Cleveland', 'Wichita',
  'Bakersfield', 'Aurora', 'Anaheim', 'Honolulu', 'Santa Ana', 'Riverside',
  'Corpus Christi', 'Lexington', 'Stockton', 'St. Louis', 'Saint Paul', 'Henderson',
  'Pittsburgh', 'Cincinnati', 'Anchorage', 'Greensboro', 'Plano', 'Newark',
  'Lincoln', 'Orlando', 'Irvine', 'Toledo', 'Jersey City', 'Chandler',
  'Lubbock', 'Durham', 'Madison', 'Winston-Salem', 'Buffalo', 'Gilbert',
  'Chesapeake', 'Glendale', 'St. Petersburg', 'Laredo', 'Hialeah', 'North Las Vegas',
  'Rochester', 'Arlington VA', 'Irving', 'Norfolk', 'Baton Rouge'
];

const missingCities = majorUSCities.filter(city => !currentCities.includes(city));

console.log('=== EXPANSION OPPORTUNITIES ===\n');
console.log(`Current cities: ${currentCities.length}`);
console.log(`Major US cities not in system: ${missingCities.length}`);
console.log('\nTop 25 expansion candidates:');
missingCities.slice(0, 25).forEach((city, index) => {
  console.log(`${index + 1}. ${city} (slug: ${cityToSlug(city)})`);
});

// Check for slug collisions
console.log('\n=== SLUG COLLISION CHECK ===\n');
const currentSlugs = currentCities.map(c => cityToSlug(c));
const expansionSlugs = missingCities.slice(0, 25).map(c => cityToSlug(c));
const collisions = expansionSlugs.filter(slug => currentSlugs.includes(slug));
console.log(`Slug collisions: ${collisions.length}`);
if (collisions.length > 0) {
  console.log('Colliding slugs:', collisions.join(', '));
} else {
  console.log('No slug collisions detected');
}
