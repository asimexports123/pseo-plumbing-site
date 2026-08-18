import Head from 'next/head';
import Link from 'next/link';
import { getPhone, getPhoneDisplay, getCampaignId } from 'lib/affiliates/index.js';
import { getVertical } from 'lib/verticals/index.js';
import { buildVerticalPageSchema } from 'lib/verticals/schemaEngine.js';
import { buildStateHubUrl, buildVerticalSlug } from 'lib/verticals/router.js';
import { CallButton, StickyBottomCTA, ExitIntentPopup } from './VerticalConversionLayer.js';
import VerticalCallbackWidget from './VerticalCallbackWidget.js';
import TrustBar from './TrustBar.js';
import RoofingDisclaimer from './RoofingDisclaimer.js';
import { ROOFING_AUTHORITY_PAGES as AUTHORITY_PAGES } from '../lib/roofing/authorityPages.js';

export const ROOFING_AUTHORITY_PAGES = AUTHORITY_PAGES;

export default function RoofingAuthorityPage({ page }) {
  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'https://yohomefix.com';
  const canonical = '/roofing/guides/' + page.slug;
  const title = page.title + ' | YoHomeFix Roofing';
  const description = page.metaDescription;

  const vertical = getVertical('roofing');
  const phone = getPhone('roofing');
  const display = getPhoneDisplay('roofing');
  const campaignId = getCampaignId('roofing');

  const schema = buildVerticalPageSchema({
    vertical,
    title,
    description,
    path: canonical,
    breadcrumbs: [
      { name: 'Home', url: domain + '/' },
      { name: 'Roofing USA', url: domain + '/roofing-usa' },
      { name: page.title, url: domain + canonical },
    ],
  });

  const relatedGuides = AUTHORITY_PAGES.filter(g => g.slug !== page.slug).slice(0, 6);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={domain + canonical} />
        <meta name="robots" content="index, follow" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </Head>

      <ExitIntentPopup phone={phone} display={display} serviceName="Roofing" cityName="USA" vertical="roofing" />
      <StickyBottomCTA phone={phone} display={display} serviceName="Roofing" cityName="USA" vertical="roofing" />

      <div className="font-sans bg-white min-h-screen flex flex-col">
        {/* Nav */}
        <nav className="bg-[#13294b] text-white px-4 py-3 flex justify-between items-center sticky top-0 z-40 shadow-lg">
          <Link href="/" className="flex items-center gap-2 text-2xl font-extrabold text-white no-underline" prefetch={false}>
            <img src="/favicon.svg?v=2" alt="YoHomeFix" width="28" height="28" className="h-7 w-7 shrink-0" />
            <span>YoHomeFix</span>
          </Link>
          <Link href="/roofing-usa" className="text-sm font-bold text-blue-200 hover:text-white mr-4" prefetch={false}>Roofing Services</Link>
          <CallButton phone={phone} display={display} label="nav" vertical="roofing" size="md" />
        </nav>

        {/* Breadcrumbs */}
        <div className="max-w-4xl mx-auto px-4 pt-4 w-full">
          <nav className="text-sm text-gray-500" aria-label="Breadcrumb">
            <Link href="/" className="hover:underline" prefetch={false}>Home</Link>
            <span className="mx-2">/</span>
            <Link href="/roofing-usa" className="hover:underline" prefetch={false}>Roofing USA</Link>
            <span className="mx-2">/</span>
            <Link href="/roofing/guides" className="hover:underline" prefetch={false}>Guides</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-800 font-semibold">{page.title}</span>
          </nav>
        </div>

        {/* Hero */}
        <section className="relative w-full overflow-hidden text-white">
          <div className="absolute inset-0 z-0">
            <div className="w-full h-full bg-gradient-to-br from-[#13294b] via-[#1a3a6b] to-[#2a5a9b]" />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-20">
            <div className="inline-block bg-red-600 text-white text-sm font-bold px-4 py-1.5 rounded-full mb-4">
              {page.category}
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">{page.h1}</h1>
            <p className="text-lg md:text-xl text-white/90 mb-6 max-w-2xl">{page.subtitle}</p>
            <div className="flex flex-wrap gap-4">
              <CallButton phone={phone} display={display} label="authority-hero" vertical="roofing" size="lg" />
              <VerticalCallbackWidget campaignId={campaignId} vertical="roofing" size="lg" />
            </div>
          </div>
        </section>

        {/* Trust bar */}
        <div className="max-w-5xl mx-auto px-4 py-6 w-full">
          <TrustBar />
        </div>

        {/* Main content */}
        <main className="max-w-4xl mx-auto px-4 py-8 w-full flex-1">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Article body */}
            <article className="md:col-span-2 prose prose-lg max-w-none">
              {page.sections.map((section, i) => (
                <section key={i} className="mb-8">
                  <h2 className="text-2xl font-extrabold text-[#13294b] mb-3">{section.heading}</h2>
                  {section.paragraphs.map((p, j) => (
                    <p key={j} className="text-gray-700 leading-relaxed mb-4">{p}</p>
                  ))}
                  {section.list && (
                    <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                      {section.list.map((item, k) => (
                        <li key={k}>{item}</li>
                      ))}
                    </ul>
                  )}
                  {section.callout && (
                    <div className="bg-blue-50 border-l-4 border-blue-600 p-4 my-4 rounded-r-lg">
                      <p className="text-sm font-semibold text-blue-900 mb-1">{section.callout.title}</p>
                      <p className="text-sm text-blue-800">{section.callout.body}</p>
                    </div>
                  )}
                  {section.warning && (
                    <div className="bg-red-50 border-l-4 border-red-600 p-4 my-4 rounded-r-lg">
                      <p className="text-sm font-semibold text-red-900 mb-1">{section.warning.title}</p>
                      <p className="text-sm text-red-800">{section.warning.body}</p>
                    </div>
                  )}
                </section>
              ))}

              {/* EEAT: How our matching process works */}
              <section className="mb-8 bg-gray-50 rounded-xl p-6">
                <h2 className="text-2xl font-extrabold text-[#13294b] mb-3">How YoHomeFix Roofing Matching Works</h2>
                <div className="grid md:grid-cols-4 gap-4 mt-4">
                  {[
                    { step: '1', title: 'Tell Us Your Need', desc: 'Call or request a callback. Describe your roofing issue — leak, storm damage, replacement, or inspection.' },
                    { step: '2', title: 'We Match a Local Roofer', desc: 'We connect you with a licensed, insured roofing contractor in your area who handles your specific service.' },
                    { step: '3', title: 'Free Written Quote', desc: 'The roofer assesses your roof and provides an upfront, written quote before any work begins.' },
                    { step: '4', title: 'Work Gets Done', desc: 'You approve the quote. The contractor completes the work. You verify licensing and insurance.' },
                  ].map((s) => (
                    <div key={s.step} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                      <div className="w-8 h-8 rounded-full bg-[#13294b] text-white font-bold flex items-center justify-center mb-2">{s.step}</div>
                      <p className="font-bold text-sm text-gray-900 mb-1">{s.title}</p>
                      <p className="text-xs text-gray-600">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* EEAT: Why trust */}
              <section className="mb-8">
                <h2 className="text-2xl font-extrabold text-[#13294b] mb-3">Why Trust YoHomeFix Roofing</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { icon: 'Licensed & Insured', desc: 'Every roofing contractor in our network must hold active state licensing and carry liability insurance.' },
                    { icon: 'Upfront Written Quotes', desc: 'No surprise charges. You receive a detailed written quote before any work starts.' },
                    { icon: '24/7 Emergency Response', desc: 'Roofing emergencies do not wait for business hours. Our network covers nights and weekends.' },
                    { icon: 'Insurance Claims Assistance', desc: 'Our contractors help document damage and work directly with your insurance adjuster.' },
                  ].map((item) => (
                    <div key={item.icon} className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-lg">
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0 mt-1.5" />
                      <div>
                        <p className="font-bold text-sm text-gray-900">{item.icon}</p>
                        <p className="text-sm text-gray-600">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Internal linking: Related services */}
              <section className="mb-8">
                <h2 className="text-2xl font-extrabold text-[#13294b] mb-4">Related Roofing Services</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {page.relatedServices.map((s) => (
                    <Link
                      key={s.slug}
                      href={buildVerticalSlug(vertical, s.citySlug, s.slug)}
                      className="block p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all no-underline"
                      prefetch={false}
                    >
                      <p className="text-sm font-bold text-[#13294b]">{s.name}</p>
                      <p className="text-xs text-gray-500">{s.cityName}</p>
                    </Link>
                  ))}
                </div>
              </section>

              {/* CTA */}
              <div className="mb-8 bg-[#13294b] text-white rounded-2xl p-6 md:p-8 text-center shadow-xl">
                <p className="text-lg md:text-xl font-extrabold mb-2">Need a Roofer Now?</p>
                <p className="text-blue-200/80 text-sm md:text-base mb-4 max-w-xl mx-auto">Licensed, insured roofers available 24/7. Free written quotes in every US city.</p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <CallButton phone={phone} display={display} label="authority-bottom-cta" vertical="roofing" size="lg" />
                  <VerticalCallbackWidget campaignId={campaignId} vertical="roofing" size="lg" />
                </div>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="md:col-span-1">
              <div className="sticky top-20 space-y-6">
                {/* State links */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <p className="font-bold text-sm text-gray-900 mb-3">Find Roofers by State</p>
                  <ul className="space-y-1.5 text-sm">
                    {['texas', 'florida', 'california', 'colorado', 'new-york', 'ohio', 'illinois', 'georgia', 'arizona', 'washington', 'michigan'].map((state) => (
                      <li key={state}>
                        <Link
                          href={buildStateHubUrl(vertical, state)}
                          className="text-blue-700 hover:underline no-underline block py-1"
                          prefetch={false}
                        >
                          {state.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} Roofing
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Related guides */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <p className="font-bold text-sm text-gray-900 mb-3">Related Roofing Guides</p>
                  <ul className="space-y-1.5 text-sm">
                    {relatedGuides.map((g) => (
                      <li key={g.slug}>
                        <Link
                          href={'/roofing/guides/' + g.slug}
                          className="text-blue-700 hover:underline no-underline block py-1"
                          prefetch={false}
                        >
                          {g.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Sidebar CTA */}
                <div className="bg-[#13294b] text-white rounded-xl p-5 text-center">
                  <p className="font-bold text-sm mb-2">Free Roofing Quote</p>
                  <p className="text-xs text-white/80 mb-3">No obligation. Licensed pros.</p>
                  <CallButton phone={phone} display={display} label="authority-sidebar" vertical="roofing" size="md" />
                </div>
              </div>
            </aside>
          </div>
        </main>

        {/* Disclaimer */}
        <RoofingDisclaimer />

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-300 px-4 py-10 mt-auto">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
              <div>
                <Link href="/" className="text-white font-bold text-lg no-underline" prefetch={false}>YoHomeFix</Link>
                <p className="text-sm text-gray-400 mt-2 max-w-sm">Licensed, insured roofing contractors available 24/7 across the United States. Upfront pricing, insurance claims help.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                <CallButton phone={phone} display={display} label="authority-footer" vertical="roofing" size="md" />
              </div>
            </div>
            <nav aria-label="Footer">
              <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-2 text-sm mb-6">
                <li><Link href="/roofing-usa" className="text-gray-300 hover:text-white underline underline-offset-4 hover:no-underline transition-colors block py-1.5" prefetch={false}>Roofing USA</Link></li>
                <li><Link href="/roofing/guides" className="text-gray-300 hover:text-white underline underline-offset-4 hover:no-underline transition-colors block py-1.5" prefetch={false}>Roofing Guides</Link></li>
                <li><Link href="/roofing/guides/roofing-faq" className="text-gray-300 hover:text-white underline underline-offset-4 hover:no-underline transition-colors block py-1.5" prefetch={false}>Roofing FAQ</Link></li>
                <li><Link href="/roofing/guides/roofing-cost-guide" className="text-gray-300 hover:text-white underline underline-offset-4 hover:no-underline transition-colors block py-1.5" prefetch={false}>Roofing Cost Guide</Link></li>
                <li><Link href="/about" className="text-gray-300 hover:text-white underline underline-offset-4 hover:no-underline transition-colors block py-1.5" prefetch={false}>About</Link></li>
                <li><Link href="/contact" className="text-gray-300 hover:text-white underline underline-offset-4 hover:no-underline transition-colors block py-1.5" prefetch={false}>Contact</Link></li>
                <li><Link href="/plumber-usa" className="text-gray-300 hover:text-white underline underline-offset-4 hover:no-underline transition-colors block py-1.5" prefetch={false}>Plumbing Services</Link></li>
                <li><Link href="/sitemap.xml" className="text-gray-300 hover:text-white underline underline-offset-4 hover:no-underline transition-colors block py-1.5" prefetch={false}>Sitemap</Link></li>
              </ul>
            </nav>
            <div className="border-t border-gray-800 pt-6 text-sm text-gray-400">
              <p className="mb-2">(c) {new Date().getFullYear()} YoHomeFix. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
