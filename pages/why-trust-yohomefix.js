import Head from 'next/head';
import Link from 'next/link';
import { PHONE_NUMBER } from '../lib/cities';
import { buildPageSchema } from '../lib/schemas';
import { Footer } from '../components/Footer';
import { Author } from '../components/Author';

const domain = process.env.NEXT_PUBLIC_DOMAIN || 'https://yohomefix.com';

export default function WhyTrust() {
  const title = 'Why Trust YoHomeFix — Editorial Independence & Provider Standards';
  const description = 'Learn why YoHomeFix is a trusted plumbing resource: editorial independence, transparent sourcing, provider vetting, consumer protection, and verified methodology.';
  const canonical = `${domain}/why-trust-yohomefix`;
  const schema = buildPageSchema({
    title,
    description,
    path: '/why-trust-yohomefix',
    breadcrumbs: [
      { name: 'Home', url: `${domain}/` },
      { name: 'Why Trust YoHomeFix', url: `${domain}/why-trust-yohomefix` },
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
          <a href={`tel:${PHONE_NUMBER}`} className="bg-red-600 text-white px-4 py-2 rounded-full font-bold text-sm" aria-label="Call emergency dispatch">📞 Call Now</a>
        </nav>

        <nav aria-label="Breadcrumb" className="max-w-3xl mx-auto w-full px-4 py-2 text-sm text-gray-500">
          <ol className="flex flex-wrap items-center gap-1">
            <li><Link href="/" className="text-blue-600 hover:underline no-underline">Home</Link></li>
            <li><span className="text-gray-300 mx-1">›</span></li>
            <li><span className="text-gray-700 font-medium">Why Trust YoHomeFix</span></li>
          </ol>
        </nav>

        <main className="max-w-3xl mx-auto w-full px-4 py-10 flex-1">

          <h1 className="text-3xl font-extrabold text-blue-900 mb-4">Why Trust YoHomeFix</h1>

          <p className="speakable-intro text-lg text-gray-700 leading-relaxed mb-8 border-l-4 border-blue-600 pl-4">
            Trust matters in an emergency. YoHomeFix is built around transparency, independent editorial standards, and a strict consumer-first approach to connecting homeowners with licensed plumbers.
          </p>

          <div className="space-y-8 text-gray-700 leading-relaxed">

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-2">Editorial Independence</h2>
              <p>
                Our editorial team writes and reviews all content independently. We do not accept payment for placement in guides, city pages, or recommended resources. Contractors cannot pay to appear more prominently, and no advertiser influences the information we publish.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-2">Transparency in Everything We Publish</h2>
              <p>
                We explain how we source information, how cost ranges are estimated, and what homeowners should expect when they call. Every page that references local data includes a methodology note, and we clearly distinguish between general guidance and emergency advice.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-2">How We Vet Providers</h2>
              <p>
                Plumbers in our dispatch network are independent contractors. Before they are eligible to receive calls, we verify:
              </p>
              <ul className="list-disc ml-5 mt-3 space-y-1 text-sm">
                <li>Active state plumbing license for every state they serve.</li>
                <li>General liability insurance coverage of at least $1 million.</li>
                <li>Agreement to provide written, upfront pricing before work begins.</li>
                <li>No unresolved pattern of disciplinary actions on state licensing records.</li>
              </ul>
              <p className="text-sm text-gray-500 mt-3">
                We recheck credentials periodically, but we do not employ or directly supervise contractors. Homeowners should always confirm the technician&apos;s license and insurance before approving work.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-2">Pricing Philosophy</h2>
              <p>
                YoHomeFix does not set prices. We publish market-level cost guidance based on publicly available data, regional labor rates, and common service scopes so homeowners know what to expect. The actual quote is always provided in writing by the independent contractor before any work begins.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-2">Consumer Protection</h2>
              <p>
                We are a call-connection platform, not the plumber. That means we do not control the warranty, scheduling, or final invoice. We do, however, track complaints, monitor contractor behavior, and remove providers from the network who repeatedly fail to meet our standards.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-2">Data Accuracy</h2>
              <p>
                Local information on YoHomeFix is built from public sources such as the U.S. Census Bureau, EPA, USGS, NOAA, local water utilities, and state licensing boards. We update data when official sources change, and we publish our methodology so you can verify the approach.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                See our <Link href="/sources" className="text-blue-600 hover:underline no-underline">Sources & Methodology</Link> for the full list of references and our data workflow.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-2">How Information Is Reviewed</h2>
              <p>
                All published guides and cost pages are reviewed before publication. Major updates and new pages pass through a review checklist that checks for factual accuracy, source currency, tone, and clarity. We also review pages annually, or sooner if a source changes significantly.
              </p>
            </section>

            <section className="bg-gray-50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-blue-900 mb-3">Our Commitments</h2>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>We never publish paid or sponsored contractor rankings.</li>
                <li>We always disclose our dispatch and referral model.</li>
                <li>We correct factual errors when they are reported.</li>
                <li>We do not sell personal information to contractors.</li>
                <li>We prioritize homeowner safety over speed or convenience.</li>
              </ul>
            </section>

          </div>

          <Author pageType="trust" />

          <div className="mt-10 bg-blue-900 text-white rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-extrabold mb-2">Need Help From a Licensed Plumber?</h2>
            <p className="text-white mb-5">Our dispatch team is available 24/7 across the United States.</p>
            <a href={`tel:${PHONE_NUMBER}`} className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-full text-xl font-extrabold transition-colors" aria-label="Call emergency dispatch">
              📞 Get Emergency Help
            </a>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
