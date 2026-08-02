// ============================================================
// MAIN RUNNER — Playwright browser automation
// Opens each platform, auto-fills fields, pauses for human
// verification, resumes automatically, logs progress.
// ============================================================

import { chromium } from 'playwright';
import { business, descriptions, landingPages } from './config/business.js';
import { platforms, excludedPlatforms } from './config/platforms.js';
import { loadProgress, saveProgress, updatePlatformStatus, logToFile, printSummary } from './progress.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Helpers ──────────────────────────────────────────────

function getDescription(pref, length) {
  const desc = descriptions.find(d => d.id === pref) || descriptions[4]; // fallback to 'E'
  return desc[length] || desc.medium;
}

function getLandingPage(platform) {
  if (platform.landingPage === 'default' || !platform.landingPage) {
    return landingPages.default;
  }
  return landingPages[platform.landingPage] || landingPages.default;
}

async function tryFill(page, selector, value, label = '') {
  try {
    const el = await page.locator(selector).first();
    if (await el.isVisible({ timeout: 3000 })) {
      await el.fill(value);
      logToFile(`  ✓ Filled ${label || selector}`);
      return true;
    }
  } catch (e) {
    // Try alternative approach — click and type
    try {
      const el = page.locator(selector).first();
      await el.click({ timeout: 2000 });
      await page.keyboard.type(value, { delay: 30 });
      logToFile(`  ✓ Typed into ${label || selector}`);
      return true;
    } catch (e2) {
      logToFile(`  ✗ Could not fill ${label || selector}: ${e2.message}`);
    }
  }
  return false;
}

async function tryFillMultiple(page, selectors, value, label) {
  for (const sel of selectors) {
    if (await tryFill(page, sel, value, label)) {
      return true;
    }
  }
  return false;
}

const PAUSE_FILE = path.join(__dirname, 'RESUME.txt');
const SKIP_FILE = path.join(__dirname, 'SKIP.txt');

async function waitForHumanInteraction(page, reason, timeout = 600000) {
  console.log('\n' + '─'.repeat(60));
  console.log(`⏸️  PAUSED — Human interaction required`);
  console.log(`Reason: ${reason}`);
  console.log(`The browser is open. Complete the required action in the browser.`);
  console.log(`→ Delete RESUME.txt to continue`);
  console.log(`→ Delete SKIP.txt to skip this platform`);
  console.log('─'.repeat(60) + '\n');

  // Create pause file
  fs.writeFileSync(PAUSE_FILE, `PAUSED: ${reason}\nDelete this file to resume.\n`);
  // Remove skip file if exists from previous pause
  if (fs.existsSync(SKIP_FILE)) fs.unlinkSync(SKIP_FILE);

  // Wait until pause file is deleted or skip file is deleted
  while (fs.existsSync(PAUSE_FILE)) {
    if (fs.existsSync(SKIP_FILE)) {
      fs.unlinkSync(SKIP_FILE);
      if (fs.existsSync(PAUSE_FILE)) fs.unlinkSync(PAUSE_FILE);
      logToFile('  ⏭️ Skipped by user');
      return 'skip';
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  logToFile('  ▶️ Resumed by user');
  return 'continue';
}

async function checkForCaptcha(page) {
  const captchaSelectors = [
    'iframe[src*="captcha"]',
    'iframe[src*="recaptcha"]',
    'iframe[src*="hcaptcha"]',
    'div[class*="captcha"]',
    '#captcha',
    '.g-recaptcha',
    '.h-captcha',
    'iframe[title*="captcha"]',
    'iframe[title*="reCAPTCHA"]',
  ];
  for (const sel of captchaSelectors) {
    try {
      const el = page.locator(sel).first();
      if (await el.isVisible({ timeout: 1000 })) {
        return true;
      }
    } catch (e) { /* ignore */ }
  }
  return false;
}

async function uploadLogo(page, platform) {
  const logoPath = path.resolve(__dirname, business.logoPath);
  if (!fs.existsSync(logoPath)) {
    logToFile('  ⚠️ Logo file not found, skipping upload');
    return false;
  }

  const logoSelectors = [
    'input[type="file"]',
    'input[name="logo"]',
    'input[name="image"]',
    'input[accept*="image"]',
  ];

  for (const sel of logoSelectors) {
    try {
      const el = page.locator(sel).first();
      if (await el.isVisible({ timeout: 2000 })) {
        await el.setInputFiles(logoPath);
        logToFile('  ✓ Logo uploaded');
        return true;
      }
    } catch (e) { /* try next */ }
  }
  logToFile('  ℹ️ No logo upload field found on this page');
  return false;
}

// ── Platform-specific handlers ───────────────────────────

async function handleCraigslist(page, platform, progress) {
  const areas = platform.craigslistAreas || [];
  const desc = getDescription(platform.descriptionPref, 'short');
  const website = getLandingPage(platform);
  const adTitle = '24/7 Emergency Plumbing Service — Licensed & Insured — YoHomeFix';
  const adBody = `${desc}\n\nVisit us at ${website}\n\nServing homeowners across the USA with 24/7 emergency plumbing dispatch. Licensed, insured local plumbers. 60-minute response target, upfront pricing, no hold queues.`;

  for (const areaUrl of areas) {
    const areaName = areaUrl.replace('https://', '').replace('.craigslist.org', '');
    logToFile(`\n>>> Craigslist: Posting to ${areaName}`);

    try {
      await page.goto(`${areaUrl}/post.craigslist.org/c/str`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(2000);

      // Check if login required
      if (page.url().includes('login') || page.url().includes('accounts')) {
        const r = await waitForHumanInteraction(page, `Log in to Craigslist for ${areaName}. Complete phone verification if needed.`);
        if (r === 'skip') { updatePlatformStatus(progress, `craigslist_${areaName}`, 'skipped', '', 'Skipped by user'); continue; }
      }

      // Try to fill posting form
      // Craigslist's form is complex and varies — fill what we can, pause for the rest
      await tryFill(page, 'input[name="PostingTitle"], #PostingTitle', adTitle, 'Posting Title');
      await tryFill(page, 'textarea[name="PostingBody"], #PostingBody', adBody, 'Posting Body');
      await tryFill(page, 'input[name="FromEMail"], #FromEMail', business.email, 'Email');
      await tryFill(page, 'input[name="tele"], #tele', '', 'Phone (left blank)');

      // Check for CAPTCHA
      if (await checkForCaptcha(page)) {
        const r = await waitForHumanInteraction(page, `Craigslist ${areaName}: Complete CAPTCHA and submit the post.`);
        if (r === 'skip') { updatePlatformStatus(progress, `craigslist_${areaName}`, 'skipped', '', 'Skipped by user'); continue; }
      } else {
        const r = await waitForHumanInteraction(page, `Craigslist ${areaName}: Review the post, select category (Services → Household), and publish.`);
        if (r === 'skip') { updatePlatformStatus(progress, `craigslist_${areaName}`, 'skipped', '', 'Skipped by user'); continue; }
      }

      logToFile(`  ✓ Craigslist ${areaName} — submitted (check email for confirmation)`);

      // Wait between posts to avoid rate limiting
      logToFile('  ⏳ Waiting 30 seconds before next area...');
      await page.waitForTimeout(30000);
    } catch (e) {
      logToFile(`  ✗ Craigslist ${areaName} failed: ${e.message}`);
      updatePlatformStatus(progress, `craigslist_${areaName}`, 'requires_action', '', `Error: ${e.message}`);
    }
  }

  updatePlatformStatus(progress, 'craigslist', 'pending_verification', '', 'Posts submitted to multiple metros. Check email for confirmations.');
}

async function handleStandardPlatform(page, platform, progress) {
  const desc = getDescription(platform.descriptionPref, platform.descriptionLength || 'medium');
  const website = getLandingPage(platform);
  const url = platform.addBusinessUrl || platform.url;

  logToFile(`\n>>> Opening ${platform.name}: ${url}`);

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
  } catch (e) {
    logToFile(`  ✗ Failed to load ${platform.name}: ${e.message}`);
    updatePlatformStatus(progress, platform.id, 'requires_action', '', `Failed to load page: ${e.message}`);
    return;
  }

  // Check if login/signup is required
  const currentUrl = page.url();
  if (currentUrl.includes('login') || currentUrl.includes('signin') || currentUrl.includes('register') || currentUrl.includes('signup')) {
    if (platform.requiresLogin) {
      // Try to fill email field on signup form
      await tryFill(page, 'input[name="email"], input[type="email"], #email', business.email, 'Email');

      // Also try common password fields — don't fill password (user should choose)
      // Try name field if present
      await tryFill(page, 'input[name="name"], input[name="fullName"], input[placeholder*="name"]', business.name, 'Name');

      if (await checkForCaptcha(page)) {
        const r = await waitForHumanInteraction(page, `${platform.name}: Complete CAPTCHA and/or email verification to create account.`);
        if (r === 'skip') { updatePlatformStatus(progress, platform.id, 'skipped', '', 'Skipped by user'); return; }
      } else {
        const r = await waitForHumanInteraction(page, `${platform.name}: Complete signup (set password, verify email). Delete RESUME.txt when account is active.`);
        if (r === 'skip') { updatePlatformStatus(progress, platform.id, 'skipped', '', 'Skipped by user'); return; }
      }

      // After login, navigate to add business page
      if (platform.addBusinessUrl && platform.addBusinessUrl !== platform.signupUrl) {
        logToFile(`  → Navigating to add-business page: ${platform.addBusinessUrl}`);
        try {
          await page.goto(platform.addBusinessUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
          await page.waitForTimeout(2000);
        } catch (e) {
          logToFile(`  ⚠️ Could not navigate to add-business page: ${e.message}`);
          const r2 = await waitForHumanInteraction(page, `${platform.name}: Navigate to the "Add Business" page manually.`);
          if (r2 === 'skip') { updatePlatformStatus(progress, platform.id, 'skipped', '', 'Skipped by user'); return; }
        }
      }
    }
  }

  // Now fill the business listing form
  logToFile(`  → Filling business listing form for ${platform.name}...`);

  const fields = platform.fields || {};

  // Fill business name
  if (fields.businessName || fields.companyName || fields.pageName || fields.name) {
    const nameField = fields.businessName || fields.companyName || fields.pageName || fields.name;
    const selectors = nameField.selector.split(',').map(s => s.trim());
    await tryFillMultiple(page, selectors, business.name, 'Business Name');
  }

  // Fill website
  if (fields.website) {
    const selectors = fields.website.selector.split(',').map(s => s.trim());
    await tryFillMultiple(page, selectors, website, 'Website URL');
  }

  // Fill email
  if (fields.email) {
    const selectors = fields.email.selector.split(',').map(s => s.trim());
    await tryFillMultiple(page, selectors, business.email, 'Email');
  }

  // Fill description
  if (fields.description) {
    const selectors = fields.description.selector.split(',').map(s => s.trim());
    await tryFillMultiple(page, selectors, desc, 'Description');
  }

  // Fill category
  if (fields.category) {
    const selectors = fields.category.selector.split(',').map(s => s.trim());
    await tryFillMultiple(page, selectors, platform.category || business.category, 'Category');
  }

  // Try to upload logo
  await uploadLogo(page, platform);

  // Check for CAPTCHA before submit
  if (await checkForCaptcha(page)) {
    const r = await waitForHumanInteraction(page, `${platform.name}: Complete CAPTCHA and submit the form.`);
    if (r === 'skip') { updatePlatformStatus(progress, platform.id, 'skipped', '', 'Skipped by user'); return; }
  } else {
    // Check for pause points
    if (platform.pausePoints && platform.pausePoints.length > 0) {
      const lastPause = platform.pausePoints[platform.pausePoints.length - 1];
      const r = await waitForHumanInteraction(page, `${platform.name}: ${lastPause.reason}`);
      if (r === 'skip') { updatePlatformStatus(progress, platform.id, 'skipped', '', 'Skipped by user'); return; }
    } else {
      const r = await waitForHumanInteraction(page, `${platform.name}: Review the form and submit. Delete RESUME.txt when done.`);
      if (r === 'skip') { updatePlatformStatus(progress, platform.id, 'skipped', '', 'Skipped by user'); return; }
    }
  }

  // Try to capture the listing URL
  let listingUrl = '';
  try {
    listingUrl = page.url();
  } catch (e) { /* ignore */ }

  // Mark as pending verification (user confirmed submission)
  updatePlatformStatus(progress, platform.id, 'pending_verification', listingUrl, `Submitted to ${platform.name}. Check email for verification if required.`);
}

// ── Main execution ───────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const singleMode = args.includes('--single');
  const listMode = args.includes('--list');
  const statusMode = args.includes('--status');
  const resumeMode = args.includes('--resume');

  // --list: print all platforms and exit
  if (listMode) {
    console.log('\nPlatforms available for submission:\n');
    const sorted = [...platforms].sort((a, b) => (a.priority || 99) - (b.priority || 99));
    for (const p of sorted) {
      console.log(`  [${p.id}] ${p.name} (priority: ${p.priority})`);
    }
    console.log(`\nTotal: ${platforms.length} platforms`);
    console.log(`Excluded: ${excludedPlatforms.length} platforms`);
    for (const e of excludedPlatforms) {
      console.log(`  ✗ ${e.name}: ${e.reason}`);
    }
    return;
  }

  // --status: print current progress and exit
  if (statusMode) {
    const progress = loadProgress();
    printSummary(progress);
    return;
  }

  // Load progress
  let progress = loadProgress();
  progress.total = platforms.length;
  saveProgress(progress);

  // Determine which platforms to run
  let toRun;
  if (singleMode) {
    const platformId = args[args.indexOf('--single') + 1];
    toRun = platforms.filter(p => p.id === platformId);
    if (toRun.length === 0) {
      console.log(`Platform "${platformId}" not found. Use --list to see available platforms.`);
      return;
    }
  } else if (resumeMode) {
    // Only run platforms not yet completed/skipped/rejected
    toRun = platforms.filter(p => {
      const status = progress.platforms[p.id]?.status;
      return status !== 'completed' && status !== 'rejected' && status !== 'skipped' && status !== 'pending_verification';
    });
    // Sort: free no-login directories first
    toRun.sort((a, b) => {
      const aScore = a.requiresLogin ? 100 : 0;
      const bScore = b.requiresLogin ? 100 : 0;
      return (aScore + (a.priority || 99)) - (bScore + (b.priority || 99));
    });
  } else {
    // Sort: free no-login directories first, then login-required, then social
    toRun = [...platforms].sort((a, b) => {
      const aScore = a.requiresLogin ? 100 : 0;
      const bScore = b.requiresLogin ? 100 : 0;
      return (aScore + (a.priority || 99)) - (bScore + (b.priority || 99));
    });
  }

  logToFile(`\n${'='.repeat(60)}`);
  logToFile(`YoHomeFix Directory Submission System — Starting`);
  logToFile(`Platforms to process: ${toRun.length}`);
  logToFile(`${'='.repeat(60)}\n`);

  // Launch browser (resilient — can reopen if closed)
  let browser, context, page;

  async function ensureBrowser() {
    // Check if browser AND page are both alive
    let needReopen = true;
    try {
      if (browser) {
        const contexts = browser.contexts();
        if (contexts && contexts.length > 0) {
          // Browser alive — check if page is still usable
          if (page) {
            try {
              await page.evaluate(() => true);
              needReopen = false;
            } catch (e) {
              // Page is stale — create new page in existing context
              logToFile('  → Page was closed, creating new page...');
              try {
                page = await context.newPage();
                needReopen = false;
              } catch (e2) {
                // Context also dead — full reopen
              }
            }
          }
        }
      }
    } catch (e) { needReopen = true; }

    if (!needReopen) return;

    logToFile('  → (Re)opening browser...');
    try { if (browser) await browser.close(); } catch (e) { /* dead */ }
    browser = null;
    context = null;
    page = null;

    browser = await chromium.launch({
      headless: false,
      args: ['--disable-blink-features=AutomationControlled'],
    });

    context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      locale: 'en-US',
    });

    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });

    page = await context.newPage();
    logToFile('  ✓ Browser ready');
  }

  await ensureBrowser();

  // Process each platform
  for (let i = 0; i < toRun.length; i++) {
    const platform = toRun[i];
    const existingStatus = progress.platforms[platform.id]?.status;

    if (existingStatus === 'completed' || existingStatus === 'skipped') {
      logToFile(`\n[${i + 1}/${toRun.length}] ${platform.name} — Already ${existingStatus}, skipping`);
      continue;
    }

    logToFile(`\n[${i + 1}/${toRun.length}] Processing: ${platform.name} (id: ${platform.id})`);

    try {
      await ensureBrowser();
      if (platform.id === 'craigslist') {
        await handleCraigslist(page, platform, progress);
      } else {
        await handleStandardPlatform(page, platform, progress);
      }
    } catch (e) {
      logToFile(`  ✗ Error processing ${platform.name}: ${e.message}`);
      updatePlatformStatus(progress, platform.id, 'requires_action', '', `Error: ${e.message}`);
      // Try to reopen browser for next platform
      try { await browser.close(); } catch (e2) { /* already dead */ }
      browser = null;
    }

    // Reload progress after each platform
    progress = loadProgress();

    // Brief pause between platforms (using setTimeout, not page.waitForTimeout)
    if (i < toRun.length - 1) {
      logToFile('  ⏳ Waiting 5 seconds before next platform...');
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  // Final summary
  progress = loadProgress();
  printSummary(progress);

  logToFile('\n✅ All platforms processed. Browser will remain open for 60 seconds for review.');
  await new Promise((resolve) => setTimeout(resolve, 60000));

  await browser.close();
  logToFile('Browser closed. Submission session ended.');
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
