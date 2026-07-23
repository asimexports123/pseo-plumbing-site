import Head from 'next/head';
import Link from 'next/link';
import { buildPageSchema } from '../lib/schemas';
import { Footer } from '../components/Footer';
import { Author } from '../components/Author';
import { PHONE_NUMBER } from '../lib/cities';

const domain = process.env.NEXT_PUBLIC_DOMAIN || 'https://yohomefix.com';

export default function Press() {
  const title = 'Press & Media — YoHomeFix';
  const description = 'Press resources, media contact, brand facts, and milestones for YoHomeFix, the 24/7 emergency plumbing service.';
  const canonical = `${domain}/press`;
  const schema = buildPageSchema({
    title,
    description,
    path: '/press',
    breadcrumbs: [
      { name: 'Home', url: `${domain}/` },
      { name: 'Press', url: `${domain}/press` },
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
            <li><span className="text-gray-700 font-medium">Press</span></li>
          </ol>
        </nav>

        <main className="max-w-3xl mx-auto w-full px-4 py-10 flex-1">
          <h1 className="text-3xl font-extrabold text-blue-900 mb-4">Press & Media</h1>
          <p className="text-gray-600 mb-8">
            YoHomeFix provides 24/7 emergency plumbing services across the United States. For media inquiries, brand information, interview requests, and press assets, contact us below.
          </p>

          <div className="space-y-8 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-2">Brand Description</h2>
              <p>
                YoHomeFix provides 24/7 emergency plumbing services across the United States. Available around the clock, YoHomeFix helps homeowners get fast, transparent plumbing help during emergencies and provides educational plumbing resources for maintenance and prevention.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-2">Media Contact</h2>
              <p>
                Email: <a href="mailto:press@yohomefix.com" className="text-blue-600 hover:underline">press@yohomefix.com</a>
                <br />
                General inquiries: <a href="mailto:hello@yohomefix.com" className="text-blue-600 hover:underline">hello@yohomefix.com</a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-2">Brand Assets</h2>
              <p>
                For logo usage, brand colors, and approved boilerplate, please visit our <Link href="/media-kit" className="text-blue-600 hover:underline no-underline">Media Kit</Link> page. Contact us if you need additional assets for a specific story.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-2">Interview Requests</h2>
              <p>
                We are available for interviews on emergency plumbing, home maintenance, seasonal plumbing risks, and helping homeowners find local plumbing professionals. Submit requests to <a href="mailto:press@yohomefix.com" className="text-blue-600 hover:underline">press@yohomefix.com</a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-2">Company Facts</h2>
              <ul className="list-disc ml-5 space-y-1 text-sm">
                <li>24/7 live emergency plumbing service.</li>
                <li>Licensed, insured plumbers in 50+ US cities.</li>
                <li>Educational plumbing guides and cost resources for homeowners.</li>
                <li>Transparent pricing model: written upfront quotes before work begins.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-2">Latest Milestones</h2>
              <p className="text-sm text-gray-600">
                Milestones will be posted here as the company reaches them. We do not publish speculative or unverified milestones.
              </p>
            </section>
          </div>

          <Author pageType="page" />
        </main>

        <Footer />
      </div>
    </>
  );
}
