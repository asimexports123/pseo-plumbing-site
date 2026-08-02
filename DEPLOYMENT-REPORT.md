# YoHomeFix Deployment Report

**Date:** 2026-07-30  
**Deployment type:** Production (Vercel)  
**Production URL:** https://yohomefix.com  
**Build status:** Success (exit code 0)  
**Live verification status:** Pass

---

## Files Changed

- `components/PlumberPage.js` — H1 and `<title>` tag updates for `drain-cleaning` and `emergency` pages.
- `verify-live.py` — updated to verify the top 5 priority pages and extract H1 / canonical.
- `priority-reindex-urls.txt` — new file containing the 20 priority URLs for Google Search Console reindexing.

---

## Production Deployment Status

| Step | Status | Details |
|---|---|---|
| Local build | Pass | `npm run build` completed with exit code 0. 32,558 static pages generated. |
| Vercel production deploy | Pass | `npx vercel --prod` completed with exit code 0. Aliased to `https://yohomefix.com`. |
| Build errors | None | No compile or build errors. |
| Hydration/runtime errors | None detected | All verified pages returned valid HTML, viewport meta, Marketcall, and mobile sticky CTA. |
| Rollback required | No | No rollback needed. |

---

## Live URLs Verified

The following URLs were checked live with cache-busting:

1. https://yohomefix.com/plumber-oklahoma-city-drain-cleaning
2. https://yohomefix.com/plumber-baltimore-drain-cleaning
3. https://yohomefix.com/plumber-san-diego-emergency
4. https://yohomefix.com/plumber-phoenix-emergency
5. https://yohomefix.com/plumber-san-antonio-emergency

---

## Before vs After

### Drain Cleaning Pages

| Page | Before H1 | After H1 | Before Title | After Title |
|---|---|---|---|---|
| Oklahoma City | `Emergency Drain Service in Oklahoma City, OK` | `Drain Cleaning in Oklahoma City, OK` | `Emergency Drain Service in Oklahoma City, OK \| 24/7 Drain & Sewer Backup \| YoHomeFix` | `Drain Cleaning in Oklahoma City \| 24/7 Emergency \| YoHomeFix` |
| Baltimore | `Emergency Drain Service in Baltimore, MD` | `Drain Cleaning in Baltimore, MD` | `Emergency Drain Service in Baltimore, MD \| 24/7 Drain & Sewer Backup \| YoHomeFix` | `Drain Cleaning in Baltimore \| 24/7 Emergency \| YoHomeFix` |

### Emergency Plumber Pages

| Page | Before H1 | After H1 | Before Title | After Title |
|---|---|---|---|---|
| San Diego | `Emergency Plumber in San Diego, CA` | `24-Hour Emergency Plumber in San Diego, CA` | `Emergency Plumber in San Diego, CA \| 24-Hour Emergency Plumber \| YoHomeFix` | `Emergency Plumber in San Diego \| 24-Hour \| YoHomeFix` |
| Phoenix | `Emergency Plumber in Phoenix, AZ` | `24-Hour Emergency Plumber in Phoenix, AZ` | `Emergency Plumber in Phoenix, AZ \| 24-Hour Emergency Plumber \| YoHomeFix` | `Emergency Plumber in Phoenix \| 24-Hour \| YoHomeFix` |
| San Antonio | `Emergency Plumber in San Antonio, TX` | `24-Hour Emergency Plumber in San Antonio, TX` | `Emergency Plumber in San Antonio, TX \| 24-Hour Emergency Plumber \| YoHomeFix` | `Emergency Plumber in San Antonio \| 24-Hour \| YoHomeFix` |

---

## Live Verification Evidence

Output from `python verify-live.py` against the deployed production site:

```
plumber-oklahoma-city-drain-cleaning:
  url:     https://yohomefix.com/plumber-oklahoma-city-drain-cleaning?ver=deploy-20260730
  title:   Drain Cleaning in Oklahoma City | 24/7 Emergency | YoHomeFix
  h1:      Drain Cleaning in Oklahoma City, OK
  canonical: https://yohomefix.com/plumber-oklahoma-city-drain-cleaning
  desc:    Clogged drain or sewer backup in Oklahoma City, OK? 24/7 drain cleaning — licensed plumber sent fast. Upfront pricing before any work. Call ...
  viewport: True, tel:1 links: 9, raw phone: False, sticky class: True, marketcall: True, "CALL NOW" count: 1

plumber-baltimore-drain-cleaning:
  url:     https://yohomefix.com/plumber-baltimore-drain-cleaning?ver=deploy-20260730
  title:   Drain Cleaning in Baltimore | 24/7 Emergency | YoHomeFix
  h1:      Drain Cleaning in Baltimore, MD
  canonical: https://yohomefix.com/plumber-baltimore-drain-cleaning
  desc:    Clogged drain or sewer backup in Baltimore, MD? 24/7 drain cleaning — licensed plumber sent fast. Upfront pricing before any work. Call YoHo...
  viewport: True, tel:1 links: 9, raw phone: False, sticky class: True, marketcall: True, "CALL NOW" count: 1

plumber-san-diego-emergency:
  url:     https://yohomefix.com/plumber-san-diego-emergency?ver=deploy-20260730
  title:   Emergency Plumber in San Diego | 24-Hour | YoHomeFix
  h1:      24-Hour Emergency Plumber in San Diego, CA
  canonical: https://yohomefix.com/plumber-san-diego-emergency
  desc:    Need a 24-hour emergency plumber in San Diego, CA now? Burst pipe, flooding, no water, or sewer backup — YoHomeFix sends a licensed plumber ...
  viewport: True, tel:1 links: 9, raw phone: False, sticky class: True, marketcall: True, "CALL NOW" count: 1

plumber-phoenix-emergency:
  url:     https://yohomefix.com/plumber-phoenix-emergency?ver=deploy-20260730
  title:   Emergency Plumber in Phoenix | 24-Hour | YoHomeFix
  h1:      24-Hour Emergency Plumber in Phoenix, AZ
  canonical: https://yohomefix.com/plumber-phoenix-emergency
  desc:    Need a 24-hour emergency plumber in Phoenix, AZ now? Burst pipe, flooding, no water, or sewer backup — YoHomeFix sends a licensed plumber in...
  viewport: True, tel:1 links: 9, raw phone: False, sticky class: True, marketcall: True, "CALL NOW" count: 1

plumber-san-antonio-emergency:
  url:     https://yohomefix.com/plumber-san-antonio-emergency?ver=deploy-20260730
  title:   Emergency Plumber in San Antonio | 24-Hour | YoHomeFix
  h1:      24-Hour Emergency Plumber in San Antonio, TX
  canonical: https://yohomefix.com/plumber-san-antonio-emergency
  desc:    Need a 24-hour emergency plumber in San Antonio, TX now? Burst pipe, flooding, no water, or sewer backup — YoHomeFix sends a licensed plumbe...
  viewport: True, tel:1 links: 9, raw phone: False, sticky class: True, marketcall: True, "CALL NOW" count: 1
```

### Verification Checks Passed

- H1: all 5 pages contain the new exact-match H1.
- Title: all 5 pages contain the new keyword-first title.
- Canonical: unchanged for each URL.
- URL: unchanged.
- Layout: no broken HTML structure; viewport meta present; mobile sticky CTA present.
- Marketcall: `marketcall` script present; `tel:1` links present; raw phone numbers absent.
- Hydration/runtime errors: none detected in verification.

---

## Priority URLs for Google Search Console Reindexing

Automated submission was not performed because Google Search Console API access is not configured. The exact URL list has been prepared in `priority-reindex-urls.txt` for manual submission.

Full list of 20 priority URLs:

1. https://yohomefix.com/plumber-oklahoma-city-drain-cleaning
2. https://yohomefix.com/plumber-baltimore-drain-cleaning
3. https://yohomefix.com/plumber-san-diego-emergency
4. https://yohomefix.com/plumber-phoenix-emergency
5. https://yohomefix.com/plumber-san-antonio-emergency
6. https://yohomefix.com/plumber-san-jose-emergency
7. https://yohomefix.com/plumber-sacramento-emergency
8. https://yohomefix.com/plumber-cincinnati-emergency
9. https://yohomefix.com/plumber-seattle-emergency
10. https://yohomefix.com/plumber-dallas-emergency
11. https://yohomefix.com/plumber-summertown-emergency
12. https://yohomefix.com/plumber-austin-emergency
13. https://yohomefix.com/plumber-chicago-emergency
14. https://yohomefix.com/plumber-los-angeles-emergency
15. https://yohomefix.com/plumber-milwaukee-emergency
16. https://yohomefix.com/plumber-indianapolis-emergency
17. https://yohomefix.com/plumber-minneapolis-water-heater-repair
18. https://yohomefix.com/plumber-baltimore-emergency
19. https://yohomefix.com/plumber-new-orleans-water-heater-repair
20. https://yohomefix.com/plumber-cleveland-water-heater-repair

---

## Deployment Issues

None. Build and deploy completed successfully. Live verification passed on all 5 priority pages.

---

## Next Steps

1. Submit the 20 URLs in `priority-reindex-urls.txt` to Google Search Console for reindexing.
2. Monitor the top 20 pages in Google Search Console for the next 14–30 days.
3. Track average position, impressions, and clicks for target queries:
   - `drain cleaning [city]`
   - `emergency plumber [city]`
   - `24 hour plumber [city]`
   - `water heater repair [city]`
4. If no measurable improvement after 14 days, the remaining gap is authority (backlinks/citations), not on-page signals.
