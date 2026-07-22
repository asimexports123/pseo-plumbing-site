// Generate ranked expansion list based on population, search opportunity, and geographic gaps
const { SEED_CITIES, STATES } = require('./lib/cities.js');

// Top 50 US cities by population (2024 estimates) - excluding current coverage
const expansionCandidates = [
  // Major metros not covered
  { name: 'San Antonio', state: 'Texas', stateCode: 'TX', pop: '1.5M', region: 'South Central' }, // Already covered
  { name: 'San Diego', state: 'California', stateCode: 'CA', pop: '1.4M', region: 'West' }, // Already covered
  { name: 'Dallas', state: 'Texas', stateCode: 'TX', pop: '1.3M', region: 'South Central' }, // Already covered
  { name: 'San Jose', state: 'California', stateCode: 'CA', pop: '1.0M', region: 'West' }, // Already covered
  { name: 'Austin', state: 'Texas', stateCode: 'TX', pop: '975K', region: 'South Central' }, // Already covered
  { name: 'Jacksonville', state: 'Florida', stateCode: 'FL', pop: '975K', region: 'Southeast' }, // Already covered
  { name: 'Fort Worth', state: 'Texas', stateCode: 'TX', pop: '950K', region: 'South Central' }, // Already covered
  { name: 'Columbus', state: 'Ohio', stateCode: 'OH', pop: '910K', region: 'Midwest' }, // Already covered
  { name: 'Charlotte', state: 'North Carolina', stateCode: 'NC', pop: '905K', region: 'Southeast' }, // Already covered
  { name: 'San Francisco', state: 'California', stateCode: 'CA', pop: '810K', region: 'West' }, // Already covered
  { name: 'Indianapolis', state: 'Indiana', stateCode: 'IN', pop: '885K', region: 'Midwest' }, // Already covered
  { name: 'Seattle', state: 'Washington', stateCode: 'WA', pop: '750K', region: 'Pacific Northwest' }, // Already covered
  { name: 'Denver', state: 'Colorado', stateCode: 'CO', pop: '715K', region: 'Mountain West' }, // Already covered
  { name: 'Washington DC', state: 'District of Columbia', stateCode: 'DC', pop: '690K', region: 'Mid-Atlantic' }, // Already covered
  { name: 'Boston', state: 'Massachusetts', stateCode: 'MA', pop: '675K', region: 'Northeast' }, // Already covered
  { name: 'El Paso', state: 'Texas', stateCode: 'TX', pop: '680K', region: 'South Central' }, // Already covered
  { name: 'Nashville', state: 'Tennessee', stateCode: 'TN', pop: '690K', region: 'Southeast' }, // Already covered
  { name: 'Portland', state: 'Oregon', stateCode: 'OR', pop: '650K', region: 'Pacific Northwest' }, // Already covered
  { name: 'Las Vegas', state: 'Nevada', stateCode: 'NV', pop: '670K', region: 'Mountain West' }, // Already covered
  { name: 'Detroit', state: 'Michigan', stateCode: 'MI', pop: '620K', region: 'Midwest' }, // Already covered
  { name: 'Louisville', state: 'Kentucky', stateCode: 'KY', pop: '630K', region: 'Southeast' }, // Already covered
  { name: 'Baltimore', state: 'Maryland', stateCode: 'MD', pop: '575K', region: 'Mid-Atlantic' }, // Already covered
  { name: 'Milwaukee', state: 'Wisconsin', stateCode: 'WI', pop: '570K', region: 'Midwest' }, // Already covered
  { name: 'Albuquerque', state: 'New Mexico', stateCode: 'NM', pop: '565K', region: 'Mountain West' }, // Already covered
  { name: 'Tucson', state: 'Arizona', stateCode: 'AZ', pop: '550K', region: 'Mountain West' }, // Already covered
  { name: 'Fresno', state: 'California', stateCode: 'CA', pop: '545K', region: 'West' }, // Already covered
  { name: 'Sacramento', state: 'California', stateCode: 'CA', pop: '530K', region: 'West' }, // Already covered
  { name: 'Kansas City', state: 'Missouri', stateCode: 'MO', pop: '510K', region: 'Midwest' }, // Already covered
  { name: 'Mesa', state: 'Arizona', stateCode: 'AZ', pop: '510K', region: 'Mountain West' }, // Already covered
  { name: 'Atlanta', state: 'Georgia', stateCode: 'GA', pop: '500K', region: 'Southeast' }, // Already covered
  { name: 'Omaha', state: 'Nebraska', stateCode: 'NE', pop: '485K', region: 'Midwest' }, // Already covered
  { name: 'Raleigh', state: 'North Carolina', stateCode: 'NC', pop: '480K', region: 'Southeast' }, // Already covered
  { name: 'Miami', state: 'Florida', stateCode: 'FL', pop: '470K', region: 'Southeast' }, // Already covered
  { name: 'Long Beach', state: 'California', stateCode: 'CA', pop: '450K', region: 'West' }, // Already covered
  { name: 'Virginia Beach', state: 'Virginia', stateCode: 'VA', pop: '460K', region: 'Southeast' }, // Already covered
  { name: 'Oakland', state: 'California', stateCode: 'CA', pop: '440K', region: 'West' },
  { name: 'Minneapolis', state: 'Minnesota', stateCode: 'MN', pop: '430K', region: 'Midwest' }, // Already covered
  { name: 'Tulsa', state: 'Oklahoma', stateCode: 'OK', pop: '420K', region: 'South Central' },
  { name: 'Tampa', state: 'Florida', stateCode: 'FL', pop: '390K', region: 'Southeast' }, // Already covered
  { name: 'Arlington TX', state: 'Texas', stateCode: 'TX', pop: '395K', region: 'South Central' }, // Already covered
  { name: 'New Orleans', state: 'Louisiana', stateCode: 'LA', pop: '375K', region: 'Southeast' }, // Already covered
  { name: 'Wichita', state: 'Kansas', stateCode: 'KS', pop: '395K', region: 'Midwest' },
  { name: 'Cleveland', state: 'Ohio', stateCode: 'OH', pop: '365K', region: 'Midwest' }, // Already covered
  { name: 'Bakersfield', state: 'California', stateCode: 'CA', pop: '410K', region: 'West' }, // Already covered
  { name: 'Aurora', state: 'Colorado', stateCode: 'CO', pop: '390K', region: 'Mountain West' },
  { name: 'Anaheim', state: 'California', stateCode: 'CA', pop: '350K', region: 'West' }, // Already covered
  { name: 'Honolulu', state: 'Hawaii', stateCode: 'HI', pop: '345K', region: 'Pacific' },
  { name: 'Santa Ana', state: 'California', stateCode: 'CA', pop: '335K', region: 'West' }, // Already covered
  { name: 'Riverside', state: 'California', stateCode: 'CA', pop: '330K', region: 'West' }, // Already covered
  { name: 'Corpus Christi', state: 'Texas', stateCode: 'TX', pop: '320K', region: 'South Central' }, // Already covered
  { name: 'Lexington', state: 'Kentucky', stateCode: 'KY', pop: '325K', region: 'Southeast' },
  { name: 'Stockton', state: 'California', stateCode: 'CA', pop: '320K', region: 'West' }, // Already covered
  { name: 'St. Louis', state: 'Missouri', stateCode: 'MO', pop: '295K', region: 'Midwest' }, // Already covered
  { name: 'Saint Paul', state: 'Minnesota', stateCode: 'MN', pop: '295K', region: 'Midwest' }, // Already covered
  { name: 'Henderson', state: 'Nevada', stateCode: 'NV', pop: '320K', region: 'Mountain West' },
  { name: 'Pittsburgh', state: 'Pennsylvania', stateCode: 'PA', pop: '295K', region: 'Northeast' }, // Already covered
  { name: 'Cincinnati', state: 'Ohio', stateCode: 'OH', pop: '310K', region: 'Midwest' }, // Already covered
  { name: 'Anchorage', state: 'Alaska', stateCode: 'AK', pop: '290K', region: 'Pacific' },
  { name: 'Greensboro', state: 'North Carolina', stateCode: 'NC', pop: '300K', region: 'Southeast' }, // Already covered
  { name: 'Plano', state: 'Texas', stateCode: 'TX', pop: '285K', region: 'South Central' }, // Already covered
  { name: 'Newark', state: 'New Jersey', stateCode: 'NJ', pop: '280K', region: 'Northeast' }, // Already covered
  { name: 'Lincoln', state: 'Nebraska', stateCode: 'NE', pop: '290K', region: 'Midwest' },
  { name: 'Orlando', state: 'Florida', stateCode: 'FL', pop: '310K', region: 'Southeast' }, // Already covered
  { name: 'Irvine', state: 'California', stateCode: 'CA', pop: '315K', region: 'West' }, // Already covered
  { name: 'Toledo', state: 'Ohio', stateCode: 'OH', pop: '270K', region: 'Midwest' },
  { name: 'Jersey City', state: 'New Jersey', stateCode: 'NJ', pop: '285K', region: 'Northeast' },
  { name: 'Chula Vista', state: 'California', stateCode: 'CA', pop: '275K', region: 'West' },
  { name: 'Durham', state: 'North Carolina', stateCode: 'NC', pop: '285K', region: 'Southeast' }, // Already covered
  { name: 'Fort Wayne', state: 'Indiana', stateCode: 'IN', pop: '270K', region: 'Midwest' },
  { name: 'St. Petersburg', state: 'Florida', stateCode: 'FL', pop: '260K', region: 'Southeast' },
  { name: 'Laredo', state: 'Texas', stateCode: 'TX', pop: '265K', region: 'South Central' },
  { name: 'Buffalo', state: 'New York', stateCode: 'NY', pop: '275K', region: 'Northeast' }, // Already covered
  { name: 'Madison', state: 'Wisconsin', stateCode: 'WI', pop: '270K', region: 'Midwest' }, // Already covered
  { name: 'Lubbock', state: 'Texas', stateCode: 'TX', pop: '265K', region: 'South Central' },
  { name: 'Chandler', state: 'Arizona', stateCode: 'AZ', pop: '265K', region: 'Mountain West' }, // Already covered
  { name: 'Scottsdale', state: 'Arizona', stateCode: 'AZ', pop: '260K', region: 'Mountain West' },
  { name: 'Glendale', state: 'Arizona', stateCode: 'AZ', pop: '250K', region: 'Mountain West' },
  { name: 'Reno', state: 'Nevada', stateCode: 'NV', pop: '270K', region: 'Mountain West' },
  { name: 'Norfolk', state: 'Virginia', stateCode: 'VA', pop: '235K', region: 'Southeast' }, // Already covered
  { name: 'Winston-Salem', state: 'North Carolina', stateCode: 'NC', pop: '250K', region: 'Southeast' },
  { name: 'North Las Vegas', state: 'Nevada', stateCode: 'NV', pop: '265K', region: 'Mountain West' },
  { name: 'Gilbert', state: 'Arizona', stateCode: 'AZ', pop: '265K', region: 'Mountain West' }, // Already covered
  { name: 'Chesapeake', state: 'Virginia', stateCode: 'VA', pop: '250K', region: 'Southeast' }, // Already covered
  { name: 'Irving', state: 'Texas', stateCode: 'TX', pop: '255K', region: 'South Central' },
  { name: 'Hialeah', state: 'Florida', stateCode: 'FL', pop: '220K', region: 'Southeast' },
  { name: 'Garland', state: 'Texas', stateCode: 'TX', pop: '245K', region: 'South Central' },
  { name: 'Fremont', state: 'California', stateCode: 'CA', pop: '240K', region: 'West' },
  { name: 'Richmond', state: 'Virginia', stateCode: 'VA', pop: '230K', region: 'Southeast' }, // Already covered
  { name: 'Boise', state: 'Idaho', stateCode: 'ID', pop: '240K', region: 'Mountain West' },
  { name: 'Baton Rouge', state: 'Louisiana', stateCode: 'LA', pop: '225K', region: 'Southeast' }, // Already covered
  { name: 'Des Moines', state: 'Iowa', stateCode: 'IA', pop: '215K', region: 'Midwest' },
  { name: 'Spokane', state: 'Washington', stateCode: 'WA', pop: '230K', region: 'Pacific Northwest' },
  { name: 'San Bernardino', state: 'California', stateCode: 'CA', pop: '220K', region: 'West' },
  { name: 'Modesto', state: 'California', stateCode: 'CA', pop: '215K', region: 'West' },
  { name: 'Tacoma', state: 'Washington', stateCode: 'WA', pop: '220K', region: 'Pacific Northwest' },
  { name: 'Fontana', state: 'California', stateCode: 'CA', pop: '210K', region: 'West' },
  { name: 'Santa Clarita', state: 'California', stateCode: 'CA', pop: '225K', region: 'West' },
  { name: 'Birmingham', state: 'Alabama', stateCode: 'AL', pop: '200K', region: 'Southeast' },
  { name: 'Oxnard', state: 'California', stateCode: 'CA', pop: '205K', region: 'West' },
  { name: 'Fayetteville', state: 'North Carolina', stateCode: 'NC', pop: '210K', region: 'Southeast' },
  { name: 'Rochester', state: 'New York', stateCode: 'NY', pop: '205K', region: 'Northeast' }, // Already covered
  { name: 'Moreno Valley', state: 'California', stateCode: 'CA', pop: '210K', region: 'West' },
  { name: 'Glendale', state: 'Arizona', stateCode: 'AZ', pop: '250K', region: 'Mountain West' },
  { name: 'Huntington Beach', state: 'California', stateCode: 'CA', pop: '200K', region: 'West' },
  { name: 'Salt Lake City', state: 'Utah', stateCode: 'UT', pop: '200K', region: 'Mountain West' },
  { name: 'Grand Rapids', state: 'Michigan', stateCode: 'MI', pop: '200K', region: 'Midwest' },
  { name: 'Amarillo', state: 'Texas', stateCode: 'TX', pop: '205K', region: 'South Central' },
  { name: 'Yonkers', state: 'New York', stateCode: 'NY', pop: '205K', region: 'Northeast' },
  { name: 'Montgomery', state: 'Alabama', stateCode: 'AL', pop: '200K', region: 'Southeast' },
  { name: 'Akron', state: 'Ohio', stateCode: 'OH', pop: '195K', region: 'Midwest' },
  { name: 'Little Rock', state: 'Arkansas', stateCode: 'AR', pop: '205K', region: 'South Central' },
  { name: 'Huntsville', state: 'Alabama', stateCode: 'AL', pop: '220K', region: 'Southeast' },
  { name: 'Augusta', state: 'Georgia', stateCode: 'GA', pop: '200K', region: 'Southeast' },
  { name: 'Port St. Lucie', state: 'Florida', stateCode: 'FL', pop: '205K', region: 'Southeast' },
  { name: 'Grand Prairie', state: 'Texas', stateCode: 'TX', pop: '200K', region: 'South Central' },
  { name: 'Columbus', state: 'Georgia', stateCode: 'GA', pop: '210K', region: 'Southeast' },
  { name: 'Tallahassee', state: 'Florida', stateCode: 'FL', pop: '200K', region: 'Southeast' },
  { name: 'Overland Park', state: 'Kansas', stateCode: 'KS', pop: '195K', region: 'Midwest' },
  { name: 'Tempe', state: 'Arizona', stateCode: 'AZ', pop: '190K', region: 'Mountain West' },
  { name: 'McKinney', state: 'Texas', stateCode: 'TX', pop: '200K', region: 'South Central' },
  { name: 'Mobile', state: 'Alabama', stateCode: 'AL', pop: '185K', region: 'Southeast' },
  { name: 'Cape Coral', state: 'Florida', stateCode: 'FL', pop: '200K', region: 'Southeast' },
  { name: 'Shreveport', state: 'Louisiana', stateCode: 'LA', pop: '185K', region: 'Southeast' },
  { name: 'Frisco', state: 'Texas', stateCode: 'TX', pop: '210K', region: 'South Central' },
  { name: 'Knoxville', state: 'Tennessee', stateCode: 'TN', pop: '195K', region: 'Southeast' },
  { name: 'Worcester', state: 'Massachusetts', stateCode: 'MA', pop: '185K', region: 'Northeast' },
  { name: 'Brownsville', state: 'Texas', stateCode: 'TX', pop: '190K', region: 'South Central' },
  { name: 'Vancouver', state: 'Washington', stateCode: 'WA', pop: '190K', region: 'Pacific Northwest' },
  { name: 'Fort Lauderdale', state: 'Florida', stateCode: 'FL', pop: '185K', region: 'Southeast' },
  { name: 'Sioux Falls', state: 'South Dakota', stateCode: 'SD', pop: '195K', region: 'Midwest' },
  { name: 'Ontario', state: 'California', stateCode: 'CA', pop: '180K', region: 'West' },
  { name: 'Chattanooga', state: 'Tennessee', stateCode: 'TN', pop: '185K', region: 'Southeast' },
  { name: 'Providence', state: 'Rhode Island', stateCode: 'RI', pop: '190K', region: 'Northeast' },
  { name: 'Newport News', state: 'Virginia', stateCode: 'VA', pop: '180K', region: 'Southeast' },
  { name: 'Rancho Cucamonga', state: 'California', stateCode: 'CA', pop: '180K', region: 'West' },
  { name: 'Santa Rosa', state: 'California', stateCode: 'CA', pop: '180K', region: 'West' },
  { name: 'Oceanside', state: 'California', stateCode: 'CA', pop: '175K', region: 'West' },
  { name: 'Salem', state: 'Oregon', stateCode: 'OR', pop: '180K', region: 'Pacific Northwest' },
  { name: 'Elk Grove', state: 'California', stateCode: 'CA', pop: '180K', region: 'West' },
  { name: 'Garden Grove', state: 'California', stateCode: 'CA', pop: '175K', region: 'West' },
  { name: 'Pembroke Pines', state: 'Florida', stateCode: 'FL', pop: '175K', region: 'Southeast' },
  { name: 'Peoria', state: 'Arizona', stateCode: 'AZ', pop: '175K', region: 'Mountain West' },
  { name: 'Eugene', state: 'Oregon', stateCode: 'OR', pop: '175K', region: 'Pacific Northwest' },
  { name: 'Corona', state: 'California', stateCode: 'CA', pop: '170K', region: 'West' },
  { name: 'Cary', state: 'North Carolina', stateCode: 'NC', pop: '180K', region: 'Southeast' },
  { name: 'Springfield', state: 'Massachusetts', stateCode: 'MA', pop: '155K', region: 'Northeast' },
  { name: 'Fort Collins', state: 'Colorado', stateCode: 'CO', pop: '170K', region: 'Mountain West' },
  { name: 'Jackson', state: 'Mississippi', stateCode: 'MS', pop: '150K', region: 'Southeast' },
  { name: 'Alexandria', state: 'Virginia', stateCode: 'VA', pop: '160K', region: 'Southeast' },
  { name: 'Hayward', state: 'California', stateCode: 'CA', pop: '165K', region: 'West' },
  { name: 'Lancaster', state: 'California', stateCode: 'CA', pop: '165K', region: 'West' },
  { name: 'Lakewood', state: 'Colorado', stateCode: 'CO', pop: '160K', region: 'Mountain West' },
  { name: 'Clarksville', state: 'Tennessee', stateCode: 'TN', pop: '170K', region: 'Southeast' },
  { name: 'Palmdale', state: 'California', stateCode: 'CA', pop: '165K', region: 'West' },
  { name: 'Salinas', state: 'California', stateCode: 'CA', pop: '160K', region: 'West' },
  { name: 'Hollywood', state: 'Florida', stateCode: 'FL', pop: '155K', region: 'Southeast' },
  { name: 'Pasadena', state: 'Texas', stateCode: 'TX', pop: '155K', region: 'South Central' },
  { name: 'Sunnyvale', state: 'California', stateCode: 'CA', pop: '160K', region: 'West' },
  { name: 'Macon', state: 'Georgia', stateCode: 'GA', pop: '155K', region: 'Southeast' },
  { name: 'Kansas City', state: 'Kansas', stateCode: 'KS', pop: '155K', region: 'Midwest' },
  { name: 'Pomona', state: 'California', stateCode: 'CA', pop: '150K', region: 'West' },
  { name: 'Escondido', state: 'California', stateCode: 'CA', pop: '155K', region: 'West' },
  { name: 'Killeen', state: 'Texas', stateCode: 'TX', pop: '155K', region: 'South Central' },
  { name: 'Naples', state: 'Florida', stateCode: 'FL', pop: '150K', region: 'Southeast' },
  { name: 'Joliet', state: 'Illinois', stateCode: 'IL', pop: '150K', region: 'Midwest' },
  { name: 'Bellevue', state: 'Washington', stateCode: 'WA', pop: '150K', region: 'Pacific Northwest' },
  { name: 'Rockford', state: 'Illinois', stateCode: 'IL', pop: '145K', region: 'Midwest' },
  { name: 'Savannah', state: 'Georgia', stateCode: 'GA', pop: '150K', region: 'Southeast' },
  { name: 'Paterson', state: 'New Jersey', stateCode: 'NJ', pop: '160K', region: 'Northeast' },
  { name: 'Torrance', state: 'California', stateCode: 'CA', pop: '150K', region: 'West' },
  { name: 'Bridgeport', state: 'Connecticut', stateCode: 'CT', pop: '150K', region: 'Northeast' },
  { name: 'McAllen', state: 'Texas', stateCode: 'TX', pop: '145K', region: 'South Central' },
  { name: 'Mesquite', state: 'Texas', stateCode: 'TX', pop: '150K', region: 'South Central' },
  { name: 'Syracuse', state: 'New York', stateCode: 'NY', pop: '145K', region: 'Northeast' },
  { name: 'Midland', state: 'Texas', stateCode: 'TX', pop: '135K', region: 'South Central' },
  { name: 'Pasadena', state: 'California', stateCode: 'CA', pop: '145K', region: 'West' },
  { name: 'Dayton', state: 'Ohio', stateCode: 'OH', pop: '135K', region: 'Midwest' },
  { name: 'Orange', state: 'California', stateCode: 'CA', pop: '140K', region: 'West' },
  { name: 'Miramar', state: 'Florida', stateCode: 'FL', pop: '140K', region: 'Southeast' },
  { name: 'Fullerton', state: 'California', stateCode: 'CA', pop: '140K', region: 'West' },
  { name: 'Odessa', state: 'Texas', stateCode: 'TX', pop: '130K', region: 'South Central' },
  { name: 'Thornton', state: 'Colorado', stateCode: 'CO', pop: '140K', region: 'Mountain West' },
  { name: 'Gainesville', state: 'Florida', stateCode: 'FL', pop: '145K', region: 'Southeast' },
  { name: 'Daly City', state: 'California', stateCode: 'CA', pop: '135K', region: 'West' },
  { name: 'Warren', state: 'Michigan', stateCode: 'MI', pop: '135K', region: 'Midwest' },
  { name: 'Cedar Rapids', state: 'Iowa', stateCode: 'IA', pop: '140K', region: 'Midwest' },
  { name: 'Elizabeth', state: 'New Jersey', stateCode: 'NJ', pop: '135K', region: 'Northeast' },
];

// Filter out already covered cities
const coveredCities = new Set(SEED_CITIES.map(c => c.name.toLowerCase()));
const uncoveredCandidates = expansionCandidates.filter(c => !coveredCities.has(c.name.toLowerCase()));

console.log('=== EXPANSION CANDIDATES (NOT YET COVERED) ===\n');
uncoveredCandidates.slice(0, 50).forEach((city, i) => {
  console.log(`${i + 1}. ${city.name}, ${city.state} (${city.stateCode}) - Pop: ${city.pop} - Region: ${city.region}`);
});

console.log(`\nTotal expansion candidates: ${uncoveredCandidates.length}`);
