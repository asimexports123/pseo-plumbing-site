# Google Search Console API Setup Guide

## What You Need to Provide

You need a **Google Cloud Service Account** with Search Console API access. Here's exactly how to set it up:

### Step 1 — Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown → **New Project**
3. Name it `yohomefix-gsc` (or anything you like)
4. Click **Create**

### Step 2 — Enable the Search Console API

1. In the Cloud Console, go to **APIs & Services → Library**
2. Search for **Google Search Console API**
3. Click it → **Enable**

### Step 3 — Create a Service Account

1. Go to **APIs & Services → Credentials**
2. Click **Create Credentials → Service Account**
3. Name it `gsc-reporter`
4. Click **Create and Continue** → **Done**
5. Click on the service account you just created
6. Go to the **Keys** tab
7. Click **Add Key → Create New Key → JSON**
8. A `.json` file will download — **keep this safe, it's your only copy**

### Step 4 — Add the Service Account to Search Console

1. Open the downloaded JSON file. Find the `client_email` field — it looks like:
   ```
   gsc-reporter@yohomefix-gsc.iam.gserviceaccount.com
   ```
2. Go to [Google Search Console](https://search.google.com/search-console)
3. Select `yohomefix.com`
4. Go to **Settings → Users and permissions**
5. Click **Add user**
6. Paste the service account email
7. Set permission to **Restricted** (read-only is sufficient)
8. Click **Add**

### Step 5 — Set Environment Variables

Create or update your `.env` file with these three values from the JSON key file:

```bash
GSC_SERVICE_ACCOUNT_EMAIL=gsc-reporter@yohomefix-gsc.iam.gserviceaccount.com
GSC_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQ...\n-----END PRIVATE KEY-----\n"
GSC_SITE_URL=https://yohomefix.com/
```

**Important:** Copy the `private_key` value exactly as-is from the JSON file, including the `\n` characters. Wrap it in double quotes.

### Step 6 — For GitHub Actions (Daily Automation)

Add the same three values as repository secrets:

1. Go to your GitHub repo → **Settings → Secrets and Variables → Actions**
2. Add these secrets:
   - `GSC_SERVICE_ACCOUNT_EMAIL` — the service account email
   - `GSC_PRIVATE_KEY` — the full private key string (with `\n` characters)
   - `GSC_SITE_URL` — `https://yohomefix.com/`

3. The workflow in `.github/workflows/gsc-daily.yml` will run automatically at 6:00 AM UTC daily.

---

## Usage

### Fetch today's data (local)
```bash
node scripts/gsc-report.js fetch
```

### Fetch a specific date
```bash
node scripts/gsc-report.js fetch 2025-08-01
```

### Generate a 7-day comparison report
```bash
node scripts/gsc-report.js report 7
```

### Generate a 14-day comparison report
```bash
node scripts/gsc-report.js report 14
```

### Check status
```bash
node scripts/gsc-report.js status
```

---

## Architecture

```
scripts/gsc-report.js          — Main script (fetch, report, status)
gsc-data/                      — Daily JSON snapshots (auto-created)
  snapshot-2025-08-01.json     — One file per day
  snapshot-2025-08-02.json
  ...
.github/workflows/gsc-daily.yml — GitHub Actions cron job
```

### Data Flow

```
GSC API → fetch command → JSON snapshot file (one per day)
                                    ↓
              report command → loads recent N + prior N snapshots
                                    ↓
              aggregates, compares, outputs report to stdout
```

### No External Dependencies

The script uses only Node.js built-in modules (`fs`, `path`, `crypto`) and the global `fetch` API (available in Node 18+). No npm packages to install.

### Data Retention

- JSON snapshots are stored indefinitely in `gsc-data/`
- GitHub Actions workflow commits them to the repo
- Report artifacts are retained for 90 days
- Delete old snapshots manually if needed: `rm gsc-data/snapshot-2025-07-*.json`

---

## Report Format

The report compares two equal-length periods (e.g., last 7 days vs prior 7 days):

1. **Overall Summary** — Total impressions, clicks, CTR, and changes
2. **Top 100 Pages by Impressions** — URL, impressions, clicks, CTR, position
3. **Top 100 Queries by Impressions** — Query, impressions, clicks, CTR, position
4. **Biggest Ranking Gains** — Pages where position improved (prior vs recent)
5. **Biggest Ranking Losses** — Pages where position worsened
6. **CTR Changes** — Pages with notable CTR gains or losses
7. **New Queries** — Queries that appeared in recent period but not prior
8. **Lost Queries** — Queries that were in prior period but not recent
9. **Device Breakdown** — Mobile, desktop, tablet performance

---

## Monitoring After Title/Meta Changes

To track the impact of the title/meta optimization:

1. Run `fetch` daily (or let GitHub Actions do it)
2. After 14 days, run: `node scripts/gsc-report.js report 14`
3. Compare:
   - **CTR changes** — Did CTR improve on the top 50 pages?
   - **Ranking gains** — Did positions improve?
   - **New queries** — Did shorter titles capture new search terms?
   - **Impression changes** — Did impressions increase or decrease?

4. Do NOT make further SEO changes until you have 14 days of post-deployment data.
