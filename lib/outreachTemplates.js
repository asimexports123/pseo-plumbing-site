// ── Outreach Templates ────────────────────────────────────────────
// Reusable but personalized outreach frameworks.
// These are templates only — no outreach is sent during this sprint.
// Each template uses {placeholders} for personalization.

export const OUTREACH_TEMPLATES = {

  // A. Journalist / Data Story Pitch
  journalist: {
    subject: 'Original data: Water hardness levels for {CITY_COUNT} US cities — {LOCAL_ANGLE}',
    body: `Hi {FIRST_NAME},

I'm reaching out because I noticed your coverage of {TOPIC_AREA} at {PUBLICATION}, and I thought you might be interested in an original dataset we just published.

YoHomeFix compiled water hardness data (mg/L CaCO₃) for {CITY_COUNT} US cities, along with plumbing infrastructure risk scores. A few findings that might be relevant to your readers:

- {CITY_OR_REGION} has a hardness of {HARDNESS_VALUE} mg/L, classified as "{HARDNESS_CLASS}"
- {NATIONAL_FINDING}
- The dataset covers {CITY_COUNT} cities across all 50 states

The full research is at: https://yohomefix.com/research/us-water-hardness-plumbing-risk

You're welcome to reference the data in your reporting. The dataset is licensed CC BY 4.0 — just attribute YoHomeFix with a link.

Happy to provide additional analysis or a custom breakdown for {CITY_OR_REGION} if useful.

Best,
{SENDER_NAME}
YoHomeFix Research Team`,
  },

  // B. Home-Improvement Resource Inclusion
  resource_page: {
    subject: 'Resource suggestion: US water hardness data for {PUBLICATION} readers',
    body: `Hi {FIRST_NAME},

I'm a researcher at YoHomeFix, and I've been following the home improvement content at {PUBLICATION}.

We recently published a research resource that I think would be genuinely useful for your readers — particularly on your {RELEVANT_PAGE} page:

"US City Water Hardness & Plumbing Risk Index"
https://yohomefix.com/research/us-water-hardness-plumbing-risk

It includes:
- Water hardness data for {CITY_COUNT} US cities
- Searchable and sortable table
- City lookup tool
- Regional hardness patterns
- Methodology and data limitations

If you maintain a resources section or link list for your plumbing/water quality content, this could be a useful addition. The data is CC BY 4.0 licensed.

No pressure either way — I just thought it was a natural fit for your audience.

Best,
{SENDER_NAME}
YoHomeFix Research Team`,
  },

  // C. Local/Regional City-Data Angle
  local_data: {
    subject: '{CITY} water hardness data — local angle for {PUBLICATION}',
    body: `Hi {FIRST_NAME},

I'm reaching out from YoHomeFix with a local data story that might interest {PUBLICATION} readers.

We compiled water hardness data for {CITY_COUNT} US cities, and {CITY} stands out:

- Water hardness: {HARDNESS_VALUE} mg/L CaCO₃
- Classification: {HARDNESS_CLASS}
- {LOCAL_CONTEXT} (e.g., "This is among the highest/lowest in the {REGION} region")
- Plumbing risk score: {RISK_SCORE}/10

For context, the national median in our dataset is {MEDIAN} mg/L.

The full research with interactive lookup is here:
https://yohomefix.com/research/us-water-hardness-plumbing-risk

If you're interested in a local angle for a home & garden or consumer piece, you're welcome to use the data. We're also happy to provide a {CITY}-specific breakdown.

Best,
{SENDER_NAME}
YoHomeFix Research Team`,
  },

  // D. Existing Article Update
  article_update: {
    subject: 'Data resource for your {ARTICLE_TOPIC} article at {PUBLICATION}',
    body: `Hi {FIRST_NAME},

I was reading your article on {ARTICLE_TOPIC} ({ARTICLE_URL}) and found it really useful — particularly the section about {SPECIFIC_SECTION}.

I wanted to let you know about a resource we just published that might be a useful addition to the article:

https://yohomefix.com/research/us-water-hardness-plumbing-risk

It's a dataset of water hardness levels for {CITY_COUNT} US cities with an interactive lookup tool. Readers of your article could use it to check their specific city's hardness level, which directly relates to {WHY_RELEVANT}.

If you think it's a fit, a mention or link would be appreciated. The data is CC BY 4.0 licensed.

Either way, great article — keep up the good work.

Best,
{SENDER_NAME}
YoHomeFix Research Team`,
  },

  // E. Embeddable Widget Pitch
  embed_widget: {
    subject: 'Free water hardness lookup widget for {PUBLICATION}',
    body: `Hi {FIRST_NAME},

I noticed that {PUBLICATION} covers {TOPIC_AREA} for homeowners, and I wanted to offer a free tool you can embed on your site.

We built a water hardness lookup widget powered by our {CITY_COUNT}-city dataset. It lets your visitors enter their city and instantly see:

- Water hardness level (mg/L CaCO₃)
- Hardness classification (Soft to Very Hard)
- Plumbing risk score
- What it means for their home

The widget is a simple iframe embed — one line of code:

<iframe src="https://yohomefix.com/research/embed" width="100%" height="420" frameborder="0" loading="lazy"></iframe>

It's free to use, mobile-responsive, and includes a "Powered by YoHomeFix" attribution link to our research page.

If you'd like a customized version (e.g., pre-filtered to a specific state), we can set that up too.

Best,
{SENDER_NAME}
YoHomeFix Research Team`,
  },
};

// ── Personalized Outreach Drafts for Top A-Grade Prospects ────────
// These are ready-to-review drafts for the highest-priority prospects.
// No outreach is sent during this sprint. These require human review
// and explicit authorization before sending.

export const PERSONALIZED_DRAFTS = [

  // ── 1. Arizona Daily Star (Tucson) — Campaign B: Local City ──
  {
    prospectId: 'arizona-daily-star',
    campaignSegment: 'B',
    subject: 'Tucson has the hardest tap water of 155 US cities we studied — local data for a home & garden story',
    body: `Hi [Editor name],

I'm reaching out from YoHomeFix, a home plumbing resource, with a local data story that might interest your home & garden readers.

We just published a research study analyzing water hardness and plumbing risk across 155 US cities. Tucson stands out as the hardest water of any major city in our dataset:

- Water hardness: 344 mg/L CaCO₃ (classified "Very Hard")
- This is verified against Tucson Water's own water quality reports, which confirm "hard to very hard" classification
- Plumbing risk score: 8/10 (driven by extreme hardness + caliche hardpan soil conditions)
- For comparison, the national median in our dataset is 140 mg/L — Tucson is nearly 2.5x harder

We also found that Tucson's caliche hardpan subsurface layer makes water line repair significantly more difficult and expensive than in other markets, which is a unique angle for local homeowners.

The full interactive research is here:
https://yohomefix.com/research/us-water-hardness-plumbing-risk

You're welcome to reference the data in your reporting. The dataset is CC BY 4.0 — just attribute YoHomeFix with a link. I can also provide a Tucson-specific breakdown if useful.

Best,
[Sender name]
YoHomeFix Research Team`,
    priority: 'high',
    status: 'draft',
  },

  // ── 2. This Old House — Campaign C: Resource Update ──
  {
    prospectId: 'this-old-house',
    campaignSegment: 'C',
    subject: 'City-level water hardness data resource for your water heater and softener content',
    body: `Hi [Editor name],

I've been following the water heater and water softener content at This Old House — particularly your reviews and buying guides. The content is genuinely helpful for homeowners.

I wanted to share a resource we just published that I think would be a natural addition to your water heater/softener content:

"US City Water Hardness & Plumbing Risk Index"
https://yohomefix.com/research/us-water-hardness-plumbing-risk

What makes it useful for your readers:
- Water hardness data for 155 US cities, searchable and sortable
- 18 cities verified against official utility Consumer Confidence Reports (Tier A)
- Interactive city lookup tool — readers can check their own city
- Plumbing risk scores combining hardness, infrastructure age, and winter risk
- Honest methodology with tiered provenance (we clearly label which values are verified vs estimated)

Your water softener buying guide could link to the lookup tool so readers can check whether their city actually has hard water before buying. The data is CC BY 4.0 licensed.

No pressure either way — I just thought it was a strong fit for your audience.

Best,
[Sender name]
YoHomeFix Research Team`,
    priority: 'high',
    status: 'draft',
  },

  // ── 3. Water Quality Association — Campaign E: Expert/Reference ──
  {
    prospectId: 'water-quality-association',
    campaignSegment: 'E',
    subject: 'Consumer water hardness lookup resource — partnership suggestion for WQA members',
    body: `Hi [Contact name],

I'm reaching out from YoHomeFix, a home plumbing education resource. We've published a research asset that I believe aligns well with WQA's consumer education mission.

We compiled water hardness data for 155 US cities with a tiered provenance model:
- Tier A: 18 cities verified against official utility Consumer Confidence Reports
- Tier B: Values compiled from public water quality databases
- Tier C: Representative estimates based on regional geology and water source type

The research includes an interactive city lookup tool and a plumbing risk index that combines hardness with infrastructure age and winter freeze risk — something no other public water hardness resource currently offers.

Full research: https://yohomefix.com/research/us-water-hardness-plumbing-risk
Embeddable widget: https://yohomefix.com/research/embed

We'd welcome the opportunity to be listed as a consumer resource on WQA's site, or to discuss making the widget available for WQA member companies to embed on their own websites. The data is CC BY 4.0 licensed.

Happy to discuss further at your convenience.

Best,
[Sender name]
YoHomeFix Research Team`,
    priority: 'high',
    status: 'draft',
  },

  // ── 4. data.world — Campaign A: Data Story ──
  {
    prospectId: 'data-world',
    campaignSegment: 'A',
    subject: 'New open dataset: US city water hardness + plumbing risk index (CC BY 4.0)',
    body: `Hi [Contact name],

I'm reaching out from YoHomeFix with a new open dataset that might be a good addition to data.world's water data collection.

We've published the "US City Water Hardness & Plumbing Risk Index" — a dataset covering 155 US cities with:

- Water hardness (mg/L CaCO₃) for each city
- Plumbing risk scores (3-10 scale) combining hardness, infrastructure age, and winter risk
- Infrastructure classification (aging, mixed, modern)
- Winter risk assessment
- Tiered provenance: 18 cities verified against utility CCRs, remainder compiled from public databases

The dataset is CC BY 4.0 licensed and available at:
https://yohomefix.com/research/us-water-hardness-plumbing-risk

The plumbing risk index is a unique dimension — no other public water hardness dataset combines hardness with plumbing infrastructure risk. This makes it valuable for researchers studying regional plumbing service demand, water treatment needs, or infrastructure resilience.

We'd welcome the dataset being listed on data.world. Happy to provide the data in CSV/JSON format if that's useful.

Best,
[Sender name]
YoHomeFix Research Team`,
    priority: 'high',
    status: 'draft',
  },

  // ── 5. Boston Globe — Campaign B: Local City ──
  {
    prospectId: 'boston-globe',
    campaignSegment: 'B',
    subject: 'Boston has the softest tap water of 155 US cities — local plumbing angle',
    body: `Hi [Editor name],

I'm reaching out from YoHomeFix with a local data story that might interest your home/lifestyle readers.

We analyzed water hardness across 155 US cities, and Boston has the softest water of any major city in our dataset:

- Water hardness: 8 mg/L CaCO₃ (classified "Soft")
- Verified against MWRA's own water quality reports, which confirm hardness of about 15-20 mg/L at the source and 8 mg/L at the tap
- For comparison, the national median is 140 mg/L — Boston's water is 17x softer than average
- Tucson, the hardest city, is 43x harder than Boston

Here's the interesting plumbing angle: soft water with low pH is actually more corrosive to metal pipes than hard water. Boston's older housing stock (Back Bay, Beacon Hill) has lead and galvanized pipes that are especially vulnerable to soft water corrosion — which is why MWRA adds corrosion control treatment.

The full interactive research is here:
https://yohomefix.com/research/us-water-hardness-plumbing-risk

You're welcome to reference the data. CC BY 4.0 — just attribute YoHomeFix with a link.

Best,
[Sender name]
YoHomeFix Research Team`,
    priority: 'high',
    status: 'draft',
  },

  // ── 6. Consumer Reports — Campaign C: Resource Update ──
  {
    prospectId: 'consumer-reports-water',
    campaignSegment: 'C',
    subject: 'City-level water hardness data for your water softener buying guide',
    body: `Hi [Editor name],

I'm a researcher at YoHomeFix, and I've been reading Consumer Reports' water softener buying guide. It's a thorough resource for homeowners deciding whether they need a water softener.

One thing that would make the guide even more useful: a way for readers to check their city's actual water hardness. We just published a dataset that does exactly that:

https://yohomefix.com/research/us-water-hardness-plumbing-risk

- Water hardness data for 155 US cities
- 18 cities verified against official utility Consumer Confidence Reports
- Interactive lookup tool — readers enter their city and see hardness level, classification, and what it means for plumbing
- Honest methodology with clear provenance tiers

The buying guide currently gives general guidance about hard water signs, but with our tool, a reader in Boston (8 mg/L, soft) can quickly see they probably don't need a softener, while a reader in Tucson (344 mg/L, very hard) can confirm they definitely do.

The data is CC BY 4.0 licensed. We'd welcome a link to the lookup tool from the buying guide.

Best,
[Sender name]
YoHomeFix Research Team`,
    priority: 'high',
    status: 'draft',
  },

  // ── 7. The Spruce — Campaign C: Resource Update ──
  {
    prospectId: 'the-spruce',
    campaignSegment: 'C',
    subject: 'Water hardness lookup tool for your water softener buying guide readers',
    body: `Hi [Editor name],

I've been reading The Spruce's water softener buying guide — it's a great resource for homeowners trying to figure out if they need water treatment.

I wanted to suggest a resource that would complement the guide: our "US City Water Hardness & Plumbing Risk Index" at:

https://yohomefix.com/research/us-water-hardness-plumbing-risk

It lets readers look up their city's water hardness level directly, so they can make an informed decision about whether a softener is necessary. Key features:

- 155 US cities with hardness data (mg/L CaCO₃)
- 18 cities verified against official utility reports (Tier A provenance)
- Interactive search and lookup tool
- Plumbing risk scores for each city
- Clear methodology with honest provenance labeling

For example, a reader in Portland (11 mg/L, soft) would see they likely don't need a softener, while someone in Phoenix (250 mg/L, very hard) would confirm they do.

The data is CC BY 4.0 — we'd welcome a link from the buying guide to the lookup tool.

Best,
[Sender name]
YoHomeFix Research Team`,
    priority: 'high',
    status: 'draft',
  },

  // ── 8. Pure Water Blog — Campaign C: Resource Update ──
  {
    prospectId: 'purewaterblog',
    campaignSegment: 'C',
    subject: 'Verified water hardness data for your city-specific articles (Boston, Seattle, etc.)',
    body: `Hi [Author name],

I've been reading your city-specific water hardness articles — particularly the piece on Boston's water hardness. Great research, and I noticed you're already citing MWRA and WaterHardness.org data.

I wanted to share a resource that might be useful for your future city articles. We've published the "US City Water Hardness & Plumbing Risk Index" at:

https://yohomefix.com/research/us-water-hardness-plumbing-risk

We've verified hardness values for 18 cities against official utility Consumer Confidence Reports (our Tier A sources), including:

- Boston: 8 mg/L (verified against MWRA CCR)
- Seattle: 22 mg/L (verified against Seattle Public Utilities)
- Portland: 11 mg/L (verified against Portland Water Bureau)
- San Francisco: 60 mg/L (verified against SFPUC CCR)
- San Diego: 237 mg/L (verified against City of San Diego CCR)

We also add a plumbing risk score that no other water hardness resource currently offers — combining hardness with infrastructure age and winter freeze risk.

Your articles already provide great local context. If you'd like to reference our verified data or link to the full dataset, it's CC BY 4.0 licensed.

Happy to provide additional city-specific data if you're working on other articles.

Best,
[Sender name]
YoHomeFix Research Team`,
    priority: 'medium',
    status: 'draft',
  },
];
export const AUTOMATION_WORKFLOW = {
  phases: [
    {
      phase: 'Prospect Discovery',
      automationLevel: 'semi-automated',
      description: 'AI scans for relevant resource pages, articles, and journalists using search APIs and topic monitoring. Human reviews and approves each prospect before adding to the list.',
      inputs: ['search queries', 'topic keywords', 'competitor backlinks'],
      outputs: ['prospect candidates with relevance scores'],
      humanApproval: 'required before adding to prospect list',
    },
    {
      phase: 'Prospect Scoring',
      automationLevel: 'automated',
      description: 'Score prospects by domain authority, relevance to water hardness/plumbing, and likelihood of linking.',
      inputs: ['prospect data', 'domain metrics', 'content relevance'],
      outputs: ['scored and prioritized prospect list'],
      humanApproval: 'not required (scoring is advisory)',
    },
    {
      phase: 'Pitch Drafting',
      automationLevel: 'semi-automated',
      description: 'AI generates personalized pitch drafts using the outreach templates, prospect data, and relevant findings from the dataset.',
      inputs: ['prospect data', 'outreach template', 'dataset findings', 'prospect article content'],
      outputs: ['personalized pitch draft'],
      humanApproval: 'required before sending',
    },
    {
      phase: 'Sending',
      automationLevel: 'manual',
      description: 'Human reviews and sends each pitch. No automated sending — every email is reviewed and sent by a person.',
      inputs: ['approved pitch draft'],
      outputs: ['sent email, logged contact date'],
      humanApproval: 'required for every email',
    },
    {
      phase: 'Follow-Up',
      automationLevel: 'semi-automated',
      description: 'System tracks response status and suggests follow-up timing. Human approves and sends follow-ups.',
      inputs: ['outreach status', 'last contact date', 'response detection'],
      outputs: ['follow-up reminders and draft messages'],
      humanApproval: 'required before sending follow-up',
    },
    {
      phase: 'Link Monitoring',
      automationLevel: 'automated',
      description: 'System monitors prospect domains for new links to yohomefix.com and logs acquired backlinks.',
      inputs: ['prospect domains', 'link monitoring API'],
      outputs: ['acquired link log with domain, URL, date'],
      humanApproval: 'not required (monitoring only)',
    },
    {
      phase: 'Impact Measurement',
      automationLevel: 'automated',
      description: 'Correlate acquired links with GSC ranking changes and call volume for target commercial pages.',
      inputs: ['acquired links', 'GSC data', 'call tracking data'],
      outputs: ['impact report linking outreach to rankings and calls'],
      humanApproval: 'not required (reporting only)',
    },
  ],
  principles: [
    'Every outreach email is reviewed and sent by a human — no automated sending',
    'No private personal data is collected or stored',
    'No prohibited sources are scraped (no social media DMs, no paid databases)',
    'Follow-ups are limited to 2 per prospect with 7-day minimum intervals',
    'Prospects can be permanently excluded with a single flag',
    'All outreach is logged for audit and compliance',
  ],
};
