# YoHomeFix Google Search PPC Strategy

**Constraints:** Marketcall PPC allowed. No website changes. No new landing pages unless clear ROI. Use existing city/service pages. Initial budget: **$5/day**.

**Date:** 2026-07-30
**Status:** Strategy only — no campaigns built or launched.

---

## Data Used for This Plan

Pulled from `scripts/analytics/csv/gsc-pages.csv` (GSC Pages export, most recent period):

### Top cities by impressions (city + service pages)
| City | Impressions | Pages | Avg. Position |
|---|---|---|---|
| Oklahoma City | 22,908 | 2 | 37.8 |
| Baltimore | 6,346 | 3 | 35.4 |
| San Diego | 2,163 | 2 | 63.8 |
| Phoenix | 1,835 | 2 | 62.7 |
| Seattle | 1,607 | 4 | 78.6 |
| San Antonio | 1,385 | 3 | 67.4 |
| San Jose | 1,206 | 1 | 52.4 |
| Sacramento | 1,187 | 3 | 56.2 |
| Cincinnati | 1,001 | 1 | 41.8 |

### Top services by impressions (nationwide)
| Service | Impressions | Pages | Avg. Position | Clicks |
|---|---|---|---|---|
| Drain Cleaning | 30,313 | 109 | 44.1 | 0 |
| Emergency | 23,800 | 143 | 42.4 | 0 |
| Water Heater Repair | 5,304 | 175 | 44.9 | 2 |
| Leak Repair | 2,846 | 83 | 56.4 | 1 |

**Key insight:** Drain cleaning and emergency have the highest search demand (impressions) but almost **zero organic clicks** — pages rank around position 40-45, far below page 1 (which starts around position 1-10). This is exactly the gap PPC should fill: capture the demand that already exists but isn't converting organically yet.

**Oklahoma City and Baltimore are outliers** — both already sit near position 35-38 (closer to page 3-4) with very high impressions, meaning intent exists and the ranking gap to page 1 is smaller than most other cities.

---

## 1. Campaign Structure

### Account structure
```
YoHomeFix – Search
├── Campaign: Emergency Plumbing – Tier 1 Cities
│   ├── Ad Group: Emergency – Oklahoma City
│   ├── Ad Group: Emergency – Baltimore
│   └── Ad Group: Emergency – San Diego
├── Campaign: Drain Cleaning – Tier 1 Cities
│   ├── Ad Group: Drain Cleaning – Oklahoma City
│   ├── Ad Group: Drain Cleaning – Baltimore
│   └── Ad Group: Drain Cleaning – San Diego
```

- **One campaign per service** (Emergency, Drain Cleaning) — these are the two highest-demand, highest-margin services.
- **One ad group per city** within each campaign — allows city-specific ad copy and precise geo-bid control.
- Do **not** mix services in one ad group (keyword relevance and Quality Score drop).

### Match types
- Start with **Phrase Match** and **Exact Match** only.
- Avoid Broad Match at $5/day — it burns budget fast on irrelevant terms and offers no control.

### Geographic targeting
- Target **radius around each city** (10-15 mile radius from city center), not the whole state.
- Use **Presence: People in or regularly in your targeted locations** (not "interested in") to avoid paying for clicks from people searching about the city from elsewhere.
- Exclude the rest of the state/country explicitly.

---

## 2. Budget Strategy ($5/day)

### Phase 1: One campaign, one city
With $5/day, spreading across multiple cities/campaigns dilutes data and delays learning. Start with:

- **1 campaign:** Emergency Plumbing
- **1 ad group:** Oklahoma City
- **Budget:** $5/day (~$150/month)

### Why Oklahoma City first
1. **Highest impressions** (22,908) — most existing demand signal.
2. **Best average position** (37.8) — closest to breaking onto page 1, meaning PPC ads will show alongside a page that Google already considers moderately relevant.
3. Single high-volume market means the $5/day budget isn't spread too thin.

### Second priority: Baltimore
- Second-highest impressions (6,346) and best average position (35.4) — even closer to page 1 than Oklahoma City.
- Add as a second ad group only after Oklahoma City test produces at least 5-7 days of clean data.

### Cities to avoid initially
- **Seattle, Dallas, Los Angeles, Chicago, San Francisco** — high avg. position (65-80), meaning organic content is weak here; combined with typically high CPCs in these metros (major population centers, high plumbing competition), $5/day will not generate meaningful volume.
- Any city with **fewer than 2 qualified service pages** in the sitemap (fragmented content = inconsistent landing page quality).

### Service priority
1. **Emergency** — highest urgency, highest call-intent, most consistent with Marketcall's model (visitor calls immediately rather than filling a form).
2. **Drain Cleaning** — highest impressions overall, decent avg. position (44.1), moderate CPC compared to "emergency" terms nationally.
3. Hold off on Water Heater Repair, Leak Repair, etc. until budget scales — these have lower demand relative to competition.

---

## 3. Keywords

### Exact Match (highest priority, tightest control)
```
[emergency plumber oklahoma city]
[24 hour plumber oklahoma city]
[emergency plumber near me]
[drain cleaning oklahoma city]
[clogged drain oklahoma city]
```

### Phrase Match (broader net, still controlled)
```
"emergency plumber oklahoma city"
"emergency plumbing service oklahoma city"
"24 hour emergency plumber"
"drain cleaning service oklahoma city"
"clogged drain repair oklahoma city"
"drain cleaning near me"
```

### High-intent keywords
```
[emergency plumber open now]
[same day drain cleaning]
[plumber available now oklahoma city]
"call a plumber now"
```

### Emergency keywords
```
[emergency plumber]
[24 hour plumber]
[burst pipe emergency]
[emergency drain cleaning]
"emergency plumbing repair"
```

### Near Me keywords
```
[plumber near me]
[emergency plumber near me]
[drain cleaning near me]
"24 hour plumber near me"
```

### Negative Keyword List (critical for $5/day efficiency)
```
-free
-diy
-how to
-jobs
-hiring
-career
-salary
-training
-school
-license requirements
-become a plumber
-plumbing supply
-parts
-wholesale
-tools
-course
-certification
-apprenticeship
-reviews (unless bidding on brand/competitor terms intentionally)
-yelp
-reddit
-forum
-what is
-definition
-meaning
-cost calculator (unless landing page has pricing table — otherwise low-intent research traffic)
```

Also add **city names outside the target radius** as negatives if using broad geo targeting (e.g., if targeting "Oklahoma City," add `-tulsa`, `-norman` as negatives to prevent bleed).

---

## 4. Landing Pages (No New Pages)

Use existing pages exactly as they are:

| Ad Group | Landing Page |
|---|---|
| Emergency – Oklahoma City | `https://yohomefix.com/plumber-oklahoma-city-emergency` |
| Drain Cleaning – Oklahoma City | `https://yohomefix.com/plumber-oklahoma-city-drain-cleaning` |
| Emergency – Baltimore | `https://yohomefix.com/plumber-baltimore-emergency` |
| Drain Cleaning – Baltimore | `https://yohomefix.com/plumber-baltimore-drain-cleaning` |

These pages already have:
- Sticky call CTA
- `tel:1` Marketcall placeholder
- City-specific H1/content (matches ad relevance for Quality Score)
- Trust signals and FAQ sections

**No new landing page is justified at $5/day.** A dedicated PPC landing page only pays off once budget and volume justify the dev/testing cost (recommend revisiting only above $50-100/day).

---

## 5. Ad Copy (Responsive Search Ads)

### Compliance notes
- No unverified superlatives ("#1", "best in the city") unless already substantiated elsewhere on the site.
- No specific price guarantees not already on the landing page.
- Keep language consistent with existing site tone (direct, local, urgency-driven, no overpromising response times not stated on the page).

### Headlines (mix of 10-12, Google picks best combination)
```
Emergency Plumber in Oklahoma City
24/7 Emergency Plumbing Help
Fast Local Plumbers Near You
Clogged Drain? Call Now
Same-Day Drain Cleaning
Licensed Local Plumbers
Burst Pipe? Get Help Fast
Oklahoma City Plumbing Experts
Call Now for Fast Service
Trusted Local Plumbing Team
Drain Cleaning Done Right
Available Now – Call Today
```

### Descriptions (3-4)
```
Dealing with a plumbing emergency? Local plumbers ready to help. Call now to get connected.
Clogged drains, leaks, or burst pipes — get fast local help. Call now.
Serving Oklahoma City homeowners with reliable plumbing service. Call today.
Fast response for emergency plumbing needs. Speak with a local plumbing pro now.
```

### Call-focused messaging
- Use **Call Extensions** (Google Ads asset) pointing to the same Marketcall dynamic number logic if supported, OR keep call extension off and drive 100% of traffic to the landing page so Marketcall's on-page dynamic number handles tracking (recommended — keeps a single source of truth for call tracking).
- Add **Sitelink extensions** to other qualified service pages (e.g., Water Heater Repair) and **Callout extensions** ("Local Team," "Fast Response," "Serving Oklahoma City").

### Emergency messaging
```
Headline: Plumbing Emergency? Call Now
Description: Burst pipes, clogged drains, no hot water — get connected to local help fast.
```

---

## 6. Tracking

### What's already in place
- `call_click` GA4 event fires when a visitor clicks the call button (`components/PlumberPage.js`).
- Marketcall dynamically replaces the `tel:1` placeholder with a tracking number.

### What to add (no website changes needed)
1. **Google Ads conversion tracking:** Import the `call_click` GA4 event into Google Ads as a conversion action (via GA4-Google Ads linking in the GA4 admin panel — no code change).
2. **UTM tagging** on all ad URLs via Google Ads' auto-tagging (`gclid`) — already standard, no manual UTM needed since GA4 auto-captures Google Ads sessions once linked.

### Metrics to track weekly
| Metric | Source |
|---|---|
| Clicks, CTR, CPC | Google Ads dashboard |
| Call button clicks (`call_click`) | GA4, filtered by `session_source = google / cpc` |
| Marketcall executions | Marketcall dashboard (site-level; cross-reference by day/time with Ads spend) |
| Qualified calls | Marketcall dashboard (call duration/status filter) |
| Cost per qualified call | `Ad spend ÷ qualified calls` (manual weekly calc) |
| ROAS | `(Qualified calls × avg. job value × close rate) ÷ ad spend` — requires an assumed close rate and avg. ticket value from the business |

### Weekly report to build (once data flows)
```
Date range | Spend | Clicks | CTR | CPC | call_click events | Marketcall calls | Qualified calls | Cost/qualified call
```
This can be added to the existing `scripts/analytics/csv_report.py` reporting pipeline once Google Ads CSV export is available — no new script needed immediately at $5/day (volume will be too low to analyze meaningfully before ~2 weeks).

---

## 7. Scaling Plan

### Trigger to increase budget
Only scale after **at least 7 days** of $5/day with a clear signal:
- CPC is stable (not spiking).
- At least 3-5 `call_click` events attributable to Google Ads traffic.
- No excessive negative-keyword-worthy irrelevant clicks.

### Scaling sequence
1. **$5 → $10/day:** Increase budget on the *same* Oklahoma City Emergency ad group first (the single best performer), not a new city.
2. **$10 → $15/day:** Add the second ad group (Baltimore) at $5/day alongside the now-$10/day Oklahoma City group.
3. **$15 → $25/day:** Add Drain Cleaning campaign for Oklahoma City.
4. **$25 → $40+/day:** Expand to San Diego / Phoenix (next-best impression cities), and consider adding Broad Match with strong negative lists once enough search term data exists to build a robust negative list.

### Rule of thumb
- Never double budget on an untested ad group.
- Always expand into the **next highest-impression city**, not an arbitrary new market.
- Re-evaluate landing page performance (bounce rate, time on page) via GA4 before scaling further — if a city page has poor engagement, fix content signals before adding spend.

---

## 8. Risks

### High CPC keywords to avoid initially
- Broad "plumber" (no modifier) — expensive, low intent, dominated by big national aggregators (Angi, HomeAdvisor).
- "plumber near me" in **major metros** (LA, Chicago, NYC, Dallas) — CPCs often $15-40+ due to heavy competition; not viable at $5/day.
- Any keyword targeting **commercial plumbing** (different intent, different buyer).

### Budget waste risks
- Broad Match keywords without a mature negative list.
- Targeting an entire state instead of a city radius.
- Running search ads without call/`call_click` conversion tracking connected (can't optimize blind).
- Advertising services with weak or thin landing page content (poor Quality Score inflates CPC).

### Low-intent searches to exclude
- "how to fix a clogged drain" / DIY searches.
- "plumber salary" / job-seeker searches.
- "plumbing supply store" — retail intent, not service intent.

### Common PPC mistakes for emergency plumbing (avoid these)
1. **Running ads 24/7 without matching business call-answering capacity** — wasted spend if there's no one to answer emergency calls at night with the initial small budget. Confirm call handling capacity before enabling round-the-clock ads.
2. **Ignoring Quality Score** — sending emergency ad traffic to a slow-loading or irrelevant page tanks CPC efficiency. (YoHomeFix's existing city pages should be fine here — no core web vitals concerns known.)
3. **Not using call tracking parity** — if a different phone number appeared on the ad vs. the site, Marketcall attribution breaks. Confirmed not an issue here since Marketcall injects the number dynamically on-page.
4. **Testing too many variables at once** — don't change ad copy, keywords, and city targeting simultaneously; isolate one variable per testing cycle.
5. **Underfunding to "test everything"** — spreading $5/day across multiple cities/services produces statistically useless data. Concentrate budget.

---

## 9. Final Recommendation

### Run SEO and PPC together — do not wait, do not choose one exclusively

**Reasoning:**
- SEO is producing **high impressions but near-zero clicks** for Emergency and Drain Cleaning (avg. position 40-45). Organic improvement will take weeks to months to reach page 1.
- PPC can **immediately capture click-through demand** that SEO cannot yet convert, using the exact same landing pages SEO is already building authority for.
- $5/day is low-risk — it will not meaningfully cannibalize SEO budget/attention, and it generates **real call-intent data** (via `call_click` and Marketcall) faster than waiting for organic rankings to improve.
- Oklahoma City and Baltimore are the only two markets currently showing strong enough organic signal (avg. position mid-30s) to expect PPC and SEO to reinforce each other (a visitor who sees both an ad and an organic listing trusts the brand more — a well-documented "double-serving" effect for local service businesses).

### Prioritized execution plan
1. **Week 1:** Launch 1 campaign (Emergency), 1 ad group (Oklahoma City), $5/day. Confirm Google Ads → GA4 conversion import for `call_click`.
2. **Week 2:** Review CPC, CTR, `call_click` volume. Refine negative keywords based on actual search terms report.
3. **Week 2-3:** If signal is positive, add Baltimore Emergency ad group at $5/day (total $10/day).
4. **Week 3-4:** Add Drain Cleaning – Oklahoma City if Emergency is performing.
5. **Ongoing:** Keep SEO work (drain cleaning hub audit, sitemap health, on-page fixes) running in parallel — PPC funds the gap while SEO climbs toward page 1.

---

## Next Steps (Not to be executed now)

1. Confirm Google Ads account exists / create one.
2. Link Google Ads to the existing GA4 property.
3. Import `call_click` as a Google Ads conversion action.
4. Build the Oklahoma City Emergency campaign exactly as structured above.
5. Set daily budget to $5, enable in **Paused** state for final review before going live.
