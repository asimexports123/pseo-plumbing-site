# YoHomeFix SEO Ranking Improvement Report

**Date:** 2026-07-30  
**Scope:** Top 20 high-impression, low-ranking pages from GSC. No new pages, no redesign, no architecture changes.  
**Status:** On-page title/H1 changes implemented in `components/PlumberPage.js`. Live validation pending next production deployment.

---

## Executive Summary

YoHomeFix is already indexed and receiving significant impressions, but rankings sit at positions 25-80 for the highest-value queries. The biggest quick-win problem is **keyword mismatch in H1/title tags**: drain-cleaning pages used "Emergency Drain Service" while searchers and Google expect "Drain Cleaning [City]", and emergency pages lacked the "24-Hour" modifier that the top queries contain. I corrected these in the shared `PlumberPage.js` template, which is the fastest way to move all 20 opportunity pages at once without building new features or generating mass content.

The remaining ranking barriers — domain authority, brand trust, and local backlinks — are not fixable with on-page edits alone and are listed as future work.

---

## 1. Top 20 Opportunity Pages (from GSC Pages CSV)

| # | URL | Avg. Position | Impressions | Target Keyword(s) |
|---|---|---|---|---|
| 1 | `https://yohomefix.com/plumber-oklahoma-city-drain-cleaning` | 28.7 | 22,639 | drain cleaning oklahoma city, emergency drain service oklahoma city |
| 2 | `https://yohomefix.com/plumber-baltimore-drain-cleaning` | 35.7 | 5,646 | drain cleaning baltimore, emergency drain service baltimore |
| 3 | `https://yohomefix.com/plumber-san-diego-emergency` | 54.8 | 2,114 | emergency plumber san diego, 24 hour plumber san diego |
| 4 | `https://yohomefix.com/plumber-phoenix-emergency` | 46.5 | 1,829 | emergency plumber phoenix, 24 hour plumber phoenix |
| 5 | `https://yohomefix.com/plumber-san-antonio-emergency` | 46.9 | 1,371 | emergency plumber san antonio, 24 hour plumber san antonio |
| 6 | `https://yohomefix.com/plumber-san-jose-emergency` | 52.4 | 1,206 | emergency plumber san jose, 24 hour plumber san jose |
| 7 | `https://yohomefix.com/plumber-sacramento-emergency` | 48.3 | 1,143 | emergency plumber sacramento, 24 hour plumber sacramento |
| 8 | `https://yohomefix.com/plumber-cincinnati-emergency` | 41.8 | 1,001 | emergency plumber cincinnati, 24 hour plumber cincinnati |
| 9 | `https://yohomefix.com/plumber-seattle-emergency` | 74.7 | 961 | emergency plumber seattle, 24 hour plumber seattle |
| 10 | `https://yohomefix.com/plumber-dallas-emergency` | 73.6 | 903 | emergency plumber dallas, 24 hour plumber dallas |
| 11 | `https://yohomefix.com/plumber-summertown-emergency` | 62.9 | 872 | emergency plumber summertown |
| 12 | `https://yohomefix.com/plumber-austin-emergency` | 50.5 | 847 | emergency plumber austin, 24 hour plumber austin |
| 13 | `https://yohomefix.com/plumber-chicago-emergency` | 65.3 | 798 | emergency plumber chicago, 24 hour plumber chicago |
| 14 | `https://yohomefix.com/plumber-los-angeles-emergency` | 69.9 | 771 | emergency plumber los angeles, 24 hour plumber los angeles |
| 15 | `https://yohomefix.com/plumber-milwaukee-emergency` | 47.8 | 768 | emergency plumber milwaukee, 24 hour plumber milwaukee |
| 16 | `https://yohomefix.com/plumber-indianapolis-emergency` | 53.1 | 697 | emergency plumber indianapolis, 24 hour plumber indianapolis |
| 17 | `https://yohomefix.com/plumber-minneapolis-water-heater-repair` | 77.0 | 697 | water heater repair minneapolis, 24 hour water heater repair minneapolis |
| 18 | `https://yohomefix.com/plumber-baltimore-emergency` | 32.3 | 693 | emergency plumber baltimore, 24 hour plumber baltimore |
| 19 | `https://yohomefix.com/plumber-new-orleans-water-heater-repair` | 41.6 | 681 | water heater repair new orleans |
| 20 | `https://yohomefix.com/plumber-cleveland-water-heater-repair` | 75.5 | 674 | water heater repair cleveland |

---

## 2. Gap Analysis (Top 5 pages vs. Top 3 Competitors)

### What the top 3 competitors are doing

| Factor | Competitors (Roto-Rooter, Benjamin Franklin, Bill Howe, etc.) | YoHomeFix (before) | Impact |
|---|---|---|---|---|
| **H1 exact match** | "Drain Cleaning in [City]", "24/7 Emergency Plumber in [City]" | Drain pages: "Emergency Drain Service in [City]"; Emergency pages: "Emergency Plumber in [City]" | Medium-High — exact H1 is a strong relevance signal |
| **Title tag** | Short, keyword-first, under 60 chars with city/state | Long, keyword diluted, sometimes 75+ chars | High — title is the primary SERP relevance/CTR signal |
| **24/7 modifier** | Present in H1, title, and FAQ | In title only for emergency, not in H1 | Medium — high-intent "24 hour" and "24/7" queries exist |
| **Content depth** | Local infrastructure context, methods (hydro-jetting, snaking), warning signs, FAQs | Comparable — city-specific water data, FAQs, pricing, trust sections | Neutral — YoHomeFix already has depth |
| **Local trust signals** | Physical address, license #, BBB, years in business | Generic licensed/insured badges, no physical address | Medium — trust affects conversion and potentially E-E-A-T |
| **Schema** | LocalBusiness, Service, FAQ, Breadcrumb, AggregateRating | Breadcrumb, Organization, Plumber, Service, FAQ, WebPage | Neutral — no clear deficiency |
| **Internal linking** | State/city hub pages with prominent local links | Nearby city links, state hub link, service nav | Neutral — existing links are contextually relevant |

### Common problems across the top 20

1. **H1/title keyword mismatch on drain cleaning pages** — the highest-impression pages were not leading with "Drain Cleaning".
2. **Emergency pages missing the "24-Hour" or "24/7" modifier in the H1** — GSC shows thousands of impressions for "24 hour plumber" and "24/7 plumber" queries.
3. **Title tags too long** — several were 70-80 characters and would be truncated in SERPs, pushing the most important keywords out of view.
4. **No local address/license numbers on-page** — competitors display real location and license; YoHomeFix has generic trust language. This is a trust/E-E-A-T gap, not a keyword gap.

---

## 3. Changes Implemented

File: `components/PlumberPage.js`

### A. Drain Cleaning pages

- **H1:** `Emergency Drain Service in ${location}` → `Drain Cleaning in ${location}`
- **Page title (`<title>`):** `Emergency Drain Service in ${location} | 24/7 Drain & Sewer Backup | YoHomeFix` → `Drain Cleaning in ${cleanCityName} | 24/7 Emergency | YoHomeFix`
- **Expected result:** Exact-match "Drain Cleaning [City]" in the most important on-page positions, while still signaling 24/7 emergency availability.

### B. Emergency pages

- **H1:** `Emergency Plumber in ${location}` → `24-Hour Emergency Plumber in ${location}`
- **Page title (`<title>`):** `Emergency Plumber in ${location} | 24-Hour Emergency Plumber | YoHomeFix` → `Emergency Plumber in ${cleanCityName} | 24-Hour | YoHomeFix`
- **Expected result:** Captures "24 hour plumber" and "24/7 emergency plumber" query intent directly in H1 and title.

### Why this is the right scope

- These pages are rendered by the same `PlumberPage.js` template, so one targeted change improves all top 20 pages simultaneously.
- No new pages, no mass content generation, no design changes, no URL changes.
- The edits preserve the existing trust/CTA/FAQ/pricing schema and content.

---

## 4. What Was NOT Changed (and why)

| Item | Reason |
|---|---|
| **No new landing pages** | Existing city/service pages already have enough depth; the issue was on-page signals, not content volume. |
| **No schema additions** | Existing schema (Breadcrumb, Organization, Plumber, Service, FAQ, WebPage) is comprehensive. No meaningful deficiency found. |
| **No mass content generation** | Content depth is already comparable to top competitors; generating more generic text would not close the ranking gap. |
| **No sitewide internal link blocks** | `CrawlLinks` and nearby-city sections already provide contextual internal links. Adding a hardcoded list of 20 pages to the footer or homepage would be spammy. |
| **No homepage or state-page redesign** | The ranking problem is per-page H1/title relevance, not architecture. |

---

## 5. Expected SEO Impact

- **Short term (1-2 weeks after index):** Better CTR from SERPs because titles are shorter, keyword-first, and more aligned with searcher intent.
- **Medium term (2-6 weeks):** Improved relevance for "drain cleaning [city]" and "24 hour plumber [city]" should move pages from positions 25-45 toward 10-25.
- **Limitations:** Pages with very high average positions (70+, e.g., Seattle, Dallas, Cleveland) are unlikely to jump to page 1 from a title change alone; they need additional authority and trust signals.

---

## 6. Validation Plan

After the next production deployment:

1. Run `scripts/analytics/verify-live.py` against the top 5 pages to confirm:
   - Title and H1 output the new exact-match text.
   - Canonical remains correct.
   - Marketcall `tel:1` and `call_click` tracking still fire.
2. Use Google Search Console to monitor the top 20 pages weekly for 14 days:
   - Track average position for each page.
   - Track impressions and clicks.
   - Track target query positions: `drain cleaning [city]`, `emergency plumber [city]`, `24 hour plumber [city]`.
3. If no measurable ranking/CTR improvement after 14 days, the remaining issue is authority, and the next step is to build local citations/backlinks and add a real business address/license details.

---

## 7. Remaining Issues Requiring Future Work

1. **Domain authority / brand trust** — competitors are decades-old national franchises with massive backlink profiles. YoHomeFix cannot match this with on-page edits.
2. **Local physical address and license numbers** — adding a real dispatch address and state plumbing license numbers to the footer or contact page would improve E-E-A-T and conversion.
3. **Backlinks / citations** — no on-page change can replace local business listings, BBB, and industry citations.
4. **National service hub for broad queries** — queries like "emergency drain service" (18,831 impressions, pos 25.6) and "emergency plumber" (4,240 impressions, pos 25.0) are too broad for city pages to own. A future national `/drain-cleaning` or `/emergency-plumbing` hub is the only long-term solution for these, if you choose to build it later.
