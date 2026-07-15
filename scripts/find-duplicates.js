const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, '..', '.next', 'server', 'pages');
const titles = {};
const descs = {};

function walk(dir, rel) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    const r = rel ? path.join(rel, e.name) : e.name;
    if (e.isDirectory()) walk(p, r);
    else if (e.name.endsWith('.html')) {
      const html = fs.readFileSync(p, 'utf8');
      const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1];
      const desc = (html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/) || [])[1];
      if (title) {
        titles[title] = titles[title] || [];
        titles[title].push(r);
      }
      if (desc) {
        descs[desc] = descs[desc] || [];
        descs[desc].push(r);
      }
    }
  }
}

walk(pagesDir, '');

const dupTitles = Object.entries(titles)
  .filter(([k, v]) => v.length > 1)
  .map(([k, v]) => ({ title: k, count: v.length, pages: v.slice(0, 10) }));

const dupDescs = Object.entries(descs)
  .filter(([k, v]) => v.length > 1)
  .map(([k, v]) => ({ desc: k, count: v.length, pages: v.slice(0, 10) }));

console.log(JSON.stringify({ duplicateTitles: dupTitles, duplicateDescriptions: dupDescs }, null, 2));
