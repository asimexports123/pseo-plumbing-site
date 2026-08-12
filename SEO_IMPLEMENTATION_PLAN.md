# SEO Implementation Plan — YoHomeFix.com

**Source:** `TOP20_SEO_AUDIT.md` (approved diagnostic document)  
**Scope:** Top 20 URL roadmap derived from live crawl and competitor analysis  
**Constraint:** This is a planning document only. No production code, no content generation, and no deployment is included.

---

## 1. How to Read This Plan

Each recommendation is classified into one of three buckets:

- **SAFE TO IMPLEMENT** — Can be built and released with only engineering/UX review.
- **REQUIRES BUSINESS VALIDATION** — Needs confirmed business data, legal review, or content approval before release.
- **REJECT** — Not supported by the YoHomeFix operating model or would require fabricated data.

For every recommendation the following fields are provided:

| Field | Meaning |
|-------|---------|
| **Priority** | Suggested sequencing (P0 = first, P3 = last). |
| **Expected SEO Impact** | Estimated ranking/relevance lift. |
| **Risk** | Technical, legal, or brand risk if implemented incorrectly. |
| **Engineering Effort** | Low / Medium / High. |
| **Dependencies** | Data, assets, or approvals required. |

---

## 2. SAFE TO IMPLEMENT

These items can be implemented using existing site infrastructure and do not depend on unverified business facts.

| # | Recommendation | Priority | Expected SEO Impact | Risk | Engineering Effort | Dependencies |
|---|----------------|----------|---------------------|------|--------------------|--------------|
| 1 | **Add `WebSite` JSON-LD schema** (name, URL, `SearchAction`/`potentialAction`) to every page | P1 | Medium — improves brand entity recognition and sitelinks eligibility | Very Low | Low | Brand name, official homepage URL, site search URL (optional) |
| 2 | **Add `Organization` JSON-LD schema** (name, URL, logo, contact phone, sameAs social profiles) to every page | P1 | Medium — strengthens E-E-A-T and Knowledge Graph signals | Very Low | Low | Logo asset URL, social profile URLs, main phone number |
| 3 | **Add `FAQPage` schema with `Question`/`Answer` pairs** once FAQ content is supplied | P0 | High — directly closes the largest schema gap vs. competitors; eligible for rich results | Low | Medium | Business-approved Q&A copy per service/city (no copy generation here) |
| 4 | **Add `Service` schema markup** describing the plumbing services offered, using generic service descriptions and `areaServed` references | P1 | Medium — helps Google understand service-to-location intent | Low | Low-Medium | Service list and city coverage list |
| 5 | **Add sticky/mobile CTA** (persistent click-to-call bar on mobile viewport) | P0 | Medium-High — improves mobile conversion and user signals | Low | Low-Medium | Approved phone number, UI/UX design sign-off |
| 6 | **BreadcrumbList improvements** — verify every page has an accurate, hierarchical `BreadcrumbList` and expose it visibly above the fold | P1 | Medium — improves crawl navigation and snippet presentation | Very Low | Low | Confirmed URL hierarchy per page |
| 7 | **Internal linking improvements** — cross-link between related city/service pages and from high-link pages to priority money pages | P1 | Medium — distributes PageRank and improves topical coverage | Low | Low-Medium | Site graph of related pages; anchor text policy |
| 8 | **Standardize visible EEAT text block** ("Licensed & Insured", years of experience if already true) with consistent HTML placement | P1 | Medium — reinforces trust signals already present in crawl | Very Low | Low | Business confirmation that wording is legally accurate |
| 9 | **Add `ImageObject` and `VideoObject` schema** for existing media assets | P2 | Low-Medium — supports rich media snippets where applicable | Very Low | Low | Image/video URLs, captions, license metadata |

---

## 2.1 Title, H1, Meta Description, and Keyword Strategy

The live crawl shows every target page uses the same generic title template (`Service City ST | 24/7 | YoHomeFix`) and a matching H1 (`Emergency [Service] in City, ST`). Competitors like Roto-Rooter, Mr. Rooter, and Bob Oates use benefit-driven titles, intent modifiers, and distinct H1s. The following roadmap addresses that gap **without generating replacement titles or content**.

| # | Recommendation | Priority | Expected SEO Impact | Risk | Engineering Effort | Dependencies |
|---|----------------|----------|---------------------|------|--------------------|--------------|
| 11 | **Audit and inventory** all 20 title tags, H1s, H2s, and meta descriptions against primary keywords | P0 | High — baseline for CTR and relevance improvements | Very Low | Low | Crawl export of title/H1/meta; keyword mapping |
| 12 | **Create a title/H1 playbook** with rules: one unique H1 per page, title ≤ 60 chars, H1 not identical to title, include primary keyword + intent modifier, lead with value/benefit | P0 | High — directly improves ranking and click-through signals | Low | Low | Brand voice guidelines; keyword list; competitor title examples from audit |
| 13 | **Optimize meta descriptions for CTR** (150–160 chars, active voice, CTA, benefit, no duplicate) using business-approved copy | P0 | Medium-High — improves CTR and snippet control | Low | Low-Medium | Approved meta description copy per page; no copy generation here |
| 14 | **Keyword cannibalization audit and entity mapping** — ensure each of the 20 pages targets one primary keyword and does not overlap with another | P0 | Medium-High — prevents self-competition and improves topical authority | Low | Medium | Keyword-to-URL matrix; GSC query data if available |
| 15 | **Intent-modifier expansion** — add modifiers proven in competitor titles ("24/7", "emergency", "licensed", "near me", "same day") only where already true and brand-approved | P1 | Medium — captures long-tail and local-intent queries | Low | Low | Brand copy guide; legal fact-check of modifiers |
| 16 | **A/B test title variants** on high-traffic pages (e.g., `/plumber-seattle-emergency`, `/plumber-oklahoma-city-drain-cleaning`) using controlled SEO test framework or time-sliced ranking data | P2 | Medium — data-driven title optimization | Low-Medium | Medium | SEO testing tool or GSC position/CTR data; analytics access |
| 17 | **H2/H3 heading consolidation** — reduce 29 shallow H2s into fewer, deeper topical sections and a dedicated FAQ H2 (moved to this section because it supports keyword entity focus) | P1 | Medium — improves readability, entity focus, and reduces thin-section risk | Low | Medium | Content strategy for section merge; no new copy generated |

---

## 3. REQUIRES BUSINESS VALIDATION

These items improve local-pack and E-E-A-T signals but cannot be released without verified business data.

| # | Recommendation | Priority | Expected SEO Impact | Risk | Engineering Effort | Dependencies |
|---|----------------|----------|---------------------|------|--------------------|--------------|
| 1 | **Add `LocalBusiness` schema** for each city page | P0 | High — core local-pack ranking signal | Medium-High | Medium | Legal/business confirmation that YoHomeFix operates as a local business in each listed city; service area policy |
| 2 | **Add `PostalAddress` per city page** | P0 | High — NAP consistency and local-pack relevance | High | Low | Verified physical or registered office address for each city; legal review of address usage |
| 3 | **Add `GeoCoordinates` per city page** | P1 | Medium-High — maps and local pack proximity signal | High | Low | Verified latitude/longitude for each address; privacy review if home addresses are used |
| 4 | **Add `Review` and `AggregateRating` schema** | P1 | High — review stars and rating rich snippets | High | Medium-High | Real review collection platform/API; legal compliance with FTC/consumer review guidelines; cannot fabricate ratings |
| 5 | **Display license numbers visibly on page** and in schema | P1 | Medium — strong E-E-A-T and trust signal | High | Low | License numbers for each jurisdiction; legal/compliance confirmation they are current and valid |
| 6 | **Display physical office / NAP block** in the page footer or hero | P0 | High — local SEO and user trust | High | Low | Confirmed address and phone number for each market; privacy/legal review |
| 7 | **Add `Plumber`/`Person` schema for technicians** with credentials | P2 | Medium — supports "expert" E-E-A-T claims | Medium | Medium | Employee consent, license verification, bio content |
| 8 | **Add `OpeningHoursSpecification` schema** | P2 | Medium — useful for local pack and voice search | Medium | Low | Verified 24/7 or market-specific hours; operations confirmation |
| 9 | **Add `PriceSpecification`/`Offer` schema** if pricing exists | P2 | Medium — service clarity and potential rich results | Medium | Low-Medium | Approved, legally binding price ranges or estimates |
| 10 | **Content expansion for depth and entity coverage** (city-specific FAQs, service process, neighborhood sub-entities) | P1 | High — closes content-depth gap vs. competitors | Medium | High | Subject-matter expert input, business-approved copy, legal review of claims |

---

## 4. REJECT

These recommendations would either require fabricated data or are incompatible with the YoHomeFix business model as observed in the audit.

| # | Recommendation | Reason for Rejection |
|---|----------------|----------------------|
| 1 | **Generate fake customer reviews or ratings** to populate `AggregateRating` | Violates Google guidelines and FTC regulations; unsupported by business data. |
| 2 | **Create phantom local offices / fake `PostalAddress` and `GeoCoordinates`** | Misleading to users and search engines; unsupported by verified locations. |
| 3 | **Publish unverified license numbers** | Legal/compliance risk; license numbers must be real and jurisdiction-specific. |
| 4 | **Fabricate years-in-business or BBB/accreditation claims** | EEAT signals must be verifiable; audit already found these claims present on most pages. |
| 5 | **Pad word count with low-value filler** to match competitor averages | No SEO value; risks quality degradation and user bounce. Content must be substantive. |
| 6 | **Keyword-stuff city/entity names beyond natural usage** | Against spam policies; audit shows entity coverage is already adequate. |

---

## 5. Recommended Implementation Sequence

### Phase 0 — Title & Snippet Foundation (Week 0)
1. Inventory all 20 titles, H1s, meta descriptions, and primary keywords (2.1 #11)
2. Create title/H1 playbook and meta description template (2.1 #12, #13)
3. Keyword cannibalization and entity mapping check (2.1 #14)

### Phase 1 — Foundation (Weeks 1-2)
1. Roll out updated title/H1/meta templates on test pages, then to all 20 pages after review (2.1 #11-13)
2. `WebSite` + `Organization` JSON-LD (SAFE #1, #2)
3. Sticky mobile CTA (SAFE #5)
4. BreadcrumbList hardening (SAFE #6)
5. Internal linking policy and quick wins (SAFE #7)

### Phase 2 — Content & Schema (Weeks 3-5)
1. FAQ content approval and `FAQPage` schema (SAFE #3)
2. `Service` schema + `areaServed` (SAFE #4)
3. H2/H3 consolidation and heading audit (2.1 #17)
4. Standardize EEAT text block (SAFE #8)

### Phase 3 — Local & Validation (Weeks 6-8)
1. Business validation of city-specific NAP/addresses (REQUIRES #6)
2. `LocalBusiness`, `PostalAddress`, `GeoCoordinates` (REQUIRES #1, #2, #3)
3. License numbers and `Plumber`/`Person` schema (REQUIRES #5, #7)
4. `Review`/`AggregateRating` integration (REQUIRES #4)

### Phase 4 — Optimization (Weeks 9-10)
1. `OpeningHoursSpecification` and `Offer`/`PriceSpecification` (REQUIRES #9, #10)
2. `ImageObject`/`VideoObject` schema (SAFE #10)
3. Content expansion for depth (REQUIRES #10)

---

## 6. Per-URL Applicability

All 20 audited URLs share the same template, therefore the recommendations above apply globally. The following pages have the highest priority for `LocalBusiness`/`PostalAddress` validation because they showed the strongest local-pack competitor pressure:

- `/plumber-oklahoma` (lowest word count, no "years" signal)
- `/plumber-seattle-emergency` (competitors use `Plumber`, `AggregateRating`, `PostalAddress`)
- `/plumber-oklahoma-city-drain-cleaning` (competitors use `ImageObject`, `WebPage`, `WebSite`)
- `/plumber-baltimore-drain-cleaning` (competitor `Mr. Rooter` has 3,121 words and FAQ/Local signals)
- `/plumber-summertown-emergency` (competitors use `Service` and `Offer` schemas)

---

## 7. Risk Summary

- **Low overall technical risk** for SAFE items.
- **Highest risk** for REQUIRES items is legal/compliance: addresses, licenses, reviews, and hours must be real and accurate.
- **No rejected item should be implemented** under any circumstance.

---

## 8. Definitions

- **E-E-A-T:** Experience, Expertise, Authoritativeness, Trustworthiness.
- **NAP:** Name, Address, Phone number.
- **JSON-LD:** JavaScript Object Notation for Linked Data, the preferred schema format for Google.
- **Local Pack:** Map-based search results for local service queries.
