// ── SEO Measurement Baseline — Sprint #5 ──────────────────────────
// Phase 15: Record pre-outreach SEO state for before/after comparison.
// This is a data record, not executable code. Update after outreach
// campaigns to measure impact.

export const SEO_BASELINE = {
  sprint: 'Sprint #5 — Water Hardness Research Credibility + Outreach Prep',
  baselineDate: '2026-01-23',
  baselineNotes: 'Recorded after completing data corrections, provenance updates, and internal linking improvements. Before any outreach has been sent.',

  // ── Research Page Metrics ──
  researchPage: {
    url: '/research/us-water-hardness-plumbing-risk',
    title: 'US City Water Hardness & Plumbing Risk Index | YoHomeFix Research',
    metaDescription: 'Water hardness data for 155 US cities with plumbing risk scoring. Search, sort, and compare water hardness levels (mg/L CaCO₃) and infrastructure risk across the United States.',
    canonical: 'https://yohomefix.com/research/us-water-hardness-plumbing-risk',
    wordCount: '~3,500 (page content + methodology + dataset table)',
    schemaTypes: ['WebPage', 'Dataset', 'BreadcrumbList'],
    internalLinksAdded: [
      'Top 10 hardest cities → water-softener-repair city pages',
      'Top 10 softest cities → water-heater-repair city pages',
      'Lookup result → emergency plumber city page (existing)',
      'Lookup result → water-softener-repair (hardness > 120 mg/L, new)',
      'Lookup result → water-heater-repair (hardness > 180 mg/L, new)',
      'Related Resources → hard-water-effects-on-plumbing guide',
      'Related Resources → water-heater-maintenance-guide',
      'Related Resources → signs-you-need-a-plumber guide',
    ],
    embedPage: {
      url: '/research/embed',
      status: 'live',
      purpose: 'Embeddable widget for third-party sites',
    },
  },

  // ── Sitemap & Indexation ──
  indexation: {
    researchPageInSitemap: true,
    embedPageInSitemap: false,
    sitemapLastVerified: '2026-01-23',
    buildStatus: 'passing',
  },

  // ── Data Quality Metrics ──
  dataQuality: {
    totalCities: 155,
    tierAVerified: 18,
    tierBCompiled: '~120 (estimated, from public databases)',
    tierCEstimated: '~17 (estimated, representative values)',
    hardnessValuesCorrected: 18,
    provenanceModel: 'tiered (A/B/C)',
    lastVerifiedDate: 'January 2026',
    license: 'CC BY 4.0',
  },

  // ── Outreach Readiness ──
  outreach: {
    totalProspects: 46,
    gradeA: 10,
    gradeB: 24,
    gradeD: 1,
    removed: 13,
    personalizedDrafts: 8,
    firstBatchSize: 10,
    firstBatchStatus: 'draft — awaiting contact research and user authorization',
    sendingCapability: 'NOT_READY — requires SPF/DKIM/DMARC verification and sender identity',
  },

  // ── Metrics to Track Post-Outreach ──
  // Update these fields after outreach campaigns to measure impact.
  // Source: Google Search Console, Google Analytics, manual link checks.
  metricsToTrack: {
    searchConsole: {
      impressions: 'TO_RECORD — GSC Performance report for /research/us-water-hardness-plumbing-risk',
      clicks: 'TO_RECORD — GSC Performance report',
      averagePosition: 'TO_RECORD — GSC Performance report',
      ctr: 'TO_RECORD — GSC Performance report',
      queryCount: 'TO_RECORD — count of unique queries returning this page',
      topQueries: 'TO_RECORD — top 20 queries from GSC',
    },
    backlinks: {
      totalReferringDomains: 'TO_RECORD — from GSC Links report or Ahrefs/SEMrush',
      researchPageBacklinks: 'TO_RECORD — links specifically to /research/*',
      newLinksFromOutreach: 0,
      linkAcquisitionLog: [],
    },
    commercial: {
      researchToCommercialClicks: 'TO_RECORD — GA4 flow from /research/* to commercial pages',
      topCommercialDestinations: 'TO_RECORD — which city/service pages get most traffic from research',
      callVolumeFromResearch: 'TO_RECORD — if call tracking is available',
    },
    engagement: {
      avgTimeOnPage: 'TO_RECORD — GA4',
      bounceRate: 'TO_RECORD — GA4',
      scrollDepth: 'TO_RECORD — GA4 scroll tracking',
      lookupToolUsage: 'TO_RECORD — event tracking for lookup button clicks',
    },
  },

  // ── Measurement Schedule ──
  measurementSchedule: {
    firstCheck: '2 weeks after first outreach batch sent',
    ongoing: 'Monthly for 6 months, then quarterly',
    gscDataLag: 'GSC data has 3-day lag — account for this in reporting',
    successThresholds: {
      backlinks: '5+ referring domains within 3 months = success',
      impressions: '50%+ increase in GSC impressions within 6 months = success',
      commercialClicks: 'Measurable click flow from research to commercial pages within 3 months = success',
      rankings: 'Top 10 for "water hardness [city]" queries within 6 months = success',
    },
  },
};
