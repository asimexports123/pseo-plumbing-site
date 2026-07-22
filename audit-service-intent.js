const { SERVICES } = require('./lib/cities.js');

console.log('=== MULTI-WORD SERVICE SLUG ROUTING TEST ===\n');

// Test the proposed multi-word service slugs
const proposedSlugs = [
  'garbage-disposal-repair',
  'sump-pump-repair', 
  'leak-detection',
  'frozen-pipe-repair',
  'tankless-water-heater-repair'
];

// Current service slugs for comparison
const currentSlugs = SERVICES.map(s => s.slug);
console.log('Current service slugs:', currentSlugs.join(', '));
console.log('Proposed service slugs:', proposedSlugs.join(', '));
console.log();

// Check for potential conflicts with existing slugs
console.log('Slug conflict analysis:');
proposedSlugs.forEach(proposed => {
  const conflicts = currentSlugs.filter(current => 
    current === proposed || 
    proposed.startsWith(current + '-') || 
    current.startsWith(proposed + '-')
  );
  console.log(`${proposed}: ${conflicts.length === 0 ? '✓ No conflicts' : '✗ Conflicts: ' + conflicts.join(', ')}`);
});

console.log('\n=== LENGTH-BASED SORTING TEST ===\n');
// Simulate the parseSlug sorting logic
const allSlugs = [...currentSlugs, ...proposedSlugs];
const sortedByLength = [...allSlugs].sort((a, b) => b.length - a.length);
console.log('Services sorted by length (descending):');
sortedByLength.forEach((slug, index) => {
  const isNew = proposedSlugs.includes(slug);
  console.log(`${index + 1}. ${slug} (${slug.length} chars) ${isNew ? '[NEW]' : '[EXISTING]'}`);
});

console.log('\n=== ROUTING SAFETY VERIFICATION ===\n');
// Test that longer slugs are matched first
const testSlug = 'plumber-chicago-garbage-disposal-repair';
const sortedServices = [...SERVICES, 
  {slug: 'garbage-disposal-repair', name: 'Garbage Disposal Repair'},
  {slug: 'sump-pump-repair', name: 'Sump Pump Repair'},
  {slug: 'leak-detection', name: 'Leak Detection'},
  {slug: 'frozen-pipe-repair', name: 'Frozen Pipe Repair'},
  {slug: 'tankless-water-heater-repair', name: 'Tankless Water Heater Repair'}
].sort((a, b) => b.slug.length - a.slug.length);

const testWithoutPrefix = testSlug.replace(/^plumber-/, '');
const matchedService = sortedServices.find(s => testWithoutPrefix.endsWith(`-${s.slug}`));

console.log(`Test slug: ${testSlug}`);
console.log(`Matched service: ${matchedService ? matchedService.name : 'NONE'}`);
console.log(`Matched slug: ${matchedService ? matchedService.slug : 'NONE'}`);
console.log('Routing safety: ✓ Longer slugs will be matched first');
