# YoHomeFix Daily Lead-Generation Analytics

Read-only analytics pipeline for Google Search Console, Google Analytics 4, and Marketcall.

**Goal:** hit 20 qualified calls per day by identifying data-backed opportunities every morning.

## What it does

Every day it pulls:

- **Google Search Console**
  - Impressions, clicks, CTR, and average position for every page.
  - Query-level performance.
  - Indexing/sitemap status (optional).

- **Google Analytics 4**
  - Users, sessions, landing pages, traffic sources.
  - `call_click` events by page and CTA label.
  - Conversion paths (landing page → source/medium → call).

- **Marketcall**
  - Call records and landing-page attribution when API access is configured.
  - Qualified/billable call status when supported.

It then writes:

- `reports/daily-YYYYMMDD.md` — human-readable report.
- `reports/daily-YYYYMMDD.json` — raw data for further analysis.

## Install

```bash
cd scripts/analytics
pip install -r requirements.txt
```

## Configure access

### Google Search Console + GA4

1. In [Google Cloud Console](https://console.cloud.google.com/), create a service account with **read-only** roles:
   - `Search Console Viewer`
   - `Analytics Viewer`
   - `Viewer`
2. Download the JSON key.
3. Place it in `scripts/analytics/service-account.json` **or** set the env var `GOOGLE_SERVICE_ACCOUNT_JSON`.
4. Add the service account email as a **read-only** user in:
   - [Google Search Console](https://search.google.com/search-console) for the property `sc-domain:yohomefix.com`
   - [GA4 Admin](https://analytics.google.com/) for the YoHomeFix property.
5. Set environment variables if the defaults don't match:
   - `GSC_PROPERTY` (default: `sc-domain:yohomefix.com`)
   - `GA4_PROPERTY_ID` (numeric property ID)

### Marketcall

1. Get an API key or report export URL from your Marketcall account manager.
2. Set:
   - `MARKETCALL_API_KEY`
   - `MARKETCALL_API_BASE` (if different from `https://api.marketcall.com`)
   - `CAMPAIGN_ID` (already set to 348734 in `config.py`)

If Marketcall does not provide an API, the report can be skipped or fed a manual CSV export.

## Run a daily report

```bash
# Default: yesterday
python scripts/analytics/weekly_report.py --daily

# Weekly rollup
python scripts/analytics/weekly_report.py --weekly

# Custom range
python scripts/analytics/weekly_report.py 2026-07-24 2026-07-30
```

## Output sections

- **20 Calls/Day Gap Analysis** — current impressions, CTR, CVR, and gap to 20 calls
- **Top 20 landing pages by impressions**
- **Top call-generating pages**
- **CTR opportunities** — high impressions, low CTR (fix title/meta/CTA)
- **Ranking opportunities** — pages at positions 5–30 that can move into top 5
- **Pages needing improvement** — high impressions but no calls, and zero-click pages

## 20 calls/day math

```
calls = impressions × CTR × call_conversion_rate
```

To reach 20 calls/day, we will attack the highest-leverage part of the funnel each day:

1. **More impressions** — pages ranking 5-30 pushed into top 5.
2. **Higher CTR** — titles and meta optimized for commercial intent.
3. **Higher CVR** — CTAs, trust, and page speed improvements on pages that already get clicks.

## Security

- All scripts are **read-only**. They do not modify the site, deploy, or submit URLs.
- Credentials stay in `scripts/analytics/` and are not committed.
