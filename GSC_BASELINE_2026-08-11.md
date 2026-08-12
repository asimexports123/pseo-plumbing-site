# GSC Baseline Report — 2026-08-11

**Purpose:** Pre-hero-rollout baseline for future comparison.  
**Data source:** `gsc-data/snapshot-2026-07-28.json` (most recent non-empty snapshot)  
**Coverage window:** Snapshots from 2026-07-25 to 2026-07-28  
**Site:** `sc-domain:yohomefix.com`  

> **IMPORTANT:** This is a baseline only. The hero redesign was deployed on 2026-08-11.  
> No conclusions about hero impact should be drawn until at least 7-14 days of post-deploy GSC data is available.

---

## 1. Baseline Summary (Latest Snapshot: 2026-07-28)

| Metric | Value |
|---|---|
| Total Impressions | 12,474 |
| Total Clicks | 1 |
| Average CTR | 0.008% |
| Average Position | 47.2 |
| Pages tracked | 3,149 |
| Queries tracked | 3,084 |

### Daily trend (available snapshots)

| Date | Impressions | Clicks | CTR | Avg Position | Pages | Queries |
|---|---|---|---|---|---|---|
| 2026-07-25 | 3,635 | 3 | 0.083% | 45.0 | 1,020 | 1,209 |
| 2026-07-26 | 6,470 | 0 | 0.000% | 46.2 | 1,590 | 2,212 |
| 2026-07-27 | 10,874 | 1 | 0.009% | 50.6 | 2,620 | 3,206 |
| 2026-07-28 | 12,474 | 1 | 0.008% | 47.2 | 3,149 | 3,084 |

**Observation:** Impressions are growing rapidly (3.4x in 4 days), likely due to Google indexing more pages. Clicks remain near zero across all days.

---

## 2. Device Breakdown (2026-07-28)

| Device | Impressions | Clicks | CTR | Avg Position |
|---|---|---|---|---|
| Mobile | 4,292 | 1 | 0.02% | 33.0 |
| Desktop | 6,355 | 0 | 0.00% | 51.7 |
| Tablet | 542 | 0 | 0.00% | 60.3 |

**Key finding:** Mobile has significantly better average position (33 vs 52 desktop) and the only click. Desktop gets more impressions but ranks worse.

---

## 3. Country Breakdown

| Country | Impressions | Clicks | Avg Position |
|---|---|---|---|
| USA | 10,930 | 0 | 45.1 |
| Canada | 71 | 0 | 62.6 |
| UK | 63 | 0 | 21.6 |
| Netherlands | 16 | 0 | 5.9 |
| Germany | 18 | 0 | 19.1 |
| Norway | 1 | 1 | 12.0 |
| All others | ~1,275 | 0 | varies |

**Note:** The single click came from Norway (`plumber-brazil-toilet-repair`). USA — the target market — has zero clicks despite 10,930 impressions.

---

## 4. Branded vs Non-Branded Queries

**Branded queries (containing "yohomefix"):** None found.  
**All queries are non-branded.** The site has zero brand awareness in search.

---

## 5. Low Impressions + Clicks (Click-Positive Pages)

Only **1 page** received any clicks:

| Page | Impressions | Clicks | CTR | Position |
|---|---|---|---|---|
| `/plumber-brazil-toilet-repair` | 2 | 1 | 50% | 9.5 |

**Assessment:** Statistically insignificant. 2 impressions / 1 click is noise, not a pattern. Do not assume position #1 — avg position is 9.5 (page 1 bottom).

---

## 6. High Impressions + Zero Clicks (Top 30)

| Page | Impressions | Position |
|---|---|---|
| `/plumber-oklahoma-city-drain-cleaning` | 1,088 | 28.0 |
| `/plumber-summertown-emergency` | 392 | 65.3 |
| `/plumber-baltimore-drain-cleaning` | 170 | 33.2 |
| `/plumber-washington` | 103 | 76.9 |
| `/plumber-cleveland-water-heater-repair` | 73 | 86.5 |
| `/plumber-locust-grove-ok-drain-cleaning` | 68 | 83.2 |
| `/plumber-phoenix-emergency` | 68 | 58.5 |
| `/plumber-minneapolis-water-heater-repair` | 64 | 82.1 |
| `/plumber-jacksonville-leak-repair` | 61 | 79.3 |
| `/plumber-los-angeles-emergency` | 61 | 68.1 |
| `/plumber-kingman-ks-water-heater-repair` | 60 | 16.6 |
| `/plumber-columbia-drain-cleaning` | 55 | 27.7 |
| `/plumber-austin-in-drain-cleaning` | 49 | 44.5 |
| `/plumber-cincinnati-emergency` | 49 | 32.8 |
| `/plumber-bloomington-il-drain-cleaning` | 46 | 62.5 |
| `/plumber-chicago-emergency` | 45 | 56.8 |
| `/plumber-ashland-mo-emergency` | 42 | 34.5 |
| `/plumber-dallas-emergency` | 42 | 71.2 |
| `/plumber-elgin-water-heater-repair` | 40 | 69.6 |
| `/plumber-san-antonio-emergency` | 40 | 69.1 |
| `/plumber-coeur-d-alene-water-heater-repair` | 39 | 51.4 |
| `/plumber-seattle-emergency` | 39 | 79.4 |
| `/plumber-tempe-sewer-line-repair` | 39 | 60.1 |
| `/plumber-grimes-water-heater-repair` | 38 | 41.3 |
| `/plumber-milwaukee-emergency` | 33 | 47.2 |
| `/plumber-portland-emergency` | 33 | 48.8 |
| `/plumber-st.-louis-water-heater-repair` | 33 | 62.5 |
| `/plumber-tequesta-water-heater-repair` | 33 | 29.1 |
| `/plumber-murrieta-sewer-line-repair` | 31 | 70.2 |
| `/plumber-san-diego-emergency` | 31 | 61.6 |

**Pattern:** Most high-impression pages rank on pages 3-8 (position 28-87). They get crawled and indexed but are too deep to earn clicks.

---

## 7. Top Queries by Impressions (All Zero Clicks)

| Query | Impressions | Position |
|---|---|---|
| emergency drain service | 986 | 22.4 |
| 24 hour plumber | 537 | 54.7 |
| emergency plumber | 385 | 24.1 |
| water heater repair | 163 | 13.6 |
| emergency drain cleaning service | 101 | 37.5 |
| emergency plumbing | 96 | 46.0 |
| 24 7 plumber | 92 | 14.7 |
| emergency plumbing services | 83 | 37.2 |
| emergency plumber near me | 82 | 26.2 |
| 24 hour plumbers | 75 | 14.0 |
| emergency water heater repair | 64 | 85.5 |
| water heater repair near me | 62 | 14.9 |
| emergency drain service near me | 57 | 27.5 |
| 24 hour drain cleaning service | 52 | 39.5 |
| emergency plumbing near me | 49 | 21.6 |
| 24 hour plumbers near me | 44 | 14.9 |
| emergency hot water heater repair | 40 | 84.1 |
| same day plumber | 40 | 19.6 |
| 24 hour drain service | 34 | 39.6 |
| emergency plumbing services near me | 34 | 21.0 |

---

## 8. Queries Ranking on Page 1 (Position <15, ≥10 impressions)

| Query | Impressions | Position | CTR |
|---|---|---|---|
| water heater repair | 163 | 13.6 | 0% |
| 24 7 plumber | 92 | 14.7 | 0% |
| 24 hour plumbers | 75 | 14.0 | 0% |
| water heater repair near me | 62 | 14.9 | 0% |
| 24 hour plumbers near me | 44 | 14.9 | 0% |
| water heater replacement near me | 31 | 14.6 | 0% |
| plumber | 26 | 11.8 | 0% |
| heater repair | 25 | 9.6 | 0% |
| toilet repair | 13 | 12.4 | 0% |
| water heater replacement | 12 | 14.9 | 0% |

**Critical finding:** These queries are on page 1 of Google but receiving ZERO clicks. This suggests either:
- Title/meta description is not compelling enough
- Pages are ranking at the very bottom of page 1 (position 13-15) and are below the fold
- Search intent mismatch — Google is showing the page but users don't click

---

## 9. Pages Ranking in Top 10 (Position <10, ≥5 impressions)

| Page | Impressions | Position |
|---|---|---|
| `/plumber-waterproof-drain-cleaning` | 18 | 4.1 |
| `/plumber-elton-drain-cleaning` | 16 | 6.4 |
| `/plumber-defuniak-springs-emergency` | 14 | 8.1 |
| `/plumber-buffalo-ok-water-line-repair` | 10 | 5.0 |
| `/areas/battle-lake/56515/water-line-repair` | 8 | 1.1 |
| `/areas/gadsden/35904/slab-leak-repair` | 8 | 2.6 |
| `/areas/ubly/48475/slab-leak-repair` | 8 | 1.1 |
| `/plumber-kaplan-drain-cleaning` | 8 | 6.8 |
| `/areas/amboy-mn/56010/water-line-repair` | 7 | 1.0 |
| `/areas/minneapolis/55405/water-line-repair` | 7 | 2.3 |
| `/areas/moose-lake/55767/water-line-repair` | 7 | 1.9 |
| `/plumber-cleveland-ga-main-water-shutoff-valve-repair` | 7 | 9.9 |
| `/plumber-dexter-ga-water-heater-repair` | 7 | 8.4 |
| `/plumber-richfield-water-line-repair` | 7 | 9.0 |
| `/areas/brownsdale/55918/water-line-repair` | 6 | 1.0 |
| `/areas/elmwood-park/07407/slab-leak-repair` | 6 | 5.3 |
| `/areas/galena-md/21635/water-line-repair` | 6 | 5.3 |
| `/areas/ithaca/48847/slab-leak-repair` | 6 | 3.5 |
| `/areas/mulliken/48861/slab-leak-repair` | 6 | 4.2 |
| `/areas/newton/02459/water-line-repair` | 6 | 3.2 |
| `/areas/sault-ste-marie/49783/slab-leak-repair` | 6 | 3.5 |
| `/areas/wood-lake/56297/water-line-repair` | 6 | 1.2 |
| `/plumber-baker-emergency` | 6 | 7.5 |
| `/plumber-henagar-water-heater-repair` | 6 | 6.7 |
| `/plumber-ocilla-garbage-disposal-repair` | 6 | 9.7 |
| `/plumber-zumbrota-sewer-line-repair` | 6 | 7.5 |

**Pattern:** Pages ranking in top 5 positions are almost all small-town ZIP pages (`/areas/...`) with very low search volume. They rank well because competition is low, but volume is tiny.

---

## 10. Service Type Breakdown (by query impressions)

| Service | Impressions | Clicks |
|---|---|---|
| Emergency (general) | 3,813 | 0 |
| Other/mixed | 2,273 | 0 |
| Water heater | 1,042 | 0 |
| Drain | 601 | 0 |
| Sewer | 398 | 0 |
| Pipe | 208 | 0 |
| Toilet | 142 | 0 |
| Repiping | 107 | 0 |
| Leak | 105 | 0 |
| Sump pump | 92 | 0 |
| Water softener | 71 | 0 |
| Water line | 67 | 0 |
| Slab leak | 67 | 0 |
| Garbage disposal | 65 | 0 |
| Faucet | 38 | 0 |
| Shutoff valve | 1 | 0 |

---

## 11. 404 Coverage Report (2026-08-08)

- **471 URLs** returning 404 (Not Found) as of 2026-08-05
- Started at 41 on 2026-07-11, jumped to 471 on 2026-07-25
- Most are `/areas/{city}/{zip}/{service}` and `/plumber-{city}-{service}` URLs
- These are pages Google has discovered but that don't resolve

---

## 12. Comparison: Low-Impression/Click vs High-Impression/No-Click

| Attribute | Low-Imp + Click | High-Imp + No-Click |
|---|---|---|
| Example | `/plumber-brazil-toilet-repair` (2 imp, 1 clk) | `/plumber-oklahoma-city-drain-cleaning` (1,088 imp, 0 clk) |
| Position | 9.5 | 28.0 |
| Pattern | Rare query, less competition, user finds exactly what they want | Broad query, high competition, buried deep in results |
| Volume | Negligible | Significant but invisible |
| Takeaway | Low-volume long-tail can convert | Need to climb to page 1 to earn clicks |

---

## 13. Pages/Queries to WATCH After Hero Rollout

### Tier 1 — High priority watch list

| Item | Why |
|---|---|
| `/plumber-oklahoma-city-drain-cleaning` | 1,088 impressions — highest volume page, position 28 |
| `emergency drain service` (query) | 986 impressions, position 22.4 — top query |
| `/plumber-summertown-emergency` | 392 impressions, position 65 — anomaly worth watching |
| `/plumber-baltimore-drain-cleaning` | 170 impressions, position 33 |
| `24 hour plumber` (query) | 537 impressions, position 54.7 |
| `emergency plumber` (query) | 385 impressions, position 24.1 |
| `water heater repair` (query) | 163 impressions, position 13.6 — on page 1 but zero clicks |

### Tier 2 — Page 1 queries with zero CTR (biggest opportunity)

| Query | Impressions | Position |
|---|---|---|
| water heater repair | 163 | 13.6 |
| 24 7 plumber | 92 | 14.7 |
| 24 hour plumbers | 75 | 14.0 |
| water heater repair near me | 62 | 14.9 |
| 24 hour plumbers near me | 44 | 14.9 |
| plumber | 26 | 11.8 |
| heater repair | 25 | 9.6 |

### Tier 3 — Pages already ranking in top 5 (watch for position changes)

| Page | Position | Impressions |
|---|---|---|
| `/areas/amboy-mn/56010/water-line-repair` | 1.0 | 7 |
| `/areas/brownsdale/55918/water-line-repair` | 1.0 | 6 |
| `/areas/battle-lake/56515/water-line-repair` | 1.1 | 8 |
| `/areas/ubly/48475/slab-leak-repair` | 1.1 | 8 |
| `/areas/wood-lake/56297/water-line-repair` | 1.2 | 6 |
| `/plumber-waterproof-drain-cleaning` | 4.1 | 18 |

---

## 14. Baseline Metrics Summary

| Metric | Baseline Value |
|---|---|
| Total daily impressions (avg) | ~8,000-12,500 |
| Total daily clicks | 0-3 |
| Overall CTR | ~0.01% |
| Average position | ~47 |
| Mobile avg position | 33.0 |
| Desktop avg position | 51.7 |
| USA impressions | 10,930 |
| USA clicks | 0 |
| Branded queries | 0 |
| Pages in top 10 (pos <10, ≥5 imp) | 26 |
| Queries in top 15 (pos <15, ≥10 imp) | 10 |
| 404 URLs in GSC | 471 |

---

## 15. Key Findings & Problems Worth Investigating Later

1. **Near-zero CTR across the board (0.008%)** — Even pages on page 1 get zero clicks. Title/meta or snippet may need work, or pages are at the very bottom of page 1.

2. **Zero branded search** — No one is searching for "yohomefix" by name. All traffic is purely non-branded/intent-based.

3. **471 404 URLs in GSC** — Google is finding URLs that don't resolve. This wastes crawl budget and may hurt site quality signals.

4. **Desktop ranks much worse than mobile** (position 52 vs 33). Possible mobile-first indexing issue or content parity problem.

5. **The single click came from Norway**, not the USA. The target market (USA) has zero clicks despite 10,930 impressions.

6. **`/plumber-oklahoma-city-drain-cleaning` is a massive outlier** — 1,088 impressions (8.7% of total) at position 28. Worth investigating why this single page gets so much more visibility.

7. **Emergency + drain queries dominate** (3,813 + 601 = 4,414 impressions, 35% of total). These are the core commercial terms.

8. **Impressions growing 3.4x in 4 days** — Google is actively indexing more pages. The site is in a growth phase for impressions, but clicks are not following.

---

*This is a baseline report only. No changes recommended at this time. Compare against future GSC exports 7-14 days post-hero-deploy to assess impact.*
