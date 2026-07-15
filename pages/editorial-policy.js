import Head from 'next/head';
import Link from 'next/link';
import { buildPageSchema } from '../lib/schemas';
import { Footer } from '../components/Footer';
import { Author } from '../components/Author';
import { PHONE_NUMBER } from '../lib/cities';

const domain = process.env.NEXT_PUBLIC_DOMAIN || 'https://yohomefix.com';

export default function EditorialPolicy() {
  const title = 'Editorial Policy — YoHomeFix';
  const description = 'YoHomeFix editorial policy: how we research, review, and maintain accurate plumbing content for homeowners.';
  const canonical = `${domain}/editorial-policy`;
  const schema = buildPageSchema({
    title,
    description,
    path: '/editorial-policy',
    breadcrumbs: [
      { name: 'Home', url: `${domain}/` },
      { name: 'Editorial Policy', url: `${domain}/editorial-policy` },
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
            <li><span className="text-gray-700 font-medium">Editorial Policy</span></li>
          </ol>
        </nav>

        <main className="max-w-3xl mx-auto w-full px-4 py-10 flex-1">
          <h1 className="text-3xl font-extrabold text-blue-900 mb-4">Editorial Policy</h1>
          <p className="text-gray-600 mb-8">
            YoHomeFix publishes plumbing service, maintenance, and emergency information to help homeowners make informed decisions. This page explains how we research, review, and maintain our content.
          </p>

          <div className="space-y-8 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-2">How We Research Content</h2>
              <p className="mb-3">
                Our content is built from a combination of authoritative public sources, manufacturer documentation, and widely accepted plumbing trade practices. We reference government agencies, water quality databases, and plumbing code resources where applicable.
              </p>
              <p>
                Local infrastructure data on city and state pages is sourced from municipal water utility reports, geological surveys, and public climate records. We do not invent local facts, utility names, or water quality measurements.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-2">Editorial Workflow</h2>
              <p>
                Every page follows the same workflow before it reaches our site:
              </p>
              <ol className="list-decimal ml-5 mt-3 space-y-1 text-sm">
                <li><strong>Research:</strong> Gather data from authoritative public sources, manufacturer documentation, and trade standards.</li>
                <li><strong>Draft:</strong> Create homeowner-friendly content that explains the issue, options, and expected outcomes.</li>
                <li><strong>Fact-check:</strong> Verify all statistics, source links, local data, and pricing references.</li>
                <li><strong>Review:</strong> A human editor checks for accuracy, clarity, tone, and compliance with our standards.</li>
                <li><strong>Publish:</strong> The page goes live with a last-reviewed date and relevant schema markup.</li>
                <li><strong>Revisit:</strong> Pages are reviewed quarterly or sooner if source data changes.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-2">Fact-Checking Process</h2>
              <p>
                Every factual claim is checked against at least one authoritative source. Local data points, such as water hardness, climate classifications, or pipe-era estimates, are cross-referenced with municipal utility reports, USGS records, or state-level data. Pricing estimates are reviewed against publicly available regional labor and material cost data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-2">Source Verification Standards</h2>
              <p>
                We prioritize sources that are authoritative, current, and publicly accessible. These include federal agencies (EPA, USGS, NOAA, U.S. Census Bureau), state licensing boards, municipal water utilities, and recognized plumbing trade standards. We do not rely on anonymous forums, unverified reviews, or marketing materials as factual sources.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-2">Review Process</h2>
              <p>
                Every page is reviewed for factual accuracy, clarity, and relevance before publication. Our editorial team checks that pricing guidance is labeled as educational, that service claims are realistic, and that local data is consistent with source records. We do not publish speculative advice or unverified claims.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-2">Update Policy</h2>
              <p>
                We review and update content on a fixed schedule. Service pages, pricing guidance, and local infrastructure pages are reviewed at least quarterly. Pages display a last-updated date. When source data changes, we update the affected pages within one review cycle.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-2">Accuracy Commitment</h2>
              <p>
                We strive for accuracy in every piece of content. However, plumbing conditions, local codes, and water chemistry vary by address. We encourage homeowners to confirm specific details with a licensed plumber on site. Pricing and availability on our site are educational estimates, not binding quotes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-2">Corrections Policy</h2>
              <p>
                If you find a factual error, contact us at <a href="mailto:corrections@yohomefix.com" className="text-blue-600 hover:underline">corrections@yohomefix.com</a>. We investigate corrections within two business days and update the page with a corrected date when warranted.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-2">Sources Policy</h2>
              <p>
                We rely on publicly available, authoritative sources. See our <Link href="/sources" className="text-blue-600 hover:underline no-underline">Sources & References</Link> page for the government agencies, organizations, and standards we reference.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-2">AI Usage Disclosure</h2>
              <p>
                YoHomeFix does not use AI to generate content without human review. Some drafting and editing assistance may involve AI tools, but every page is reviewed, fact-checked, and approved by our editorial team before publication. We are responsible for the accuracy of all published content.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-2">Human Review Disclosure</h2>
              <p>
                All published content is reviewed by a human editor. We do not publish automatically generated pages without verification. The review process includes checking for factual accuracy, clarity, local relevance, and compliance with our editorial standards.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-2">Medical / Legal Disclaimer</h2>
              <p>
                Plumbing advice on this site is not a substitute for professional diagnosis, repair, or code compliance. For gas leaks, major flooding, or health hazards, call a licensed plumber or emergency services immediately. Always follow local building codes and permit requirements.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-2">Contact for Corrections</h2>
              <p>
                Email: <a href="mailto:corrections@yohomefix.com" className="text-blue-600 hover:underline">corrections@yohomefix.com</a>
                <br />
                General inquiries: <a href="mailto:hello@yohomefix.com" className="text-blue-600 hover:underline">hello@yohomefix.com</a>
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
