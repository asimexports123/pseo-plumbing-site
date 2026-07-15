import Head from 'next/head';
import Link from 'next/link';
import { PHONE_NUMBER } from '../lib/cities';
import { EditorialFooter } from '../components/EditorialFooter';
import { Footer } from '../components/Footer';
import { Author } from '../components/Author';
import { buildPageSchema } from '../lib/schemas';

const domain = process.env.NEXT_PUBLIC_DOMAIN || 'https://yohomefix.com';

export default function PrivacyPolicy() {
  const title = 'Privacy Policy — YoHomeFix';
  const description = 'Learn how YoHomeFix collects, uses, and protects your personal information when you use our emergency plumbing dispatch service.';
  const canonical = `${domain}/privacy-policy`;
  const schema = buildPageSchema({
    title,
    description,
    path: '/privacy-policy',
    breadcrumbs: [
      { name: 'Home', url: `${domain}/` },
      { name: 'Privacy Policy', url: `${domain}/privacy-policy` },
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
            <li><span className="text-gray-700 font-medium">Privacy Policy</span></li>
          </ol>
        </nav>

        <main className="max-w-3xl mx-auto w-full px-4 py-10 flex-1">
          <h1 className="text-3xl font-extrabold text-blue-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-500 text-sm mb-8">Last updated: June 2026</p>

          <div className="space-y-8 text-gray-700 leading-relaxed">

            <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-xl">
              <p>YoHomeFix is committed to protecting your privacy. This policy explains what information we collect and how we use it when you contact us for emergency plumbing dispatch services.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Information We Collect</h2>
              <ul className="list-disc ml-5 space-y-1 text-sm">
                <li><strong>Contact details:</strong> Name, phone number, and service address when requesting plumbing services</li>
                <li><strong>Technical data:</strong> IP address, browser type, and device information for security and analytics</li>
                <li><strong>Call data:</strong> Records of calls made through our dispatch line for quality and training purposes</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">How We Use Your Information</h2>
              <ul className="list-disc ml-5 space-y-1 text-sm">
                <li>To dispatch licensed plumbers to your location</li>
                <li>To communicate about your service request</li>
                <li>To improve our dispatch system and service quality</li>
                <li>To comply with legal obligations</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Data Sharing</h2>
              <p>We do not sell your personal information. We share your contact details only with the licensed contractor dispatched to serve you. We may disclose data when required by law.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Cookies</h2>
              <p>We may use cookies and analytics tools to understand how visitors use our website. You can control cookie settings through your browser. Disabling cookies will not affect your ability to call us.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Data Security</h2>
              <p>We use industry-standard security measures to protect your information. No internet transmission is 100% secure, and we cannot guarantee absolute security.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Your Rights</h2>
              <p>You may request access to, correction of, or deletion of your personal data. Contact us at the information below to exercise these rights.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Children</h2>
              <p>Our services are not directed at children under 13. We do not knowingly collect data from minors.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Changes to This Policy</h2>
              <p>We may update this policy periodically. Significant changes will be noted by updating the date above.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Contact</h2>
              <div className="bg-gray-50 p-4 rounded-lg text-sm">
                <p><strong>Phone:</strong> <a href={`tel:${PHONE_NUMBER}`} className="text-blue-600">Call Now — 24/7</a></p>
                <p><strong>Email:</strong> privacy@yohomefix.com</p>
              </div>
            </div>
          </div>

          <EditorialFooter pageType="privacy-policy" />
          <Author pageType="privacy-policy" />
        </main>

        <Footer />
      </div>
    </>
  );
}
