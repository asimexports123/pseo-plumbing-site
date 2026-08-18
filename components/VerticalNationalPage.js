import Head from 'next/head';
import Link from 'next/link';
import { useMemo } from 'react';
import { cityToSlug } from 'lib/cities.js';
import { getPhone, getPhoneDisplay, getCampaignId } from 'lib/affiliates/index.js';
import { buildVerticalPageSchema } from 'lib/verticals/schemaEngine.js';
import { buildStateHubUrl, buildVerticalSlug, buildStateServiceUrl } from 'lib/verticals/router.js';
import { CallButton, StickyBottomCTA, ExitIntentPopup } from './VerticalConversionLayer.js';
import VerticalCallbackWidget from './VerticalCallbackWidget.js';
import VerticalImageSlot from './VerticalImageSlot.js';
import ZipCitySearch from './ZipCitySearch.js';
import TrustBar from './TrustBar.js';
import ContentCard from './ContentCard.js';
import RoofingDisclaimer from './RoofingDisclaimer.js';

function ContentCTA({ phone, display, vertical, campaignId }) {
  return (
    <div className="mb-10 bg-[#13294b] text-white rounded-2xl p-6 md:p-8 text-center shadow-xl">
      <p className="text-lg md:text-xl font-extrabold mb-2">Get a fast, free roofing quote</p>
      <p className="text-blue-200/80 text-sm md:text-base mb-4 max-w-xl mx-auto">Licensed roofers available 24/7 in {('19,000+')} US cities.</p>
      <div className="flex flex-wrap gap-3 justify-center">
        <CallButton phone={phone} display={display} label="national-cta" vertical={vertical} size="lg" />
        <VerticalCallbackWidget campaignId={campaignId} vertical={vertical} />
      </div>
    </div>
  );
}

export default function VerticalNationalPage({ vertical, totalPlaces, serviceCityCounts, citiesByState }) {
  const title = `${vertical.name} USA — ${vertical.shortName} Services in Every US City | YoHomeFix`;
  const description = `${vertical.name} services across ${totalPlaces.toLocaleString()}+ US cities. Licensed, insured roofers available 24/7.`;
  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'https://yohomefix.com';
  const canonical = vertical.nationalHub;

  const phone = getPhone(vertical.slug);
  const display = getPhoneDisplay(vertical.slug);
  const campaignId = getCampaignId(vertical.slug);

  const schema = buildVerticalPageSchema({
    vertical,
    title,
    description,
    path: canonical,
    breadcrumbs: [
      { name: 'Home', url: `${domain}/` },
      { name: `${vertical.name} USA`, url: `${domain}${canonical}` },
    ],
  });

  const topCities = useMemo(() => {
    const all = (citiesByState || []).flatMap((g) => g.cities || []);
    return all.sort((a, b) => (b.pop || 0) - (a.pop || 0)).slice(0, 18);
  }, [citiesByState]);

  const featuredStates = useMemo(() => {
    return (citiesByState || []).slice(0, 12);
  }, [citiesByState]);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`${domain}${canonical}`} />
        <meta name="robots" content="index, follow" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </Head>

      <ExitIntentPopup phone={phone} display={display} serviceName={vertical.name} cityName="USA" vertical={vertical.slug} />
      <StickyBottomCTA phone={phone} display={display} serviceName={vertical.name} cityName="USA" vertical={vertical.slug} />

      <div className="font-sans bg-white min-h-screen flex flex-col">
        <nav className="bg-[#13294b] text-white px-4 py-3 flex justify-between items-center sticky top-0 z-40 shadow-lg">
          <Link href="/" className="flex items-center gap-2 text-2xl font-extrabold text-white no-underline" prefetch={false}>
          <img src="/favicon.svg?v=2" alt="YoHomeFix" width="28" height="28" className="h-7 w-7 shrink-0" />
          <span>YoHomeFix</span>
        </Link>
          <CallButton phone={phone} display={display} label="nav" vertical={vertical.slug} size="md" />
        </nav>

        {/* 1. Hero — full-width image with overlay, distinct from state's split layout */}
        <section className="relative w-full overflow-hidden text-white">
          <div className="absolute inset-0 z-0">
            <VerticalImageSlot
              vertical={vertical}
              serviceSlug="emergency-roof-repair"
              cityName="USA"
              stateCode=""
              slot="nationalHero"
              eager
              imgClassName="w-full h-full object-cover"
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(15,30,60,0.88) 0%, rgba(15,30,60,0.78) 40%, rgba(15,30,60,0.60) 70%, rgba(15,30,60,0.42) 100%)' }} />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-16 md:py-28 text-center">
            <div className="inline-block bg-red-600 text-white text-sm font-bold px-4 py-1.5 rounded-full mb-4">
              ⚡ Emergency Available — 24/7
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">Roofing Services in Every US City</h1>
            <p className="speakable-intro text-lg md:text-xl text-white/90 mb-6 max-w-2xl mx-auto">
              Licensed, insured roofers available 24/7 across {totalPlaces.toLocaleString()}+ US cities. From emergency leak repair to full roof replacement and new construction roofing.
            </p>
            <div className="flex flex-wrap gap-4 justify-center mb-6">
              <CallButton phone={phone} display={display} label="national-hero" vertical={vertical.slug} size="xl" />
              <VerticalCallbackWidget campaignId={campaignId} vertical={vertical.slug} />
            </div>
            <div className="flex flex-wrap gap-3 text-sm justify-center mb-6">
              {['✅ Licensed & Insured', '⏱️ Fast Response', '💰 Upfront Pricing', '🛡️ Insurance Claims Help'].map((badge) => (
                <span key={badge} className="bg-white/10 border border-white/20 text-white px-3 py-1 rounded-full">{badge}</span>
              ))}
            </div>
            <ZipCitySearch vertical={vertical} serviceSlug="emergency-roof-repair" />
          </div>
        </section>

        {/* 2. National stats bar — 4 key metrics */}
        <section className="bg-[#13294b] text-white py-5">
          <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { value: '50', label: 'States Covered' },
              { value: `${totalPlaces.toLocaleString()}+`, label: 'Cities Served' },
              { value: '24/7', label: 'Emergency Service' },
              { value: '100%', label: 'Licensed & Insured' },
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-2xl md:text-3xl font-extrabold text-white">{stat.value}</p>
                <p className="text-xs md:text-sm text-blue-200 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
          <TrustBar />

          {/* 3. Roofing Overview — text left, image right */}
          <section className="mb-10">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div>
                <h2 className="text-xl md:text-2xl font-extrabold text-blue-900 mb-3">Roofing in the United States: An Overview</h2>
                <p className="text-gray-700 leading-snug mb-3 text-sm md:text-base">
                  A roof is the most critical weatherproofing system on any home. In the US, roofing needs vary dramatically by region — from hurricane zones to hail alleys to desert heat.
                </p>
                <p className="text-gray-700 leading-snug text-sm md:text-base">
                  YoHomeFix connects homeowners with licensed, insured roofers across {totalPlaces.toLocaleString()}+ cities in all 50 states. From emergency tarping to full replacement and new construction, our network provides upfront quotes, documented inspections, and code-compliant installation.
                </p>
              </div>
              <div className="rounded-xl overflow-hidden shadow-lg">
                <VerticalImageSlot vertical={vertical} serviceSlug="residential-roofing" cityName="USA" stateCode="" slot="overview" imgClassName="w-full h-56 md:h-72 object-cover" />
              </div>
            </div>
          </section>

          {/* 4. Why Homeowners Choose Us — 4 feature cards */}
          <section className="mb-10">
            <h2 className="text-xl md:text-2xl font-extrabold text-blue-900 mb-2 text-center">Why Homeowners Choose YoHomeFix</h2>
            <p className="text-gray-600 leading-snug mb-6 text-center max-w-2xl mx-auto text-sm md:text-base">
              Every roofer in our network is licensed, insured, and experienced with local roofing issues.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: '\u{1f3e0}', title: 'Local Experts', body: 'Roofers who understand your local climate, codes, and common roofing issues.' },
                { icon: '\u23f1\ufe0f', title: 'Fast Response', body: 'Emergency service available 24/7, with most calls answered within minutes.' },
                { icon: '\u{1f4b0}', title: 'Upfront Pricing', body: 'Written, itemized quotes before any work begins. No hidden fees.' },
                { icon: '\u{1f6e1}\ufe0f', title: 'Insurance Help', body: 'Roofers who can meet adjusters and document storm damage for claims.' },
              ].map((c, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow text-center">
                  <div className="text-2xl mb-2">{c.icon}</div>
                  <h3 className="text-sm font-bold text-blue-900 mb-1.5">{c.title}</h3>
                  <p className="text-sm text-gray-700 leading-snug">{c.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 5. Roofing Service Categories — card grid with images */}
          <section className="mb-10">
            <h2 className="text-xl md:text-2xl font-extrabold text-blue-900 mb-2">Roofing Service Categories</h2>
            <p className="text-gray-600 leading-snug mb-6 text-sm md:text-base">
              Full residential and commercial roofing services. Each service page covers scope, timing, warning signs, cost factors, and FAQs.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {vertical.services.map((s, i) => {
                const slot = ['roof-repair', 'roof-replacement', 'new-construction-roofing', 'storm-damage-roof-repair', 'roof-inspection', 'emergency-roof-repair', 'roof-leak-repair', 'roof-maintenance', 'flat-roof-repair', 'shingle-roof-repair', 'commercial-roofing', 'residential-roofing', 'gutter-cleaning', 'roof-installation', 'emergency-roofing-services', 'roof-vent-repair', 'skylight-repair'][i % 17];
                return (
                  <Link
                    key={s.slug}
                    href={buildStateServiceUrl(vertical, 'texas', s.slug)}
                    className="group block bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all no-underline"
                    prefetch={false}
                  >
                    <div className="h-40 overflow-hidden">
                      <VerticalImageSlot vertical={vertical} serviceSlug={slot} cityName="USA" stateCode="" slot="service" imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="p-4">
                      <p className="text-sm font-bold text-blue-900 mb-1">{s.name}</p>
                      <p className="text-sm text-gray-700 leading-snug">{s.description}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* 6. How It Works — 5-step process */}
          <section className="mb-10 -mx-4 px-4 py-8 bg-gray-50">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-xl md:text-2xl font-extrabold text-blue-900 mb-2 text-center">How It Works</h2>
              <p className="text-gray-600 leading-snug mb-6 text-center max-w-2xl mx-auto text-sm md:text-base">
                Call our dispatch line — we connect you with a licensed local roofer for inspection, quote, and scheduling.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  { title: 'Call', body: 'Describe your roofing issue — leaks, missing shingles, storm damage, or an aging roof.' },
                  { title: 'Inspect', body: 'A local roofer visits your property, examines the roof and attic, and documents findings with photos.' },
                  { title: 'Quote', body: 'Receive a written, itemized quote with materials, labor, cleanup, warranty, and timeline.' },
                  { title: 'Schedule', body: 'Repairs often same-day. Replacements and new construction scheduled around weather.' },
                  { title: 'Complete', body: 'The crew cleans debris, runs a quality check, and walks the property with you.' },
                ].map((s, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm text-center">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-[#13294b] text-white flex items-center justify-center text-lg font-bold">{i + 1}</div>
                    <h3 className="text-sm font-bold text-blue-900 mb-1.5">{s.title}</h3>
                    <p className="text-sm text-gray-700 leading-snug">{s.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 7. Roofing Process Explained — text left, image right */}
          <section className="mb-10">
            <div className="grid md:grid-cols-2 gap-6 items-start">
              <div>
                <h2 className="text-xl md:text-2xl font-extrabold text-blue-900 mb-3">The Roofing Process Explained</h2>
                <p className="text-gray-700 leading-snug mb-4 text-sm md:text-base">
                  Every roofing project follows a structured process — from small repair to full replacement. Here&apos;s what to expect:
                </p>
                <ol className="space-y-2 text-gray-700 list-decimal pl-5 text-sm md:text-base">
                  <li className="leading-snug"><strong>Inspection:</strong> The roofer examines the roof surface, attic, and interior for active leaks, damage, and ventilation issues.</li>
                  <li className="leading-snug"><strong>Quote:</strong> Based on the inspection, the roofer explains repair or replacement options and provides a written, itemized quote.</li>
                  <li className="leading-snug"><strong>Scheduling:</strong> Work is scheduled around weather conditions. Materials are ordered based on the selected product and local availability.</li>
                  <li className="leading-snug"><strong>Installation:</strong> For repairs, damaged materials are removed and replaced. For replacements, the old roof is torn off, decking is inspected, underlayment and flashing are installed, and the new roofing material is applied.</li>
                  <li className="leading-snug"><strong>Final Inspection:</strong> The crew cleans up all debris, runs a final quality check, and walks the property with the homeowner.</li>
                </ol>
              </div>
              <div className="rounded-xl overflow-hidden shadow-lg">
                <VerticalImageSlot vertical={vertical} serviceSlug="roof-replacement" cityName="USA" stateCode="" slot="process" imgClassName="w-full h-56 md:h-72 object-cover" />
              </div>
            </div>
          </section>

          {/* 8. Roofing Materials Guide — dual images left, text right */}
          <section className="mb-10 -mx-4 px-4 py-8 bg-gray-50">
            <div className="max-w-5xl mx-auto">
              <div className="grid md:grid-cols-2 gap-6 items-start">
                <div className="space-y-3">
                  <div className="rounded-xl overflow-hidden shadow-md">
                    <VerticalImageSlot vertical={vertical} serviceSlug="roof-repair" cityName="USA" stateCode="" slot="materials" imgClassName="w-full h-48 md:h-56 object-cover" />
                  </div>
                  <div className="rounded-xl overflow-hidden shadow-md">
                    <VerticalImageSlot vertical={vertical} serviceSlug="shingle-roof-repair" cityName="USA" stateCode="" slot="materialsSecondary" imgClassName="w-full h-48 md:h-56 object-cover" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-extrabold text-blue-900 mb-3">Roofing Materials Guide</h2>
                  <p className="text-gray-700 leading-snug mb-4 text-sm md:text-base">
                    The right material depends on climate, budget, architecture, and ownership timeline. Here are the most common options:
                  </p>
                  <div className="space-y-2 text-gray-700 text-sm md:text-base">
                    <p><strong className="text-blue-900">Asphalt Shingles</strong> — The most widely used roofing material in the US, covering approximately 75% of homes. Affordable, available in many colors, and compatible with most roof slopes.</p>
                    <p><strong className="text-blue-900">Metal Roofing</strong> — Durable, energy-efficient, and 40–70 year lifespan. Performs well in high-wind and high-sun areas. Upfront cost is higher but long-term value is strong.</p>
                    <p><strong className="text-blue-900">Tile Roofing</strong> — Concrete and clay tile roofs last 50–100 years and are common on Mediterranean, Spanish, and Southwestern-style homes. Heavy and requires structural evaluation.</p>
                    <p><strong className="text-blue-900">Slate Roofing</strong> — Premium natural stone that can last 75–150 years. Fireproof and sustainable, but among the most expensive roofing materials.</p>
                    <p><strong className="text-blue-900">Flat Membranes</strong> — TPO, EPDM, and modified bitumen are used on flat and low-slope roofs, common on commercial buildings and modern residential designs.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 9. Repair vs Replacement — comparison table */}
          <section className="mb-10">
            <h2 className="text-xl md:text-2xl font-extrabold text-blue-900 mb-2">Repair vs. Replacement: Making the Right Choice</h2>
            <p className="text-gray-600 leading-snug mb-4 text-sm md:text-base">
              Under 15 years with isolated damage? Repair is usually cost-effective. Over 20 years with widespread damage? Replacement is typically more economical long-term.
            </p>
            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
              <table className="w-full text-sm md:text-base">
                <thead className="bg-[#13294b] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold">Factor</th>
                    <th className="px-4 py-3 text-left font-bold">Repair</th>
                    <th className="px-4 py-3 text-left font-bold">Full Replacement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="bg-white"><td className="px-4 py-3 font-semibold text-gray-800">Cost</td><td className="px-4 py-3 text-gray-700">$300–$1,500 typical</td><td className="px-4 py-3 text-gray-700">$5,000–$15,000+ depending on size</td></tr>
                  <tr className="bg-gray-50"><td className="px-4 py-3 font-semibold text-gray-800">Best When</td><td className="px-4 py-3 text-gray-700">Roof is under 15 years old, isolated damage</td><td className="px-4 py-3 text-gray-700">Roof is 20+ years old, widespread damage</td></tr>
                  <tr className="bg-white"><td className="px-4 py-3 font-semibold text-gray-800">Lifespan Added</td><td className="px-4 py-3 text-gray-700">2–5 years typically</td><td className="px-4 py-3 text-gray-700">20–50 years depending on material</td></tr>
                  <tr className="bg-gray-50"><td className="px-4 py-3 font-semibold text-gray-800">Insurance Impact</td><td className="px-4 py-3 text-gray-700">May not affect premiums</td><td className="px-4 py-3 text-gray-700">New roof may lower premiums</td></tr>
                  <tr className="bg-white"><td className="px-4 py-3 font-semibold text-gray-800">Timeline</td><td className="px-4 py-3 text-gray-700">1–2 days</td><td className="px-4 py-3 text-gray-700">2–5 days depending on size</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 10. Insurance Claims — image left, checklist right */}
          <section className="mb-10">
            <div className="grid md:grid-cols-2 gap-6 items-start">
              <div className="rounded-xl overflow-hidden shadow-lg">
                <VerticalImageSlot vertical={vertical} serviceSlug="storm-damage-roof-repair" cityName="USA" stateCode="" slot="insurance" imgClassName="w-full h-56 md:h-72 object-cover" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-extrabold text-blue-900 mb-3">Insurance Claims for Roof Damage</h2>
                <p className="text-gray-700 leading-snug mb-4 text-sm md:text-base">
                  Most policies cover sudden damage from wind, hail, and falling objects — not gradual wear or deferred maintenance. Understanding the claims process can mean the difference between a covered repair and an out-of-pocket expense.
                </p>
                <ContentCard
                  type="checklist"
                  heading="Insurance Claim Checklist"
                  body="Follow these steps to maximize your chances of a successful claim:"
                  list={[
                    'Document damage with clear photos, dates, and local weather reports from the storm date',
                    'Request a written roofer inspection before filing — the report supports your claim',
                    'Review your deductible amount and whether actual cash value or replacement cost coverage applies',
                    'Use a roofer who can meet the insurance adjuster at your property for the inspection',
                    'Keep records of past repairs, roof age, and any prior inspections',
                    'Avoid contractors who offer to waive your deductible or demand full payment upfront',
                  ]}
                />
              </div>
            </div>
          </section>

          {/* 11. New Construction Roofing — text left, image right */}
          <section className="mb-10 -mx-4 px-4 py-8 bg-gray-50">
            <div className="max-w-5xl mx-auto">
              <div className="grid md:grid-cols-2 gap-6 items-start">
                <div>
                  <h2 className="text-xl md:text-2xl font-extrabold text-blue-900 mb-3">New Construction Roofing</h2>
                  <p className="text-gray-700 leading-snug mb-4 text-sm md:text-base">
                    Coordination between builder, framer, and roofer is essential. Material selection, ventilation, and flashing must be planned during framing — not added as an afterthought.
                  </p>
                  <ContentCard
                    type="checklist"
                    heading="New Construction Roofing Steps"
                    list={[
                      'Choose materials suited to local climate and wind exposure',
                      'Install underlayment and flashing before the final roof layer',
                      'Coordinate dry-in with the builder before wet weather',
                      'Schedule final inspection and warranty paperwork at completion',
                      'Plan ventilation, gutters, and drainage as one integrated system',
                      'Verify roof structure is engineered to support the selected material weight',
                    ]}
                  />
                </div>
                <div className="rounded-xl overflow-hidden shadow-lg">
                  <VerticalImageSlot vertical={vertical} serviceSlug="new-construction-roofing" cityName="USA" stateCode="" slot="newConstruction" imgClassName="w-full h-56 md:h-72 object-cover" />
                </div>
              </div>
            </div>
          </section>

          {/* 12. Roof Maintenance Guide — image left, text right */}
          <section className="mb-10">
            <div className="grid md:grid-cols-2 gap-6 items-start">
              <div className="rounded-xl overflow-hidden shadow-lg">
                <VerticalImageSlot vertical={vertical} serviceSlug="roof-maintenance" cityName="USA" stateCode="" slot="maintenance" imgClassName="w-full h-56 md:h-72 object-cover" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-extrabold text-blue-900 mb-3">Roof Maintenance Guide</h2>
                <p className="text-gray-700 leading-snug mb-3 text-sm md:text-base">
                  Annual maintenance is the most cost-effective way to extend roof life. A maintained roof can outlast an unmaintained one by 5–10 years.
                </p>
                <ContentCard
                  type="maintenance"
                  heading="Roof Maintenance Checklist"
                  list={[
                    'Clean gutters and downspouts in spring and fall to prevent water backup',
                    'Remove leaves and branches from valleys and the roof surface',
                    'Inspect flashing around chimneys, vents, and skylights for gaps or corrosion',
                    'Check the attic for moisture stains, mold, or daylight entering through the roof deck',
                    'Schedule a professional roof inspection every 2–3 years, or annually if your roof is over 15 years old',
                    'After any hail or high-wind event, schedule a post-storm inspection even if damage is not visible from the ground',
                  ]}
                />
              </div>
            </div>
          </section>

          <ContentCTA phone={phone} display={display} vertical={vertical.slug} campaignId={campaignId} />

          {/* 13. Service Comparison Table */}
          <section className="mb-10">
            <h2 className="text-xl md:text-2xl font-extrabold text-blue-900 mb-2">Roofing Service Comparison</h2>
            <p className="text-gray-600 leading-snug mb-4 text-sm md:text-base">
              Different needs call for different services. Here&apos;s how the most common roofing services compare:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-[#13294b] text-white">
                  <tr>
                    <th className="text-left p-4">Service</th>
                    <th className="text-left p-4">Best For</th>
                    <th className="text-left p-4">Typical Cost</th>
                    <th className="text-left p-4">Timeline</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200"><td className="p-4 font-semibold">Emergency Repair</td><td className="p-4">Active leaks, storm damage</td><td className="p-4">$200–$800</td><td className="p-4">Same day</td></tr>
                  <tr className="border-b border-gray-200 bg-gray-50"><td className="p-4 font-semibold">Targeted Repair</td><td className="p-4">Isolated damage, flashing failure</td><td className="p-4">$300–$1,200</td><td className="p-4">Few hours–1 day</td></tr>
                  <tr className="border-b border-gray-200"><td className="p-4 font-semibold">Roof Replacement</td><td className="p-4">Old or widespread damage</td><td className="p-4">$6,000–$14,000</td><td className="p-4">1–3 days</td></tr>
                  <tr className="border-b border-gray-200 bg-gray-50"><td className="p-4 font-semibold">New Construction Roofing</td><td className="p-4">New builds, additions</td><td className="p-4">$8,000–$20,000</td><td className="p-4">3–7 days</td></tr>
                  <tr className="border-b border-gray-200"><td className="p-4 font-semibold">Roof Inspection</td><td className="p-4">Buying, selling, maintenance</td><td className="p-4">$150–$350</td><td className="p-4">1–2 hours</td></tr>
                  <tr><td className="p-4 font-semibold">Annual Maintenance</td><td className="p-4">Preventive care</td><td className="p-4">$150–$400</td><td className="p-4">1–2 hours</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 14. Do's and Don'ts — two cards side by side */}
          <section className="mb-10">
            <div className="grid md:grid-cols-2 gap-4">
              <ContentCard
                type="dos"
                heading="Roofing Do's Every Homeowner Should Follow"
                list={[
                  'Inspect the roof twice a year and after every major storm',
                  'Keep gutters, valleys, and downspouts free of debris',
                  'Trim tree branches that hang within 6 feet of the roof surface',
                  'Check attic ventilation and insulation seasonally',
                  'Fix small leaks immediately — water travels and can damage areas far from the entry point',
                  'Hire a licensed, insured roofer for any work that requires walking on the roof',
                ]}
              />
              <ContentCard
                type="donts"
                heading="Roofing Don'ts That Cost You Money"
                list={[
                  'Ignore missing, curled, or bruised shingles — even a small gap can let water reach the decking',
                  'Walk on a wet or steep roof without fall protection',
                  'Power wash shingles or tiles — high pressure strips granules and cracks tile',
                  'Cover a ceiling stain with paint instead of fixing the source',
                  'Wait to call a roofer after hail or high-wind events — insurance claims are time-sensitive',
                  'Hire a contractor who cannot show a current license, insurance, or local references',
                ]}
              />
            </div>
          </section>

          {/* 15. FAQs */}
          <section className="mb-10">
            <h2 className="text-xl md:text-2xl font-extrabold text-blue-900 mb-4 text-center">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-3">
              <details className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors bg-white">
                <summary className="text-base font-semibold text-gray-800 cursor-pointer leading-snug">How do I know if I need a roof repair or replacement?</summary>
                <p className="text-sm text-gray-700 mt-2 leading-snug">If your roof is under 15 years old with isolated damage, repair is usually the right call. If it is over 20 years old, has widespread granule loss, or has needed three or more repairs in five years, replacement is typically more economical. A licensed roofer can assess the condition and recommend the best option.</p>
              </details>
              <details className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors bg-white">
                <summary className="text-base font-semibold text-gray-800 cursor-pointer leading-snug">Does homeowners insurance cover roof damage?</summary>
                <p className="text-sm text-gray-700 mt-2 leading-snug">Most policies cover sudden and accidental damage from wind, hail, and falling objects — but not gradual wear and tear or damage from deferred maintenance. Document damage with photos and a professional inspection, and file your claim promptly.</p>
              </details>
              <details className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors bg-white">
                <summary className="text-base font-semibold text-gray-800 cursor-pointer leading-snug">How long does a roof replacement take?</summary>
                <p className="text-sm text-gray-700 mt-2 leading-snug">Most residential roof replacements take 1–3 days depending on roof size, material, and weather. Larger or more complex roofs may take longer. Your written quote will include a specific timeline.</p>
              </details>
              <details className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors bg-white">
                <summary className="text-base font-semibold text-gray-800 cursor-pointer leading-snug">What is the best roofing material for my climate?</summary>
                <p className="text-sm text-gray-700 mt-2 leading-snug">The right material depends on your local climate, budget, and architectural style. Asphalt shingles work well in most climates. Metal excels in high-wind and high-sun areas. Tile and slate are ideal for warm, dry regions. Flat membranes are used on low-slope roofs. A local roofer can recommend the best option for your area.</p>
              </details>
              <details className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors bg-white">
                <summary className="text-base font-semibold text-gray-800 cursor-pointer leading-snug">Do you offer new construction roofing?</summary>
                <p className="text-sm text-gray-700 mt-2 leading-snug">Yes. We connect builders and homeowners with licensed roofers who handle new construction roofing from framing inspection and dry-in through final shingle, metal, tile, or flat membrane installation. Coordination with the builder's schedule and weather timing is critical.</p>
              </details>
            </div>
          </section>

          {/* 16. City Coverage — dark CTA with search */}
          <section className="mb-10 bg-[#13294b] text-white rounded-2xl p-6 md:p-8 text-center shadow-xl">
            <h2 className="text-xl md:text-2xl font-extrabold mb-2">Serving {totalPlaces.toLocaleString()}+ Cities Across the USA</h2>
            <p className="text-sm md:text-base text-blue-200/80 max-w-2xl mx-auto mb-6 leading-snug">
              From major metro areas to small towns, we connect homeowners with licensed roofers in all 50 states. Enter your city or ZIP to find local roofing services near you.
            </p>
            <ZipCitySearch vertical={vertical} serviceSlug="emergency-roof-repair" />
            <div className="flex flex-wrap gap-3 justify-center mt-6">
              <CallButton phone={phone} display={display} label="national-coverage" vertical={vertical.slug} size="lg" />
              <VerticalCallbackWidget campaignId={campaignId} vertical={vertical.slug} />
            </div>
          </section>

          {/* 17. Roofing Guides */}
          <section className="mb-10">
            <h2 className="text-xl md:text-2xl font-extrabold text-blue-900 mb-2">Roofing Guides & Resources</h2>
            <p className="text-gray-600 leading-snug mb-6 text-sm md:text-base">In-depth homeowner guides to help you make informed roofing decisions.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { slug: 'roof-repair-vs-replacement', label: 'Roof Repair vs Replacement' },
                { slug: 'insurance-claims-guide', label: 'Insurance Claims Guide' },
                { slug: 'roofing-cost-guide', label: 'Roofing Cost Guide' },
                { slug: 'roofing-materials-guide', label: 'Roofing Materials Guide' },
                { slug: 'roof-maintenance-guide', label: 'Roof Maintenance Guide' },
                { slug: 'roof-inspection-guide', label: 'Roof Inspection Guide' },
                { slug: 'residential-roofing-guide', label: 'Residential Roofing Guide' },
                { slug: 'commercial-roofing-guide', label: 'Commercial Roofing Guide' },
                { slug: 'storm-damage-roofing-guide', label: 'Storm Damage Roofing Guide' },
                { slug: 'emergency-roofing-guide', label: 'Emergency Roofing Guide' },
                { slug: 'roofing-faq', label: 'Roofing FAQ Hub' },
                { slug: 'roofing-process', label: 'How the Roofing Process Works' },
                { slug: 'how-to-choose-roofing-contractor', label: 'How to Choose a Roofing Contractor' },
                { slug: 'signs-you-need-roof-repair', label: 'Signs You Need Roof Repair' },
                { slug: 'signs-you-need-roof-replacement', label: 'Signs You Need a Roof Replacement' },
                { slug: 'common-roofing-problems', label: 'Common Roofing Problems' },
                { slug: 'seasonal-roof-maintenance-guide', label: 'Seasonal Roof Maintenance Guide' },
              ].map((g) => (
                <Link
                  key={g.slug}
                  href={'/roofing/guides/' + g.slug}
                  className="block px-4 py-3 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 border border-gray-200 rounded-lg text-sm text-gray-800 no-underline transition-colors font-medium"
                  prefetch={false}
                >
                  {g.label}
                </Link>
              ))}
            </div>
          </section>

          {/* 18. Featured States */}
          <section className="mb-10">
            <h2 className="text-xl md:text-2xl font-extrabold text-blue-900 mb-2">Featured States</h2>
            <p className="text-gray-600 leading-snug mb-6 text-sm md:text-base">Select your state for climate-specific roofing information and city-level service pages.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {featuredStates.map((group) => (
                <Link
                  key={group.stateCode}
                  href={buildStateHubUrl(vertical, group.stateSlug)}
                  className="group block bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-blue-400 transition-all no-underline text-center"
                  prefetch={false}
                >
                  <p className="text-base font-bold text-blue-900 group-hover:text-blue-700">{group.stateName}</p>
                  <p className="text-xs text-gray-500 mt-1">{(group.cities || []).length} cities</p>
                </Link>
              ))}
            </div>
          </section>

          {/* 18. Featured Cities */}
          <section className="mb-10">
            <h2 className="text-xl md:text-2xl font-extrabold text-blue-900 mb-2">Featured Cities</h2>
            <p className="text-gray-600 leading-snug mb-6 text-sm md:text-base">Roofing services in major metro areas. Select your city for local roofing help.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {topCities.map((city) => (
                <Link
                  key={`top-${city.slug || city.name}`}
                  href={buildVerticalSlug(vertical, cityToSlug(city.name), 'emergency-roof-repair')}
                  className="px-3 py-2 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 border border-gray-200 rounded-lg text-sm text-gray-800 no-underline text-center transition-colors font-medium"
                  prefetch={false}
                >
                  {city.name}
                </Link>
              ))}
            </div>
          </section>
        </main>

        <footer className="bg-gray-900 text-gray-300 py-6 mt-auto">
          <div className="max-w-4xl mx-auto px-4 text-center text-sm text-gray-400">
            <p className="text-white font-bold text-lg mb-1">YoHomeFix</p>
            <p>© {new Date().getFullYear()} YoHomeFix. All rights reserved.</p>
          </div>
          <RoofingDisclaimer />
        </footer>
      </div>
    </>
  );
}
