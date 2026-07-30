// ============================================================
// HYPERLOCAL ZCTA/ZIP DATA LAYER — Client-safe subset
// Server-only functions are in hyperlocalPlaces-server.js
// ============================================================

// ── Service qualification ──────────────────────────────────────
const SUMP_PUMP_QUALIFIED_STATE_CODES = new Set([
  'AK', 'CT', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'ME', 'MA',
  'MI', 'MN', 'MO', 'MT', 'NE', 'NH', 'NJ', 'NY', 'ND', 'OH',
  'OR', 'PA', 'RI', 'SD', 'TN', 'UT', 'VT', 'VA', 'WA', 'WV',
  'WI', 'WY', 'CO', 'DE', 'MD', 'NV', 'NM', 'NC',
]);

export function isZctaQualifiedForService(zcta, serviceSlug) {
  if (serviceSlug === 'sump-pump-repair') {
    return SUMP_PUMP_QUALIFIED_STATE_CODES.has(zcta.stateCode);
  }
  return true;
}

// ── Service slugs (hardcoded to avoid circular dependency) ─────
export const SERVICE_SLUGS = [
  'emergency',
  'leak-repair',
  'drain-cleaning',
  'pipe-burst-repair',
  'water-heater-repair',
  'sewer-line-repair',
  'toilet-repair',
  'slab-leak-repair',
  'water-line-repair',
  'faucet-repair',
  'garbage-disposal-repair',
  'water-softener-repair',
  'whole-house-repiping',
  'main-water-shutoff-valve-repair',
  'sump-pump-repair',
];
