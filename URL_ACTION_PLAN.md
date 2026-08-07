# URL Action Plan — 2026-08-07

> **The ONLY implementation document.**
> A developer should be able to implement everything without opening GSC, GA4, or any other report.

---

## Executive Summary

- **Pages selected for action:** 20
- **Total pages analyzed:** 1000
- **Revenue per approved call:** $47.23 (MEASURED, n=1)
- **Engines used:** GSC, GA4, Marketcall, Decision Store, Learning Engine, Gott Temporal Prior, Bayesian, Monte Carlo, Markov, Attribution, Link Graph, Business Priority Intelligence, CEO Report

### Site-Level Funnel (Markov Engine)

- **Impressions → Clicks:** 0.000183 (71,195 → 12)
  - Drop-off rate: 99.9817% (71183 lost)
- **Clicks → Calls:** 0.642857 (12 → 8)
  - Drop-off rate: 35.7143% (4 lost)
- **Calls → Approved:** 0.200000 (8 → 1)
  - Drop-off rate: 80.0000% (7 lost)
- **End-to-end conversion:** 0.00002348
- **Highest loss step (by rate):** impression → click (99.9817%)

---

## Per-Page Action Plans

Pages are ordered by Business Priority Intelligence ROI ranking.

### 1. `/plumber-oklahoma`

**Service:** Plumbing Services | **City:** Oklahoma

#### Current Metrics

| Metric | Value | Source |
|--------|-------|--------|
| Impressions | 1,255 | GSC |
| Clicks | 0 | GSC |
| CTR | 0.0000% | GSC |
| Position | N/A | GSC |
| PageRank | 0.000362 | Link Graph |
| In-degree | 1 | Link Graph |
| Is Orphan | False | Link Graph |
| CTR Posterior Mean | 0.000796 | Bayesian |
| CTR CI | [0.000020, 0.002933] | Bayesian |
| Posterior N | 1255 | Bayesian |
| Page Age | 1 days | Gott |
| Maturity Score | 0.0115 | Gott |

#### Forecast

| Field | Value | Classification |
|-------|-------|----------------|
| Expected Calls | 0.5600 | ESTIMATED |
| Calls CI | [0.0000, 3.0000] | ESTIMATED |
| Expected Revenue | $13.91 | ESTIMATED |
| Revenue CI | [$0.00, $94.46] | ESTIMATED |
| Confidence | 99.7%
| Confidence Basis | Bayesian posterior precision (uncalibrated against outcomes) | |

#### Business Value

| Field | Value |
|-------|-------|
| Expected Revenue (MC) | $13.91 |
| Lost Revenue (Opp Loss) | $141.69 |
| Total Revenue Opportunity | $155.60 |
| Lost Clicks | 62 |
| Lost Calls | 3 |
| Revenue Priority | 5/5 |
| Call Priority | 5/5 |
| Traffic Priority | 4/5 |
| Engineering Priority | 5/5 |
| Overall ROI | 94.0% |

#### Ranking Blockers (Root Cause Analysis)

Every blocker is backed by engine evidence. No generic SEO advice.

- **[HIGH] Zero clicks despite impressions**
  - Evidence: `GSC: 1,255 impressions, 0 clicks, CTR=0.0000`
  - Engine: GSC
  - Diagnosis: Title tag and meta description are not compelling enough to earn clicks at current position. SERP snippet is underperforming.
- **[MEDIUM] Very few internal links (in_degree=1)**
  - Evidence: `Link Graph: in_degree=1, PageRank=0.000362`
  - Engine: Link Graph
  - Diagnosis: Only 1 internal link points to this page. Adding more internal links from relevant, high-authority pages will improve crawl frequency and ranking signals.
- **[MEDIUM] PageRank 0.000362 below site median (0.000670)**
  - Evidence: `Link Graph: PageRank=0.000362, site median=0.000670`
  - Engine: Link Graph
  - Diagnosis: Internal link equity flowing to this page is below the site median. More internal links from high-authority pages needed.
- **[LOW] CTR posterior mean=0.000796 (CI width=0.002913)**
  - Evidence: `Bayesian Engine: Beta(1, 1256), mean=0.000796, CI=[0.000020, 0.002933], n_obs=1255`
  - Engine: Bayesian
  - Diagnosis: CTR is estimated at 0.0796% based on 1255 impressions. Sufficient evidence for a stable estimate.
- **[LOW] Page is very young (age=1 days, maturity=0.012)**
  - Evidence: `Gott Engine: page_age_days=1, maturity_score=0.0115`
  - Engine: Gott Temporal Prior
  - Diagnosis: Page has not had enough time to accumulate ranking signals. Some ranking underperformance may be due to age, not quality.

#### Implementation Plan

EXACT changes to implement. Every action includes reason, evidence, and expected improvements.

##### 1. Title Tag

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Plumbing Services in Oklahoma | 24/7 Licensed Plumbers | Free Estimate
- **Reason:** Zero clicks despite impressions — title tag not compelling
- **Evidence:** `GSC: 1,255 impressions, 0 clicks, CTR=0.0000`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — CTR posterior mean is 0.0796%, improving title could increase CTR toward site median
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — title tag not crawled, current title unknown

---

##### 2. Meta Description

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Need a plumbing services in Oklahoma? Licensed, insured plumbers available 24/7. Call now for a free estimate!
- **Reason:** Zero clicks — meta description not earning clicks at current position
- **Evidence:** `GSC: 1,255 impressions, 0 clicks, CTR=0.0000`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — improved meta description could increase CTR from 0.0000% toward site median
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — meta description not crawled

---

##### 3. H1

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Plumbing Services in Oklahoma
- **Reason:** Ensure H1 matches primary search intent (city + service)
- **Evidence:** `Taxonomy: service=None, city=Oklahoma`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — H1 not crawled, current value unknown

---

##### 4. Internal Links (Inbound)

- **Current:** in_degree=1, PageRank=0.000362
- **Recommended:** Add 3 internal links from related and high-authority pages
- **Reason:** Low internal link equity — page is underlinked (in_degree=1) with PageRank 0.000362
- **Evidence:** `Link Graph: is_orphan=False, in_degree=1, PageRank=0.000362`
- **Expected ranking improvement:** MODEL ESTIMATE — internal links pass PageRank and improve crawl discoverability. Expected improvement in position is UNKNOWN without historical calibration.
- **Expected CTR improvement:** UNKNOWN — depends on resulting position change
- **Expected call improvement:** UNKNOWN — depends on traffic increase and call CVR (unmeasured)
- **Expected revenue improvement:** UNKNOWN — depends on call increase and revenue per call (n=1)
- **Confidence:** MEDIUM — link equity deficit is evidence-backed; magnitude of improvement is uncalibrated

  **Links to add:**

  | Source Page | Target Page | Anchor Text | Placement |
  |-------------|-------------|-------------|-----------|
  | `/plumber/north-carolina/drain-cleaning` | `/plumber-oklahoma` | "Plumbing Services in Oklahoma" | Within relevant content or footer service links |
  | `/plumber/north-carolina/pipe-burst-repai` | `/plumber-oklahoma` | "Oklahoma plumbing services" | Within relevant content or footer service links |
  | `/plumber-rochester-whole-house-repiping` | `/plumber-oklahoma` | "expert plumbing services services in Oklahoma" | Within relevant content or footer service links |

---

##### 5. Schema Markup

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add structured data: LocalBusiness, Service, FAQPage
- **Reason:** Structured data helps Google understand page content and can earn rich snippets
- **Evidence:** `Service template: Plumbing Services requires LocalBusiness, Service, FAQPage`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — rich snippets can improve CTR but magnitude is uncalibrated for this site
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — schema presence not verified by crawl

---

##### 6. FAQ Section

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add FAQ section with 5 questions and FAQPage schema
- **Reason:** FAQs target long-tail queries, earn FAQ rich results, and improve content depth
- **Evidence:** `Service template: Plumbing Services has 5 standard FAQs`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — FAQ rich results can improve CTR but magnitude is uncalibrated
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — FAQ presence not verified by crawl

  **FAQs to add:**

  - How much does a plumber cost?
  - Do you offer same-day plumbing service?
  - What plumbing services do you offer?
  - Are you licensed and insured?
  - Do you offer free estimates?

---

##### 7. Entity Coverage

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure these entities are mentioned in content: plumber, plumbing repair, plumbing service, plumbing inspection
- **Reason:** Entity-rich content improves topical authority and helps Google understand page relevance
- **Evidence:** `Service template: Plumbing Services requires entities: plumber, plumbing repair, plumbing service...`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — entity coverage not verified by crawl

  **Entities to include:**

  - plumber
  - plumbing repair
  - plumbing service
  - plumbing inspection

---

##### 8. Content Sections

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure all 7 standard content sections are present
- **Reason:** Complete content structure improves topical coverage and user experience
- **Evidence:** `Content template: 7 standard sections for Plumbing Services pages`
- **Expected ranking improvement:** MODEL ESTIMATE — content depth is a known ranking factor but magnitude is uncalibrated
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — current content not verified by crawl

  **Content sections to ensure:**

  - **Hero Section**
    - H1 with city + service keyword (e.g., "Emergency Plumber in Oklahoma")
    - Click-to-call button (phone number prominent)
    - Trust badges (licensed, insured, years in business)
    - Service area mention
  - **Services Offered**
    - H2: Our Plumbing Services Services in Oklahoma
    - List of specific services with brief descriptions
    - Internal links to related service pages
  - **Why Choose Us**
    - H2: Why Choose Our Oklahoma Plumbers
    - Licensed and insured statement
    - Years of experience
    - Customer review highlights
    - Response time guarantee
  - **Service Area**
    - H2: Areas We Serve in Oklahoma
    - List of neighborhoods or ZIP codes
    - Internal links to nearby city pages
  - **FAQ Section**
    - H2: Frequently Asked Questions
    - 5-8 FAQ items with structured data markup
    - FAQPage schema implementation
  - **Pricing Information**
    - H2: Plumbing Services Pricing in Oklahoma
    - Starting prices or price ranges
    - Factors that affect cost
    - Free estimate call-to-action
  - **Contact & CTA**
    - H2: Call Oklahoma's Trusted Plumbers Today
    - Phone number (click-to-call)
    - Contact form or booking link
    - Business hours
    - Service area reminder

---

##### 9. Trust / EEAT Section

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add 10 EEAT elements
- **Reason:** EEAT signals (license, insurance, reviews, experience) improve trust signals for local service pages
- **Evidence:** `EEAT template: 10 standard trust elements`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — EEAT elements not verified by crawl

  **EEAT elements to add:**

  - Add or verify business license number and state registration
  - Add plumber certification/badge (e.g., Master Plumber, Journeyman)
  - Include years in business (e.g., "Serving [City] since [Year]")
  - Add customer reviews/testimonials section (minimum 3 reviews)
  - Include service area map or list of ZIP codes served
  - Add response time guarantee (e.g., "60-minute response time")
  - Include insurance information (e.g., "Fully bonded and insured")
  - Add business hours including 24/7 emergency availability
  - Include pricing transparency (at least starting prices or ranges)
  - Add team photos or about-us section for personal trust

---

##### 10. CTA / Phone Placement

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add click-to-call button in hero section (above the fold), sticky header, and footer. Phone number should be visible without scrolling.
- **Reason:** Zero clicks from GSC — page may also have CTA issues
- **Evidence:** `GSC: 1255 impressions, 0 clicks`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** MODEL ESTIMATE — prominent CTA can increase call conversion but magnitude is uncalibrated (call CVR unmeasured per-page)
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — current CTA placement not verified by crawl

---

##### 11. Canonical Tag

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure canonical tag points to: /plumber-oklahoma
- **Reason:** Prevent duplicate content issues from URL variations
- **Evidence:** `Best practice — canonical should match the page URL`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — canonical not verified by crawl

---

---

### 2. `/plumber-tennessee`

**Service:** Plumbing Services | **City:** Tennessee

#### Current Metrics

| Metric | Value | Source |
|--------|-------|--------|
| Impressions | 307 | GSC |
| Clicks | 0 | GSC |
| CTR | 0.0000% | GSC |
| Position | N/A | GSC |
| PageRank | 0.000362 | Link Graph |
| In-degree | 1 | Link Graph |
| Is Orphan | False | Link Graph |
| CTR Posterior Mean | 0.003236 | Bayesian |
| CTR CI | [0.000082, 0.011905] | Bayesian |
| Posterior N | 307 | Bayesian |
| Page Age | 1 days | Gott |
| Maturity Score | 0.0115 | Gott |

#### Forecast

| Field | Value | Classification |
|-------|-------|----------------|
| Expected Calls | 0.5260 | ESTIMATED |
| Calls CI | [0.0000, 3.0250] | ESTIMATED |
| Expected Revenue | $12.82 | ESTIMATED |
| Revenue CI | [$0.00, $94.46] | ESTIMATED |
| Confidence | 98.8%
| Confidence Basis | Bayesian posterior precision (uncalibrated against outcomes) | |

#### Business Value

| Field | Value |
|-------|-------|
| Revenue Priority | 5/5 |
| Call Priority | 5/5 |
| Traffic Priority | 4/5 |
| Engineering Priority | 5/5 |
| Overall ROI | 88.9% |

#### Ranking Blockers (Root Cause Analysis)

Every blocker is backed by engine evidence. No generic SEO advice.

- **[HIGH] Zero clicks despite impressions**
  - Evidence: `GSC: 307 impressions, 0 clicks, CTR=0.0000`
  - Engine: GSC
  - Diagnosis: Title tag and meta description are not compelling enough to earn clicks at current position. SERP snippet is underperforming.
- **[MEDIUM] Very few internal links (in_degree=1)**
  - Evidence: `Link Graph: in_degree=1, PageRank=0.000362`
  - Engine: Link Graph
  - Diagnosis: Only 1 internal link points to this page. Adding more internal links from relevant, high-authority pages will improve crawl frequency and ranking signals.
- **[MEDIUM] PageRank 0.000362 below site median (0.000670)**
  - Evidence: `Link Graph: PageRank=0.000362, site median=0.000670`
  - Engine: Link Graph
  - Diagnosis: Internal link equity flowing to this page is below the site median. More internal links from high-authority pages needed.
- **[LOW] CTR posterior mean=0.003236 (CI width=0.011823)**
  - Evidence: `Bayesian Engine: Beta(1, 308), mean=0.003236, CI=[0.000082, 0.011905], n_obs=307`
  - Engine: Bayesian
  - Diagnosis: CTR is estimated at 0.3236% based on 307 impressions. Sufficient evidence for a stable estimate.
- **[LOW] Page is very young (age=1 days, maturity=0.012)**
  - Evidence: `Gott Engine: page_age_days=1, maturity_score=0.0115`
  - Engine: Gott Temporal Prior
  - Diagnosis: Page has not had enough time to accumulate ranking signals. Some ranking underperformance may be due to age, not quality.

#### Implementation Plan

EXACT changes to implement. Every action includes reason, evidence, and expected improvements.

##### 1. Title Tag

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Plumbing Services in Tennessee | 24/7 Licensed Plumbers | Free Estimate
- **Reason:** Zero clicks despite impressions — title tag not compelling
- **Evidence:** `GSC: 307 impressions, 0 clicks, CTR=0.0000`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — CTR posterior mean is 0.3236%, improving title could increase CTR toward site median
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — title tag not crawled, current title unknown

---

##### 2. Meta Description

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Need a plumbing services in Tennessee? Licensed, insured plumbers available 24/7. Call now for a free estimate!
- **Reason:** Zero clicks — meta description not earning clicks at current position
- **Evidence:** `GSC: 307 impressions, 0 clicks, CTR=0.0000`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — improved meta description could increase CTR from 0.0000% toward site median
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — meta description not crawled

---

##### 3. H1

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Plumbing Services in Tennessee
- **Reason:** Ensure H1 matches primary search intent (city + service)
- **Evidence:** `Taxonomy: service=None, city=Tennessee`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — H1 not crawled, current value unknown

---

##### 4. Internal Links (Inbound)

- **Current:** in_degree=1, PageRank=0.000362
- **Recommended:** Add 3 internal links from related and high-authority pages
- **Reason:** Low internal link equity — page is underlinked (in_degree=1) with PageRank 0.000362
- **Evidence:** `Link Graph: is_orphan=False, in_degree=1, PageRank=0.000362`
- **Expected ranking improvement:** MODEL ESTIMATE — internal links pass PageRank and improve crawl discoverability. Expected improvement in position is UNKNOWN without historical calibration.
- **Expected CTR improvement:** UNKNOWN — depends on resulting position change
- **Expected call improvement:** UNKNOWN — depends on traffic increase and call CVR (unmeasured)
- **Expected revenue improvement:** UNKNOWN — depends on call increase and revenue per call (n=1)
- **Confidence:** MEDIUM — link equity deficit is evidence-backed; magnitude of improvement is uncalibrated

  **Links to add:**

  | Source Page | Target Page | Anchor Text | Placement |
  |-------------|-------------|-------------|-----------|
  | `/plumber/north-carolina/drain-cleaning` | `/plumber-tennessee` | "Plumbing Services in Tennessee" | Within relevant content or footer service links |
  | `/plumber/north-carolina/pipe-burst-repai` | `/plumber-tennessee` | "Tennessee plumbing services" | Within relevant content or footer service links |
  | `/plumber-rochester-whole-house-repiping` | `/plumber-tennessee` | "expert plumbing services services in Tennessee" | Within relevant content or footer service links |

---

##### 5. Schema Markup

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add structured data: LocalBusiness, Service, FAQPage
- **Reason:** Structured data helps Google understand page content and can earn rich snippets
- **Evidence:** `Service template: Plumbing Services requires LocalBusiness, Service, FAQPage`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — rich snippets can improve CTR but magnitude is uncalibrated for this site
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — schema presence not verified by crawl

---

##### 6. FAQ Section

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add FAQ section with 5 questions and FAQPage schema
- **Reason:** FAQs target long-tail queries, earn FAQ rich results, and improve content depth
- **Evidence:** `Service template: Plumbing Services has 5 standard FAQs`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — FAQ rich results can improve CTR but magnitude is uncalibrated
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — FAQ presence not verified by crawl

  **FAQs to add:**

  - How much does a plumber cost?
  - Do you offer same-day plumbing service?
  - What plumbing services do you offer?
  - Are you licensed and insured?
  - Do you offer free estimates?

---

##### 7. Entity Coverage

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure these entities are mentioned in content: plumber, plumbing repair, plumbing service, plumbing inspection
- **Reason:** Entity-rich content improves topical authority and helps Google understand page relevance
- **Evidence:** `Service template: Plumbing Services requires entities: plumber, plumbing repair, plumbing service...`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — entity coverage not verified by crawl

  **Entities to include:**

  - plumber
  - plumbing repair
  - plumbing service
  - plumbing inspection

---

##### 8. Content Sections

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure all 7 standard content sections are present
- **Reason:** Complete content structure improves topical coverage and user experience
- **Evidence:** `Content template: 7 standard sections for Plumbing Services pages`
- **Expected ranking improvement:** MODEL ESTIMATE — content depth is a known ranking factor but magnitude is uncalibrated
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — current content not verified by crawl

  **Content sections to ensure:**

  - **Hero Section**
    - H1 with city + service keyword (e.g., "Emergency Plumber in Tennessee")
    - Click-to-call button (phone number prominent)
    - Trust badges (licensed, insured, years in business)
    - Service area mention
  - **Services Offered**
    - H2: Our Plumbing Services Services in Tennessee
    - List of specific services with brief descriptions
    - Internal links to related service pages
  - **Why Choose Us**
    - H2: Why Choose Our Tennessee Plumbers
    - Licensed and insured statement
    - Years of experience
    - Customer review highlights
    - Response time guarantee
  - **Service Area**
    - H2: Areas We Serve in Tennessee
    - List of neighborhoods or ZIP codes
    - Internal links to nearby city pages
  - **FAQ Section**
    - H2: Frequently Asked Questions
    - 5-8 FAQ items with structured data markup
    - FAQPage schema implementation
  - **Pricing Information**
    - H2: Plumbing Services Pricing in Tennessee
    - Starting prices or price ranges
    - Factors that affect cost
    - Free estimate call-to-action
  - **Contact & CTA**
    - H2: Call Tennessee's Trusted Plumbers Today
    - Phone number (click-to-call)
    - Contact form or booking link
    - Business hours
    - Service area reminder

---

##### 9. Trust / EEAT Section

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add 10 EEAT elements
- **Reason:** EEAT signals (license, insurance, reviews, experience) improve trust signals for local service pages
- **Evidence:** `EEAT template: 10 standard trust elements`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — EEAT elements not verified by crawl

  **EEAT elements to add:**

  - Add or verify business license number and state registration
  - Add plumber certification/badge (e.g., Master Plumber, Journeyman)
  - Include years in business (e.g., "Serving [City] since [Year]")
  - Add customer reviews/testimonials section (minimum 3 reviews)
  - Include service area map or list of ZIP codes served
  - Add response time guarantee (e.g., "60-minute response time")
  - Include insurance information (e.g., "Fully bonded and insured")
  - Add business hours including 24/7 emergency availability
  - Include pricing transparency (at least starting prices or ranges)
  - Add team photos or about-us section for personal trust

---

##### 10. CTA / Phone Placement

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add click-to-call button in hero section (above the fold), sticky header, and footer. Phone number should be visible without scrolling.
- **Reason:** Zero clicks from GSC — page may also have CTA issues
- **Evidence:** `GSC: 307 impressions, 0 clicks`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** MODEL ESTIMATE — prominent CTA can increase call conversion but magnitude is uncalibrated (call CVR unmeasured per-page)
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — current CTA placement not verified by crawl

---

##### 11. Canonical Tag

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure canonical tag points to: /plumber-tennessee
- **Reason:** Prevent duplicate content issues from URL variations
- **Evidence:** `Best practice — canonical should match the page URL`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — canonical not verified by crawl

---

---

### 3. `/plumber-philadelphia-emergency`

**Service:** Emergency Plumbing | **City:** Philadelphia

#### Current Metrics

| Metric | Value | Source |
|--------|-------|--------|
| Impressions | 414 | GSC |
| Clicks | 0 | GSC |
| CTR | 0.0000% | GSC |
| Position | N/A | GSC |
| PageRank | 0.000671 | Link Graph |
| In-degree | 1 | Link Graph |
| Is Orphan | False | Link Graph |
| CTR Posterior Mean | 0.002404 | Bayesian |
| CTR CI | [0.000061, 0.008849] | Bayesian |
| Posterior N | 414 | Bayesian |
| Page Age | 1 days | Gott |
| Maturity Score | 0.0115 | Gott |

#### Forecast

| Field | Value | Classification |
|-------|-------|----------------|
| Expected Calls | 0.5505 | ESTIMATED |
| Calls CI | [0.0000, 3.0000] | ESTIMATED |
| Expected Revenue | $13.34 | ESTIMATED |
| Revenue CI | [$0.00, $94.46] | ESTIMATED |
| Confidence | 99.1%
| Confidence Basis | Bayesian posterior precision (uncalibrated against outcomes) | |

#### Business Value

| Field | Value |
|-------|-------|
| Expected Revenue (MC) | $13.34 |
| Lost Revenue (Opp Loss) | $47.23 |
| Total Revenue Opportunity | $60.57 |
| Lost Clicks | 20 |
| Lost Calls | 1 |
| Revenue Priority | 5/5 |
| Call Priority | 5/5 |
| Traffic Priority | 3/5 |
| Engineering Priority | 5/5 |
| Overall ROI | 87.8% |

#### Ranking Blockers (Root Cause Analysis)

Every blocker is backed by engine evidence. No generic SEO advice.

- **[HIGH] Zero clicks despite impressions**
  - Evidence: `GSC: 414 impressions, 0 clicks, CTR=0.0000`
  - Engine: GSC
  - Diagnosis: Title tag and meta description are not compelling enough to earn clicks at current position. SERP snippet is underperforming.
- **[MEDIUM] Very few internal links (in_degree=1)**
  - Evidence: `Link Graph: in_degree=1, PageRank=0.000671`
  - Engine: Link Graph
  - Diagnosis: Only 1 internal link points to this page. Adding more internal links from relevant, high-authority pages will improve crawl frequency and ranking signals.
- **[LOW] CTR posterior mean=0.002404 (CI width=0.008788)**
  - Evidence: `Bayesian Engine: Beta(1, 415), mean=0.002404, CI=[0.000061, 0.008849], n_obs=414`
  - Engine: Bayesian
  - Diagnosis: CTR is estimated at 0.2404% based on 414 impressions. Sufficient evidence for a stable estimate.
- **[LOW] Page is very young (age=1 days, maturity=0.012)**
  - Evidence: `Gott Engine: page_age_days=1, maturity_score=0.0115`
  - Engine: Gott Temporal Prior
  - Diagnosis: Page has not had enough time to accumulate ranking signals. Some ranking underperformance may be due to age, not quality.

#### Implementation Plan

EXACT changes to implement. Every action includes reason, evidence, and expected improvements.

##### 1. Title Tag

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Emergency Plumbing in Philadelphia | 24/7 Licensed Plumbers | Free Estimate
- **Reason:** Zero clicks despite impressions — title tag not compelling
- **Evidence:** `GSC: 414 impressions, 0 clicks, CTR=0.0000`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — CTR posterior mean is 0.2404%, improving title could increase CTR toward site median
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — title tag not crawled, current title unknown

---

##### 2. Meta Description

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Need a emergency plumbing in Philadelphia? Licensed, insured plumbers available 24/7. Call now for a free estimate!
- **Reason:** Zero clicks — meta description not earning clicks at current position
- **Evidence:** `GSC: 414 impressions, 0 clicks, CTR=0.0000`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — improved meta description could increase CTR from 0.0000% toward site median
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — meta description not crawled

---

##### 3. H1

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Emergency Plumbing in Philadelphia
- **Reason:** Ensure H1 matches primary search intent (city + service)
- **Evidence:** `Taxonomy: service=emergency, city=Philadelphia`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — H1 not crawled, current value unknown

---

##### 4. Internal Links (Inbound)

- **Current:** in_degree=1, PageRank=0.000671
- **Recommended:** Add 8 internal links from related and high-authority pages
- **Reason:** Low internal link equity — page is underlinked (in_degree=1) with PageRank 0.000671
- **Evidence:** `Link Graph: is_orphan=False, in_degree=1, PageRank=0.000671`
- **Expected ranking improvement:** MODEL ESTIMATE — internal links pass PageRank and improve crawl discoverability. Expected improvement in position is UNKNOWN without historical calibration.
- **Expected CTR improvement:** UNKNOWN — depends on resulting position change
- **Expected call improvement:** UNKNOWN — depends on traffic increase and call CVR (unmeasured)
- **Expected revenue improvement:** UNKNOWN — depends on call increase and revenue per call (n=1)
- **Confidence:** MEDIUM — link equity deficit is evidence-backed; magnitude of improvement is uncalibrated

  **Links to add:**

  | Source Page | Target Page | Anchor Text | Placement |
  |-------------|-------------|-------------|-----------|
  | `/plumber-san-diego-emergency` | `/plumber-philadelphia-emergency` | "Emergency Plumbing in Philadelphia" | Within services section (same service cluster) |
  | `/plumber-phoenix-emergency` | `/plumber-philadelphia-emergency` | "Philadelphia emergency plumbing" | Within services section (same service cluster) |
  | `/plumber-san-antonio-emergency` | `/plumber-philadelphia-emergency` | "expert emergency plumbing services in Philadelphia" | Within services section (same service cluster) |
  | `/plumber-san-jose-emergency` | `/plumber-philadelphia-emergency` | "trusted Philadelphia plumbers for emergency plumbing" | Within services section (same service cluster) |
  | `/plumber-sacramento-emergency` | `/plumber-philadelphia-emergency` | "Emergency Plumbing in Philadelphia" | Within services section (same service cluster) |
  | `/plumber/north-carolina/drain-cleaning` | `/plumber-philadelphia-emergency` | "Emergency Plumbing in Philadelphia" | Within relevant content or footer service links |
  | `/plumber/north-carolina/pipe-burst-repai` | `/plumber-philadelphia-emergency` | "Philadelphia emergency plumbing" | Within relevant content or footer service links |
  | `/plumber-rochester-whole-house-repiping` | `/plumber-philadelphia-emergency` | "expert emergency plumbing services in Philadelphia" | Within relevant content or footer service links |

---

##### 5. Internal Links (Outbound)

- **Current:** UNKNOWN — not crawled
- **Recommended:** Add 5 outbound internal links to related service pages
- **Reason:** Linking to related service pages strengthens topical cluster and improves site navigation
- **Evidence:** `Taxonomy: 10 related pages in same cluster`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW

  **Links to add:**

  | Source Page | Target Page | Anchor Text | Placement |
  |-------------|-------------|-------------|-----------|
  | `/plumber-philadelphia-emergency` | `/plumber-san-diego-emergency` | "Emergency Plumbing in San Diego" | Within services section or related services area |
  | `/plumber-philadelphia-emergency` | `/plumber-phoenix-emergency` | "Emergency Plumbing in Phoenix" | Within services section or related services area |
  | `/plumber-philadelphia-emergency` | `/plumber-san-antonio-emergency` | "Emergency Plumbing in San Antonio" | Within services section or related services area |
  | `/plumber-philadelphia-emergency` | `/plumber-san-jose-emergency` | "Emergency Plumbing in San Jose" | Within services section or related services area |
  | `/plumber-philadelphia-emergency` | `/plumber-sacramento-emergency` | "Emergency Plumbing in Sacramento" | Within services section or related services area |

---

##### 6. Schema Markup

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add structured data: LocalBusiness, Service, FAQPage, EmergencyService
- **Reason:** Structured data helps Google understand page content and can earn rich snippets
- **Evidence:** `Service template: Emergency Plumbing requires LocalBusiness, Service, FAQPage, EmergencyService`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — rich snippets can improve CTR but magnitude is uncalibrated for this site
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — schema presence not verified by crawl

---

##### 7. FAQ Section

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add FAQ section with 5 questions and FAQPage schema
- **Reason:** FAQs target long-tail queries, earn FAQ rich results, and improve content depth
- **Evidence:** `Service template: Emergency Plumbing has 5 standard FAQs`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — FAQ rich results can improve CTR but magnitude is uncalibrated
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — FAQ presence not verified by crawl

  **FAQs to add:**

  - How quickly can an emergency plumber arrive?
  - What counts as a plumbing emergency?
  - Do you offer 24/7 emergency plumbing service?
  - How much does emergency plumbing cost?
  - What should I do while waiting for the plumber?

---

##### 8. Entity Coverage

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure these entities are mentioned in content: emergency plumber, 24/7 plumbing service, urgent plumbing repair, burst pipe, flooding
- **Reason:** Entity-rich content improves topical authority and helps Google understand page relevance
- **Evidence:** `Service template: Emergency Plumbing requires entities: emergency plumber, 24/7 plumbing service, urgent plumbing repair...`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — entity coverage not verified by crawl

  **Entities to include:**

  - emergency plumber
  - 24/7 plumbing service
  - urgent plumbing repair
  - burst pipe
  - flooding

---

##### 9. Content Sections

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure all 7 standard content sections are present
- **Reason:** Complete content structure improves topical coverage and user experience
- **Evidence:** `Content template: 7 standard sections for Emergency Plumbing pages`
- **Expected ranking improvement:** MODEL ESTIMATE — content depth is a known ranking factor but magnitude is uncalibrated
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — current content not verified by crawl

  **Content sections to ensure:**

  - **Hero Section**
    - H1 with city + service keyword (e.g., "Emergency Plumber in Philadelphia")
    - Click-to-call button (phone number prominent)
    - Trust badges (licensed, insured, years in business)
    - Service area mention
  - **Services Offered**
    - H2: Our Emergency Plumbing Services in Philadelphia
    - List of specific services with brief descriptions
    - Internal links to related service pages
  - **Why Choose Us**
    - H2: Why Choose Our Philadelphia Plumbers
    - Licensed and insured statement
    - Years of experience
    - Customer review highlights
    - Response time guarantee
  - **Service Area**
    - H2: Areas We Serve in Philadelphia
    - List of neighborhoods or ZIP codes
    - Internal links to nearby city pages
  - **FAQ Section**
    - H2: Frequently Asked Questions
    - 5-8 FAQ items with structured data markup
    - FAQPage schema implementation
  - **Pricing Information**
    - H2: Emergency Plumbing Pricing in Philadelphia
    - Starting prices or price ranges
    - Factors that affect cost
    - Free estimate call-to-action
  - **Contact & CTA**
    - H2: Call Philadelphia's Trusted Plumbers Today
    - Phone number (click-to-call)
    - Contact form or booking link
    - Business hours
    - Service area reminder

---

##### 10. Trust / EEAT Section

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add 10 EEAT elements
- **Reason:** EEAT signals (license, insurance, reviews, experience) improve trust signals for local service pages
- **Evidence:** `EEAT template: 10 standard trust elements`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — EEAT elements not verified by crawl

  **EEAT elements to add:**

  - Add or verify business license number and state registration
  - Add plumber certification/badge (e.g., Master Plumber, Journeyman)
  - Include years in business (e.g., "Serving [City] since [Year]")
  - Add customer reviews/testimonials section (minimum 3 reviews)
  - Include service area map or list of ZIP codes served
  - Add response time guarantee (e.g., "60-minute response time")
  - Include insurance information (e.g., "Fully bonded and insured")
  - Add business hours including 24/7 emergency availability
  - Include pricing transparency (at least starting prices or ranges)
  - Add team photos or about-us section for personal trust

---

##### 11. CTA / Phone Placement

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add click-to-call button in hero section (above the fold), sticky header, and footer. Phone number should be visible without scrolling.
- **Reason:** Zero clicks from GSC — page may also have CTA issues
- **Evidence:** `GSC: 414 impressions, 0 clicks`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** MODEL ESTIMATE — prominent CTA can increase call conversion but magnitude is uncalibrated (call CVR unmeasured per-page)
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — current CTA placement not verified by crawl

---

##### 12. Canonical Tag

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure canonical tag points to: /plumber-philadelphia-emergency
- **Reason:** Prevent duplicate content issues from URL variations
- **Evidence:** `Best practice — canonical should match the page URL`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — canonical not verified by crawl

---

---

### 4. `/plumber-missouri`

**Service:** Plumbing Services | **City:** Missouri

#### Current Metrics

| Metric | Value | Source |
|--------|-------|--------|
| Impressions | 86 | GSC |
| Clicks | 0 | GSC |
| CTR | 0.0000% | GSC |
| Position | N/A | GSC |
| PageRank | 0.000362 | Link Graph |
| In-degree | 1 | Link Graph |
| Is Orphan | False | Link Graph |
| CTR Posterior Mean | 0.011364 | Bayesian |
| CTR CI | [0.000291, 0.041515] | Bayesian |
| Posterior N | 86 | Bayesian |
| Page Age | 1 days | Gott |
| Maturity Score | 0.0115 | Gott |

#### Forecast

| Field | Value | Classification |
|-------|-------|----------------|
| Expected Calls | 0.5175 | ESTIMATED |
| Calls CI | [0.0000, 3.0000] | ESTIMATED |
| Expected Revenue | $12.16 | ESTIMATED |
| Revenue CI | [$0.00, $94.46] | ESTIMATED |
| Confidence | 95.9%
| Confidence Basis | Bayesian posterior precision (uncalibrated against outcomes) | |

#### Business Value

| Field | Value |
|-------|-------|
| Revenue Priority | 5/5 |
| Call Priority | 5/5 |
| Traffic Priority | 4/5 |
| Engineering Priority | 5/5 |
| Overall ROI | 86.3% |

#### Ranking Blockers (Root Cause Analysis)

Every blocker is backed by engine evidence. No generic SEO advice.

- **[HIGH] Zero clicks despite impressions**
  - Evidence: `GSC: 86 impressions, 0 clicks, CTR=0.0000`
  - Engine: GSC
  - Diagnosis: Title tag and meta description are not compelling enough to earn clicks at current position. SERP snippet is underperforming.
- **[MEDIUM] Very few internal links (in_degree=1)**
  - Evidence: `Link Graph: in_degree=1, PageRank=0.000362`
  - Engine: Link Graph
  - Diagnosis: Only 1 internal link points to this page. Adding more internal links from relevant, high-authority pages will improve crawl frequency and ranking signals.
- **[MEDIUM] PageRank 0.000362 below site median (0.000670)**
  - Evidence: `Link Graph: PageRank=0.000362, site median=0.000670`
  - Engine: Link Graph
  - Diagnosis: Internal link equity flowing to this page is below the site median. More internal links from high-authority pages needed.
- **[LOW] CTR posterior mean=0.011364 (CI width=0.041224)**
  - Evidence: `Bayesian Engine: Beta(1, 87), mean=0.011364, CI=[0.000291, 0.041515], n_obs=86`
  - Engine: Bayesian
  - Diagnosis: CTR is estimated at 1.1364% based on 86 impressions. Very low evidence volume — estimate is dominated by prior.
- **[LOW] Page is very young (age=1 days, maturity=0.012)**
  - Evidence: `Gott Engine: page_age_days=1, maturity_score=0.0115`
  - Engine: Gott Temporal Prior
  - Diagnosis: Page has not had enough time to accumulate ranking signals. Some ranking underperformance may be due to age, not quality.

#### Implementation Plan

EXACT changes to implement. Every action includes reason, evidence, and expected improvements.

##### 1. Title Tag

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Plumbing Services in Missouri | 24/7 Licensed Plumbers | Free Estimate
- **Reason:** Zero clicks despite impressions — title tag not compelling
- **Evidence:** `GSC: 86 impressions, 0 clicks, CTR=0.0000`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — CTR posterior mean is 1.1364%, improving title could increase CTR toward site median
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — title tag not crawled, current title unknown

---

##### 2. Meta Description

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Need a plumbing services in Missouri? Licensed, insured plumbers available 24/7. Call now for a free estimate!
- **Reason:** Zero clicks — meta description not earning clicks at current position
- **Evidence:** `GSC: 86 impressions, 0 clicks, CTR=0.0000`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — improved meta description could increase CTR from 0.0000% toward site median
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — meta description not crawled

---

##### 3. H1

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Plumbing Services in Missouri
- **Reason:** Ensure H1 matches primary search intent (city + service)
- **Evidence:** `Taxonomy: service=None, city=Missouri`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — H1 not crawled, current value unknown

---

##### 4. Internal Links (Inbound)

- **Current:** in_degree=1, PageRank=0.000362
- **Recommended:** Add 3 internal links from related and high-authority pages
- **Reason:** Low internal link equity — page is underlinked (in_degree=1) with PageRank 0.000362
- **Evidence:** `Link Graph: is_orphan=False, in_degree=1, PageRank=0.000362`
- **Expected ranking improvement:** MODEL ESTIMATE — internal links pass PageRank and improve crawl discoverability. Expected improvement in position is UNKNOWN without historical calibration.
- **Expected CTR improvement:** UNKNOWN — depends on resulting position change
- **Expected call improvement:** UNKNOWN — depends on traffic increase and call CVR (unmeasured)
- **Expected revenue improvement:** UNKNOWN — depends on call increase and revenue per call (n=1)
- **Confidence:** MEDIUM — link equity deficit is evidence-backed; magnitude of improvement is uncalibrated

  **Links to add:**

  | Source Page | Target Page | Anchor Text | Placement |
  |-------------|-------------|-------------|-----------|
  | `/plumber/north-carolina/drain-cleaning` | `/plumber-missouri` | "Plumbing Services in Missouri" | Within relevant content or footer service links |
  | `/plumber/north-carolina/pipe-burst-repai` | `/plumber-missouri` | "Missouri plumbing services" | Within relevant content or footer service links |
  | `/plumber-rochester-whole-house-repiping` | `/plumber-missouri` | "expert plumbing services services in Missouri" | Within relevant content or footer service links |

---

##### 5. Schema Markup

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add structured data: LocalBusiness, Service, FAQPage
- **Reason:** Structured data helps Google understand page content and can earn rich snippets
- **Evidence:** `Service template: Plumbing Services requires LocalBusiness, Service, FAQPage`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — rich snippets can improve CTR but magnitude is uncalibrated for this site
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — schema presence not verified by crawl

---

##### 6. FAQ Section

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add FAQ section with 5 questions and FAQPage schema
- **Reason:** FAQs target long-tail queries, earn FAQ rich results, and improve content depth
- **Evidence:** `Service template: Plumbing Services has 5 standard FAQs`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — FAQ rich results can improve CTR but magnitude is uncalibrated
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — FAQ presence not verified by crawl

  **FAQs to add:**

  - How much does a plumber cost?
  - Do you offer same-day plumbing service?
  - What plumbing services do you offer?
  - Are you licensed and insured?
  - Do you offer free estimates?

---

##### 7. Entity Coverage

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure these entities are mentioned in content: plumber, plumbing repair, plumbing service, plumbing inspection
- **Reason:** Entity-rich content improves topical authority and helps Google understand page relevance
- **Evidence:** `Service template: Plumbing Services requires entities: plumber, plumbing repair, plumbing service...`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — entity coverage not verified by crawl

  **Entities to include:**

  - plumber
  - plumbing repair
  - plumbing service
  - plumbing inspection

---

##### 8. Content Sections

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure all 7 standard content sections are present
- **Reason:** Complete content structure improves topical coverage and user experience
- **Evidence:** `Content template: 7 standard sections for Plumbing Services pages`
- **Expected ranking improvement:** MODEL ESTIMATE — content depth is a known ranking factor but magnitude is uncalibrated
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — current content not verified by crawl

  **Content sections to ensure:**

  - **Hero Section**
    - H1 with city + service keyword (e.g., "Emergency Plumber in Missouri")
    - Click-to-call button (phone number prominent)
    - Trust badges (licensed, insured, years in business)
    - Service area mention
  - **Services Offered**
    - H2: Our Plumbing Services Services in Missouri
    - List of specific services with brief descriptions
    - Internal links to related service pages
  - **Why Choose Us**
    - H2: Why Choose Our Missouri Plumbers
    - Licensed and insured statement
    - Years of experience
    - Customer review highlights
    - Response time guarantee
  - **Service Area**
    - H2: Areas We Serve in Missouri
    - List of neighborhoods or ZIP codes
    - Internal links to nearby city pages
  - **FAQ Section**
    - H2: Frequently Asked Questions
    - 5-8 FAQ items with structured data markup
    - FAQPage schema implementation
  - **Pricing Information**
    - H2: Plumbing Services Pricing in Missouri
    - Starting prices or price ranges
    - Factors that affect cost
    - Free estimate call-to-action
  - **Contact & CTA**
    - H2: Call Missouri's Trusted Plumbers Today
    - Phone number (click-to-call)
    - Contact form or booking link
    - Business hours
    - Service area reminder

---

##### 9. Trust / EEAT Section

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add 10 EEAT elements
- **Reason:** EEAT signals (license, insurance, reviews, experience) improve trust signals for local service pages
- **Evidence:** `EEAT template: 10 standard trust elements`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — EEAT elements not verified by crawl

  **EEAT elements to add:**

  - Add or verify business license number and state registration
  - Add plumber certification/badge (e.g., Master Plumber, Journeyman)
  - Include years in business (e.g., "Serving [City] since [Year]")
  - Add customer reviews/testimonials section (minimum 3 reviews)
  - Include service area map or list of ZIP codes served
  - Add response time guarantee (e.g., "60-minute response time")
  - Include insurance information (e.g., "Fully bonded and insured")
  - Add business hours including 24/7 emergency availability
  - Include pricing transparency (at least starting prices or ranges)
  - Add team photos or about-us section for personal trust

---

##### 10. CTA / Phone Placement

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add click-to-call button in hero section (above the fold), sticky header, and footer. Phone number should be visible without scrolling.
- **Reason:** Zero clicks from GSC — page may also have CTA issues
- **Evidence:** `GSC: 86 impressions, 0 clicks`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** MODEL ESTIMATE — prominent CTA can increase call conversion but magnitude is uncalibrated (call CVR unmeasured per-page)
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — current CTA placement not verified by crawl

---

##### 11. Canonical Tag

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure canonical tag points to: /plumber-missouri
- **Reason:** Prevent duplicate content issues from URL variations
- **Evidence:** `Best practice — canonical should match the page URL`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — canonical not verified by crawl

---

---

### 5. `/plumber-nevada`

**Service:** Plumbing Services | **City:** Nevada

#### Current Metrics

| Metric | Value | Source |
|--------|-------|--------|
| Impressions | 197 | GSC |
| Clicks | 0 | GSC |
| CTR | 0.0000% | GSC |
| Position | N/A | GSC |
| PageRank | 0.000362 | Link Graph |
| In-degree | 1 | Link Graph |
| Is Orphan | False | Link Graph |
| CTR Posterior Mean | 0.005025 | Bayesian |
| CTR CI | [0.000128, 0.018458] | Bayesian |
| Posterior N | 197 | Bayesian |
| Page Age | 1 days | Gott |
| Maturity Score | 0.0115 | Gott |

#### Forecast

| Field | Value | Classification |
|-------|-------|----------------|
| Expected Calls | 0.5150 | ESTIMATED |
| Calls CI | [0.0000, 3.0000] | ESTIMATED |
| Expected Revenue | $12.07 | ESTIMATED |
| Revenue CI | [$0.00, $94.46] | ESTIMATED |
| Confidence | 98.2%
| Confidence Basis | Bayesian posterior precision (uncalibrated against outcomes) | |

#### Business Value

| Field | Value |
|-------|-------|
| Revenue Priority | 5/5 |
| Call Priority | 5/5 |
| Traffic Priority | 4/5 |
| Engineering Priority | 5/5 |
| Overall ROI | 86.1% |

#### Ranking Blockers (Root Cause Analysis)

Every blocker is backed by engine evidence. No generic SEO advice.

- **[HIGH] Zero clicks despite impressions**
  - Evidence: `GSC: 197 impressions, 0 clicks, CTR=0.0000`
  - Engine: GSC
  - Diagnosis: Title tag and meta description are not compelling enough to earn clicks at current position. SERP snippet is underperforming.
- **[MEDIUM] Very few internal links (in_degree=1)**
  - Evidence: `Link Graph: in_degree=1, PageRank=0.000362`
  - Engine: Link Graph
  - Diagnosis: Only 1 internal link points to this page. Adding more internal links from relevant, high-authority pages will improve crawl frequency and ranking signals.
- **[MEDIUM] PageRank 0.000362 below site median (0.000670)**
  - Evidence: `Link Graph: PageRank=0.000362, site median=0.000670`
  - Engine: Link Graph
  - Diagnosis: Internal link equity flowing to this page is below the site median. More internal links from high-authority pages needed.
- **[LOW] CTR posterior mean=0.005025 (CI width=0.018330)**
  - Evidence: `Bayesian Engine: Beta(1, 198), mean=0.005025, CI=[0.000128, 0.018458], n_obs=197`
  - Engine: Bayesian
  - Diagnosis: CTR is estimated at 0.5025% based on 197 impressions. Sufficient evidence for a stable estimate.
- **[LOW] Page is very young (age=1 days, maturity=0.012)**
  - Evidence: `Gott Engine: page_age_days=1, maturity_score=0.0115`
  - Engine: Gott Temporal Prior
  - Diagnosis: Page has not had enough time to accumulate ranking signals. Some ranking underperformance may be due to age, not quality.

#### Implementation Plan

EXACT changes to implement. Every action includes reason, evidence, and expected improvements.

##### 1. Title Tag

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Plumbing Services in Nevada | 24/7 Licensed Plumbers | Free Estimate
- **Reason:** Zero clicks despite impressions — title tag not compelling
- **Evidence:** `GSC: 197 impressions, 0 clicks, CTR=0.0000`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — CTR posterior mean is 0.5025%, improving title could increase CTR toward site median
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — title tag not crawled, current title unknown

---

##### 2. Meta Description

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Need a plumbing services in Nevada? Licensed, insured plumbers available 24/7. Call now for a free estimate!
- **Reason:** Zero clicks — meta description not earning clicks at current position
- **Evidence:** `GSC: 197 impressions, 0 clicks, CTR=0.0000`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — improved meta description could increase CTR from 0.0000% toward site median
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — meta description not crawled

---

##### 3. H1

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Plumbing Services in Nevada
- **Reason:** Ensure H1 matches primary search intent (city + service)
- **Evidence:** `Taxonomy: service=None, city=Nevada`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — H1 not crawled, current value unknown

---

##### 4. Internal Links (Inbound)

- **Current:** in_degree=1, PageRank=0.000362
- **Recommended:** Add 3 internal links from related and high-authority pages
- **Reason:** Low internal link equity — page is underlinked (in_degree=1) with PageRank 0.000362
- **Evidence:** `Link Graph: is_orphan=False, in_degree=1, PageRank=0.000362`
- **Expected ranking improvement:** MODEL ESTIMATE — internal links pass PageRank and improve crawl discoverability. Expected improvement in position is UNKNOWN without historical calibration.
- **Expected CTR improvement:** UNKNOWN — depends on resulting position change
- **Expected call improvement:** UNKNOWN — depends on traffic increase and call CVR (unmeasured)
- **Expected revenue improvement:** UNKNOWN — depends on call increase and revenue per call (n=1)
- **Confidence:** MEDIUM — link equity deficit is evidence-backed; magnitude of improvement is uncalibrated

  **Links to add:**

  | Source Page | Target Page | Anchor Text | Placement |
  |-------------|-------------|-------------|-----------|
  | `/plumber/north-carolina/drain-cleaning` | `/plumber-nevada` | "Plumbing Services in Nevada" | Within relevant content or footer service links |
  | `/plumber/north-carolina/pipe-burst-repai` | `/plumber-nevada` | "Nevada plumbing services" | Within relevant content or footer service links |
  | `/plumber-rochester-whole-house-repiping` | `/plumber-nevada` | "expert plumbing services services in Nevada" | Within relevant content or footer service links |

---

##### 5. Schema Markup

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add structured data: LocalBusiness, Service, FAQPage
- **Reason:** Structured data helps Google understand page content and can earn rich snippets
- **Evidence:** `Service template: Plumbing Services requires LocalBusiness, Service, FAQPage`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — rich snippets can improve CTR but magnitude is uncalibrated for this site
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — schema presence not verified by crawl

---

##### 6. FAQ Section

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add FAQ section with 5 questions and FAQPage schema
- **Reason:** FAQs target long-tail queries, earn FAQ rich results, and improve content depth
- **Evidence:** `Service template: Plumbing Services has 5 standard FAQs`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — FAQ rich results can improve CTR but magnitude is uncalibrated
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — FAQ presence not verified by crawl

  **FAQs to add:**

  - How much does a plumber cost?
  - Do you offer same-day plumbing service?
  - What plumbing services do you offer?
  - Are you licensed and insured?
  - Do you offer free estimates?

---

##### 7. Entity Coverage

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure these entities are mentioned in content: plumber, plumbing repair, plumbing service, plumbing inspection
- **Reason:** Entity-rich content improves topical authority and helps Google understand page relevance
- **Evidence:** `Service template: Plumbing Services requires entities: plumber, plumbing repair, plumbing service...`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — entity coverage not verified by crawl

  **Entities to include:**

  - plumber
  - plumbing repair
  - plumbing service
  - plumbing inspection

---

##### 8. Content Sections

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure all 7 standard content sections are present
- **Reason:** Complete content structure improves topical coverage and user experience
- **Evidence:** `Content template: 7 standard sections for Plumbing Services pages`
- **Expected ranking improvement:** MODEL ESTIMATE — content depth is a known ranking factor but magnitude is uncalibrated
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — current content not verified by crawl

  **Content sections to ensure:**

  - **Hero Section**
    - H1 with city + service keyword (e.g., "Emergency Plumber in Nevada")
    - Click-to-call button (phone number prominent)
    - Trust badges (licensed, insured, years in business)
    - Service area mention
  - **Services Offered**
    - H2: Our Plumbing Services Services in Nevada
    - List of specific services with brief descriptions
    - Internal links to related service pages
  - **Why Choose Us**
    - H2: Why Choose Our Nevada Plumbers
    - Licensed and insured statement
    - Years of experience
    - Customer review highlights
    - Response time guarantee
  - **Service Area**
    - H2: Areas We Serve in Nevada
    - List of neighborhoods or ZIP codes
    - Internal links to nearby city pages
  - **FAQ Section**
    - H2: Frequently Asked Questions
    - 5-8 FAQ items with structured data markup
    - FAQPage schema implementation
  - **Pricing Information**
    - H2: Plumbing Services Pricing in Nevada
    - Starting prices or price ranges
    - Factors that affect cost
    - Free estimate call-to-action
  - **Contact & CTA**
    - H2: Call Nevada's Trusted Plumbers Today
    - Phone number (click-to-call)
    - Contact form or booking link
    - Business hours
    - Service area reminder

---

##### 9. Trust / EEAT Section

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add 10 EEAT elements
- **Reason:** EEAT signals (license, insurance, reviews, experience) improve trust signals for local service pages
- **Evidence:** `EEAT template: 10 standard trust elements`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — EEAT elements not verified by crawl

  **EEAT elements to add:**

  - Add or verify business license number and state registration
  - Add plumber certification/badge (e.g., Master Plumber, Journeyman)
  - Include years in business (e.g., "Serving [City] since [Year]")
  - Add customer reviews/testimonials section (minimum 3 reviews)
  - Include service area map or list of ZIP codes served
  - Add response time guarantee (e.g., "60-minute response time")
  - Include insurance information (e.g., "Fully bonded and insured")
  - Add business hours including 24/7 emergency availability
  - Include pricing transparency (at least starting prices or ranges)
  - Add team photos or about-us section for personal trust

---

##### 10. CTA / Phone Placement

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add click-to-call button in hero section (above the fold), sticky header, and footer. Phone number should be visible without scrolling.
- **Reason:** Zero clicks from GSC — page may also have CTA issues
- **Evidence:** `GSC: 197 impressions, 0 clicks`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** MODEL ESTIMATE — prominent CTA can increase call conversion but magnitude is uncalibrated (call CVR unmeasured per-page)
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — current CTA placement not verified by crawl

---

##### 11. Canonical Tag

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure canonical tag points to: /plumber-nevada
- **Reason:** Prevent duplicate content issues from URL variations
- **Evidence:** `Best practice — canonical should match the page URL`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — canonical not verified by crawl

---

---

### 6. `/areas/las-vegas/89131/emergency`

**Service:** Emergency Plumbing | **City:** Unknown

#### Current Metrics

| Metric | Value | Source |
|--------|-------|--------|
| Impressions | 35 | GSC |
| Clicks | 0 | GSC |
| CTR | 0.0000% | GSC |
| Position | N/A | GSC |
| PageRank | 0.000362 | Link Graph |
| In-degree | 1 | Link Graph |
| Is Orphan | False | Link Graph |
| CTR Posterior Mean | 0.027027 | Bayesian |
| CTR CI | [0.000703, 0.097394] | Bayesian |
| Posterior N | 35 | Bayesian |
| Page Age | 1 days | Gott |
| Maturity Score | 0.0115 | Gott |

#### Forecast

| Field | Value | Classification |
|-------|-------|----------------|
| Expected Calls | 0.4965 | ESTIMATED |
| Calls CI | [0.0000, 3.0000] | ESTIMATED |
| Expected Revenue | $12.61 | ESTIMATED |
| Revenue CI | [$0.00, $94.46] | ESTIMATED |
| Confidence | 90.3%
| Confidence Basis | Bayesian posterior precision (uncalibrated against outcomes) | |

#### Business Value

| Field | Value |
|-------|-------|
| Revenue Priority | 5/5 |
| Call Priority | 5/5 |
| Traffic Priority | 4/5 |
| Engineering Priority | 5/5 |
| Overall ROI | 85.9% |

#### Ranking Blockers (Root Cause Analysis)

Every blocker is backed by engine evidence. No generic SEO advice.

- **[HIGH] Zero clicks despite impressions**
  - Evidence: `GSC: 35 impressions, 0 clicks, CTR=0.0000`
  - Engine: GSC
  - Diagnosis: Title tag and meta description are not compelling enough to earn clicks at current position. SERP snippet is underperforming.
- **[MEDIUM] Very few internal links (in_degree=1)**
  - Evidence: `Link Graph: in_degree=1, PageRank=0.000362`
  - Engine: Link Graph
  - Diagnosis: Only 1 internal link points to this page. Adding more internal links from relevant, high-authority pages will improve crawl frequency and ranking signals.
- **[MEDIUM] PageRank 0.000362 below site median (0.000670)**
  - Evidence: `Link Graph: PageRank=0.000362, site median=0.000670`
  - Engine: Link Graph
  - Diagnosis: Internal link equity flowing to this page is below the site median. More internal links from high-authority pages needed.
- **[LOW] CTR posterior mean=0.027027 (CI width=0.096691)**
  - Evidence: `Bayesian Engine: Beta(1, 36), mean=0.027027, CI=[0.000703, 0.097394], n_obs=35`
  - Engine: Bayesian
  - Diagnosis: CTR is estimated at 2.7027% based on 35 impressions. Very low evidence volume — estimate is dominated by prior.
- **[LOW] Page is very young (age=1 days, maturity=0.012)**
  - Evidence: `Gott Engine: page_age_days=1, maturity_score=0.0115`
  - Engine: Gott Temporal Prior
  - Diagnosis: Page has not had enough time to accumulate ranking signals. Some ranking underperformance may be due to age, not quality.

#### Implementation Plan

EXACT changes to implement. Every action includes reason, evidence, and expected improvements.

##### 1. Title Tag

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Emergency Plumbing in Unknown | 24/7 Licensed Plumbers | Free Estimate
- **Reason:** Zero clicks despite impressions — title tag not compelling
- **Evidence:** `GSC: 35 impressions, 0 clicks, CTR=0.0000`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — CTR posterior mean is 2.7027%, improving title could increase CTR toward site median
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — title tag not crawled, current title unknown

---

##### 2. Meta Description

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Need a emergency plumbing in Unknown? Licensed, insured plumbers available 24/7. Call now for a free estimate!
- **Reason:** Zero clicks — meta description not earning clicks at current position
- **Evidence:** `GSC: 35 impressions, 0 clicks, CTR=0.0000`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — improved meta description could increase CTR from 0.0000% toward site median
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — meta description not crawled

---

##### 3. H1

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Emergency Plumbing in Unknown
- **Reason:** Ensure H1 matches primary search intent (city + service)
- **Evidence:** `Taxonomy: service=None, city=Unknown`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — H1 not crawled, current value unknown

---

##### 4. Internal Links (Inbound)

- **Current:** in_degree=1, PageRank=0.000362
- **Recommended:** Add 3 internal links from related and high-authority pages
- **Reason:** Low internal link equity — page is underlinked (in_degree=1) with PageRank 0.000362
- **Evidence:** `Link Graph: is_orphan=False, in_degree=1, PageRank=0.000362`
- **Expected ranking improvement:** MODEL ESTIMATE — internal links pass PageRank and improve crawl discoverability. Expected improvement in position is UNKNOWN without historical calibration.
- **Expected CTR improvement:** UNKNOWN — depends on resulting position change
- **Expected call improvement:** UNKNOWN — depends on traffic increase and call CVR (unmeasured)
- **Expected revenue improvement:** UNKNOWN — depends on call increase and revenue per call (n=1)
- **Confidence:** MEDIUM — link equity deficit is evidence-backed; magnitude of improvement is uncalibrated

  **Links to add:**

  | Source Page | Target Page | Anchor Text | Placement |
  |-------------|-------------|-------------|-----------|
  | `/plumber/north-carolina/drain-cleaning` | `/areas/las-vegas/89131/emergency` | "Emergency Plumbing in Unknown" | Within relevant content or footer service links |
  | `/plumber/north-carolina/pipe-burst-repai` | `/areas/las-vegas/89131/emergency` | "Unknown emergency plumbing" | Within relevant content or footer service links |
  | `/plumber-rochester-whole-house-repiping` | `/areas/las-vegas/89131/emergency` | "expert emergency plumbing services in Unknown" | Within relevant content or footer service links |

---

##### 5. Schema Markup

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add structured data: LocalBusiness, Service, FAQPage, EmergencyService
- **Reason:** Structured data helps Google understand page content and can earn rich snippets
- **Evidence:** `Service template: Emergency Plumbing requires LocalBusiness, Service, FAQPage, EmergencyService`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — rich snippets can improve CTR but magnitude is uncalibrated for this site
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — schema presence not verified by crawl

---

##### 6. FAQ Section

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add FAQ section with 5 questions and FAQPage schema
- **Reason:** FAQs target long-tail queries, earn FAQ rich results, and improve content depth
- **Evidence:** `Service template: Emergency Plumbing has 5 standard FAQs`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — FAQ rich results can improve CTR but magnitude is uncalibrated
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — FAQ presence not verified by crawl

  **FAQs to add:**

  - How quickly can an emergency plumber arrive?
  - What counts as a plumbing emergency?
  - Do you offer 24/7 emergency plumbing service?
  - How much does emergency plumbing cost?
  - What should I do while waiting for the plumber?

---

##### 7. Entity Coverage

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure these entities are mentioned in content: emergency plumber, 24/7 plumbing service, urgent plumbing repair, burst pipe, flooding
- **Reason:** Entity-rich content improves topical authority and helps Google understand page relevance
- **Evidence:** `Service template: Emergency Plumbing requires entities: emergency plumber, 24/7 plumbing service, urgent plumbing repair...`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — entity coverage not verified by crawl

  **Entities to include:**

  - emergency plumber
  - 24/7 plumbing service
  - urgent plumbing repair
  - burst pipe
  - flooding

---

##### 8. Content Sections

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure all 7 standard content sections are present
- **Reason:** Complete content structure improves topical coverage and user experience
- **Evidence:** `Content template: 7 standard sections for Emergency Plumbing pages`
- **Expected ranking improvement:** MODEL ESTIMATE — content depth is a known ranking factor but magnitude is uncalibrated
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — current content not verified by crawl

  **Content sections to ensure:**

  - **Hero Section**
    - H1 with city + service keyword (e.g., "Emergency Plumber in Unknown")
    - Click-to-call button (phone number prominent)
    - Trust badges (licensed, insured, years in business)
    - Service area mention
  - **Services Offered**
    - H2: Our Emergency Plumbing Services in Unknown
    - List of specific services with brief descriptions
    - Internal links to related service pages
  - **Why Choose Us**
    - H2: Why Choose Our Unknown Plumbers
    - Licensed and insured statement
    - Years of experience
    - Customer review highlights
    - Response time guarantee
  - **Service Area**
    - H2: Areas We Serve in Unknown
    - List of neighborhoods or ZIP codes
    - Internal links to nearby city pages
  - **FAQ Section**
    - H2: Frequently Asked Questions
    - 5-8 FAQ items with structured data markup
    - FAQPage schema implementation
  - **Pricing Information**
    - H2: Emergency Plumbing Pricing in Unknown
    - Starting prices or price ranges
    - Factors that affect cost
    - Free estimate call-to-action
  - **Contact & CTA**
    - H2: Call Unknown's Trusted Plumbers Today
    - Phone number (click-to-call)
    - Contact form or booking link
    - Business hours
    - Service area reminder

---

##### 9. Trust / EEAT Section

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add 10 EEAT elements
- **Reason:** EEAT signals (license, insurance, reviews, experience) improve trust signals for local service pages
- **Evidence:** `EEAT template: 10 standard trust elements`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — EEAT elements not verified by crawl

  **EEAT elements to add:**

  - Add or verify business license number and state registration
  - Add plumber certification/badge (e.g., Master Plumber, Journeyman)
  - Include years in business (e.g., "Serving [City] since [Year]")
  - Add customer reviews/testimonials section (minimum 3 reviews)
  - Include service area map or list of ZIP codes served
  - Add response time guarantee (e.g., "60-minute response time")
  - Include insurance information (e.g., "Fully bonded and insured")
  - Add business hours including 24/7 emergency availability
  - Include pricing transparency (at least starting prices or ranges)
  - Add team photos or about-us section for personal trust

---

##### 10. CTA / Phone Placement

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add click-to-call button in hero section (above the fold), sticky header, and footer. Phone number should be visible without scrolling.
- **Reason:** Zero clicks from GSC — page may also have CTA issues
- **Evidence:** `GSC: 35 impressions, 0 clicks`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** MODEL ESTIMATE — prominent CTA can increase call conversion but magnitude is uncalibrated (call CVR unmeasured per-page)
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — current CTA placement not verified by crawl

---

##### 11. Canonical Tag

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure canonical tag points to: /areas/las-vegas/89131/emergency
- **Reason:** Prevent duplicate content issues from URL variations
- **Evidence:** `Best practice — canonical should match the page URL`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — canonical not verified by crawl

---

---

### 7. `/plumber-ohio`

**Service:** Plumbing Services | **City:** Ohio

#### Current Metrics

| Metric | Value | Source |
|--------|-------|--------|
| Impressions | 109 | GSC |
| Clicks | 0 | GSC |
| CTR | 0.0000% | GSC |
| Position | N/A | GSC |
| PageRank | 0.000362 | Link Graph |
| In-degree | 1 | Link Graph |
| Is Orphan | False | Link Graph |
| CTR Posterior Mean | 0.009009 | Bayesian |
| CTR CI | [0.000230, 0.032979] | Bayesian |
| Posterior N | 109 | Bayesian |
| Page Age | 1 days | Gott |
| Maturity Score | 0.0115 | Gott |

#### Forecast

| Field | Value | Classification |
|-------|-------|----------------|
| Expected Calls | 0.4900 | ESTIMATED |
| Calls CI | [0.0000, 3.0000] | ESTIMATED |
| Expected Revenue | $12.47 | ESTIMATED |
| Revenue CI | [$0.00, $94.46] | ESTIMATED |
| Confidence | 96.7%
| Confidence Basis | Bayesian posterior precision (uncalibrated against outcomes) | |

#### Business Value

| Field | Value |
|-------|-------|
| Revenue Priority | 5/5 |
| Call Priority | 5/5 |
| Traffic Priority | 4/5 |
| Engineering Priority | 5/5 |
| Overall ROI | 85.8% |

#### Ranking Blockers (Root Cause Analysis)

Every blocker is backed by engine evidence. No generic SEO advice.

- **[HIGH] Zero clicks despite impressions**
  - Evidence: `GSC: 109 impressions, 0 clicks, CTR=0.0000`
  - Engine: GSC
  - Diagnosis: Title tag and meta description are not compelling enough to earn clicks at current position. SERP snippet is underperforming.
- **[MEDIUM] Very few internal links (in_degree=1)**
  - Evidence: `Link Graph: in_degree=1, PageRank=0.000362`
  - Engine: Link Graph
  - Diagnosis: Only 1 internal link points to this page. Adding more internal links from relevant, high-authority pages will improve crawl frequency and ranking signals.
- **[MEDIUM] PageRank 0.000362 below site median (0.000670)**
  - Evidence: `Link Graph: PageRank=0.000362, site median=0.000670`
  - Engine: Link Graph
  - Diagnosis: Internal link equity flowing to this page is below the site median. More internal links from high-authority pages needed.
- **[LOW] CTR posterior mean=0.009009 (CI width=0.032749)**
  - Evidence: `Bayesian Engine: Beta(1, 110), mean=0.009009, CI=[0.000230, 0.032979], n_obs=109`
  - Engine: Bayesian
  - Diagnosis: CTR is estimated at 0.9009% based on 109 impressions. Sufficient evidence for a stable estimate.
- **[LOW] Page is very young (age=1 days, maturity=0.012)**
  - Evidence: `Gott Engine: page_age_days=1, maturity_score=0.0115`
  - Engine: Gott Temporal Prior
  - Diagnosis: Page has not had enough time to accumulate ranking signals. Some ranking underperformance may be due to age, not quality.

#### Implementation Plan

EXACT changes to implement. Every action includes reason, evidence, and expected improvements.

##### 1. Title Tag

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Plumbing Services in Ohio | 24/7 Licensed Plumbers | Free Estimate
- **Reason:** Zero clicks despite impressions — title tag not compelling
- **Evidence:** `GSC: 109 impressions, 0 clicks, CTR=0.0000`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — CTR posterior mean is 0.9009%, improving title could increase CTR toward site median
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — title tag not crawled, current title unknown

---

##### 2. Meta Description

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Need a plumbing services in Ohio? Licensed, insured plumbers available 24/7. Call now for a free estimate!
- **Reason:** Zero clicks — meta description not earning clicks at current position
- **Evidence:** `GSC: 109 impressions, 0 clicks, CTR=0.0000`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — improved meta description could increase CTR from 0.0000% toward site median
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — meta description not crawled

---

##### 3. H1

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Plumbing Services in Ohio
- **Reason:** Ensure H1 matches primary search intent (city + service)
- **Evidence:** `Taxonomy: service=None, city=Ohio`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — H1 not crawled, current value unknown

---

##### 4. Internal Links (Inbound)

- **Current:** in_degree=1, PageRank=0.000362
- **Recommended:** Add 3 internal links from related and high-authority pages
- **Reason:** Low internal link equity — page is underlinked (in_degree=1) with PageRank 0.000362
- **Evidence:** `Link Graph: is_orphan=False, in_degree=1, PageRank=0.000362`
- **Expected ranking improvement:** MODEL ESTIMATE — internal links pass PageRank and improve crawl discoverability. Expected improvement in position is UNKNOWN without historical calibration.
- **Expected CTR improvement:** UNKNOWN — depends on resulting position change
- **Expected call improvement:** UNKNOWN — depends on traffic increase and call CVR (unmeasured)
- **Expected revenue improvement:** UNKNOWN — depends on call increase and revenue per call (n=1)
- **Confidence:** MEDIUM — link equity deficit is evidence-backed; magnitude of improvement is uncalibrated

  **Links to add:**

  | Source Page | Target Page | Anchor Text | Placement |
  |-------------|-------------|-------------|-----------|
  | `/plumber/north-carolina/drain-cleaning` | `/plumber-ohio` | "Plumbing Services in Ohio" | Within relevant content or footer service links |
  | `/plumber/north-carolina/pipe-burst-repai` | `/plumber-ohio` | "Ohio plumbing services" | Within relevant content or footer service links |
  | `/plumber-rochester-whole-house-repiping` | `/plumber-ohio` | "expert plumbing services services in Ohio" | Within relevant content or footer service links |

---

##### 5. Schema Markup

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add structured data: LocalBusiness, Service, FAQPage
- **Reason:** Structured data helps Google understand page content and can earn rich snippets
- **Evidence:** `Service template: Plumbing Services requires LocalBusiness, Service, FAQPage`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — rich snippets can improve CTR but magnitude is uncalibrated for this site
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — schema presence not verified by crawl

---

##### 6. FAQ Section

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add FAQ section with 5 questions and FAQPage schema
- **Reason:** FAQs target long-tail queries, earn FAQ rich results, and improve content depth
- **Evidence:** `Service template: Plumbing Services has 5 standard FAQs`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — FAQ rich results can improve CTR but magnitude is uncalibrated
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — FAQ presence not verified by crawl

  **FAQs to add:**

  - How much does a plumber cost?
  - Do you offer same-day plumbing service?
  - What plumbing services do you offer?
  - Are you licensed and insured?
  - Do you offer free estimates?

---

##### 7. Entity Coverage

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure these entities are mentioned in content: plumber, plumbing repair, plumbing service, plumbing inspection
- **Reason:** Entity-rich content improves topical authority and helps Google understand page relevance
- **Evidence:** `Service template: Plumbing Services requires entities: plumber, plumbing repair, plumbing service...`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — entity coverage not verified by crawl

  **Entities to include:**

  - plumber
  - plumbing repair
  - plumbing service
  - plumbing inspection

---

##### 8. Content Sections

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure all 7 standard content sections are present
- **Reason:** Complete content structure improves topical coverage and user experience
- **Evidence:** `Content template: 7 standard sections for Plumbing Services pages`
- **Expected ranking improvement:** MODEL ESTIMATE — content depth is a known ranking factor but magnitude is uncalibrated
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — current content not verified by crawl

  **Content sections to ensure:**

  - **Hero Section**
    - H1 with city + service keyword (e.g., "Emergency Plumber in Ohio")
    - Click-to-call button (phone number prominent)
    - Trust badges (licensed, insured, years in business)
    - Service area mention
  - **Services Offered**
    - H2: Our Plumbing Services Services in Ohio
    - List of specific services with brief descriptions
    - Internal links to related service pages
  - **Why Choose Us**
    - H2: Why Choose Our Ohio Plumbers
    - Licensed and insured statement
    - Years of experience
    - Customer review highlights
    - Response time guarantee
  - **Service Area**
    - H2: Areas We Serve in Ohio
    - List of neighborhoods or ZIP codes
    - Internal links to nearby city pages
  - **FAQ Section**
    - H2: Frequently Asked Questions
    - 5-8 FAQ items with structured data markup
    - FAQPage schema implementation
  - **Pricing Information**
    - H2: Plumbing Services Pricing in Ohio
    - Starting prices or price ranges
    - Factors that affect cost
    - Free estimate call-to-action
  - **Contact & CTA**
    - H2: Call Ohio's Trusted Plumbers Today
    - Phone number (click-to-call)
    - Contact form or booking link
    - Business hours
    - Service area reminder

---

##### 9. Trust / EEAT Section

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add 10 EEAT elements
- **Reason:** EEAT signals (license, insurance, reviews, experience) improve trust signals for local service pages
- **Evidence:** `EEAT template: 10 standard trust elements`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — EEAT elements not verified by crawl

  **EEAT elements to add:**

  - Add or verify business license number and state registration
  - Add plumber certification/badge (e.g., Master Plumber, Journeyman)
  - Include years in business (e.g., "Serving [City] since [Year]")
  - Add customer reviews/testimonials section (minimum 3 reviews)
  - Include service area map or list of ZIP codes served
  - Add response time guarantee (e.g., "60-minute response time")
  - Include insurance information (e.g., "Fully bonded and insured")
  - Add business hours including 24/7 emergency availability
  - Include pricing transparency (at least starting prices or ranges)
  - Add team photos or about-us section for personal trust

---

##### 10. CTA / Phone Placement

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add click-to-call button in hero section (above the fold), sticky header, and footer. Phone number should be visible without scrolling.
- **Reason:** Zero clicks from GSC — page may also have CTA issues
- **Evidence:** `GSC: 109 impressions, 0 clicks`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** MODEL ESTIMATE — prominent CTA can increase call conversion but magnitude is uncalibrated (call CVR unmeasured per-page)
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — current CTA placement not verified by crawl

---

##### 11. Canonical Tag

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure canonical tag points to: /plumber-ohio
- **Reason:** Prevent duplicate content issues from URL variations
- **Evidence:** `Best practice — canonical should match the page URL`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — canonical not verified by crawl

---

---

### 8. `/plumber-usa`

**Service:** Plumbing Services | **City:** Usa

#### Current Metrics

| Metric | Value | Source |
|--------|-------|--------|
| Impressions | 47 | GSC |
| Clicks | 0 | GSC |
| CTR | 0.0000% | GSC |
| Position | N/A | GSC |
| PageRank | 0.000362 | Link Graph |
| In-degree | 1 | Link Graph |
| Is Orphan | False | Link Graph |
| CTR Posterior Mean | 0.020408 | Bayesian |
| CTR CI | [0.000527, 0.073973] | Bayesian |
| Posterior N | 47 | Bayesian |
| GA4 Sessions | 1 | GA4 |
| Engagement Rate | 1.0 | GA4 |
| Phone Clicks | 0 | GA4 |
| Page Age | 1 days | Gott |
| Maturity Score | 0.0115 | Gott |

#### Forecast

| Field | Value | Classification |
|-------|-------|----------------|
| Expected Calls | 0.4995 | ESTIMATED |
| Calls CI | [0.0000, 3.0000] | ESTIMATED |
| Expected Revenue | $12.33 | ESTIMATED |
| Revenue CI | [$0.00, $94.46] | ESTIMATED |
| Confidence | 92.7%
| Confidence Basis | Bayesian posterior precision (uncalibrated against outcomes) | |

#### Business Value

| Field | Value |
|-------|-------|
| Revenue Priority | 5/5 |
| Call Priority | 5/5 |
| Traffic Priority | 4/5 |
| Engineering Priority | 5/5 |
| Overall ROI | 85.5% |

#### Ranking Blockers (Root Cause Analysis)

Every blocker is backed by engine evidence. No generic SEO advice.

- **[HIGH] Zero clicks despite impressions**
  - Evidence: `GSC: 47 impressions, 0 clicks, CTR=0.0000`
  - Engine: GSC
  - Diagnosis: Title tag and meta description are not compelling enough to earn clicks at current position. SERP snippet is underperforming.
- **[MEDIUM] Very few internal links (in_degree=1)**
  - Evidence: `Link Graph: in_degree=1, PageRank=0.000362`
  - Engine: Link Graph
  - Diagnosis: Only 1 internal link points to this page. Adding more internal links from relevant, high-authority pages will improve crawl frequency and ranking signals.
- **[MEDIUM] PageRank 0.000362 below site median (0.000670)**
  - Evidence: `Link Graph: PageRank=0.000362, site median=0.000670`
  - Engine: Link Graph
  - Diagnosis: Internal link equity flowing to this page is below the site median. More internal links from high-authority pages needed.
- **[MEDIUM] Zero phone click events despite sessions**
  - Evidence: `GA4: sessions=1, phone_click_events=0`
  - Engine: GA4
  - Diagnosis: Visitors are not clicking the call button. CTA placement, visibility, or copy may be poor. Phone number may not be prominently displayed.
- **[LOW] CTR posterior mean=0.020408 (CI width=0.073445)**
  - Evidence: `Bayesian Engine: Beta(1, 48), mean=0.020408, CI=[0.000527, 0.073973], n_obs=47`
  - Engine: Bayesian
  - Diagnosis: CTR is estimated at 2.0408% based on 47 impressions. Very low evidence volume — estimate is dominated by prior.
- **[LOW] Page is very young (age=1 days, maturity=0.012)**
  - Evidence: `Gott Engine: page_age_days=1, maturity_score=0.0115`
  - Engine: Gott Temporal Prior
  - Diagnosis: Page has not had enough time to accumulate ranking signals. Some ranking underperformance may be due to age, not quality.

#### Implementation Plan

EXACT changes to implement. Every action includes reason, evidence, and expected improvements.

##### 1. Title Tag

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Plumbing Services in Usa | 24/7 Licensed Plumbers | Free Estimate
- **Reason:** Zero clicks despite impressions — title tag not compelling
- **Evidence:** `GSC: 47 impressions, 0 clicks, CTR=0.0000`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — CTR posterior mean is 2.0408%, improving title could increase CTR toward site median
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — title tag not crawled, current title unknown

---

##### 2. Meta Description

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Need a plumbing services in Usa? Licensed, insured plumbers available 24/7. Call now for a free estimate!
- **Reason:** Zero clicks — meta description not earning clicks at current position
- **Evidence:** `GSC: 47 impressions, 0 clicks, CTR=0.0000`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — improved meta description could increase CTR from 0.0000% toward site median
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — meta description not crawled

---

##### 3. H1

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Plumbing Services in Usa
- **Reason:** Ensure H1 matches primary search intent (city + service)
- **Evidence:** `Taxonomy: service=None, city=Usa`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — H1 not crawled, current value unknown

---

##### 4. Internal Links (Inbound)

- **Current:** in_degree=1, PageRank=0.000362
- **Recommended:** Add 3 internal links from related and high-authority pages
- **Reason:** Low internal link equity — page is underlinked (in_degree=1) with PageRank 0.000362
- **Evidence:** `Link Graph: is_orphan=False, in_degree=1, PageRank=0.000362`
- **Expected ranking improvement:** MODEL ESTIMATE — internal links pass PageRank and improve crawl discoverability. Expected improvement in position is UNKNOWN without historical calibration.
- **Expected CTR improvement:** UNKNOWN — depends on resulting position change
- **Expected call improvement:** UNKNOWN — depends on traffic increase and call CVR (unmeasured)
- **Expected revenue improvement:** UNKNOWN — depends on call increase and revenue per call (n=1)
- **Confidence:** MEDIUM — link equity deficit is evidence-backed; magnitude of improvement is uncalibrated

  **Links to add:**

  | Source Page | Target Page | Anchor Text | Placement |
  |-------------|-------------|-------------|-----------|
  | `/plumber/north-carolina/drain-cleaning` | `/plumber-usa` | "Plumbing Services in Usa" | Within relevant content or footer service links |
  | `/plumber/north-carolina/pipe-burst-repai` | `/plumber-usa` | "Usa plumbing services" | Within relevant content or footer service links |
  | `/plumber-rochester-whole-house-repiping` | `/plumber-usa` | "expert plumbing services services in Usa" | Within relevant content or footer service links |

---

##### 5. Schema Markup

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add structured data: LocalBusiness, Service, FAQPage
- **Reason:** Structured data helps Google understand page content and can earn rich snippets
- **Evidence:** `Service template: Plumbing Services requires LocalBusiness, Service, FAQPage`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — rich snippets can improve CTR but magnitude is uncalibrated for this site
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — schema presence not verified by crawl

---

##### 6. FAQ Section

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add FAQ section with 5 questions and FAQPage schema
- **Reason:** FAQs target long-tail queries, earn FAQ rich results, and improve content depth
- **Evidence:** `Service template: Plumbing Services has 5 standard FAQs`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — FAQ rich results can improve CTR but magnitude is uncalibrated
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — FAQ presence not verified by crawl

  **FAQs to add:**

  - How much does a plumber cost?
  - Do you offer same-day plumbing service?
  - What plumbing services do you offer?
  - Are you licensed and insured?
  - Do you offer free estimates?

---

##### 7. Entity Coverage

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure these entities are mentioned in content: plumber, plumbing repair, plumbing service, plumbing inspection
- **Reason:** Entity-rich content improves topical authority and helps Google understand page relevance
- **Evidence:** `Service template: Plumbing Services requires entities: plumber, plumbing repair, plumbing service...`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — entity coverage not verified by crawl

  **Entities to include:**

  - plumber
  - plumbing repair
  - plumbing service
  - plumbing inspection

---

##### 8. Content Sections

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure all 7 standard content sections are present
- **Reason:** Complete content structure improves topical coverage and user experience
- **Evidence:** `Content template: 7 standard sections for Plumbing Services pages`
- **Expected ranking improvement:** MODEL ESTIMATE — content depth is a known ranking factor but magnitude is uncalibrated
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — current content not verified by crawl

  **Content sections to ensure:**

  - **Hero Section**
    - H1 with city + service keyword (e.g., "Emergency Plumber in Usa")
    - Click-to-call button (phone number prominent)
    - Trust badges (licensed, insured, years in business)
    - Service area mention
  - **Services Offered**
    - H2: Our Plumbing Services Services in Usa
    - List of specific services with brief descriptions
    - Internal links to related service pages
  - **Why Choose Us**
    - H2: Why Choose Our Usa Plumbers
    - Licensed and insured statement
    - Years of experience
    - Customer review highlights
    - Response time guarantee
  - **Service Area**
    - H2: Areas We Serve in Usa
    - List of neighborhoods or ZIP codes
    - Internal links to nearby city pages
  - **FAQ Section**
    - H2: Frequently Asked Questions
    - 5-8 FAQ items with structured data markup
    - FAQPage schema implementation
  - **Pricing Information**
    - H2: Plumbing Services Pricing in Usa
    - Starting prices or price ranges
    - Factors that affect cost
    - Free estimate call-to-action
  - **Contact & CTA**
    - H2: Call Usa's Trusted Plumbers Today
    - Phone number (click-to-call)
    - Contact form or booking link
    - Business hours
    - Service area reminder

---

##### 9. Trust / EEAT Section

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add 10 EEAT elements
- **Reason:** EEAT signals (license, insurance, reviews, experience) improve trust signals for local service pages
- **Evidence:** `EEAT template: 10 standard trust elements`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — EEAT elements not verified by crawl

  **EEAT elements to add:**

  - Add or verify business license number and state registration
  - Add plumber certification/badge (e.g., Master Plumber, Journeyman)
  - Include years in business (e.g., "Serving [City] since [Year]")
  - Add customer reviews/testimonials section (minimum 3 reviews)
  - Include service area map or list of ZIP codes served
  - Add response time guarantee (e.g., "60-minute response time")
  - Include insurance information (e.g., "Fully bonded and insured")
  - Add business hours including 24/7 emergency availability
  - Include pricing transparency (at least starting prices or ranges)
  - Add team photos or about-us section for personal trust

---

##### 10. CTA / Phone Placement

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add click-to-call button in hero section (above the fold), sticky header, and footer. Phone number should be visible without scrolling.
- **Reason:** Zero phone click events despite GA4 sessions — CTA not visible or not compelling
- **Evidence:** `GA4: sessions=1, phone_click_events=0`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** MODEL ESTIMATE — prominent CTA can increase call conversion but magnitude is uncalibrated (call CVR unmeasured per-page)
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — current CTA placement not verified by crawl

---

##### 11. Canonical Tag

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure canonical tag points to: /plumber-usa
- **Reason:** Prevent duplicate content issues from URL variations
- **Evidence:** `Best practice — canonical should match the page URL`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — canonical not verified by crawl

---

---

### 9. `/plumber-california`

**Service:** Plumbing Services | **City:** California

#### Current Metrics

| Metric | Value | Source |
|--------|-------|--------|
| Impressions | 204 | GSC |
| Clicks | 0 | GSC |
| CTR | 0.0000% | GSC |
| Position | N/A | GSC |
| PageRank | 0.000362 | Link Graph |
| In-degree | 1 | Link Graph |
| Is Orphan | False | Link Graph |
| CTR Posterior Mean | 0.004854 | Bayesian |
| CTR CI | [0.000123, 0.017834] | Bayesian |
| Posterior N | 204 | Bayesian |
| Page Age | 1 days | Gott |
| Maturity Score | 0.0115 | Gott |

#### Forecast

| Field | Value | Classification |
|-------|-------|----------------|
| Expected Calls | 0.5110 | ESTIMATED |
| Calls CI | [0.0000, 3.0000] | ESTIMATED |
| Expected Revenue | $11.64 | ESTIMATED |
| Revenue CI | [$0.00, $94.46] | ESTIMATED |
| Confidence | 98.2%
| Confidence Basis | Bayesian posterior precision (uncalibrated against outcomes) | |

#### Business Value

| Field | Value |
|-------|-------|
| Revenue Priority | 5/5 |
| Call Priority | 5/5 |
| Traffic Priority | 4/5 |
| Engineering Priority | 5/5 |
| Overall ROI | 84.7% |

#### Ranking Blockers (Root Cause Analysis)

Every blocker is backed by engine evidence. No generic SEO advice.

- **[HIGH] Zero clicks despite impressions**
  - Evidence: `GSC: 204 impressions, 0 clicks, CTR=0.0000`
  - Engine: GSC
  - Diagnosis: Title tag and meta description are not compelling enough to earn clicks at current position. SERP snippet is underperforming.
- **[MEDIUM] Very few internal links (in_degree=1)**
  - Evidence: `Link Graph: in_degree=1, PageRank=0.000362`
  - Engine: Link Graph
  - Diagnosis: Only 1 internal link points to this page. Adding more internal links from relevant, high-authority pages will improve crawl frequency and ranking signals.
- **[MEDIUM] PageRank 0.000362 below site median (0.000670)**
  - Evidence: `Link Graph: PageRank=0.000362, site median=0.000670`
  - Engine: Link Graph
  - Diagnosis: Internal link equity flowing to this page is below the site median. More internal links from high-authority pages needed.
- **[LOW] CTR posterior mean=0.004854 (CI width=0.017710)**
  - Evidence: `Bayesian Engine: Beta(1, 205), mean=0.004854, CI=[0.000123, 0.017834], n_obs=204`
  - Engine: Bayesian
  - Diagnosis: CTR is estimated at 0.4854% based on 204 impressions. Sufficient evidence for a stable estimate.
- **[LOW] Page is very young (age=1 days, maturity=0.012)**
  - Evidence: `Gott Engine: page_age_days=1, maturity_score=0.0115`
  - Engine: Gott Temporal Prior
  - Diagnosis: Page has not had enough time to accumulate ranking signals. Some ranking underperformance may be due to age, not quality.

#### Implementation Plan

EXACT changes to implement. Every action includes reason, evidence, and expected improvements.

##### 1. Title Tag

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Plumbing Services in California | 24/7 Licensed Plumbers | Free Estimate
- **Reason:** Zero clicks despite impressions — title tag not compelling
- **Evidence:** `GSC: 204 impressions, 0 clicks, CTR=0.0000`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — CTR posterior mean is 0.4854%, improving title could increase CTR toward site median
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — title tag not crawled, current title unknown

---

##### 2. Meta Description

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Need a plumbing services in California? Licensed, insured plumbers available 24/7. Call now for a free estimate!
- **Reason:** Zero clicks — meta description not earning clicks at current position
- **Evidence:** `GSC: 204 impressions, 0 clicks, CTR=0.0000`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — improved meta description could increase CTR from 0.0000% toward site median
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — meta description not crawled

---

##### 3. H1

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Plumbing Services in California
- **Reason:** Ensure H1 matches primary search intent (city + service)
- **Evidence:** `Taxonomy: service=None, city=California`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — H1 not crawled, current value unknown

---

##### 4. Internal Links (Inbound)

- **Current:** in_degree=1, PageRank=0.000362
- **Recommended:** Add 3 internal links from related and high-authority pages
- **Reason:** Low internal link equity — page is underlinked (in_degree=1) with PageRank 0.000362
- **Evidence:** `Link Graph: is_orphan=False, in_degree=1, PageRank=0.000362`
- **Expected ranking improvement:** MODEL ESTIMATE — internal links pass PageRank and improve crawl discoverability. Expected improvement in position is UNKNOWN without historical calibration.
- **Expected CTR improvement:** UNKNOWN — depends on resulting position change
- **Expected call improvement:** UNKNOWN — depends on traffic increase and call CVR (unmeasured)
- **Expected revenue improvement:** UNKNOWN — depends on call increase and revenue per call (n=1)
- **Confidence:** MEDIUM — link equity deficit is evidence-backed; magnitude of improvement is uncalibrated

  **Links to add:**

  | Source Page | Target Page | Anchor Text | Placement |
  |-------------|-------------|-------------|-----------|
  | `/plumber/north-carolina/drain-cleaning` | `/plumber-california` | "Plumbing Services in California" | Within relevant content or footer service links |
  | `/plumber/north-carolina/pipe-burst-repai` | `/plumber-california` | "California plumbing services" | Within relevant content or footer service links |
  | `/plumber-rochester-whole-house-repiping` | `/plumber-california` | "expert plumbing services services in California" | Within relevant content or footer service links |

---

##### 5. Schema Markup

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add structured data: LocalBusiness, Service, FAQPage
- **Reason:** Structured data helps Google understand page content and can earn rich snippets
- **Evidence:** `Service template: Plumbing Services requires LocalBusiness, Service, FAQPage`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — rich snippets can improve CTR but magnitude is uncalibrated for this site
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — schema presence not verified by crawl

---

##### 6. FAQ Section

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add FAQ section with 5 questions and FAQPage schema
- **Reason:** FAQs target long-tail queries, earn FAQ rich results, and improve content depth
- **Evidence:** `Service template: Plumbing Services has 5 standard FAQs`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — FAQ rich results can improve CTR but magnitude is uncalibrated
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — FAQ presence not verified by crawl

  **FAQs to add:**

  - How much does a plumber cost?
  - Do you offer same-day plumbing service?
  - What plumbing services do you offer?
  - Are you licensed and insured?
  - Do you offer free estimates?

---

##### 7. Entity Coverage

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure these entities are mentioned in content: plumber, plumbing repair, plumbing service, plumbing inspection
- **Reason:** Entity-rich content improves topical authority and helps Google understand page relevance
- **Evidence:** `Service template: Plumbing Services requires entities: plumber, plumbing repair, plumbing service...`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — entity coverage not verified by crawl

  **Entities to include:**

  - plumber
  - plumbing repair
  - plumbing service
  - plumbing inspection

---

##### 8. Content Sections

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure all 7 standard content sections are present
- **Reason:** Complete content structure improves topical coverage and user experience
- **Evidence:** `Content template: 7 standard sections for Plumbing Services pages`
- **Expected ranking improvement:** MODEL ESTIMATE — content depth is a known ranking factor but magnitude is uncalibrated
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — current content not verified by crawl

  **Content sections to ensure:**

  - **Hero Section**
    - H1 with city + service keyword (e.g., "Emergency Plumber in California")
    - Click-to-call button (phone number prominent)
    - Trust badges (licensed, insured, years in business)
    - Service area mention
  - **Services Offered**
    - H2: Our Plumbing Services Services in California
    - List of specific services with brief descriptions
    - Internal links to related service pages
  - **Why Choose Us**
    - H2: Why Choose Our California Plumbers
    - Licensed and insured statement
    - Years of experience
    - Customer review highlights
    - Response time guarantee
  - **Service Area**
    - H2: Areas We Serve in California
    - List of neighborhoods or ZIP codes
    - Internal links to nearby city pages
  - **FAQ Section**
    - H2: Frequently Asked Questions
    - 5-8 FAQ items with structured data markup
    - FAQPage schema implementation
  - **Pricing Information**
    - H2: Plumbing Services Pricing in California
    - Starting prices or price ranges
    - Factors that affect cost
    - Free estimate call-to-action
  - **Contact & CTA**
    - H2: Call California's Trusted Plumbers Today
    - Phone number (click-to-call)
    - Contact form or booking link
    - Business hours
    - Service area reminder

---

##### 9. Trust / EEAT Section

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add 10 EEAT elements
- **Reason:** EEAT signals (license, insurance, reviews, experience) improve trust signals for local service pages
- **Evidence:** `EEAT template: 10 standard trust elements`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — EEAT elements not verified by crawl

  **EEAT elements to add:**

  - Add or verify business license number and state registration
  - Add plumber certification/badge (e.g., Master Plumber, Journeyman)
  - Include years in business (e.g., "Serving [City] since [Year]")
  - Add customer reviews/testimonials section (minimum 3 reviews)
  - Include service area map or list of ZIP codes served
  - Add response time guarantee (e.g., "60-minute response time")
  - Include insurance information (e.g., "Fully bonded and insured")
  - Add business hours including 24/7 emergency availability
  - Include pricing transparency (at least starting prices or ranges)
  - Add team photos or about-us section for personal trust

---

##### 10. CTA / Phone Placement

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add click-to-call button in hero section (above the fold), sticky header, and footer. Phone number should be visible without scrolling.
- **Reason:** Zero clicks from GSC — page may also have CTA issues
- **Evidence:** `GSC: 204 impressions, 0 clicks`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** MODEL ESTIMATE — prominent CTA can increase call conversion but magnitude is uncalibrated (call CVR unmeasured per-page)
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — current CTA placement not verified by crawl

---

##### 11. Canonical Tag

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure canonical tag points to: /plumber-california
- **Reason:** Prevent duplicate content issues from URL variations
- **Evidence:** `Best practice — canonical should match the page URL`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — canonical not verified by crawl

---

---

### 10. `/plumber-houston-emergency`

**Service:** Emergency Plumbing | **City:** Houston

#### Current Metrics

| Metric | Value | Source |
|--------|-------|--------|
| Impressions | 671 | GSC |
| Clicks | 0 | GSC |
| CTR | 0.0000% | GSC |
| Position | N/A | GSC |
| PageRank | 0.000671 | Link Graph |
| In-degree | 1 | Link Graph |
| Is Orphan | False | Link Graph |
| CTR Posterior Mean | 0.001486 | Bayesian |
| CTR CI | [0.000038, 0.005474] | Bayesian |
| Posterior N | 671 | Bayesian |
| Page Age | 1 days | Gott |
| Maturity Score | 0.0115 | Gott |

#### Forecast

| Field | Value | Classification |
|-------|-------|----------------|
| Expected Calls | 0.5285 | ESTIMATED |
| Calls CI | [0.0000, 3.0000] | ESTIMATED |
| Expected Revenue | $12.59 | ESTIMATED |
| Revenue CI | [$0.00, $94.46] | ESTIMATED |
| Confidence | 99.5%
| Confidence Basis | Bayesian posterior precision (uncalibrated against outcomes) | |

#### Business Value

| Field | Value |
|-------|-------|
| Expected Revenue (MC) | $12.59 |
| Lost Revenue (Opp Loss) | $47.23 |
| Total Revenue Opportunity | $59.82 |
| Lost Clicks | 33 |
| Lost Calls | 1 |
| Revenue Priority | 5/5 |
| Call Priority | 5/5 |
| Traffic Priority | 3/5 |
| Engineering Priority | 5/5 |
| Overall ROI | 84.5% |

#### Ranking Blockers (Root Cause Analysis)

Every blocker is backed by engine evidence. No generic SEO advice.

- **[HIGH] Zero clicks despite impressions**
  - Evidence: `GSC: 671 impressions, 0 clicks, CTR=0.0000`
  - Engine: GSC
  - Diagnosis: Title tag and meta description are not compelling enough to earn clicks at current position. SERP snippet is underperforming.
- **[MEDIUM] Very few internal links (in_degree=1)**
  - Evidence: `Link Graph: in_degree=1, PageRank=0.000671`
  - Engine: Link Graph
  - Diagnosis: Only 1 internal link points to this page. Adding more internal links from relevant, high-authority pages will improve crawl frequency and ranking signals.
- **[LOW] CTR posterior mean=0.001486 (CI width=0.005437)**
  - Evidence: `Bayesian Engine: Beta(1, 672), mean=0.001486, CI=[0.000038, 0.005474], n_obs=671`
  - Engine: Bayesian
  - Diagnosis: CTR is estimated at 0.1486% based on 671 impressions. Sufficient evidence for a stable estimate.
- **[LOW] Page is very young (age=1 days, maturity=0.012)**
  - Evidence: `Gott Engine: page_age_days=1, maturity_score=0.0115`
  - Engine: Gott Temporal Prior
  - Diagnosis: Page has not had enough time to accumulate ranking signals. Some ranking underperformance may be due to age, not quality.

#### Implementation Plan

EXACT changes to implement. Every action includes reason, evidence, and expected improvements.

##### 1. Title Tag

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Emergency Plumbing in Houston | 24/7 Licensed Plumbers | Free Estimate
- **Reason:** Zero clicks despite impressions — title tag not compelling
- **Evidence:** `GSC: 671 impressions, 0 clicks, CTR=0.0000`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — CTR posterior mean is 0.1486%, improving title could increase CTR toward site median
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — title tag not crawled, current title unknown

---

##### 2. Meta Description

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Need a emergency plumbing in Houston? Licensed, insured plumbers available 24/7. Call now for a free estimate!
- **Reason:** Zero clicks — meta description not earning clicks at current position
- **Evidence:** `GSC: 671 impressions, 0 clicks, CTR=0.0000`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — improved meta description could increase CTR from 0.0000% toward site median
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — meta description not crawled

---

##### 3. H1

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Emergency Plumbing in Houston
- **Reason:** Ensure H1 matches primary search intent (city + service)
- **Evidence:** `Taxonomy: service=emergency, city=Houston`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — H1 not crawled, current value unknown

---

##### 4. Internal Links (Inbound)

- **Current:** in_degree=1, PageRank=0.000671
- **Recommended:** Add 8 internal links from related and high-authority pages
- **Reason:** Low internal link equity — page is underlinked (in_degree=1) with PageRank 0.000671
- **Evidence:** `Link Graph: is_orphan=False, in_degree=1, PageRank=0.000671`
- **Expected ranking improvement:** MODEL ESTIMATE — internal links pass PageRank and improve crawl discoverability. Expected improvement in position is UNKNOWN without historical calibration.
- **Expected CTR improvement:** UNKNOWN — depends on resulting position change
- **Expected call improvement:** UNKNOWN — depends on traffic increase and call CVR (unmeasured)
- **Expected revenue improvement:** UNKNOWN — depends on call increase and revenue per call (n=1)
- **Confidence:** MEDIUM — link equity deficit is evidence-backed; magnitude of improvement is uncalibrated

  **Links to add:**

  | Source Page | Target Page | Anchor Text | Placement |
  |-------------|-------------|-------------|-----------|
  | `/plumber-san-diego-emergency` | `/plumber-houston-emergency` | "Emergency Plumbing in Houston" | Within services section (same service cluster) |
  | `/plumber-phoenix-emergency` | `/plumber-houston-emergency` | "Houston emergency plumbing" | Within services section (same service cluster) |
  | `/plumber-san-antonio-emergency` | `/plumber-houston-emergency` | "expert emergency plumbing services in Houston" | Within services section (same service cluster) |
  | `/plumber-san-jose-emergency` | `/plumber-houston-emergency` | "trusted Houston plumbers for emergency plumbing" | Within services section (same service cluster) |
  | `/plumber-sacramento-emergency` | `/plumber-houston-emergency` | "Emergency Plumbing in Houston" | Within services section (same service cluster) |
  | `/plumber/north-carolina/drain-cleaning` | `/plumber-houston-emergency` | "Emergency Plumbing in Houston" | Within relevant content or footer service links |
  | `/plumber/north-carolina/pipe-burst-repai` | `/plumber-houston-emergency` | "Houston emergency plumbing" | Within relevant content or footer service links |
  | `/plumber-rochester-whole-house-repiping` | `/plumber-houston-emergency` | "expert emergency plumbing services in Houston" | Within relevant content or footer service links |

---

##### 5. Internal Links (Outbound)

- **Current:** UNKNOWN — not crawled
- **Recommended:** Add 5 outbound internal links to related service pages
- **Reason:** Linking to related service pages strengthens topical cluster and improves site navigation
- **Evidence:** `Taxonomy: 10 related pages in same cluster`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW

  **Links to add:**

  | Source Page | Target Page | Anchor Text | Placement |
  |-------------|-------------|-------------|-----------|
  | `/plumber-houston-emergency` | `/plumber-san-diego-emergency` | "Emergency Plumbing in San Diego" | Within services section or related services area |
  | `/plumber-houston-emergency` | `/plumber-phoenix-emergency` | "Emergency Plumbing in Phoenix" | Within services section or related services area |
  | `/plumber-houston-emergency` | `/plumber-san-antonio-emergency` | "Emergency Plumbing in San Antonio" | Within services section or related services area |
  | `/plumber-houston-emergency` | `/plumber-san-jose-emergency` | "Emergency Plumbing in San Jose" | Within services section or related services area |
  | `/plumber-houston-emergency` | `/plumber-sacramento-emergency` | "Emergency Plumbing in Sacramento" | Within services section or related services area |

---

##### 6. Schema Markup

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add structured data: LocalBusiness, Service, FAQPage, EmergencyService
- **Reason:** Structured data helps Google understand page content and can earn rich snippets
- **Evidence:** `Service template: Emergency Plumbing requires LocalBusiness, Service, FAQPage, EmergencyService`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — rich snippets can improve CTR but magnitude is uncalibrated for this site
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — schema presence not verified by crawl

---

##### 7. FAQ Section

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add FAQ section with 5 questions and FAQPage schema
- **Reason:** FAQs target long-tail queries, earn FAQ rich results, and improve content depth
- **Evidence:** `Service template: Emergency Plumbing has 5 standard FAQs`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — FAQ rich results can improve CTR but magnitude is uncalibrated
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — FAQ presence not verified by crawl

  **FAQs to add:**

  - How quickly can an emergency plumber arrive?
  - What counts as a plumbing emergency?
  - Do you offer 24/7 emergency plumbing service?
  - How much does emergency plumbing cost?
  - What should I do while waiting for the plumber?

---

##### 8. Entity Coverage

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure these entities are mentioned in content: emergency plumber, 24/7 plumbing service, urgent plumbing repair, burst pipe, flooding
- **Reason:** Entity-rich content improves topical authority and helps Google understand page relevance
- **Evidence:** `Service template: Emergency Plumbing requires entities: emergency plumber, 24/7 plumbing service, urgent plumbing repair...`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — entity coverage not verified by crawl

  **Entities to include:**

  - emergency plumber
  - 24/7 plumbing service
  - urgent plumbing repair
  - burst pipe
  - flooding

---

##### 9. Content Sections

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure all 7 standard content sections are present
- **Reason:** Complete content structure improves topical coverage and user experience
- **Evidence:** `Content template: 7 standard sections for Emergency Plumbing pages`
- **Expected ranking improvement:** MODEL ESTIMATE — content depth is a known ranking factor but magnitude is uncalibrated
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — current content not verified by crawl

  **Content sections to ensure:**

  - **Hero Section**
    - H1 with city + service keyword (e.g., "Emergency Plumber in Houston")
    - Click-to-call button (phone number prominent)
    - Trust badges (licensed, insured, years in business)
    - Service area mention
  - **Services Offered**
    - H2: Our Emergency Plumbing Services in Houston
    - List of specific services with brief descriptions
    - Internal links to related service pages
  - **Why Choose Us**
    - H2: Why Choose Our Houston Plumbers
    - Licensed and insured statement
    - Years of experience
    - Customer review highlights
    - Response time guarantee
  - **Service Area**
    - H2: Areas We Serve in Houston
    - List of neighborhoods or ZIP codes
    - Internal links to nearby city pages
  - **FAQ Section**
    - H2: Frequently Asked Questions
    - 5-8 FAQ items with structured data markup
    - FAQPage schema implementation
  - **Pricing Information**
    - H2: Emergency Plumbing Pricing in Houston
    - Starting prices or price ranges
    - Factors that affect cost
    - Free estimate call-to-action
  - **Contact & CTA**
    - H2: Call Houston's Trusted Plumbers Today
    - Phone number (click-to-call)
    - Contact form or booking link
    - Business hours
    - Service area reminder

---

##### 10. Trust / EEAT Section

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add 10 EEAT elements
- **Reason:** EEAT signals (license, insurance, reviews, experience) improve trust signals for local service pages
- **Evidence:** `EEAT template: 10 standard trust elements`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — EEAT elements not verified by crawl

  **EEAT elements to add:**

  - Add or verify business license number and state registration
  - Add plumber certification/badge (e.g., Master Plumber, Journeyman)
  - Include years in business (e.g., "Serving [City] since [Year]")
  - Add customer reviews/testimonials section (minimum 3 reviews)
  - Include service area map or list of ZIP codes served
  - Add response time guarantee (e.g., "60-minute response time")
  - Include insurance information (e.g., "Fully bonded and insured")
  - Add business hours including 24/7 emergency availability
  - Include pricing transparency (at least starting prices or ranges)
  - Add team photos or about-us section for personal trust

---

##### 11. CTA / Phone Placement

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add click-to-call button in hero section (above the fold), sticky header, and footer. Phone number should be visible without scrolling.
- **Reason:** Zero clicks from GSC — page may also have CTA issues
- **Evidence:** `GSC: 671 impressions, 0 clicks`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** MODEL ESTIMATE — prominent CTA can increase call conversion but magnitude is uncalibrated (call CVR unmeasured per-page)
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — current CTA placement not verified by crawl

---

##### 12. Canonical Tag

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure canonical tag points to: /plumber-houston-emergency
- **Reason:** Prevent duplicate content issues from URL variations
- **Evidence:** `Best practice — canonical should match the page URL`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — canonical not verified by crawl

---

---

### 11. `/plumber-indiana`

**Service:** Plumbing Services | **City:** Indiana

#### Current Metrics

| Metric | Value | Source |
|--------|-------|--------|
| Impressions | 227 | GSC |
| Clicks | 0 | GSC |
| CTR | 0.0000% | GSC |
| Position | N/A | GSC |
| PageRank | 0.000362 | Link Graph |
| In-degree | 1 | Link Graph |
| Is Orphan | False | Link Graph |
| CTR Posterior Mean | 0.004367 | Bayesian |
| CTR CI | [0.000111, 0.016049] | Bayesian |
| Posterior N | 227 | Bayesian |
| Page Age | 1 days | Gott |
| Maturity Score | 0.0115 | Gott |

#### Forecast

| Field | Value | Classification |
|-------|-------|----------------|
| Expected Calls | 0.4995 | ESTIMATED |
| Calls CI | [0.0000, 3.0000] | ESTIMATED |
| Expected Revenue | $11.71 | ESTIMATED |
| Revenue CI | [$0.00, $94.46] | ESTIMATED |
| Confidence | 98.4%
| Confidence Basis | Bayesian posterior precision (uncalibrated against outcomes) | |

#### Business Value

| Field | Value |
|-------|-------|
| Revenue Priority | 5/5 |
| Call Priority | 5/5 |
| Traffic Priority | 4/5 |
| Engineering Priority | 5/5 |
| Overall ROI | 84.3% |

#### Ranking Blockers (Root Cause Analysis)

Every blocker is backed by engine evidence. No generic SEO advice.

- **[HIGH] Zero clicks despite impressions**
  - Evidence: `GSC: 227 impressions, 0 clicks, CTR=0.0000`
  - Engine: GSC
  - Diagnosis: Title tag and meta description are not compelling enough to earn clicks at current position. SERP snippet is underperforming.
- **[MEDIUM] Very few internal links (in_degree=1)**
  - Evidence: `Link Graph: in_degree=1, PageRank=0.000362`
  - Engine: Link Graph
  - Diagnosis: Only 1 internal link points to this page. Adding more internal links from relevant, high-authority pages will improve crawl frequency and ranking signals.
- **[MEDIUM] PageRank 0.000362 below site median (0.000670)**
  - Evidence: `Link Graph: PageRank=0.000362, site median=0.000670`
  - Engine: Link Graph
  - Diagnosis: Internal link equity flowing to this page is below the site median. More internal links from high-authority pages needed.
- **[LOW] CTR posterior mean=0.004367 (CI width=0.015938)**
  - Evidence: `Bayesian Engine: Beta(1, 228), mean=0.004367, CI=[0.000111, 0.016049], n_obs=227`
  - Engine: Bayesian
  - Diagnosis: CTR is estimated at 0.4367% based on 227 impressions. Sufficient evidence for a stable estimate.
- **[LOW] Page is very young (age=1 days, maturity=0.012)**
  - Evidence: `Gott Engine: page_age_days=1, maturity_score=0.0115`
  - Engine: Gott Temporal Prior
  - Diagnosis: Page has not had enough time to accumulate ranking signals. Some ranking underperformance may be due to age, not quality.

#### Implementation Plan

EXACT changes to implement. Every action includes reason, evidence, and expected improvements.

##### 1. Title Tag

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Plumbing Services in Indiana | 24/7 Licensed Plumbers | Free Estimate
- **Reason:** Zero clicks despite impressions — title tag not compelling
- **Evidence:** `GSC: 227 impressions, 0 clicks, CTR=0.0000`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — CTR posterior mean is 0.4367%, improving title could increase CTR toward site median
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — title tag not crawled, current title unknown

---

##### 2. Meta Description

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Need a plumbing services in Indiana? Licensed, insured plumbers available 24/7. Call now for a free estimate!
- **Reason:** Zero clicks — meta description not earning clicks at current position
- **Evidence:** `GSC: 227 impressions, 0 clicks, CTR=0.0000`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — improved meta description could increase CTR from 0.0000% toward site median
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — meta description not crawled

---

##### 3. H1

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Plumbing Services in Indiana
- **Reason:** Ensure H1 matches primary search intent (city + service)
- **Evidence:** `Taxonomy: service=None, city=Indiana`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — H1 not crawled, current value unknown

---

##### 4. Internal Links (Inbound)

- **Current:** in_degree=1, PageRank=0.000362
- **Recommended:** Add 3 internal links from related and high-authority pages
- **Reason:** Low internal link equity — page is underlinked (in_degree=1) with PageRank 0.000362
- **Evidence:** `Link Graph: is_orphan=False, in_degree=1, PageRank=0.000362`
- **Expected ranking improvement:** MODEL ESTIMATE — internal links pass PageRank and improve crawl discoverability. Expected improvement in position is UNKNOWN without historical calibration.
- **Expected CTR improvement:** UNKNOWN — depends on resulting position change
- **Expected call improvement:** UNKNOWN — depends on traffic increase and call CVR (unmeasured)
- **Expected revenue improvement:** UNKNOWN — depends on call increase and revenue per call (n=1)
- **Confidence:** MEDIUM — link equity deficit is evidence-backed; magnitude of improvement is uncalibrated

  **Links to add:**

  | Source Page | Target Page | Anchor Text | Placement |
  |-------------|-------------|-------------|-----------|
  | `/plumber/north-carolina/drain-cleaning` | `/plumber-indiana` | "Plumbing Services in Indiana" | Within relevant content or footer service links |
  | `/plumber/north-carolina/pipe-burst-repai` | `/plumber-indiana` | "Indiana plumbing services" | Within relevant content or footer service links |
  | `/plumber-rochester-whole-house-repiping` | `/plumber-indiana` | "expert plumbing services services in Indiana" | Within relevant content or footer service links |

---

##### 5. Schema Markup

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add structured data: LocalBusiness, Service, FAQPage
- **Reason:** Structured data helps Google understand page content and can earn rich snippets
- **Evidence:** `Service template: Plumbing Services requires LocalBusiness, Service, FAQPage`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — rich snippets can improve CTR but magnitude is uncalibrated for this site
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — schema presence not verified by crawl

---

##### 6. FAQ Section

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add FAQ section with 5 questions and FAQPage schema
- **Reason:** FAQs target long-tail queries, earn FAQ rich results, and improve content depth
- **Evidence:** `Service template: Plumbing Services has 5 standard FAQs`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — FAQ rich results can improve CTR but magnitude is uncalibrated
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — FAQ presence not verified by crawl

  **FAQs to add:**

  - How much does a plumber cost?
  - Do you offer same-day plumbing service?
  - What plumbing services do you offer?
  - Are you licensed and insured?
  - Do you offer free estimates?

---

##### 7. Entity Coverage

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure these entities are mentioned in content: plumber, plumbing repair, plumbing service, plumbing inspection
- **Reason:** Entity-rich content improves topical authority and helps Google understand page relevance
- **Evidence:** `Service template: Plumbing Services requires entities: plumber, plumbing repair, plumbing service...`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — entity coverage not verified by crawl

  **Entities to include:**

  - plumber
  - plumbing repair
  - plumbing service
  - plumbing inspection

---

##### 8. Content Sections

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure all 7 standard content sections are present
- **Reason:** Complete content structure improves topical coverage and user experience
- **Evidence:** `Content template: 7 standard sections for Plumbing Services pages`
- **Expected ranking improvement:** MODEL ESTIMATE — content depth is a known ranking factor but magnitude is uncalibrated
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — current content not verified by crawl

  **Content sections to ensure:**

  - **Hero Section**
    - H1 with city + service keyword (e.g., "Emergency Plumber in Indiana")
    - Click-to-call button (phone number prominent)
    - Trust badges (licensed, insured, years in business)
    - Service area mention
  - **Services Offered**
    - H2: Our Plumbing Services Services in Indiana
    - List of specific services with brief descriptions
    - Internal links to related service pages
  - **Why Choose Us**
    - H2: Why Choose Our Indiana Plumbers
    - Licensed and insured statement
    - Years of experience
    - Customer review highlights
    - Response time guarantee
  - **Service Area**
    - H2: Areas We Serve in Indiana
    - List of neighborhoods or ZIP codes
    - Internal links to nearby city pages
  - **FAQ Section**
    - H2: Frequently Asked Questions
    - 5-8 FAQ items with structured data markup
    - FAQPage schema implementation
  - **Pricing Information**
    - H2: Plumbing Services Pricing in Indiana
    - Starting prices or price ranges
    - Factors that affect cost
    - Free estimate call-to-action
  - **Contact & CTA**
    - H2: Call Indiana's Trusted Plumbers Today
    - Phone number (click-to-call)
    - Contact form or booking link
    - Business hours
    - Service area reminder

---

##### 9. Trust / EEAT Section

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add 10 EEAT elements
- **Reason:** EEAT signals (license, insurance, reviews, experience) improve trust signals for local service pages
- **Evidence:** `EEAT template: 10 standard trust elements`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — EEAT elements not verified by crawl

  **EEAT elements to add:**

  - Add or verify business license number and state registration
  - Add plumber certification/badge (e.g., Master Plumber, Journeyman)
  - Include years in business (e.g., "Serving [City] since [Year]")
  - Add customer reviews/testimonials section (minimum 3 reviews)
  - Include service area map or list of ZIP codes served
  - Add response time guarantee (e.g., "60-minute response time")
  - Include insurance information (e.g., "Fully bonded and insured")
  - Add business hours including 24/7 emergency availability
  - Include pricing transparency (at least starting prices or ranges)
  - Add team photos or about-us section for personal trust

---

##### 10. CTA / Phone Placement

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add click-to-call button in hero section (above the fold), sticky header, and footer. Phone number should be visible without scrolling.
- **Reason:** Zero clicks from GSC — page may also have CTA issues
- **Evidence:** `GSC: 227 impressions, 0 clicks`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** MODEL ESTIMATE — prominent CTA can increase call conversion but magnitude is uncalibrated (call CVR unmeasured per-page)
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — current CTA placement not verified by crawl

---

##### 11. Canonical Tag

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure canonical tag points to: /plumber-indiana
- **Reason:** Prevent duplicate content issues from URL variations
- **Evidence:** `Best practice — canonical should match the page URL`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — canonical not verified by crawl

---

---

### 12. `/plumber-austin-emergency`

**Service:** Emergency Plumbing | **City:** Austin

#### Current Metrics

| Metric | Value | Source |
|--------|-------|--------|
| Impressions | 847 | GSC |
| Clicks | 0 | GSC |
| CTR | 0.0000% | GSC |
| Position | N/A | GSC |
| PageRank | 0.000671 | Link Graph |
| In-degree | 1 | Link Graph |
| Is Orphan | False | Link Graph |
| CTR Posterior Mean | 0.001178 | Bayesian |
| CTR CI | [0.000030, 0.004341] | Bayesian |
| Posterior N | 847 | Bayesian |
| Page Age | 1 days | Gott |
| Maturity Score | 0.0115 | Gott |

#### Forecast

| Field | Value | Classification |
|-------|-------|----------------|
| Expected Calls | 0.5245 | ESTIMATED |
| Calls CI | [0.0000, 3.0000] | ESTIMATED |
| Expected Revenue | $12.59 | ESTIMATED |
| Revenue CI | [$0.00, $94.46] | ESTIMATED |
| Confidence | 99.6%
| Confidence Basis | Bayesian posterior precision (uncalibrated against outcomes) | |

#### Business Value

| Field | Value |
|-------|-------|
| Expected Revenue (MC) | $12.59 |
| Lost Revenue (Opp Loss) | $94.46 |
| Total Revenue Opportunity | $107.05 |
| Lost Clicks | 42 |
| Lost Calls | 2 |
| Revenue Priority | 5/5 |
| Call Priority | 5/5 |
| Traffic Priority | 3/5 |
| Engineering Priority | 5/5 |
| Overall ROI | 84.3% |

#### Ranking Blockers (Root Cause Analysis)

Every blocker is backed by engine evidence. No generic SEO advice.

- **[HIGH] Zero clicks despite impressions**
  - Evidence: `GSC: 847 impressions, 0 clicks, CTR=0.0000`
  - Engine: GSC
  - Diagnosis: Title tag and meta description are not compelling enough to earn clicks at current position. SERP snippet is underperforming.
- **[MEDIUM] Very few internal links (in_degree=1)**
  - Evidence: `Link Graph: in_degree=1, PageRank=0.000671`
  - Engine: Link Graph
  - Diagnosis: Only 1 internal link points to this page. Adding more internal links from relevant, high-authority pages will improve crawl frequency and ranking signals.
- **[LOW] CTR posterior mean=0.001178 (CI width=0.004311)**
  - Evidence: `Bayesian Engine: Beta(1, 848), mean=0.001178, CI=[0.000030, 0.004341], n_obs=847`
  - Engine: Bayesian
  - Diagnosis: CTR is estimated at 0.1178% based on 847 impressions. Sufficient evidence for a stable estimate.
- **[LOW] Page is very young (age=1 days, maturity=0.012)**
  - Evidence: `Gott Engine: page_age_days=1, maturity_score=0.0115`
  - Engine: Gott Temporal Prior
  - Diagnosis: Page has not had enough time to accumulate ranking signals. Some ranking underperformance may be due to age, not quality.

#### Implementation Plan

EXACT changes to implement. Every action includes reason, evidence, and expected improvements.

##### 1. Title Tag

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Emergency Plumbing in Austin | 24/7 Licensed Plumbers | Free Estimate
- **Reason:** Zero clicks despite impressions — title tag not compelling
- **Evidence:** `GSC: 847 impressions, 0 clicks, CTR=0.0000`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — CTR posterior mean is 0.1178%, improving title could increase CTR toward site median
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — title tag not crawled, current title unknown

---

##### 2. Meta Description

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Need a emergency plumbing in Austin? Licensed, insured plumbers available 24/7. Call now for a free estimate!
- **Reason:** Zero clicks — meta description not earning clicks at current position
- **Evidence:** `GSC: 847 impressions, 0 clicks, CTR=0.0000`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — improved meta description could increase CTR from 0.0000% toward site median
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — meta description not crawled

---

##### 3. H1

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Emergency Plumbing in Austin
- **Reason:** Ensure H1 matches primary search intent (city + service)
- **Evidence:** `Taxonomy: service=emergency, city=Austin`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — H1 not crawled, current value unknown

---

##### 4. Internal Links (Inbound)

- **Current:** in_degree=1, PageRank=0.000671
- **Recommended:** Add 8 internal links from related and high-authority pages
- **Reason:** Low internal link equity — page is underlinked (in_degree=1) with PageRank 0.000671
- **Evidence:** `Link Graph: is_orphan=False, in_degree=1, PageRank=0.000671`
- **Expected ranking improvement:** MODEL ESTIMATE — internal links pass PageRank and improve crawl discoverability. Expected improvement in position is UNKNOWN without historical calibration.
- **Expected CTR improvement:** UNKNOWN — depends on resulting position change
- **Expected call improvement:** UNKNOWN — depends on traffic increase and call CVR (unmeasured)
- **Expected revenue improvement:** UNKNOWN — depends on call increase and revenue per call (n=1)
- **Confidence:** MEDIUM — link equity deficit is evidence-backed; magnitude of improvement is uncalibrated

  **Links to add:**

  | Source Page | Target Page | Anchor Text | Placement |
  |-------------|-------------|-------------|-----------|
  | `/plumber-san-diego-emergency` | `/plumber-austin-emergency` | "Emergency Plumbing in Austin" | Within services section (same service cluster) |
  | `/plumber-phoenix-emergency` | `/plumber-austin-emergency` | "Austin emergency plumbing" | Within services section (same service cluster) |
  | `/plumber-san-antonio-emergency` | `/plumber-austin-emergency` | "expert emergency plumbing services in Austin" | Within services section (same service cluster) |
  | `/plumber-san-jose-emergency` | `/plumber-austin-emergency` | "trusted Austin plumbers for emergency plumbing" | Within services section (same service cluster) |
  | `/plumber-sacramento-emergency` | `/plumber-austin-emergency` | "Emergency Plumbing in Austin" | Within services section (same service cluster) |
  | `/plumber/north-carolina/drain-cleaning` | `/plumber-austin-emergency` | "Emergency Plumbing in Austin" | Within relevant content or footer service links |
  | `/plumber/north-carolina/pipe-burst-repai` | `/plumber-austin-emergency` | "Austin emergency plumbing" | Within relevant content or footer service links |
  | `/plumber-rochester-whole-house-repiping` | `/plumber-austin-emergency` | "expert emergency plumbing services in Austin" | Within relevant content or footer service links |

---

##### 5. Internal Links (Outbound)

- **Current:** UNKNOWN — not crawled
- **Recommended:** Add 5 outbound internal links to related service pages
- **Reason:** Linking to related service pages strengthens topical cluster and improves site navigation
- **Evidence:** `Taxonomy: 10 related pages in same cluster`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW

  **Links to add:**

  | Source Page | Target Page | Anchor Text | Placement |
  |-------------|-------------|-------------|-----------|
  | `/plumber-austin-emergency` | `/plumber-san-diego-emergency` | "Emergency Plumbing in San Diego" | Within services section or related services area |
  | `/plumber-austin-emergency` | `/plumber-phoenix-emergency` | "Emergency Plumbing in Phoenix" | Within services section or related services area |
  | `/plumber-austin-emergency` | `/plumber-san-antonio-emergency` | "Emergency Plumbing in San Antonio" | Within services section or related services area |
  | `/plumber-austin-emergency` | `/plumber-san-jose-emergency` | "Emergency Plumbing in San Jose" | Within services section or related services area |
  | `/plumber-austin-emergency` | `/plumber-sacramento-emergency` | "Emergency Plumbing in Sacramento" | Within services section or related services area |

---

##### 6. Schema Markup

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add structured data: LocalBusiness, Service, FAQPage, EmergencyService
- **Reason:** Structured data helps Google understand page content and can earn rich snippets
- **Evidence:** `Service template: Emergency Plumbing requires LocalBusiness, Service, FAQPage, EmergencyService`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — rich snippets can improve CTR but magnitude is uncalibrated for this site
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — schema presence not verified by crawl

---

##### 7. FAQ Section

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add FAQ section with 5 questions and FAQPage schema
- **Reason:** FAQs target long-tail queries, earn FAQ rich results, and improve content depth
- **Evidence:** `Service template: Emergency Plumbing has 5 standard FAQs`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — FAQ rich results can improve CTR but magnitude is uncalibrated
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — FAQ presence not verified by crawl

  **FAQs to add:**

  - How quickly can an emergency plumber arrive?
  - What counts as a plumbing emergency?
  - Do you offer 24/7 emergency plumbing service?
  - How much does emergency plumbing cost?
  - What should I do while waiting for the plumber?

---

##### 8. Entity Coverage

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure these entities are mentioned in content: emergency plumber, 24/7 plumbing service, urgent plumbing repair, burst pipe, flooding
- **Reason:** Entity-rich content improves topical authority and helps Google understand page relevance
- **Evidence:** `Service template: Emergency Plumbing requires entities: emergency plumber, 24/7 plumbing service, urgent plumbing repair...`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — entity coverage not verified by crawl

  **Entities to include:**

  - emergency plumber
  - 24/7 plumbing service
  - urgent plumbing repair
  - burst pipe
  - flooding

---

##### 9. Content Sections

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure all 7 standard content sections are present
- **Reason:** Complete content structure improves topical coverage and user experience
- **Evidence:** `Content template: 7 standard sections for Emergency Plumbing pages`
- **Expected ranking improvement:** MODEL ESTIMATE — content depth is a known ranking factor but magnitude is uncalibrated
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — current content not verified by crawl

  **Content sections to ensure:**

  - **Hero Section**
    - H1 with city + service keyword (e.g., "Emergency Plumber in Austin")
    - Click-to-call button (phone number prominent)
    - Trust badges (licensed, insured, years in business)
    - Service area mention
  - **Services Offered**
    - H2: Our Emergency Plumbing Services in Austin
    - List of specific services with brief descriptions
    - Internal links to related service pages
  - **Why Choose Us**
    - H2: Why Choose Our Austin Plumbers
    - Licensed and insured statement
    - Years of experience
    - Customer review highlights
    - Response time guarantee
  - **Service Area**
    - H2: Areas We Serve in Austin
    - List of neighborhoods or ZIP codes
    - Internal links to nearby city pages
  - **FAQ Section**
    - H2: Frequently Asked Questions
    - 5-8 FAQ items with structured data markup
    - FAQPage schema implementation
  - **Pricing Information**
    - H2: Emergency Plumbing Pricing in Austin
    - Starting prices or price ranges
    - Factors that affect cost
    - Free estimate call-to-action
  - **Contact & CTA**
    - H2: Call Austin's Trusted Plumbers Today
    - Phone number (click-to-call)
    - Contact form or booking link
    - Business hours
    - Service area reminder

---

##### 10. Trust / EEAT Section

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add 10 EEAT elements
- **Reason:** EEAT signals (license, insurance, reviews, experience) improve trust signals for local service pages
- **Evidence:** `EEAT template: 10 standard trust elements`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — EEAT elements not verified by crawl

  **EEAT elements to add:**

  - Add or verify business license number and state registration
  - Add plumber certification/badge (e.g., Master Plumber, Journeyman)
  - Include years in business (e.g., "Serving [City] since [Year]")
  - Add customer reviews/testimonials section (minimum 3 reviews)
  - Include service area map or list of ZIP codes served
  - Add response time guarantee (e.g., "60-minute response time")
  - Include insurance information (e.g., "Fully bonded and insured")
  - Add business hours including 24/7 emergency availability
  - Include pricing transparency (at least starting prices or ranges)
  - Add team photos or about-us section for personal trust

---

##### 11. CTA / Phone Placement

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add click-to-call button in hero section (above the fold), sticky header, and footer. Phone number should be visible without scrolling.
- **Reason:** Zero clicks from GSC — page may also have CTA issues
- **Evidence:** `GSC: 847 impressions, 0 clicks`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** MODEL ESTIMATE — prominent CTA can increase call conversion but magnitude is uncalibrated (call CVR unmeasured per-page)
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — current CTA placement not verified by crawl

---

##### 12. Canonical Tag

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure canonical tag points to: /plumber-austin-emergency
- **Reason:** Prevent duplicate content issues from URL variations
- **Evidence:** `Best practice — canonical should match the page URL`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — canonical not verified by crawl

---

---

### 13. `/plumber-charlotte-leak-repair`

**Service:** Leak Repair | **City:** Charlotte Leak

#### Current Metrics

| Metric | Value | Source |
|--------|-------|--------|
| Impressions | 135 | GSC |
| Clicks | 0 | GSC |
| CTR | 0.0000% | GSC |
| Position | N/A | GSC |
| PageRank | 0.000670 | Link Graph |
| In-degree | 1 | Link Graph |
| Is Orphan | False | Link Graph |
| CTR Posterior Mean | 0.007299 | Bayesian |
| CTR CI | [0.000186, 0.026760] | Bayesian |
| Posterior N | 135 | Bayesian |
| Page Age | 1 days | Gott |
| Maturity Score | 0.0115 | Gott |

#### Forecast

| Field | Value | Classification |
|-------|-------|----------------|
| Expected Calls | 0.5185 | ESTIMATED |
| Calls CI | [0.0000, 3.0000] | ESTIMATED |
| Expected Revenue | $12.75 | ESTIMATED |
| Revenue CI | [$0.00, $94.46] | ESTIMATED |
| Confidence | 97.3%
| Confidence Basis | Bayesian posterior precision (uncalibrated against outcomes) | |

#### Business Value

| Field | Value |
|-------|-------|
| Revenue Priority | 5/5 |
| Call Priority | 5/5 |
| Traffic Priority | 3/5 |
| Engineering Priority | 5/5 |
| Overall ROI | 84.2% |

#### Ranking Blockers (Root Cause Analysis)

Every blocker is backed by engine evidence. No generic SEO advice.

- **[HIGH] Zero clicks despite impressions**
  - Evidence: `GSC: 135 impressions, 0 clicks, CTR=0.0000`
  - Engine: GSC
  - Diagnosis: Title tag and meta description are not compelling enough to earn clicks at current position. SERP snippet is underperforming.
- **[MEDIUM] Very few internal links (in_degree=1)**
  - Evidence: `Link Graph: in_degree=1, PageRank=0.000670`
  - Engine: Link Graph
  - Diagnosis: Only 1 internal link points to this page. Adding more internal links from relevant, high-authority pages will improve crawl frequency and ranking signals.
- **[LOW] CTR posterior mean=0.007299 (CI width=0.026573)**
  - Evidence: `Bayesian Engine: Beta(1, 136), mean=0.007299, CI=[0.000186, 0.026760], n_obs=135`
  - Engine: Bayesian
  - Diagnosis: CTR is estimated at 0.7299% based on 135 impressions. Sufficient evidence for a stable estimate.
- **[LOW] Page is very young (age=1 days, maturity=0.012)**
  - Evidence: `Gott Engine: page_age_days=1, maturity_score=0.0115`
  - Engine: Gott Temporal Prior
  - Diagnosis: Page has not had enough time to accumulate ranking signals. Some ranking underperformance may be due to age, not quality.

#### Implementation Plan

EXACT changes to implement. Every action includes reason, evidence, and expected improvements.

##### 1. Title Tag

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Leak Repair in Charlotte Leak | 24/7 Licensed Plumbers | Free Estimate
- **Reason:** Zero clicks despite impressions — title tag not compelling
- **Evidence:** `GSC: 135 impressions, 0 clicks, CTR=0.0000`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — CTR posterior mean is 0.7299%, improving title could increase CTR toward site median
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — title tag not crawled, current title unknown

---

##### 2. Meta Description

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Need a leak repair in Charlotte Leak? Licensed, insured plumbers available 24/7. Call now for a free estimate!
- **Reason:** Zero clicks — meta description not earning clicks at current position
- **Evidence:** `GSC: 135 impressions, 0 clicks, CTR=0.0000`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — improved meta description could increase CTR from 0.0000% toward site median
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — meta description not crawled

---

##### 3. H1

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Leak Repair in Charlotte Leak
- **Reason:** Ensure H1 matches primary search intent (city + service)
- **Evidence:** `Taxonomy: service=repair, city=Charlotte Leak`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — H1 not crawled, current value unknown

---

##### 4. Internal Links (Inbound)

- **Current:** in_degree=1, PageRank=0.000670
- **Recommended:** Add 8 internal links from related and high-authority pages
- **Reason:** Low internal link equity — page is underlinked (in_degree=1) with PageRank 0.000670
- **Evidence:** `Link Graph: is_orphan=False, in_degree=1, PageRank=0.000670`
- **Expected ranking improvement:** MODEL ESTIMATE — internal links pass PageRank and improve crawl discoverability. Expected improvement in position is UNKNOWN without historical calibration.
- **Expected CTR improvement:** UNKNOWN — depends on resulting position change
- **Expected call improvement:** UNKNOWN — depends on traffic increase and call CVR (unmeasured)
- **Expected revenue improvement:** UNKNOWN — depends on call increase and revenue per call (n=1)
- **Confidence:** MEDIUM — link equity deficit is evidence-backed; magnitude of improvement is uncalibrated

  **Links to add:**

  | Source Page | Target Page | Anchor Text | Placement |
  |-------------|-------------|-------------|-----------|
  | `/plumber-minneapolis-water-heater-repair` | `/plumber-charlotte-leak-repair` | "Leak Repair in Charlotte Leak" | Within services section (same service cluster) |
  | `/plumber-new-orleans-water-heater-repair` | `/plumber-charlotte-leak-repair` | "Charlotte Leak leak repair" | Within services section (same service cluster) |
  | `/plumber-cleveland-water-heater-repair` | `/plumber-charlotte-leak-repair` | "expert leak repair services in Charlotte Leak" | Within services section (same service cluster) |
  | `/plumber-seattle-leak-repair` | `/plumber-charlotte-leak-repair` | "trusted Charlotte Leak plumbers for leak repair" | Within services section (same service cluster) |
  | `/plumber-st.-louis-water-heater-repair` | `/plumber-charlotte-leak-repair` | "Leak Repair in Charlotte Leak" | Within services section (same service cluster) |
  | `/plumber/north-carolina/drain-cleaning` | `/plumber-charlotte-leak-repair` | "Leak Repair in Charlotte Leak" | Within relevant content or footer service links |
  | `/plumber/north-carolina/pipe-burst-repai` | `/plumber-charlotte-leak-repair` | "Charlotte Leak leak repair" | Within relevant content or footer service links |
  | `/plumber-rochester-whole-house-repiping` | `/plumber-charlotte-leak-repair` | "expert leak repair services in Charlotte Leak" | Within relevant content or footer service links |

---

##### 5. Internal Links (Outbound)

- **Current:** UNKNOWN — not crawled
- **Recommended:** Add 5 outbound internal links to related service pages
- **Reason:** Linking to related service pages strengthens topical cluster and improves site navigation
- **Evidence:** `Taxonomy: 10 related pages in same cluster`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW

  **Links to add:**

  | Source Page | Target Page | Anchor Text | Placement |
  |-------------|-------------|-------------|-----------|
  | `/plumber-charlotte-leak-repair` | `/plumber-minneapolis-water-heater-repair` | "Water Heater Repair in Minneapolis Water Heater" | Within services section or related services area |
  | `/plumber-charlotte-leak-repair` | `/plumber-new-orleans-water-heater-repair` | "Water Heater Repair in New Orleans Water Heater" | Within services section or related services area |
  | `/plumber-charlotte-leak-repair` | `/plumber-cleveland-water-heater-repair` | "Water Heater Repair in Cleveland Water Heater" | Within services section or related services area |
  | `/plumber-charlotte-leak-repair` | `/plumber-seattle-leak-repair` | "Leak Repair in Seattle Leak" | Within services section or related services area |
  | `/plumber-charlotte-leak-repair` | `/plumber-st.-louis-water-heater-repair` | "Water Heater Repair in St. Louis Water Heater" | Within services section or related services area |

---

##### 6. Schema Markup

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add structured data: LocalBusiness, Service, FAQPage, Offer
- **Reason:** Structured data helps Google understand page content and can earn rich snippets
- **Evidence:** `Service template: Leak Repair requires LocalBusiness, Service, FAQPage, Offer`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — rich snippets can improve CTR but magnitude is uncalibrated for this site
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — schema presence not verified by crawl

---

##### 7. FAQ Section

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add FAQ section with 5 questions and FAQPage schema
- **Reason:** FAQs target long-tail queries, earn FAQ rich results, and improve content depth
- **Evidence:** `Service template: Leak Repair has 5 standard FAQs`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — FAQ rich results can improve CTR but magnitude is uncalibrated
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — FAQ presence not verified by crawl

  **FAQs to add:**

  - How do I know if I have a hidden water leak?
  - How much does leak repair cost?
  - What causes slab leaks?
  - Can a water leak fix itself?
  - How long does leak detection take?

---

##### 8. Entity Coverage

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure these entities are mentioned in content: leak repair, water leak detection, slab leak, pipe leak, leak inspection
- **Reason:** Entity-rich content improves topical authority and helps Google understand page relevance
- **Evidence:** `Service template: Leak Repair requires entities: leak repair, water leak detection, slab leak...`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — entity coverage not verified by crawl

  **Entities to include:**

  - leak repair
  - water leak detection
  - slab leak
  - pipe leak
  - leak inspection

---

##### 9. Content Sections

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure all 7 standard content sections are present
- **Reason:** Complete content structure improves topical coverage and user experience
- **Evidence:** `Content template: 7 standard sections for Leak Repair pages`
- **Expected ranking improvement:** MODEL ESTIMATE — content depth is a known ranking factor but magnitude is uncalibrated
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — current content not verified by crawl

  **Content sections to ensure:**

  - **Hero Section**
    - H1 with city + service keyword (e.g., "Emergency Plumber in Charlotte Leak")
    - Click-to-call button (phone number prominent)
    - Trust badges (licensed, insured, years in business)
    - Service area mention
  - **Services Offered**
    - H2: Our Leak Repair Services in Charlotte Leak
    - List of specific services with brief descriptions
    - Internal links to related service pages
  - **Why Choose Us**
    - H2: Why Choose Our Charlotte Leak Plumbers
    - Licensed and insured statement
    - Years of experience
    - Customer review highlights
    - Response time guarantee
  - **Service Area**
    - H2: Areas We Serve in Charlotte Leak
    - List of neighborhoods or ZIP codes
    - Internal links to nearby city pages
  - **FAQ Section**
    - H2: Frequently Asked Questions
    - 5-8 FAQ items with structured data markup
    - FAQPage schema implementation
  - **Pricing Information**
    - H2: Leak Repair Pricing in Charlotte Leak
    - Starting prices or price ranges
    - Factors that affect cost
    - Free estimate call-to-action
  - **Contact & CTA**
    - H2: Call Charlotte Leak's Trusted Plumbers Today
    - Phone number (click-to-call)
    - Contact form or booking link
    - Business hours
    - Service area reminder

---

##### 10. Trust / EEAT Section

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add 10 EEAT elements
- **Reason:** EEAT signals (license, insurance, reviews, experience) improve trust signals for local service pages
- **Evidence:** `EEAT template: 10 standard trust elements`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — EEAT elements not verified by crawl

  **EEAT elements to add:**

  - Add or verify business license number and state registration
  - Add plumber certification/badge (e.g., Master Plumber, Journeyman)
  - Include years in business (e.g., "Serving [City] since [Year]")
  - Add customer reviews/testimonials section (minimum 3 reviews)
  - Include service area map or list of ZIP codes served
  - Add response time guarantee (e.g., "60-minute response time")
  - Include insurance information (e.g., "Fully bonded and insured")
  - Add business hours including 24/7 emergency availability
  - Include pricing transparency (at least starting prices or ranges)
  - Add team photos or about-us section for personal trust

---

##### 11. CTA / Phone Placement

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add click-to-call button in hero section (above the fold), sticky header, and footer. Phone number should be visible without scrolling.
- **Reason:** Zero clicks from GSC — page may also have CTA issues
- **Evidence:** `GSC: 135 impressions, 0 clicks`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** MODEL ESTIMATE — prominent CTA can increase call conversion but magnitude is uncalibrated (call CVR unmeasured per-page)
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — current CTA placement not verified by crawl

---

##### 12. Canonical Tag

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure canonical tag points to: /plumber-charlotte-leak-repair
- **Reason:** Prevent duplicate content issues from URL variations
- **Evidence:** `Best practice — canonical should match the page URL`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — canonical not verified by crawl

---

---

### 14. `/plumber-virginia`

**Service:** Plumbing Services | **City:** Virginia

#### Current Metrics

| Metric | Value | Source |
|--------|-------|--------|
| Impressions | 56 | GSC |
| Clicks | 0 | GSC |
| CTR | 0.0000% | GSC |
| Position | N/A | GSC |
| PageRank | 0.000362 | Link Graph |
| In-degree | 1 | Link Graph |
| Is Orphan | False | Link Graph |
| CTR Posterior Mean | 0.017241 | Bayesian |
| CTR CI | [0.000444, 0.062667] | Bayesian |
| Posterior N | 56 | Bayesian |
| Page Age | 1 days | Gott |
| Maturity Score | 0.0115 | Gott |

#### Forecast

| Field | Value | Classification |
|-------|-------|----------------|
| Expected Calls | 0.5000 | ESTIMATED |
| Calls CI | [0.0000, 3.0000] | ESTIMATED |
| Expected Revenue | $11.69 | ESTIMATED |
| Revenue CI | [$0.00, $94.46] | ESTIMATED |
| Confidence | 93.8%
| Confidence Basis | Bayesian posterior precision (uncalibrated against outcomes) | |

#### Business Value

| Field | Value |
|-------|-------|
| Revenue Priority | 5/5 |
| Call Priority | 5/5 |
| Traffic Priority | 4/5 |
| Engineering Priority | 5/5 |
| Overall ROI | 83.8% |

#### Ranking Blockers (Root Cause Analysis)

Every blocker is backed by engine evidence. No generic SEO advice.

- **[HIGH] Zero clicks despite impressions**
  - Evidence: `GSC: 56 impressions, 0 clicks, CTR=0.0000`
  - Engine: GSC
  - Diagnosis: Title tag and meta description are not compelling enough to earn clicks at current position. SERP snippet is underperforming.
- **[MEDIUM] Very few internal links (in_degree=1)**
  - Evidence: `Link Graph: in_degree=1, PageRank=0.000362`
  - Engine: Link Graph
  - Diagnosis: Only 1 internal link points to this page. Adding more internal links from relevant, high-authority pages will improve crawl frequency and ranking signals.
- **[MEDIUM] PageRank 0.000362 below site median (0.000670)**
  - Evidence: `Link Graph: PageRank=0.000362, site median=0.000670`
  - Engine: Link Graph
  - Diagnosis: Internal link equity flowing to this page is below the site median. More internal links from high-authority pages needed.
- **[LOW] CTR posterior mean=0.017241 (CI width=0.062223)**
  - Evidence: `Bayesian Engine: Beta(1, 57), mean=0.017241, CI=[0.000444, 0.062667], n_obs=56`
  - Engine: Bayesian
  - Diagnosis: CTR is estimated at 1.7241% based on 56 impressions. Very low evidence volume — estimate is dominated by prior.
- **[LOW] Page is very young (age=1 days, maturity=0.012)**
  - Evidence: `Gott Engine: page_age_days=1, maturity_score=0.0115`
  - Engine: Gott Temporal Prior
  - Diagnosis: Page has not had enough time to accumulate ranking signals. Some ranking underperformance may be due to age, not quality.

#### Implementation Plan

EXACT changes to implement. Every action includes reason, evidence, and expected improvements.

##### 1. Title Tag

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Plumbing Services in Virginia | 24/7 Licensed Plumbers | Free Estimate
- **Reason:** Zero clicks despite impressions — title tag not compelling
- **Evidence:** `GSC: 56 impressions, 0 clicks, CTR=0.0000`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — CTR posterior mean is 1.7241%, improving title could increase CTR toward site median
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — title tag not crawled, current title unknown

---

##### 2. Meta Description

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Need a plumbing services in Virginia? Licensed, insured plumbers available 24/7. Call now for a free estimate!
- **Reason:** Zero clicks — meta description not earning clicks at current position
- **Evidence:** `GSC: 56 impressions, 0 clicks, CTR=0.0000`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — improved meta description could increase CTR from 0.0000% toward site median
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — meta description not crawled

---

##### 3. H1

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Plumbing Services in Virginia
- **Reason:** Ensure H1 matches primary search intent (city + service)
- **Evidence:** `Taxonomy: service=None, city=Virginia`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — H1 not crawled, current value unknown

---

##### 4. Internal Links (Inbound)

- **Current:** in_degree=1, PageRank=0.000362
- **Recommended:** Add 3 internal links from related and high-authority pages
- **Reason:** Low internal link equity — page is underlinked (in_degree=1) with PageRank 0.000362
- **Evidence:** `Link Graph: is_orphan=False, in_degree=1, PageRank=0.000362`
- **Expected ranking improvement:** MODEL ESTIMATE — internal links pass PageRank and improve crawl discoverability. Expected improvement in position is UNKNOWN without historical calibration.
- **Expected CTR improvement:** UNKNOWN — depends on resulting position change
- **Expected call improvement:** UNKNOWN — depends on traffic increase and call CVR (unmeasured)
- **Expected revenue improvement:** UNKNOWN — depends on call increase and revenue per call (n=1)
- **Confidence:** MEDIUM — link equity deficit is evidence-backed; magnitude of improvement is uncalibrated

  **Links to add:**

  | Source Page | Target Page | Anchor Text | Placement |
  |-------------|-------------|-------------|-----------|
  | `/plumber/north-carolina/drain-cleaning` | `/plumber-virginia` | "Plumbing Services in Virginia" | Within relevant content or footer service links |
  | `/plumber/north-carolina/pipe-burst-repai` | `/plumber-virginia` | "Virginia plumbing services" | Within relevant content or footer service links |
  | `/plumber-rochester-whole-house-repiping` | `/plumber-virginia` | "expert plumbing services services in Virginia" | Within relevant content or footer service links |

---

##### 5. Schema Markup

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add structured data: LocalBusiness, Service, FAQPage
- **Reason:** Structured data helps Google understand page content and can earn rich snippets
- **Evidence:** `Service template: Plumbing Services requires LocalBusiness, Service, FAQPage`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — rich snippets can improve CTR but magnitude is uncalibrated for this site
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — schema presence not verified by crawl

---

##### 6. FAQ Section

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add FAQ section with 5 questions and FAQPage schema
- **Reason:** FAQs target long-tail queries, earn FAQ rich results, and improve content depth
- **Evidence:** `Service template: Plumbing Services has 5 standard FAQs`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — FAQ rich results can improve CTR but magnitude is uncalibrated
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — FAQ presence not verified by crawl

  **FAQs to add:**

  - How much does a plumber cost?
  - Do you offer same-day plumbing service?
  - What plumbing services do you offer?
  - Are you licensed and insured?
  - Do you offer free estimates?

---

##### 7. Entity Coverage

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure these entities are mentioned in content: plumber, plumbing repair, plumbing service, plumbing inspection
- **Reason:** Entity-rich content improves topical authority and helps Google understand page relevance
- **Evidence:** `Service template: Plumbing Services requires entities: plumber, plumbing repair, plumbing service...`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — entity coverage not verified by crawl

  **Entities to include:**

  - plumber
  - plumbing repair
  - plumbing service
  - plumbing inspection

---

##### 8. Content Sections

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure all 7 standard content sections are present
- **Reason:** Complete content structure improves topical coverage and user experience
- **Evidence:** `Content template: 7 standard sections for Plumbing Services pages`
- **Expected ranking improvement:** MODEL ESTIMATE — content depth is a known ranking factor but magnitude is uncalibrated
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — current content not verified by crawl

  **Content sections to ensure:**

  - **Hero Section**
    - H1 with city + service keyword (e.g., "Emergency Plumber in Virginia")
    - Click-to-call button (phone number prominent)
    - Trust badges (licensed, insured, years in business)
    - Service area mention
  - **Services Offered**
    - H2: Our Plumbing Services Services in Virginia
    - List of specific services with brief descriptions
    - Internal links to related service pages
  - **Why Choose Us**
    - H2: Why Choose Our Virginia Plumbers
    - Licensed and insured statement
    - Years of experience
    - Customer review highlights
    - Response time guarantee
  - **Service Area**
    - H2: Areas We Serve in Virginia
    - List of neighborhoods or ZIP codes
    - Internal links to nearby city pages
  - **FAQ Section**
    - H2: Frequently Asked Questions
    - 5-8 FAQ items with structured data markup
    - FAQPage schema implementation
  - **Pricing Information**
    - H2: Plumbing Services Pricing in Virginia
    - Starting prices or price ranges
    - Factors that affect cost
    - Free estimate call-to-action
  - **Contact & CTA**
    - H2: Call Virginia's Trusted Plumbers Today
    - Phone number (click-to-call)
    - Contact form or booking link
    - Business hours
    - Service area reminder

---

##### 9. Trust / EEAT Section

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add 10 EEAT elements
- **Reason:** EEAT signals (license, insurance, reviews, experience) improve trust signals for local service pages
- **Evidence:** `EEAT template: 10 standard trust elements`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — EEAT elements not verified by crawl

  **EEAT elements to add:**

  - Add or verify business license number and state registration
  - Add plumber certification/badge (e.g., Master Plumber, Journeyman)
  - Include years in business (e.g., "Serving [City] since [Year]")
  - Add customer reviews/testimonials section (minimum 3 reviews)
  - Include service area map or list of ZIP codes served
  - Add response time guarantee (e.g., "60-minute response time")
  - Include insurance information (e.g., "Fully bonded and insured")
  - Add business hours including 24/7 emergency availability
  - Include pricing transparency (at least starting prices or ranges)
  - Add team photos or about-us section for personal trust

---

##### 10. CTA / Phone Placement

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add click-to-call button in hero section (above the fold), sticky header, and footer. Phone number should be visible without scrolling.
- **Reason:** Zero clicks from GSC — page may also have CTA issues
- **Evidence:** `GSC: 56 impressions, 0 clicks`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** MODEL ESTIMATE — prominent CTA can increase call conversion but magnitude is uncalibrated (call CVR unmeasured per-page)
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — current CTA placement not verified by crawl

---

##### 11. Canonical Tag

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure canonical tag points to: /plumber-virginia
- **Reason:** Prevent duplicate content issues from URL variations
- **Evidence:** `Best practice — canonical should match the page URL`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — canonical not verified by crawl

---

---

### 15. `/plumber-jacksonville-emergency`

**Service:** Emergency Plumbing | **City:** Jacksonville

#### Current Metrics

| Metric | Value | Source |
|--------|-------|--------|
| Impressions | 236 | GSC |
| Clicks | 0 | GSC |
| CTR | 0.0000% | GSC |
| Position | N/A | GSC |
| PageRank | 0.000671 | Link Graph |
| In-degree | 1 | Link Graph |
| Is Orphan | False | Link Graph |
| CTR Posterior Mean | 0.004202 | Bayesian |
| CTR CI | [0.000107, 0.015444] | Bayesian |
| Posterior N | 236 | Bayesian |
| Page Age | 1 days | Gott |
| Maturity Score | 0.0115 | Gott |

#### Forecast

| Field | Value | Classification |
|-------|-------|----------------|
| Expected Calls | 0.5210 | ESTIMATED |
| Calls CI | [0.0000, 3.0000] | ESTIMATED |
| Expected Revenue | $12.52 | ESTIMATED |
| Revenue CI | [$0.00, $94.46] | ESTIMATED |
| Confidence | 98.5%
| Confidence Basis | Bayesian posterior precision (uncalibrated against outcomes) | |

#### Business Value

| Field | Value |
|-------|-------|
| Revenue Priority | 5/5 |
| Call Priority | 5/5 |
| Traffic Priority | 3/5 |
| Engineering Priority | 5/5 |
| Overall ROI | 83.8% |

#### Ranking Blockers (Root Cause Analysis)

Every blocker is backed by engine evidence. No generic SEO advice.

- **[HIGH] Zero clicks despite impressions**
  - Evidence: `GSC: 236 impressions, 0 clicks, CTR=0.0000`
  - Engine: GSC
  - Diagnosis: Title tag and meta description are not compelling enough to earn clicks at current position. SERP snippet is underperforming.
- **[MEDIUM] Very few internal links (in_degree=1)**
  - Evidence: `Link Graph: in_degree=1, PageRank=0.000671`
  - Engine: Link Graph
  - Diagnosis: Only 1 internal link points to this page. Adding more internal links from relevant, high-authority pages will improve crawl frequency and ranking signals.
- **[LOW] CTR posterior mean=0.004202 (CI width=0.015338)**
  - Evidence: `Bayesian Engine: Beta(1, 237), mean=0.004202, CI=[0.000107, 0.015444], n_obs=236`
  - Engine: Bayesian
  - Diagnosis: CTR is estimated at 0.4202% based on 236 impressions. Sufficient evidence for a stable estimate.
- **[LOW] Page is very young (age=1 days, maturity=0.012)**
  - Evidence: `Gott Engine: page_age_days=1, maturity_score=0.0115`
  - Engine: Gott Temporal Prior
  - Diagnosis: Page has not had enough time to accumulate ranking signals. Some ranking underperformance may be due to age, not quality.

#### Implementation Plan

EXACT changes to implement. Every action includes reason, evidence, and expected improvements.

##### 1. Title Tag

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Emergency Plumbing in Jacksonville | 24/7 Licensed Plumbers | Free Estimate
- **Reason:** Zero clicks despite impressions — title tag not compelling
- **Evidence:** `GSC: 236 impressions, 0 clicks, CTR=0.0000`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — CTR posterior mean is 0.4202%, improving title could increase CTR toward site median
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — title tag not crawled, current title unknown

---

##### 2. Meta Description

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Need a emergency plumbing in Jacksonville? Licensed, insured plumbers available 24/7. Call now for a free estimate!
- **Reason:** Zero clicks — meta description not earning clicks at current position
- **Evidence:** `GSC: 236 impressions, 0 clicks, CTR=0.0000`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — improved meta description could increase CTR from 0.0000% toward site median
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — meta description not crawled

---

##### 3. H1

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Emergency Plumbing in Jacksonville
- **Reason:** Ensure H1 matches primary search intent (city + service)
- **Evidence:** `Taxonomy: service=emergency, city=Jacksonville`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — H1 not crawled, current value unknown

---

##### 4. Internal Links (Inbound)

- **Current:** in_degree=1, PageRank=0.000671
- **Recommended:** Add 8 internal links from related and high-authority pages
- **Reason:** Low internal link equity — page is underlinked (in_degree=1) with PageRank 0.000671
- **Evidence:** `Link Graph: is_orphan=False, in_degree=1, PageRank=0.000671`
- **Expected ranking improvement:** MODEL ESTIMATE — internal links pass PageRank and improve crawl discoverability. Expected improvement in position is UNKNOWN without historical calibration.
- **Expected CTR improvement:** UNKNOWN — depends on resulting position change
- **Expected call improvement:** UNKNOWN — depends on traffic increase and call CVR (unmeasured)
- **Expected revenue improvement:** UNKNOWN — depends on call increase and revenue per call (n=1)
- **Confidence:** MEDIUM — link equity deficit is evidence-backed; magnitude of improvement is uncalibrated

  **Links to add:**

  | Source Page | Target Page | Anchor Text | Placement |
  |-------------|-------------|-------------|-----------|
  | `/plumber-san-diego-emergency` | `/plumber-jacksonville-emergency` | "Emergency Plumbing in Jacksonville" | Within services section (same service cluster) |
  | `/plumber-phoenix-emergency` | `/plumber-jacksonville-emergency` | "Jacksonville emergency plumbing" | Within services section (same service cluster) |
  | `/plumber-san-antonio-emergency` | `/plumber-jacksonville-emergency` | "expert emergency plumbing services in Jacksonville" | Within services section (same service cluster) |
  | `/plumber-san-jose-emergency` | `/plumber-jacksonville-emergency` | "trusted Jacksonville plumbers for emergency plumbing" | Within services section (same service cluster) |
  | `/plumber-sacramento-emergency` | `/plumber-jacksonville-emergency` | "Emergency Plumbing in Jacksonville" | Within services section (same service cluster) |
  | `/plumber/north-carolina/drain-cleaning` | `/plumber-jacksonville-emergency` | "Emergency Plumbing in Jacksonville" | Within relevant content or footer service links |
  | `/plumber/north-carolina/pipe-burst-repai` | `/plumber-jacksonville-emergency` | "Jacksonville emergency plumbing" | Within relevant content or footer service links |
  | `/plumber-rochester-whole-house-repiping` | `/plumber-jacksonville-emergency` | "expert emergency plumbing services in Jacksonville" | Within relevant content or footer service links |

---

##### 5. Internal Links (Outbound)

- **Current:** UNKNOWN — not crawled
- **Recommended:** Add 5 outbound internal links to related service pages
- **Reason:** Linking to related service pages strengthens topical cluster and improves site navigation
- **Evidence:** `Taxonomy: 10 related pages in same cluster`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW

  **Links to add:**

  | Source Page | Target Page | Anchor Text | Placement |
  |-------------|-------------|-------------|-----------|
  | `/plumber-jacksonville-emergency` | `/plumber-san-diego-emergency` | "Emergency Plumbing in San Diego" | Within services section or related services area |
  | `/plumber-jacksonville-emergency` | `/plumber-phoenix-emergency` | "Emergency Plumbing in Phoenix" | Within services section or related services area |
  | `/plumber-jacksonville-emergency` | `/plumber-san-antonio-emergency` | "Emergency Plumbing in San Antonio" | Within services section or related services area |
  | `/plumber-jacksonville-emergency` | `/plumber-san-jose-emergency` | "Emergency Plumbing in San Jose" | Within services section or related services area |
  | `/plumber-jacksonville-emergency` | `/plumber-sacramento-emergency` | "Emergency Plumbing in Sacramento" | Within services section or related services area |

---

##### 6. Schema Markup

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add structured data: LocalBusiness, Service, FAQPage, EmergencyService
- **Reason:** Structured data helps Google understand page content and can earn rich snippets
- **Evidence:** `Service template: Emergency Plumbing requires LocalBusiness, Service, FAQPage, EmergencyService`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — rich snippets can improve CTR but magnitude is uncalibrated for this site
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — schema presence not verified by crawl

---

##### 7. FAQ Section

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add FAQ section with 5 questions and FAQPage schema
- **Reason:** FAQs target long-tail queries, earn FAQ rich results, and improve content depth
- **Evidence:** `Service template: Emergency Plumbing has 5 standard FAQs`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — FAQ rich results can improve CTR but magnitude is uncalibrated
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — FAQ presence not verified by crawl

  **FAQs to add:**

  - How quickly can an emergency plumber arrive?
  - What counts as a plumbing emergency?
  - Do you offer 24/7 emergency plumbing service?
  - How much does emergency plumbing cost?
  - What should I do while waiting for the plumber?

---

##### 8. Entity Coverage

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure these entities are mentioned in content: emergency plumber, 24/7 plumbing service, urgent plumbing repair, burst pipe, flooding
- **Reason:** Entity-rich content improves topical authority and helps Google understand page relevance
- **Evidence:** `Service template: Emergency Plumbing requires entities: emergency plumber, 24/7 plumbing service, urgent plumbing repair...`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — entity coverage not verified by crawl

  **Entities to include:**

  - emergency plumber
  - 24/7 plumbing service
  - urgent plumbing repair
  - burst pipe
  - flooding

---

##### 9. Content Sections

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure all 7 standard content sections are present
- **Reason:** Complete content structure improves topical coverage and user experience
- **Evidence:** `Content template: 7 standard sections for Emergency Plumbing pages`
- **Expected ranking improvement:** MODEL ESTIMATE — content depth is a known ranking factor but magnitude is uncalibrated
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — current content not verified by crawl

  **Content sections to ensure:**

  - **Hero Section**
    - H1 with city + service keyword (e.g., "Emergency Plumber in Jacksonville")
    - Click-to-call button (phone number prominent)
    - Trust badges (licensed, insured, years in business)
    - Service area mention
  - **Services Offered**
    - H2: Our Emergency Plumbing Services in Jacksonville
    - List of specific services with brief descriptions
    - Internal links to related service pages
  - **Why Choose Us**
    - H2: Why Choose Our Jacksonville Plumbers
    - Licensed and insured statement
    - Years of experience
    - Customer review highlights
    - Response time guarantee
  - **Service Area**
    - H2: Areas We Serve in Jacksonville
    - List of neighborhoods or ZIP codes
    - Internal links to nearby city pages
  - **FAQ Section**
    - H2: Frequently Asked Questions
    - 5-8 FAQ items with structured data markup
    - FAQPage schema implementation
  - **Pricing Information**
    - H2: Emergency Plumbing Pricing in Jacksonville
    - Starting prices or price ranges
    - Factors that affect cost
    - Free estimate call-to-action
  - **Contact & CTA**
    - H2: Call Jacksonville's Trusted Plumbers Today
    - Phone number (click-to-call)
    - Contact form or booking link
    - Business hours
    - Service area reminder

---

##### 10. Trust / EEAT Section

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add 10 EEAT elements
- **Reason:** EEAT signals (license, insurance, reviews, experience) improve trust signals for local service pages
- **Evidence:** `EEAT template: 10 standard trust elements`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — EEAT elements not verified by crawl

  **EEAT elements to add:**

  - Add or verify business license number and state registration
  - Add plumber certification/badge (e.g., Master Plumber, Journeyman)
  - Include years in business (e.g., "Serving [City] since [Year]")
  - Add customer reviews/testimonials section (minimum 3 reviews)
  - Include service area map or list of ZIP codes served
  - Add response time guarantee (e.g., "60-minute response time")
  - Include insurance information (e.g., "Fully bonded and insured")
  - Add business hours including 24/7 emergency availability
  - Include pricing transparency (at least starting prices or ranges)
  - Add team photos or about-us section for personal trust

---

##### 11. CTA / Phone Placement

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add click-to-call button in hero section (above the fold), sticky header, and footer. Phone number should be visible without scrolling.
- **Reason:** Zero clicks from GSC — page may also have CTA issues
- **Evidence:** `GSC: 236 impressions, 0 clicks`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** MODEL ESTIMATE — prominent CTA can increase call conversion but magnitude is uncalibrated (call CVR unmeasured per-page)
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — current CTA placement not verified by crawl

---

##### 12. Canonical Tag

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure canonical tag points to: /plumber-jacksonville-emergency
- **Reason:** Prevent duplicate content issues from URL variations
- **Evidence:** `Best practice — canonical should match the page URL`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — canonical not verified by crawl

---

---

### 16. `/plumber-pittsburgh-emergency`

**Service:** Emergency Plumbing | **City:** Pittsburgh

#### Current Metrics

| Metric | Value | Source |
|--------|-------|--------|
| Impressions | 110 | GSC |
| Clicks | 0 | GSC |
| CTR | 0.0000% | GSC |
| Position | N/A | GSC |
| PageRank | 0.000671 | Link Graph |
| In-degree | 1 | Link Graph |
| Is Orphan | False | Link Graph |
| CTR Posterior Mean | 0.008929 | Bayesian |
| CTR CI | [0.000228, 0.032687] | Bayesian |
| Posterior N | 110 | Bayesian |
| Page Age | 1 days | Gott |
| Maturity Score | 0.0115 | Gott |

#### Forecast

| Field | Value | Classification |
|-------|-------|----------------|
| Expected Calls | 0.5190 | ESTIMATED |
| Calls CI | [0.0000, 3.0000] | ESTIMATED |
| Expected Revenue | $12.54 | ESTIMATED |
| Revenue CI | [$0.00, $94.46] | ESTIMATED |
| Confidence | 96.8%
| Confidence Basis | Bayesian posterior precision (uncalibrated against outcomes) | |

#### Business Value

| Field | Value |
|-------|-------|
| Revenue Priority | 5/5 |
| Call Priority | 5/5 |
| Traffic Priority | 3/5 |
| Engineering Priority | 5/5 |
| Overall ROI | 83.5% |

#### Ranking Blockers (Root Cause Analysis)

Every blocker is backed by engine evidence. No generic SEO advice.

- **[HIGH] Zero clicks despite impressions**
  - Evidence: `GSC: 110 impressions, 0 clicks, CTR=0.0000`
  - Engine: GSC
  - Diagnosis: Title tag and meta description are not compelling enough to earn clicks at current position. SERP snippet is underperforming.
- **[MEDIUM] Very few internal links (in_degree=1)**
  - Evidence: `Link Graph: in_degree=1, PageRank=0.000671`
  - Engine: Link Graph
  - Diagnosis: Only 1 internal link points to this page. Adding more internal links from relevant, high-authority pages will improve crawl frequency and ranking signals.
- **[LOW] CTR posterior mean=0.008929 (CI width=0.032459)**
  - Evidence: `Bayesian Engine: Beta(1, 111), mean=0.008929, CI=[0.000228, 0.032687], n_obs=110`
  - Engine: Bayesian
  - Diagnosis: CTR is estimated at 0.8929% based on 110 impressions. Sufficient evidence for a stable estimate.
- **[LOW] Page is very young (age=1 days, maturity=0.012)**
  - Evidence: `Gott Engine: page_age_days=1, maturity_score=0.0115`
  - Engine: Gott Temporal Prior
  - Diagnosis: Page has not had enough time to accumulate ranking signals. Some ranking underperformance may be due to age, not quality.

#### Implementation Plan

EXACT changes to implement. Every action includes reason, evidence, and expected improvements.

##### 1. Title Tag

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Emergency Plumbing in Pittsburgh | 24/7 Licensed Plumbers | Free Estimate
- **Reason:** Zero clicks despite impressions — title tag not compelling
- **Evidence:** `GSC: 110 impressions, 0 clicks, CTR=0.0000`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — CTR posterior mean is 0.8929%, improving title could increase CTR toward site median
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — title tag not crawled, current title unknown

---

##### 2. Meta Description

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Need a emergency plumbing in Pittsburgh? Licensed, insured plumbers available 24/7. Call now for a free estimate!
- **Reason:** Zero clicks — meta description not earning clicks at current position
- **Evidence:** `GSC: 110 impressions, 0 clicks, CTR=0.0000`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — improved meta description could increase CTR from 0.0000% toward site median
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — meta description not crawled

---

##### 3. H1

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Emergency Plumbing in Pittsburgh
- **Reason:** Ensure H1 matches primary search intent (city + service)
- **Evidence:** `Taxonomy: service=emergency, city=Pittsburgh`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — H1 not crawled, current value unknown

---

##### 4. Internal Links (Inbound)

- **Current:** in_degree=1, PageRank=0.000671
- **Recommended:** Add 8 internal links from related and high-authority pages
- **Reason:** Low internal link equity — page is underlinked (in_degree=1) with PageRank 0.000671
- **Evidence:** `Link Graph: is_orphan=False, in_degree=1, PageRank=0.000671`
- **Expected ranking improvement:** MODEL ESTIMATE — internal links pass PageRank and improve crawl discoverability. Expected improvement in position is UNKNOWN without historical calibration.
- **Expected CTR improvement:** UNKNOWN — depends on resulting position change
- **Expected call improvement:** UNKNOWN — depends on traffic increase and call CVR (unmeasured)
- **Expected revenue improvement:** UNKNOWN — depends on call increase and revenue per call (n=1)
- **Confidence:** MEDIUM — link equity deficit is evidence-backed; magnitude of improvement is uncalibrated

  **Links to add:**

  | Source Page | Target Page | Anchor Text | Placement |
  |-------------|-------------|-------------|-----------|
  | `/plumber-san-diego-emergency` | `/plumber-pittsburgh-emergency` | "Emergency Plumbing in Pittsburgh" | Within services section (same service cluster) |
  | `/plumber-phoenix-emergency` | `/plumber-pittsburgh-emergency` | "Pittsburgh emergency plumbing" | Within services section (same service cluster) |
  | `/plumber-san-antonio-emergency` | `/plumber-pittsburgh-emergency` | "expert emergency plumbing services in Pittsburgh" | Within services section (same service cluster) |
  | `/plumber-san-jose-emergency` | `/plumber-pittsburgh-emergency` | "trusted Pittsburgh plumbers for emergency plumbing" | Within services section (same service cluster) |
  | `/plumber-sacramento-emergency` | `/plumber-pittsburgh-emergency` | "Emergency Plumbing in Pittsburgh" | Within services section (same service cluster) |
  | `/plumber/north-carolina/drain-cleaning` | `/plumber-pittsburgh-emergency` | "Emergency Plumbing in Pittsburgh" | Within relevant content or footer service links |
  | `/plumber/north-carolina/pipe-burst-repai` | `/plumber-pittsburgh-emergency` | "Pittsburgh emergency plumbing" | Within relevant content or footer service links |
  | `/plumber-rochester-whole-house-repiping` | `/plumber-pittsburgh-emergency` | "expert emergency plumbing services in Pittsburgh" | Within relevant content or footer service links |

---

##### 5. Internal Links (Outbound)

- **Current:** UNKNOWN — not crawled
- **Recommended:** Add 5 outbound internal links to related service pages
- **Reason:** Linking to related service pages strengthens topical cluster and improves site navigation
- **Evidence:** `Taxonomy: 10 related pages in same cluster`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW

  **Links to add:**

  | Source Page | Target Page | Anchor Text | Placement |
  |-------------|-------------|-------------|-----------|
  | `/plumber-pittsburgh-emergency` | `/plumber-san-diego-emergency` | "Emergency Plumbing in San Diego" | Within services section or related services area |
  | `/plumber-pittsburgh-emergency` | `/plumber-phoenix-emergency` | "Emergency Plumbing in Phoenix" | Within services section or related services area |
  | `/plumber-pittsburgh-emergency` | `/plumber-san-antonio-emergency` | "Emergency Plumbing in San Antonio" | Within services section or related services area |
  | `/plumber-pittsburgh-emergency` | `/plumber-san-jose-emergency` | "Emergency Plumbing in San Jose" | Within services section or related services area |
  | `/plumber-pittsburgh-emergency` | `/plumber-sacramento-emergency` | "Emergency Plumbing in Sacramento" | Within services section or related services area |

---

##### 6. Schema Markup

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add structured data: LocalBusiness, Service, FAQPage, EmergencyService
- **Reason:** Structured data helps Google understand page content and can earn rich snippets
- **Evidence:** `Service template: Emergency Plumbing requires LocalBusiness, Service, FAQPage, EmergencyService`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — rich snippets can improve CTR but magnitude is uncalibrated for this site
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — schema presence not verified by crawl

---

##### 7. FAQ Section

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add FAQ section with 5 questions and FAQPage schema
- **Reason:** FAQs target long-tail queries, earn FAQ rich results, and improve content depth
- **Evidence:** `Service template: Emergency Plumbing has 5 standard FAQs`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — FAQ rich results can improve CTR but magnitude is uncalibrated
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — FAQ presence not verified by crawl

  **FAQs to add:**

  - How quickly can an emergency plumber arrive?
  - What counts as a plumbing emergency?
  - Do you offer 24/7 emergency plumbing service?
  - How much does emergency plumbing cost?
  - What should I do while waiting for the plumber?

---

##### 8. Entity Coverage

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure these entities are mentioned in content: emergency plumber, 24/7 plumbing service, urgent plumbing repair, burst pipe, flooding
- **Reason:** Entity-rich content improves topical authority and helps Google understand page relevance
- **Evidence:** `Service template: Emergency Plumbing requires entities: emergency plumber, 24/7 plumbing service, urgent plumbing repair...`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — entity coverage not verified by crawl

  **Entities to include:**

  - emergency plumber
  - 24/7 plumbing service
  - urgent plumbing repair
  - burst pipe
  - flooding

---

##### 9. Content Sections

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure all 7 standard content sections are present
- **Reason:** Complete content structure improves topical coverage and user experience
- **Evidence:** `Content template: 7 standard sections for Emergency Plumbing pages`
- **Expected ranking improvement:** MODEL ESTIMATE — content depth is a known ranking factor but magnitude is uncalibrated
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — current content not verified by crawl

  **Content sections to ensure:**

  - **Hero Section**
    - H1 with city + service keyword (e.g., "Emergency Plumber in Pittsburgh")
    - Click-to-call button (phone number prominent)
    - Trust badges (licensed, insured, years in business)
    - Service area mention
  - **Services Offered**
    - H2: Our Emergency Plumbing Services in Pittsburgh
    - List of specific services with brief descriptions
    - Internal links to related service pages
  - **Why Choose Us**
    - H2: Why Choose Our Pittsburgh Plumbers
    - Licensed and insured statement
    - Years of experience
    - Customer review highlights
    - Response time guarantee
  - **Service Area**
    - H2: Areas We Serve in Pittsburgh
    - List of neighborhoods or ZIP codes
    - Internal links to nearby city pages
  - **FAQ Section**
    - H2: Frequently Asked Questions
    - 5-8 FAQ items with structured data markup
    - FAQPage schema implementation
  - **Pricing Information**
    - H2: Emergency Plumbing Pricing in Pittsburgh
    - Starting prices or price ranges
    - Factors that affect cost
    - Free estimate call-to-action
  - **Contact & CTA**
    - H2: Call Pittsburgh's Trusted Plumbers Today
    - Phone number (click-to-call)
    - Contact form or booking link
    - Business hours
    - Service area reminder

---

##### 10. Trust / EEAT Section

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add 10 EEAT elements
- **Reason:** EEAT signals (license, insurance, reviews, experience) improve trust signals for local service pages
- **Evidence:** `EEAT template: 10 standard trust elements`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — EEAT elements not verified by crawl

  **EEAT elements to add:**

  - Add or verify business license number and state registration
  - Add plumber certification/badge (e.g., Master Plumber, Journeyman)
  - Include years in business (e.g., "Serving [City] since [Year]")
  - Add customer reviews/testimonials section (minimum 3 reviews)
  - Include service area map or list of ZIP codes served
  - Add response time guarantee (e.g., "60-minute response time")
  - Include insurance information (e.g., "Fully bonded and insured")
  - Add business hours including 24/7 emergency availability
  - Include pricing transparency (at least starting prices or ranges)
  - Add team photos or about-us section for personal trust

---

##### 11. CTA / Phone Placement

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add click-to-call button in hero section (above the fold), sticky header, and footer. Phone number should be visible without scrolling.
- **Reason:** Zero clicks from GSC — page may also have CTA issues
- **Evidence:** `GSC: 110 impressions, 0 clicks`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** MODEL ESTIMATE — prominent CTA can increase call conversion but magnitude is uncalibrated (call CVR unmeasured per-page)
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — current CTA placement not verified by crawl

---

##### 12. Canonical Tag

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure canonical tag points to: /plumber-pittsburgh-emergency
- **Reason:** Prevent duplicate content issues from URL variations
- **Evidence:** `Best practice — canonical should match the page URL`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — canonical not verified by crawl

---

---

### 17. `/plumber-columbus-emergency`

**Service:** Emergency Plumbing | **City:** Columbus

#### Current Metrics

| Metric | Value | Source |
|--------|-------|--------|
| Impressions | 247 | GSC |
| Clicks | 0 | GSC |
| CTR | 0.0000% | GSC |
| Position | N/A | GSC |
| PageRank | 0.000671 | Link Graph |
| In-degree | 1 | Link Graph |
| Is Orphan | False | Link Graph |
| CTR Posterior Mean | 0.004016 | Bayesian |
| CTR CI | [0.000102, 0.014764] | Bayesian |
| Posterior N | 247 | Bayesian |
| Page Age | 1 days | Gott |
| Maturity Score | 0.0115 | Gott |

#### Forecast

| Field | Value | Classification |
|-------|-------|----------------|
| Expected Calls | 0.5370 | ESTIMATED |
| Calls CI | [0.0000, 3.0000] | ESTIMATED |
| Expected Revenue | $12.07 | ESTIMATED |
| Revenue CI | [$0.00, $94.46] | ESTIMATED |
| Confidence | 98.5%
| Confidence Basis | Bayesian posterior precision (uncalibrated against outcomes) | |

#### Business Value

| Field | Value |
|-------|-------|
| Revenue Priority | 5/5 |
| Call Priority | 5/5 |
| Traffic Priority | 3/5 |
| Engineering Priority | 5/5 |
| Overall ROI | 83.3% |

#### Ranking Blockers (Root Cause Analysis)

Every blocker is backed by engine evidence. No generic SEO advice.

- **[HIGH] Zero clicks despite impressions**
  - Evidence: `GSC: 247 impressions, 0 clicks, CTR=0.0000`
  - Engine: GSC
  - Diagnosis: Title tag and meta description are not compelling enough to earn clicks at current position. SERP snippet is underperforming.
- **[MEDIUM] Very few internal links (in_degree=1)**
  - Evidence: `Link Graph: in_degree=1, PageRank=0.000671`
  - Engine: Link Graph
  - Diagnosis: Only 1 internal link points to this page. Adding more internal links from relevant, high-authority pages will improve crawl frequency and ranking signals.
- **[LOW] CTR posterior mean=0.004016 (CI width=0.014662)**
  - Evidence: `Bayesian Engine: Beta(1, 248), mean=0.004016, CI=[0.000102, 0.014764], n_obs=247`
  - Engine: Bayesian
  - Diagnosis: CTR is estimated at 0.4016% based on 247 impressions. Sufficient evidence for a stable estimate.
- **[LOW] Page is very young (age=1 days, maturity=0.012)**
  - Evidence: `Gott Engine: page_age_days=1, maturity_score=0.0115`
  - Engine: Gott Temporal Prior
  - Diagnosis: Page has not had enough time to accumulate ranking signals. Some ranking underperformance may be due to age, not quality.

#### Implementation Plan

EXACT changes to implement. Every action includes reason, evidence, and expected improvements.

##### 1. Title Tag

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Emergency Plumbing in Columbus | 24/7 Licensed Plumbers | Free Estimate
- **Reason:** Zero clicks despite impressions — title tag not compelling
- **Evidence:** `GSC: 247 impressions, 0 clicks, CTR=0.0000`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — CTR posterior mean is 0.4016%, improving title could increase CTR toward site median
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — title tag not crawled, current title unknown

---

##### 2. Meta Description

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Need a emergency plumbing in Columbus? Licensed, insured plumbers available 24/7. Call now for a free estimate!
- **Reason:** Zero clicks — meta description not earning clicks at current position
- **Evidence:** `GSC: 247 impressions, 0 clicks, CTR=0.0000`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — improved meta description could increase CTR from 0.0000% toward site median
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — meta description not crawled

---

##### 3. H1

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Emergency Plumbing in Columbus
- **Reason:** Ensure H1 matches primary search intent (city + service)
- **Evidence:** `Taxonomy: service=emergency, city=Columbus`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — H1 not crawled, current value unknown

---

##### 4. Internal Links (Inbound)

- **Current:** in_degree=1, PageRank=0.000671
- **Recommended:** Add 8 internal links from related and high-authority pages
- **Reason:** Low internal link equity — page is underlinked (in_degree=1) with PageRank 0.000671
- **Evidence:** `Link Graph: is_orphan=False, in_degree=1, PageRank=0.000671`
- **Expected ranking improvement:** MODEL ESTIMATE — internal links pass PageRank and improve crawl discoverability. Expected improvement in position is UNKNOWN without historical calibration.
- **Expected CTR improvement:** UNKNOWN — depends on resulting position change
- **Expected call improvement:** UNKNOWN — depends on traffic increase and call CVR (unmeasured)
- **Expected revenue improvement:** UNKNOWN — depends on call increase and revenue per call (n=1)
- **Confidence:** MEDIUM — link equity deficit is evidence-backed; magnitude of improvement is uncalibrated

  **Links to add:**

  | Source Page | Target Page | Anchor Text | Placement |
  |-------------|-------------|-------------|-----------|
  | `/plumber-san-diego-emergency` | `/plumber-columbus-emergency` | "Emergency Plumbing in Columbus" | Within services section (same service cluster) |
  | `/plumber-phoenix-emergency` | `/plumber-columbus-emergency` | "Columbus emergency plumbing" | Within services section (same service cluster) |
  | `/plumber-san-antonio-emergency` | `/plumber-columbus-emergency` | "expert emergency plumbing services in Columbus" | Within services section (same service cluster) |
  | `/plumber-san-jose-emergency` | `/plumber-columbus-emergency` | "trusted Columbus plumbers for emergency plumbing" | Within services section (same service cluster) |
  | `/plumber-sacramento-emergency` | `/plumber-columbus-emergency` | "Emergency Plumbing in Columbus" | Within services section (same service cluster) |
  | `/plumber/north-carolina/drain-cleaning` | `/plumber-columbus-emergency` | "Emergency Plumbing in Columbus" | Within relevant content or footer service links |
  | `/plumber/north-carolina/pipe-burst-repai` | `/plumber-columbus-emergency` | "Columbus emergency plumbing" | Within relevant content or footer service links |
  | `/plumber-rochester-whole-house-repiping` | `/plumber-columbus-emergency` | "expert emergency plumbing services in Columbus" | Within relevant content or footer service links |

---

##### 5. Internal Links (Outbound)

- **Current:** UNKNOWN — not crawled
- **Recommended:** Add 5 outbound internal links to related service pages
- **Reason:** Linking to related service pages strengthens topical cluster and improves site navigation
- **Evidence:** `Taxonomy: 10 related pages in same cluster`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW

  **Links to add:**

  | Source Page | Target Page | Anchor Text | Placement |
  |-------------|-------------|-------------|-----------|
  | `/plumber-columbus-emergency` | `/plumber-san-diego-emergency` | "Emergency Plumbing in San Diego" | Within services section or related services area |
  | `/plumber-columbus-emergency` | `/plumber-phoenix-emergency` | "Emergency Plumbing in Phoenix" | Within services section or related services area |
  | `/plumber-columbus-emergency` | `/plumber-san-antonio-emergency` | "Emergency Plumbing in San Antonio" | Within services section or related services area |
  | `/plumber-columbus-emergency` | `/plumber-san-jose-emergency` | "Emergency Plumbing in San Jose" | Within services section or related services area |
  | `/plumber-columbus-emergency` | `/plumber-sacramento-emergency` | "Emergency Plumbing in Sacramento" | Within services section or related services area |

---

##### 6. Schema Markup

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add structured data: LocalBusiness, Service, FAQPage, EmergencyService
- **Reason:** Structured data helps Google understand page content and can earn rich snippets
- **Evidence:** `Service template: Emergency Plumbing requires LocalBusiness, Service, FAQPage, EmergencyService`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — rich snippets can improve CTR but magnitude is uncalibrated for this site
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — schema presence not verified by crawl

---

##### 7. FAQ Section

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add FAQ section with 5 questions and FAQPage schema
- **Reason:** FAQs target long-tail queries, earn FAQ rich results, and improve content depth
- **Evidence:** `Service template: Emergency Plumbing has 5 standard FAQs`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — FAQ rich results can improve CTR but magnitude is uncalibrated
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — FAQ presence not verified by crawl

  **FAQs to add:**

  - How quickly can an emergency plumber arrive?
  - What counts as a plumbing emergency?
  - Do you offer 24/7 emergency plumbing service?
  - How much does emergency plumbing cost?
  - What should I do while waiting for the plumber?

---

##### 8. Entity Coverage

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure these entities are mentioned in content: emergency plumber, 24/7 plumbing service, urgent plumbing repair, burst pipe, flooding
- **Reason:** Entity-rich content improves topical authority and helps Google understand page relevance
- **Evidence:** `Service template: Emergency Plumbing requires entities: emergency plumber, 24/7 plumbing service, urgent plumbing repair...`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — entity coverage not verified by crawl

  **Entities to include:**

  - emergency plumber
  - 24/7 plumbing service
  - urgent plumbing repair
  - burst pipe
  - flooding

---

##### 9. Content Sections

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure all 7 standard content sections are present
- **Reason:** Complete content structure improves topical coverage and user experience
- **Evidence:** `Content template: 7 standard sections for Emergency Plumbing pages`
- **Expected ranking improvement:** MODEL ESTIMATE — content depth is a known ranking factor but magnitude is uncalibrated
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — current content not verified by crawl

  **Content sections to ensure:**

  - **Hero Section**
    - H1 with city + service keyword (e.g., "Emergency Plumber in Columbus")
    - Click-to-call button (phone number prominent)
    - Trust badges (licensed, insured, years in business)
    - Service area mention
  - **Services Offered**
    - H2: Our Emergency Plumbing Services in Columbus
    - List of specific services with brief descriptions
    - Internal links to related service pages
  - **Why Choose Us**
    - H2: Why Choose Our Columbus Plumbers
    - Licensed and insured statement
    - Years of experience
    - Customer review highlights
    - Response time guarantee
  - **Service Area**
    - H2: Areas We Serve in Columbus
    - List of neighborhoods or ZIP codes
    - Internal links to nearby city pages
  - **FAQ Section**
    - H2: Frequently Asked Questions
    - 5-8 FAQ items with structured data markup
    - FAQPage schema implementation
  - **Pricing Information**
    - H2: Emergency Plumbing Pricing in Columbus
    - Starting prices or price ranges
    - Factors that affect cost
    - Free estimate call-to-action
  - **Contact & CTA**
    - H2: Call Columbus's Trusted Plumbers Today
    - Phone number (click-to-call)
    - Contact form or booking link
    - Business hours
    - Service area reminder

---

##### 10. Trust / EEAT Section

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add 10 EEAT elements
- **Reason:** EEAT signals (license, insurance, reviews, experience) improve trust signals for local service pages
- **Evidence:** `EEAT template: 10 standard trust elements`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — EEAT elements not verified by crawl

  **EEAT elements to add:**

  - Add or verify business license number and state registration
  - Add plumber certification/badge (e.g., Master Plumber, Journeyman)
  - Include years in business (e.g., "Serving [City] since [Year]")
  - Add customer reviews/testimonials section (minimum 3 reviews)
  - Include service area map or list of ZIP codes served
  - Add response time guarantee (e.g., "60-minute response time")
  - Include insurance information (e.g., "Fully bonded and insured")
  - Add business hours including 24/7 emergency availability
  - Include pricing transparency (at least starting prices or ranges)
  - Add team photos or about-us section for personal trust

---

##### 11. CTA / Phone Placement

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add click-to-call button in hero section (above the fold), sticky header, and footer. Phone number should be visible without scrolling.
- **Reason:** Zero clicks from GSC — page may also have CTA issues
- **Evidence:** `GSC: 247 impressions, 0 clicks`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** MODEL ESTIMATE — prominent CTA can increase call conversion but magnitude is uncalibrated (call CVR unmeasured per-page)
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — current CTA placement not verified by crawl

---

##### 12. Canonical Tag

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure canonical tag points to: /plumber-columbus-emergency
- **Reason:** Prevent duplicate content issues from URL variations
- **Evidence:** `Best practice — canonical should match the page URL`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — canonical not verified by crawl

---

---

### 18. `/cost/houston`

**Service:** Plumbing Services | **City:** Unknown

#### Current Metrics

| Metric | Value | Source |
|--------|-------|--------|
| Impressions | 376 | GSC |
| Clicks | 0 | GSC |
| CTR | 0.0000% | GSC |
| Position | N/A | GSC |
| PageRank | 0.000362 | Link Graph |
| In-degree | 1 | Link Graph |
| Is Orphan | False | Link Graph |
| CTR Posterior Mean | 0.002646 | Bayesian |
| CTR CI | [0.000067, 0.009737] | Bayesian |
| Posterior N | 376 | Bayesian |
| Page Age | 1 days | Gott |
| Maturity Score | 0.0115 | Gott |

#### Forecast

| Field | Value | Classification |
|-------|-------|----------------|
| Expected Calls | 0.4905 | ESTIMATED |
| Calls CI | [0.0000, 3.0000] | ESTIMATED |
| Expected Revenue | $11.50 | ESTIMATED |
| Revenue CI | [$0.00, $94.46] | ESTIMATED |
| Confidence | 99.0%
| Confidence Basis | Bayesian posterior precision (uncalibrated against outcomes) | |

#### Business Value

| Field | Value |
|-------|-------|
| Revenue Priority | 5/5 |
| Call Priority | 5/5 |
| Traffic Priority | 4/5 |
| Engineering Priority | 5/5 |
| Overall ROI | 83.3% |

#### Ranking Blockers (Root Cause Analysis)

Every blocker is backed by engine evidence. No generic SEO advice.

- **[HIGH] Zero clicks despite impressions**
  - Evidence: `GSC: 376 impressions, 0 clicks, CTR=0.0000`
  - Engine: GSC
  - Diagnosis: Title tag and meta description are not compelling enough to earn clicks at current position. SERP snippet is underperforming.
- **[MEDIUM] Very few internal links (in_degree=1)**
  - Evidence: `Link Graph: in_degree=1, PageRank=0.000362`
  - Engine: Link Graph
  - Diagnosis: Only 1 internal link points to this page. Adding more internal links from relevant, high-authority pages will improve crawl frequency and ranking signals.
- **[MEDIUM] PageRank 0.000362 below site median (0.000670)**
  - Evidence: `Link Graph: PageRank=0.000362, site median=0.000670`
  - Engine: Link Graph
  - Diagnosis: Internal link equity flowing to this page is below the site median. More internal links from high-authority pages needed.
- **[LOW] CTR posterior mean=0.002646 (CI width=0.009670)**
  - Evidence: `Bayesian Engine: Beta(1, 377), mean=0.002646, CI=[0.000067, 0.009737], n_obs=376`
  - Engine: Bayesian
  - Diagnosis: CTR is estimated at 0.2646% based on 376 impressions. Sufficient evidence for a stable estimate.
- **[LOW] Page is very young (age=1 days, maturity=0.012)**
  - Evidence: `Gott Engine: page_age_days=1, maturity_score=0.0115`
  - Engine: Gott Temporal Prior
  - Diagnosis: Page has not had enough time to accumulate ranking signals. Some ranking underperformance may be due to age, not quality.

#### Implementation Plan

EXACT changes to implement. Every action includes reason, evidence, and expected improvements.

##### 1. Title Tag

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Plumbing Services in Unknown | 24/7 Licensed Plumbers | Free Estimate
- **Reason:** Zero clicks despite impressions — title tag not compelling
- **Evidence:** `GSC: 376 impressions, 0 clicks, CTR=0.0000`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — CTR posterior mean is 0.2646%, improving title could increase CTR toward site median
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — title tag not crawled, current title unknown

---

##### 2. Meta Description

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Need a plumbing services in Unknown? Licensed, insured plumbers available 24/7. Call now for a free estimate!
- **Reason:** Zero clicks — meta description not earning clicks at current position
- **Evidence:** `GSC: 376 impressions, 0 clicks, CTR=0.0000`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — improved meta description could increase CTR from 0.0000% toward site median
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — meta description not crawled

---

##### 3. H1

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Plumbing Services in Unknown
- **Reason:** Ensure H1 matches primary search intent (city + service)
- **Evidence:** `Taxonomy: service=None, city=Unknown`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — H1 not crawled, current value unknown

---

##### 4. Internal Links (Inbound)

- **Current:** in_degree=1, PageRank=0.000362
- **Recommended:** Add 3 internal links from related and high-authority pages
- **Reason:** Low internal link equity — page is underlinked (in_degree=1) with PageRank 0.000362
- **Evidence:** `Link Graph: is_orphan=False, in_degree=1, PageRank=0.000362`
- **Expected ranking improvement:** MODEL ESTIMATE — internal links pass PageRank and improve crawl discoverability. Expected improvement in position is UNKNOWN without historical calibration.
- **Expected CTR improvement:** UNKNOWN — depends on resulting position change
- **Expected call improvement:** UNKNOWN — depends on traffic increase and call CVR (unmeasured)
- **Expected revenue improvement:** UNKNOWN — depends on call increase and revenue per call (n=1)
- **Confidence:** MEDIUM — link equity deficit is evidence-backed; magnitude of improvement is uncalibrated

  **Links to add:**

  | Source Page | Target Page | Anchor Text | Placement |
  |-------------|-------------|-------------|-----------|
  | `/plumber/north-carolina/drain-cleaning` | `/cost/houston` | "Plumbing Services in Unknown" | Within relevant content or footer service links |
  | `/plumber/north-carolina/pipe-burst-repai` | `/cost/houston` | "Unknown plumbing services" | Within relevant content or footer service links |
  | `/plumber-rochester-whole-house-repiping` | `/cost/houston` | "expert plumbing services services in Unknown" | Within relevant content or footer service links |

---

##### 5. Schema Markup

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add structured data: LocalBusiness, Service, FAQPage
- **Reason:** Structured data helps Google understand page content and can earn rich snippets
- **Evidence:** `Service template: Plumbing Services requires LocalBusiness, Service, FAQPage`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — rich snippets can improve CTR but magnitude is uncalibrated for this site
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — schema presence not verified by crawl

---

##### 6. FAQ Section

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add FAQ section with 5 questions and FAQPage schema
- **Reason:** FAQs target long-tail queries, earn FAQ rich results, and improve content depth
- **Evidence:** `Service template: Plumbing Services has 5 standard FAQs`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — FAQ rich results can improve CTR but magnitude is uncalibrated
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — FAQ presence not verified by crawl

  **FAQs to add:**

  - How much does a plumber cost?
  - Do you offer same-day plumbing service?
  - What plumbing services do you offer?
  - Are you licensed and insured?
  - Do you offer free estimates?

---

##### 7. Entity Coverage

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure these entities are mentioned in content: plumber, plumbing repair, plumbing service, plumbing inspection
- **Reason:** Entity-rich content improves topical authority and helps Google understand page relevance
- **Evidence:** `Service template: Plumbing Services requires entities: plumber, plumbing repair, plumbing service...`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — entity coverage not verified by crawl

  **Entities to include:**

  - plumber
  - plumbing repair
  - plumbing service
  - plumbing inspection

---

##### 8. Content Sections

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure all 7 standard content sections are present
- **Reason:** Complete content structure improves topical coverage and user experience
- **Evidence:** `Content template: 7 standard sections for Plumbing Services pages`
- **Expected ranking improvement:** MODEL ESTIMATE — content depth is a known ranking factor but magnitude is uncalibrated
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — current content not verified by crawl

  **Content sections to ensure:**

  - **Hero Section**
    - H1 with city + service keyword (e.g., "Emergency Plumber in Unknown")
    - Click-to-call button (phone number prominent)
    - Trust badges (licensed, insured, years in business)
    - Service area mention
  - **Services Offered**
    - H2: Our Plumbing Services Services in Unknown
    - List of specific services with brief descriptions
    - Internal links to related service pages
  - **Why Choose Us**
    - H2: Why Choose Our Unknown Plumbers
    - Licensed and insured statement
    - Years of experience
    - Customer review highlights
    - Response time guarantee
  - **Service Area**
    - H2: Areas We Serve in Unknown
    - List of neighborhoods or ZIP codes
    - Internal links to nearby city pages
  - **FAQ Section**
    - H2: Frequently Asked Questions
    - 5-8 FAQ items with structured data markup
    - FAQPage schema implementation
  - **Pricing Information**
    - H2: Plumbing Services Pricing in Unknown
    - Starting prices or price ranges
    - Factors that affect cost
    - Free estimate call-to-action
  - **Contact & CTA**
    - H2: Call Unknown's Trusted Plumbers Today
    - Phone number (click-to-call)
    - Contact form or booking link
    - Business hours
    - Service area reminder

---

##### 9. Trust / EEAT Section

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add 10 EEAT elements
- **Reason:** EEAT signals (license, insurance, reviews, experience) improve trust signals for local service pages
- **Evidence:** `EEAT template: 10 standard trust elements`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — EEAT elements not verified by crawl

  **EEAT elements to add:**

  - Add or verify business license number and state registration
  - Add plumber certification/badge (e.g., Master Plumber, Journeyman)
  - Include years in business (e.g., "Serving [City] since [Year]")
  - Add customer reviews/testimonials section (minimum 3 reviews)
  - Include service area map or list of ZIP codes served
  - Add response time guarantee (e.g., "60-minute response time")
  - Include insurance information (e.g., "Fully bonded and insured")
  - Add business hours including 24/7 emergency availability
  - Include pricing transparency (at least starting prices or ranges)
  - Add team photos or about-us section for personal trust

---

##### 10. CTA / Phone Placement

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add click-to-call button in hero section (above the fold), sticky header, and footer. Phone number should be visible without scrolling.
- **Reason:** Zero clicks from GSC — page may also have CTA issues
- **Evidence:** `GSC: 376 impressions, 0 clicks`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** MODEL ESTIMATE — prominent CTA can increase call conversion but magnitude is uncalibrated (call CVR unmeasured per-page)
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — current CTA placement not verified by crawl

---

##### 11. Canonical Tag

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure canonical tag points to: /cost/houston
- **Reason:** Prevent duplicate content issues from URL variations
- **Evidence:** `Best practice — canonical should match the page URL`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — canonical not verified by crawl

---

---

### 19. `/plumber-cincinnati-emergency`

**Service:** Emergency Plumbing | **City:** Cincinnati

#### Current Metrics

| Metric | Value | Source |
|--------|-------|--------|
| Impressions | 1,001 | GSC |
| Clicks | 0 | GSC |
| CTR | 0.0000% | GSC |
| Position | N/A | GSC |
| PageRank | 0.000671 | Link Graph |
| In-degree | 1 | Link Graph |
| Is Orphan | False | Link Graph |
| CTR Posterior Mean | 0.000997 | Bayesian |
| CTR CI | [0.000025, 0.003675] | Bayesian |
| Posterior N | 1001 | Bayesian |
| Page Age | 1 days | Gott |
| Maturity Score | 0.0115 | Gott |

#### Forecast

| Field | Value | Classification |
|-------|-------|----------------|
| Expected Calls | 0.5115 | ESTIMATED |
| Calls CI | [0.0000, 3.0000] | ESTIMATED |
| Expected Revenue | $12.45 | ESTIMATED |
| Revenue CI | [$0.00, $94.46] | ESTIMATED |
| Confidence | 99.6%
| Confidence Basis | Bayesian posterior precision (uncalibrated against outcomes) | |

#### Business Value

| Field | Value |
|-------|-------|
| Expected Revenue (MC) | $12.45 |
| Lost Revenue (Opp Loss) | $94.46 |
| Total Revenue Opportunity | $106.91 |
| Lost Clicks | 50 |
| Lost Calls | 2 |
| Revenue Priority | 5/5 |
| Call Priority | 5/5 |
| Traffic Priority | 3/5 |
| Engineering Priority | 5/5 |
| Overall ROI | 83.2% |

#### Ranking Blockers (Root Cause Analysis)

Every blocker is backed by engine evidence. No generic SEO advice.

- **[HIGH] Zero clicks despite impressions**
  - Evidence: `GSC: 1,001 impressions, 0 clicks, CTR=0.0000`
  - Engine: GSC
  - Diagnosis: Title tag and meta description are not compelling enough to earn clicks at current position. SERP snippet is underperforming.
- **[MEDIUM] Very few internal links (in_degree=1)**
  - Evidence: `Link Graph: in_degree=1, PageRank=0.000671`
  - Engine: Link Graph
  - Diagnosis: Only 1 internal link points to this page. Adding more internal links from relevant, high-authority pages will improve crawl frequency and ranking signals.
- **[LOW] CTR posterior mean=0.000997 (CI width=0.003649)**
  - Evidence: `Bayesian Engine: Beta(1, 1002), mean=0.000997, CI=[0.000025, 0.003675], n_obs=1001`
  - Engine: Bayesian
  - Diagnosis: CTR is estimated at 0.0997% based on 1001 impressions. Sufficient evidence for a stable estimate.
- **[LOW] Page is very young (age=1 days, maturity=0.012)**
  - Evidence: `Gott Engine: page_age_days=1, maturity_score=0.0115`
  - Engine: Gott Temporal Prior
  - Diagnosis: Page has not had enough time to accumulate ranking signals. Some ranking underperformance may be due to age, not quality.

#### Implementation Plan

EXACT changes to implement. Every action includes reason, evidence, and expected improvements.

##### 1. Title Tag

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Emergency Plumbing in Cincinnati | 24/7 Licensed Plumbers | Free Estimate
- **Reason:** Zero clicks despite impressions — title tag not compelling
- **Evidence:** `GSC: 1,001 impressions, 0 clicks, CTR=0.0000`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — CTR posterior mean is 0.0997%, improving title could increase CTR toward site median
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — title tag not crawled, current title unknown

---

##### 2. Meta Description

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Need a emergency plumbing in Cincinnati? Licensed, insured plumbers available 24/7. Call now for a free estimate!
- **Reason:** Zero clicks — meta description not earning clicks at current position
- **Evidence:** `GSC: 1,001 impressions, 0 clicks, CTR=0.0000`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — improved meta description could increase CTR from 0.0000% toward site median
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — meta description not crawled

---

##### 3. H1

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Emergency Plumbing in Cincinnati
- **Reason:** Ensure H1 matches primary search intent (city + service)
- **Evidence:** `Taxonomy: service=emergency, city=Cincinnati`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — H1 not crawled, current value unknown

---

##### 4. Internal Links (Inbound)

- **Current:** in_degree=1, PageRank=0.000671
- **Recommended:** Add 8 internal links from related and high-authority pages
- **Reason:** Low internal link equity — page is underlinked (in_degree=1) with PageRank 0.000671
- **Evidence:** `Link Graph: is_orphan=False, in_degree=1, PageRank=0.000671`
- **Expected ranking improvement:** MODEL ESTIMATE — internal links pass PageRank and improve crawl discoverability. Expected improvement in position is UNKNOWN without historical calibration.
- **Expected CTR improvement:** UNKNOWN — depends on resulting position change
- **Expected call improvement:** UNKNOWN — depends on traffic increase and call CVR (unmeasured)
- **Expected revenue improvement:** UNKNOWN — depends on call increase and revenue per call (n=1)
- **Confidence:** MEDIUM — link equity deficit is evidence-backed; magnitude of improvement is uncalibrated

  **Links to add:**

  | Source Page | Target Page | Anchor Text | Placement |
  |-------------|-------------|-------------|-----------|
  | `/plumber-san-diego-emergency` | `/plumber-cincinnati-emergency` | "Emergency Plumbing in Cincinnati" | Within services section (same service cluster) |
  | `/plumber-phoenix-emergency` | `/plumber-cincinnati-emergency` | "Cincinnati emergency plumbing" | Within services section (same service cluster) |
  | `/plumber-san-antonio-emergency` | `/plumber-cincinnati-emergency` | "expert emergency plumbing services in Cincinnati" | Within services section (same service cluster) |
  | `/plumber-san-jose-emergency` | `/plumber-cincinnati-emergency` | "trusted Cincinnati plumbers for emergency plumbing" | Within services section (same service cluster) |
  | `/plumber-sacramento-emergency` | `/plumber-cincinnati-emergency` | "Emergency Plumbing in Cincinnati" | Within services section (same service cluster) |
  | `/plumber/north-carolina/drain-cleaning` | `/plumber-cincinnati-emergency` | "Emergency Plumbing in Cincinnati" | Within relevant content or footer service links |
  | `/plumber/north-carolina/pipe-burst-repai` | `/plumber-cincinnati-emergency` | "Cincinnati emergency plumbing" | Within relevant content or footer service links |
  | `/plumber-rochester-whole-house-repiping` | `/plumber-cincinnati-emergency` | "expert emergency plumbing services in Cincinnati" | Within relevant content or footer service links |

---

##### 5. Internal Links (Outbound)

- **Current:** UNKNOWN — not crawled
- **Recommended:** Add 5 outbound internal links to related service pages
- **Reason:** Linking to related service pages strengthens topical cluster and improves site navigation
- **Evidence:** `Taxonomy: 10 related pages in same cluster`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW

  **Links to add:**

  | Source Page | Target Page | Anchor Text | Placement |
  |-------------|-------------|-------------|-----------|
  | `/plumber-cincinnati-emergency` | `/plumber-san-diego-emergency` | "Emergency Plumbing in San Diego" | Within services section or related services area |
  | `/plumber-cincinnati-emergency` | `/plumber-phoenix-emergency` | "Emergency Plumbing in Phoenix" | Within services section or related services area |
  | `/plumber-cincinnati-emergency` | `/plumber-san-antonio-emergency` | "Emergency Plumbing in San Antonio" | Within services section or related services area |
  | `/plumber-cincinnati-emergency` | `/plumber-san-jose-emergency` | "Emergency Plumbing in San Jose" | Within services section or related services area |
  | `/plumber-cincinnati-emergency` | `/plumber-sacramento-emergency` | "Emergency Plumbing in Sacramento" | Within services section or related services area |

---

##### 6. Schema Markup

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add structured data: LocalBusiness, Service, FAQPage, EmergencyService
- **Reason:** Structured data helps Google understand page content and can earn rich snippets
- **Evidence:** `Service template: Emergency Plumbing requires LocalBusiness, Service, FAQPage, EmergencyService`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — rich snippets can improve CTR but magnitude is uncalibrated for this site
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — schema presence not verified by crawl

---

##### 7. FAQ Section

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add FAQ section with 5 questions and FAQPage schema
- **Reason:** FAQs target long-tail queries, earn FAQ rich results, and improve content depth
- **Evidence:** `Service template: Emergency Plumbing has 5 standard FAQs`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — FAQ rich results can improve CTR but magnitude is uncalibrated
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — FAQ presence not verified by crawl

  **FAQs to add:**

  - How quickly can an emergency plumber arrive?
  - What counts as a plumbing emergency?
  - Do you offer 24/7 emergency plumbing service?
  - How much does emergency plumbing cost?
  - What should I do while waiting for the plumber?

---

##### 8. Entity Coverage

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure these entities are mentioned in content: emergency plumber, 24/7 plumbing service, urgent plumbing repair, burst pipe, flooding
- **Reason:** Entity-rich content improves topical authority and helps Google understand page relevance
- **Evidence:** `Service template: Emergency Plumbing requires entities: emergency plumber, 24/7 plumbing service, urgent plumbing repair...`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — entity coverage not verified by crawl

  **Entities to include:**

  - emergency plumber
  - 24/7 plumbing service
  - urgent plumbing repair
  - burst pipe
  - flooding

---

##### 9. Content Sections

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure all 7 standard content sections are present
- **Reason:** Complete content structure improves topical coverage and user experience
- **Evidence:** `Content template: 7 standard sections for Emergency Plumbing pages`
- **Expected ranking improvement:** MODEL ESTIMATE — content depth is a known ranking factor but magnitude is uncalibrated
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — current content not verified by crawl

  **Content sections to ensure:**

  - **Hero Section**
    - H1 with city + service keyword (e.g., "Emergency Plumber in Cincinnati")
    - Click-to-call button (phone number prominent)
    - Trust badges (licensed, insured, years in business)
    - Service area mention
  - **Services Offered**
    - H2: Our Emergency Plumbing Services in Cincinnati
    - List of specific services with brief descriptions
    - Internal links to related service pages
  - **Why Choose Us**
    - H2: Why Choose Our Cincinnati Plumbers
    - Licensed and insured statement
    - Years of experience
    - Customer review highlights
    - Response time guarantee
  - **Service Area**
    - H2: Areas We Serve in Cincinnati
    - List of neighborhoods or ZIP codes
    - Internal links to nearby city pages
  - **FAQ Section**
    - H2: Frequently Asked Questions
    - 5-8 FAQ items with structured data markup
    - FAQPage schema implementation
  - **Pricing Information**
    - H2: Emergency Plumbing Pricing in Cincinnati
    - Starting prices or price ranges
    - Factors that affect cost
    - Free estimate call-to-action
  - **Contact & CTA**
    - H2: Call Cincinnati's Trusted Plumbers Today
    - Phone number (click-to-call)
    - Contact form or booking link
    - Business hours
    - Service area reminder

---

##### 10. Trust / EEAT Section

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add 10 EEAT elements
- **Reason:** EEAT signals (license, insurance, reviews, experience) improve trust signals for local service pages
- **Evidence:** `EEAT template: 10 standard trust elements`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — EEAT elements not verified by crawl

  **EEAT elements to add:**

  - Add or verify business license number and state registration
  - Add plumber certification/badge (e.g., Master Plumber, Journeyman)
  - Include years in business (e.g., "Serving [City] since [Year]")
  - Add customer reviews/testimonials section (minimum 3 reviews)
  - Include service area map or list of ZIP codes served
  - Add response time guarantee (e.g., "60-minute response time")
  - Include insurance information (e.g., "Fully bonded and insured")
  - Add business hours including 24/7 emergency availability
  - Include pricing transparency (at least starting prices or ranges)
  - Add team photos or about-us section for personal trust

---

##### 11. CTA / Phone Placement

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add click-to-call button in hero section (above the fold), sticky header, and footer. Phone number should be visible without scrolling.
- **Reason:** Zero clicks from GSC — page may also have CTA issues
- **Evidence:** `GSC: 1001 impressions, 0 clicks`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** MODEL ESTIMATE — prominent CTA can increase call conversion but magnitude is uncalibrated (call CVR unmeasured per-page)
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — current CTA placement not verified by crawl

---

##### 12. Canonical Tag

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure canonical tag points to: /plumber-cincinnati-emergency
- **Reason:** Prevent duplicate content issues from URL variations
- **Evidence:** `Best practice — canonical should match the page URL`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — canonical not verified by crawl

---

---

### 20. `/plumber-new-york-emergency`

**Service:** Emergency Plumbing | **City:** New York

#### Current Metrics

| Metric | Value | Source |
|--------|-------|--------|
| Impressions | 141 | GSC |
| Clicks | 0 | GSC |
| CTR | 0.0000% | GSC |
| Position | N/A | GSC |
| PageRank | 0.000671 | Link Graph |
| In-degree | 1 | Link Graph |
| Is Orphan | False | Link Graph |
| CTR Posterior Mean | 0.006993 | Bayesian |
| CTR CI | [0.000178, 0.025643] | Bayesian |
| Posterior N | 141 | Bayesian |
| GA4 Sessions | 1 | GA4 |
| Engagement Rate | 0.0 | GA4 |
| Phone Clicks | 0 | GA4 |
| Page Age | 1 days | Gott |
| Maturity Score | 0.0115 | Gott |

#### Forecast

| Field | Value | Classification |
|-------|-------|----------------|
| Expected Calls | 0.5125 | ESTIMATED |
| Calls CI | [0.0000, 3.0000] | ESTIMATED |
| Expected Revenue | $12.33 | ESTIMATED |
| Revenue CI | [$0.00, $94.46] | ESTIMATED |
| Confidence | 97.5%
| Confidence Basis | Bayesian posterior precision (uncalibrated against outcomes) | |

#### Business Value

| Field | Value |
|-------|-------|
| Revenue Priority | 5/5 |
| Call Priority | 5/5 |
| Traffic Priority | 3/5 |
| Engineering Priority | 5/5 |
| Overall ROI | 82.7% |

#### Ranking Blockers (Root Cause Analysis)

Every blocker is backed by engine evidence. No generic SEO advice.

- **[HIGH] Zero clicks despite impressions**
  - Evidence: `GSC: 141 impressions, 0 clicks, CTR=0.0000`
  - Engine: GSC
  - Diagnosis: Title tag and meta description are not compelling enough to earn clicks at current position. SERP snippet is underperforming.
- **[MEDIUM] Very few internal links (in_degree=1)**
  - Evidence: `Link Graph: in_degree=1, PageRank=0.000671`
  - Engine: Link Graph
  - Diagnosis: Only 1 internal link points to this page. Adding more internal links from relevant, high-authority pages will improve crawl frequency and ranking signals.
- **[MEDIUM] Low engagement rate (0.0%) from 1 sessions**
  - Evidence: `GA4: sessions=1, engagement_rate=0.0000`
  - Engine: GA4
  - Diagnosis: Visitors land on the page but leave quickly. Content quality, page speed, or UX may be poor. Content audit recommended.
- **[MEDIUM] Zero phone click events despite sessions**
  - Evidence: `GA4: sessions=1, phone_click_events=0`
  - Engine: GA4
  - Diagnosis: Visitors are not clicking the call button. CTA placement, visibility, or copy may be poor. Phone number may not be prominently displayed.
- **[LOW] CTR posterior mean=0.006993 (CI width=0.025465)**
  - Evidence: `Bayesian Engine: Beta(1, 142), mean=0.006993, CI=[0.000178, 0.025643], n_obs=141`
  - Engine: Bayesian
  - Diagnosis: CTR is estimated at 0.6993% based on 141 impressions. Sufficient evidence for a stable estimate.
- **[LOW] Page is very young (age=1 days, maturity=0.012)**
  - Evidence: `Gott Engine: page_age_days=1, maturity_score=0.0115`
  - Engine: Gott Temporal Prior
  - Diagnosis: Page has not had enough time to accumulate ranking signals. Some ranking underperformance may be due to age, not quality.

#### Implementation Plan

EXACT changes to implement. Every action includes reason, evidence, and expected improvements.

##### 1. Title Tag

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Emergency Plumbing in New York | 24/7 Licensed Plumbers | Free Estimate
- **Reason:** Zero clicks despite impressions — title tag not compelling
- **Evidence:** `GSC: 141 impressions, 0 clicks, CTR=0.0000`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — CTR posterior mean is 0.6993%, improving title could increase CTR toward site median
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — title tag not crawled, current title unknown

---

##### 2. Meta Description

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Need a emergency plumbing in New York? Licensed, insured plumbers available 24/7. Call now for a free estimate!
- **Reason:** Zero clicks — meta description not earning clicks at current position
- **Evidence:** `GSC: 141 impressions, 0 clicks, CTR=0.0000`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — improved meta description could increase CTR from 0.0000% toward site median
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — meta description not crawled

---

##### 3. H1

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Emergency Plumbing in New York
- **Reason:** Ensure H1 matches primary search intent (city + service)
- **Evidence:** `Taxonomy: service=emergency, city=New York`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — H1 not crawled, current value unknown

---

##### 4. Internal Links (Inbound)

- **Current:** in_degree=1, PageRank=0.000671
- **Recommended:** Add 8 internal links from related and high-authority pages
- **Reason:** Low internal link equity — page is underlinked (in_degree=1) with PageRank 0.000671
- **Evidence:** `Link Graph: is_orphan=False, in_degree=1, PageRank=0.000671`
- **Expected ranking improvement:** MODEL ESTIMATE — internal links pass PageRank and improve crawl discoverability. Expected improvement in position is UNKNOWN without historical calibration.
- **Expected CTR improvement:** UNKNOWN — depends on resulting position change
- **Expected call improvement:** UNKNOWN — depends on traffic increase and call CVR (unmeasured)
- **Expected revenue improvement:** UNKNOWN — depends on call increase and revenue per call (n=1)
- **Confidence:** MEDIUM — link equity deficit is evidence-backed; magnitude of improvement is uncalibrated

  **Links to add:**

  | Source Page | Target Page | Anchor Text | Placement |
  |-------------|-------------|-------------|-----------|
  | `/plumber-san-diego-emergency` | `/plumber-new-york-emergency` | "Emergency Plumbing in New York" | Within services section (same service cluster) |
  | `/plumber-phoenix-emergency` | `/plumber-new-york-emergency` | "New York emergency plumbing" | Within services section (same service cluster) |
  | `/plumber-san-antonio-emergency` | `/plumber-new-york-emergency` | "expert emergency plumbing services in New York" | Within services section (same service cluster) |
  | `/plumber-san-jose-emergency` | `/plumber-new-york-emergency` | "trusted New York plumbers for emergency plumbing" | Within services section (same service cluster) |
  | `/plumber-sacramento-emergency` | `/plumber-new-york-emergency` | "Emergency Plumbing in New York" | Within services section (same service cluster) |
  | `/plumber/north-carolina/drain-cleaning` | `/plumber-new-york-emergency` | "Emergency Plumbing in New York" | Within relevant content or footer service links |
  | `/plumber/north-carolina/pipe-burst-repai` | `/plumber-new-york-emergency` | "New York emergency plumbing" | Within relevant content or footer service links |
  | `/plumber-rochester-whole-house-repiping` | `/plumber-new-york-emergency` | "expert emergency plumbing services in New York" | Within relevant content or footer service links |

---

##### 5. Internal Links (Outbound)

- **Current:** UNKNOWN — not crawled
- **Recommended:** Add 5 outbound internal links to related service pages
- **Reason:** Linking to related service pages strengthens topical cluster and improves site navigation
- **Evidence:** `Taxonomy: 10 related pages in same cluster`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW

  **Links to add:**

  | Source Page | Target Page | Anchor Text | Placement |
  |-------------|-------------|-------------|-----------|
  | `/plumber-new-york-emergency` | `/plumber-san-diego-emergency` | "Emergency Plumbing in San Diego" | Within services section or related services area |
  | `/plumber-new-york-emergency` | `/plumber-phoenix-emergency` | "Emergency Plumbing in Phoenix" | Within services section or related services area |
  | `/plumber-new-york-emergency` | `/plumber-san-antonio-emergency` | "Emergency Plumbing in San Antonio" | Within services section or related services area |
  | `/plumber-new-york-emergency` | `/plumber-san-jose-emergency` | "Emergency Plumbing in San Jose" | Within services section or related services area |
  | `/plumber-new-york-emergency` | `/plumber-sacramento-emergency` | "Emergency Plumbing in Sacramento" | Within services section or related services area |

---

##### 6. Schema Markup

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add structured data: LocalBusiness, Service, FAQPage, EmergencyService
- **Reason:** Structured data helps Google understand page content and can earn rich snippets
- **Evidence:** `Service template: Emergency Plumbing requires LocalBusiness, Service, FAQPage, EmergencyService`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — rich snippets can improve CTR but magnitude is uncalibrated for this site
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — schema presence not verified by crawl

---

##### 7. FAQ Section

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add FAQ section with 5 questions and FAQPage schema
- **Reason:** FAQs target long-tail queries, earn FAQ rich results, and improve content depth
- **Evidence:** `Service template: Emergency Plumbing has 5 standard FAQs`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** MODEL ESTIMATE — FAQ rich results can improve CTR but magnitude is uncalibrated
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — FAQ presence not verified by crawl

  **FAQs to add:**

  - How quickly can an emergency plumber arrive?
  - What counts as a plumbing emergency?
  - Do you offer 24/7 emergency plumbing service?
  - How much does emergency plumbing cost?
  - What should I do while waiting for the plumber?

---

##### 8. Entity Coverage

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure these entities are mentioned in content: emergency plumber, 24/7 plumbing service, urgent plumbing repair, burst pipe, flooding
- **Reason:** Entity-rich content improves topical authority and helps Google understand page relevance
- **Evidence:** `Service template: Emergency Plumbing requires entities: emergency plumber, 24/7 plumbing service, urgent plumbing repair...`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — entity coverage not verified by crawl

  **Entities to include:**

  - emergency plumber
  - 24/7 plumbing service
  - urgent plumbing repair
  - burst pipe
  - flooding

---

##### 9. Content Sections

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure all 7 standard content sections are present
- **Reason:** Complete content structure improves topical coverage and user experience
- **Evidence:** `Content template: 7 standard sections for Emergency Plumbing pages`
- **Expected ranking improvement:** MODEL ESTIMATE — content depth is a known ranking factor but magnitude is uncalibrated
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — current content not verified by crawl

  **Content sections to ensure:**

  - **Hero Section**
    - H1 with city + service keyword (e.g., "Emergency Plumber in New York")
    - Click-to-call button (phone number prominent)
    - Trust badges (licensed, insured, years in business)
    - Service area mention
  - **Services Offered**
    - H2: Our Emergency Plumbing Services in New York
    - List of specific services with brief descriptions
    - Internal links to related service pages
  - **Why Choose Us**
    - H2: Why Choose Our New York Plumbers
    - Licensed and insured statement
    - Years of experience
    - Customer review highlights
    - Response time guarantee
  - **Service Area**
    - H2: Areas We Serve in New York
    - List of neighborhoods or ZIP codes
    - Internal links to nearby city pages
  - **FAQ Section**
    - H2: Frequently Asked Questions
    - 5-8 FAQ items with structured data markup
    - FAQPage schema implementation
  - **Pricing Information**
    - H2: Emergency Plumbing Pricing in New York
    - Starting prices or price ranges
    - Factors that affect cost
    - Free estimate call-to-action
  - **Contact & CTA**
    - H2: Call New York's Trusted Plumbers Today
    - Phone number (click-to-call)
    - Contact form or booking link
    - Business hours
    - Service area reminder

---

##### 10. Trust / EEAT Section

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add 10 EEAT elements
- **Reason:** EEAT signals (license, insurance, reviews, experience) improve trust signals for local service pages
- **Evidence:** `EEAT template: 10 standard trust elements`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — EEAT elements not verified by crawl

  **EEAT elements to add:**

  - Add or verify business license number and state registration
  - Add plumber certification/badge (e.g., Master Plumber, Journeyman)
  - Include years in business (e.g., "Serving [City] since [Year]")
  - Add customer reviews/testimonials section (minimum 3 reviews)
  - Include service area map or list of ZIP codes served
  - Add response time guarantee (e.g., "60-minute response time")
  - Include insurance information (e.g., "Fully bonded and insured")
  - Add business hours including 24/7 emergency availability
  - Include pricing transparency (at least starting prices or ranges)
  - Add team photos or about-us section for personal trust

---

##### 11. CTA / Phone Placement

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Add click-to-call button in hero section (above the fold), sticky header, and footer. Phone number should be visible without scrolling.
- **Reason:** Zero phone click events despite GA4 sessions — CTA not visible or not compelling
- **Evidence:** `GA4: sessions=1, phone_click_events=0`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** MODEL ESTIMATE — prominent CTA can increase call conversion but magnitude is uncalibrated (call CVR unmeasured per-page)
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — current CTA placement not verified by crawl

---

##### 12. Canonical Tag

- **Current:** UNKNOWN — not crawled by this system
- **Recommended:** Ensure canonical tag points to: /plumber-new-york-emergency
- **Reason:** Prevent duplicate content issues from URL variations
- **Evidence:** `Best practice — canonical should match the page URL`
- **Expected ranking improvement:** UNKNOWN
- **Expected CTR improvement:** UNKNOWN
- **Expected call improvement:** UNKNOWN
- **Expected revenue improvement:** UNKNOWN
- **Confidence:** LOW — canonical not verified by crawl

---

---

## Summary

- **Pages with action plans:** 20
- **Total ranking blockers identified:** 94
- **Total implementation actions:** 229

### Evidence Classification Summary

| Classification | Meaning |
|----------------|---------|
| **MEASURED** | Directly observed from GSC, GA4, or Marketcall data |
| **ESTIMATED** | Derived from engine models (Bayesian, Monte Carlo, Markov) using observed data |
| **UNKNOWN** | Cannot be supported by evidence from existing engines |

### Confidence Calibration Status

- **Decision Store:** 0 rows (no historical snapshots)
- **Learning Records:** 0 rows (no outcome-based calibration)
- **Revenue per call:** n=1 approved call ($47.23)
- **Call CVR per page:** UNMEASURED (no per-page call attribution)
- **All dollar forecasts:** UNCALIBRATED MODEL ESTIMATES
- **Ranking/traffic diagnoses:** Evidence-backed from GSC, Opportunity Score, Link Graph

### Important Notes

- Title, meta, H1, schema, FAQ, and content section recommendations are based on service templates.
  Current page content is NOT crawled by this system. A developer must verify current state before implementing.
- Expected improvements marked as **MODEL ESTIMATE** are directionally correct but magnitude is uncalibrated.
- Expected improvements marked as **UNKNOWN** cannot be supported by evidence from existing engines.
- No numbers are fabricated. Every value is either measured, estimated from engines, or marked UNKNOWN.

---

*Generated by URL Action Plan Engine at 2026-08-07T01:04:00.172712+00:00*
*Uses only existing engine outputs. No new mathematical models.*