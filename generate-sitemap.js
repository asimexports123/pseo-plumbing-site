const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wrvmxapophhbwycozyvr.supabase.co';
const supabaseKey = 'sb_publishable_ei3Q32sW-BfgH--oGMyb5g_fnKKLfIU';

const supabase = createClient(supabaseUrl, supabaseKey);
const domain = 'https://yohomefix.com';

async function generateSitemap() {
  const { data: cities, error } = await supabase
    .from('cities_data')
    .select('slug')
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching cities:', error);
    return;
  }

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  cities.forEach(city => {
    sitemap += `  <url>
    <loc>${domain}/${city.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  });

  sitemap += `</urlset>`;

  const fs = require('fs');
  fs.writeFileSync('public/sitemap.xml', sitemap);
  console.log('Sitemap generated successfully!');
}

generateSitemap();
