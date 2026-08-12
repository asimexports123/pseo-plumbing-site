// Server-only crawl helpers — uses nationwidePlaces which requires fs.
// Client components must NOT import from this file.

import { SEED_CITIES } from './cities';
import { getPlacesByStateSync } from './nationwidePlaces';

const DEFAULT_PAGE_SIZE = 100;

export function getAdditionalPlacesForState(stateCode) {
  const seedNames = new Set(
    SEED_CITIES.filter(c => c.stateCode === stateCode).map(c => c.name)
  );
  return getPlacesByStateSync(stateCode)
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
