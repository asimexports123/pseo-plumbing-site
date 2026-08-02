// ============================================================
// BUSINESS CONFIGURATION — Single source of truth
// All platform scripts read from this file.
// ============================================================

export const business = {
  name: 'YoHomeFix',
  website: 'https://yohomefix.com',
  email: 'yohomefix@gmail.com',
  // No phone number — strategy is to drive traffic to website only
  phone: '',
  foundedYear: '2024',
  employeeCount: '1-10',
  businessType: 'Online Business',
  legalType: 'LLC',
  category: 'Plumbing Services',
  secondaryCategories: ['Home Services', 'Emergency Services', 'Home Improvement'],
  keywords: [
    'emergency plumber',
    '24/7 plumbing service',
    'plumbing repair',
    'water heater repair',
    'leak repair',
    'drain cleaning',
    'burst pipe repair',
    'sewer line repair',
    'slab leak repair',
    'home services',
  ],
  serviceArea: 'United States (Nationwide)',
  hours: 'Open 24/7',
  logoPath: '../public/og-image.png',
  address: {
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States',
  },
  social: {
    linkedin: '',
    facebook: '',
    twitter: '',
    instagram: '',
    youtube: '',
    pinterest: '',
  },
};

// ============================================================
// DESCRIPTIONS — Rotated automatically per platform
// Each is unique to avoid duplicate content issues.
// ============================================================

export const descriptions = [
  {
    id: 'A',
    label: 'Crunchbase / formal',
    short: 'YoHomeFix connects homeowners across the USA with licensed, insured emergency plumbers — 24/7 dispatch, 60-minute response target, upfront pricing.',
    medium: 'YoHomeFix is a national home services platform that connects homeowners with licensed, insured emergency plumbers across the United States. Operating in 50+ major US cities, YoHomeFix provides 24/7 dispatch services for burst pipes, flooding, water heater failures, sewer line issues, slab leaks, drain blockages, and other urgent plumbing emergencies. The platform uses ZIP code-based matching to route homeowners to vetted local contractors with a target 60-minute response time. YoHomeFix covers 15 specialized plumbing categories including emergency plumbing, leak repair, drain cleaning, pipe burst repair, water heater repair, sewer line repair, toilet repair, slab leak repair, water line repair, faucet repair, garbage disposal repair, water softener repair, whole-house repiping, main water shutoff valve repair, and sump pump repair.',
    long: 'YoHomeFix is a national home services platform that connects homeowners with licensed, insured emergency plumbers across the United States. Operating in 50+ major US cities, YoHomeFix provides 24/7 dispatch services for burst pipes, flooding, water heater failures, sewer line issues, slab leaks, drain blockages, and other urgent plumbing emergencies. The platform uses ZIP code-based matching to route homeowners to vetted local contractors with a target 60-minute response time. YoHomeFix\'s service coverage spans 15 specialized plumbing categories including emergency plumbing, leak repair, drain cleaning, pipe burst repair, water heater repair, sewer line repair, toilet repair, slab leak repair, water line repair, faucet repair, garbage disposal repair, water softener repair, whole-house repiping, main water shutoff valve repair, and sump pump repair. The company serves both major metropolitan areas and smaller cities nationwide, with detailed city-specific infrastructure data covering water utility information, pipe era, dominant failure patterns, and climate-specific plumbing risks. YoHomeFix\'s mission is to eliminate the friction of finding a reliable emergency plumber by providing upfront pricing, verified technicians, and a no-hold-queue dispatch system that gets help to homeowners fast.',
  },
  {
    id: 'B',
    label: 'Trustpilot / customer-focused',
    short: 'YoHomeFix connects homeowners across the USA with licensed, insured emergency plumbers — 24/7, 60-minute response, upfront pricing.',
    medium: 'YoHomeFix connects homeowners across the USA with licensed, insured emergency plumbers — 24 hours a day, 7 days a week. When a pipe bursts, a water heater fails, or a drain backs up, YoHomeFix routes the homeowner to a vetted local plumber with a target 60-minute response time. The platform covers 50+ cities and 15 specialized plumbing services, from emergency repairs and leak detection to sewer line replacement and whole-house repiping. Homeowners get upfront pricing, verified technicians, and no hold queues. Every plumber in the YoHomeFix network is licensed and insured. Visit yohomefix.com to get connected with a local emergency plumber today.',
    long: 'YoHomeFix connects homeowners across the USA with licensed, insured emergency plumbers — 24 hours a day, 7 days a week. When a pipe bursts, a water heater fails, or a drain backs up, YoHomeFix routes the homeowner to a vetted local plumber with a target 60-minute response time. The platform covers 50+ cities and 15 specialized plumbing services, from emergency repairs and leak detection to sewer line replacement and whole-house repiping. Homeowners get upfront pricing, verified technicians, and no hold queues. Every plumber in the YoHomeFix network is licensed and insured. The platform uses detailed city-level infrastructure data — water utility info, pipe materials, climate risk factors — to match homeowners with plumbers who understand the specific plumbing challenges of their area. Visit yohomefix.com to get connected with a local emergency plumber today.',
  },
  {
    id: 'C',
    label: 'LinkedIn / professional',
    short: 'National home services platform specializing in 24/7 emergency plumbing dispatch across the United States.',
    medium: 'YoHomeFix is a nationwide home services platform specializing in 24/7 emergency plumbing dispatch across the United States. We connect homeowners with licensed, insured local plumbers in 50+ major US cities, covering 15 specialized service categories from emergency repairs to whole-house repiping. Our ZIP code-based matching system routes homeowners to vetted contractors with a 60-minute response target, upfront pricing, and no hold queues. We maintain detailed infrastructure intelligence on every city we serve — water utility data, pipe era, dominant failure patterns, and climate-specific risk factors — to ensure homeowners get plumbers who understand their local plumbing challenges. YoHomeFix is committed to eliminating the friction of finding reliable emergency plumbing help. Visit yohomefix.com to learn more.',
    long: 'YoHomeFix is a nationwide home services platform specializing in 24/7 emergency plumbing dispatch across the United States. We connect homeowners with licensed, insured local plumbers in 50+ major US cities, covering 15 specialized service categories from emergency repairs to whole-house repiping. Our ZIP code-based matching system routes homeowners to vetted contractors with a 60-minute response target, upfront pricing, and no hold queues. We maintain detailed infrastructure intelligence on every city we serve — water utility data, pipe era, dominant failure patterns, and climate-specific risk factors — to ensure homeowners get plumbers who understand their local plumbing challenges. YoHomeFix is committed to eliminating the friction of finding reliable emergency plumbing help. Visit yohomefix.com to learn more.',
  },
  {
    id: 'D',
    label: 'Facebook / consumer-friendly',
    short: '24/7 emergency plumbing dispatch across the USA. Licensed, insured local plumbers. Visit yohomefix.com.',
    medium: 'Burst pipe? No hot water? Flooding? YoHomeFix connects you with licensed, insured emergency plumbers across the USA — 24/7. We serve 50+ cities nationwide with 15 specialized plumbing services, from emergency repairs and leak detection to water heater replacement and sewer line repair. Our ZIP code-based matching gets a vetted local plumber to your door with a 60-minute response target, upfront pricing, and no hold queues. Every plumber in our network is licensed and insured. Visit yohomefix.com to get connected with a local emergency plumber right now.',
    long: 'Burst pipe? No hot water? Flooding? YoHomeFix connects you with licensed, insured emergency plumbers across the USA — 24/7. We serve 50+ cities nationwide with 15 specialized plumbing services, from emergency repairs and leak detection to water heater replacement and sewer line repair. Our ZIP code-based matching gets a vetted local plumber to your door with a 60-minute response target, upfront pricing, and no hold queues. Every plumber in our network is licensed and insured. Visit yohomefix.com to get connected with a local emergency plumber right now.',
  },
  {
    id: 'E',
    label: 'General directories',
    short: '24/7 emergency plumbing dispatch across the USA. Licensed, insured plumbers. Visit yohomefix.com.',
    medium: 'YoHomeFix provides 24/7 emergency plumbing dispatch services across the United States. We connect homeowners with licensed, insured local plumbers in 50+ cities for burst pipes, water heater failures, drain blockages, sewer line issues, and 15+ specialized plumbing services. Target 60-minute response time, upfront pricing, verified technicians. Visit yohomefix.com to find an emergency plumber near you.',
    long: 'YoHomeFix provides 24/7 emergency plumbing dispatch services across the United States. We connect homeowners with licensed, insured local plumbers in 50+ cities for burst pipes, water heater failures, drain blockages, sewer line issues, and 15+ specialized plumbing services. Target 60-minute response time, upfront pricing, verified technicians. Visit yohomefix.com to find an emergency plumber near you.',
  },
  {
    id: 'F',
    label: 'Social media',
    short: '24/7 emergency plumbing dispatch across the USA. Visit yohomefix.com.',
    medium: '24/7 emergency plumbing dispatch across the USA. Licensed, insured local plumbers in 50+ cities. Burst pipes, water heaters, drains, sewer lines — 15+ services. 60-minute response target, upfront pricing, no hold queues. Visit yohomefix.com.',
    long: '24/7 emergency plumbing dispatch across the USA. Licensed, insured local plumbers in 50+ cities. Burst pipes, water heaters, drains, sewer lines — 15+ services. 60-minute response target, upfront pricing, no hold queues. Visit yohomefix.com.',
  },
  {
    id: 'G',
    label: 'Niche/industry directories',
    short: 'National emergency plumbing dispatch platform serving homeowners across the United States.',
    medium: 'YoHomeFix is a national emergency plumbing dispatch platform serving homeowners across the United States. We connect homeowners with licensed, insured local plumbers for 15 specialized service categories including emergency plumbing, leak repair, drain cleaning, water heater repair, sewer line repair, slab leak detection, and whole-house repiping. Operating in 50+ major US cities with ZIP code-based contractor matching, upfront pricing, and a 60-minute response target. Visit yohomefix.com for fast, reliable emergency plumbing service.',
    long: 'YoHomeFix is a national emergency plumbing dispatch platform serving homeowners across the United States. We connect homeowners with licensed, insured local plumbers for 15 specialized service categories including emergency plumbing, leak repair, drain cleaning, water heater repair, sewer line repair, slab leak detection, and whole-house repiping. Operating in 50+ major US cities with ZIP code-based contractor matching, upfront pricing, and a 60-minute response target. Visit yohomefix.com for fast, reliable emergency plumbing service.',
  },
];

// ============================================================
// LANDING PAGES — Selected automatically per platform type
// ============================================================

export const landingPages = {
  default: 'https://yohomefix.com',
  // City pages can be used for location-specific directories
  cities: {
    'new-york': 'https://yohomefix.com/plumber-new-york-emergency',
    'los-angeles': 'https://yohomefix.com/plumber-los-angeles-emergency',
    'chicago': 'https://yohomefix.com/plumber-chicago-emergency',
    'houston': 'https://yohomefix.com/plumber-houston-emergency',
    'phoenix': 'https://yohomefix.com/plumber-phoenix-emergency',
  },
  // State hub pages
  states: {
    'ny': 'https://yohomefix.com/plumber-new-york',
    'ca': 'https://yohomefix.com/plumber-california',
    'tx': 'https://yohomefix.com/plumber-texas',
    'fl': 'https://yohomefix.com/plumber-florida',
    'il': 'https://yohomefix.com/plumber-illinois',
  },
};

// ============================================================
// URL SHORTENER — Enable per platform if needed
// ============================================================

export const urlShortener = {
  enabled: false, // Set to true globally to use shortener
  service: 'tinyurl', // 'tinyurl' | 'is.gd' | 'bit.ly'
  // For platforms that block long URLs, set per-platform in platforms.js
};
