// Compare sitemap files before and after regeneration
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const publicDir = path.join(__dirname, '..', 'public');
const backupDir = path.join(__dirname, '..', 'backups', 'sitemap-backup');

// Step 1: Backup current sitemaps
console.log('[verify] Backing up current sitemaps to backups/sitemap-backup/...');
execSync('xcopy /E /I /Y public\\sitemap*.xml backups\\sitemap-backup\\', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
execSync('xcopy /E /I /Y public\\sitemap-* backups\\sitemap-backup\\', { stdio: 'inherit', cwd: path.join(__dirname, '..') });

// Step 2: Collect all sitemap files and their hashes
function hashFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  // Normalize line endings for comparison
  return content.replace(/\r\n/g, '\n');
}

function collectSitemapFiles(dir, base = '') {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      files.push(...collectSitemapFiles(fullPath, relPath));
    } else if (entry.name.endsWith('.xml') && (entry.name.startsWith('sitemap') || relPath.includes('sitemap-'))) {
      files.push({ relPath, fullPath, content: hashFile(fullPath) });
    }
  }
  return files;
}

const beforeFiles = collectSitemapFiles(backupDir);
console.log(`[verify] Found ${beforeFiles.length} sitemap files in backup`);

// Step 3: Run the standalone sitemap generator
console.log('\n[verify] Running standalone sitemap generator...');
execSync('node scripts/generate-sitemaps.js', { stdio: 'inherit', cwd: path.join(__dirname, '..') });

// Step 4: Compare
const afterFiles = collectSitemapFiles(publicDir);
console.log(`[verify] Found ${afterFiles.length} sitemap files after generation\n`);

// Build maps by relative path
const beforeMap = new Map(beforeFiles.map(f => [f.relPath, f.content]));
const afterMap = new Map(afterFiles.map(f => [f.relPath, f.content]));

let identical = 0;
let different = 0;
let missing = 0;
let extra = 0;
const diffs = [];

for (const [relPath, beforeContent] of beforeMap) {
  const afterContent = afterMap.get(relPath);
  if (!afterContent) {
    missing++;
    diffs.push(`MISSING: ${relPath}`);
  } else if (beforeContent === afterContent) {
    identical++;
  } else {
    different++;
    // Show first difference
    const beforeLines = beforeContent.split('\n');
    const afterLines = afterContent.split('\n');
    let firstDiff = -1;
    for (let i = 0; i < Math.min(beforeLines.length, afterLines.length); i++) {
      if (beforeLines[i] !== afterLines[i]) {
        firstDiff = i;
        break;
      }
    }
    diffs.push(`DIFFERENT: ${relPath} (first diff at line ${firstDiff + 1})`);
    if (firstDiff >= 0) {
      diffs.push(`  BEFORE: ${beforeLines[firstDiff]?.substring(0, 120)}`);
      diffs.push(`  AFTER:  ${afterLines[firstDiff]?.substring(0, 120)}`);
    }
  }
}

for (const [relPath] of afterMap) {
  if (!beforeMap.has(relPath)) {
    extra++;
    diffs.push(`EXTRA: ${relPath}`);
  }
}

console.log('─'.repeat(60));
console.log('SITEMAP COMPARISON RESULTS');
console.log('─'.repeat(60));
console.log(`  Identical:  ${identical}`);
console.log(`  Different:  ${different}`);
console.log(`  Missing:    ${missing}`);
console.log(`  Extra:      ${extra}`);
console.log('─'.repeat(60));

if (diffs.length > 0) {
  console.log('\nDifferences:');
  diffs.forEach(d => console.log(`  ${d}`));
} else {
  console.log('\n✅ ALL SITEMAP FILES IDENTICAL');
}
