# YoHomeFix SEO Ranking Improvement — Expanded Report

**Date:** 2026-07-30  
**Scope:** Top 20 high-impression, low-ranking pages from GSC. No new pages, no redesign, no architecture changes.  
**Status:** On-page title/H1 changes implemented in `components/PlumberPage.js`. Live validation pending next production deployment.

---

## Why These Specific Changes Should Improve Rankings

All 20 pages are rendered by the same `components/PlumberPage.js` template, so two targeted edits improve every top opportunity page simultaneously without mass content generation or URL changes.

| Change | File | Expected Ranking Mechanism |
|---|---|---|
| Drain-cleaning H1: `Emergency Drain Service in ${location}` → `Drain Cleaning in ${location}` | `components/PlumberPage.js` | Google uses H1 as the strongest on-page topical signal. The URL and GSC data already pointed to `drain cleaning [city]`, but the H1 did not include that exact phrase. Exact-match H1 improves relevance for the query. |
| Drain-cleaning title: shortened and keyword-first, e.g. `Drain Cleaning in ${cleanCityName} \| 24/7 Emergency \| YoHomeFix` | `components/PlumberPage.js` | Title tags are the primary SERP ranking/CTR signal. The old title was 70+ chars and led with "Emergency Drain Service" instead of "Drain Cleaning". The new title puts the exact keyword first and stays under 60 chars, reducing truncation risk. |
| Emergency H1: `Emergency Plumber in ${location}` → `24-Hour Emergency Plumber in ${location}` | `components/PlumberPage.js` | GSC shows significant volume for `24 hour plumber [city]` and `24/7 plumber [city]`. Putting `24-Hour` in the H1 signals topical relevance for those exact modifiers while keeping the primary "Emergency Plumber" phrase. |
| Emergency title: `Emergency Plumber in ${cleanCityName} \| 24-Hour \| YoHomeFix` | `components/PlumberPage.js` | Removes duplicate text in the old title and places the primary keyword + modifier in the visible SERP snippet, which can improve both ranking and click-through rate. |

No other template or content changes were made because the existing page body already matches or exceeds competitors on depth, FAQ coverage, schema, and internal linking.

---

## Internal Linking Modifications

**No internal linking pages were modified in this pass.**

The existing template already provides contextual links through `CrawlLinks.js`, `RelatedServiceCallout`, service navigation, and ZIP-code directories. Because no crawl data showed orphan pages, adding a hardcoded top-20 link list to the homepage or footer would have been unnecessary and potentially spammy. If a future crawl shows weak PageRank flow to these pages, we can add targeted links then.

---

## Additional High-Impact Improvements Remaining

| Recommendation | Expected SEO Impact | Notes |
|---|---|---|
| Add real local business address and state plumbing license numbers to site/footer | **High** for E-E-A-T / trust | Competitors display physical addresses and license numbers; YoHomeFix uses generic badges. Requires real business data. |
| Build local business citations / backlinks (BBB, Angi, Yelp, chamber listings) | **High** for domain authority | The biggest remaining ranking barrier; cannot be fixed on-page. |
| Create a national service hub page for `emergency drain service` and `emergency plumber` (broad queries) | **High** for broad, high-volume queries | City pages will not realistically own these national queries. Requires new page — not within current scope. |
| Add `AggregateRating` schema to `buildPlumberSchema` | **Medium** for CTR / trust | Requires real review data; can be implemented when review collection is live. |
| Improve meta descriptions for higher CTR (testimonials, exact response time) | **Medium** for CTR only | Meta descriptions do not directly affect ranking, but higher CTR can indirectly help. |
| Add contextual links from the homepage to the top 5 opportunity pages | **Low-Medium** for authority | Only if done natively (e.g., "Most requested cities" section); otherwise risks being spammy. |

---

## Top 20 Page Analysis

### 1. `plumber-oklahoma-city-drain-cleaning`

| Metric | Value |
|---|---|
| Target keyword | `drain cleaning oklahoma city` |
| Avg. position | 28.7 |
| Impressions | 22,639 |
| Top 3 competitors | 1. `rotorooter.com/oklahomacity/drain-cleaning`<br>2. `buddysplumbingok.com/services/drain-cleaning`<br>3. `heritageservicesok.com/plumbing/drain-cleaning` |

| Factor | Competitors | YoHomeFix (post-edit) | Notes |
|---|---|---|---|
| Search intent | Find local drain cleaning fast | Find local drain cleaning fast | Same transactional intent |
| H1 | Exact: "Drain Cleaning in [City]" or "Clogged Drain in OKC?" | Now exact: `Drain Cleaning in Oklahoma City, OK` | Was `Emergency Drain Service` — now aligned |
| Title | Keyword-first, under 60 chars | `Drain Cleaning in Oklahoma City | 24/7 Emergency | YoHomeFix` | Now keyword-first and short |
| Content depth | Good; local causes, methods, pricing | Good; city water data, infra, pricing | Parity |
| Local relevance | Metro areas, local phone, addresses | City water utility, neighborhoods, ZIPs | Parity |
| FAQ | FAQ sections with specific questions | FAQPage schema + 8 FAQs | Parity |
| Trust signals | BBB, years in business, local license | Generic licensed/insured badges | Lagging |
| Internal links | State hub, nearby cities, services | State hub, nearby cities, services, ZIPs | Parity |
| Structured data | Service, FAQ, LocalBusiness, Breadcrumb | Breadcrumb, Organization, Plumber, Service, FAQ, WebPage | Parity |
| User experience | Strong CTA, phone, online booking | Sticky CTA, live operator, quote form | Parity |

### 2. `plumber-baltimore-drain-cleaning`

| Metric | Value |
|---|---|
| Target keyword | `drain cleaning baltimore` |
| Avg. position | 35.7 |
| Impressions | 5,646 |
| Top 3 competitors | 1. `fhfurr.com/maryland/plumbing-services/drain-cleaning`<br>2. `mikesplumbing.com/plumbing/drain-cleaning`<br>3. `mrrooter.com/locations/maryland/baltimore/drain-cleaning` |

| Factor | Competitors | YoHomeFix (post-edit) | Notes |
|---|---|---|---|
| Search intent | Find local drain cleaning fast | Find local drain cleaning fast | Same |
| H1 | "Drain Cleaning in Baltimore, MD" | `Drain Cleaning in Baltimore, MD` | Now exact |
| Title | Keyword-first | `Drain Cleaning in Baltimore | 24/7 Emergency | YoHomeFix` | Now exact and short |
| Content depth | Aging pipes, hard water, methods | City data, causes, methods, pricing | Parity |
| Local relevance | Neighborhoods served | CITY_DATA neighborhoods, ZIPs | Parity |
| FAQ | FAQs about frequency, DIY | FAQPage with 8 drain FAQs | Parity |
| Trust signals | Local family-owned, warranty | Generic badges | Lagging |
| Internal links | Nearby city, service pages | State hub, nearby, ZIPs | Parity |
| Structured data | Service, FAQ, LocalBusiness | Breadcrumb, Plumber, Service, FAQ, WebPage | Parity |
| User experience | Clear phone CTA | Sticky CTA, quote form | Parity |

### 3. `plumber-san-diego-emergency`

| Metric | Value |
|---|---|
| Target keyword | `emergency plumber san diego` |
| Avg. position | 54.8 |
| Impressions | 2,114 |
| Top 3 competitors | 1. `rotorooter.com/sandiego/emergency-plumber`<br>2. `sd24hourplumber.com`<br>3. `billhowe.com/services/plumbing/emergency-plumber` |

| Factor | Competitors | YoHomeFix (post-edit) | Notes |
|---|---|---|---|
| Search intent | Find 24/7 emergency plumber | Find 24/7 emergency plumber | Same |
| H1 | "24/7 Emergency Plumber in San Diego" | `24-Hour Emergency Plumber in San Diego, CA` | Now includes 24-Hour modifier |
| Title | Keyword-first with 24/7 | `Emergency Plumber in San Diego | 24-Hour | YoHomeFix` | Now exact |
| Content depth | Full emergency service list, local areas | Service list, local water data, FAQ | Parity |
| Local relevance | Area served, phone, address | Neighborhoods, ZIPs | Parity |
| FAQ | 24/7 availability, response time | FAQPage with 8 emergency FAQs | Parity |
| Trust signals | Licensed, insured, local dispatch | Generic licensed/insured | Lagging |
| Internal links | Nearby cities, services | State hub, nearby cities, services | Parity |
| Structured data | Service, FAQ, LocalBusiness | Same set | Parity |
| User experience | Strong mobile CTA | Sticky mobile CTA | Parity |

### 4. `plumber-phoenix-emergency`

| Metric | Value |
|---|---|
| Target keyword | `emergency plumber phoenix` |
| Avg. position | 46.5 |
| Impressions | 1,829 |
| Top 3 competitors | 1. `rotorooter.com/phoenix/emergency-plumber`<br>2. `goettl.com/location/phoenix-arizona/phoenix-emergency-plumber`<br>3. `rotorooter.com/phoenix` |

| Factor | Competitors | YoHomeFix (post-edit) | Notes |
|---|---|---|---|
| Search intent | Find 24/7 emergency plumber in Phoenix | Find 24/7 emergency plumber | Same |
| H1 | "Emergency Plumber in Phoenix" | `24-Hour Emergency Plumber in Phoenix, AZ` | Adds 24-Hour |
| Title | 24/7 + location | `Emergency Plumber in Phoenix | 24-Hour | YoHomeFix` | Exact keyword first |
| Content depth | Local climate/heat, services | Local water, soil, pipe data | Parity |
| Local relevance | Valley-wide coverage | State hub + nearby cities | Parity |
| FAQ | 24/7, response, pricing | FAQPage | Parity |
| Trust signals | Years in business, license | Generic badges | Lagging |
| Internal links | Service pages, cities | Same | Parity |
| Structured data | Service, FAQ, LocalBusiness | Same | Parity |
| User experience | Phone/booking | Call + text CTA | Parity |

### 5. `plumber-san-antonio-emergency`

| Metric | Value |
|---|---|
| Target keyword | `emergency plumber san antonio` |
| Avg. position | 46.9 |
| Impressions | 1,371 |
| Top 3 competitors | 1. `rotorooter.com/sanantonio/emergency-plumber`<br>2. `serviceexperts.com/san-antonio-tx/services/plumbing-services/emergency-plumbing`<br>3. `willsplumbing.com/emergency-plumbing` |

| Factor | Competitors | YoHomeFix (post-edit) | Notes |
|---|---|---|---|
| Search intent | Find 24/7 emergency plumber | Find 24/7 emergency plumber | Same |
| H1 | "Emergency Plumber in San Antonio" | `24-Hour Emergency Plumber in San Antonio, TX` | Adds 24-Hour |
| Title | Keyword + 24/7 | `Emergency Plumber in San Antonio | 24-Hour | YoHomeFix` | Exact |
| Content depth | Bexar County, hard water, services | City data, pipe data, services | Parity |
| Local relevance | Metro list | Nearby cities, state hub | Parity |
| FAQ | 24/7, response | FAQPage | Parity |
| Trust signals | License, BBB, years | Generic | Lagging |
| Internal links | City/service pages | Same | Parity |
| Structured data | Service, FAQ, LocalBusiness | Same | Parity |
| User experience | Clear phone CTA | Sticky CTA | Parity |

### 6. `plumber-san-jose-emergency`

| Metric | Value |
|---|---|
| Target keyword | `emergency plumber san jose` |
| Avg. position | 52.4 |
| Impressions | 1,206 |
| Top 3 competitors | 1. `rooterhero.com/san-jose-ca/plumbing/emergency-plumbing`<br>2. `fluiddynamicsplumbing.com/services/emergency-plumbing`<br>3. `ventureplumbinginc.net/plumbing-services/emergency-plumber` |

| Factor | Competitors | YoHomeFix (post-edit) | Notes |
|---|---|---|---|
| Search intent | Find 24/7 emergency plumber | Find 24/7 emergency plumber | Same |
| H1 | "Emergency Plumbers in San Jose" | `24-Hour Emergency Plumber in San Jose, CA` | Adds 24-Hour |
| Title | Keyword + 24/7 | `Emergency Plumber in San Jose | 24-Hour | YoHomeFix` | Exact |
| Content depth | South Bay, aging pipes | City data, services | Parity |
| Local relevance | Neighborhoods served | Nearby cities, ZIPs | Parity |
| FAQ | Response, emergency types | FAQPage | Parity |
| Trust signals | 20+ years, license | Generic | Lagging |
| Internal links | Nearby cities | Same | Parity |
| Structured data | Service, FAQ, LocalBusiness | Same | Parity |
| User experience | Phone/booking | Call + text | Parity |

### 7. `plumber-sacramento-emergency`

| Metric | Value |
|---|---|
| Target keyword | `emergency plumber sacramento` |
| Avg. position | 48.3 |
| Impressions | 1,143 |
| Top 3 competitors | 1. `plumbingsacramento.com/plumbing-services/emergency-plumbing`<br>2. `sacramentoplumbingsolutions.com/emergency-plumbing`<br>3. `mrrooter.com/sacramento/emergency-service` |

| Factor | Competitors | YoHomeFix (post-edit) | Notes |
|---|---|---|---|
| Search intent | Find 24/7 emergency plumber | Find 24/7 emergency plumber | Same |
| H1 | "EMERGENCY PLUMBING IN SACRAMENTO" | `24-Hour Emergency Plumber in Sacramento, CA` | Exact and readable |
| Title | Keyword + 24/7 | `Emergency Plumber in Sacramento | 24-Hour | YoHomeFix` | Exact |
| Content depth | Local history, neighborhoods | City data, services | Parity |
| Local relevance | East Sac, Natomas, etc. | Nearby cities, ZIPs | Parity |
| FAQ | Response, pricing | FAQPage | Parity |
| Trust signals | Since 1999, local | Generic | Lagging |
| Internal links | Service pages | Same | Parity |
| Structured data | Service, FAQ, LocalBusiness | Same | Parity |
| User experience | Phone CTA | Sticky CTA | Parity |

### 8. `plumber-cincinnati-emergency`

| Metric | Value |
|---|---|
| Target keyword | `emergency plumber cincinnati` |
| Avg. position | 41.8 |
| Impressions | 1,001 |
| Top 3 competitors | 1. `rotorooter.com/cincinnati`<br>2. `geiler.com/emergency-plumber-in-cincinnati`<br>3. `thomasgalbraith.com/emergency-plumber` |

| Factor | Competitors | YoHomeFix (post-edit) | Notes |
|---|---|---|---|
| Search intent | Find 24/7 emergency plumber | Find 24/7 emergency plumber | Same |
| H1 | "Emergency Plumber in Cincinnati" | `24-Hour Emergency Plumber in Cincinnati, OH` | Adds 24-Hour |
| Title | Keyword + 24/7 | `Emergency Plumber in Cincinnati | 24-Hour | YoHomeFix` | Exact |
| Content depth | Local history, services | City data, services | Parity |
| Local relevance | Tri-state coverage | State hub, nearby cities | Parity |
| FAQ | Emergency types, pricing | FAQPage | Parity |
| Trust signals | Since 1885, license numbers | Generic | Lagging |
| Internal links | Nearby/service | Same | Parity |
| Structured data | Service, FAQ, LocalBusiness | Same | Parity |
| User experience | Phone/booking | Sticky CTA | Parity |

### 9. `plumber-seattle-emergency`

| Metric | Value |
|---|---|
| Target keyword | `emergency plumber seattle` |
| Avg. position | 74.7 |
| Impressions | 961 |
| Top 3 competitors | 1. `rotorooter.com/seattle/emergency-plumber`<br>2. `boboates.com/services/emergency-plumber-seattle-wa`<br>3. `beaconplumbing.net/seattle-emergency-plumber` |

| Factor | Competitors | YoHomeFix (post-edit) | Notes |
|---|---|---|---|
| Search intent | Find 24/7 emergency plumber | Find 24/7 emergency plumber | Same |
| H1 | "Emergency Plumber in Seattle" | `24-Hour Emergency Plumber in Seattle, WA` | Adds 24-Hour |
| Title | Keyword + 24/7 | `Emergency Plumber in Seattle | 24-Hour | YoHomeFix` | Exact |
| Content depth | Climate/freeze, services | City data, winter risk | Parity |
| Local relevance | King County neighborhoods | Nearby cities, ZIPs | Parity |
| FAQ | 24/7, response | FAQPage | Parity |
| Trust signals | 30+ years, local | Generic | Lagging |
| Internal links | Service pages | Same | Parity |
| Structured data | Service, FAQ, LocalBusiness | Same | Parity |
| User experience | Phone CTA | Sticky CTA | Parity |

### 10. `plumber-dallas-emergency`

| Metric | Value |
|---|---|
| Target keyword | `emergency plumber dallas` |
| Avg. position | 73.6 |
| Impressions | 903 |
| Top 3 competitors | 1. `rotorooter.com/dallas/emergency-plumber`<br>2. `jamesarmstrongplumbing.com/emergency-plumbing-dallas-tx`<br>3. `mrrooter.com/dallas/residential-services/emergency-plumbing-service` |

| Factor | Competitors | YoHomeFix (post-edit) | Notes |
|---|---|---|---|
| Search intent | Find 24/7 emergency plumber | Find 24/7 emergency plumber | Same |
| H1 | "Emergency Plumber in Dallas" | `24-Hour Emergency Plumber in Dallas, TX` | Adds 24-Hour |
| Title | Keyword + 24/7 | `Emergency Plumber in Dallas | 24-Hour | YoHomeFix` | Exact |
| Content depth | DFW, freeze, services | City data, services | Parity |
| Local relevance | Plano, Frisco, etc. | Nearby cities, state hub | Parity |
| FAQ | Response, pricing | FAQPage | Parity |
| Trust signals | Master plumber, BBB | Generic | Lagging |
| Internal links | Nearby/service | Same | Parity |
| Structured data | Service, FAQ, LocalBusiness | Same | Parity |
| User experience | Phone/booking | Sticky CTA | Parity |

### 11. `plumber-summertown-emergency`

| Metric | Value |
|---|---|
| Target keyword | `emergency plumber summertown` |
| Avg. position | 62.9 |
| Impressions | 872 |
| Top 3 competitors | 1. `sandhillslandsepticservices.com/emergency-plumber-summertown-tn`<br>2. `springhillplumber.avantel.net/tn/summertown`<br>3. `castleplumbingservice.com/plumber-summertown-tn` |

| Factor | Competitors | YoHomeFix (post-edit) | Notes |
|---|---|---|---|
| Search intent | Find 24/7 emergency plumber | Find 24/7 emergency plumber | Same |
| H1 | "Emergency Plumber in Summertown" | `24-Hour Emergency Plumber in Summertown, TN` | Adds 24-Hour |
| Title | Keyword + 24/7 | `Emergency Plumber in Summertown | 24-Hour | YoHomeFix` | Exact |
| Content depth | Local services, FAQs | City data, services | Parity |
| Local relevance | TN region | Nearby, state hub | Parity |
| FAQ | Availability, cost | FAQPage | Parity |
| Trust signals | Local phone, license | Generic | Lagging |
| Internal links | Service pages | Same | Parity |
| Structured data | Service, FAQ, LocalBusiness | Same | Parity |
| User experience | Phone CTA | Sticky CTA | Parity |

### 12. `plumber-austin-emergency`

| Metric | Value |
|---|---|
| Target keyword | `emergency plumber austin` |
| Avg. position | 50.5 |
| Impressions | 847 |
| Top 3 competitors | 1. `rotorooter.com/austin/emergency-plumber`<br>2. `abacusplumbing.com/austin/plumbing-services/emergency-plumbing`<br>3. `christiansonco.com/plumbing/emergency` |

| Factor | Competitors | YoHomeFix (post-edit) | Notes |
|---|---|---|---|
| Search intent | Find 24/7 emergency plumber | Find 24/7 emergency plumber | Same |
| H1 | "Emergency Plumber in Austin" | `24-Hour Emergency Plumber in Austin, TX` | Adds 24-Hour |
| Title | Keyword + 24/7 | `Emergency Plumber in Austin | 24-Hour | YoHomeFix` | Exact |
| Content depth | Hill Country/hard water, services | City data, services | Parity |
| Local relevance | Travis County, neighborhoods | Nearby cities, ZIPs | Parity |
| FAQ | 24/7, response | FAQPage | Parity |
| Trust signals | 20+ years, license | Generic | Lagging |
| Internal links | Nearby/service | Same | Parity |
| Structured data | Service, FAQ, LocalBusiness | Same | Parity |
| User experience | Phone/booking | Sticky CTA | Parity |

### 13. `plumber-chicago-emergency`

| Metric | Value |
|---|---|
| Target keyword | `emergency plumber chicago` |
| Avg. position | 65.3 |
| Impressions | 798 |
| Top 3 competitors | 1. `rotorooter.com/chicago`<br>2. `baethkeplumbing.com/plumbing/plumbing-emergency-chicago`<br>3. `jblantonplumbing.com/chicago/emergency-plumbing` |

| Factor | Competitors | YoHomeFix (post-edit) | Notes |
|---|---|---|---|
| Search intent | Find 24/7 emergency plumber | Find 24/7 emergency plumber | Same |
| H1 | "Emergency Plumber in Chicago" | `24-Hour Emergency Plumber in Chicago, IL` | Adds 24-Hour |
| Title | Keyword + 24/7 | `Emergency Plumber in Chicago | 24-Hour | YoHomeFix` | Exact |
| Content depth | Freeze, older buildings, services | City data, services | Parity |
| Local relevance | Chicagoland, suburbs | Nearby, state hub | Parity |
| FAQ | 24/7, response | FAQPage | Parity |
| Trust signals | 30+ years, license | Generic | Lagging |
| Internal links | Service pages | Same | Parity |
| Structured data | Service, FAQ, LocalBusiness | Same | Parity |
| User experience | Phone CTA | Sticky CTA | Parity |

### 14. `plumber-los-angeles-emergency`

| Metric | Value |
|---|---|
| Target keyword | `emergency plumber los angeles` |
| Avg. position | 69.9 |
| Impressions | 771 |
| Top 3 competitors | 1. `rotorooter.com/losangeles/emergency-plumber`<br>2. `ez-plumbing.com/emergency-plumbing`<br>3. `mikediamondservices.com/emergency-plumbing-los-angeles-ca` |

| Factor | Competitors | YoHomeFix (post-edit) | Notes |
|---|---|---|---|
| Search intent | Find 24/7 emergency plumber | Find 24/7 emergency plumber | Same |
| H1 | "Emergency Plumber in Los Angeles" | `24-Hour Emergency Plumber in Los Angeles, CA` | Adds 24-Hour |
| Title | Keyword + 24/7 | `Emergency Plumber in Los Angeles | 24-Hour | YoHomeFix` | Exact |
| Content depth | LA Basin, slab leaks, services | City data, services | Parity |
| Local relevance | SFV, South Bay, etc. | Nearby, state hub | Parity |
| FAQ | 24/7, response | FAQPage | Parity |
| Trust signals | License #, 40+ years | Generic | Lagging |
| Internal links | Service pages | Same | Parity |
| Structured data | Service, FAQ, LocalBusiness | Same | Parity |
| User experience | Phone/booking | Sticky CTA | Parity |

### 15. `plumber-milwaukee-emergency`

| Metric | Value |
|---|---|
| Target keyword | `emergency plumber milwaukee` |
| Avg. position | 47.8 |
| Impressions | 768 |
| Top 3 competitors | 1. `heidenplumbing.com/plumberservices/emergency247`<br>2. `rozgacorp.com/plumbing/emergency-plumbing`<br>3. `eliteplumbingmilwaukee.com/24-7-emergency-plumbing-services` |

| Factor | Competitors | YoHomeFix (post-edit) | Notes |
|---|---|---|---|
| Search intent | Find 24/7 emergency plumber | Find 24/7 emergency plumber | Same |
| H1 | "24/7 Emergency Plumber in Milwaukee" | `24-Hour Emergency Plumber in Milwaukee, WI` | Adds 24-Hour |
| Title | Keyword + 24/7 | `Emergency Plumber in Milwaukee | 24-Hour | YoHomeFix` | Exact |
| Content depth | Freeze-thaw, clay soil, services | City data, services | Parity |
| Local relevance | Milwaukee & Waukesha | Nearby, state hub | Parity |
| FAQ | Response, after-hours cost | FAQPage | Parity |
| Trust signals | Local address, since 1990 | Generic | Lagging |
| Internal links | Service pages | Same | Parity |
| Structured data | Service, FAQ, LocalBusiness | Same | Parity |
| User experience | Phone CTA | Sticky CTA | Parity |

### 16. `plumber-indianapolis-emergency`

| Metric | Value |
|---|---|
| Target keyword | `emergency plumber indianapolis` |
| Avg. position | 53.1 |
| Impressions | 697 |
| Top 3 competitors | 1. `mrplumberindy.com/emergency-plumber`<br>2. `rotorooter.com/indianapolis`<br>3. `bncplumbingcompany.com/residential-plumbing-service/emergency-plumbing-services` |

| Factor | Competitors | YoHomeFix (post-edit) | Notes |
|---|---|---|---|
| Search intent | Find 24/7 emergency plumber | Find 24/7 emergency plumber | Same |
| H1 | "Indianapolis Emergency Plumbers" | `24-Hour Emergency Plumber in Indianapolis, IN` | Adds 24-Hour |
| Title | Keyword + 24/7 | `Emergency Plumber in Indianapolis | 24-Hour | YoHomeFix` | Exact |
| Content depth | 70+ years, services | City data, services | Parity |
| Local relevance | Central Indiana | Nearby, state hub | Parity |
| FAQ | 24/7, emergency types | FAQPage | Parity |
| Trust signals | License #, BBB | Generic | Lagging |
| Internal links | Service pages | Same | Parity |
| Structured data | Service, FAQ, LocalBusiness | Same | Parity |
| User experience | Phone CTA | Sticky CTA | Parity |

### 17. `plumber-minneapolis-water-heater-repair`

| Metric | Value |
|---|---|
| Target keyword | `water heater repair minneapolis` |
| Avg. position | 77.0 |
| Impressions | 697 |
| Top 3 competitors | 1. `rotorooter.com/minneapolis/water-heater-repair`<br>2. `northernbenfranklin.com/water-heaters/water-heater-repair`<br>3. `paulbunyanplumbing.com/minneapolis/services/water-heaters/repair` |

| Factor | Competitors | YoHomeFix (post-edit) | Notes |
|---|---|---|---|
| Search intent | Find local water heater repair | Find local water heater repair | Same |
| H1 | "Water Heater Repair in Minneapolis" | `Water Heater Repair in Minneapolis, MN — Emergency 24/7` | Exact |
| Title | Keyword + 24/7 | `Water Heater Repair in Minneapolis, MN — Emergency 24/7 Service | YoHomeFix` | Exact but long; still under 70 |
| Content depth | Types, causes, financing | City data, diagnostics, pricing | Parity |
| Local relevance | Twin Cities metro | Nearby, state hub | Parity |
| FAQ | Repair vs replace, same-day | FAQPage | Parity |
| Trust signals | License, years | Generic | Lagging |
| Internal links | Service pages | Same | Parity |
| Structured data | Service, FAQ, LocalBusiness | Same | Parity |
| User experience | Phone/schedule | Sticky CTA | Parity |

### 18. `plumber-baltimore-emergency`

| Metric | Value |
|---|---|
| Target keyword | `emergency plumber baltimore` |
| Avg. position | 32.3 |
| Impressions | 693 |
| Top 3 competitors | 1. `rotorooter.com/baltimore`<br>2. `callcatons.com/emergency-plumber`<br>3. `lentheplumber.com/baltimore-area/plumbing/emergency-service` |

| Factor | Competitors | YoHomeFix (post-edit) | Notes |
|---|---|---|---|
| Search intent | Find 24/7 emergency plumber | Find 24/7 emergency plumber | Same |
| H1 | "Baltimore's Emergency Plumber of Choice" | `24-Hour Emergency Plumber in Baltimore, MD` | Adds 24-Hour |
| Title | Keyword + 24/7 | `Emergency Plumber in Baltimore | 24-Hour | YoHomeFix` | Exact |
| Content depth | Row houses, old pipes, services | City data, services | Parity |
| Local relevance | Baltimore City/County | Nearby, state hub | Parity |
| FAQ | After-hours, pricing | FAQPage | Parity |
| Trust signals | 60+ years, BBB | Generic | Lagging |
| Internal links | Service pages | Same | Parity |
| Structured data | Service, FAQ, LocalBusiness | Same | Parity |
| User experience | Phone CTA | Sticky CTA | Parity |

### 19. `plumber-new-orleans-water-heater-repair`

| Metric | Value |
|---|---|
| Target keyword | `water heater repair new orleans` |
| Avg. position | 41.6 |
| Impressions | 681 |
| Top 3 competitors | 1. `rotorooter.com/neworleans/water-heater-repair`<br>2. `serranosplumbingservices.com/water-heater-repair-new-orleans`<br>3. `blairplumbinginc.com/water-heater-repair-and-replacement-new-orleans` |

| Factor | Competitors | YoHomeFix (post-edit) | Notes |
|---|---|---|---|
| Search intent | Find local water heater repair | Find local water heater repair | Same |
| H1 | "Water Heater Repair New Orleans, LA" | `Water Heater Repair in New Orleans, LA — Emergency 24/7` | Exact |
| Title | Keyword + 24/7 | `Water Heater Repair in New Orleans, LA — Emergency 24/7 Service | YoHomeFix` | Exact |
| Content depth | Humidity, hard water, types | City data, services | Parity |
| Local relevance | South Shore, parishes | Nearby, state hub | Parity |
| FAQ | Repair vs replace, causes | FAQPage | Parity |
| Trust signals | 50 years, local | Generic | Lagging |
| Internal links | Service pages | Same | Parity |
| Structured data | Service, FAQ, LocalBusiness | Same | Parity |
| User experience | Phone CTA | Sticky CTA | Parity |

### 20. `plumber-cleveland-water-heater-repair`

| Metric | Value |
|---|---|
| Target keyword | `water heater repair cleveland` |
| Avg. position | 75.5 |
| Impressions | 674 |
| Top 3 competitors | 1. `havenservices.com/cleveland/plumbing/water-heater/water-heater-repair`<br>2. `rotorooter.com/cleveland/water-heaters`<br>3. `myguysnow.com/water-heater-services` |

| Factor | Competitors | YoHomeFix (post-edit) | Notes |
|---|---|---|---|
| Search intent | Find local water heater repair | Find local water heater repair | Same |
| H1 | "Water Heater Repair in Cleveland, OH" | `Water Heater Repair in Cleveland, OH — Emergency 24/7` | Exact |
| Title | Keyword + 24/7 | `Water Heater Repair in Cleveland, OH — Emergency 24/7 Service | YoHomeFix` | Exact |
| Content depth | Cold weather, same-day service | City data, services | Parity |
| Local relevance | Cleveland metro | Nearby, state hub | Parity |
| FAQ | Repair time, replacement | FAQPage | Parity |
| Trust signals | 50+ years, warranty | Generic | Lagging |
| Internal links | Service pages | Same | Parity |
| Structured data | Service, FAQ, LocalBusiness | Same | Parity |
| User experience | Phone/schedule | Sticky CTA | Parity |

---

## Validation Plan (Do Before/After Deployment)

After the next production deployment, complete the following before declaring the work successful:

1. **Live title/H1 check** — Run `scripts/analytics/verify-live.py` or curl each top 5 URL and verify:
   - `plumber-oklahoma-city-drain-cleaning` shows `Drain Cleaning in Oklahoma City, OK` in H1 and `Drain Cleaning in Oklahoma City | 24/7 Emergency | YoHomeFix` in `<title>`.
   - `plumber-san-diego-emergency` shows `24-Hour Emergency Plumber in San Diego, CA` in H1 and `Emergency Plumber in San Diego | 24-Hour | YoHomeFix` in `<title>`.
   - Canonical, Marketcall `tel:1`, and `call_click` tracking still intact.

2. **GSC monitoring** — Track the top 20 pages weekly for 14 days:
   - Average position
   - Impressions and clicks
   - Query positions for `drain cleaning [city]`, `emergency plumber [city]`, `24 hour plumber [city]`, `water heater repair [city]`

3. **Go/No-Go** — If average position does not improve within 14 days, the remaining gap is authority (backlinks/citations), and title/H1 alone will not be enough.
