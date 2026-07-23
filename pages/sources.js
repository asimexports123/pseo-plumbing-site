import Head from 'next/head';
import Link from 'next/link';
import { buildPageSchema } from '../lib/schemas';
import { Footer } from '../components/Footer';
import { Author } from '../components/Author';
import { PHONE_NUMBER } from '../lib/cities';

const domain = process.env.NEXT_PUBLIC_DOMAIN || 'https://yohomefix.com';

const sources = [
  {
    name: 'U.S. Environmental Protection Agency (EPA)',
    url: 'https://www.epa.gov',
    why: 'Referenced for water quality, safe drinking water standards, and environmental health guidance related to plumbing systems.',
  },
  {
    name: 'National Oceanic and Atmospheric Administration (NOAA)',
    url: 'https://www.noaa.gov',
    why: 'Referenced for climate data, freeze-risk patterns, and regional precipitation that affect plumbing failure rates and winterization needs.',
  },
  {
    name: 'U.S. Census Bureau',
    url: 'https://www.census.gov',
    why: 'Referenced for population, housing stock age, and demographic context that help describe local plumbing infrastructure conditions.',
  },
  {
    name: 'Local Water Utilities & Municipal Authorities',
    url: 'https://www.epa.gov',
    why: 'Referenced for utility names, water source information, annual water quality reports, and local infrastructure programs.',
  },
  {
    name: 'Government Infrastructure Sources',
    url: 'https://www.usgs.gov',
    why: 'Referenced for water hardness, geological conditions, and infrastructure age data that influence local plumbing risk profiles.',
  },
  {
    name: 'Centers for Disease Control and Prevention (CDC)',
    url: 'https://www.cdc.gov',
    why: 'Referenced for health and safety guidance related to waterborne hazards, mold, and sanitation after plumbing failures.',
  },
  {
    name: 'U.S. Geological Survey (USGS)',
    url: 'https://www.usgs.gov',
    why: 'Referenced for geological and water hardness data that influence plumbing infrastructure and failure patterns across regions.',
  },
  {
    name: 'U.S. Department of Energy (DOE)',
    url: 'https://www.energy.gov',
    why: 'Referenced for water heater efficiency, energy use, and guidance on selecting efficient plumbing-related appliances.',
  },
  {
    name: 'ENERGY STAR',
    url: 'https://www.energystar.gov',
    why: 'Referenced for water heater efficiency standards and certified product information.',
  },
  {
    name: 'WaterSense (EPA)',
    url: 'https://www.epa.gov/watersense',
    why: 'Referenced for water-efficient fixtures, conservation practices, and product labeling.',
  },
  {
    name: 'International Association of Plumbing and Mechanical Officials (IAPMO)',
    url: 'https://www.iapmo.org',
    why: 'Referenced for plumbing code standards and mechanical safety practices.',
  },
  {
    name: 'International Code Council (ICC)',
    url: 'https://www.iccsafe.org',
    why: 'Referenced for building code and plumbing code requirements used in residential construction.',
  },
  {
    name: 'Manufacturer Installation Manuals',
    url: 'https://www.rheem.com',
    why: 'Example manufacturer referenced for water heater installation, maintenance, and safety documentation.',
  },
  {
    name: 'State Water Authorities',
    url: 'https://www.waterboards.ca.gov',
    why: 'Example state water board referenced for water quality reports, utility oversight, and public water system data.',
  },
  {
    name: 'American Water Works Association (AWWA)',
    url: 'https://www.awwa.org',
    why: 'Referenced for water system best practices, distribution infrastructure, and water quality standards.',
  },
  {
    name: 'Plumbing-Heating-Cooling Contractors Association (PHCC)',
    url: 'https://www.phcc.org',
    why: 'Referenced for industry trade practices, contractor training, and residential plumbing standards.',
  },
];

export default function Sources() {
  const title = 'Sources & Methodology — YoHomeFix';
  const description = 'Authoritative sources and methodology used by YoHomeFix for plumbing content, water quality, and safety guidance.';
  const canonical = `${domain}/sources`;
  const schema = buildPageSchema({
    title,
    description,
    path: '/sources',
    breadcrumbs: [
      { name: 'Home', url: `${domain}/` },
      { name: 'Sources & Methodology', url: `${domain}/sources` },
    ],
  });

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={`${domain}/og-image.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={`${domain}/og-image.png`} />
        <meta name="robots" content="index, follow" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </Head>

      <div className="font-sans bg-white min-h-screen flex flex-col">
        <nav className="bg-blue-900 text-white px-4 py-3 flex justify-between items-center sticky top-0 z-40 shadow-lg">
          <Link href="/" className="text-2xl font-extrabold text-white no-underline">YoHomeFix</Link>
          <a href={`tel:${PHONE_NUMBER}`} className="bg-red-600 text-white px-4 py-2 rounded-full font-bold text-sm" aria-label="Call emergency dispatch">📞 Call Now</a>
        </nav>

        <nav aria-label="Breadcrumb" className="max-w-3xl mx-auto w-full px-4 py-2 text-sm text-gray-500">
          <ol className="flex flex-wrap items-center gap-1">
            <li><Link href="/" className="text-blue-600 hover:underline no-underline">Home</Link></li>
            <li><span className="text-gray-300 mx-1">›</span></li>
            <li><span className="text-gray-700 font-medium">Sources & Methodology</span></li>
          </ol>
        </nav>

        <main className="max-w-3xl mx-auto w-full px-4 py-10 flex-1">
          <h1 className="text-3xl font-extrabold text-blue-900 mb-4">Sources & Methodology</h1>
          <p className="text-gray-600 mb-8">
            YoHomeFix content is built from authoritative public sources and industry standards. We do not copy source text; we summarize and apply it to homeowner plumbing guidance. Below are the categories of sources we reference and the methodology we follow.
          </p>

          <section className="bg-gray-50 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-blue-900 mb-3">Our Methodology</h2>
            <div className="space-y-4 text-gray-700 text-sm leading-relaxed">
              <p>
                <strong>1. Source selection.</strong> We prioritize U.S. government agencies, recognized trade organizations, and publicly available municipal data. Each source is evaluated for authority, relevance, and recency.
              </p>
              <p>
                <strong>2. Data synthesis.</strong> We combine multiple data points — climate, water hardness, housing age, infrastructure class, and utility information — to create locally relevant risk profiles for each city and state.
              </p>
              <p>
                <strong>3. Expert application.</strong> Plumbing guidance is framed around common trade practices and manufacturer recommendations, not anecdotal advice.
              </p>
              <p>
                <strong>4. Editorial review.</strong> Every page is reviewed for accuracy, clarity, and consistency with our source data before publication.
              </p>
              <p>
                <strong>5. Continuous updates.</strong> Source pages are reviewed quarterly. When official data changes, we update the affected content within one review cycle.
              </p>
              <p className="mt-4">
                <Link href="/research/us-water-hardness-plumbing-risk" className="text-blue-600 hover:underline font-bold">
                  See our US City Water Hardness & Plumbing Risk Index →
                </Link>
              </p>
            </div>
          </section>

          <div className="space-y-6">
            {sources.map((source) => (
              <div key={source.name} className="border border-gray-200 rounded-xl p-5">
                <h2 className="text-lg font-bold text-blue-900 mb-1">
                  <a href={source.url} target="_blank" rel="noopener noreferrer" className="hover:underline no-underline text-blue-900">
                    {source.name}
                  </a>
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed">{source.why}</p>
              </div>
            ))}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 mt-8 text-sm text-yellow-800">
            <strong>Note:</strong> We reference these sources to inform our educational content. For code compliance, permit requirements, or specific repairs, consult a licensed plumber and your local building authority.
          </div>

          <Author pageType="page" />
        </main>

        <Footer />
      </div>
    </>
  );
}
