#!/usr/bin/env node
/**
 * Generates the clean CSV file for external distribution.
 * Output: dist/yohomefix-water-hardness-plumbing-risk-index.csv
 */

const fs = require('fs');
const path = require('path');
const { SEED_CITIES, CITY_DATA } = require('../lib/cities.js');

// Replicated from researchData.js (ESM import issue with raw Node)
function classifyHardness(ppm) {
  if (ppm <= 60) return 'Soft';
  if (ppm <= 120) return 'Moderately Hard';
  if (ppm <= 180) return 'Hard';
  return 'Very Hard';
}

function computeRiskScore({ infraClass, winterRisk, hardnessPpm }) {
  const infraScore = infraClass === 'aging' ? 3 : infraClass === 'mixed' ? 2 : 1;
  const winterScore = winterRisk === 'high' ? 3 : winterRisk === 'med' ? 2 : 1;
  const hardClass = classifyHardness(hardnessPpm);
  const hardScore = hardClass === 'Very Hard' ? 3 : hardClass === 'Hard' ? 2 : hardClass === 'Moderately Hard' ? 1 : 0;
  return infraScore + winterScore + hardScore + 1;
}

function classifyRisk(score) {
  if (score >= 8) return 'High';
  if (score >= 6) return 'Elevated';
  if (score >= 4) return 'Moderate';
  return 'Low';
}

const headers = [
  'City', 'State', 'State Name', 'Water Utility',
  'Hardness (mg/L CaCO3)', 'Hardness Class',
  'Infrastructure Class', 'Winter Risk', 'Avg Winter Temp (F)',
  'Climate', 'Pipe Material', 'Pipe Era',
  'Sewer System', 'Soil Type', 'Dominant Failure',
  'Risk Score', 'Risk Class'
];

const rows = [headers.join(',')];

SEED_CITIES.forEach(c => {
  const d = CITY_DATA[c.name];
  if (!d) return;
  const hc = classifyHardness(d.hardnessPpm);
  const rs = computeRiskScore({
    infraClass: d.infraClass,
    winterRisk: d.winterRisk,
    hardnessPpm: d.hardnessPpm,
  });
  const rc = classifyRisk(rs);
  rows.push([
    `"${c.name}"`,
    c.stateCode,
    `"${c.state}"`,
    `"${d.waterUtility}"`,
    d.hardnessPpm,
    `"${hc}"`,
    d.infraClass,
    d.winterRisk,
    d.avgWinterTempF,
    `"${d.climate}"`,
    `"${d.pipeMaterial}"`,
    `"${d.pipeEra}"`,
    `"${d.sewerSystem}"`,
    `"${d.soilType}"`,
    `"${d.dominantFailure}"`,
    rs,
    rc,
  ].join(','));
});

const outDir = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'yohomefix-water-hardness-plumbing-risk-index.csv');
fs.writeFileSync(outPath, rows.join('\n'), 'utf-8');
console.log(`CSV written: ${rows.length - 1} rows to ${outPath}`);
