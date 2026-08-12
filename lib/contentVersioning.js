import { getToday } from './contentHash.js';

let cachedDates = null;

async function loadDates() {
  if (cachedDates) return cachedDates;

  // Build-time: read from public/content-dates.json via fs
  try {
    const fs = (await import('fs')).default;
    const path = (await import('path')).default;
    const filePath = path.join(process.cwd(), 'public', 'content-dates.json');
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      cachedDates = JSON.parse(raw);
      return cachedDates;
    }
  } catch (e) {
    // fs not available (Cloudflare Workers runtime) — fall through to fetch
  }

  // Runtime (Cloudflare Workers): use ASSETS binding to fetch static assets
  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    const { env } = await getCloudflareContext();
    if (env && env.ASSETS) {
      const res = await env.ASSETS.fetch(new Request('https://local/content-dates.json'));
      if (res.ok) {
        cachedDates = await res.json();
        return cachedDates;
      }
    }
  } catch (e) {
    // Not on Cloudflare Workers or binding not available
  }

  // Fallback: fetch from public domain
  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'https://yohomefix.com';
  try {
    const res = await fetch(`${domain}/content-dates.json`);
    if (res.ok) {
      cachedDates = await res.json();
      return cachedDates;
    }
  } catch (e) {
    // fetch failed — return empty object, getPageDate will fall back to today
  }

  cachedDates = {};
  return cachedDates;
}

export async function getPageDate(pageKey) {
  const dates = await loadDates();
  return dates[pageKey] || getToday();
}
