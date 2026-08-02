import Head from 'next/head';
import Link from 'next/link';
import { SERVICES, cityToSlug, buildSlug, getStateSlug } from '../lib/cities';
import { isZctaQualifiedForService } from '../lib/hyperlocalPlaces';
import { CrawlLinks } from './CrawlLinks';
import { getDeterministicLastReviewed } from '../lib/dateUtils';
import { TrustBar } from './ConversionLayer';
import { EditorialFooter } from './EditorialFooter';
import { Footer } from './Footer';
import { Author } from './Author';
import { Trust } from './Trust';
import { Sources } from './Sources';
import { buildOrganizationSchema, buildWebSiteSchema, buildPlumberSchema, buildServiceSchema } from '../lib/schemas';

const SERVICE_NAMES = {
  'emergency': 'Emergency Plumber',
  'leak-repair': 'Leak Repair',
  'drain-cleaning': 'Drain Cleaning',
  'pipe-burst-repair': 'Pipe Burst Repair',
  'water-heater-repair': 'Water Heater Repair',
  'sewer-line-repair': 'Sewer Line Repair',
  'toilet-repair': 'Toilet Repair',
  'slab-leak-repair': 'Slab Leak Repair',
  'water-line-repair': 'Water Line Repair',
  'faucet-repair': 'Faucet Repair',
  'garbage-disposal-repair': 'Garbage Disposal Repair',
  'water-softener-repair': 'Water Softener Repair',
  'whole-house-repiping': 'Whole-House Repiping',
  'main-water-shutoff-valve-repair': 'Main Water Shutoff Valve Repair',
  'sump-pump-repair': 'Sump Pump Repair',
};

const ZIP_DESCRIPTION_TEMPLATES = {
  'emergency': (svc, zip, city, st) => `${svc} in ZIP ${zip}, ${city}, ${st}? Burst pipe or flooding? Licensed 24/7 emergency plumber dispatched fast — upfront pricing before any work begins. Call now.`,
  'leak-repair': (svc, zip, city, st) => `Water leak in ZIP ${zip}, ${city}, ${st}? Licensed plumber for pinhole, slab, and supply line leaks — 24/7 service, upfront pricing. Call now.`,
  'drain-cleaning': (svc, zip, city, st) => `Clogged drain in ZIP ${zip}, ${city}, ${st}? 24/7 emergency drain cleaning and sewer clearing — licensed plumber sent fast. Upfront pricing. Call now.`,
  'pipe-burst-repair': (svc, zip, city, st) => `Burst pipe in ZIP ${zip}, ${city}, ${st}? Stop water damage now. Licensed emergency plumber on-site fast — 24/7 service, upfront pricing. Call now.`,
  'water-heater-repair': (svc, zip, city, st) => `No hot water in ZIP ${zip}, ${city}, ${st}? Emergency water heater repair 24/7 — tank & tankless, same-day replacement. Licensed plumber, upfront pricing. Call now.`,
  'sewer-line-repair': (svc, zip, city, st) => `Sewer line problems in ZIP ${zip}, ${city}, ${st}? Licensed plumber handles main line repair, camera inspection, trenchless options. 24/7 service, upfront pricing. Call now.`,
  'toilet-repair': (svc, zip, city, st) => `Toilet problems in ZIP ${zip}, ${city}, ${st}? Licensed plumber handles running toilets, clogs, leaks, and installation. 24/7 service, upfront pricing. Call now.`,
  'slab-leak-repair': (svc, zip, city, st) => `Slab leak in ZIP ${zip}, ${city}, ${st}? Licensed plumber provides detection, epoxy lining, and repair. 24/7 service, upfront pricing. Call now.`,
  'water-line-repair': (svc, zip, city, st) => `Water line problems in ZIP ${zip}, ${city}, ${st}? Licensed plumber handles leak detection, section repair, and line replacement. 24/7, upfront pricing. Call now.`,
  'faucet-repair': (svc, zip, city, st) => `Faucet problems in ZIP ${zip}, ${city}, ${st}? Licensed plumber handles dripping faucets, leaks, and new installation. 24/7 service, upfront pricing. Call now.`,
  'garbage-disposal-repair': (svc, zip, city, st) => `Garbage disposal problems in ZIP ${zip}, ${city}, ${st}? Licensed plumber handles jammed disposals, leaks, and installation. 24/7, upfront pricing. Call now.`,
  'water-softener-repair': (svc, zip, city, st) => `Water softener problems in ZIP ${zip}, ${city}, ${st}? Licensed plumber handles softener repair, resin replacement, and installation. 24/7, upfront pricing. Call now.`,
  'whole-house-repiping': (svc, zip, city, st) => `Repeated pipe leaks in ZIP ${zip}, ${city}, ${st}? Licensed plumber assesses whole-house repiping and replacement options. Written scope, upfront pricing. Call now.`,
  'main-water-shutoff-valve-repair': (svc, zip, city, st) => `Shutoff valve leaking or stuck in ZIP ${zip}, ${city}, ${st}? Licensed plumber provides safe valve repair and replacement. 24/7, upfront pricing. Call now.`,
  'sump-pump-repair': (svc, zip, city, st) => `Sump pump failure in ZIP ${zip}, ${city}, ${st}? Licensed 24/7 sump pump repair — float switch, motor, backup systems. Upfront pricing. Call now.`,
};

function buildZipDescription(serviceSlug, serviceName, zip, cityName, stateCode) {
  const template = ZIP_DESCRIPTION_TEMPLATES[serviceSlug];
  if (template) return template(serviceName, zip, cityName, stateCode);
  return `${serviceName} in ZIP ${zip}, ${cityName}, ${stateCode}. Licensed plumbers available 24/7 with upfront pricing. Call now.`;
}

export function ZipServicePage({
  zip,
  cityName,
  stateCode,
  stateName,
  serviceSlug,
  serviceName,
  content,
  nearbyZips,
  nearbyCities,
  cityZipCount,
  pageSlug,
}) {
  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'https://yohomefix.com';
  const title = `${serviceName} in ${cityName}, ${stateCode} ${zip} | 24/7 Plumber | YoHomeFix`;
  const description = buildZipDescription(serviceSlug, serviceName, zip, cityName, stateCode);
  const canonical = `${domain}/areas/${pageSlug}`;
  const stateHubSlug = stateCode ? `plumber-${getStateSlug(stateCode)}` : null;
  const cityServiceSlug = buildSlug(cityToSlug(cityName), serviceSlug);
  const lastReviewed = getDeterministicLastReviewed(cityName);
  const orgSchema = buildOrganizationSchema();
  const webSchema = buildWebSiteSchema();

  const breadcrumbs = [
    { name: 'Home', url: `${domain}/` },
    { name: 'All Cities', url: `${domain}/plumber-usa` },
    ...(stateHubSlug ? [{ name: stateCode, url: `${domain}/${stateHubSlug}` }] : []),
    { name: cityName, url: `${domain}/${cityServiceSlug}` },
    { name: `ZIP ${zip}`, url: canonical },
  ];

  const zcta = { stateCode };

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonical}#breadcrumb`,
        itemListElement: breadcrumbs.map((b, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: b.name,
          item: b.url,
        })),
      },
      orgSchema,
      webSchema,
      buildPlumberSchema({
        url: canonical,
        description,
        areaServed: {
          '@type': 'City',
          name: cityName,
          containedInPlace: { '@type': 'State', name: stateCode },
        },
      }),
      buildServiceSchema({
        name: `${serviceName} in ${cityName}, ${stateCode} ${zip}`,
        serviceType: serviceName,
        url: canonical,
        description,
        areaServed: {
          '@type': 'City',
          name: cityName,
          containedInPlace: { '@type': 'State', name: stateCode },
        },
        providerId: `${canonical}#plumber`,
      }),
      ...(content?.faqs?.length ? [{
        '@type': 'FAQPage',
        mainEntity: content.faqs.slice(0, 6).map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: { '@type': 'Answer', text: faq.a },
        })),
      }] : []),
      {
        '@type': 'WebPage',
        '@id': canonical,
        url: canonical,
        name: title,
        description,
        datePublished: '2025-01-15',
        dateModified: lastReviewed,
        speakable: {
          '@type': 'SpeakableSpecification',
          cssSelector: ['h1', '.speakable-intro'],
        },
        breadcrumb: { '@id': `${canonical}#breadcrumb` },
        isPartOf: { '@type': 'WebSite', '@id': `${domain}/#website` },
      },
    ],
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonical} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </Head>

      <div className="font-sans bg-white min-h-screen flex flex-col">
        {/* Header */}
        <nav className="bg-blue-900 text-white px-4 py-3 flex justify-between items-center sticky top-0 z-40 shadow-lg">
          <Link href="/" className="text-2xl font-extrabold text-white no-underline">YoHomeFix</Link>
          <a href="tel:1" data-track="zip-nav" className="bg-brand hover:bg-brand-dark text-white px-5 py-2 rounded-full font-bold transition-colors no-underline" aria-label="Call emergency dispatch">
            <span aria-hidden="true">📞</span> Call Now
          </a>
        </nav>

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="max-w-4xl mx-auto w-full px-4 py-2 text-sm text-gray-600">
          <ol className="flex flex-wrap items-center gap-1">
            <li><Link href="/" className="text-blue-700 hover:underline no-underline">Home</Link></li>
            <li><span className="text-gray-400 mx-1" aria-hidden="true">›</span></li>
            <li><Link href="/plumber-usa" className="text-blue-700 hover:underline no-underline">All Cities</Link></li>
            <li><span className="text-gray-400 mx-1" aria-hidden="true">›</span></li>
            {stateHubSlug && (
              <>
                <li><Link href={{ pathname: '/states/[state]', query: { state: getStateSlug(stateCode) } }} as={`/${stateHubSlug}`} className="text-blue-700 hover:underline no-underline">{stateCode}</Link></li>
                <li><span className="text-gray-400 mx-1" aria-hidden="true">›</span></li>
              </>
            )}
            <li><Link href={`/${cityServiceSlug}`} className="text-blue-700 hover:underline no-underline">{cityName}</Link></li>
            <li><span className="text-gray-400 mx-1" aria-hidden="true">›</span></li>
            <li><span className="text-gray-800 font-medium" aria-current="page">ZIP {zip}</span></li>
          </ol>
        </nav>

        {/* Hero */}
        <section className="bg-gradient-to-br from-blue-900 to-blue-700 text-white px-4 py-10 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-block bg-brand text-white text-sm font-bold px-3 py-1 rounded-full mb-3">
              ⚡ 24/7 Emergency Available
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
              {serviceName} in {cityName}, {stateCode} {zip}
            </h1>
            <p className="text-lg text-blue-50 mb-2">
              Licensed plumbers serving the {zip} area of {cityName}. Available 24/7 with transparent pricing from participating providers.
            </p>
            <p className="text-sm text-blue-100 mb-5">
              ZIP Code {zip} is part of {cityName}, {stateName}. We connect homeowners in this area with local plumbing professionals.
            </p>
            <p className="text-white text-sm mb-5 max-w-2xl mx-auto">
              Serving homeowners across the USA with ZIP code–based local plumber matching.
            </p>
            <a href="tel:1" data-track="zip-hero" className="inline-flex items-center gap-3 bg-brand hover:bg-brand-dark text-white px-8 py-4 rounded-full text-xl font-extrabold shadow-xl transition-transform hover:scale-105 no-underline" aria-label="Call emergency dispatch now">
              <span aria-hidden="true">📞</span> Get Emergency Help
            </a>
          </div>
        </section>

        <main className="max-w-4xl mx-auto w-full px-4 py-8 md:py-12">
          {/* Trust bar */}
          <TrustBar />

          {/* Service overview for this ZIP */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">
              Plumbing Service in ZIP {zip} — {cityName}, {stateCode}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The {zip} ZIP Code area is part of {cityName}, {stateName}. Homeowners in this area experience the same plumbing challenges common throughout {cityName} — including {content.keyTakeaways?.[0] || 'pipe failures, drain blockages, and water heater issues'}. When you need {serviceName.toLowerCase()} in the {zip} area, YoHomeFix connects you with licensed plumbers who serve {cityName} and surrounding communities.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Our plumbers are familiar with {cityName}'s housing stock, water infrastructure, and common plumbing issues. Whether you're in the {zip} area or anywhere else in {cityName}, help is available 24/7 with upfront pricing whenever available from participating providers.
            </p>
          </section>

          {/* Key takeaways inherited from parent city */}
          {content.keyTakeaways && content.keyTakeaways.length > 0 && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-blue-900 mb-4">Key Takeaways — {serviceName} in {cityName}</h2>
              <ul className="space-y-3">
                {content.keyTakeaways.map((k, i) => (
                  <li key={i} className="flex gap-3 text-gray-700">
                    <span className="text-blue-600 font-bold flex-shrink-0">✓</span>
                    <span>{k}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Plumbing conditions from parent city */}
          {content.plumbingConditions && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-blue-900 mb-4">📍 Plumbing Conditions in {cityName}</h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                {content.plumbingConditions}
              </div>
            </section>
          )}

          {/* Service coverage */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">{serviceName} Coverage in ZIP {zip}</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The {zip} area of {cityName} is served by plumbers familiar with local infrastructure, water systems, and common plumbing problems. {serviceName} is available throughout {cityName}, including the {zip} ZIP Code area.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-gray-700">
                <strong>Service Area:</strong> ZIP Code {zip}, {cityName}, {stateCode}<br/>
                <strong>Parent City:</strong> {cityName}, {stateName}<br/>
                <strong>Availability:</strong> 24/7 emergency service<br/>
                <strong>Response Target:</strong> 60 minutes
              </p>
            </div>
          </section>

          {/* All services available in this ZIP */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">All Plumbing Services in ZIP {zip}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {SERVICES.filter(svc => !zcta || isZctaQualifiedForService(zcta, svc.slug)).map(svc => (
                <Link
                  key={svc.slug}
                  href={`/areas/${cityToSlug(cityName)}/${zip}/${svc.slug}`}
                  className="px-3 py-2 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 text-gray-700 rounded-lg text-sm no-underline transition-colors font-medium text-center"
                >
                  {svc.name}
                </Link>
              ))}
            </div>
          </section>

          {/* Nearby ZIP codes */}
          {nearbyZips.length > 0 && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-blue-900 mb-4">Also Serving Nearby ZIP Codes</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {nearbyZips.filter(nz => {
                  return isZctaQualifiedForService({ stateCode: nz.stateCode }, serviceSlug);
                }).map(nz => (
                  <Link
                    key={nz.zip}
                    href={`/areas/${nz.parentCitySlug || cityToSlug(cityName)}/${nz.zip}/${serviceSlug}`}
                    className="px-3 py-2 bg-gray-50 hover:bg-blue-50 text-gray-700 rounded-lg text-sm no-underline transition-colors font-medium text-center"
                  >
                    ZIP {nz.zip} — {nz.parentCity}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Pricing guidance */}
          {content.pricingGuidance && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-blue-900 mb-4">{content.pricingGuidance.heading}</h2>
              <p className="text-sm text-gray-500 mb-4">{content.pricingGuidance.disclaimer}</p>
              <div className="space-y-3">
                {content.pricingGuidance.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-start border-b border-gray-100 pb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-sm">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.note}</p>
                    </div>
                    <span className="text-blue-700 font-bold text-sm whitespace-nowrap ml-3">{item.low}–{item.high}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* FAQ from parent city */}
          {content.faqs && content.faqs.length > 0 && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-blue-900 mb-4">Frequently Asked Questions — {serviceName} in {cityName}</h2>
              <div className="space-y-4">
                {content.faqs.slice(0, 6).map((faq, i) => (
                  <details key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                    <summary className="cursor-pointer px-4 py-3 bg-gray-50 hover:bg-gray-100 font-semibold text-gray-800 text-sm list-none [&::-webkit-details-marker]:hidden">
                      {faq.q}
                    </summary>
                    <div className="px-4 py-3 text-gray-700 text-sm">{faq.a}</div>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* Back to parent city */}
          <section className="mb-8 bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
            <h2 className="text-xl font-bold text-blue-900 mb-2">View Full {cityName} Coverage</h2>
            <p className="text-gray-600 text-sm mb-4">
              See all plumbing services available throughout {cityName}, {stateCode} — including {cityZipCount} ZIP Code areas we serve.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href={`/${cityServiceSlug}`}
                className="inline-block bg-blue-900 text-white px-6 py-3 rounded-full font-bold hover:bg-blue-800 transition-colors no-underline"
              >
                {serviceName} in {cityName} →
              </Link>
              {cityZipCount > 1 && (
                <Link
                  href={`/areas/${cityToSlug(cityName)}`}
                  className="inline-block bg-white text-blue-900 border border-blue-300 px-6 py-3 rounded-full font-bold hover:bg-blue-50 transition-colors no-underline"
                >
                  All ZIP Codes in {cityName} →
                </Link>
              )}
            </div>
          </section>

          {/* Editorial footer */}
          <CrawlLinks
            cityName={cityName}
            stateCode={stateCode}
            serviceSlug={serviceSlug}
            nearbyCities={nearbyCities}
            nearbyZips={nearbyZips}
            zip={zip}
            pageSlug={pageSlug}
          />

          <EditorialFooter pageType="zip-service" />

          {/* Author */}
          <Author pageType="zip-service" />

          {/* Trust */}
          <Trust />

          {/* Sources */}
          <Sources />

          {/* Bottom CTA */}
          <div className="bg-blue-900 text-white rounded-2xl p-8 text-center mt-8">
            <h2 className="text-2xl font-extrabold mb-2">Need a Plumber in ZIP {zip}?</h2>
            <p className="text-blue-100 mb-5">Our team is standing by 24/7 in {cityName}</p>
            <a href="tel:1" data-track="zip-bottom-cta" className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-full text-xl font-extrabold transition-colors no-underline" aria-label="Call emergency dispatch today">
              <span aria-hidden="true">📞</span> Call Today
            </a>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
