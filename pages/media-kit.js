import Head from 'next/head';
import Link from 'next/link';
import { buildPageSchema } from '../lib/schemas';
import { Footer } from '../components/Footer';
import { Author } from '../components/Author';
import { PHONE_NUMBER } from '../lib/cities';

const domain = process.env.NEXT_PUBLIC_DOMAIN || 'https://yohomefix.com';

export default function MediaKit() {
  const title = 'Media Kit — YoHomeFix Brand Assets & Guidelines';
  const description = 'YoHomeFix media kit: brand colors, logo usage, boilerplate, and press guidelines.';
  const canonical = `${domain}/media-kit`;
  const schema = buildPageSchema({
    title,
    description,
    path: '/media-kit',
    breadcrumbs: [
      { name: 'Home', url: `${domain}/` },
      { name: 'Media Kit', url: `${domain}/media-kit` },
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
            <li><span className="text-gray-700 font-medium">Media Kit</span></li>
          </ol>
        </nav>

        <main className="max-w-3xl mx-auto w-full px-4 py-10 flex-1">
          <h1 className="text-3xl font-extrabold text-blue-900 mb-4">Media Kit</h1>
          <p className="text-gray-600 mb-8">
            Official brand guidelines and boilerplate for press, partners, and approved third-party use.
          </p>

          <div className="space-y-8 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-2">Official Logo Usage</h2>
              <p>
                The YoHomeFix wordmark and logo should be used in its original form without distortion, recoloring, or cropping. The logo may be displayed on white or light backgrounds. For dark backgrounds, use the light-colored variant. Always maintain clear space around the logo equal to the height of the "Y" character.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                For downloadable assets or specific logo files, contact <a href="mailto:press@yohomefix.com" className="text-blue-600 hover:underline">press@yohomefix.com</a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-2">Brand Colors</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-xl p-4">
                  <div className="w-full h-16 rounded-lg bg-blue-900 mb-2" aria-label="Brand blue color swatch"></div>
                  <p className="font-bold text-sm">YoHomeFix Blue</p>
                  <p className="text-xs text-gray-500">#1E3A8A</p>
                </div>
                <div className="border border-gray-200 rounded-xl p-4">
                  <div className="w-full h-16 rounded-lg bg-red-600 mb-2" aria-label="Brand red color swatch"></div>
                  <p className="font-bold text-sm">YoHomeFix Red</p>
                  <p className="text-xs text-gray-500">#DC2626</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-2">Brand Description</h2>
              <p>
                YoHomeFix provides 24/7 emergency plumbing services across the United States. Available around the clock, YoHomeFix helps homeowners get fast, transparent plumbing help during emergencies and provides educational plumbing resources for maintenance and prevention.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-2">Boilerplate</h2>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-sm">
                <p>
                  YoHomeFix provides 24/7 emergency plumbing services across the United States. Available around the clock with transparent, upfront pricing. For more information, visit yohomefix.com.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-2">Press Usage Guidelines</h2>
              <ul className="list-disc ml-5 space-y-1 text-sm">
                <li>Use the YoHomeFix name and logo only in accurate, non-misleading contexts.</li>
                <li>Do not imply that YoHomeFix directly employs plumbers unless you include the independent-contractor clarification.</li>
                <li>Do not use the logo in connection with fake reviews, awards, or unverified claims.</li>
                <li>Contact us for any use that may be interpreted as an endorsement or partnership.</li>
              </ul>
            </section>
          </div>

          <Author pageType="page" />
        </main>

        <Footer />
      </div>
    </>
  );
}
