export function getLastReviewedToday() {
  return new Date().toISOString().split('T')[0];
}
