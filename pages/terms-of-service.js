import Head from 'next/head';
import Link from 'next/link';
import { PHONE_NUMBER } from '../lib/cities';
import { EditorialFooter } from '../components/EditorialFooter';
import { Footer } from '../components/Footer';
import { Author } from '../components/Author';
import { buildPageSchema } from '../lib/schemas';

const domain = process.env.NEXT_PUBLIC_DOMAIN || 'https://yohomefix.com';

export default function TermsOfService() {
  const title = 'Terms of Service — YoHomeFix';
  const description = 'Read the Terms of Service for YoHomeFix. Understand your rights and our responsibilities before using our service.';
  const canonical = `${domain}/terms-of-service`;
  const schema = buildPageSchema({
    title,
    description,
    path: '/terms-of-service',
    breadcrumbs: [
      { name: 'Home', url: `${domain}/` },
      { name: 'Terms of Service', url: `${domain}/terms-of-service` },
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
            <li><span className="text-gray-700 font-medium">Terms of Service</span></li>
          </ol>
        </nav>

        <main className="max-w-3xl mx-auto w-full px-4 py-10 flex-1">
          <h1 className="text-3xl font-extrabold text-blue-900 mb-2">Terms of Service</h1>
          <p className="text-gray-500 text-sm mb-8">Last updated: June 2026</p>

          <div className="space-y-8 text-gray-700 leading-relaxed">

            <div className="bg-gray-50 border-l-4 border-blue-500 p-5 rounded-xl">
              <p>By using YoHomeFix, you agree to these Terms of Service. Please read them carefully. If you do not agree, do not use this service.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">1. Nature of Service</h2>
              <p>YoHomeFix provides plumbing services across the United States. YoHomeFix is not a licensed plumbing contractor and does not perform plumbing work. All work is performed by independent third-party plumbers.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">2. Use of Service</h2>
              <p>You may use YoHomeFix to request plumbing service for residential or commercial needs. You must be 18 years or older and provide accurate information about your location and plumbing issue.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">3. No Guarantees on Response Time or Availability</h2>
              <p>We strive to provide a nearby plumber as quickly as possible. However, we do not guarantee specific response times, plumber availability, or service in all locations at all times. Response time targets are goals only.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">4. Pricing and Payment</h2>
              <p>Pricing is set by the independent plumber, not by YoHomeFix. You must obtain and agree to a written estimate before authorizing any work. YoHomeFix is not responsible for pricing disputes between you and a plumber.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">5. Contractor Relationships</h2>
              <p>Plumbers providing service through YoHomeFix are independent businesses, not employees or agents of YoHomeFix. YoHomeFix is not responsible for the quality, safety, legality, or outcome of any work performed by independent plumbers.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">6. Limitation of Liability</h2>
              <p>To the fullest extent permitted by law, YoHomeFix shall not be liable for any indirect, incidental, consequential, or punitive damages arising from your use of the service or the work performed by any contractor. Our total liability to you shall not exceed $100.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">7. Indemnification</h2>
              <p>You agree to indemnify and hold harmless YoHomeFix and its operators from any claims, damages, or expenses arising from your use of the service or your violation of these Terms.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">8. Intellectual Property</h2>
              <p>All content on this website — including text, design, and code — is the property of YoHomeFix or its licensors. You may not reproduce, copy, or redistribute any content without written permission.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">9. Changes to Terms</h2>
              <p>We reserve the right to update these Terms at any time. Your continued use of the service after changes are posted constitutes acceptance of the updated Terms.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">10. Governing Law</h2>
              <p>These Terms are governed by the laws of the United States. Any disputes shall be resolved through binding arbitration rather than court proceedings, to the extent permitted by applicable law.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">11. Contact</h2>
              <p>For questions about these Terms, contact us at <a href={`tel:${PHONE_NUMBER}`} className="text-blue-600">Call Now — 24/7</a> or <a href="mailto:hello@yohomefix.com" className="text-blue-600">hello@yohomefix.com</a>.</p>
            </div>
          </div>

          <EditorialFooter pageType="terms-of-service" />
          <Author pageType="terms-of-service" />
        </main>

        <Footer />
      </div>
    </>
  );
}
