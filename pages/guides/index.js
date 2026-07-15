import Head from 'next/head';
import Link from 'next/link';
import { PHONE_NUMBER, cityToSlug } from '../../lib/cities';
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

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-red-600 md:hidden" style={{ height: 64 }}>
        <a href={`tel:${PHONE_NUMBER}`} className="flex items-center justify-center gap-3 h-full text-white font-extrabold text-xl w-full" aria-label="Call emergency dispatch">
          📞 CALL NOW — 24/7
        </a>
      </div>

      <div className="font-sans bg-white min-h-screen flex flex-col pb-16 md:pb-0">
        <nav className="bg-blue-900 text-white px-4 py-3 flex justify-between items-center sticky top-0 z-40 shadow-lg">
          <Link href="/" className="text-2xl font-extrabold text-white no-underline">YoHomeFix</Link>
          <a href={`tel:${PHONE_NUMBER}`} className="hidden md:flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-full font-bold" aria-label="Call emergency dispatch">
            📞 Call Now
          </a>
          <a href={`tel:${PHONE_NUMBER}`} className="md:hidden bg-red-600 text-white px-4 py-2 rounded-full font-bold text-sm" aria-label="Call emergency dispatch">Call Now</a>
        </nav>

        <nav aria-label="Breadcrumb" className="max-w-3xl mx-auto w-full px-4 py-2 text-sm text-gray-500">
          <ol className="flex flex-wrap items-center gap-1">
            <li><Link href="/" className="text-blue-600 hover:underline no-underline">Home</Link></li>
            <li><span className="text-gray-300 mx-1">›</span></li>
            <li><span className="text-gray-700 font-medium">Guides</span></li>
          </ol>
        </nav>

        <section className="bg-gradient-to-br from-blue-900 to-blue-700 text-white px-4 py-12 text-center">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-3">Plumbing Guides for Homeowners</h1>
            <p className="text-white text-lg">Practical, expert-written guides on preventing plumbing failures, handling emergencies, and maintaining your home&apos;s plumbing systems.</p>
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
            <a href={`tel:${PHONE_NUMBER}`} className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-full text-xl font-extrabold transition-colors" aria-label="Call emergency dispatch">
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
