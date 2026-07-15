const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wrvmxapophhbwycozyvr.supabase.co';
const supabaseKey = 'sb_publishable_ei3Q32sW-BfgH--oGMyb5g_fnKKLfIU';

const supabase = createClient(supabaseUrl, supabaseKey);

// Sample cities (add more as needed)
const cities = [
  { city: 'Birmingham', state: 'AL' },
  { city: 'Huntsville', state: 'AL' },
  { city: 'Montgomery', state: 'AL' },
  { city: 'Mobile', state: 'AL' },
  { city: 'Phoenix', state: 'AZ' },
  { city: 'Tucson', state: 'AZ' },
  { city: 'Mesa', state: 'AZ' },
  { city: 'Los Angeles', state: 'CA' },
  { city: 'San Diego', state: 'CA' },
  { city: 'San Jose', state: 'CA' },
  { city: 'San Francisco', state: 'CA' },
  { city: 'Denver', state: 'CO' },
  { city: 'Colorado Springs', state: 'CO' },
  { city: 'Miami', state: 'FL' },
  { city: 'Tampa', state: 'FL' },
  { city: 'Orlando', state: 'FL' },
  { city: 'Jacksonville', state: 'FL' },
  { city: 'Atlanta', state: 'GA' },
  { city: 'Chicago', state: 'IL' },
  { city: 'Houston', state: 'TX' },
  { city: 'Dallas', state: 'TX' },
  { city: 'Austin', state: 'TX' },
  { city: 'San Antonio', state: 'TX' },
  { city: 'New York', state: 'NY' },
  { city: 'Philadelphia', state: 'PA' },
  { city: 'Seattle', state: 'WA' }
];

async function generateCities() {
  for (const cityData of cities) {
    const slug = `${cityData.city.toLowerCase().replace(/\s+/g, '-')}-${Math.floor(Math.random() * 1000)}`;
    
    const { error } = await supabase
      .from('cities_data')
      .insert({
        slug: slug,
        city_name: cityData.city,
        state: cityData.state,
        is_active: true
      });
    
    if (error) {
      console.error(`Error inserting ${cityData.city}:`, error);
    } else {
      console.log(`Inserted: ${cityData.city}, ${cityData.state}`);
    }
  }
  console.log('City generation complete!');
}

generateCities();
