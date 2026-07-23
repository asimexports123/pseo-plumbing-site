import { PHONE_NUMBER } from './cities';

const domain = process.env.NEXT_PUBLIC_DOMAIN || 'https://yohomefix.com';

const COPYRIGHT = `© ${new Date().getFullYear()} YoHomeFix. All rights reserved.`;

export function buildOrganizationSchema() {
  return {
    '@type': 'Organization',
    '@id': `${domain}/#organization`,
    name: 'YoHomeFix',
    url: domain,
    logo: {
      '@type': 'ImageObject',
      url: `${domain}/og-image.png`,
      width: 1200,
      height: 630,
    },
    telephone: PHONE_NUMBER,
    email: 'hello@yohomefix.com',
    foundingDate: '2024',
    description: 'An emergency plumbing call connection platform routing homeowners to verified local plumbing technicians, available 24/7 across the United States.',
    areaServed: { '@type': 'Country', name: 'United States' },
    serviceType: 'Emergency plumbing call connection and referral platform',
    brand: {
      '@type': 'Brand',
      name: 'YoHomeFix',
      description: 'Emergency plumbing dispatch and referral network for homeowners across the United States.',
      logo: { '@id': `${domain}/#organization/logo` },
    },
    knowsAbout: [
      'Plumbing',
      'Emergency plumbing',
      'Drain cleaning',
      'Leak repair',
      'Pipe burst repair',
      'Water heater repair',
      'Sewer line repair',
      'Slab leak repair',
      'Toilet repair',
      'Faucet repair',
      'Garbage disposal repair',
      'Water softener repair',
      'Sump pump repair',
      'Water line repair',
      'Gas line repair',
      'Home services dispatch',
    ],
    sameAs: [
      'https://yohomefix.com',
      'https://yohomefix.com/about',
      'https://yohomefix.com/research/us-water-hardness-plumbing-risk',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: PHONE_NUMBER,
      contactType: 'customer service',
      contactOption: 'TollFree',
      availableLanguage: ['English'],
      hoursAvailable: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '00:00',
        closes: '23:59',
      },
    },
  };
}

export function buildWebSiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': `${domain}/#website`,
    url: domain,
    name: 'YoHomeFix',
    inLanguage: 'en-US',
    copyright: COPYRIGHT,
    description: 'Find licensed emergency plumbers across the USA — 24/7 dispatch, upfront pricing, 60-minute response.',
    publisher: { '@id': `${domain}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${domain}/plumber-usa?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function buildPageSchema({ title, description, path, pageType = 'WebPage', speakable = false, breadcrumbs = [] }) {
  const url = `${domain}${path}`;
  const graph = [buildOrganizationSchema(), buildWebSiteSchema()];

  if (breadcrumbs.length > 0) {
    graph.push(buildBreadcrumbSchema(breadcrumbs));
  }

  const webPage = {
    '@type': pageType,
    '@id': `${url}#webpage`,
    url,
    name: title,
    description,
    inLanguage: 'en-US',
    isPartOf: { '@id': `${domain}/#website` },
    about: { '@id': `${domain}/#organization` },
    copyright: COPYRIGHT,
  };

  if (speakable) {
    webPage.speakable = {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '.speakable-intro'],
    };
  }

  if (pageType === 'ContactPage') {
    webPage.mainEntity = {
      '@type': 'Organization',
      name: 'YoHomeFix',
      telephone: PHONE_NUMBER,
      contactPoint: buildOrganizationSchema().contactPoint,
    };
  }

  graph.push(webPage);

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}

export function buildArticleSchema({ title, description, path, datePublished, dateModified }) {
  const url = `${domain}${path}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      buildOrganizationSchema(),
      buildWebSiteSchema(),
      {
        '@type': 'Article',
        '@id': `${url}#article`,
        url,
        headline: title,
        description,
        datePublished,
        dateModified,
        inLanguage: 'en-US',
        isPartOf: { '@id': `${domain}/#website` },
        about: { '@id': `${domain}/#organization` },
        publisher: { '@id': `${domain}/#organization` },
        copyright: COPYRIGHT,
      },
    ],
  };
}

export function buildPersonSchema(author) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${domain}/authors/${author.slug}#person`,
    name: author.name,
    jobTitle: author.title,
    description: author.bio,
    image: author.image,
    knowsAbout: author.expertise,
    url: `${domain}/authors/${author.slug}`,
    worksFor: { '@id': `${domain}/#organization` },
  };
}

export function buildBreadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
