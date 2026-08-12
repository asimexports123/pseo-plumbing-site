import fs from 'fs';
import { getZctaByZip, isZctaQualifiedForService } from './lib/hyperlocalPlaces-server.js';
import { getCityBySlug } from './lib/cities-server.js';
import { SERVICES } from './lib/cities.js';
import { generatePageContent } from './lib/contentGenerator.js';

const ZCTA_SITEMAP_SERVICES = [
  'emergency',
  'leak-repair',
  'drain-cleaning',
  'water-heater-repair',
  'pipe-burst-repair',
];

const csv = fs.readFileSync('./gsc-coverage-2026-08-08/Table.csv', 'utf-8');
const lines = csv.trim().split(/\r?\n/).filter(Boolean);
const header = lines.shift();

const records = [];
const reasons = {};
const categories = { A: 0, B: 0, C: 0, D: 0 };

for (const line of lines) {
  const [url] = line.split(',');
  const path = new URL(url).pathname;
  const parts = path.split('/').filter(Boolean);
  const [type, citySlug, zip, service] = parts;

  const record = { url, path, citySlug, zip, service };

  const svc = SERVICES.find(s => s.slug === service);
  const zcta = getZctaByZip(zip);
  const knownCity = getCityBySlug(citySlug);

  if (!svc) {
    record.reason = 'unknown-service';
    record.category = 'B';
  } else if (!zcta) {
    record.reason = 'unknown-zip';
    record.category = 'B';
  } else if (!knownCity) {
    record.reason = 'unknown-city';
    record.category = 'B';
  } else if (zcta.parentCitySlug !== citySlug) {
    record.reason = 'wrong-city';
    const targetCity = zcta.parentCitySlug;
    const targetSvc = isZctaQualifiedForService(zcta, service) ? service : 'emergency';
    record.redirectTo = `/areas/${targetCity}/${zip}/${targetSvc}`;
    record.category = 'D';
  } else if (!isZctaQualifiedForService(zcta, service)) {
    record.reason = 'unqualified-service';
    record.redirectTo = `/areas/${citySlug}/${zip}/emergency`;
    record.category = 'D';
  } else {
    const cityName = knownCity.name;
    const stateCode = knownCity.stateCode || zcta.stateCode;
    try {
      generatePageContent(cityName, stateCode, svc);
      record.reason = 'valid';
      record.category = 'A';
    } catch (err) {
      record.reason = 'content-generation-failed';
      record.category = 'B';
      record.error = err.message;
    }
  }

  record.inCurrentSitemap = record.reason === 'valid' && ZCTA_SITEMAP_SERVICES.includes(service);

  records.push(record);
  reasons[record.reason] = (reasons[record.reason] || 0) + 1;
  categories[record.category] = (categories[record.category] || 0) + 1;
}

const report = {
  total: records.length,
  categories,
  reasons,
  urls: records,
};

fs.writeFileSync('./__audit_404s_result.json', JSON.stringify(report, null, 2));
console.log('Audit complete');
console.log('Total:', report.total);
console.log('Categories:', categories);
console.log('Reasons:', reasons);
