# Sprint #9 — Free Traffic Channels Report

## WS1: Low-Competition SERP Mining — 20 Easiest Opportunities

Based on SERP analysis of existing 2,233 city-service pages:

| # | URL | Service | City | Competition Level | Call Intent |
|---|-----|---------|------|-------------------|-------------|
| 1 | plumber-oklahoma-city-ok-sewer-line-repair | Sewer Line | OKC | Medium (5 local competitors) | High |
| 2 | plumber-oklahoma-city-ok-sump-pump-repair | Sump Pump | OKC | Medium (5 competitors) | High |
| 3 | plumber-oklahoma-city-ok-slab-leak-repair | Slab Leak | OKC | Medium (5 competitors) | High |
| 4 | plumber-new-orleans-la-garbage-disposal-repair | Garbage Disposal | NOLA | Medium (5 competitors) | Medium |
| 5 | plumber-baltimore-md-faucet-repair | Faucet | Baltimore | Medium (5 competitors) | Medium |
| 6 | plumber-cleveland-oh-toilet-repair | Toilet | Cleveland | Medium (5 competitors) | High |
| 7 | plumber-memphis-tn-water-line-repair | Water Line | Memphis | Medium (5 competitors) | High |
| 8 | plumber-san-antonio-tx-water-softener-repair | Water Softener | San Antonio | High (specialists) | Medium |
| 9 | plumber-birmingham-al-garbage-disposal-repair | Garbage Disposal | Birmingham | Low-Medium | Medium |
| 10 | plumber-mobile-al-garbage-disposal-repair | Garbage Disposal | Mobile | Low | Medium |
| 11 | plumber-chattanooga-tn-sump-pump-repair | Sump Pump | Chattanooga | Low (generic sites) | High |
| 12 | plumber-knoxville-tn-sump-pump-repair | Sump Pump | Knoxville | Low (generic sites) | High |
| 13 | plumber-savannah-ga-sump-pump-repair | Sump Pump | Savannah | Low (generic sites) | High |
| 14 | plumber-phoenix-az-water-softener-repair | Water Softener | Phoenix | Medium | Medium |
| 15 | plumber-las-vegas-nv-water-softener-repair | Water Softener | Las Vegas | Medium | Medium |
| 16 | plumber-albuquerque-nm-water-softener-repair | Water Softener | Albuquerque | Low-Medium | Medium |
| 17 | plumber-montgomery-al-garbage-disposal-repair | Garbage Disposal | Montgomery | Low | Medium |
| 18 | plumber-indianapolis-in-water-line-repair | Water Line | Indianapolis | Medium | High |
| 19 | plumber-columbus-oh-water-line-repair | Water Line | Columbus | Medium | High |
| 20 | plumber-oklahoma-city-ok-garbage-disposal-repair | Garbage Disposal | OKC | Low-Medium | Medium |

**Key finding:** Sump pump repair in TN/GA cities (Chattanooga, Knoxville, Savannah) has weakest SERPs — mostly generic directory sites. Garbage disposal repair in Alabama cities also weak.

## WS2: Free Non-Google Traffic Channels

### Executed
- **llms.txt** created at `/public/llms.txt` — AI answer engine discovery protocol
- **IndexNow API** endpoint created at `/pages/api/indexnow.js` + key file at `/public/yohomefixindexnow2025.txt`
- **IndexNow submission script** at `/scripts/submit-indexnow.js` (2,988 URLs ready — returned 403 because key file not yet deployed)

### Ready (Requires Deployment)
- IndexNow batch submission — re-run `node scripts/submit-indexnow.js` after deploy
- Bing Webmaster Tools — requires manual site verification at bing.com/webmasters

### Requires Access
- Bing Webmaster Tools account setup (needs user login)
- Pinterest business account for plumbing infographics
- YouTube channel for how-to videos
- Nextdoor business profile for local neighborhoods

### Rejected
- Mass posting on forums (spam risk)
- Paid traffic of any kind

## WS3: AI Answer-Engine Discovery Audit

### Findings
- **robots.txt**: Clean, allows all crawlers, sitemaps declared ✓
- **Organization schema**: Present with contact info, hours, areaServed ✓
- **Enhanced**: Added `sameAs` property and expanded `knowsAbout` list to all 15 services
- **llms.txt**: Created with full entity description, services, coverage, contact info
- **WebApplication schema**: Added to diagnostic tool page
- **Sitemap**: All 2,988 URLs in sitemap, diagnostic tool added

### Status: EXECUTED (schema + llms.txt improvements deployed in code)

## WS4: Emergency Plumbing Utility Tool — BUILT

### File: `/pages/whats-wrong-with-my-plumbing.js`
- Interactive symptom checker with 7 common plumbing emergencies
- Each symptom provides: immediate safety steps, likely problem category, urgency level
- City selector links to relevant service page
- Call CTA with urgency-based styling (emergency=red, urgent=orange, same-day=yellow, schedule=blue)
- WebApplication schema.org structured data
- Mobile sticky call bar
- Added to sitemap with priority 0.9
- Linked from homepage with dedicated CTA section

### Build Status: ✓ Compiled successfully

## WS5: Content Distribution Concepts (30)

1. **Pinterest**: "7 Signs Your Water Heater Is Failing" infographic → water heater repair pages
2. **Pinterest**: "Burst Pipe? Do This in 60 Seconds" emergency checklist → emergency plumbing pages
3. **YouTube**: "How to Shut Off Your Main Water Valve" 90s video → homepage
4. **YouTube**: "Toilet Running? 3 Fixes Before Calling a Plumber" → toilet repair pages
5. **Reddit r/HomeImprovement**: "Water hardness data for 155 US cities" → research page
6. **Reddit r/Plumbing**: "US water hardness plumbing risk dataset" → research page
7. **Nextdoor**: Emergency plumbing tips for specific neighborhoods → city pages
8. **Quora**: Answer "How do I know if I have a slab leak?" → slab leak repair pages
9. **Quora**: Answer "What causes sewer backup in older homes?" → sewer line repair pages
10. **Hacker News**: "Open dataset: US water hardness and plumbing infrastructure by city" → research page
11. **YouTube Shorts**: "Garbage disposal humming but not spinning? Do this" → disposal repair
12. **YouTube Shorts**: "Sump pump not turning on? Check this first" → sump pump repair
13. **Pinterest**: "Seasonal Plumbing Checklist" seasonal board → guides pages
14. **Pinterest**: "Hard Water Map of the US" data visualization → research page
15. **Reddit r/DIY**: "When to call a plumber vs DIY" decision guide → guides
16. **Quora**: "How much does drain cleaning cost?" → cost guide pages
17. **Quora**: "Is a leaking water heater dangerous?" → water heater repair
18. **YouTube**: "What's Wrong With My Plumbing? — Free Online Tool" demo → diagnostic tool
19. **TikTok**: "3 sounds your plumbing makes that mean trouble" → emergency pages
20. **TikTok**: "Water pressure dropping? Here's why" → water line repair
21. **Pinterest**: "Plumbing Emergency Preparedness Kit" checklist → homepage
22. **Reddit r/RealEstate**: "Plumbing inspection checklist for home buyers" → guides
23. **Quora**: "Can tree roots really break sewer lines?" → sewer line repair
24. **YouTube**: "Sewer Line vs Drain Cleaning: What's the Difference?" → drain cleaning
25. **Nextdoor**: "Frozen pipe prevention tips for [city]" seasonal → city pages
26. **Pinterest**: "Garbage Disposal Do's and Don'ts" infographic → disposal repair
27. **Reddit r/HomeImprovement**: "Slab leak signs every homeowner should know" → slab leak
28. **YouTube**: "Water Softener Not Regenerating? Common Causes" → softener repair
29. **Quora**: "How long do copper pipes last?" → leak repair pages
30. **TikTok**: "Use our free plumbing diagnostic tool" app demo → diagnostic tool

## WS6: Bing/Microsoft Discovery

### Status: REQUIRES DEPLOYMENT + MANUAL ACTION
- **Bing indexing**: Zero pages currently indexed (confirmed via site:yohomefix.com search)
- **IndexNow protocol**: Implemented and ready — API endpoint + key file + submission script
- **Submission attempted**: 2,988 URLs submitted, 403 returned (key file not yet live on domain)
- **Action needed**: 
  1. Deploy site (key file at `/yohomefixindexnow2025.txt` must be accessible)
  2. Re-run: `node scripts/submit-indexnow.js`
  3. Verify at Bing Webmaster Tools: https://www.bing.com/webmasters
  4. Submit sitemaps manually in BWT

## WS7: Local Community Q&A Platforms

### Legitimate Platforms for Genuine Participation
1. **Nextdoor** — Neighborhood-specific, high trust, homeowners ask plumbing questions. Requires business profile.
2. **Reddit r/HomeImprovement** (4M+ members) — Answer plumbing questions genuinely, link when relevant
3. **Reddit r/Plumbing** (200K+ members) — Professional discussions, share research data
4. **Quora** — Answer homeowner plumbing questions, link to relevant service pages
5. **Reddit r/RealEstate** — Home inspection plumbing questions
6. **Reddit r/DIY** — When to call a plumber vs DIY guidance

### Rules for Participation
- Answer genuinely and helpfully first, link only when directly relevant
- No mass posting or copy-paste
- Follow each platform's self-promotion guidelines
- Focus on providing value, not driving traffic

## WS8: Traffic-to-Call Path Validation

### All opportunities validated for call conversion:
- **Diagnostic tool**: Emergency/urgent symptoms show red call CTA with phone number
- **Homepage**: 3 call CTAs (hero, mid-page, sticky mobile bar)
- **City-service pages**: Existing call CTAs with MarketCall tracking
- **Research page**: Existing call CTA
- **Phone number**: +1 (844) 934-4386 on all pages
- **MarketCall tracking**: Active on all pages via _app.js

### Best Immediate Traffic-to-Call Opportunity
**The diagnostic tool** (`/whats-wrong-with-my-plumbing`) — captures homeowners at the moment of plumbing crisis, provides immediate value, and routes to call CTA based on urgency level. This is the single best new free traffic channel because:
1. Targets high-intent "what's wrong with my plumbing" searches
2. Provides standalone value (safety guidance)
3. Converts to calls via urgency-based CTAs
4. Indexable by Google, Bing, and AI engines
5. Linkable from social/content distribution

## Production Changes Made

### Files Created
1. `pages/whats-wrong-with-my-plumbing.js` — Emergency plumbing diagnostic tool
2. `public/llms.txt` — AI answer engine discovery file
3. `public/yohomefixindexnow2025.txt` — IndexNow key verification file
4. `pages/api/indexnow.js` — IndexNow API endpoint
5. `scripts/submit-indexnow.js` — IndexNow batch submission script

### Files Modified
1. `pages/sitemap.xml.js` — Added diagnostic tool URL to static sitemap
2. `pages/index.js` — Added diagnostic tool CTA section
3. `lib/schemas.js` — Enhanced Organization schema with sameAs + expanded knowsAbout

### Build Status: ✓ Compiled successfully

## Next Steps After Deployment
1. Re-run `node scripts/submit-indexnow.js` to submit URLs to Bing
2. Set up Bing Webmaster Tools account and verify yohomefix.com
3. Submit sitemaps in Bing Webmaster Tools
4. Verify llms.txt is accessible at https://yohomefix.com/llms.txt
5. Verify diagnostic tool at https://yohomefix.com/whats-wrong-with-my-plumbing
6. Begin content distribution from WS5 concepts (start with Reddit research data sharing)
