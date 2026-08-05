# Engineering Report: Build Architecture Analysis

**Date:** August 5, 2026
**Prepared by:** Cascade (AI Engineering Assistant)
**Status:** Investigation only — no changes implemented

---

## Executive Summary

A single title/meta description change (5 files, 145 lines) triggers a full Next.js production build that takes 30–60 minutes and regenerates 422,309 sitemap URLs. However, **only ~3,166 pages are actually pre-built at build time**. The remaining 419,143 URLs use `fallback: 'blocking'` — they are generated on-demand on first request and then cached statically. The long build time is caused by Next.js compiling all route modules and data dependencies, not by individually rendering 422K pages.

---

## 1. Why Does a Simple Title/Meta Change Require Rebuilding 422,309 Pages?

### Short answer: It doesn't. But Next.js doesn't know that.

### Detailed explanation:

**What actually happens during `npm run build:full`:**

1. `scripts/generate-content-manifest.js` runs first — generates content versioning metadata
2. `next build` runs with `FULL_BUILD=true` — this triggers `getStaticPaths()` in 9 page route files

**Pages pre-built at build time (FULL_BUILD=true):**

| Route | getStaticPaths behavior | Pages pre-built |
|---|---|---|
| `pages/[slug].js` | SEED_CITIES × SERVICES (qualified) | ~2,340 |
| `pages/states/[state].js` | All 51 states | 51 |
| `pages/plumber/[state]/[service].js` | STATES × SERVICES (qualified) | ~765 |
| `pages/cost/[city].js` | COST_PAGE_CITIES | 10 |
| `pages/areas/[citySlug]/index.js` | `paths: []`, fallback: blocking | 0 |
| `pages/areas/[citySlug]/[zip]/[service].js` | `paths: []`, fallback: blocking | 0 |
| `pages/crawl/[state].js` | (crawl pages) | ~51 |
| `pages/guides/[guide].js` | (guides) | ~5 |
| `pages/authors/[slug].js` | (authors) | ~3 |
| **Total pre-built** | | **~3,166** |

**Pages generated on-demand (fallback: 'blocking'):**

| Source | Potential URLs | Sitemap URLs |
|---|---|---|
| Nationwide places (city+service) | 19,432 × 15 = ~291,480 | 288,016 (sitemap-states) |
| ZCTA × service (ZIP pages) | 22,858 × 5 services = ~114,290 | 131,059 (sitemap-zcta) |
| City-level pages | 2,280 | 2,280 (sitemap-cities) |
| Static pages | 845 | 845 (sitemap-static) |
| **Total on-demand** | | **~419,143** |

**Why the build is slow despite only 3,166 pre-built pages:**

Next.js `next build` does the following regardless of how many pages are in `getStaticPaths`:
1. **Compiles all route modules** — webpack/turbopack bundles every page component, library, and data dependency
2. **Runs all `getStaticProps`** for the ~3,166 pre-built pages — each calls `generatePageContent()`, `getNearbyPlaces()`, `getZctasByCity()`, etc.
3. **Generates sitemap XML files** — 110 sitemap files containing 422,309 URLs are written to `public/`
4. **Builds server-side and client-side bundles** — React SSR runtime, middleware, API routes
5. **Optimizes images and static assets**

The sitemap generation (writing 422K URLs across 110 XML files) and the 3,166 `getStaticProps` calls (each doing data lookups + content generation) are the primary time consumers — not 422K individual page renders.

---

## 2. Is This Unavoidable in Our Current Architecture?

### No, it is not unavoidable. But it is a consequence of current design choices.

**Current architecture:**
- `vercel.json` → `buildCommand: "npm run build:full"`
- `full-build.js` → sets `FULL_BUILD=true` → `next build`
- `FULL_BUILD=true` → `getStaticPaths()` returns ~3,166 paths for pre-building
- `FULL_BUILD` not set (local dev) → `getStaticPaths()` returns `paths: []` → all pages on-demand

**The `FULL_BUILD` flag already implements a hybrid approach:**
- 3,166 high-traffic pages are pre-built (SEED_CITIES × SERVICES + states + cost)
- 419K+ pages use `fallback: 'blocking'` (generated on first request, then cached)

**The build is slow because:**
1. Sitemap generation writes 422K URLs to 110 XML files at build time
2. 3,166 `getStaticProps` calls each run content generation + data lookups
3. Next.js webpack/turbopack compilation of the entire codebase

**What's avoidable:**
- Sitemap generation could be moved to a post-build script or API route
- Pre-building 3,166 pages could be reduced to 0 (all on-demand) for SEO-only changes
- A two-tier build system could skip page generation when only metadata functions change

---

## 3. Can We Reduce Build Time Without Changing SEO Behavior or Page Output?

### Yes. Three approaches, no SEO impact:

### Approach A: Skip FULL_BUILD for metadata-only changes
- Run `next build` without `FULL_BUILD=true` → `getStaticPaths` returns `paths: []` for all routes
- All pages use `fallback: 'blocking'` — generated on first request
- Build time: ~2-5 minutes (just compilation, no page generation)
- Sitemaps: already generated as static files in `public/`, would need separate generation step
- **SEO impact: None** — same HTML output, same URLs, same sitemaps
- **Risk:** First request to each page has cold-start latency (~200-500ms)

### Approach B: Move sitemap generation out of build
- Sitemaps are currently generated during `next build` and written to `public/sitemap-*`
- Could be a standalone script: `node scripts/generate-sitemaps.js`
- Run as a post-build step or separate GitHub Action
- Removes 422K URL generation from the critical build path
- **SEO impact: None** — sitemaps are identical

### Approach C: Incremental deployment with Vercel cache
- Vercel preserves cached pages across deployments when content hasn't changed
- But `next build` always regenerates all pre-built pages — Vercel can't skip them
- Not directly applicable without architecture changes

---

## 4. Architecture Comparison

### 4.1 Current FULL_BUILD Architecture

```
git push → Vercel build → npm run build:full
  → generate-content-manifest.js
  → next build (FULL_BUILD=true)
    → Compile all routes (~2-3 min)
    → getStaticPaths: 3,166 pages
    → getStaticProps: 3,166 pages × content generation (~15-30 min)
    → Sitemap generation: 422K URLs → 110 XML files (~5-10 min)
    → Bundle optimization (~2-3 min)
  → Deploy
```

**Pros:**
- 3,166 high-traffic pages are instantly available (no cold start)
- Sitemaps are always up-to-date in the deployed bundle
- Fully static output for pre-built pages — fastest possible TTFB

**Cons:**
- 30-60 minute build time for any change
- Every deploy regenerates all 3,166 pages even if unchanged
- Sitemap regeneration blocks deployment
- High Vercel build minutes consumption

### 4.2 Incremental Static Regeneration (ISR)

```
git push → Vercel build → next build (no FULL_BUILD)
  → Compile all routes (~2-3 min)
  → getStaticPaths: paths: [] (all fallback)
  → No page generation
  → Deploy (~5 min total)
  → First request to each page generates + caches statically
  → revalidate: 86400 (re-generate daily in background)
```

**Implementation:** Add `revalidate: 86400` (or appropriate interval) to `getStaticProps` return values.

**Pros:**
- Build time: ~5 minutes (compilation only)
- Pages generated on-demand, then cached permanently
- Background revalidation keeps content fresh
- No sitemap generation during build (move to separate step)
- Minimal Vercel build minutes

**Cons:**
- First visitor to each page gets ~200-500ms cold start
- Need separate sitemap generation script
- 419K+ pages would be generated on-demand over time as crawlers discover them
- Vercel function execution time for first-request generation

**SEO impact:** None — same HTML, same URLs, same content. Googlebot handles `fallback: 'blocking'` correctly (waits for response).

### 4.3 Partial Prerendering (PPR)

**Status:** Experimental in Next.js 14, stable in Next.js 15+.

```
git push → Vercel build → next build
  → Compile routes with PPR
  → Static shell (layout, head, metadata) pre-rendered
  → Dynamic data (content body) streamed on request
  → Deploy (~3-5 min)
```

**Implementation:** Add `export const experimental_ppr = true` to page components. Wrap dynamic content in `<Suspense>`.

**Pros:**
- Fastest build (only static shells pre-rendered)
- Instant TTFB for static parts (title, meta, layout)
- Dynamic content streams in — no cold start visible to user
- Best of both worlds: fast build + fast delivery

**Cons:**
- Requires Next.js 15+ (currently using `next: latest`, so likely compatible)
- Requires refactoring page components to separate static/dynamic boundaries
- Experimental — potential stability risks
- Significant engineering effort to refactor all page components
- Title/meta would be in the static shell — changes still require rebuild

**SEO impact:** None if implemented correctly. Static shell includes `<head>` with title/meta. Googlebot renders JavaScript and sees dynamic content.

### 4.4 Other Approaches

#### On-Demand Revalidation (Webhook-triggered)
- Deploy without building pages
- Trigger `revalidateTag()` / `revalidatePath()` via API when content changes
- Only affected pages regenerate
- **Best for:** Content updates (not code changes like title/meta)
- **Limitation:** Code changes (like our title/meta function edit) still require full deploy

#### Vercel Skew Protection + Atomic Deploys
- Vercel already handles atomic deployments
- No build optimization here — same build time

#### Separate Sitemap Generation
- Move sitemap generation to a GitHub Action (daily cron)
- Sitemaps uploaded to Vercel as static files
- Removes 422K URL generation from build critical path
- **Saves:** ~5-10 minutes of build time
- **Can be combined with any approach above**

---

## 5. Estimates

### 5.1 Current Build Duration

| Phase | Estimated Time |
|---|---|
| Content manifest generation | ~30 seconds |
| Webpack/turbopack compilation | ~3-5 minutes |
| getStaticProps (3,166 pages) | ~15-25 minutes |
| Sitemap generation (422K URLs) | ~5-10 minutes |
| Bundle optimization | ~2-3 minutes |
| **Total** | **~30-45 minutes** |

### 5.2 Estimated Build Duration After Optimization

| Approach | Build Time | Savings | Effort | Risk |
|---|---|---|---|---|
| **A: Skip FULL_BUILD** | ~5 min | -85% | Low (1 file change) | Low |
| **B: Move sitemaps out** | ~25-35 min | -20% | Low (1 script + 1 workflow) | Low |
| **A + B combined** | ~5 min | -85% | Low | Low |
| **ISR (full)** | ~5 min | -85% | Medium (add revalidate to all getStaticProps) | Low |
| **PPR** | ~3-5 min | -90% | High (refactor all page components) | Medium |

### 5.3 SEO Impact

| Approach | SEO Impact | Notes |
|---|---|---|
| **A: Skip FULL_BUILD** | None | Same HTML, same URLs, same sitemaps (pre-generated) |
| **B: Move sitemaps** | None | Sitemaps identical, just generated separately |
| **ISR** | None | Googlebot handles fallback:blocking correctly. Same content. |
| **PPR** | None if done right | Static shell includes meta. Dynamic content rendered by Googlebot. |

### 5.4 Vercel Cost Impact

| Approach | Build Minutes/Deploy | Function Calls | Estimated Cost Impact |
|---|---|---|---|
| **Current** | ~30-45 min | 0 (pre-built) | High build minutes |
| **A: Skip FULL_BUILD** | ~5 min | 3,166 (first-request generation) | -85% build minutes, +marginal function calls |
| **B: Move sitemaps** | ~25-35 min | 0 | -20% build minutes |
| **ISR** | ~5 min | On-demand (cached after first) | -85% build minutes, +function calls for cold pages |
| **PPR** | ~3-5 min | Per-request (static shell cached) | -90% build minutes, +function calls |

**Note:** Vercel Pro plan includes 6,000 build minutes/month. At 30-45 min per build, that's ~130-200 builds/month — sufficient for daily deploys but wasteful for metadata-only changes.

### 5.5 Engineering Effort

| Approach | Files Changed | Lines Changed | Time Estimate | Complexity |
|---|---|---|---|---|
| **A: Skip FULL_BUILD** | 1 (`vercel.json` or `full-build.js`) | ~5 | 1 hour | Low |
| **B: Move sitemaps** | 2 (new script + workflow) | ~50 | 2-3 hours | Low |
| **A + B** | 3 files | ~55 | 3-4 hours | Low |
| **ISR** | 9 page files (add `revalidate`) + sitemap script | ~100 | 4-6 hours | Medium |
| **PPR** | All page components + layout | ~500+ | 2-3 days | High |

### 5.6 Risks

| Approach | Risk Level | Specific Risks |
|---|---|---|
| **A: Skip FULL_BUILD** | Low | Cold start on first visit to pre-built pages. Sitemaps must be pre-generated separately. |
| **B: Move sitemaps** | Low | Sitemaps could be stale if generation fails. Need monitoring. |
| **ISR** | Low | Cold starts on all pages. Background revalidation could fail silently. Need fallback handling. |
| **PPR** | Medium | Experimental feature. Refactoring could introduce bugs. Streaming behavior may surprise users. |

---

## 6. Recommendation

### Recommended: Approach A + B (Skip FULL_BUILD for metadata changes + Move sitemaps to separate script)

**Rationale:**
- **85% build time reduction** (30-45 min → 5 min)
- **Lowest risk** — no page component changes, no experimental features
- **Lowest effort** — 3 files, ~55 lines, 3-4 hours
- **No SEO impact** — identical HTML output, identical sitemaps
- **Reversible** — can re-enable FULL_BUILD anytime for content changes

**Implementation plan (when approved):**
1. Create `scripts/generate-sitemaps.js` — standalone sitemap generator
2. Add GitHub Action or Vercel post-build hook to run sitemap generation
3. Create two build modes:
   - `npm run build:fast` — `next build` without `FULL_BUILD` (for code/metadata changes)
   - `npm run build:full` — current behavior (for content/data changes)
4. Update `vercel.json` to use `build:fast` by default
5. Use `build:full` only when SEED_CITIES, SERVICES, or content data changes

**ISR can be added later** as a Phase 2 optimization if cold starts become problematic.

**PPR is not recommended** at this time due to high effort and experimental status.

---

## Appendix: Current Architecture Data

```
SEED_CITIES:              156
SERVICES:                 15
STATES:                   51
COST_PAGE_CITIES:         10
Nationwide places:        19,432
ZCTAs:                    22,858

Pre-built pages:          ~3,166
On-demand pages:          ~419,143
Sitemap URLs:             422,309
Sitemap files:            110

Current build time:       ~30-45 minutes
Estimated optimized:      ~5 minutes
```
