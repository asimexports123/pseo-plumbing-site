// ============================================================
// PROGRESS TRACKER — Live status logging
// ============================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROGRESS_FILE = path.join(__dirname, 'progress.json');
const LOG_FILE = path.join(__dirname, 'submission-log.txt');

const defaultProgress = {
  startedAt: new Date().toISOString(),
  lastUpdated: new Date().toISOString(),
  total: 0,
  completed: 0,
  pendingVerification: 0,
  requiresAction: 0,
  rejected: 0,
  skipped: 0,
  platforms: {},
};

export function loadProgress() {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Error loading progress file, starting fresh:', e.message);
  }
  return { ...defaultProgress };
}

export function saveProgress(progress) {
  progress.lastUpdated = new Date().toISOString();
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

export function logToFile(message) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(LOG_FILE, line);
  console.log(line.trim());
}

export function updatePlatformStatus(progress, platformId, status, listingUrl = '', notes = '') {
  if (!progress.platforms[platformId]) {
    progress.platforms[platformId] = {};
  }
  const oldStatus = progress.platforms[platformId].status;
  progress.platforms[platformId] = {
    ...progress.platforms[platformId],
    status,
    listingUrl,
    notes,
    updatedAt: new Date().toISOString(),
  };

  // Recount statuses
  progress.completed = 0;
  progress.pendingVerification = 0;
  progress.requiresAction = 0;
  progress.rejected = 0;
  progress.skipped = 0;
  for (const p of Object.values(progress.platforms)) {
    switch (p.status) {
      case 'completed': progress.completed++; break;
      case 'pending_verification': progress.pendingVerification++; break;
      case 'requires_action': progress.requiresAction++; break;
      case 'rejected': progress.rejected++; break;
      case 'skipped': progress.skipped++; break;
    }
  }

  saveProgress(progress);
  logToFile(`[${platformId}] Status: ${status}${listingUrl ? ` | URL: ${listingUrl}` : ''}${notes ? ` | Notes: ${notes}` : ''}`);
}

export function printSummary(progress) {
  console.log('\n' + '='.repeat(60));
  console.log('SUBMISSION PROGRESS SUMMARY');
  console.log('='.repeat(60));
  console.log(`Started: ${progress.startedAt}`);
  console.log(`Last Updated: ${progress.lastUpdated}`);
  console.log(`Total Platforms: ${progress.total}`);
  console.log(`✅ Completed: ${progress.completed}`);
  console.log(`⏳ Pending Verification: ${progress.pendingVerification}`);
  console.log(`⚠️  Requires Action: ${progress.requiresAction}`);
  console.log(`❌ Rejected: ${progress.rejected}`);
  console.log(`⏭️  Skipped: ${progress.skipped}`);
  console.log('='.repeat(60));

  for (const [id, p] of Object.entries(progress.platforms)) {
    const icon = p.status === 'completed' ? '✅' :
                 p.status === 'pending_verification' ? '⏳' :
                 p.status === 'requires_action' ? '⚠️' :
                 p.status === 'rejected' ? '❌' : '⏭️';
    console.log(`${icon} ${id}: ${p.status}${p.listingUrl ? ` → ${p.listingUrl}` : ''}`);
  }
  console.log('='.repeat(60) + '\n');
}
