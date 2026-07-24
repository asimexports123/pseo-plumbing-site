// Build compact ZCTA search JSON for client-side search on /plumber-usa
// Format: [{ z: "10001", n: "New York", s: "NY", u: "new-york" }, ...]
// This is a compact representation for search only — not the full dataset.

const fs = require('fs');
const path = require('path');

const zctas = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'us_zctas.json'), 'utf8'));

const compact = zctas.map(z => ({
  z: z.zip,
  n: z.parentCity,
  s: z.stateCode,
  u: z.parentCitySlug,
}));

const outputPath = path.join(__dirname, '..', 'public', 'zcta-search.json');
fs.writeFileSync(outputPath, JSON.stringify(compact));

const sizeKB = (fs.statSync(outputPath).size / 1024).toFixed(0);
console.log(`Wrote ${compact.length} ZCTA search records to public/zcta-search.json (${sizeKB} KB)`);
