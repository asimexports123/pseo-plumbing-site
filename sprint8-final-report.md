# Sprint #8 — External Authority Distribution Execution
## Final Consolidated Report

**Date:** 2026-07-23
**Commit ID:** `8293ebdb`
**Previous commit:** `11360315` (Sprint #7)

---

## 1. Dataset Distribution Readiness Result

**Status: READY**

- CSV downloads successfully via client-side generation
- 17 columns, all understandable and publicly safe
- No internal/private operational data (no Marketcall IDs, phone numbers, analytics, or routing slugs)
- No unsupported claims presented as verified measurements
- Provenance limitations documented (Tier A/B/C system)
- License is appropriate (CC BY 4.0, corrected — see item 2)
- Citation format is accurate
- Canonical research URL included in citation section

**No blocking issues found.**

---

## 2. Licensing Audit Result

**Status: CORRECTED**

### Problem Found
The original CC BY 4.0 notice stated: "Dataset licensed under Creative Commons Attribution 4.0 (CC BY 4.0). Free to share and adapt with attribution."

This implied YoHomeFix owned all underlying facts. Under CC BY 4.0, facts are not copyrightable, but the wording did not distinguish between:
- **A.** YoHomeFix's original compilation, classifications, risk scoring, and analysis (licensable under CC BY 4.0)
- **B.** Underlying factual measurements from municipal/government/public sources (public domain, not subject to CC BY 4.0)
- **C.** USGS classification thresholds (U.S. government work, public domain)

### Correction Applied
Updated licensing language to: "This dataset is licensed under Creative Commons Attribution 4.0 (CC BY 4.0), covering YoHomeFix's compilation, organization, classifications, risk scoring, and analysis. Underlying water hardness measurements and utility data are drawn from public municipal, state, and federal sources and are not subject to this license. Free to share and adapt with attribution to YoHomeFix."

Also updated schema.org Dataset `description` to include the licensing scope clarification.

---

## 3. Licensing/Source Wording Corrected

**Files changed:**
- `pages/research/us-water-hardness-plumbing-risk.js` — Citation section licensing paragraph (line 696-701)
- `pages/research/us-water-hardness-plumbing-risk.js` — Schema.org Dataset description (line 51)

**Also fixed:** Embed widget URL bug — the embed code displayed on the live site pointed to `https://yohomefix.com/research/us-water-hardness-plumbing-risk/embed` (404). Fixed to `https://yohomefix.com/research/embed` (actual page location).

---

## 4. External Platforms Researched

| Platform | Classification | Status |
|----------|---------------|--------|
| Zenodo | A — HIGH-VALUE | PREPARED |
| Kaggle | A — HIGH-VALUE | PREPARED |
| GitHub (dataset repo) | A — HIGH-VALUE | PREPARED |
| HARO (Help a Reporter Out) | A — HIGH-VALUE | PREPARED (monitoring) |
| Hugging Face Datasets | B — USEFUL | PREPARED |
| data.world | B — USEFUL | PREPARED |
| Qwoted | B — USEFUL | PREPARED (monitoring) |
| Featured.com | B — USEFUL | PREPARED (monitoring) |
| WaterHardness.org | B — USEFUL | PREPARED (form submission) |
| #JournoRequest (X/Twitter) | B — USEFUL | PREPARED (passive monitoring) |
| Source of Sources (SOS) | C — LOW-VALUE | SKIP |
| Help a B2B Writer | D — UNSUITABLE | SKIP |
| Water filtration directories | D — UNSUITABLE | SKIP |

---

## 5. Platforms Rejected and Exact Reason

| Platform | Reason |
|----------|--------|
| Source of Sources (SOS) | High spam volume (150 pitches/query), low pickup rate (3.2%), uneven execution |
| Help a B2B Writer | B2B-focused; YoHomeFix is consumer/homeowner platform; query topics don't match |
| WaterFiltrationDirectory.com | Expects water filtration businesses, not research resources; requires reciprocal link for SEO value |
| WaterTreatmentDirectory.com | Expects water treatment industry businesses; free listing review takes up to 1 year |
| FilterOut.com.au | Australia-only; expects water filtration businesses, not research datasets |
| EverythingAboutWater | B2B buyer's guide for water treatment industry; not suitable for consumer research |

---

## 6. Platforms Selected for Execution

**HIGH-VALUE (execute first):**
1. GitHub dataset repository — user has existing account
2. Zenodo — citable DOI, DataCite indexed
3. Kaggle — strong Google indexing, large community
4. HARO — free journalist query monitoring

**USEFUL (execute if easy):**
5. Hugging Face Datasets — free hosting, Dataset Viewer
6. data.world — good DA, public dataset page
7. Qwoted — high-DR publication backlinks
8. WaterHardness.org — data contribution for authority

---

## 7. Distribution Package Created

**File:** `lib/distributionPackage.js`

Contains complete prepared metadata for all 10 platforms:
- Title, description, keywords, citation, license
- Step-by-step submission process for each platform
- Account creation URLs and methods
- Expected benefits
- Prepared metadata objects

---

## 8. Exact Files Prepared for External Publication

| File | Purpose |
|------|---------|
| `dist/yohomefix-water-hardness-plumbing-risk-index.csv` | 155-city, 17-variable dataset (CSV) |
| `dist/README.md` | Dataset documentation with methodology, variables, limitations, citation, license |

**Generator script:** `scripts/generate-distribution-csv.js`

No source code or internal project files included in distribution package.

---

## 9. External Submissions ACTUALLY Completed

**None.** All platforms require user account creation that cannot be performed without the user's credentials or email access.

**Stage classification:**
- Zenodo: **A. OPPORTUNITY FOUND** → **B. PACKAGE PREPARED**
- Kaggle: **A. OPPORTUNITY FOUND** → **B. PACKAGE PREPARED**
- GitHub: **A. OPPORTUNITY FOUND** → **B. PACKAGE PREPARED** (user has account but gh CLI not authenticated)
- HARO: **A. OPPORTUNITY FOUND** → **B. PACKAGE PREPARED**
- Hugging Face: **A. OPPORTUNITY FOUND** → **B. PACKAGE PREPARED**
- data.world: **A. OPPORTUNITY FOUND** → **B. PACKAGE PREPARED**
- Qwoted: **A. OPPORTUNITY FOUND** → **B. PACKAGE PREPARED**
- WaterHardness.org: **A. OPPORTUNITY FOUND** → **B. PACKAGE PREPARED**

No submission has reached stage C (SUBMISSION STARTED) or beyond.

---

## 10. Public Records/Pages ACTUALLY Published

**None externally.** Two YoHomeFix code fixes deployed to production:
- Licensing language correction (live on yohomefix.com)
- Embed widget URL fix (live on yohomefix.com)

---

## 11. Exact Live External URLs for Published Records

**None.** No external platform pages have been published yet.

---

## 12. Backlinks ACTUALLY Verified

**None.** No external backlinks have been acquired or verified.

---

## 13. No-Email Resource Submissions Completed

**None completed.** WaterHardness.org has a public submission form (no email required for form submission), but the form requires browser interaction that cannot be executed programmatically. The submission is prepared and documented in the user action queue.

All water filtration/plumbing directories found during research require email registration and expect plumbing business listings, not research resources. Classified as UNSUITABLE.

---

## 14. Local Editorial Story Opportunities Identified

**8 stories identified** (documented in `lib/sprint8Distribution.js` as `LOCAL_STORIES`):

1. **Tucson, AZ** — Hardest water among major US cities (344 mg/L, 6x national median)
2. **Long Beach vs San Francisco, CA** — California's great water divide (308 vs 60 mg/L, 248 mg/L gap)
3. **Cape Coral vs Jacksonville, FL** — Florida's water hardness gap (285 vs 57 mg/L, 228 mg/L gap)
4. **Toledo, OH** — Triple plumbing threat (Very Hard + aging infra + high winter)
5. **Las Vegas, NV** — 14x harder water than Portland (278 vs 11 mg/L)
6. **Dayton vs Cleveland, OH** — Ohio's plumbing risk divide (275 vs 121 mg/L)
7. **Kansas City, MO** — Triple-threat profile (Hard + aging + freeze risk) — has drain cleaning page
8. **Boston, MA** — Softest water among major US cities (8 mg/L)

Each story includes: verified finding, source basis, relevant YoHomeFix commercial page, local publications, and submission mechanism.

---

## 15. Journalist Request Platforms Verified

| Platform | Status | Suitable | Action |
|----------|--------|----------|--------|
| HARO | Active (relaunched Apr 2025 by Featured.com) | Yes | Sign up, monitor 3x daily digests |
| Qwoted | Active | Yes | Create verified expert profile |
| Featured.com | Active | Yes | Respond to curated prompts |
| #JournoRequest (X) | Active | Yes | Monitor hashtag passively |
| Source of Sources | Active but high spam | No | Skip — low pickup rate |
| Help a B2B Writer | Active | No | Skip — B2B only |

YoHomeFix positioning: "nationwide homeowner connection and information platform with original water hardness and plumbing risk research" — NOT a licensed plumbing contractor.

---

## 16. Widget Distribution Opportunities

**Widget audit result:** Distribution-ready after URL fix.
- Embed code works: `https://yohomefix.com/research/embed` ✅
- HTTPS works ✅
- Attribution visible and links to canonical ✅
- No hidden SEO links ✅
- No intrusive behavior ✅
- Embed page uses `noindex, follow` (correct)

**Distribution targets:**
- WaterHardness.org — complementary resource (approach carefully)
- Home improvement blogs — identify during HARO monitoring
- Journalist articles — offer widget when journalists write about water quality

---

## 17. Research Asset Google Discovery Status

| Check | Status |
|-------|--------|
| Indexable | ✅ Yes |
| Canonical correct | ✅ `https://yohomefix.com/research/us-water-hardness-plumbing-risk` |
| Sitemap inclusion | ✅ In `/sitemap-static.xml`, priority 0.9 |
| Internal discovery | ✅ Homepage link, footer link, related resources |
| Dataset structured data | ✅ schema.org Dataset with license, creator, measurementTechnique, variableMeasured, temporalCoverage, spatialCoverage |
| CSV accessible | ✅ Client-side generation |
| Robots blocking | ✅ None |

---

## 18. Pre-Distribution Backlink/Visibility Baseline

| Metric | Value |
|--------|-------|
| Date | 2026-07-23 |
| Known referring domains | 0 |
| Known backlinks | 0 |
| GSC impressions (research page) | Not individually reported |
| GSC clicks | 0 |
| Indexed status | Indexed |
| External mentions | 0 |

This is the zero baseline. All future acquired authority should be measured against this.

---

## 19. Backlink Monitoring Status

**System created:** `lib/sprint8Distribution.js` contains `BACKLINK_TRACKER` array tracking 8 platforms with fields for:
- submission date, submission status, published URL, backlink present, backlink destination, follow/nofollow, first detected date, notes

All entries currently at `NOT STARTED` status. System is ready for updates as user completes submissions.

---

## 20. Maximum 5 User-Required Actions

| Priority | Platform | Action | Cost | Prepared |
|----------|----------|--------|------|----------|
| 1 | GitHub Dataset Repo | `gh auth login`, create public repo, push dist/ files | Free | CSV + README + metadata ready |
| 2 | Zenodo | Create account, follow 12-step submission | Free | All metadata prepared in `lib/distributionPackage.js` |
| 3 | Kaggle | Create account, verify phone, follow 10-step submission | Free | All metadata prepared |
| 4 | HARO | Sign up with email, monitor 3x daily digests, respond to relevant queries | Free | Expert positioning + 8 local stories prepared |
| 5 | Hugging Face | Create account, create dataset repo, upload CSV + card | Free | All metadata prepared |

---

## 21. Exact YoHomeFix Files Changed

| File | Change |
|------|--------|
| `pages/research/us-water-hardness-plumbing-risk.js` | Fixed embed URL, corrected CC BY 4.0 licensing language, updated schema.org description |
| `lib/distributionPackage.js` | NEW — External distribution package with prepared metadata for 10 platforms |
| `lib/sprint8Distribution.js` | NEW — Sprint #8 module: local stories, journalist channels, widget audit, Google discovery, backlink baseline, tracker, user action queue |
| `scripts/generate-distribution-csv.js` | NEW — CSV generation script for external distribution |
| `dist/yohomefix-water-hardness-plumbing-risk-index.csv` | NEW — Generated CSV (155 rows, 17 columns) |
| `dist/README.md` | NEW — Dataset documentation for external platforms |

---

## 22. Commit ID

**`8293ebdb`** — pushed to `origin/main` on `https://github.com/asimexports123/pseo-plumbing-site.git`

---

## 23. Production Verification

Deployed via GitHub → Vercel auto-deploy. Verified live on `https://yohomefix.com`:

| Check | Status |
|-------|--------|
| Embed URL fix | ✅ Live — `https://yohomefix.com/research/embed` |
| Licensing language fix | ✅ Live — corrected CC BY 4.0 scope |
| Research page title | ✅ "US City Water Hardness & Plumbing Risk Index" |
| Editorial finding | ✅ "80% of Sun Belt Cities Have Hard or Very Hard Water" |
| CSV download button | ✅ Live |
| Methodology section | ✅ Live |
| Citation section | ✅ Live with corrected license |
| OKC drain cleaning page | ✅ Live, RelatedServiceCallout cross-links intact |
| OKC emergency page | ✅ Live, RelatedServiceCallout cross-links intact |
| Marketcall phone | ✅ (844) 934-4386 on all CTAs |
| Sitemap | ✅ Live, 2 sub-sitemaps, lastmod 2026-07-23 |

---

## 24. Post-Sprint Regression Baseline

| Metric | Pre-Sprint | Post-Sprint | Status |
|--------|-----------|-------------|--------|
| Cities | 155 | 155 | ✅ No change |
| Services | 15 | 15 | ✅ No change |
| Sump Pump qualified cities | 63 | 63 | ✅ No change |
| City×Service URLs | 2,233 | 2,233 | ✅ No change |
| Sitemap URLs | 3,004 | 3,004 | ✅ No change |
| Static build pages | 3,008 | 3,008 | ✅ No change |
| Marketcall campaign | 348734 | 348734 | ✅ No change |
| Marketcall phone | (844) 934-4386 | (844) 934-4386 | ✅ No change |
| Money page titles/H1s | Sprint #6 frozen | Sprint #6 frozen | ✅ No change |
| RelatedServiceCallout | Sprint #7 intact | Sprint #7 intact | ✅ No change |

**No regression detected.**

---

## Stage Summary

| Stage | Count |
|-------|-------|
| A. OPPORTUNITY FOUND | 10 platforms |
| B. PACKAGE PREPARED | 10 platforms |
| C. SUBMISSION STARTED | 0 |
| D. SUBMISSION COMPLETED | 0 |
| E. EXTERNAL PAGE PUBLISHED | 0 |
| F. BACKLINK VERIFIED | 0 |
| G. RANKING MOVEMENT OBSERVED | 0 (baseline recorded, measure in 2-4 weeks) |
| H. ORGANIC CALL GENERATED | 0 (not measurable yet) |

---

## Success Criteria Assessment

1. **YoHomeFix has a defensible external distribution package.** ✅ — Complete package with corrected licensing, clean CSV, README, and prepared metadata for 10 platforms.

2. **At least some legitimate distribution actions have actually moved beyond research where access permits.** ⚠️ — All platforms require user account creation. Two production defects were found and fixed (embed URL, licensing language). Distribution package is fully prepared but no submissions have been started due to account requirements.

3. **Every remaining user-required action is reduced to a small, precise queue.** ✅ — 5 prioritized actions with exact steps, prepared metadata, and expected outcomes.

**Sprint #8 status: COMPLETE.** All code changes deployed. User action queue ready. No further development, account creation, or SEO changes to be started.
