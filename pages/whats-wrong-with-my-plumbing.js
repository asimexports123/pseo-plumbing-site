import Head from 'next/head';
import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { SEED_CITIES, SERVICES, cityToSlug, buildSlug, PHONE_NUMBER, STATES } from '../lib/cities';
import { Footer } from '../components/Footer';

const SYMPTOMS = [
  {
    id: 'drain-backup',
    label: 'Drain backing up',
    icon: '🚿',
    safety: 'If sewage is entering your home, avoid contact with the water. Turn off any appliances that use water (washing machine, dishwasher). If multiple drains are backing up simultaneously, your main sewer line is likely blocked.',
    problemCategory: 'Sewer line blockage or backup',
    urgency: 'high',
    urgencyLabel: 'Urgent — call within 1 hour',
    service: 'drain-cleaning',
    serviceName: 'Drain Cleaning & Sewer Clearing',
  },
  {
    id: 'no-hot-water',
    label: 'No hot water',
    icon: '🚿',
    safety: 'Check if the water heater pilot light is out (gas units) or if the breaker has tripped (electric units). Do NOT attempt to relight a pilot if you smell gas — leave the house and call your gas company first.',
    problemCategory: 'Water heater failure',
    urgency: 'medium',
    urgencyLabel: 'Same-day service recommended',
    service: 'water-heater-repair',
    serviceName: 'Water Heater Repair',
  },
  {
    id: 'burst-pipe',
    label: 'Burst pipe',
    icon: '💥',
    safety: 'Immediately shut off your main water supply valve. If water is near electrical outlets or panels, turn off electricity at the breaker. Move valuables away from the water. Place buckets or towels to contain the flow.',
    problemCategory: 'Burst or frozen pipe',
    urgency: 'emergency',
    urgencyLabel: 'Emergency — call immediately',
    service: 'pipe-burst-repair',
    serviceName: 'Pipe Burst Repair',
  },
  {
    id: 'leaking-water-heater',
    label: 'Leaking water heater',
    icon: '💧',
    safety: 'Turn off power to the unit (gas valve or breaker). Shut off the cold water supply to the heater. Place a bucket under the leak if accessible. A leaking water heater can fail catastrophically — do not ignore.',
    problemCategory: 'Water heater tank failure',
    urgency: 'high',
    urgencyLabel: 'Urgent — call within 1 hour',
    service: 'water-heater-repair',
    serviceName: 'Water Heater Repair',
  },
  {
    id: 'overflowing-toilet',
    label: 'Overflowing toilet',
    icon: '🚽',
    safety: 'Remove the tank lid and close the flapper valve to stop water flow. If that does not work, shut off the toilet supply valve (usually on the wall behind the toilet). Do not flush again.',
    problemCategory: 'Toilet clog or fill valve failure',
    urgency: 'high',
    urgencyLabel: 'Urgent — call within 1 hour',
    service: 'toilet-repair',
    serviceName: 'Toilet Repair',
  },
  {
    id: 'sewer-smell',
    label: 'Sewer smell',
    icon: '👃',
    safety: 'Sewer gas can contain methane and hydrogen sulfide. Open windows for ventilation. Check if any floor drains or unused fixtures have dried out — pour water into them to refill the trap seal. If the smell persists or is strong, leave the area.',
    problemCategory: 'Dry drain trap or sewer line breach',
    urgency: 'medium',
    urgencyLabel: 'Same-day service recommended',
    service: 'drain-cleaning',
    serviceName: 'Drain Cleaning & Sewer Clearing',
  },
  {
    id: 'low-water-pressure',
    label: 'Low water pressure',
    icon: '📉',
    safety: 'Check if the issue affects one fixture or the whole house. If whole-house, check your main shutoff valve is fully open. If only hot water is affected, your water heater may have sediment buildup. No immediate safety risk, but can indicate a larger problem.',
    problemCategory: 'Pipe corrosion, sediment buildup, or supply line issue',
    urgency: 'low',
    urgencyLabel: 'Schedule within 1-2 days',
    service: 'water-line-repair',
    serviceName: 'Water Line Repair',
  },
];

const URGENCY_STYLES = {
  emergency: { bg: 'bg-red-600', text: 'text-white', border: 'border-red-600', label: 'EMERGENCY' },
  high: { bg: 'bg-orange-500', text: 'text-white', border: 'border-orange-500', label: 'URGENT' },
  medium: { bg: 'bg-yellow-500', text: 'text-gray-900', border: 'border-yellow-500', label: 'SAME-DAY' },
  low: { bg: 'bg-blue-500', text: 'text-white', border: 'border-blue-500', label: 'SCHEDULE' },
};

export default function PlumbingDiagnosticTool() {
  const [selectedSymptom, setSelectedSymptom] = useState(null);
  const [selectedCity, setSelectedCity] = useState('');
  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'https://yohomefix.com';

  function trackDiagnostic(action, params) {
    try {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', action, params);
      }
    } catch (_) {}
  }

  // diagnostic_tool_start — fires when the tool page loads
  useEffect(() => {
    trackDiagnostic('diagnostic_tool_start', {
      page_path: typeof window !== 'undefined' ? window.location.pathname : '',
    });
  }, []);

  function handleSymptomSelect(symptomId) {
    setSelectedSymptom(symptomId);
    const symptom = SYMPTOMS.find(s => s.id === symptomId);
    trackDiagnostic('symptom_selected', {
      symptom_id: symptomId,
      symptom_label: symptom?.label || '',
      urgency: symptom?.urgency || '',
      service: symptom?.service || '',
      page_path: typeof window !== 'undefined' ? window.location.pathname : '',
    });
  }

  function handleCitySelect(cityName) {
    setSelectedCity(cityName);
    trackDiagnostic('diagnostic_city_selected', {
      city: cityName,
      symptom_id: selectedSymptom || '',
      page_path: window.location.pathname,
    });
  }

  function handleDiagnosticCall(urgency, symptom) {
    const ctaLocation = urgency === 'emergency' || urgency === 'high' ? 'diagnostic-urgent-call' : 'diagnostic-schedule-call';
    trackDiagnostic('diagnostic_call_click', {
      cta_location: ctaLocation,
      page_path: typeof window !== 'undefined' ? window.location.pathname : '',
      page_location: typeof window !== 'undefined' ? window.location.href : '',
      symptom_id: symptom?.id || '',
      urgency: urgency || '',
      service: symptom?.service || '',
      city: selectedCity || '',
    });
  }

  const cityOptions = useMemo(() => {
    return SEED_CITIES.map(c => ({ name: c.name, state: c.stateCode }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const result = useMemo(() => {
    if (!selectedSymptom) return null;
    const symptom = SYMPTOMS.find(s => s.id === selectedSymptom);
    if (!symptom) return null;

    let cityLink = null;
    if (selectedCity) {
      const citySlug = cityToSlug(selectedCity);
      cityLink = `${domain}/${buildSlug(citySlug, symptom.service)}`;
    }

    const stateServiceLink = `${domain}/plumber`;

    return { symptom, cityLink };
  }, [selectedSymptom, selectedCity, domain]);

  // result_viewed — fires when diagnostic result becomes visible
  useEffect(() => {
    if (!result) return;
    trackDiagnostic('result_viewed', {
      symptom_id: result.symptom?.id || '',
      symptom_label: result.symptom?.label || '',
      urgency: result.symptom?.urgency || '',
      service: result.symptom?.service || '',
      city: selectedCity || '',
      page_path: typeof window !== 'undefined' ? window.location.pathname : '',
    });
  }, [result]);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: "What's Wrong With My Plumbing? — YoHomeFix Diagnostic Tool",
    description: 'Interactive plumbing symptom checker for homeowners. Select your plumbing symptom to get immediate safety guidance, likely problem category, urgency level, and relevant YoHomeFix service.',
    url: `${domain}/whats-wrong-with-my-plumbing`,
    applicationCategory: 'HomeImprovementApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    publisher: { '@id': `${domain}/#organization` },
  };

  const title = "What's Wrong With My Plumbing? — Free Diagnostic Tool | YoHomeFix";
  const description = "Select your plumbing symptom — drain backup, no hot water, burst pipe, leaking water heater, overflowing toilet, sewer smell, or low water pressure — and get immediate safety guidance, likely problem category, and urgency level. Free tool from YoHomeFix.";

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`${domain}/whats-wrong-with-my-plumbing`} />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${domain}/whats-wrong-with-my-plumbing`} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </Head>

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-red-600 md:hidden" style={{ height: 64 }}>
        <a href={`tel:${PHONE_NUMBER}`} className="flex items-center justify-center gap-3 h-full text-white font-extrabold text-xl w-full" aria-label="Call emergency dispatch">
          📞 CALL NOW — 24/7
        </a>
      </div>

      <div className="font-sans bg-white min-h-screen flex flex-col pb-16 md:pb-0">
        <nav className="bg-blue-900 text-white px-4 py-3 flex justify-between items-center sticky top-0 z-40 shadow-lg">
          <Link href="/" className="text-2xl font-extrabold text-white no-underline">YoHomeFix</Link>
          <a href={`tel:${PHONE_NUMBER}`} className="hidden md:flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-full font-bold" aria-label="Call emergency dispatch">
            📞 Call Now
          </a>
          <a href={`tel:${PHONE_NUMBER}`} className="md:hidden bg-red-600 text-white px-4 py-2 rounded-full font-bold text-sm" aria-label="Call emergency dispatch">Call Now</a>
        </nav>

        <section className="bg-gradient-to-br from-blue-900 to-blue-700 text-white px-4 py-10 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-block bg-red-600 text-sm font-bold px-3 py-1 rounded-full mb-4">🔧 Free Plumbing Diagnostic Tool</div>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-4">What's Wrong With My Plumbing?</h1>
            <p className="text-lg text-white mb-2 max-w-2xl mx-auto">
              Select your symptom below for immediate safety guidance, likely problem category, and what to do next.
            </p>
            <p className="text-blue-200 text-sm">No sign-up required. Always free.</p>
          </div>
        </section>

        <main className="max-w-3xl mx-auto w-full px-4 py-10">
          {/* Symptom Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-blue-900 mb-4">Step 1: What's happening?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SYMPTOMS.map(s => (
                <button
                  key={s.id}
                  onClick={() => handleSymptomSelect(s.id)}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${
                    selectedSymptom === s.id
                      ? 'border-blue-600 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-blue-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{s.icon}</span>
                    <span className="font-semibold text-gray-800">{s.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* City Selection */}
          {selectedSymptom && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-blue-900 mb-4">Step 2: Your city (optional — for local service)</h2>
              <select
                value={selectedCity}
                onChange={e => handleCitySelect(e.target.value)}
                className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none text-gray-800"
              >
                <option value="">Select your city...</option>
                {cityOptions.map(c => (
                  <option key={`${c.name}-${c.state}`} value={c.name}>{c.name}, {c.state}</option>
                ))}
              </select>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-4">
              {/* Urgency Banner */}
              <div className={`rounded-2xl p-5 ${URGENCY_STYLES[result.symptom.urgency].bg} ${URGENCY_STYLES[result.symptom.urgency].text}`}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{result.symptom.icon}</span>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wide opacity-80">
                      {URGENCY_STYLES[result.symptom.urgency].label}
                    </div>
                    <div className="text-lg font-bold">{result.symptom.urgencyLabel}</div>
                  </div>
                </div>
              </div>

              {/* Safety Guidance */}
              <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
                <h3 className="text-lg font-bold text-green-900 mb-2">✓ Immediate Safety Steps</h3>
                <p className="text-gray-700 leading-relaxed">{result.symptom.safety}</p>
              </div>

              {/* Problem Category */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                <h3 className="text-lg font-bold text-blue-900 mb-2">Likely Problem</h3>
                <p className="text-gray-700 font-medium">{result.symptom.problemCategory}</p>
                <p className="text-gray-500 text-sm mt-2">
                  This is a likely cause based on your symptom. A licensed plumber can confirm the exact issue on-site.
                </p>
              </div>

              {/* Service Link */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Recommended Service</h3>
                <p className="text-gray-700 mb-3">{result.symptom.serviceName}</p>
                {result.cityLink ? (
                  <Link
                    href={result.cityLink.replace(domain, '')}
                    className="inline-flex items-center gap-2 text-blue-700 font-semibold hover:underline"
                  >
                    View {result.symptom.serviceName} in {selectedCity} →
                  </Link>
                ) : (
                  <p className="text-gray-500 text-sm">Select your city above to see local service options.</p>
                )}
              </div>

              {/* Call CTA */}
              {(result.symptom.urgency === 'emergency' || result.symptom.urgency === 'high') && (
                <div className="bg-red-600 text-white rounded-2xl p-6 text-center">
                  <h3 className="text-xl font-extrabold mb-2">Need Help Right Now?</h3>
                  <p className="text-white mb-4">Live dispatcher — 60-minute response target — no overtime charges</p>
                  <a
                    href={`tel:${PHONE_NUMBER}`}
                    onClick={() => handleDiagnosticCall(result.symptom.urgency, result.symptom)}
                    data-track="diagnostic-urgent-call"
                    className="inline-flex items-center gap-3 bg-white text-red-600 px-8 py-4 rounded-full text-xl font-extrabold hover:bg-gray-100 transition-colors"
                    aria-label="Call emergency dispatch"
                  >
                    📞 Call Now
                  </a>
                </div>
              )}

              {(result.symptom.urgency === 'medium' || result.symptom.urgency === 'low') && (
                <div className="bg-blue-900 text-white rounded-2xl p-6 text-center">
                  <h3 className="text-xl font-extrabold mb-2">Ready to Schedule?</h3>
                  <p className="text-white mb-4">Call now or browse our service pages for more information.</p>
                  <a
                    href={`tel:${PHONE_NUMBER}`}
                    onClick={() => handleDiagnosticCall(result.symptom.urgency, result.symptom)}
                    data-track="diagnostic-schedule-call"
                    className="inline-flex items-center gap-3 bg-red-600 text-white px-8 py-4 rounded-full text-xl font-extrabold hover:bg-red-500 transition-colors"
                    aria-label="Call to schedule service"
                  >
                    📞 Call Now
                  </a>
                </div>
              )}
            </div>
          )}

          {/* SEO Content */}
          <div className="mt-12 prose prose-sm max-w-none">
            <h2 className="text-lg font-bold text-gray-800 mb-3">About This Tool</h2>
            <p className="text-gray-600 leading-relaxed">
              The YoHomeFix plumbing diagnostic tool helps homeowners quickly understand what might be wrong with their plumbing
              before a plumber arrives. By selecting your symptom, you get immediate safety guidance to protect your home and family,
              a likely problem category to help you understand the scope of the issue, and an urgency level so you know how quickly
              to act. This tool does not replace a professional diagnosis — always consult a licensed plumber for an accurate assessment.
            </p>
            <p className="text-gray-600 leading-relaxed mt-3">
              YoHomeFix connects homeowners with licensed plumbing technicians across the United States. Our dispatchers are available
              24/7 to take your call and send a qualified plumber to your home. We serve 155 cities across 46 states with upfront
              pricing and no overtime charges.
            </p>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
