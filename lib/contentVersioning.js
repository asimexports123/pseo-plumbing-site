import { getToday } from './contentHash.js';

let cachedDate = null;

function getDate() {
  if (cachedDate) return cachedDate;

  // Build-time: read from public/content-dates.json via fs (synchronous)
  try {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(process.cwd(), 'public', 'content-dates.json');
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(raw);
      cachedDate = data.date || getToday();
      return cachedDate;
    }
  } catch (e) {
    // fs not available (Cloudflare Workers runtime) — fall through
  }

  // Runtime (Cloudflare Workers): use ASSETS binding to fetch static assets
  try {
    const { getCloudflareContext } = require('@opennextjs/cloudflare');
    const { env } = getCloudflareContext();
    if (env && env.ASSETS) {
      // Synchronous fetch not possible — return getToday() and let ISR handle it
      cachedDate = getToday();
      return cachedDate;
    }
  } catch (e) {
    // Not on Cloudflare Workers or binding not available
  }

  cachedDate = getToday();
  return cachedDate;
}

export function getPageDate(pageKey) {
  return getDate();
}
