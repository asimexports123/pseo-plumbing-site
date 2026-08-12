import Head from 'next/head';
import Link from 'next/link';
import { cityToSlug } from '../../lib/cities';
import { EditorialFooter } from '../../components/EditorialFooter';
import { Footer } from '../../components/Footer';
import { Author } from '../../components/Author';
import { buildPageSchema } from '../../lib/schemas';

const GUIDE_LIST = [
  { slug: 'how-to-prevent-frozen-pipes',      title: "How to Prevent Frozen Pipes — A Homeowner's Complete Guide",          category: 'Winter Plumbing',       readTime: '8 min read', desc: 'Step-by-step insulation tips, thermostat settings, and what to do if a pipe freezes.' },
  { slug: 'signs-you-need-a-plumber',         title: '10 Signs You Need to Call a Plumber Right Now',                       category: 'Plumbing Basics',       readTime: '6 min read', desc: 'The warning signs that mean you need professional help — before a small issue becomes costly.' },
  { slug: 'how-to-shut-off-water-in-emergency', title: 'How to Shut Off Your Water in a Plumbing Emergency',               category: 'Emergency Preparedness', readTime: '5 min read', desc: 'Main shutoff, fixture shutoffs, and the street meter — where they are and how to use them.' },
  { slug: 'hard-water-effects-on-plumbing',   title: 'Hard Water and Your Plumbing — What Every Homeowner Should Know',    category: 'Water Quality',         readTime: '7 min read', desc: 'How hard water damages water heaters, pipes, and appliances — and how to protect them.' },
  { slug: 'water-heater-maintenance-guide',   title: 'Water Heater Maintenance Guide — Extend the Life of Your Water Heater', category: 'Appliance Maintenance', readTime: '7 min read', desc: 'Annual tank flushing, anode rod inspection, pressure relief testing, and more.' },
];

const domain = process.env.NEXT_PUBLIC_DOMAIN || 'https://yohomefix.com';

export default function GuidesIndex() {
  const canonical = `${domain}/guides`;
  const title = 'Plumbing Guides for Homeowners | YoHomeFix';
  const description = 'Free plumbing guides for homeowners — how to prevent frozen pipes, shut off water in an emergency, deal with hard water, and maintain your water heater.';
  const schema = buildPageSchema({
    title,
    description,
    path: '/guides',
    breadcrumbs: [
      { name: 'Home', url: `${domain}/` },
      { name: 'Guides', url: `${domain}/guides` },
    ],
  });

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
        <meta property="og:image" content={`${domain}/og-image.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={`${domain}/og-image.png`} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </Head>

      <div className="font-sans bg-white min-h-screen flex flex-col">
        <nav className="bg-blue-900 text-white px-4 py-3 flex justify-between items-center sticky top-0 z-40 shadow-lg">
          <Link href="/" className="text-2xl font-extrabold text-white no-underline">YoHomeFix</Link>
          <a href="tel:1" className="hidden md:flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-full font-bold" aria-label="Call emergency dispatch">
            📞 Call Now
          </a>
          <a href="tel:1" className="md:hidden bg-red-600 text-white px-4 py-2 rounded-full font-bold text-sm" aria-label="Call emergency dispatch">Call Now</a>
        </nav>

        <nav aria-label="Breadcrumb" className="max-w-3xl mx-auto w-full px-4 py-2 text-sm text-gray-500">
          <ol className="flex flex-wrap items-center gap-1">
            <li><Link href="/" className="text-blue-600 hover:underline no-underline">Home</Link></li>
            <li><span className="text-gray-300 mx-1">›</span></li>
            <li><span className="text-gray-700 font-medium">Guides</span></li>
          </ol>
        </nav>

        <section className="relative w-full overflow-hidden text-white" style={{ backgroundColor: '#172554' }}>
          <div className="flex flex-col md:flex-row md:items-stretch">
            <div className="relative z-10 flex-1 flex items-center px-4 sm:px-6 lg:px-12 py-10 md:py-20 lg:py-14">
              <div className="w-full max-w-2xl mx-auto md:mx-0 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-extrabold mb-3 leading-tight">Plumbing Guides for Homeowners</h1>
                <p className="text-white text-lg mb-2">Practical, expert-written guides on preventing plumbing failures, handling emergencies, and maintaining your home&apos;s plumbing systems.</p>
                <p className="text-white text-sm mb-5 max-w-2xl mx-auto md:mx-0">Serving homeowners across the USA with ZIP code–based local plumber matching.</p>
              </div>
              <div
                className="absolute top-full left-0 right-0 h-32 pointer-events-none md:hidden"
                style={{ background: 'linear-gradient(to bottom, rgba(23,37,84,1) 0%, rgba(23,37,84,0.85) 15%, rgba(23,37,84,0.55) 30%, rgba(23,37,84,0.3) 45%, rgba(23,37,84,0.12) 60%, rgba(23,37,84,0.03) 75%, rgba(23,37,84,0) 100%)' }}
              />
            </div>
            <div className="relative w-full md:w-[40%] md:flex-shrink-0 lg:w-[38%] pointer-events-none select-none">
              <img
                src="/images/plumber-service-hero.jpg"
                alt="Licensed plumber repairing pipes with professional tools"
                width={720}
                height={915}
                loading="eager"
                fetchpriority="high"
                className="w-full h-auto object-contain"
                aria-hidden="true"
                style={{ display: 'block' }}
              />
              <div
                className="absolute inset-y-0 left-0 pointer-events-none hidden md:block"
                style={{
                  width: '42%',
                  background: 'linear-gradient(to right, #172554 0%, rgba(23,37,84,0.98) 10%, rgba(23,37,84,0.92) 25%, rgba(23,37,84,0.8) 40%, rgba(23,37,84,0.6) 55%, rgba(23,37,84,0.4) 70%, rgba(23,37,84,0.2) 85%, rgba(23,37,84,0) 100%)',
                }}
              />
            </div>
          </div>
        </section>

        <main className="max-w-3xl mx-auto w-full px-4 py-10">
          <div className="grid gap-6">
            {GUIDE_LIST.map((g) => (
              <Link
                key={g.slug}
                href={`/guides/${g.slug}`}
                className="block border border-gray-200 rounded-2xl p-6 hover:border-blue-400 hover:shadow-sm transition-all no-underline group"
              >
                <div className="flex gap-3 mb-2">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-700">{g.category}</span>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-500">{g.readTime}</span>
                </div>
                <h2 className="text-xl font-bold text-blue-900 group-hover:text-blue-700 mb-2">{g.title}</h2>
                <p className="text-gray-600 text-sm leading-relaxed">{g.desc}</p>
                <span className="inline-block mt-3 text-blue-600 text-sm font-semibold group-hover:underline">Read guide →</span>
              </Link>
            ))}
          </div>

          <div className="mt-10 bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-blue-900 mb-3">Plumbing Cost Guides by City</h2>
            <p className="text-gray-600 text-sm mb-4">See city-adjusted pricing before you call for emergency plumbing, leak repair, drain cleaning, pipe burst repair, and water heater service.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {['New York','Los Angeles','Chicago','Houston','Phoenix','Dallas','San Antonio','San Diego','Austin','Philadelphia'].map((city) => (
                <Link key={city} href={`/cost/${cityToSlug(city)}`}
                  className="block text-center px-3 py-2 border border-yellow-300 rounded-lg text-sm text-yellow-800 hover:bg-yellow-100 no-underline transition-colors"
                  title={`Plumbing cost guide for ${city}`}>
                  {city} plumbing costs
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-10 bg-blue-900 text-white rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-extrabold mb-2">Need a Plumber Now?</h2>
            <p className="text-white mb-5">24/7 emergency dispatch — licensed plumbers across the US</p>
            <a href="tel:1" className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-full text-xl font-extrabold transition-colors" aria-label="Call emergency dispatch">
              📞 Call Now — 24/7
            </a>
          </div>

          <EditorialFooter pageType="guides-index" />
          <Author pageType="guide" />
        </main>

        <Footer />
      </div>
    </>
  );
}
