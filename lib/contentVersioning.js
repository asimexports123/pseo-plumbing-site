import { dates } from './.content-dates.js';
import { getToday } from './contentHash.js';

export function getPageDate(pageKey) {
  return dates[pageKey] || getToday();
}
