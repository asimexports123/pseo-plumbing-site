import Head from 'next/head';
import Link from 'next/link';
import { PHONE_NUMBER } from '../lib/cities';
import { buildPageSchema } from '../lib/schemas';
import { Footer } from '../components/Footer';
import { Author } from '../components/Author';

const domain = process.env.NEXT_PUBLIC_DOMAIN || 'https://yohomefix.com';

const inquiryCategories = [
  {
    title: 'Customer Support',
    email: 'hello@yohomefix.com',
    description: 'Questions about using YoHomeFix, emergencies, service availability, or your call experience. For active plumbing emergencies, call our 24/7 line above.',
  },
  {
    title: 'Business Partnerships',
    email: 'partnerships@yohomefix.com',
    description: 'Inquiries from plumbing professionals, home service platforms, vendors, and industry partners.',
  },
  {
    title: 'Media Inquiries',
    email: 'press@yohomefix.com',
    description: 'Interview requests, press kits, media-related questions, and official statements.',
  },
  {
    title: 'General Contact',
    email: 'hello@yohomefix.com',
    description: 'Editorial questions, corrections, research methodology, and any other general inquiry. Factual errors can also be sent to corrections@yohomefix.com.',
  },
];

export default function Contact() {
  const title = 'Contact YoHomeFix — 24/7 Emergency Plumbing Service';
  const description = 'Contact YoHomeFix for emergencies, business inquiries, editorial questions, corrections, partnerships, press, or general support.';
  const canonical = `${domain}/contact`;
  const schema = buildPageSchema({
    title,
    description,
    path: '/contact',
    pageType: 'ContactPage',
    breadcrumbs: [
      { name: 'Home', url: `${domain}/` },
      { name: 'Contact', url: `${domain}/contact` },
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
            <li><span className="text-gray-700 font-medium">Contact</span></li>
          </ol>
        </nav>

        <main className="max-w-3xl mx-auto w-full px-4 py-10 flex-1">
          <h1 className="text-3xl font-extrabold text-blue-900 mb-2">Contact Us</h1>
          <p className="text-gray-500 mb-8">For plumbing emergencies, call our 24/7 line immediately. For everything else, find the right email below.</p>

          <div className="bg-blue-900 text-white rounded-2xl p-8 text-center mb-8">
            <p className="text-white text-sm font-semibold mb-2">📞 24/7 Emergency Plumbing Service</p>
            <a href={`tel:${PHONE_NUMBER}`}
              className="text-4xl font-extrabold text-white hover:text-red-300 transition-colors no-underline block mb-3"
              aria-label="Call emergency dispatch">
              Call Now — 24/7
            </a>
            <p className="text-white text-sm">Live operator — answered any time, day or night</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {inquiryCategories.map((cat) => (
              <div key={cat.title} className="border border-gray-200 rounded-xl p-6">
                <h2 className="text-lg font-bold text-blue-900 mb-2">{cat.title}</h2>
                <p className="text-gray-600 text-sm leading-relaxed mb-3">{cat.description}</p>
                <a href={`mailto:${cat.email}`} className="text-sm font-semibold text-blue-600 hover:underline">
                  {cat.email}
                </a>
              </div>
            ))}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 text-sm text-yellow-800 mb-8">
            <strong>Important:</strong> For the fastest response to a plumbing emergency, always call our 24/7 line rather than emailing.
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-sm text-blue-800 mb-8">
            <strong>Looking for more information?</strong>{' '}
            <Link href="/about" className="text-blue-700 font-semibold hover:underline no-underline">About YoHomeFix</Link>,{' '}
            <Link href="/editorial-policy" className="text-blue-700 font-semibold hover:underline no-underline">Editorial Policy</Link>,{' '}
            <Link href="/faq" className="text-blue-700 font-semibold hover:underline no-underline">FAQ</Link>, or{' '}
            <Link href="/plumber-usa" className="text-blue-700 font-semibold hover:underline no-underline">browse cities</Link>.
          </div>

          <Author pageType="contact" />
        </main>

        <Footer />
      </div>
    </>
  );
}
