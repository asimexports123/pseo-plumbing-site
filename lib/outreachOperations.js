// ── Outreach Operations System ────────────────────────────────────
// Lightweight tracking system for managing outreach campaigns.
// This is a data structure definition — no actual sending occurs.
// Phase 9: Build outreach operations system
// Phase 11: First-batch readiness (10-20 targets)

export const OUTREACH_TRACKER_SCHEMA = {
  fields: {
    id:               'string — unique record ID',
    prospectId:       'string — references INITIAL_PROSPECTS id',
    domain:           'string — prospect domain',
    targetUrl:        'string — prospect page URL where link would appear',
    campaignSegment:  'enum — A | B | C | D | E',
    contactRoute:     'enum — email | contact_form | linkedin | twitter',
    contactEmail:     'string — public contact email (if found)',
    contactName:      'string — public contact name (if found)',
    subject:          'string — email subject line',
    body:             'string — email body (references PERSONALIZED_DRAFTS)',
    targetAsset:      'string — YoHomeFix URL being promoted',
    status:           'enum — draft | approved | sent | responded | linked | declined | follow_up_1 | follow_up_2 | closed',
    sentDate:         'string ISO date',
    responseDate:     'string ISO date',
    responseNotes:    'string — summary of response',
    linkAcquiredUrl:  'string — URL where backlink was placed (if any)',
    linkAcquiredDate: 'string ISO date — when link was detected',
    linkVerified:     'boolean — has link been manually verified',
    followUp1Date:    'string ISO date — first follow-up sent',
    followUp2Date:    'string ISO date — second follow-up sent',
    notes:            'string — additional context',
  },
};

// ── First Batch: 10 Highest-Priority Targets ──────────────────────
// These are the top 10 prospects ready for first-batch outreach.
// Each requires: human review of draft, verified contact route,
// and explicit user authorization before sending.

export const FIRST_BATCH = [
  {
    prospectId: 'arizona-daily-star',
    domain: 'tucson.com',
    campaignSegment: 'B',
    whySelected: 'Tucson is #1 hardest city (344 mg/L). Strongest local data angle. Home & garden section is a natural fit.',
    contactRoute: 'email',
    contactEmail: 'TO_RESEARCH — check tucson.com staff directory for home & garden editor',
    draftReference: 'arizona-daily-star (PERSONALIZED_DRAFTS[0])',
    targetAsset: '/research/us-water-hardness-plumbing-risk',
    status: 'draft',
    priority: 1,
  },
  {
    prospectId: 'this-old-house',
    domain: 'thisoldhouse.com',
    campaignSegment: 'C',
    whySelected: 'Major home improvement publisher with extensive water heater/softener content. High authority domain.',
    contactRoute: 'email',
    contactEmail: 'TO_RESEARCH — check thisoldhouse.com about/contact page for editorial team',
    draftReference: 'this-old-house (PERSONALIZED_DRAFTS[1])',
    targetAsset: '/research/us-water-hardness-plumbing-risk',
    status: 'draft',
    priority: 2,
  },
  {
    prospectId: 'water-quality-association',
    domain: 'wqa.org',
    campaignSegment: 'E',
    whySelected: 'Top water quality industry authority. Consumer education alignment. Potential for widget embed partnership.',
    contactRoute: 'email',
    contactEmail: 'TO_RESEARCH — check wqa.org contact page',
    draftReference: 'water-quality-association (PERSONALIZED_DRAFTS[2])',
    targetAsset: '/research/us-water-hardness-plumbing-risk',
    status: 'draft',
    priority: 3,
  },
  {
    prospectId: 'data-world',
    domain: 'data.world',
    campaignSegment: 'A',
    whySelected: 'Open data platform. CC BY 4.0 dataset is a natural fit. Plumbing risk score is a unique differentiator.',
    contactRoute: 'email',
    contactEmail: 'TO_RESEARCH — check data.world about/contact page',
    draftReference: 'data-world (PERSONALIZED_DRAFTS[3])',
    targetAsset: '/research/us-water-hardness-plumbing-risk',
    status: 'draft',
    priority: 4,
  },
  {
    prospectId: 'boston-globe',
    domain: 'bostonglobe.com',
    campaignSegment: 'B',
    whySelected: 'Boston is now #1 softest city (8 mg/L). Soft water corrosion angle is unique. Major metro newspaper.',
    contactRoute: 'email',
    contactEmail: 'TO_RESEARCH — check bostonglobe.com staff directory for lifestyle/home editor',
    draftReference: 'boston-globe (PERSONALIZED_DRAFTS[4])',
    targetAsset: '/research/us-water-hardness-plumbing-risk',
    status: 'draft',
    priority: 5,
  },
  {
    prospectId: 'consumer-reports-water',
    domain: 'consumerreports.org',
    campaignSegment: 'C',
    whySelected: 'Major consumer publication. Water softener buying guide is a perfect contextual fit. High authority.',
    contactRoute: 'email',
    contactEmail: 'TO_RESEARCH — check consumerreports.org contact/editorial page',
    draftReference: 'consumer-reports-water (PERSONALIZED_DRAFTS[5])',
    targetAsset: '/research/us-water-hardness-plumbing-risk',
    status: 'draft',
    priority: 6,
  },
  {
    prospectId: 'the-spruce',
    domain: 'thespruce.com',
    campaignSegment: 'C',
    whySelected: 'Major home content publisher. Water softener buying guide is directly relevant. Large audience.',
    contactRoute: 'email',
    contactEmail: 'TO_RESEARCH — check thespruce.com about/contact page',
    draftReference: 'the-spruce (PERSONALIZED_DRAFTS[6])',
    targetAsset: '/research/us-water-hardness-plumbing-risk',
    status: 'draft',
    priority: 7,
  },
  {
    prospectId: 'bob-vila',
    domain: 'bobvila.com',
    campaignSegment: 'C',
    whySelected: 'Well-known home improvement brand. Water softener articles are a natural fit for city-level data link.',
    contactRoute: 'email',
    contactEmail: 'TO_RESEARCH — check bobvila.com contact page',
    draftReference: 'Use article_update template with Bob Vila specifics',
    targetAsset: '/research/us-water-hardness-plumbing-risk',
    status: 'draft',
    priority: 8,
  },
  {
    prospectId: 'family-handyman',
    domain: 'familyhandyman.com',
    campaignSegment: 'C',
    whySelected: 'Major DIY publisher. Plumbing section covers hard water issues. Original research adds value.',
    contactRoute: 'email',
    contactEmail: 'TO_RESEARCH — check familyhandyman.com contact/editorial page',
    draftReference: 'Use resource_page template with Family Handyman specifics',
    targetAsset: '/research/us-water-hardness-plumbing-risk',
    status: 'draft',
    priority: 9,
  },
  {
    prospectId: 'purewaterblog',
    domain: 'purewaterblog.com',
    campaignSegment: 'C',
    whySelected: 'Writes city-specific water hardness articles. Already cites similar data sources. Natural reference fit.',
    contactRoute: 'email',
    contactEmail: 'TO_RESEARCH — check purewaterblog.com contact page',
    draftReference: 'purewaterblog (PERSONALIZED_DRAFTS[7])',
    targetAsset: '/research/us-water-hardness-plumbing-risk',
    status: 'draft',
    priority: 10,
  },
];

// ── Sending Capability Assessment ─────────────────────────────────
// Phase 10: Determine current legitimate email-sending capability

export const SENDING_CAPABILITY = {
  currentStatus: 'NOT_READY',
  requirements: [
    {
      item: 'Dedicated sending domain or subdomain',
      status: 'NOT_CONFIGURED',
      notes: 'Need a subdomain like outreach.yohomefix.com or use existing domain with proper SPF/DKIM/DMARC records',
    },
    {
      item: 'SPF record including sending IP/service',
      status: 'UNKNOWN',
      notes: 'Check DNS records for yohomefix.com SPF configuration',
    },
    {
      item: 'DKIM signing configured',
      status: 'UNKNOWN',
      notes: 'Need DKIM keys set up for sending domain',
    },
    {
      item: 'DMARC policy published',
      status: 'UNKNOWN',
      notes: 'Need DMARC TXT record in DNS',
    },
    {
      item: 'Email sending service (e.g., Gmail, Outlook, or dedicated tool)',
      status: 'NOT_SELECTED',
      notes: 'For 10-20 emails, a regular Gmail/Outlook account is sufficient. For scale, consider a dedicated tool.',
    },
    {
      item: 'Sender identity (real person name and email)',
      status: 'NOT_DEFINED',
      notes: 'Need a real person to send as. Do not use fake identities. Can use a role address like research@yohomefix.com if it has a human reply-to.',
    },
    {
      item: 'Reply monitoring process',
      status: 'NOT_DEFINED',
      notes: 'Need a process to check for and respond to replies within 48 hours',
    },
  ],
  recommendation: 'For the first batch of 10 emails, a standard Gmail or Outlook business account is sufficient. No need for dedicated sending infrastructure yet. Ensure SPF/DKIM/DMARC are configured for the sending domain. Each email must be sent manually by a human — no automated sending.',
  volumeGuidance: {
    firstBatch: '10 emails — manual sending from business email account',
    secondBatch: '10-15 emails — same manual approach',
    scaling: 'Above 25 total, consider a dedicated sending tool (e.g., Mailshake, Lemlist) with proper warmup',
    daily: 'Maximum 10 emails per day to protect deliverability',
    followUp: 'Maximum 2 follow-ups per prospect, 7-day minimum intervals',
  },
};

// ── Backlink Monitoring Foundation ────────────────────────────────
// Phase 13: Practical method to track earned links

export const BACKLINK_MONITORING = {
  method: 'manual_check_plus_alerts',
  tools: [
    {
      tool: 'Google Alerts',
      setup: 'Set up alert for "yohomefix.com" and "yohomefix" to catch new mentions',
      cost: 'free',
      frequency: 'real-time',
    },
    {
      tool: 'Google Search Console',
      setup: 'Monitor referring domains in GSC Links report',
      cost: 'free',
      frequency: 'weekly check',
    },
    {
      tool: 'Manual site:search',
      setup: 'For each contacted prospect, run site:prospectdomain.com yohomefix.com to check for placed links',
      cost: 'free',
      frequency: '2 weeks after outreach, then monthly',
    },
    {
      tool: 'Ahrefs/SEMrush (if available)',
      setup: 'Monitor new referring domains and backlinks to yohomefix.com/research/*',
      cost: 'paid (if user has subscription)',
      frequency: 'weekly',
    },
  ],
  trackingFields: {
    linkingDomain:    'string — domain that placed the link',
    linkingUrl:       'string — exact URL where link appears',
    destinationUrl:   'string — YoHomeFix URL linked to',
    linkType:         'enum — contextual | resource_list | author_bio | embed_attribution',
    detectedDate:     'string ISO date',
    campaignSource:   'string — prospectId from outreach tracker',
    status:           'enum — detected | verified | lost',
    notes:            'string — additional context',
  },
  process: [
    '1. After sending outreach, set a reminder to check in 14 days',
    '2. Run site:prospectdomain.com yohomefix.com in Google',
    '3. If link found, record in backlink log with URL and date',
    '4. Verify link is dofollow/nofollow and contextual',
    '5. Check GSC for new referring domains weekly',
    '6. Update prospect status to "linked" in outreach tracker',
  ],
};
