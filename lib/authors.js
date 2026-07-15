const domain = process.env.NEXT_PUBLIC_DOMAIN || 'https://yohomefix.com';

export const AUTHORS = {
  'editorial-team': {
    slug: 'editorial-team',
    name: 'YoHomeFix Editorial Team',
    role: 'Editorial Team',
    title: 'Senior Editorial Team',
    bio: 'The YoHomeFix editorial team is responsible for researching, reviewing, and maintaining all homeowner-facing plumbing content. Team members combine trade journalism experience with structured data review to ensure every guide, cost page, and local service page is accurate and current.',
    expertise: ['Home services research', 'Plumbing content review', 'Data journalism', 'Consumer protection'],
    reviewedTopics: ['Emergency plumbing', 'Drain cleaning', 'Leak repair', 'Pipe burst repair', 'Water heater repair', 'Cost guides', 'State and city pages'],
    image: `${domain}/og-image.png`,
  },
  'plumbing-standards-reviewer': {
    slug: 'plumbing-standards-reviewer',
    name: 'Plumbing Standards Reviewer',
    role: 'Technical Reviewer',
    title: 'Plumbing Standards & Code Reviewer',
    bio: 'The Plumbing Standards Reviewer evaluates technical guidance against industry standards, manufacturer documentation, and state plumbing codes. This role focuses on verifying that repair procedures, safety warnings, and code references are accurate and applicable to residential homeowners.',
    expertise: ['Plumbing codes', 'Residential plumbing systems', 'Water heater safety', 'Pipe repair standards', 'Trade practices'],
    reviewedTopics: ['Water heater maintenance', 'Pipe burst repair', 'Frozen pipe prevention', 'Water shut-off procedures', 'Hard water effects'],
    image: `${domain}/og-image.png`,
  },
  'home-services-researcher': {
    slug: 'home-services-researcher',
    name: 'Home Services Researcher',
    role: 'Research Lead',
    title: 'Home Services Research Lead',
    bio: 'The Home Services Researcher compiles and verifies local data, pricing benchmarks, and municipal infrastructure references used across YoHomeFix city and state pages. This role ensures that regional plumbing risk factors, cost ranges, and water system data are grounded in public sources.',
    expertise: ['Municipal data research', 'Regional cost analysis', 'Water utility mapping', 'Climate risk assessment', 'Housing stock analysis'],
    reviewedTopics: ['City cost guides', 'State plumbing pages', 'Water hardness data', 'Local utility references', 'Climate-related plumbing risks'],
    image: `${domain}/og-image.png`,
  },
};

export const DEFAULT_AUTHOR = AUTHORS['editorial-team'];

export function getAuthor(slug) {
  return AUTHORS[slug] || DEFAULT_AUTHOR;
}

export function getAllAuthors() {
  return Object.values(AUTHORS);
}
