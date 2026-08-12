import { execSync } from 'child_process';

execSync('node scripts/generate-content-manifest.js', { stdio: 'inherit' });
execSync('next build', { stdio: 'inherit', env: { ...process.env, FULL_BUILD: 'true' } });
