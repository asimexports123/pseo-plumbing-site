# YoHomeFix Autonomous Business Operating System — Engineering Execution Plan v1.0

*Converts the approved "Autonomous Business Operating System — Complete Architecture Blueprint v1.0" into an executable backlog. No architectural decisions are made here — where the blueprint is ambiguous or technically costly, it is flagged in §14 (Technical Debt Register) rather than changed.*

**Stack grounding (verified against the live repo, not assumed):**
- App: Next.js (`package.json`), deployed via Netlify (`netlify.toml`) — SSR/ISR page generation from `lib/sitemap.js` taxonomy (`SEED_CITIES`, `SERVICES`, `STATES`, `COST_PAGE_CITIES`).
- DB: Supabase/Postgres (`supabase-schema.sql`) — existing table `cities_data` (slug, city_name, state, content, meta_title/description, is_active, timestamps), RLS-enabled, public read policy.
- Analytics pipeline: Python scripts in `scripts/analytics/` (`gsc_client.py`, `ga4_client.py`, `marketcall_client.py`, `report_core.py`, `weekly_report.py`) run via `.github/workflows/gsc-daily.yml` (GitHub Actions cron), writing JSON snapshots to `gsc-data/`.
- Auth to Google APIs: service-account JSON (`scripts/analytics/config.py`), scoped to Search Console + GA4 read-only.
- Error monitoring: Sentry already wired (`sentry.client.config.js`, `sentry.server.config.js`, `sentry.edge.config.js`).

All new infrastructure below is designed to extend this stack (Postgres tables, Python batch jobs, GitHub Actions cron, Next.js API routes) rather than introduce a new platform.

---

## 1. Epic Breakdown (Roadmap Phases A–O → Epics)

| Epic | Objective | Business Value | Dependencies | Complexity | Risk | Acceptance Criteria | Exit Criteria |
|---|---|---|---|---|---|---|---|
| **A — Data Integrity Foundation** | Fix GSC zero-data bug, verify/replace Marketcall, add anomaly gate | Unblocks every downstream layer; highest-leverage fix in the entire program | None | Low-Medium | High if skipped (silent corruption downstream) | 30 consecutive days of non-zero, validated GSC/GA4/Marketcall snapshots | Anomaly gate live in cron; zero-data days = 0 in trailing 30 days |
| **B — Knowledge/Feature Layer (L1)** | Cluster pages (taxonomy + community detection), tag confounders, build content-change log | Enables statistically valid pooling instead of per-URL noise | A | Medium | Medium (mis-clustering biases everything downstream) | Every active page has a taxonomy cluster ID + community-detected cluster ID + confounder tags | Cluster table populated for 100% of `cities_data` + templated pages |
| **C — Graph Layer (L2)** | Extract internal link graph, compute centrality/HITS/community/resilience | Identifies under-linked high-value pages and critical hub-failure risk | B | Medium | Low | Graph rebuild completes weekly without manual intervention; resilience report identifies top-10 fragile hubs | Graph metrics feed L4 and L8 |
| **D — Bayesian Core (L4)** | Hierarchical shrinkage, confounder-adjusted structure, graph-regularization | Turns noisy per-page metrics into calibrated, decision-grade estimates | B, C | High | Medium (statistical misuse if unvalidated) | Posterior CTR/CVR per cluster with credible intervals; backtested against 4+ weeks holdout | Posteriors demonstrably outperform naive rate averaging on holdout |
| **E — Trust Layer (L3)** | HMM over crawl-frequency/recrawl/indexing-latency signals | Distinguishes "low trust" (technical) from "high trust, declining" (content) pages | A | Medium | Medium (limited historical crawl-stat data) | Trust posterior per cluster refreshed daily | Trust state available as covariate to L4 |
| **F — Forecasting & Change-Detection (L5)** | Kalman filter aggregates, GP per-cluster, BOCPD changepoint monitor | Calibrated forecasts + early warning for algorithm updates | D | High | Medium | Forecast intervals empirically well-calibrated (coverage test); changepoint alerts correlate with known update dates | Forecasts and alerts consumed by L8 |
| **G — Objective Function Correction (L8 groundwork)** | Elicit Policy-level utility weights (calls, revenue, risk, defensibility) | Ensures every downstream optimization targets real business value, not clicks | D, E, F | Low (elicitation) / Medium (encoding) | High if skipped (optimizes wrong target) | Signed-off utility function with weights, versioned | Utility function used by every EV/allocation calculation |
| **H — Decision Velocity Layer (L7)** | Rate ceilings from crawl-budget/queueing model | Prevents crawl-budget exhaustion and bulk-change risk | E | Medium | Medium | Ceilings computed per cluster from observed crawl service-rate | No action sequence violates a ceiling undetected |
| **I — Capital Allocation Engine (L8)** | Portfolio optimization across capital classes, Kelly-criterion sizing | Replaces ad hoc prioritization with quantified, risk-adjusted allocation | G, H | High | Medium-High | Allocation recommendations reproducible, auditable, bounded by budget envelope | Allocation output consumed by L9 every sprint |
| **J — Experimentation Layer (L6)** | Hypothesis register, Bayesian Optimization, contextual bandits, standing diff-in-diff | Formalizes what is currently ad hoc testing into a closed, auditable loop | D, F | High | Medium | Every experiment has a registered hypothesis, pre-registered success criteria, and a diff-in-diff validated outcome | Hypothesis register operational; first 5 experiments run end-to-end |
| **K — Simulation & Planning (L9)** | DP scheduling, MCTS-style sequencing, MPC receding horizon | Accounts for compounding/interaction effects between actions | I, J | High | Medium-High | Multi-sprint plan demonstrably outperforms single-period greedy baseline in backtest | MPC re-plans automatically every sprint boundary |
| **L — Explainability Layer (L11)** | Recommendation Ledger with full provenance | Makes every recommendation auditable; required for trust and debugging | K | Medium | Low | 100% of recommendations have confidence/evidence/alternatives logged | Ledger queryable, used in dashboards |
| **M — Governance / Cybernetic Layer (L10)** | VSM role mapping, Ashby's-Law repertoire audit, confidence-gated fallback, robust-control margin | Prevents runaway automation; defines human-in-the-loop boundaries | K, L | Medium | High if skipped (unsupervised bad decisions) | Confidence threshold enforced; every sub-threshold recommendation routes to human review queue | Zero auto-executed recommendations below threshold in audit sample |
| **N — Monitoring & Feedback (L12)** | Outcome attribution, closes the loop into L4–L6 | Makes the system self-improving rather than a one-shot pipeline | M | Medium | Medium | Posterior/hypothesis updates visibly change from real outcomes within one attribution window | System operates ≥ 4 consecutive closed-loop cycles unattended |
| **O — Tier 3 Conditional Track** | DBN/semi-Markov, hybrid RL-in-simulator, competitor contest-theory | Future capability, gated on data maturity | N + 6-12mo clean data | High | High (speculative) | Data-maturity gate criteria met and documented | Not started until gate criteria satisfied — tracked, not built |

---

## 2–3. Feature Breakdown & Technical Task List

Near-term epics (A–D, the MVP path, see §13) are broken down to task level. Later epics (E–O) are broken to feature level now and will be task-decomposed during their own sprint-planning cycle (standard rolling-wave backlog grooming — decomposing O today would produce speculative tasks against a system that doesn't exist yet).

### Epic A — Data Integrity Foundation

**Feature A1: Fix GSC zero-data pipeline**
- *Sub-feature A1.1: Diagnose snapshot failure*
  - Task: Trace `gsc-data/2026-08-03.json` zero-output back through `gsc_client.py` → identify whether failure is auth (service account), query malformation, or silent exception swallowing.
    - Purpose: root-cause the confirmed zero-impressions/zero-clicks bug.
    - Inputs: `scripts/analytics/gsc_client.py`, `.github/workflows/gsc-daily.yml` run logs, `scripts/analytics/config.py`.
    - Outputs: root-cause note, fix PR.
    - Affected modules: `scripts/analytics/gsc_client.py`.
    - Dependencies: none.
    - Validation method: re-run against 3 known-non-zero historical date ranges; compare output to manual GSC UI export.
    - Rollback: revert to previous script version; snapshot writing is append-only so no data loss risk.
  - Acceptance criteria: 7 consecutive daily snapshots contain non-zero `totalImpressions`/`totalClicks` matching GSC UI within 5%.
- *Sub-feature A1.2: Add schema/sanity validation before snapshot is accepted*
  - Task: Add a validation step (row count > 0, totals > 0 unless independently confirmed, date range matches request) that fails the workflow loudly instead of writing a silent-zero JSON.
    - Purpose: prevent silent corruption from recurring undetected.
    - Inputs: raw GSC API response.
    - Outputs: validated snapshot or workflow failure + Sentry alert.
    - Affected modules: `gsc_client.py`, `.github/workflows/gsc-daily.yml`.
    - Validation method: inject a deliberately malformed/empty response in a test run; confirm workflow fails and alerts.
    - Rollback: feature-flaggable validation (can be disabled via env var if false-positives occur).

**Feature A2: Verify or replace Marketcall attribution**
- Task: Confirm whether `MARKETCALL_API_KEY`/`MARKETCALL_API_BASE` in `scripts/analytics/config.py` are populated and whether `marketcall_client.py`'s try/except is silently returning `[]`.
  - Purpose: verify the single most important revenue-attribution signal.
  - Inputs: Marketcall dashboard (manual cross-check), `marketcall_client.py`.
  - Outputs: confirmed-working client, or documented decision to use an alternative call-tracking export (CSV manual import as interim).
  - Validation method: cross-check 10 known real calls (from Marketcall's own dashboard) against client output.
  - Rollback: fall back to manual CSV import job if API integration is not viable short-term.

**Feature A3: Anomaly/outlier data-quality gate (Phase 2 §C.12)**
- Task: Add a lightweight statistical check (robust z-score on daily totals vs. trailing 28-day window) run immediately after ingestion, blocking downstream jobs on failure.
  - Purpose: catch future corruption of any kind, not just the known GSC bug.
  - Affected modules: new `scripts/analytics/data_quality_gate.py`.
  - Validation method: replay historical known-good and known-bad (the zero-data incident) snapshots through the gate; confirm correct pass/fail classification.
  - Rollback: gate failures alert but do not delete data — always fail safe/loud, never silently drop.

### Epic B — Knowledge/Feature Layer

**Feature B1: Taxonomy cluster assignment** — map every page (from `lib/sitemap.js` generation logic + `cities_data`) to a `(state, service, city_tier)` cluster key; store in new `page_clusters` table (§4).
**Feature B2: Community-detection cross-check** — run Louvain on the extracted link graph (depends on Epic C's graph extraction — sequenced as B2 after C1, not strictly B-then-C); flag divergence between taxonomy and structural clusters for manual review.
**Feature B3: Confounder tagging** — tag each page with investment-priority flag (derived from whether it received the already-shipped title/meta optimization), launch cohort (from `created_at`), and page age.
**Feature B4: Content-change log** — new lightweight log capturing every content/title/meta deploy event with timestamp and page ID, sourced from git commit history for `cities_data`-affecting changes plus a manual-entry fallback for CMS-driven edits.

### Epic C — Graph Layer

**Feature C1: Internal link graph extraction** — parse routing/template logic (hub → state → state×service → city×service) into an explicit adjacency structure; store in `page_graph_edges` table.
**Feature C2: Centrality suite** — PageRank, betweenness, eigenvector, HITS computed on the cluster-level graph (not per-URL, per scalability principle).
**Feature C3: Community detection** — Louvain algorithm output feeding B2.
**Feature C4: Resilience/robustness analysis** — simulate hub-node removal; produce ranked "critical hub" list feeding the utility function's defensibility term (Epic G) and Governance dashboard (§7).

### Epic D — Bayesian Core

**Feature D1: Flat hierarchical Beta-Binomial shrinkage** (CTR/CVR per cluster) — baseline, ships first.
**Feature D2: Confounder-adjusted structure** — add B3's confounder tags as adjustment covariates (Phase 4 §3 correction) before any effect is trusted directionally.
**Feature D3: Graph-regularized shrinkage** — incorporate C2 neighbor-performance into the prior (Phase 2 §B.7-novel).
**Feature D4: Backtesting harness** — holdout validation comparing D1→D2→D3 against naive rate averaging, required before D-series posteriors are trusted by any downstream epic.

*(Epics E–N: feature-level only, task decomposition deferred to their own sprint-planning cycle per rolling-wave practice stated above.)*

**Epic E features:** E1 Crawl-stat ingestion (GSC Crawl Stats + URL Inspection API), E2 Trust HMM model fitting, E3 Trust-state daily update job, E4 Trust-as-covariate integration into D2.

**Epic F features:** F1 Kalman filter (site/state/service aggregate), F2 Gaussian Process per-cluster forecaster, F3 BOCPD changepoint monitor, F4 Forecast-calibration backtest harness.

**Epic G features:** G1 Stakeholder utility-weight elicitation workshop, G2 Utility function versioned config store, G3 Utility-weighted EV recalculation of existing `report_core.py::identify_opportunities` logic.

**Epic H features:** H1 Crawl-budget service-rate estimator (birth-death model on indexing stats), H2 Velocity ceiling calculator per cluster, H3 Ceiling enforcement hook in the allocation/planning pipeline.

**Epic I features:** I1 Capital-class expected-return/risk aggregator (pulls from D/F/J), I2 Mean-variance portfolio optimizer, I3 Kelly-criterion position sizer, I4 Budget-envelope config (Policy-set, from G2).

**Epic J features:** J1 Hypothesis register schema + CRUD, J2 Bayesian Optimization module (continuous params), J3 Contextual bandit module (discrete interventions, head clusters only), J4 Standing diff-in-difference validator, J5 Hypothesis lifecycle state machine (generated→prioritized→testing→validated→archived).

**Epic K features:** K1 DP multi-sprint scheduler, K2 MCTS-style action-sequence simulator (uses D/F as simulator), K3 MPC receding-horizon controller wrapping K1/K2, K4 Backtest vs. single-period greedy baseline.

**Epic L features:** L1 Recommendation Ledger schema, L2 Ledger-write hook at every K-layer output, L3 Explanation-object assembler (confidence/evidence/alternatives).

**Epic M features:** M1 VSM role/permission mapping (who can approve/override in the admin UI), M2 Ashby's-Law repertoire audit report, M3 Confidence-threshold config + fallback routing to human review queue, M4 Robust-control budget-margin enforcement in I2.

**Epic N features:** N1 Outcome-attribution window calculator per action-type, N2 Posterior-update trigger (feeds back to D), N3 Hypothesis-register outcome resolution (feeds back to J), N4 Closed-loop health monitor (detects if the loop has stalled).

---

## 4. Database Plan (Supabase/Postgres)

| Layer | Table | Key Columns | Indexes | Relationships | Retention | Owner | Migration Order |
|---|---|---|---|---|---|---|---|
| Existing | `cities_data` | slug (unique), city_name, state, content, meta_*, is_active, timestamps | slug, is_active (existing) | Referenced by all new tables via `page_slug` FK | Indefinite | L0/L1 | — (reuse, no change) |
| B | `page_clusters` | page_slug (FK), taxonomy_cluster_id, community_cluster_id, confounder_tags (jsonb) | page_slug, taxonomy_cluster_id | FK → cities_data.slug | Indefinite, versioned on re-cluster | L1 | 1 |
| B | `content_change_log` | id, page_slug (FK), change_type, changed_at, source | page_slug, changed_at | FK → cities_data.slug | 2 years | L1 | 2 |
| C | `page_graph_edges` | id, source_slug, target_slug, edge_type, weight, extracted_at | source_slug, target_slug | FK → cities_data.slug (both) | Rebuilt weekly, keep last 4 snapshots | L2 | 3 |
| C | `graph_metrics` | cluster_id, metric_type (pagerank/betweenness/hits/community), value, computed_at | cluster_id, metric_type | FK → page_clusters | Keep last 12 weekly snapshots | L2 | 4 |
| D | `bayesian_posteriors` | cluster_id, metric (ctr/cvr), alpha, beta, credible_interval_low/high, model_version, computed_at | cluster_id, metric, computed_at | FK → page_clusters | Keep full history (small volume, cluster-level) | L4 | 5 |
| E | `crawl_stats` | page_slug, crawl_date, crawl_count, recrawl_interval_days, index_latency_days | page_slug, crawl_date | FK → cities_data.slug | 18 months | L3 | 6 |
| E | `trust_states` | cluster_id, trust_state, posterior_confidence, computed_at | cluster_id, computed_at | FK → page_clusters | Keep full history | L3 | 7 |
| F | `forecasts` | cluster_id, forecast_date, method (kalman/gp), point_estimate, interval_low/high | cluster_id, forecast_date | FK → page_clusters | 12 months | L5 | 8 |
| F | `changepoint_events` | id, scope (site/cluster), detected_at, confidence, note | detected_at | — | Indefinite (small volume) | L5 | 9 |
| G | `utility_weights` | version, weights (jsonb: calls/revenue/risk/defensibility/info), approved_by, approved_at | version | — | Indefinite, versioned | L10 | 10 |
| I | `capital_allocations` | id, period, capital_class, allocated_amount, expected_return, risk, computed_at | period, capital_class | — | Indefinite | L8 | 11 |
| J | `hypotheses` | id, cluster_id, hypothesis_text, status (generated/prioritized/testing/validated/rejected/archived), voi_score, created_at, resolved_at | cluster_id, status | FK → page_clusters | Indefinite (this IS the institutional memory) | L6 | 12 |
| J | `experiment_results` | hypothesis_id (FK), control_cluster_id, treatment_cluster_id, effect_size, p_value, diff_in_diff_validated (bool) | hypothesis_id | FK → hypotheses | Indefinite | L6 | 13 |
| K | `sprint_plans` | id, sprint_period, planned_sequence (jsonb), mpc_horizon, generated_at | sprint_period | — | Keep 24 months | L9 | 14 |
| L | `recommendation_ledger` | id, cluster_id, action, confidence, expected_gain, expected_risk, evidence (jsonb), alternatives (jsonb), created_at, executed (bool), execution_approved_by | cluster_id, created_at | FK → page_clusters | Indefinite (audit requirement) | L11 | 15 |
| M | `review_queue` | id, recommendation_id (FK), reason, status (pending/approved/rejected), reviewed_by, reviewed_at | status | FK → recommendation_ledger | Indefinite | L10 | 16 |
| N | `outcome_attributions` | id, recommendation_id (FK), attribution_window_days, observed_delta, attributed_at | recommendation_id | FK → recommendation_ledger | Indefinite | L12 | 17 |

**Reuse note:** `cities_data` is the only existing table and is reused as the canonical page identity table (`slug` as the universal FK) — no new "pages" table is created. All new tables are additive; no existing schema is altered, satisfying the "no refactoring" constraint.

---

## 5. API Plan

### External APIs (already integrated, reused)
| API | Client | Frequency | Retry | Caching | Rate Limits | Error Handling |
|---|---|---|---|---|---|---|
| Google Search Console | `gsc_client.py` | Daily (cron) | 3x exponential backoff | Snapshot JSON cached in `gsc-data/` | GSC quota (~1200 req/day/property) — well within current usage | Fail loud + Sentry alert (new, per A1.2); never write partial/zero silently |
| Google Analytics 4 | `ga4_client.py` | Daily (cron) | 3x exponential backoff | Not currently cached — recommend adding | GA4 API quotas (per-property) | Same fail-loud policy extended here |
| Marketcall | `marketcall_client.py` | Daily (cron) | Currently swallows errors — **must change to fail loud** (Epic A2) | None currently | Unknown (undocumented API) | Add explicit error surfacing; alert on empty response instead of silently returning `[]` |
| GSC Crawl Stats / URL Inspection | New client, same auth as `gsc_client.py` | Daily (cron), per-cluster sampled (not every URL, for quota reasons) | 3x exponential backoff | New crawl_stats table is the cache | URL Inspection API has tighter per-day quota — sample cluster-representative URLs, not all 422k | Fail loud; degrade gracefully to "trust unknown" state if quota exhausted |

### Internal APIs (new, Next.js API routes under `pages/api/os/`)
| Route | Purpose | Consumers | Auth |
|---|---|---|---|
| `GET /api/os/clusters/:id/posterior` | Fetch current Bayesian posterior for a cluster | Dashboards, L8 | Internal service token |
| `GET /api/os/recommendations` | Fetch current recommendation ledger, filterable by status | Recommendations dashboard | Internal service token |
| `POST /api/os/recommendations/:id/approve` | Human approval of a queued recommendation | Review queue UI | Authenticated admin session |
| `GET /api/os/trust/:clusterId` | Fetch current trust state | Trust dashboard | Internal service token |
| `GET /api/os/capital-allocation/current` | Fetch current period's allocation | Capital Allocation dashboard | Internal service token |
| `GET /api/os/hypotheses` | List hypothesis register, filterable by status | Experiments dashboard | Internal service token |
| `GET /api/os/health` | Aggregate data-quality/anomaly-gate status | Data Health dashboard, uptime monitors | Internal service token |

**Data contracts:** all internal API responses are versioned JSON (`{ "version": "1.0", "data": ..., "generated_at": ... }`) to allow the dashboard layer to evolve independently of the batch-job schema.

---

## 6. Background Jobs (GitHub Actions cron, extending existing `.github/workflows/gsc-daily.yml` pattern)

| Job | Trigger | Frequency | Timeout | Retry Policy | Monitoring | Failure Recovery |
|---|---|---|---|---|---|---|
| GSC/GA4/Marketcall ingestion + quality gate | Cron | Daily, 02:00 UTC | 15 min | 3 retries, 10 min apart | Sentry alert on failure; Slack/email notification | Previous day's validated snapshot remains authoritative; downstream jobs skip if today's gate fails |
| Cluster assignment refresh | Cron | Weekly | 30 min | 2 retries | Job-completion log in `page_clusters` | Falls back to last successful clustering if current run fails validation |
| Graph extraction + centrality/community/resilience | Cron | Weekly | 45 min | 2 retries | Alert if edge count deviates >20% from prior run (proxy for extraction bug) | Falls back to last successful graph snapshot |
| Bayesian posterior update | Cron | Daily | 20 min | 3 retries | Alert if any cluster's posterior variance spikes anomalously | Skip update for affected cluster, keep prior posterior, flag for manual review |
| Trust HMM update | Cron | Daily | 15 min | 3 retries | Alert on crawl-stat ingestion failure (upstream dependency) | Trust state decays toward prior automatically if no new data (by design, not a failure) |
| Forecast + changepoint scan | Cron | Daily | 20 min | 3 retries | Alert on changepoint detection (this IS the intended signal, routed to Intelligence/Governance) | N/A — changepoint alerts are expected output, not failures |
| Hypothesis lifecycle sweep (check open experiments for decision points) | Cron | Daily | 10 min | 2 retries | Alert if any hypothesis exceeds max time-in-state | Manual review queue entry created |
| Capital allocation recompute | Cron + event-triggered (VoI/changepoint) | Weekly (sprint boundary) + on-demand | 20 min | 2 retries | Alert if allocation deviates >30% period-over-period without a logged trigger reason | Revert to last approved allocation, flag for Governance review |
| MPC re-plan | Cron | Weekly (sprint boundary) | 30 min | 2 retries | Alert if planned sequence violates a velocity ceiling (should be impossible by construction — signals a bug) | Block execution, alert Governance |
| Outcome attribution sweep | Cron | Daily | 15 min | 3 retries | Alert if attribution backlog grows unbounded | Extend attribution window automatically per action-type rules before flagging as failure |

---

## 7. Dashboard Requirements

| Dashboard | Widgets | Metrics | Filters | Refresh | Drill-down |
|---|---|---|---|---|---|
| **Data Health** | Ingestion status per source, anomaly-gate pass/fail history, snapshot freshness | Days since last valid snapshot per source, anomaly count (trailing 30d) | Source, date range | Real-time (on job completion) | Click through to raw snapshot JSON |
| **Google Trust** | Trust-state distribution across clusters, trust trend over time, low-trust cluster list | % clusters by trust state, trust-state transition rate | State, service, trust level | Daily | Click through to cluster's crawl-stat history |
| **Experiments** | Hypothesis register (kanban by status), VoI ranking, diff-in-diff validation results | Open/validated/rejected counts, average time-to-resolution | Status, cluster, date range | Daily | Click through to full hypothesis provenance |
| **Capital Allocation** | Portfolio allocation by capital class, Kelly-sizing rationale, budget envelope vs. actual | Allocated vs. spent per class, realized return per class | Period, capital class | Weekly (sprint boundary) + on-demand recompute | Click through to underlying EV/risk inputs |
| **Forecasts** | Site/state/service aggregate forecast charts (Kalman), per-cluster GP bands, changepoint markers | Forecast error (backtested), calibration coverage | Scope (site/state/service/cluster), date range | Daily | Click through to raw time series |
| **Recommendations** | Ranked recommendation feed, confidence/evidence/alternatives panel, execution status | Auto-executed vs. human-reviewed count, acceptance rate | Status, cluster, confidence band | Real-time | Full Recommendation Ledger entry |
| **Revenue / Calls** | Qualified calls trend, revenue trend, attribution-window outcomes | Calls/day, revenue/day, attributed-vs-unattributed split | Date range, cluster | Daily | Click through to Marketcall raw record |
| **Governance** | Ashby's-Law repertoire audit, review-queue backlog, override log | Action-type diversity index, pending-review count, override frequency | Date range | Weekly | Click through to specific override rationale |

---

## 8. Validation Plan

| Level | Requirement | Example (Epic D, Bayesian Core) |
|---|---|---|
| Unit | Each computational function validated against synthetic data with known closed-form answer | Beta-Binomial posterior matches analytical solution for synthetic conjugate-prior test case |
| Integration | Layer-to-layer data contract validated | D correctly consumes C's graph metrics and B's confounder tags without silent type/null mismatches |
| Production | Shadow-mode run alongside existing `report_core.py` rule-based output for ≥ 4 weeks before replacing it | D2/D3 posteriors compared against D1 baseline and current rule-based thresholds; no regression in identified opportunities |
| Rollback | Every new layer has a documented "disable" path that reverts decision-making to the prior epic's output | If D3 (graph-regularized) underperforms D2 in backtest, system falls back to D2 via config flag, not a redeploy |

**No feature ships to production decision-making without a shadow-mode comparison period against the current baseline (existing rule-based `report_core.py` logic) — this is the standing validation gate for every epic B onward.**

---

## 9. Observability

| Module | Logs | Metrics | Alerts | Health Checks | Error Thresholds | Recovery Action |
|---|---|---|---|---|---|---|
| Ingestion (A) | Raw API request/response summaries | Snapshot completeness %, latency | Zero-data, auth failure, quota exceeded | Daily freshness check | > 0 zero-data days | Block downstream jobs, alert immediately |
| Clustering (B) | Cluster assignment diffs run-over-run | % pages unclustered, taxonomy/structure divergence rate | Divergence > 15% | Weekly completeness check | > 5% unclustered pages | Fall back to previous clustering, flag for review |
| Graph (C) | Edge/node count per run | Edge count delta, resilience-flag count | Edge count deviation > 20% | Weekly | N/A (investigate, not auto-fail) | Fall back to prior graph snapshot |
| Bayesian (D) | Posterior update diffs | Posterior variance distribution, backtest error | Variance spike, backtest regression | Daily | Backtest error > baseline + 2σ | Freeze posterior, alert, use last stable version |
| Trust (E) | HMM state transitions | Trust-state distribution | Sudden mass transition to "low trust" | Daily | > 10% clusters shift state in one day | Alert Governance, do not auto-act on the shift |
| Forecast (F) | Forecast vs. actual error log | Calibration coverage %, changepoint count | Coverage drops below 80% (for 80% intervals) | Daily | Coverage regression | Widen intervals conservatively, alert |
| Capital Allocation (I) | Allocation decisions + rationale | Allocation volatility period-over-period | Volatility > 30% unexplained | Weekly | N/A (Governance review) | Revert to last approved allocation |
| Experimentation (J) | Hypothesis state transitions | Time-in-state, validation pass rate | Hypothesis stuck > 2x expected horizon | Daily | N/A | Manual review queue entry |
| Governance (M) | Override log, review-queue actions | Override frequency, review latency | Override frequency spike | Real-time | N/A (Policy review trigger) | Escalate to Policy-level quarterly review early |
| All layers | Structured JSON logs to existing Sentry integration | — | — | — | — | Sentry is the existing, reused alerting backbone — no new alerting platform introduced |

---

## 10. Deployment Strategy

- **Development:** local Next.js dev server + local/staging Supabase project (separate from production DB) for all new tables (§4) during Epics A–D.
- **Staging:** a Supabase staging project mirroring production schema (existing `cities_data` read-only replica or seeded subset) — required because new tables interact with the live `cities_data` table via FK; never test new batch jobs against production DB directly.
- **Production rollout order:** A (data integrity) → B/C (structural layers, read-only additions, zero risk to live site) → D (Bayesian, shadow-mode only, no site changes) → E/F (additive, shadow-mode) → G (Policy sign-off, no code risk) → H/I (allocation logic, output reviewed by humans before any action taken) → J/K (experimentation, gated behind feature flag, initially applied to a single pilot cluster) → L/M/N (ledger, governance, closed loop — activated only after J/K pilot succeeds).
- **Feature flags:** every new decision-making layer (D onward) ships behind a flag defaulting to **shadow mode** (compute and log, do not act) until its validation gate (§8) passes.
- **Gradual rollout:** J/K (experimentation and planning) roll out to one pilot cluster (a single state×service combination with adequate traffic) before expanding — consistent with the Decision Velocity Layer's own philosophy (Epic H) applied to the engineering rollout itself.
- **Zero unnecessary downtime:** all new infrastructure (Postgres tables, Python batch jobs, API routes) is additive to the existing Next.js/Supabase/Netlify stack — no existing route, table, or job is modified during Epics A–L, so the live site is never at risk during this build-out. The only production-facing change window is Epic M (routing recommendations into an admin approval UI), deployed behind an auth-gated admin route.

---

## 11. Sprint Plan (2-week sprints, single engineer/small team pace)

| Sprint | Objectives | Deliverables | Dependencies | Duration | Success Criteria |
|---|---|---|---|---|---|
| 1 | Epic A: diagnose + fix GSC pipeline | A1.1, A1.2 shipped | — | 2 wks | 7 consecutive valid daily snapshots |
| 2 | Epic A: Marketcall verification + anomaly gate | A2, A3 shipped | Sprint 1 | 2 wks | Marketcall cross-checked against 10 real calls; gate live |
| 3 | Epic B: cluster schema + taxonomy assignment | B1, B4 shipped | Sprint 1-2 | 2 wks | 100% pages clustered |
| 4 | Epic C: graph extraction + centrality | C1, C2 shipped | Sprint 3 | 2 wks | Graph rebuild automated weekly |
| 5 | Epic B/C: community detection + resilience | B2, B3, C3, C4 shipped | Sprint 3-4 | 2 wks | Divergence report + critical-hub list produced |
| 6 | Epic D: baseline Bayesian shrinkage | D1 shipped, shadow mode | Sprint 3-5 | 2 wks | Posteriors computed for all clusters |
| 7 | Epic D: confounder adjustment + backtest harness | D2, D4 shipped | Sprint 6 | 2 wks | Backtest shows D2 ≥ D1 on holdout |
| 8 | Epic D: graph-regularization | D3 shipped | Sprint 4, 7 | 2 wks | Backtest shows D3 ≥ D2, or documented decision to keep D2 |
| 9 | **MVP checkpoint** — replace `report_core.py` rule-based thresholds with D-series posteriors in shadow mode reporting | MVP delivered (see §13) | Sprint 8 | 1 wk | Weekly report uses calibrated posteriors; human-reviewed for 2 cycles |
| 10-11 | Epic E: Trust layer | E1-E4 shipped, shadow mode | Sprint 2 | 4 wks | Trust posteriors integrated as D covariate |
| 12-13 | Epic F: Forecasting + changepoint | F1-F4 shipped | Sprint 8 | 4 wks | Calibration backtest passes |
| 14 | Epic G: utility function elicitation + encoding | G1-G3 shipped | Sprint 9 | 2 wks | Signed-off utility weights v1 |
| 15-16 | Epic H: velocity constraints | H1-H3 shipped | Sprint 10-11 | 4 wks | Ceilings computed and enforced in a dry-run |
| 17-19 | Epic I: capital allocation engine | I1-I4 shipped, shadow mode | Sprint 14, 16 | 6 wks | Allocation reproducible, auditable |
| 20-23 | Epic J: experimentation framework, pilot cluster | J1-J5 shipped | Sprint 12, 19 | 8 wks | 5 experiments run end-to-end on pilot cluster |
| 24-27 | Epic K: simulation & planning | K1-K4 shipped | Sprint 19, 23 | 8 wks | MPC backtest beats greedy baseline |
| 28-29 | Epic L: explainability ledger | L1-L3 shipped | Sprint 27 | 4 wks | 100% recommendations logged with full provenance |
| 30-32 | Epic M: governance layer, admin approval UI | M1-M4 shipped | Sprint 28 | 6 wks | Confidence-gated fallback operational |
| 33-34 | Epic N: closed-loop monitoring | N1-N4 shipped | Sprint 32 | 4 wks | 4 consecutive unattended closed-loop cycles |
| Ongoing | Epic O: Tier 3 gate monitoring | Gate-criteria tracking only | N | — | Revisit when data-maturity criteria met |

---

## 12. Business Priority Matrix

| Feature/Epic | Effort | Business Impact | Technical Risk | Dependency Importance | Priority Rank |
|---|---|---|---|---|---|
| A — Data Integrity | Low | Critical (blocks everything) | Low | Blocks all | **1** |
| B — Clustering | Medium | High (enables valid statistics) | Low | Blocks D | **2** |
| C — Graph Layer | Medium | High (defensibility, linking ROI) | Low | Feeds D, I | **3** |
| D — Bayesian Core | High | Very High (core decision quality) | Medium | Feeds everything downstream | **4** |
| G — Objective Function | Low | Critical (wrong objective = wasted effort everywhere) | Low | Gates I, K | **5** |
| E — Trust Layer | Medium | High | Medium | Improves D | **6** |
| F — Forecasting | High | High | Medium | Feeds I, K | **7** |
| H — Velocity Constraints | Medium | Medium-High (risk prevention) | Low | Gates I, K | **8** |
| I — Capital Allocation | High | Very High | Medium-High | Feeds K | **9** |
| J — Experimentation | High | High | Medium | Feeds K, N | **10** |
| K — Simulation/Planning | High | High | High | Feeds L | **11** |
| L — Explainability | Medium | Medium (trust/audit, not direct revenue) | Low | Gates M | **12** |
| M — Governance | Medium | Critical (safety) | Medium | Gates N | **13** |
| N — Closed Loop | Medium | Very High (makes it self-improving) | Medium | Completes system | **14** |
| O — Tier 3 | High | Unknown/speculative | High | Gated, not prioritized | **N/A — do not schedule** |

**Ranking logic:** low-effort/high-impact/low-risk items (A, G) are pulled forward regardless of their position in the dependency chain where possible; high-risk, high-effort items (K, I) are sequenced after their statistical foundations (D, F) are validated in shadow mode, not before.

---

## 13. Immediate MVP

**MVP scope: Epics A + B + C + D1/D2 (Sprints 1–7), delivered as a shadow-mode upgrade to the existing weekly report (`report_core.py`).**

**What it delivers:** the current rule-based opportunity identification (`report_core.py::identify_opportunities`, fixed thresholds like "impressions ≥ 100 & CTR < 2%") is replaced with confidence-aware, cluster-pooled, confounder-adjusted Bayesian posteriors — surfaced alongside (not yet replacing) the existing report during a human-reviewed shadow period.

**Why these components first:**
- **A is non-negotiable** — every other layer inherits corrupted data if skipped; this alone is likely the single highest-ROI fix available.
- **B and C are cheap, low-risk, and structurally necessary** — clustering and the link graph are prerequisites for every statistical layer that follows; they also independently produce two immediately useful artifacts (the under-linked-page report and the resilience/critical-hub report) even before D ships.
- **D1/D2 (not D3) is the right MVP cutoff** — flat hierarchical shrinkage with confounder adjustment already fixes the two biggest scientific flaws in the current rule-based system (ignoring sample-size uncertainty, and ignoring confounding) without requiring the graph-regularization refinement (D3) or any of the higher layers (trust, forecasting, allocation, planning) that need more build-out time to pay for themselves.
- **Explicitly excluded from MVP:** Trust layer, forecasting, capital allocation, experimentation, planning, governance, and explainability — all valuable, none required to materially improve decision quality over the current fixed-threshold rules, and all correctly sequenced later once their own prerequisites (a working D layer to build on) exist.

**MVP success metric:** in a 4-week shadow-mode comparison, the Bayesian-posterior-driven opportunity list should (a) never recommend an action the rule-based system would have missed for a low-sample-size false-positive reason, and (b) surface at least a few high-value opportunities the fixed-threshold rules missed due to insufficient individual-page sample size that cluster-pooling resolves.

---

## 14. Technical Debt Register

| Item | Type | Description | Future Refactor |
|---|---|---|---|
| Marketcall interim solution | Shortcut | If API verification (A2) fails, a manual CSV import job is an acceptable interim | Replace with verified API integration once Marketcall confirms API availability |
| Content-change log backfill gap | Known limitation | Git history only captures code-deployed content changes; CMS-driven edits before logging existed are unrecoverable | Accept the gap; log only prospectively from Epic B onward |
| Cluster-level (not page-level) computation | Design limitation (intentional, per scalability principle) | Individual page nuance is smoothed by cluster pooling | Not a "fix" — this is correct by design; revisit only if per-page label density increases by orders of magnitude (same gate as Phase 2/4's ML/GNN rejection) |
| Trust HMM cold-start | Known limitation | Insufficient crawl-stat history at launch will produce wide, low-confidence trust posteriors | Expected to self-resolve after ~2-3 months of E1 data accumulation; document, do not force |
| DP/MCTS simulator fidelity (Epic K) | Known limitation | Planning quality is bounded by D/F model accuracy — errors compound across multi-step plans | Mitigated by MPC's receding-horizon re-planning (re-plan every sprint, limiting damage window); documented as an inherent limitation of model-based planning, not a bug to fix |
| Admin approval UI (Epic M) minimal viable version | Shortcut | Initial version may be a simple internal table view + approve/reject button, not a polished UI | Revisit UI/UX investment only after Governance workflow is validated functionally |
| Epic O (Tier 3) | Deliberately deferred | DBN/semi-Markov/hybrid-RL/contest-theory not built | Tracked via explicit data-maturity gate criteria from Phases 2-4; revisit only when criteria met, not on a calendar-driven schedule |

---

## 15. Summary

This plan is directly executable starting with **Sprint 1 (Epic A)** without further architectural decisions. It reuses the existing Next.js/Supabase/Python/GitHub-Actions/Sentry stack throughout, introduces no new platforms, modifies zero existing production tables or routes before Epic M, and defines a concrete, high-confidence MVP (Sprints 1–9) that improves decision quality measurably before any of the more ambitious capital-allocation, experimentation, or planning layers are built. Epics E onward are feature-decomposed but intentionally not task-decomposed yet, consistent with rolling-wave planning practice, and will be broken down further at the start of their respective sprint blocks.
