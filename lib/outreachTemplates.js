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

// ── Future Automation Workflow Design ─────────────────────────────
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
