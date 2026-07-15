// ================================================================
// SCORER — City × Service priority scoring engine
//
// Produces a composite score 0–100 and an intent band:
//   HIGH        >= 75   → generate immediately
//   MEDIUM-HIGH >= 55   → generate (within daily limit)
//   MEDIUM      >= 35   → queue, generate when HIGH/MH exhausted
//   LOW         <  35   → reject — do not generate
//
// Scoring factors (all additive):
//   City tier base      Tier 1=40  Tier 2=25  Tier 3=12
//   Population bonus    scales 0–8 within tier
//   Service base weight Emergency=30 Burst=25 Leak=20 Drain=10 WH=8
//   Winter risk bonus   high=6  med=3  low=0   (boosts emergency/burst)
//   Hard water bonus    true=4  (boosts leak/WH relevance)
//   Service×climate fit calculated per combination (max +10)
//
// ORDERING GUARANTEE:
//   Queue is sorted by urgencyGroup first (1→2→3), then score desc.
//   This ensures emergency/burst/leak always precede drain/WH in the
//   daily run regardless of city tier advantages.
//
// Urgency groups:
//   1 — FIRST  : emergency, pipe-burst-repair, leak-repair
//   2 — SECOND : drain-cleaning
//   3 — THIRD  : water-heater-repair
// ================================================================

'use strict';

// Services ordered by urgency — this defines generation priority.
// urgencyGroup 1 = must generate first within daily limit.
const SERVICE_PRIORITY = [
  { slug: 'emergency',           name: 'Emergency Plumbing',   base: 30, urgencyGroup: 1 },
  { slug: 'pipe-burst-repair',   name: 'Pipe Burst Repair',    base: 25, urgencyGroup: 1 },
  { slug: 'leak-repair',         name: 'Leak Repair',          base: 20, urgencyGroup: 1 },
  { slug: 'drain-cleaning',      name: 'Drain Cleaning',       base: 10, urgencyGroup: 2 },
  { slug: 'water-heater-repair', name: 'Water Heater Repair',  base:  8, urgencyGroup: 3 },
];

// Map slug → urgencyGroup for fast lookup in queue sorting
const URGENCY_GROUP = Object.fromEntries(
  SERVICE_PRIORITY.map(s => [s.slug, s.urgencyGroup])
);

const TIER_BASE = { 1: 40, 2: 25, 3: 12 };
const DAILY_LIMIT = 25;
const MIN_SCORE_TO_GENERATE = 35; // below this = LOW, reject

// Population bonus: 0–8 scaled within each tier's range.
// Capped at 8 (down from 10) so city size cannot override
// a full urgency-group difference in service base weight.
function popBonus(city) {
  const ranges = {
    1: { min: 640000,  max: 8400000 },
    2: { min: 290000,  max: 700000  },
    3: { min: 180000,  max: 310000  },
  };
  const r = ranges[city.tier] || ranges[3];
  const clamped = Math.min(Math.max(city.pop, r.min), r.max);
  return Math.round(((clamped - r.min) / (r.max - r.min)) * 8);
}

// Service×climate fit bonus (max 10)
// Emergency + high winter → max boost
// Burst + high winter → high boost
// WaterHeater + hard water → boost
// Drain + aging infra (approximated by tier 1 older cities) → small boost
function climateFit(city, service) {
  const s = service.slug;
  const w = city.winterRisk;
  const h = city.hardWater;

  if (s === 'emergency')           return w === 'high' ? 10 : w === 'med' ? 5 : 2;
  if (s === 'pipe-burst-repair')   return w === 'high' ? 10 : w === 'med' ? 4 : 0;
  if (s === 'water-heater-repair') return h ? 8 : w === 'high' ? 5 : 2;
  if (s === 'leak-repair')         return h ? 6 : 3;
  if (s === 'drain-cleaning')      return city.tier === 1 ? 4 : 2;
  return 0;
}

function intentBand(score) {
  if (score >= 75) return 'HIGH';
  if (score >= 55) return 'MEDIUM-HIGH';
  if (score >= 35) return 'MEDIUM';
  return 'LOW';
}

function scoreCombo(city, service) {
  const tierBase  = TIER_BASE[city.tier] || 12;
  const pop       = popBonus(city);
  const svcBase   = service.base;
  const winter    = city.winterRisk === 'high' ? 6 : city.winterRisk === 'med' ? 3 : 0;
  const hardBonus = city.hardWater ? 4 : 0;
  const fit       = climateFit(city, service);

  const raw = tierBase + pop + svcBase + winter + hardBonus + fit;
  // Cap at 100
  const score = Math.min(100, raw);
  return {
    cityName:      city.city,
    stateCode:     city.state,
    tier:          city.tier,
    service:       service.slug,
    serviceName:   service.name,
    urgencyGroup:  service.urgencyGroup,
    score,
    band:          intentBand(score),
    dataReady:     city.dataReady,
    breakdown: { tierBase, pop, svcBase, winter, hardBonus, fit },
  };
}

// Score all city×service combinations.
// Sorted by: urgencyGroup asc (1 before 2 before 3), then score desc,
// then city name asc as final tiebreaker.
// This guarantees emergency/burst/leak always precede drain/WH
// at every tier level in any downstream consumer.
function scoreAll(cityPool) {
  const results = [];
  for (const city of cityPool) {
    for (const service of SERVICE_PRIORITY) {
      const combo = scoreCombo(city, service);
      results.push(combo);
    }
  }
  results.sort((a, b) =>
    a.urgencyGroup - b.urgencyGroup ||
    b.score - a.score ||
    a.cityName.localeCompare(b.cityName)
  );
  return results;
}

// Filter to only combinations that should be generated
function eligibleCombos(cityPool) {
  return scoreAll(cityPool).filter(
    (c) => c.dataReady && c.band !== 'LOW'
  );
}

module.exports = { SERVICE_PRIORITY, DAILY_LIMIT, MIN_SCORE_TO_GENERATE, scoreAll, eligibleCombos, intentBand };
