// Fast build: generates sitemaps + content manifest, then runs next build
// without FULL_BUILD=true. All pages use fallback: 'blocking' (on-demand).
// Pre-built pages from the previous FULL_BUILD deployment remain cached
// until they are naturally regenerated on first request.
//
// Use this for code/metadata/SEO changes that don't alter the page dataset.
// Use build:full when SEED_CITIES, SERVICES, or content data changes.

import { execSync } from 'child_process';

console.log('[build:fast] Generating content manifest...');
execSync('node scripts/generate-content-manifest.js', { stdio: 'inherit' });

console.log('[build:fast] Generating sitemaps...');
execSync('node scripts/generate-sitemaps.js', { stdio: 'inherit' });

console.log('[build:fast] Running next build (no FULL_BUILD)...');
execSync('next build', { stdio: 'inherit' });

console.log('[build:fast] Done.');
