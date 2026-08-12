# YoHomeFix Revenue Intelligence MVP v1.0

*Business-first MVP. The full Autonomous Operating System (Blueprint v1.0, Execution Plan v1.0) remains valid long-term reference architecture but is explicitly NOT being built now. This document supersedes it as the active implementation target.*

**Single objective:** answer, every day, *"what should we do today to maximize future qualified calls?"* Nothing in this spec exists unless it serves that question directly.

---

## 0. What Is Being Built, and Why

A small, daily-refreshed system that: (1) pulls existing GSC/GA4/Marketcall data automatically, (2) scores every page with traffic on one number — expected incremental qualified calls if the page were improved — (3) turns the top scores into plain-English recommendations, (4) shows two dashboards, and (5) tracks whether past recommendations actually worked.

**Explicitly not built:** Bayesian hierarchical models, graph theory, trust HMMs, capital allocation portfolios, MPC planning, governance layers, hypothesis-register state machines. All of that is real (Phases 1–6), but none of it is required to materially beat the current fixed-threshold rules in `report_core.py` — this MVP captures the highest-value ~20% of that research at ~5% of the engineering cost. If the MVP later proves insufficient, the OS Blueprint is the pre-approved path to extend it — nothing here forecloses that.

**Cloudflare is excluded on purpose.** It's a CDN/cache layer in this stack (confirmed via response headers), not a source of decision-relevant signal for "which page to improve" — including it would be scope creep with no answer to any of the eight questions in §7.

---

## 1. Automatic Data Collection

**Sources (reusing existing clients, not replacing them):**

| Source | Existing Client | What's Collected | Change Needed |
|---|---|---|---|
| Google Search Console | `scripts/analytics/gsc_client.py` | impressions, clicks, CTR, avg. position — per page, per day | Fix the confirmed zero-data bug (pre-existing, blocking); add a write-to-Postgres step (currently only writes JSON to `gsc-data/`) |
| GA4 | `scripts/analytics/ga4_client.py` | sessions, call-click events, landing page | Add write-to-Postgres step |
| Marketcall | `scripts/analytics/marketcall_client.py` | qualified calls, attributed page/keyword | Verify API key is live (currently unconfirmed — try/except returns `[]` silently); if not fixable in Phase 1 timeframe, use a manual CSV export as an interim, documented workaround (not a blocker to the rest of the MVP) |
| Internal page data | `cities_data` table (existing) | slug, city, state, service, meta_title, is_active | None — read-only reuse |

**Storage — minimum required, one new table:**

`page_metrics_daily` (slug, date, impressions, clicks, ctr, avg_position, sessions, call_clicks, qualified_calls) — **only rows for pages with nonzero impressions in the trailing 90 days are stored.** Of ~422k sitemap URLs, this is realistically a few thousand rows/day, not hundreds of thousands — keeping this lean by construction, per the "optimize for business value first, not millions of pages" instruction.

No separate tables for GSC/GA4/Marketcall — they're merged into one row per page/day at ingestion time, because every downstream consumer (scoring, dashboards) needs them joined anyway, and three raw tables would be unused complexity.

**Job:** one daily Python script (`scripts/analytics/ingest_daily_metrics.py`, new — extends the existing cron pattern in `.github/workflows/gsc-daily.yml`) calls the three existing clients, merges by slug+date, writes to `page_metrics_daily`. Fails loudly (no silent zero-writes) and alerts via the existing Sentry integration.

---

## 2. Opportunity Score — Methodology (No Arbitrary Weights)

**Design principle:** every input to the score is either a directly observed rate, an empirically-derived benchmark from the site's own data, or a probability — never a hand-picked weight like "impressions × 0.3 + CTR × 0.5." This is the same discipline validated across Phases 1–4 (Expected Value, not ad hoc scoring), scaled down to MVP simplicity.

**Step 1 — CTR benchmark (what CTR *should* be at this position):**
Group all pages in `page_metrics_daily` by average-position bucket (1-3, 4-6, 7-10, 11-20, 21+) and compute the **median observed CTR per bucket, from YoHomeFix's own historical data** (not an external industry curve — the site's own distribution is the correct, non-arbitrary benchmark, and avoids importing someone else's unverified assumptions).

**Step 2 — Expected incremental clicks:**
`expected_incremental_clicks = impressions × max(0, benchmark_CTR[position_bucket] − actual_CTR)`
If a page already exceeds its bucket's median CTR, this is zero — it is not flagged as an opportunity (this directly answers "which pages should NOT be touched," §7).

**Step 3 — Call conversion rate per cluster (state × service), smoothed:**
`cluster_cvr = (cluster_calls + k × site_avg_cvr) / (cluster_clicks + k)`
This is **additive (Laplace) smoothing**, a standard, well-known, non-arbitrary technique — `k` is set to the **median clicks-per-cluster across all clusters** (a data-derived constant, not a guess), so clusters with little data are pulled toward the site average, and clusters with lots of data are barely adjusted. This is deliberately simpler than the full hierarchical Bayesian model in the OS Blueprint — it captures ~90% of the benefit (shrinking noisy small-sample estimates) with a formula that fits in one line and needs no model-fitting infrastructure.

**Step 4 — Expected incremental qualified calls:**
`expected_calls = expected_incremental_clicks × cluster_cvr`
This is the **core score** — a direct, defensible estimate of business value, in the actual unit that matters (calls), not a proxy.

**Step 5 — Confidence:**
`confidence = clicks_observed / (clicks_observed + k)` (same `k` as Step 3) — a simple, monotonic, sample-size-driven confidence measure: more historical clicks → higher confidence in the CVR estimate used. Expressed as a percentage in recommendations (e.g., "86% confidence" comes directly from this ratio, not a guess).

**Step 6 — Priority score (what pages are ranked by):**
`priority = expected_calls × confidence`
This naturally deprioritizes high-expected-value-but-low-confidence pages relative to solid, well-evidenced opportunities — again, no separate arbitrary weight, just the direct product of business value and evidence quality.

**Trend and search intent** (requested inputs) are used as **filters/context, not additional score terms**, to avoid double-counting and arbitrary weighting: trend (7-day vs 28-day average position/CTR delta) flags whether an opportunity is worsening (more urgent) or already recovering (less urgent) in the recommendation text; search intent (commercial keywords like "emergency," "cost," "near me" vs. informational) is a simple keyword-match tag used to explain *why* a page is worth prioritizing in plain English, not to inflate its score.

---

## 3. Recommendation Engine

**Logic (template-based, not generative — deterministic and auditable):** for each of the top-N scored pages, identify which factor(s) dominate the opportunity (low CTR vs. low position vs. high-intent-but-low-conversion) by comparing the page's stats to its cluster's median, and fill a plain-English template.

**Example output (matches the requested format exactly):**
```
Improve Houston Emergency Plumber
Reason: High impressions (1,240/mo), low CTR (1.8% vs 4.1% expected at position 6.3),
        strong commercial intent ("emergency" keyword)
Expected impact: +5 qualified calls/month
Confidence: 86%
Suggested action: Rewrite title/meta to match top-CTR pages in the Emergency Plumber
                   cluster (see 3 comparable examples)
```

**Suggested action logic (simple decision table, no ML):**
| Dominant factor | Suggested action |
|---|---|
| Low CTR at good position | Rewrite title/meta |
| Good CTR but position 11-20 | Add internal links from higher-authority pages in the same cluster (identify via existing internal link structure, simple lookup — no full graph-centrality computation needed for MVP) |
| Low impressions, low position | Deprioritize — likely low search demand, not a title/link problem |
| Already above benchmark CTR at good position | No action — explicitly listed in the "do not touch" section of the dashboard |

**Output:** written daily to a new `opportunity_scores` table (slug, date, score fields from §2, dominant_factor, suggested_action, recommendation_text) — this table **is** the recommendation feed; no separate recommendation-object infrastructure needed.

---

## 4. Business Dashboards (exactly two, both simple Next.js admin pages reusing the existing app)

**Dashboard 1 — Business Overview** (`/admin/overview`)
- Calls, revenue (from Marketcall), impressions, clicks, CTR — trailing 7/28/90-day, with simple trend arrows.
- Top 10 cities and top 10 services by qualified calls.
- Top 10 winners / top 10 losers (by week-over-week change in `expected_calls` from the opportunity table) — directly answers "which city has the biggest missed opportunity" and shows momentum.
- Filters: date range only. No cluster-drilldown needed for this view — that's Dashboard 2's job.

**Dashboard 2 — Opportunity Dashboard** (`/admin/opportunities`)
- Table: top pages to improve, sorted by `priority` score, columns = expected gain, confidence, reason, suggested action.
- A separate, explicitly labeled "Do Not Touch" section (pages already at/above benchmark CTR) — directly answers §7's "which pages should NOT be touched."
- Filters: city, service, minimum confidence threshold.
- Refresh: daily (matches the ingestion/scoring cadence — no real-time requirement exists for this decision cycle).

**No third dashboard.** A "Forecasts" or "Governance" view was considered and rejected here — nothing in this MVP produces multi-week forecasts or governance overrides; adding a dashboard for outputs that don't exist yet would be exactly the over-engineering this phase is meant to avoid.

---

## 5. Experiment Tracker

One table, `experiments` (id, hypothesis, implementation_date, pages_affected [array of slugs], expected_outcome, actual_outcome, decision [kept/reverted/inconclusive], notes). One simple admin page (`/admin/experiments`) with a form to log a change when it's made and a follow-up field to fill in 30 days later, comparing `page_metrics_daily` before/after for the affected pages.

**No hypothesis-register state machine, no diff-in-diff automation, no Bayesian Optimization.** This is a manual log with one automated assist: a "suggested actual outcome" pre-fill computed as `(post-change avg calls) − (pre-change avg calls)` for the affected pages, which a human confirms or overrides. This directly closes the loop (does the recommendation engine's track record improve over time) without building the full Experimentation Layer from the OS Blueprint.

---

## 6. MVP Roadmap

| Phase | Scope | Business Value Delivered |
|---|---|---|
| **Phase 1** | Fix GSC zero-data bug; verify/replace Marketcall; build `page_metrics_daily` ingestion job | Trustworthy daily data — usable standalone for manual review even before scoring exists |
| **Phase 2** | Build the opportunity scoring pipeline (§2) into `opportunity_scores` | A ranked list of what to fix, replacing gut-feel prioritization — usable via direct table query even before a dashboard exists |
| **Phase 3** | Build the recommendation-text templating (§3) | Plain-English daily action list — no SQL/data literacy required to use it |
| **Phase 4** | Build the two dashboards (§4) | Self-serve visibility for anyone on the team, not just whoever can query Postgres |
| **Phase 5** | Build the experiment tracker (§5) | Closes the loop — proves whether recommendations actually work, builds a track record |

Each phase is independently useful the moment it ships — this is deliberate: if the project stopped after Phase 2, the business already has something it doesn't have today (a ranked, evidence-based opportunity list).

---

## 7. Success Criteria

The MVP is validated only if it can answer, using the shipped system (not a one-off analysis):

| Question | Answered by |
|---|---|
| Which 20 pages deserve attention today? | Dashboard 2, top 20 by priority score |
| Which title change has the highest expected ROI? | Dashboard 2, "low CTR" dominant-factor rows sorted by expected gain |
| Which city has the biggest missed opportunity? | Dashboard 1, top-losers-by-city view |
| Which pages should NOT be touched? | Dashboard 2's explicit "Do Not Touch" section |
| What is the expected business impact of today's work? | Sum of `expected_calls` for whatever pages were acted on today, trackable via the experiment tracker |

If any of these five cannot be answered directly from the shipped dashboards without additional analysis, the MVP has not met its bar — this is the concrete, falsifiable test for "is it too complicated" or "is it not enough."

---

## 8. Implementation Order, Effort, Dependencies

| Phase | Effort (small team) | Dependencies | Notes |
|---|---|---|---|
| Phase 1 | 3-5 days | None | The GSC bug fix is likely 1-2 days alone; Marketcall verification may reveal it needs an interim CSV workaround (add 1-2 days) |
| Phase 2 | 3-4 days | Phase 1 | Pure computation over existing data; no new external dependency |
| Phase 3 | 1-2 days | Phase 2 | Template logic only, no new data needed |
| Phase 4 | 4-6 days | Phase 2, 3 | Two simple internal Next.js pages, reusing existing auth/layout patterns already in the app |
| Phase 5 | 2-3 days | Phase 1 (needs `page_metrics_daily`) | Can be built in parallel with Phase 3/4 |

**Total: roughly 3-4 weeks for a single engineer, sequentially; faster with any parallelization of Phase 4/5.**

**Dependency graph:** Phase 1 blocks everything (same "fix the data first" principle from every prior phase of this research). Phases 2→3→4 are strictly sequential. Phase 5 only needs Phase 1.

---

## 9. Validation Plan

- **Phase 1:** 7 consecutive days of non-zero, cross-checked (against GSC/GA4/Marketcall UIs manually) data in `page_metrics_daily` before proceeding.
- **Phase 2:** run the scoring formula against 4 weeks of historical data; manually spot-check the top 10 and bottom 10 scored pages against intuition/known cases (e.g., confirm the already-shipped 50-page title/meta test shows up as "already improved, do not re-touch" if applicable).
- **Phase 3:** manually review 20 generated recommendations for factual correctness (do the numbers in the text match the underlying table row) before trusting the templating logic.
- **Phase 4:** dashboards validated by having a non-technical team member answer the five §7 questions unaided, using only the UI.
- **Phase 5:** validated by logging the already-completed 50-page title/meta experiment retroactively as the first tracker entry, confirming the before/after auto-calculation matches manual analysis already done for that test.

**No feature ships until its validation step passes** — same discipline as the full Execution Plan, scaled to MVP size.

---

## 10. Relationship to Prior Phases

This MVP is a strict subset of the OS Blueprint's Epics A (Data Integrity), part of B/D (a simplified, non-hierarchical version of clustering + shrinkage), and part of L (a simplified, template-based version of explainability) — nothing here contradicts the Blueprint or Execution Plan; it is the fastest path to business value that keeps every future upgrade (trust layer, capital allocation, full Bayesian shrinkage, MPC planning) available as a strict superset extension later, without any rework of what's built now. When/if the business decides the MVP's smoothed-CVR scoring is no longer precise enough, Epic D's full hierarchical Bayesian model is a drop-in replacement for §2's Step 3 — the `opportunity_scores` table schema does not need to change for that upgrade to happen.
