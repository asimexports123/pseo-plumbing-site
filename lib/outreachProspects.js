// ── Outreach Prospect Data Format ─────────────────────────────────
// This module defines the data structure for future AI-assisted
// digital PR outreach. No outreach is sent during this sprint.
//
// The schema is designed to be stored in a simple JSON file or
// database table and later consumed by an automation workflow.

export const PROSPECT_SCHEMA = {
  fields: {
    id:               'string — unique identifier (slug)',
    domain:           'string — prospect website domain',
    siteName:         'string — publication or site name',
    relevantUrl:      'string — exact URL where research is relevant',
    contactName:      'string — publicly available contact name (if any)',
    contactEmail:     'string — public professional contact email (if any)',
    contactForm:      'string — URL of contact form (if no email)',
    opportunityType:  'enum — journalist | resource_page | local_data | article_update | embed_widget',
    relevanceScore:   'integer 1-10 — how relevant the asset is to this prospect',
    priority:         'enum — high | medium | low',
    recommendedAngle: 'string — suggested outreach angle',
    targetAsset:      'string — YoHomeFix URL to promote',
    outreachStatus:   'enum — pending | contacted | responded | linked | declined | follow_up',
    lastContactDate:  'string ISO date — last outreach date',
    followUpDate:     'string ISO date — scheduled follow-up date',
    notes:            'string — additional context',
  },
};

// ── Initial Prospect List ─────────────────────────────────────────
// Legitimate prospects researched from public web presence.
// No private personal data. No scraped contacts. No automated submissions.
// These are publications and resources where the water hardness dataset
// provides genuine editorial value.

export const INITIAL_PROSPECTS = [
  // ── Home Improvement Publishers ──
  { id: 'this-old-house', domain: 'thisoldhouse.com', siteName: 'This Old House', relevantUrl: 'https://www.thisoldhouse.com/water-heater/reviews', opportunityType: 'article_update', relevanceScore: 9, priority: 'high', recommendedAngle: 'Water hardness data complements their water heater and water softener content — offer the dataset as a reference resource', targetAsset: '/research/us-water-hardness-plumbing-risk' },
  { id: 'bob-vila', domain: 'bobvila.com', siteName: 'Bob Vila', relevantUrl: 'https://www.bobvila.com/articles/water-softeners/', opportunityType: 'article_update', relevanceScore: 8, priority: 'high', recommendedAngle: 'Their water softener articles reference general hardness info — our city-level data adds specificity', targetAsset: '/research/us-water-hardness-plumbing-risk' },
  { id: 'home-advisor', domain: 'homeadvisor.com', siteName: 'HomeAdvisor', relevantUrl: 'https://www.homeadvisor.com/cost/plumbing/', opportunityType: 'resource_page', relevanceScore: 7, priority: 'medium', recommendedAngle: 'Cost guide content could reference regional hardness differences that affect plumbing costs', targetAsset: '/research/us-water-hardness-plumbing-risk' },
  { id: 'angi', domain: 'angi.com', siteName: 'Angi', relevantUrl: 'https://www.angi.com/articles/water-softener-installation.htm', opportunityType: 'article_update', relevanceScore: 7, priority: 'medium', recommendedAngle: 'Water softener installation guide could benefit from city-specific hardness data', targetAsset: '/research/us-water-hardness-plumbing-risk' },
  { id: 'family-handyman', domain: 'familyhandyman.com', siteName: 'Family Handyman', relevantUrl: 'https://www.familyhandyman.com/list/plumbing/', opportunityType: 'resource_page', relevanceScore: 8, priority: 'high', recommendedAngle: 'Plumbing section covers hard water issues — data asset adds original research value', targetAsset: '/research/us-water-hardness-plumbing-risk' },
  { id: 'hunker', domain: 'hunker.com', siteName: 'Hunker', relevantUrl: 'https://www.hunker.com/13495114/how-to-tell-if-you-have-hard-water', opportunityType: 'article_update', relevanceScore: 6, priority: 'medium', recommendedAngle: 'Hard water identification article could link to city-level data', targetAsset: '/research/us-water-hardness-plumbing-risk' },

  // ── Water Quality Resources ──
  { id: 'water-quality-association', domain: 'wqa.org', siteName: 'Water Quality Association', relevantUrl: 'https://www.wqa.org/find-water-treatment-professionals', opportunityType: 'resource_page', relevanceScore: 9, priority: 'high', recommendedAngle: 'Industry authority — offer the dataset as a consumer resource for understanding local hardness', targetAsset: '/research/us-water-hardness-plumbing-risk' },
  { id: 'epa-sdwis', domain: 'epa.gov', siteName: 'EPA Safe Drinking Water', relevantUrl: 'https://www.epa.gov/ground-water-and-drinking-water', opportunityType: 'resource_page', relevanceScore: 7, priority: 'low', recommendedAngle: 'Government reference — unlikely to link externally but dataset methodology aligns with their standards', targetAsset: '/research/us-water-hardness-plumbing-risk' },
  { id: 'cdc-water', domain: 'cdc.gov', siteName: 'CDC Water Quality', relevantUrl: 'https://www.cdc.gov/healthywater/drinking/public/water_quality.html', opportunityType: 'resource_page', relevanceScore: 6, priority: 'low', recommendedAngle: 'Public health resource — dataset could be referenced as a consumer tool', targetAsset: '/research/us-water-hardness-plumbing-risk' },
  { id: 'nsf-water', domain: 'nsf.org', siteName: 'NSF International', relevantUrl: 'https://www.nsf.org/consumer-resources/water-quality', opportunityType: 'resource_page', relevanceScore: 7, priority: 'medium', recommendedAngle: 'Water quality certification body — consumer resources could reference city hardness data', targetAsset: '/research/us-water-hardness-plumbing-risk' },

  // ── Plumbing Industry Resources ──
  { id: 'phcc', domain: 'phccweb.org', siteName: 'PHCC (Plumbing-Heating-Cooling Contractors)', relevantUrl: 'https://www.phccweb.org/resources', opportunityType: 'resource_page', relevanceScore: 7, priority: 'medium', recommendedAngle: 'Trade association resource page — dataset provides consumer education value for members', targetAsset: '/research/us-water-hardness-plumbing-risk' },
  { id: 'iapmo', domain: 'iapmo.org', siteName: 'IAPMO', relevantUrl: 'https://www.iapmo.org/resources', opportunityType: 'resource_page', relevanceScore: 6, priority: 'low', recommendedAngle: 'Plumbing code organization — data supports their consumer education mission', targetAsset: '/research/us-water-hardness-plumbing-risk' },
  { id: 'plumbing-today', domain: 'plumbingtoday.com', siteName: 'Plumbing Today', relevantUrl: 'https://plumbingtoday.com', opportunityType: 'journalist', relevanceScore: 7, priority: 'medium', recommendedAngle: 'Industry publication — water hardness data story for plumbing professionals', targetAsset: '/research/us-water-hardness-plumbing-risk' },

  // ── Homeowner Education & Data Resources ──
  { id: 'energystar', domain: 'energystar.gov', siteName: 'ENERGY STAR', relevantUrl: 'https://www.energystar.gov/products/water_heaters', opportunityType: 'article_update', relevanceScore: 6, priority: 'low', recommendedAngle: 'Water heater efficiency is affected by hardness — data supports their efficiency guidance', targetAsset: '/research/us-water-hardness-plumbing-risk' },
  { id: 'consumer-reports-water', domain: 'consumerreports.org', siteName: 'Consumer Reports', relevantUrl: 'https://www.consumerreports.org/water-softeners/best-water-softeners-a1078947', opportunityType: 'article_update', relevanceScore: 8, priority: 'high', recommendedAngle: 'Water softener buying guide — city-level hardness data helps consumers determine if they need one', targetAsset: '/research/us-water-hardness-plumbing-risk' },
  { id: 'nrdc-water', domain: 'nrdc.org', siteName: 'NRDC', relevantUrl: 'https://www.nrdc.org/stories/water-pollution-everything-you-need-know', opportunityType: 'resource_page', relevanceScore: 5, priority: 'low', recommendedAngle: 'Environmental organization — water quality data supports their consumer education efforts', targetAsset: '/research/us-water-hardness-plumbing-risk' },

  // ── Local/Regional Publishers (high-hardness cities) ──
  { id: 'arizona-daily-star', domain: 'tucson.com', siteName: 'Arizona Daily Star', relevantUrl: 'https://tucson.com/lifestyles/home-and-garden', opportunityType: 'local_data', relevanceScore: 9, priority: 'high', recommendedAngle: 'Tucson has the hardest water in our dataset (344 mg/L) — local data story for home & garden section', targetAsset: '/research/us-water-hardness-plumbing-risk' },
  { id: 'bakersfield-californian', domain: 'bakersfield.com', siteName: 'The Bakersfield Californian', relevantUrl: 'https://www.bakersfield.com', opportunityType: 'local_data', relevanceScore: 8, priority: 'high', recommendedAngle: 'Bakersfield ranks #2 hardest (335 mg/L) — local relevance for homeowners', targetAsset: '/research/us-water-hardness-plumbing-risk' },
  { id: 'phoenix-new-times', domain: 'phoenixnewtimes.com', siteName: 'Phoenix New Times', relevantUrl: 'https://www.phoenixnewtimes.com', opportunityType: 'local_data', relevanceScore: 8, priority: 'medium', recommendedAngle: 'Phoenix metro has multiple Very Hard cities (Mesa, Gilbert, Chandler) — regional water quality story', targetAsset: '/research/us-water-hardness-plumbing-risk' },
  { id: 'el-paso-times', domain: 'elpasotimes.com', siteName: 'El Paso Times', relevantUrl: 'https://www.elpasotimes.com', opportunityType: 'local_data', relevanceScore: 7, priority: 'medium', recommendedAngle: 'El Paso ranks in top 10 hardest (310 mg/L) — local data story', targetAsset: '/research/us-water-hardness-plumbing-risk' },
  { id: 'inland-valley-daily-bulletin', domain: 'dailybulletin.com', siteName: 'Daily Bulletin (Inland Empire)', relevantUrl: 'https://www.dailybulletin.com', opportunityType: 'local_data', relevanceScore: 7, priority: 'medium', recommendedAngle: 'Riverside area ranks in top 10 hardest (310 mg/L) — local relevance', targetAsset: '/research/us-water-hardness-plumbing-risk' },

  // ── Soft Water Cities (contrast story) ──
  { id: 'seattle-times', domain: 'seattletimes.com', siteName: 'The Seattle Times', relevantUrl: 'https://www.seattletimes.com/life/lifestyle/home', opportunityType: 'local_data', relevanceScore: 7, priority: 'medium', recommendedAngle: 'Seattle has the softest water (18 mg/L) — contrast story about what soft water means for plumbing', targetAsset: '/research/us-water-hardness-plumbing-risk' },
  { id: 'portland-oregonian', domain: 'oregonlive.com', siteName: 'The Oregonian', relevantUrl: 'https://www.oregonlive.com/life-and-culture/home-garden', opportunityType: 'local_data', relevanceScore: 7, priority: 'medium', recommendedAngle: 'Portland ties for softest water (18 mg/L) — local data angle', targetAsset: '/research/us-water-hardness-plumbing-risk' },

  // ── Data & Reference Publishers ──
  { id: 'data-world', domain: 'data.world', siteName: 'data.world', relevantUrl: 'https://data.world/datasets/water', opportunityType: 'resource_page', relevanceScore: 8, priority: 'high', recommendedAngle: 'Open data platform — dataset can be published as a public dataset with CC BY 4.0 license', targetAsset: '/research/us-water-hardness-plumbing-risk' },
  { id: 'kaggle', domain: 'kaggle.com', siteName: 'Kaggle', relevantUrl: 'https://www.kaggle.com/datasets?search=water+hardness', opportunityType: 'resource_page', relevanceScore: 7, priority: 'medium', recommendedAngle: 'Data science community — dataset useful for water quality analysis projects', targetAsset: '/research/us-water-hardness-plumbing-risk' },
  { id: 'github-awesome-lists', domain: 'github.com', siteName: 'GitHub Awesome Public Datasets', relevantUrl: 'https://github.com/awesomedata/awesome-public-datasets', opportunityType: 'resource_page', relevanceScore: 6, priority: 'medium', recommendedAngle: 'Curated dataset list — water quality data is a commonly requested category', targetAsset: '/research/us-water-hardness-plumbing-risk' },

  // ── Home & Garden Bloggers ──
  { id: 'spruce', domain: 'thespruce.com', siteName: 'The Spruce', relevantUrl: 'https://www.thespruce.com/water-softener-buying-guide-4150660', opportunityType: 'article_update', relevanceScore: 8, priority: 'high', recommendedAngle: 'Water softener buying guide — hardness data helps readers decide if they need treatment', targetAsset: '/research/us-water-hardness-plumbing-risk' },
  { id: 'hgtv', domain: 'hgtv.com', siteName: 'HGTV', relevantUrl: 'https://www.hgtv.com/design/ decorate/bath', opportunityType: 'article_update', relevanceScore: 6, priority: 'low', recommendedAngle: 'Home design content — water quality affects fixture and appliance choices', targetAsset: '/research/us-water-hardness-plumbing-risk' },
  { id: 'apartment-therapy', domain: 'apartmenttherapy.com', siteName: 'Apartment Therapy', relevantUrl: 'https://www.apartmenttherapy.com', opportunityType: 'article_update', relevanceScore: 5, priority: 'low', recommendedAngle: 'Home living content — hard water tips for renters and homeowners', targetAsset: '/research/us-water-hardness-plumbing-risk' },

  // ── Plumbing/HVAC Trade Media ──
  { id: 'achr-news', domain: 'achrnews.com', siteName: 'ACHR News', relevantUrl: 'https://www.achrnews.com/topics/plumbing', opportunityType: 'journalist', relevanceScore: 7, priority: 'medium', recommendedAngle: 'HVAC/plumbing trade publication — data story about regional hardness affecting appliance life', targetAsset: '/research/us-water-hardness-plumbing-risk' },
  { id: 'supply-house-times', domain: 'supplyhousetimes.com', siteName: 'Supply House Times', relevantUrl: 'https://www.supplyhousetimes.com', opportunityType: 'journalist', relevanceScore: 6, priority: 'medium', recommendedAngle: 'Plumbing supply industry — hardness data informs product demand by region', targetAsset: '/research/us-water-hardness-plumbing-risk' },
  { id: 'pmm-magazine', domain: 'pmmmag.com', siteName: 'Plumbing & Mechanical Management', relevantUrl: 'https://www.pmmmag.com', opportunityType: 'journalist', relevanceScore: 6, priority: 'low', recommendedAngle: 'UK plumbing mag but covers international water quality trends', targetAsset: '/research/us-water-hardness-plumbing-risk' },

  // ── Real Estate & Home Value ──
  { id: 'zillow', domain: 'zillow.com', siteName: 'Zillow', relevantUrl: 'https://www.zillow.com/resources', opportunityType: 'resource_page', relevanceScore: 5, priority: 'low', recommendedAngle: 'Homebuyer resources — water hardness is a factor in home maintenance costs', targetAsset: '/research/us-water-hardness-plumbing-risk' },
  { id: 'redfin', domain: 'redfin.com', siteName: 'Redfin', relevantUrl: 'https://www.redfin.com/blog', opportunityType: 'article_update', relevanceScore: 5, priority: 'low', recommendedAngle: 'Real estate blog — water hardness data for homebuyers researching maintenance costs', targetAsset: '/research/us-water-hardness-plumbing-risk' },

  // ── Science & Environment ──
  { id: 'usgs-water-science', domain: 'usgs.gov', siteName: 'USGS Water Science School', relevantUrl: 'https://www.usgs.gov/special-topics/water-science-school/science/hardness-water', opportunityType: 'resource_page', relevanceScore: 9, priority: 'medium', recommendedAngle: 'Our classification system aligns with their hardness scale — offer as a consumer-friendly companion resource', targetAsset: '/research/us-water-hardness-plumbing-risk' },
  { id: 'water-env-federation', domain: 'wef.org', siteName: 'Water Environment Federation', relevantUrl: 'https://www.wef.org/resources', opportunityType: 'resource_page', relevanceScore: 6, priority: 'low', recommendedAngle: 'Water quality professional organization — dataset for consumer education section', targetAsset: '/research/us-water-hardness-plumbing-risk' },

  // ── Embed Widget Prospects ──
  { id: 'city-water-utilities', domain: 'various', siteName: 'Municipal Water Utility Websites', relevantUrl: 'various', opportunityType: 'embed_widget', relevanceScore: 8, priority: 'medium', recommendedAngle: 'City water utility sites can embed the lookup widget to show residents their hardness data', targetAsset: '/research/embed' },
  { id: 'home-inspection-sites', domain: 'various', siteName: 'Home Inspection Company Websites', relevantUrl: 'various', opportunityType: 'embed_widget', relevanceScore: 7, priority: 'medium', recommendedAngle: 'Home inspectors can embed the lookup for clients to check water hardness before buying', targetAsset: '/research/embed' },

  // ── Additional Resource Lists ──
  { id: 'home-improvement-directory', domain: 'homeimprovementpages.com', siteName: 'Home Improvement Pages', relevantUrl: 'https://www.homeimprovementpages.com', opportunityType: 'resource_page', relevanceScore: 5, priority: 'low', recommendedAngle: 'Home improvement directory — research resource for their plumbing section', targetAsset: '/research/us-water-hardness-plumbing-risk' },
  { id: 'fixr', domain: 'fixr.com', siteName: 'Fixr', relevantUrl: 'https://www.fixr.com/costs/water-softener-installation', opportunityType: 'article_update', relevanceScore: 7, priority: 'medium', recommendedAngle: 'Cost guide for water softener installation — hardness data helps consumers determine necessity', targetAsset: '/research/us-water-hardness-plumbing-risk' },
  { id: 'improvenet', domain: 'improvenet.com', siteName: 'ImproveNet', relevantUrl: 'https://www.improvenet.com/cost/water-softener-installation-cost', opportunityType: 'article_update', relevanceScore: 6, priority: 'medium', recommendedAngle: 'Water softener cost guide — city hardness data supports cost-benefit analysis', targetAsset: '/research/us-water-hardness-plumbing-risk' },
  { id: 'water-treatment-reviews', domain: 'watertreatmentreviews.com', siteName: 'Water Treatment Reviews', relevantUrl: 'https://www.watertreatmentreviews.com', opportunityType: 'resource_page', relevanceScore: 7, priority: 'medium', recommendedAngle: 'Water treatment review site — dataset adds objective data to product recommendations', targetAsset: '/research/us-water-hardness-plumbing-risk' },
  { id: 'fresh-water-systems', domain: 'freshwatersystems.com', siteName: 'Fresh Water Systems', relevantUrl: 'https://www.freshwatersystems.com/articles', opportunityType: 'article_update', relevanceScore: 7, priority: 'medium', recommendedAngle: 'Water treatment retailer — educational content can reference city-level hardness data', targetAsset: '/research/us-water-hardness-plumbing-risk' },
  { id: 'aquasana', domain: 'aquasana.com', siteName: 'Aquasana', relevantUrl: 'https://www.aquasana.com/blog', opportunityType: 'article_update', relevanceScore: 6, priority: 'low', recommendedAngle: 'Water filtration brand blog — hardness data supports their educational content', targetAsset: '/research/us-water-hardness-plumbing-risk' },
];
