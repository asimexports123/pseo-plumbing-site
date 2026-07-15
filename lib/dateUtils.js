// Deterministic last-reviewed dates so every page gets a stable, unique date
// within the past 6–18 months. Based on a FNV-1a hash of the page identifier.
export function getDeterministicLastReviewed(slug) {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const daysBack = 180 + (Math.abs(h) % 365); // 180–544 days back
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysBack);
  return d.toISOString().split('T')[0];
}

export function getLastReviewedToday() {
  return new Date().toISOString().split('T')[0];
}
