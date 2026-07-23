import Head from 'next/head';
import Link from 'next/link';
import { PHONE_NUMBER } from '../lib/cities';
import { EditorialFooter } from '../components/EditorialFooter';
import { Footer } from '../components/Footer';
import { Author } from '../components/Author';
import { buildPageSchema } from '../lib/schemas';

const domain = process.env.NEXT_PUBLIC_DOMAIN || 'https://yohomefix.com';

export default function Disclaimer() {
  const title = 'Disclaimer — YoHomeFix Plumbing Services';
  const description = 'YoHomeFix provides plumbing services across the United States. Read our full service disclaimer.';
  const canonical = `${domain}/disclaimer`;
  const schema = buildPageSchema({
    title,
    description,
    path: '/disclaimer',
    breadcrumbs: [
      { name: 'Home', url: `${domain}/` },
      { name: 'Disclaimer', url: `${domain}/disclaimer` },
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
          <ol className="flex items-center gap-1">
            <li><Link href="/" className="text-blue-600 hover:underline no-underline">Home</Link></li>
            <li><span className="text-gray-300 mx-1">›</span></li>
            <li><span className="text-gray-700 font-medium">Disclaimer</span></li>
          </ol>
        </nav>

        <main className="max-w-3xl mx-auto w-full px-4 py-10 flex-1">
          <h1 className="text-3xl font-extrabold text-blue-900 mb-2">Disclaimer</h1>
          <p className="text-gray-500 text-sm mb-8">Last updated: June 2026</p>

          <div className="space-y-8 text-gray-700 leading-relaxed">

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-5 rounded-xl">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Independent Service Providers</h2>
              <p>YoHomeFix provides plumbing services across the United States. Plumbing work is performed by independent, licensed plumbing professionals. YoHomeFix does not directly employ plumbers and is not a licensed plumbing company.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Technician Credentials</h2>
              <p>We require all plumbers to maintain valid state plumbing licenses and liability insurance. However, we recommend customers independently verify credentials before service begins. You have the right to request:</p>
              <ul className="list-disc ml-5 mt-3 space-y-1 text-sm">
                <li>State plumbing license number</li>
                <li>Proof of current liability insurance</li>
                <li>Business license where applicable</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Response Times</h2>
              <p>Response time targets are goals, not guarantees. Actual arrival times depend on plumber availability, your location, distance, traffic, and demand. We strive to provide the nearest available plumber as quickly as possible.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Pricing</h2>
              <p>All pricing is set directly by the plumber performing the work. YoHomeFix does not set, control, or guarantee pricing. Request a written estimate from the plumber before authorizing any work. Price ranges shown on any marketing materials are illustrative only and may not reflect actual costs in your area.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Warranties</h2>
              <p>Warranty terms — including duration and scope — are determined solely by the individual plumber. YoHomeFix does not provide or administer warranties. Always confirm warranty terms in writing with the plumber before work begins.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Service Area</h2>
              <p>Service availability varies by location. Not all listed cities may have available plumbers at all times. Call to confirm availability in your specific area before relying on service.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Limitation of Liability</h2>
              <p>YoHomeFix&apos;s liability is limited to facilitating plumbing services. We are not liable for work quality, property damage, delays, or consequential damages resulting from services performed by independent plumbers.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Changes to This Disclaimer</h2>
              <p>We reserve the right to update this disclaimer at any time. Continued use of YoHomeFix after changes are posted constitutes acceptance of the revised terms.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Questions</h2>
              <p>For questions about this disclaimer, contact our customer service team at <a href={`tel:${PHONE_NUMBER}`} className="text-blue-600">Call Now — 24/7</a>.</p>
            </div>
          </div>

          <EditorialFooter pageType="disclaimer" />
          <Author pageType="disclaimer" />
        </main>

        <Footer />
      </div>
    </>
  );
}
