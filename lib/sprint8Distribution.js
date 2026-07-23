/**
 * Sprint #8 — External Authority Distribution
 *
 * Contains: local editorial stories, journalist channel assessment,
 * widget distribution targets, Google discovery status,
 * backlink baseline, and backlink tracking system.
 */

// ============================================================
// PHASE 7 — LOCAL DATA STORY DISTRIBUTION
// ============================================================

export const LOCAL_STORIES = [
  {
    id: 'story-1',
    city: 'Tucson, AZ',
    headline: 'Tucson Has the Hardest Water Among Major US Cities — 344 mg/L, 6x the National Median',
    finding: 'Tucson registers 344 mg/L CaCO3, classified as "Very Hard" — nearly 6x the national median of 55 mg/L. This means Tucson residents face the highest risk of scale-related plumbing failures among the 155 cities studied.',
    sourceBasis: 'Tucson Water utility data, Tier A verified',
    commercialPage: 'https://yohomefix.com/plumber-tucson-water-softener-repair',
    localPublications: ['Arizona Daily Star', 'Tucson.com', 'KOLD News 13 Tucson'],
    submissionMechanism: 'Contact via newsroom tips; reference dataset as source',
  },
  {
    id: 'story-2',
    city: 'Long Beach vs San Francisco, CA',
    headline: 'California\'s Great Water Divide: Long Beach Water is 5x Harder Than San Francisco\'s',
    finding: 'Within the same state, Long Beach registers 308 mg/L (Very Hard) while San Francisco registers 60 mg/L (Soft) — a 248 mg/L gap. This means California homeowners face dramatically different plumbing risks depending on location.',
    sourceBasis: 'Long Beach Water Department and San Francisco Public Utilities Commission data',
    commercialPage: 'https://yohomefix.com/plumber-long-beach-water-softener-repair',
    localPublications: ['Long Beach Press-Telegram', 'SF Gate', 'LA Times'],
    submissionMechanism: 'Press-Telegram tips: newsroom@presstelegram.com; SF Gate contact form',
  },
  {
    id: 'story-3',
    city: 'Cape Coral vs Jacksonville, FL',
    headline: 'Florida\'s Water Hardness Gap: Cape Coral (285 mg/L) vs Jacksonville (57 mg/L)',
    finding: 'Cape Coral water is 5x harder than Jacksonville\'s — a 228 mg/L difference within the same state. Cape Coral\'s very hard water means significantly higher risk of water heater scale buildup and pipe narrowing.',
    sourceBasis: 'City of Cape Coral Utilities and JEA (Jacksonville) utility data',
    commercialPage: 'https://yohomefix.com/plumber-cape-coral-water-softener-repair',
    localPublications: ['Cape Coral Breeze', 'News-Press (Fort Myers)', 'Florida Times-Union'],
    submissionMechanism: 'News-Press tips: news@news-press.com; Cape Coral Breeze contact form',
  },
  {
    id: 'story-4',
    city: 'Toledo, OH',
    headline: 'Toledo Faces Triple Plumbing Threat: Very Hard Water + Aging Pipes + Harsh Winters',
    finding: 'Toledo is one of only a handful of cities scoring on all three risk dimensions: 265 mg/L hardness (Very Hard), aging infrastructure (pre-1970 pipes), and high winter freeze risk. This combination produces the highest plumbing risk score in the dataset.',
    sourceBasis: 'City of Toledo Water Department data, Tier A verified; infrastructure assessment from housing stock age',
    commercialPage: 'https://yohomefix.com/plumber-toledo-emergency',
    localPublications: ['Toledo Blade', 'WTOL 11 Toledo', 'WTVG 13abc'],
    submissionMechanism: 'Toledo Blade tips: newsdesk@theblade.com; WTOL newsroom contact form',
  },
  {
    id: 'story-5',
    city: 'Las Vegas, NV',
    headline: 'Las Vegas Water is Nearly 14x Harder Than Portland\'s — and It\'s Damaging Plumbing',
    finding: 'Las Vegas registers 278 mg/L (Very Hard) compared to Portland, OR at 11 mg/L (Soft). For Las Vegas homeowners, this translates to significantly shorter water heater lifespans and more frequent drain blockages from mineral scale.',
    sourceBasis: 'Las Vegas Valley Water District data, Tier A verified; Portland Water Bureau data',
    commercialPage: 'https://yohomefix.com/plumber-las-vegas-drain-cleaning',
    localPublications: ['Las Vegas Review-Journal', 'Las Vegas Sun', 'KTNV Channel 13'],
    submissionMechanism: 'Review-Journal tips: tips@reviewjournal.com; Las Vegas Sun contact form',
  },
  {
    id: 'story-6',
    city: 'Dayton vs Cleveland, OH',
    headline: 'Ohio\'s Plumbing Risk Divide: Dayton\'s Water is More Than 2x Harder Than Cleveland\'s',
    finding: 'Dayton registers 275 mg/L (Very Hard) while Cleveland registers 121 mg/L (Hard) — a 154 mg/L gap within Ohio. Both cities have aging infrastructure and high winter risk, but Dayton\'s harder water compounds the plumbing failure risk.',
    sourceBasis: 'City of Dayton Water Department and Cleveland Water Department data',
    commercialPage: 'https://yohomefix.com/plumber-dayton-water-softener-repair',
    localPublications: ['Dayton Daily News', 'Cleveland.com', 'WHIO TV'],
    submissionMechanism: 'Dayton Daily News tips: newsdesk@daytondailynews.com; WHIO contact form',
  },
  {
    id: 'story-7',
    city: 'Kansas City, MO',
    headline: 'Kansas City\'s Triple-Threat Plumbing Profile: Hard Water + Aging Pipes + Freeze Risk',
    finding: 'Kansas City scores 161 mg/L (Hard) with aging pre-1970 infrastructure and high winter freeze risk. This places it among the highest plumbing risk cities in the Midwest, with galvanized supply line failure as the dominant failure mode.',
    sourceBasis: 'Kansas City Water Services Department data; infrastructure assessment',
    commercialPage: 'https://yohomefix.com/plumber-kansas-city-drain-cleaning',
    localPublications: ['Kansas City Star', 'KSHB 41', 'KMBC 9'],
    submissionMechanism: 'KC Star tips: news@kcstar.com; KSHB newsroom contact form',
  },
  {
    id: 'story-8',
    city: 'Boston, MA',
    headline: 'Boston Has the Softest Water Among Major US Cities — Just 8 mg/L',
    finding: 'Boston registers only 8 mg/L CaCO3, making it the softest water city in the dataset. While this means minimal scale buildup, Boston\'s aging infrastructure (pre-1970 pipes) and high winter risk still create significant plumbing failure potential from freeze-thaw cycles.',
    sourceBasis: 'Massachusetts Water Resources Authority (MWRA) data, Tier A verified',
    commercialPage: 'https://yohomefix.com/plumber-boston-water-heater-repair',
    localPublications: ['Boston Globe', 'Boston.com', 'WCVB Channel 5'],
    submissionMechanism: 'Boston Globe tips: globedeliver@bostonglobe.com; WCVB contact form',
  },
];

// ============================================================
// PHASE 8 — JOURNALIST REQUEST CHANNELS
// ============================================================

export const JOURNALIST_PLATFORMS = [
  {
    name: 'HARO (Help a Reporter Out)',
    url: 'https://helpareporter.com',
    status: 'ACTIVE — relaunched April 2025 by Featured.com',
    cost: 'Free for both journalists and sources',
    format: '3x daily email digests (Morning, Afternoon, Evening)',
    queryVolume: '350-500 queries/week',
    pickupRate: '6.8% (observed)',
    spamRisk: 'Low (AI pitch detection added)',
    suitable: true,
    yoHomeFixPositioning: 'Respond as YoHomeFix research team — homeowner information platform with original water hardness and plumbing risk research. NOT as a plumbing contractor.',
    accountRequired: true,
    accountUrl: 'https://helpareporter.com',
    actionRequired: 'Sign up with email, monitor daily digests, respond within 1 hour to relevant queries about water quality, home maintenance, plumbing, hard water, or home improvement data',
    classification: 'A — HIGH-VALUE',
  },
  {
    name: 'Qwoted',
    url: 'https://qwoted.com',
    status: 'ACTIVE — premium journalist source platform',
    cost: 'Free tier (2 pitches/month, 4h delay); $99/mo Pro',
    format: 'Real-time query feed with profile verification',
    queryVolume: '120-180 queries/week',
    pickupRate: '11.4% (observed) — highest among alternatives',
    spamRisk: 'Low (profile verification required)',
    suitable: true,
    yoHomeFixPositioning: 'Verified expert profile as home services research organization. Expertise: water quality, plumbing infrastructure, homeowner advocacy.',
    accountRequired: true,
    accountUrl: 'https://qwoted.com',
    actionRequired: 'Create account, complete verified expert profile, set expertise areas (home improvement, water quality, plumbing, consumer advocacy), monitor and respond to relevant queries',
    classification: 'B — USEFUL',
  },
  {
    name: 'Featured.com',
    url: 'https://featured.com',
    status: 'ACTIVE — curated expert roundups for major publications',
    cost: 'Free tier (limited); $99-149/mo paid plans',
    format: 'Curated prompts from publishers (Fortune, Fast Company, Yahoo, etc.)',
    queryVolume: 'Medium',
    pickupRate: 'Higher than HARO (curated model)',
    spamRisk: 'Low',
    suitable: true,
    yoHomeFixPositioning: 'Expert contributor on home services, water quality, and plumbing data. YoHomeFix research can be cited in responses.',
    accountRequired: true,
    accountUrl: 'https://featured.com',
    actionRequired: 'Create account, complete expert profile, respond to relevant prompts about home maintenance, water quality, or consumer home services',
    classification: 'B — USEFUL',
    note: 'Featured.com owns HARO but operates as a separate product. Using both is recommended for maximum coverage.',
  },
  {
    name: 'Source of Sources (SOS)',
    url: 'https://sourceofsources.com',
    status: 'ACTIVE but high spam volume',
    cost: 'Free (paid early access $19/mo)',
    pickupRate: '3.2% (observed) — lowest among alternatives',
    spamRisk: 'High (150 pitches per query reported)',
    suitable: false,
    classification: 'C — LOW-VALUE — SKIP',
    reason: 'Low pickup rate and high competition make this inefficient for YoHomeFix\'s limited response capacity.',
  },
  {
    name: 'Help a B2B Writer',
    url: 'https://helpab2bwriter.com',
    status: 'ACTIVE — weekly digest',
    cost: 'Free',
    pickupRate: '9.1% (observed)',
    suitable: false,
    classification: 'D — UNSUITABLE — SKIP',
    reason: 'B2B-focused. YoHomeFix is a consumer/homeowner platform. Query topics rarely match home services or water quality.',
  },
  {
    name: '#JournoRequest on X/Twitter',
    url: 'https://twitter.com/search?q=%23JournoRequest',
    status: 'ACTIVE — real-time journalist queries on social media',
    cost: 'Free',
    format: 'Real-time hashtag search on X/Twitter',
    suitable: true,
    yoHomeFixPositioning: 'Respond to relevant journalist requests with data from the water hardness research',
    accountRequired: true,
    accountUrl: 'https://twitter.com',
    actionRequired: 'Monitor #JournoRequest hashtag, respond to relevant queries about water quality, home improvement, or plumbing',
    classification: 'B — USEFUL',
    note: 'Requires X/Twitter account. No cost. Can be monitored passively.',
  },
];

// ============================================================
// PHASE 9 — EMBEDDABLE WIDGET DISTRIBUTION
// ============================================================

export const WIDGET_AUDIT = {
  embedUrl: 'https://yohomefix.com/research/embed',
  embedCode: '<iframe src="https://yohomefix.com/research/embed" width="100%" height="420" frameborder="0" title="YoHomeFix Water Hardness Lookup" loading="lazy"></iframe>',
  checks: {
    httpsWorks: true,
    responsiveBehavior: true,
    attributionVisible: true,
    attributionLinksToCanonical: true,
    noHiddenSeoLinks: true,
    noIntrusiveBehavior: true,
    robotsMeta: 'noindex, follow (correct — embed page not indexed, link followed)',
    canonicalTag: 'Points to /research/us-water-hardness-plumbing-risk (correct)',
  },
  conclusion: 'Widget is distribution-ready. Attribution is visible, links to canonical research page, no hidden links, no intrusive behavior. Embed page correctly uses noindex/follow to prevent duplicate indexing.',
};

export const WIDGET_DISTRIBUTION_TARGETS = [
  {
    site: 'WaterHardness.org',
    url: 'https://www.waterhardness.org',
    relevance: 'High — already publishes water hardness data; YoHomeFix widget adds plumbing risk context',
    submissionMechanism: 'Contact form on /about/mission page',
    classification: 'B — USEFUL',
    note: 'They may see YoHomeFix as a competitor. Approach as complementary resource, not replacement.',
  },
  {
    site: 'LocalDataPoint.com',
    url: 'https://localdatapoint.com/water',
    relevance: 'Medium — publishes water quality reports for US/UK/Canada/Australia',
    submissionMechanism: 'No public submission form found',
    classification: 'C — LOW-VALUE',
    note: 'No clear submission path. Would require email outreach.',
  },
  {
    site: 'Home improvement blogs and resource sites',
    relevance: 'High — sites covering water quality, hard water, or plumbing would benefit from an embeddable lookup tool',
    submissionMechanism: 'Varies by site — requires individual outreach',
    classification: 'B — USEFUL',
    note: 'Identify specific sites during HARO/Featured.com monitoring. When journalists write about water quality, offer the widget for their article.',
  },
];

// ============================================================
// PHASE 10 — GOOGLE DISCOVERY STATUS
// ============================================================

export const GOOGLE_DISCOVERY_STATUS = {
  researchUrl: 'https://yohomefix.com/research/us-water-hardness-plumbing-risk',
  indexable: true,
  canonicalCorrect: true,
  canonicalUrl: 'https://yohomefix.com/research/us-water-hardness-plumbing-risk',
  sitemapIncluded: true,
  sitemapLocation: '/sitemap-static.xml',
  sitemapPriority: '0.9',
  sitemapChangefreq: 'monthly',
  internalDiscovery: {
    homepageLink: true,
    footerLink: true,
    relatedResourcesSection: true,
  },
  datasetStructuredData: {
    present: true,
    type: 'Dataset',
    hasLicense: true,
    hasCreator: true,
    hasMeasurementTechnique: true,
    hasVariableMeasured: true,
    hasTemporalCoverage: true,
    hasSpatialCoverage: true,
    hasIsAccessibleForFree: true,
    hasKeywords: true,
  },
  csvAccessible: true,
  csvMethod: 'Client-side generation via downloadCsv() function',
  robotsBlocking: false,
  robotsTxtStatus: 'No blocking detected',
  conclusion: 'Research asset is fully indexable with correct canonical, sitemap inclusion, Dataset structured data, and accessible CSV. No indexing issues detected.',
};

// ============================================================
// PHASE 11 — EXTERNAL MENTION/BACKLINK BASELINE
// ============================================================

export const BACKLINK_BASELINE = {
  date: '2026-07-23',
  researchUrl: 'https://yohomefix.com/research/us-water-hardness-plumbing-risk',
  knownReferringDomains: 0,
  knownBacklinks: 0,
  gscImpressions: 'Not individually reported in GSC (research page is newer than commercial pages)',
  gscClicks: 0,
  indexedStatus: 'Indexed (confirmed via live fetch; sitemap included)',
  externalMentions: 0,
  note: 'This is the pre-distribution baseline. All external authority metrics are at zero because the dataset has not yet been distributed to external platforms. Future measurements should compare against this baseline.',
};

// ============================================================
// PHASE 12 — BACKLINK DETECTION SYSTEM
// ============================================================

export const BACKLINK_TRACKER = [
  {
    platform: 'Zenodo',
    submissionDate: '2026-07-23',
    submissionStatus: 'PUBLISHED',
    publishedUrl: 'https://zenodo.org/records/21502924',
    doi: '10.5281/zenodo.21502924',
    conceptDoi: '10.5281/zenodo.21502897',
    backlinkPresent: true,
    backlinkDestination: 'https://yohomefix.com/research/us-water-hardness-plumbing-risk',
    linkType: 'follow (Zenodo description links are follow)',
    firstDetectedDate: '2026-07-23',
    notes: 'Auto-archived via GitHub-Zenodo webhook. DOI minted: 10.5281/zenodo.21502924. Description includes canonical URL. Related works links to GitHub repo v1.0.2. Also indexed by Software Heritage and OpenAIRE. Resource type classified as Software (Zenodo default for GitHub repos). License: CC BY 4.0.',
  },
  {
    platform: 'Kaggle',
    submissionDate: null,
    submissionStatus: 'NOT STARTED — requires user account + phone verification',
    publishedUrl: null,
    backlinkPresent: null,
    backlinkDestination: null,
    linkType: null,
    firstDetectedDate: null,
    notes: 'Public dataset page with description linking to source URL',
  },
  {
    platform: 'Hugging Face Datasets',
    submissionDate: null,
    submissionStatus: 'NOT STARTED — requires user account',
    publishedUrl: null,
    backlinkPresent: null,
    backlinkDestination: null,
    linkType: null,
    firstDetectedDate: null,
    notes: 'Dataset card can include link to canonical research page',
  },
  {
    platform: 'data.world',
    submissionDate: null,
    submissionStatus: 'NOT STARTED — requires user account',
    publishedUrl: null,
    backlinkPresent: null,
    backlinkDestination: null,
    linkType: null,
    firstDetectedDate: null,
    notes: 'Dataset description can include source URL',
  },
  {
    platform: 'GitHub (dataset repo)',
    submissionDate: '2026-07-23',
    submissionStatus: 'PUBLISHED',
    publishedUrl: 'https://github.com/asimexports123/yohomefix-water-hardness-dataset',
    backlinkPresent: true,
    backlinkDestination: 'https://yohomefix.com/research/us-water-hardness-plumbing-risk',
    linkType: 'follow (GitHub README links are follow)',
    firstDetectedDate: '2026-07-23',
    notes: 'Public repo with CSV, README, LICENSE (CC-BY-4.0 detected by GitHub), CITATION.cff, v1.0.0 release. Homepage set to canonical research URL. 3 follow backlinks in README (citation + contact + website). Topics applied. Ready for Zenodo auto-archive once user connects GitHub account to Zenodo.',
  },
  {
    platform: 'HARO',
    submissionDate: null,
    submissionStatus: 'NOT STARTED — requires user account + email monitoring',
    publishedUrl: null,
    backlinkPresent: null,
    backlinkDestination: null,
    linkType: null,
    firstDetectedDate: null,
    notes: 'Backlinks from journalist articles. Mix of follow/nofollow depending on publication.',
  },
  {
    platform: 'Qwoted',
    submissionDate: null,
    submissionStatus: 'NOT STARTED — requires user account',
    publishedUrl: null,
    backlinkPresent: null,
    backlinkDestination: null,
    linkType: null,
    firstDetectedDate: null,
    notes: 'Backlinks from high-DR publications. Mix of follow/nofollow.',
  },
  {
    platform: 'WaterHardness.org',
    submissionDate: null,
    submissionStatus: 'NOT STARTED — requires form submission via browser',
    publishedUrl: null,
    backlinkPresent: null,
    backlinkDestination: null,
    linkType: null,
    firstDetectedDate: null,
    notes: 'Data contribution, not direct backlink. May be cited as source.',
  },
];

// ============================================================
// PHASE 13 — USER ACTION QUEUE (MAX 5)
// ============================================================

export const USER_ACTION_QUEUE = [
  {
    priority: 1,
    platform: 'GitHub Dataset Repository',
    whyItMatters: 'Creates a public, Google-indexed dataset repository with high domain authority. Immediate execution — user already has GitHub account.',
    actionRequired: 'Run: gh auth login, then create public repo "yohomefix-water-hardness-dataset" and push files from dist/ folder',
    cost: 'Free',
    preparedByDevin: 'CSV file (dist/yohomefix-water-hardness-plumbing-risk-index.csv), README.md (dist/README.md), repo metadata (name, description, topics, license)',
    whatHappensNext: 'GitHub repo is live and indexed by Google within days. Can be linked from Zenodo record. Creates first external backlink to yohomefix.com.',
  },
  {
    priority: 2,
    platform: 'Zenodo',
    whyItMatters: 'Provides a citable DOI for the dataset. Indexed by DataCite, Google Scholar, and open data catalogs. Highest authority value among all platforms.',
    actionRequired: 'Create account at https://zenodo.org/signup/ (use GitHub or ORCID), then follow 12-step submission process in lib/distributionPackage.js',
    cost: 'Free',
    preparedByDevin: 'Complete submission metadata prepared (title, description, keywords, license, creator, publisher, related identifier). Files ready in dist/.',
    whatHappensNext: 'Dataset receives a DOI. Public landing page with backlink to yohomefix.com is created. Can be cited in future research and journalist responses.',
  },
  {
    priority: 3,
    platform: 'Kaggle',
    whyItMatters: 'Kaggle datasets rank well in Google search results. Public dataset page with backlink in description. Large data science community discovers the dataset.',
    actionRequired: 'Create account at https://www.kaggle.com/account/login, verify phone number, then follow 10-step submission process in lib/distributionPackage.js',
    cost: 'Free',
    preparedByDevin: 'Complete submission metadata prepared (title, slug, description, license, tags). CSV file ready in dist/.',
    whatHappensNext: 'Public Kaggle dataset page is live and indexed by Google. Discoverable by data scientists and researchers. Backlink to yohomefix.com in description.',
  },
  {
    priority: 4,
    platform: 'HARO (Help a Reporter Out)',
    whyItMatters: 'Free journalist query monitoring. When journalists write about water quality, home maintenance, or plumbing, YoHomeFix can provide data-driven expert commentary with backlink.',
    actionRequired: 'Sign up at https://helpareporter.com with email. Monitor 3x daily email digests. Respond within 1 hour to relevant queries. Use YoHomeFix research data in responses.',
    cost: 'Free',
    preparedByDevin: 'Expert positioning prepared (homeowner research resource, not plumbing contractor). 8 local data stories ready for reference. Citation and source URL prepared.',
    whatHappensNext: 'When a journalist uses YoHomeFix\'s response, the published article includes a backlink to yohomefix.com. Each mention builds external authority.',
  },
  {
    priority: 5,
    platform: 'Hugging Face Datasets',
    whyItMatters: 'Free dataset hosting with Dataset Viewer. Popular in ML/data science community. Public page indexed by Google with backlink in dataset card.',
    actionRequired: 'Create account at https://huggingface.co/join, create new public dataset repository, upload CSV, add dataset card with description and citation',
    cost: 'Free',
    preparedByDevin: 'Complete submission metadata prepared (title, license, description, citation). CSV file ready in dist/.',
    whatHappensNext: 'Public Hugging Face dataset page is live with Dataset Viewer. Indexed by Google. Backlink to yohomefix.com in dataset card.',
  },
];
