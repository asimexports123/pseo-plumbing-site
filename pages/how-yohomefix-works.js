import Head from 'next/head';
import Link from 'next/link';
import { PHONE_NUMBER } from '../lib/cities';
import { buildPageSchema } from '../lib/schemas';
import { Footer } from '../components/Footer';
import { Author } from '../components/Author';

const domain = process.env.NEXT_PUBLIC_DOMAIN || 'https://yohomefix.com';

const steps = [
  {
    title: 'You Call or Tap to Call',
    body: 'Homeowners reach our 24/7 dispatch line. There are no automated menus — a live dispatcher answers, confirms your location, and listens to the plumbing issue.',
  },
  {
    title: 'We Match You to a Licensed Plumber',
    body: 'The dispatcher identifies the nearest available licensed, insured plumber in our network who can handle your specific service — emergency, leak repair, drain cleaning, pipe burst, or water heater repair.',
  },
  {
    title: 'The Provider Contacts You',
    body: 'The connected plumber calls you directly to confirm the address, discuss the problem, and give an estimated arrival window. You can ask questions before anyone visits.',
  },
  {
    title: 'Written Upfront Quote',
    body: 'Before any work begins, the plumber provides a written, upfront quote. You approve the scope and price. There is no obligation to proceed if you choose not to.',
  },
  {
    title: 'Work Is Completed by the Independent Contractor',
    body: 'All plumbing work is performed by the independent contractor, not by YoHomeFix. Warranty, payment, and scheduling terms are handled directly with the provider.',
  },
];

export default function HowItWorks() {
  const title = 'How YoHomeFix Works — 24/7 Emergency Plumbing Dispatch';
  const description = 'Learn how YoHomeFix connects homeowners with licensed plumbers: the customer request, dispatch workflow, provider assignment, and what to expect.';
  const canonical = `${domain}/how-yohomefix-works`;
  const schema = buildPageSchema({
    title,
    description,
    path: '/how-yohomefix-works',
    breadcrumbs: [
      { name: 'Home', url: `${domain}/` },
      { name: 'How YoHomeFix Works', url: `${domain}/how-yohomefix-works` },
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
            <li><span className="text-gray-700 font-medium">How YoHomeFix Works</span></li>
          </ol>
        </nav>

        <main className="max-w-3xl mx-auto w-full px-4 py-10 flex-1">

          <h1 className="text-3xl font-extrabold text-blue-900 mb-4">How YoHomeFix Works</h1>

          <p className="speakable-intro text-lg text-gray-700 leading-relaxed mb-8 border-l-4 border-blue-600 pl-4">
            YoHomeFix is a 24/7 call-connection platform. We do not send our own plumbers — we connect you with a licensed, insured plumbing contractor in your area who can respond to your emergency.
          </p>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-blue-900 mb-5">The Dispatch Process</h2>
            <div className="space-y-4">
              {steps.map((step, i) => (
                <div key={step.title} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-900 text-white flex items-center justify-center font-extrabold">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-900">{step.title}</h3>
                    <p className="text-gray-700 text-sm leading-relaxed">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="space-y-8 text-gray-700 leading-relaxed">

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-2">What Happens When You Request Service</h2>
              <p>
                A request starts with a phone call. Our dispatcher collects your city, address, and a brief description of the problem — for example, a burst pipe, water heater failure, or clogged drain. This information is used to route the call to a provider who has the right skills and availability.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-2">Provider Assignment</h2>
              <p>
                Assignment is based on location, service type, and current availability. We do not guarantee a specific contractor or a fixed arrival time, but we aim to connect you with the nearest available licensed plumber who can respond to your emergency.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-2">What to Expect During the Visit</h2>
              <ul className="list-disc ml-5 mt-3 space-y-1 text-sm">
                <li>The plumber confirms the problem and explains the scope.</li>
                <li>You receive a written quote before work begins.</li>
                <li>You approve the work and the price.</li>
                <li>The plumber completes the repair or emergency mitigation.</li>
                <li>Payment and warranty terms are handled directly with the provider.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-2">Service Availability</h2>
              <p>
                Our dispatch line is available 24 hours a day, 7 days a week, including holidays. Actual plumber availability depends on your location, time of day, weather, and demand. We serve residential customers across the United States in the cities and states listed on our site.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-2">YoHomeFix&apos;s Role</h2>
              <p>
                YoHomeFix is the first point of contact. We answer the call, route the request, and help you reach a qualified plumber quickly. We do not perform repairs, set prices, or provide warranties. All work is performed by independent, state-licensed contractors.
              </p>
            </section>

            <section className="bg-gray-50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-blue-900 mb-3">Important Disclosures</h2>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Response times are targets, not guarantees.</li>
                <li>YoHomeFix is not a licensed plumbing contractor.</li>
                <li>All pricing is set by the independent contractor.</li>
                <li>Warranty and payment terms are between you and the provider.</li>
                <li>For gas leaks or life-safety emergencies, call 911 or your gas utility first.</li>
              </ul>
            </section>

          </div>

          <Author pageType="page" />

          <div className="mt-10 bg-blue-900 text-white rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-extrabold mb-2">Connect With a Licensed Plumber Now</h2>
            <p className="text-white mb-5">24/7 dispatch across the United States — upfront pricing before any work begins.</p>
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
