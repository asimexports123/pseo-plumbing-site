# Sprint #7 — Authority Concentration
## Final Consolidated Report

**Date:** 2026-07-23
**Sprint Focus:** Improve rankings and increase organic calls for YoHomeFix.com
**Primary Target:** "emergency drain service oklahoma city" (pos 29.48, 19,292 impressions)
**Secondary Targets:** "emergency drain service baltimore" (pos 35.55), "emergency water heater repair new orleans" (pos 46.67)

---

## Phase Summary

| Phase | Status | Key Output |
|-------|--------|------------|
| 0 — Regression safety | ✅ Complete | 3,008 pages, 3,003 sitemap URLs, 155 cities, 15 services — no regression |
| 1 — Identify targets | ✅ Complete | 1 primary + 3 secondary targets from GSC data |
| 2 — Position reconciliation | ✅ Complete | Query-level positions mapped to pages |
| 3 — SERP competitor analysis | ✅ Complete | Competitors have higher DA; content gaps are minimal |
| 4 — Internal authority map | ✅ Complete | Homepage → state hub → state×service hub → city page chain confirmed |
| 5 — Authority concentration | ✅ Complete | RelatedServiceCallout component deployed across all city-service pages |
| 6 — Quality gap audit | ✅ Complete | Content is competitive; ranking gap is authority-driven, not content-driven |
| 7 — External authority | ✅ Complete (code) | 4 platforms identified; all require user account creation |
| 8 — Data asset distribution | ✅ Complete | CSV download + methodology section + citation guidance added |
| 9 — News hook | ✅ Complete | "80% of Sun Belt cities have hard water vs 0% of Northeast" editorial finding |
| 10 — Cluster assessment | ✅ Complete | Supporting cluster is comprehensive — no missing pages |
| 11 — Indexing verification | ✅ Complete | Target page live, sitemap current, Sprint #6 changes confirmed in production |
| 12 — Call path verification | ✅ Complete | 6 tel: CTAs confirmed on target page, Marketcall phone (844) 934-4386 |
| 13 — Ranking tracker baseline | ✅ Complete | SPRINT7_TARGETS + SPRINT7_SUMMARY in organicCallScoreboard.js |
| 14 — Opportunity monitor | ✅ Complete | scripts/opportunity-monitor.js — tested against live GSC data |
| 15 — Final report | ✅ This document |

---

## Code Changes Made

### 1. RelatedServiceCallout Component (PlumberPage.js)
**File:** `components/PlumberPage.js`
**Impact:** Systemic — affects ALL 2,233 city-service pages

Added a `SERVICE_CALLOUTS` map and `RelatedServiceCallout` component that creates contextual in-body cross-links between related services for the same city. Placed after the preventive tips section and before the mid-page CTA.

Cross-link pairs:
- emergency ↔ drain-cleaning, water-heater-repair
- drain-cleaning ↔ emergency, sewer-line-repair
- water-heater-repair ↔ emergency, leak-repair
- leak-repair ↔ emergency, drain-cleaning
- pipe-burst-repair ↔ emergency, leak-repair
- sewer-line-repair ↔ drain-cleaning, emergency

Each callout only renders if the target city qualifies for the related service (checked via `isCityQualifiedForService`).

### 2. CSV Download + Methodology (Research Page)
**File:** `pages/research/us-water-hardness-plumbing-risk.js`
**Impact:** Makes the 155-city water hardness dataset downloadable as CSV

- Added `downloadCsv` function that generates CSV client-side with 17 variables per city
- Added "Download Dataset (CSV)" button in the citation section
- Added full methodology section explaining data sources, tiering, and risk scoring

### 3. Editorial Research Finding (News Hook)
**File:** `pages/research/us-water-hardness-plumbing-risk.js`
**Impact:** Creates a citable, data-driven finding for external outreach

Added a prominent "RESEARCH FINDING" callout: "80% of Sun Belt Cities Have Hard or Very Hard Water — vs 0% in the Northeast". Based on actual dataset analysis:
- Sun Belt average: 194 mg/L
- Northeast average: 88 mg/L
- 49 cities have "very hard" water (>180 mg/L), nearly all in Sun Belt/Mountain West

### 4. Sprint #7 Ranking Tracker (organicCallScoreboard.js)
**File:** `lib/organicCallScoreboard.js`
**Impact:** Baseline positions recorded for 4 target pages

Added `SPRINT7_TARGETS` array with GSC baseline positions, top queries, and Sprint #7 actions for each target. Added `SPRINT7_SUMMARY` with implementation summary and pending external actions.

### 5. Opportunity Monitor Script
**File:** `scripts/opportunity-monitor.js`
**Impact:** Reusable tool for ongoing GSC analysis

Automated GSC CSV parser that:
- Classifies queries into 3 tiers by position and impression volume
- Filters for commercial intent (excludes informational/DIY queries)
- Compares against previous baseline to detect ranking movement
- Saves baseline JSON for next-run comparison

Test output identified 2 Tier 1 queries (page 2-3), 8 Tier 2 queries (page 3-5), 59 Tier 3 queries.

---

## What Was NOT Changed (Per Sprint Constraints)

- ❌ No title/H1/meta rewrites (Sprint #6 frozen)
- ❌ No Marketcall config changes
- ❌ No new pages created
- ❌ No mass content creation
- ❌ No Valendiro modifications
- ❌ No backlinks purchased
- ❌ No spam or fake listings
- ❌ No compliance removal

---

## External Authority Actions (Pending User Execution)

All external platforms require user account creation. None could be auto-executed.

| Platform | Action Required | Expected Outcome |
|----------|----------------|------------------|
| Zenodo (zenodo.org) | Create ORCID account, upload CSV dataset | Citable DOI for research asset |
| HARO (helpareporter.com) | Sign up with email, respond to journalist queries | Editorial backlinks from news articles |
| Featured.com | Create account, answer publisher questions (3/mo free) | Published Q&A content with backlink |
| RDL Hub (rawdatalibrary.net) | Create account, upload CSV | DOI + dataset discovery surface |

**Backlinks acquired this sprint: 0** (all require user credentials)

---

## Production Verification

- ✅ Build compiles successfully (6.0s)
- ✅ 3,008 static pages (no regression)
- ✅ Target page live: `https://yohomefix.com/plumber-oklahoma-city-drain-cleaning`
- ✅ Sitemap live with city-service URLs
- ✅ Homepage Sprint #6 changes confirmed live
- ✅ 6 call CTAs with `tel:+18449344386` on target page
- ✅ Marketcall phone (844) 934-4386 consistent across all CTAs

---

## Next Steps

1. **Deploy** the current build to production
2. **Wait 2 weeks**, then run `node scripts/opportunity-monitor.js <new-queries.csv> --baseline <baseline.json>` to measure movement
3. **Create accounts** on Zenodo, HARO, Featured.com, and RDL Hub when email is available
4. **Upload CSV dataset** to Zenodo for citable DOI
5. **Respond to HARO queries** about plumbing, home services, water quality
6. **Monitor GSC** for position changes on primary target (baseline: pos 29.48)
7. **Check GSC at 4-week mark** — if no movement, consider content expansion for target page

---

## Files Modified

| File | Change |
|------|--------|
| `components/PlumberPage.js` | Added `SERVICE_CALLOUTS` map + `RelatedServiceCallout` component + render call |
| `pages/research/us-water-hardness-plumbing-risk.js` | Added CSV download, methodology section, editorial finding callout |
| `lib/organicCallScoreboard.js` | Added `SPRINT7_TARGETS` and `SPRINT7_SUMMARY` |
| `scripts/opportunity-monitor.js` | New file — automated GSC analysis tool |
