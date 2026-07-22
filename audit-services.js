const { SERVICES } = require('./lib/cities.js');

console.log('=== EXISTING 10 SERVICES ===\n');
SERVICES.forEach((service, index) => {
  console.log(`${index + 1}. ${service.name}`);
  console.log(`   Slug: ${service.slug}`);
  console.log(`   Short Name: ${service.shortName}`);
  console.log(`   Description: ${service.description}`);
  console.log(`   Keywords: ${service.keywords.join(', ')}`);
  console.log();
});
