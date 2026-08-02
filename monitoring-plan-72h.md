# YoHomeFix Emergency Lead Generation — 72-Hour Monitoring Plan

## Goal
Measure whether the deployed title, meta, CTA, and sticky-mobile changes increase qualified calls.

## Where to measure

| Metric | Source | Frequency |
|---|---|---|
| Impressions & CTR | Google Search Console | Daily |
| Organic sessions | GA4 | Daily |
| `call_click` events by label | GA4 → Engagement → Events | Daily |
| Actual calls | Marketcall dashboard | Daily |
| Top landing pages | GA4 → Pages and screens | Daily |
| Call conversion rate | GA4 calls / organic sessions | Daily |

## GA4 `call_click` event labels to watch

From `pages/_app.js` and the site CTA components, the following labels fire:

- `sticky-mobile`
- `sticky-mobile-home`
- `nav-mobile`
- `nav-desktop`
- `hero`
- `hero-home`
- `secondary-cta`
- `secondary-cta-sms`
- `mid-page-cta`
- `bottom-cta`
- `quote-form-call`
- `exit-intent-call`
- `trust-bar-call`

Compare the daily volume of each label before and after the deploy.

## 72-hour checkpoint schedule

### 0h (deploy)
- [x] Build successful
- [x] 5 test pages verified (title, meta, CTA, sticky, tel:1, Marketcall)
- [x] IndexNow submitted

### 24h
- [ ] Record GSC impressions/CTR for the top 5 emergency pages
- [ ] Record GA4 `call_click` count and top labels
- [ ] Record Marketcall calls
- [ ] Record organic sessions and top 10 landing pages

### 48h
- [ ] Re-check GSC (look for CTR change)
- [ ] Re-check GA4 `call_click` event count vs baseline
- [ ] Re-check Marketcall calls
- [ ] Note any anomalies (page drops, 404s, call tracking failures)

### 72h
- [ ] Compile final delta: calls before vs after
- [ ] Decide: hold (no more design changes) or iterate on the highest-CTR pages

## Manual data log template

```
Date: __________
GSC impressions (emergency pages): ________
GSC CTR (emergency pages): ________%
GA4 organic sessions: ________
GA4 call_click events: ________
Top call_click labels: ________________
Marketcall calls: ________
Top landing pages: ________________
```

## Automated spot-check

Run the live verification script any time to confirm the build is still being served:

```powershell
python verify-live.py
```

It will report title, meta, CTA, and Marketcall tracking on the 5 test cities.
