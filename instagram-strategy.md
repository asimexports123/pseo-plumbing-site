# YoHomeFix Instagram Acquisition Strategy

**Constraint:** Marketcall phone number must **never** appear on Instagram. All traffic must flow through the YoHomeFix website first.

**Date:** 2026-07-30  
**Status:** Strategy document — no influencers contacted, no website code changed, no campaign launched.

---

## 1. Marketcall Compliance & Risks

### Why the proposed flow works
- YoHomeFix pages use `tel:1` placeholders. Marketcall's JavaScript replaces the `href` with a dynamic tracking number at page load.
- The actual Marketcall number is generated for each visitor **after** they arrive on the site.
- If the number never appears on Instagram, the Marketcall tracking chain remains intact.

### Required rules
- Do **not** put the Marketcall number in any Instagram bio, post, story, reel, DM, or influencer content.
- Send all traffic to a YoHomeFix landing page with a working Marketcall script (`_app.js` loads the Marketcall widget).
- Keep the landing page TCPA/disclaimer text that is already present.
- Keep the existing Privacy Policy link because paid social traffic requires it.
- Do **not** ask influencers to mention a phone number or "call now" in the post text.

### Main risks
| Risk | Likelihood | Mitigation |
|---|---|---|
| Influencer accidentally posts the number | Medium | Brief them clearly; give pre-approved copy and a link only. |
| Visitor screenshots the post and calls the number anyway | Low | There is no number on the post, so they cannot. |
| Low conversion intent on Instagram vs Google | High | Treat Instagram as a test/branding channel, not the main lead source. |
| Attribution gap between `call_click` and actual Marketcall call | Medium | Use UTM + GA4 for click tracking; accept that exact call-to-influencer mapping is approximate. |

---

## 2. Recommended Instagram Campaign Structure

### Campaign objective
- **Meta Ads Manager** with **Traffic** or **Leads** objective, optimized for `call_click` if the Meta pixel event is configured.
- For organic, use the YoHomeFix business profile plus creator whitelisting.

### Best approach: paid whitelisted creator content
1. Find a local creator.
2. License their content (reel/story) and run it as an ad through the YoHomeFix Meta ad account.
3. Add the swipe-up link with UTM parameters to the YoHomeFix page.
4. Target the ad tightly around the creator's local zip codes / city.

This is better than an organic post because:
- Organic reach is low for a new account.
- Most local creators do not have 10k followers, so they cannot use the link sticker.
- Paid ads give precise zip targeting and conversion data.

### Campaign types
| Type | Goal | Format |
|---|---|---|
| Local Emergency Reel | Drive clicks | 15-30 second before/after of a burst pipe, clogged drain, water heater failure. |
| Local Trust Story | Drive clicks | Creator testimonial: "When my pipe burst, I called YoHomeFix and a plumber was here fast." |
| Cost/FAQ Carousel | Drive clicks | "What a drain cleaning actually costs in [City]." |

---

## 3. Creator Targets

Best to worst for emergency plumbing lead generation:

1. **Local community / neighborhood creators** (local Facebook/Instagram pages, Nextdoor personalities, local mom bloggers) — highest trust, exact geo, immediate relevance.
2. **Real estate agents** — have homeowners as audience, often in target cities.
3. **Property managers / landlords** — deal with plumbing issues regularly.
4. **Home improvement / DIY creators** — good for awareness, lower emergency intent.
5. **Homeowners with strong local following** — best if they have a local geo in the bio.
6. **General DIY / home decor creators** — weakest intent but good reach.

### Red flags to avoid
- Creators outside your service cities.
- Creators whose followers are mostly under 25.
- Any creator unwilling to follow the "no phone number" rule.

---

## 4. Landing Page Strategy

### Best option: city/service pages with UTM tags
YoHomeFix already has thousands of city + service pages. Use them directly.

Examples:
- Oklahoma City emergency: `https://yohomefix.com/plumber-oklahoma-city-emergency?utm_source=instagram&utm_medium=paid-social&utm_campaign=ig-okc-emergency-july30&utm_content=<creator-handle>`
- Baltimore drain cleaning: `https://yohomefix.com/plumber-baltimore-drain-cleaning?utm_source=instagram&utm_medium=paid-social&utm_campaign=ig-baltimore-drain&utm_content=<creator-handle>`

### Why city pages beat the homepage
- The homepage is too generic.
- City pages say the local city name, which matches the ad's local promise.
- The page already has a sticky CTA, hero call button, and Marketcall `tel:1`.

### When to use the homepage
- Only if the ad is national/brand awareness with no specific city.
- Use `https://yohomefix.com/?utm_source=instagram&utm_medium=paid-social&utm_campaign=ig-brand-awareness&utm_content=<creator-handle>`

### No new pages needed
The existing YoHomeFix architecture already supports the required flow. No website code is required.

---

## 5. Tracking: UTM + GA4, Marketcall Unchanged

### UTM structure
```
utm_source=instagram
utm_medium=paid-social          # or "influencer" for organic posts
utm_campaign=<city>-<service>-<date>
utm_content=<creator-handle>    # unique per influencer
```

### GA4 setup
- Use **Exploration > Free form** with:
  - Dimension: `Session source`, `Session medium`, `Session campaign`, `Session content`
  - Metric: `Sessions`, `call_click` events
- Add a **conversion** for the `call_click` event.
- Filter by `session source = instagram` to see influencer performance.

### Tracking Marketcall calls per influencer (current limitation)
- The existing Marketcall script tracks calls at the site level.
- Because the site uses **one** Marketcall campaign ID (348734) and site ID (3143), it does **not** separate calls by influencer automatically.
- Therefore:
  - **Proxy KPI:** `call_click` events per `utm_content` in GA4.
  - **Actual calls:** Pull Marketcall call records (if API is later shared) and compare timestamps with `call_click` sessions. This is approximate.
- To keep Marketcall unchanged, do **not** create new Marketcall campaigns or modify the `tel:1` implementation.

### Recommended tracking flow
```
Instagram Ad / Creator Post
  ↓
Click → https://yohomefix.com/<city>-<service>?utm_content=creator-handle
  ↓
YoHomeFix page loads, Marketcall requests tracking number
  ↓
Visitor clicks "Call Now" (tel:1)
  ↓
GA4 records call_click with full URL including UTM
  ↓
Marketcall replaces tel:1 with dynamic number
  ↓
Call is tracked in Marketcall
```

---

## 6. KPIs

| KPI | How to measure | Why it matters |
|---|---|---|
| **Visits** | GA4 sessions with `utm_source=instagram` | Are the ads/creators driving traffic? |
| **CTA clicks** | GA4 `call_click` events by `session_content` | Best available proxy for call intent per influencer. |
| **Marketcall executions** | Marketcall call records (secondary) | Actual calls; attribution is site-level, not per creator. |
| **Qualified calls** | Marketcall call records | Revenue-generating metric. |
| **Revenue per influencer** | Estimated: `call_clicks` × `call-to-click conversion rate` × `avg payout per call` | Since exact call-to-creator mapping is limited, use this as a directional metric. |

### Formula for estimated revenue per influencer
```
Estimated qualified calls = call_clicks × (Marketcall call rate)
Revenue = estimated qualified calls × payout per qualified call
ROI = (Revenue - influencer cost) / influencer cost
```

---

## 7. Cost-Effective Collaboration Model

### Recommended: small flat fee + click bonus (hybrid)

| Model | Use case | Notes |
|---|---|---|
| **Flat fee** ($50-$300 per creator) | Testing / micro-influencers | Predictable, easy to negotiate, no attribution arguments. |
| **Cost per click / call_click bonus** | Proven creators | Pay $2-$5 per `call_click` they generate via UTM. |
| **Hybrid** | Best overall | Small upfront fee + bonus for every 25 or 50 `call_click` events. |
| **Revenue share** | Not recommended | Hard to prove exact qualified call per creator. Creates disputes. |

### Suggested first test budget
- **5 local micro-creators** × **$150 flat fee + $100 click bonus** = **$1,250**
- Run whitelisted ads with **$15/day per creator** for 7 days = **$525**
- Total test: **~$1,775**
- Success criteria: at least 2 `call_click` per $100 spent (or CTA CPC under $5).

---

## 8. Is Instagram a Good Acquisition Channel for Emergency Plumbing?

### Honest answer: weak primary channel, acceptable secondary channel

**Data points:**
- Google holds ~93% of search market share for home services; most homeowners search Google when a pipe bursts.
- Emergency plumbing leads convert at **40-50%** when the business responds fast; Instagram traffic is not actively searching.
- Instagram works better for **trust building, brand awareness, and local visibility** than for direct emergency calls.
- The cost per lead for local service ads / Google LSA is typically **$25-$85**; Instagram CPL is usually higher for emergency intent.

### Better alternatives for 20 calls/day
1. **Google Local Services Ads (LSA)** — highest-intent emergency leads, Google Guaranteed badge.
2. **Google Ads emergency keywords** — "emergency plumber near me", "24/7 drain service".
3. **Google Business Profile / local SEO** — free, compounds over time, already identified as the main SEO opportunity.
4. **Nextdoor and local Facebook groups** — cheaper than Instagram, more local trust.
5. **Referral / past-customer SMS** — cheapest per booked job.

### Verdict
Instagram can be a **small-budget test** for brand visibility and a few incremental calls, but it should not replace Google/LSA. Use it to build trust and drive traffic to city pages while you wait for SEO to mature.

---

## Next Steps (Not to be executed now)

1. Set up a YoHomeFix Instagram business profile (or confirm it exists).
2. Create a Meta Ads Manager account and install the Meta pixel if not present.
3. Build a 5-creator outreach list with their city, handle, and follower count.
4. Prepare UTM-tagged city landing page links for each creator.
5. Define the exact `$X per call_click` bonus structure.
6. Get Marketcall API read-only access to compare `call_click` with actual calls.
