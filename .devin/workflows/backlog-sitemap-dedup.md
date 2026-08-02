---
description: Remove ~3,207 duplicate sitemap entries by ensuring each URL appears in only one sitemap
---

# Backlog: Remove Duplicate Sitemap Entries

**Status**: Not started — do not implement until explicitly requested
**Created**: 2026-07-27
**Priority**: Low

## Problem

3,207 duplicate URL occurrences exist across the production sitemap system. The same URLs appear in multiple child sitemaps:

| Duplicate Type | Count | Sitemaps Involved |
|---|---|---|
| State hub pages (`/plumber-{state}`) | 2,258 | `sitemap-static/0.xml` AND `sitemap-states/{state}/0.xml` |
| State-service pages (`/plumber/{state}/{service}`) | 757 | `sitemap-static/0.xml` AND `sitemap-states/{state}/0.xml` |
| City-service pages (seed cities) | 14 | `sitemap-cities/0.xml` AND `sitemap-states/{state}/0.xml` |
| Other (St. Louis, St. Paul) | 44 | Same pattern |
| **Total** | **3,207** | |

## Root Cause

In `lib/sitemap.js`:

- `staticUrlList()` (line 56-57) includes all state hub URLs and state-service URLs
- `getStateSitemapChunks()` (line 114-118) also includes the same state hub and state-service URLs
- `getCityUrlList()` includes seed city-service URLs
- `getStateSitemapChunks()` also includes seed city-service URLs for that state

## Proposed Fix

Remove state hub and state-service URLs from `staticUrlList()` since they are already covered by `getStateSitemapChunks()`. The static sitemap should only contain truly static pages (homepage, about, faq, guides, cost pages, authors, etc.).

Similarly, remove seed city-service URLs from either `getCityUrlList()` or `getStateSitemapChunks()` to avoid the 14 city-service duplicates.

### Files to modify:
- `lib/sitemap.js` — `staticUrlList()` function (lines 56-57) and potentially `getStateSitemapChunks()` or `getCityUrlList()`

### Expected result:
- Total sitemap URLs: 643,735 → ~640,528 (unique)
- No URL appears in more than one child sitemap
- Google deduplication no longer needed

## Context

- Full audit was performed on 2026-07-27 against production (yohomefix.com)
- 124 child sitemaps, all returning HTTP 200
- Google Search Console showing ~168,633 discovered URLs (crawl lag, not a sitemap issue)
- Sitemap architecture is otherwise correct — no changes needed to chunking, qualification filters, or XML generation
