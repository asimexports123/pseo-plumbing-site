// ============================================================
// CRAWL ARCHITECTURE HELPERS
// Shared utilities for internal linking and HTML crawl hubs.
// No sitemap logic or URL changes — pure linking helpers.
// ============================================================

import { STATES, SEED_CITIES, SERVICES, cityToSlug, buildSlug, isCityQualifiedForService } from './cities';
import { getPlacesByState } from './nationwidePlaces';

const DEFAULT_PAGE_SIZE = 100;

export function getStateInfo(stateCode) {
  return STATES.find(s => s.code === stateCode) || STATES.find(s => s.slug === stateCode) || null;
}

export function getSeedCitiesForState(stateCode) {
  return SEED_CITIES.filter(c => c.stateCode === stateCode);
}

export function getAdditionalPlacesForState(stateCode) {
  const seedNames = new Set(
    SEED_CITIES.filter(c => c.stateCode === stateCode).map(c => c.name)
  );
  return getPlacesByState(stateCode)
    .filter(p => !seedNames.has(p.name))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getPaginatedAdditionalPlaces(stateCode, page = 1, pageSize = DEFAULT_PAGE_SIZE) {
  const all = getAdditionalPlacesForState(stateCode);
  const start = (page - 1) * pageSize;
  return {
    places: all.slice(start, start + pageSize),
    total: all.length,
    totalPages: Math.ceil(all.length / pageSize) || 1,
    page,
  };
}

export function groupPlacesByLetter(places) {
  const groups = {};
  places.forEach(p => {
    const letter = (p.name[0] || '').toUpperCase();
    if (!letter) return;
    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(p);
  });
  return Object.keys(groups).sort().map(letter => ({ letter, places: groups[letter] }));
}

export function getRelatedServices(serviceSlug, limit = 4) {
  const SERVICE_RELATED = {
    'drain-cleaning': ['emergency', 'sewer-line-repair', 'leak-repair'],
    'emergency': ['drain-cleaning', 'pipe-burst-repair', 'water-heater-repair'],
    'sewer-line-repair': ['drain-cleaning', 'emergency', 'leak-repair'],
    'leak-repair': ['emergency', 'pipe-burst-repair', 'drain-cleaning'],
    'pipe-burst-repair': ['emergency', 'leak-repair', 'drain-cleaning'],
    'water-heater-repair': ['emergency', 'leak-repair', 'drain-cleaning'],
  };
  const slugs = SERVICE_RELATED[serviceSlug] || ['emergency', 'leak-repair', 'drain-cleaning'];
  const related = [];
  slugs.forEach(slug => {
    const s = SERVICES.find(x => x.slug === slug);
    if (s && !related.find(r => r.slug === s.slug)) related.push(s);
  });
  // Fill with other services if list is short (excluding current service)
  if (related.length < limit) {
    SERVICES.forEach(s => {
      if (s.slug !== serviceSlug && !related.find(r => r.slug === s.slug)) {
        related.push(s);
      }
    });
  }
  return related.slice(0, limit);
}

export function getStateSlug(stateCode) {
  const s = getStateInfo(stateCode);
  return s ? s.slug : stateCode.toLowerCase();
}

// Build a deterministic, crawlable hub path for a state
export function getCrawlHubPath(stateIdentifier) {
  const state = STATES.find(s => s.code === stateIdentifier) || STATES.find(s => s.slug === stateIdentifier) || null;
  if (!state) return null;
  return `/crawl/${state.slug}`;
}
