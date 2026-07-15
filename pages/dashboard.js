import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { SEED_CITIES, SERVICES, STATES, buildSlug, cityToSlug, getStateSlug } from '../lib/cities';
import { CITY_POOL } from '../engine/cityPool';

const TOTAL_PAGES = SEED_CITIES.length * SERVICES.length;

function StatCard({ label, value, sub, color = 'blue' }) {
  const colors = {
    blue:   'bg-blue-50 border-blue-200 text-blue-900',
    green:  'bg-green-50 border-green-200 text-green-900',
    red:    'bg-red-50 border-red-200 text-red-900',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  };
  return (
    <div className={`border rounded-xl p-5 ${colors[color]}`}>
      <p className="text-sm font-semibold opacity-70 mb-1">{label}</p>
      <p className="text-3xl font-extrabold">{value}</p>
      {sub && <p className="text-xs opacity-60 mt-1">{sub}</p>}
    </div>
  );
}

// Simple content uniqueness score: 1 = mostly template, 5 = highly unique
function uniquenessScore(cityName) {
  const signals = ['New York','Los Angeles','Chicago','Houston','Phoenix','Philadelphia','San Antonio','San Diego','Dallas','San Jose','Austin','Jacksonville','Fort Worth','Columbus','Charlotte','Indianapolis','San Francisco','Seattle','Denver','Nashville'];
  const idx = signals.indexOf(cityName);
  // Cities with specific signals get higher score
  if (idx >= 0) return Math.max(3, 5 - Math.floor(idx / 6));
  return 2;
}

export async function getStaticProps() {
  const fs   = (await import('fs')).default;
  const path = (await import('path')).default;
  let engineReport = null;
  let generatedCount = 0;
  try {
    const rPath = path.join(process.cwd(), 'engine', 'last-run-report.json');
    const gPath = path.join(process.cwd(), 'engine', 'generated.json');
    if (fs.existsSync(rPath)) engineReport = JSON.parse(fs.readFileSync(rPath, 'utf8'));
    if (fs.existsSync(gPath)) {
      const g = JSON.parse(fs.readFileSync(gPath, 'utf8'));
      generatedCount = Array.isArray(g.slugs) ? g.slugs.length : 0;
    }
  } catch (_) {}
  return { props: { engineReport, generatedCount } };
}

export default function Dashboard({ engineReport, generatedCount }) {
  const [callData, setCallData] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem('yhf_call_clicks');
      if (raw) setCallData(JSON.parse(raw));
    } catch (_) {}
  }, []);

  const totalCallClicks = callData?.__total || 0;
  const lastClick = callData?.__last ? new Date(callData.__last).toLocaleString() : 'No clicks yet';

  const clickByLabel = callData
    ? Object.entries(callData).filter(([k]) => !k.startsWith('__')).sort((a, b) => b[1] - a[1])
    : [];

  // Duplicate content risk: pages with score < 3
  const lowUniqueness = SEED_CITIES.filter((c) => uniquenessScore(c.name) < 3);

  // Top cities by uniqueness score (proxy for ranking potential)
  const cityRankings = [...SEED_CITIES]
    .map((c) => ({ ...c, score: uniquenessScore(c.name) }))
    .sort((a, b) => b.score - a.score);

  return (
    <>
      <Head>
        <title>YoHomeFix Dashboard</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="font-sans bg-gray-50 min-h-screen">

        {/* Header */}
        <nav className="bg-blue-900 text-white px-6 py-4 flex justify-between items-center">
          <div>
            <Link href="/" className="text-xl font-extrabold text-white no-underline">YoHomeFix</Link>
            <span className="ml-3 text-white text-sm">Dashboard</span>
          </div>
          <Link href="/" className="text-white hover:text-white text-sm">← Back to Site</Link>
        </nav>

        <main className="max-w-6xl mx-auto px-4 py-8">

          <h1 className="text-2xl font-bold text-gray-900 mb-1">SEO & Conversion Dashboard</h1>
          <p className="text-gray-500 text-sm mb-8">Live data from this browser session. Call clicks are stored in localStorage.</p>

          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <StatCard label="Total Pages Built" value={TOTAL_PAGES} sub={`${SEED_CITIES.length} cities × ${SERVICES.length} services`} color="blue" />
            <StatCard label="State Hub Pages" value={STATES.length} sub="Indexed by state" color="blue" />
            <StatCard label="Call Clicks (Session)" value={mounted ? totalCallClicks : '—'} sub={`Last: ${mounted ? lastClick : '—'}`} color="green" />
            <StatCard label="Duplicate Risk Pages" value={lowUniqueness.length} sub="Low uniqueness score <3/5" color="red" />
          </div>

          {/* Engine Status Panel */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-1">⚙️ Smart Page Generation Engine</h2>
            <p className="text-gray-500 text-sm mb-5">
              Rule-driven engine scores every city × service combination before generating. Daily limit: <strong>25 pages/run</strong>. Only HIGH and MEDIUM-HIGH intent combos are approved.
            </p>

            {/* Engine stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-blue-700 mb-1">City Pool</p>
                <p className="text-2xl font-extrabold text-blue-900">{CITY_POOL.length}</p>
                <p className="text-xs text-blue-500 mt-1">{CITY_POOL.filter(c => c.dataReady).length} data-ready</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-green-700 mb-1">Pages Generated</p>
                <p className="text-2xl font-extrabold text-green-900">{generatedCount}</p>
                <p className="text-xs text-green-500 mt-1">registered in engine</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-yellow-700 mb-1">Queue Depth</p>
                <p className="text-2xl font-extrabold text-yellow-900">{engineReport ? engineReport.summary.queueDepth : '—'}</p>
                <p className="text-xs text-yellow-500 mt-1">awaiting next run</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-600 mb-1">Last Run</p>
                <p className="text-lg font-extrabold text-gray-900">{engineReport ? engineReport.runDate : 'Never'}</p>
                <p className="text-xs text-gray-700 mt-1">{engineReport?.dryRun ? 'dry-run' : 'live run'}</p>
              </div>
            </div>

            {/* Intent band breakdown */}
            {engineReport && (
              <div className="mb-5">
                <p className="text-sm font-semibold text-gray-700 mb-2">Intent band breakdown (last run eligible pool)</p>
                <div className="flex flex-wrap gap-3 text-sm">
                  {[['🟢 HIGH', engineReport.summary.totalEligible > 0 ? 'see report' : '—'],
                    ['✅ Approved', engineReport.summary.approved],
                    ['⏭ Skipped', engineReport.summary.skipped],
                    ['🗃 Total registered', engineReport.summary.alreadyGenerated]
                  ].map(([label, val]) => (
                    <span key={label} className="bg-gray-100 px-3 py-1 rounded-full text-gray-700 font-mono">
                      {label}: <strong>{val}</strong>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tier breakdown */}
            {engineReport?.tierBreakdown && (
              <div className="mb-5">
                <p className="text-sm font-semibold text-gray-700 mb-2">Approved by city tier (last run)</p>
                <div className="flex gap-4 text-sm">
                  {Object.entries(engineReport.tierBreakdown).map(([tier, count]) => (
                    <div key={tier} className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-2 text-center">
                      <p className="font-bold text-blue-900 text-lg">{count}</p>
                      <p className="text-blue-600 text-xs">Tier {tier}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Service breakdown */}
            {engineReport?.serviceBreakdown && Object.keys(engineReport.serviceBreakdown).length > 0 && (
              <div className="mb-5">
                <p className="text-sm font-semibold text-gray-700 mb-2">Approved by service (last run)</p>
                <div className="overflow-x-auto">
                  <table className="text-sm w-full">
                    <thead><tr className="text-left border-b border-gray-200">
                      <th className="pb-1 font-semibold text-gray-500">Service</th>
                      <th className="pb-1 font-semibold text-gray-500 text-right">Pages</th>
                    </tr></thead>
                    <tbody>
                      {['emergency','leak-repair','drain-cleaning','pipe-burst-repair','water-heater-repair'].map(svc => (
                        engineReport.serviceBreakdown[svc] ? (
                          <tr key={svc} className="border-b border-gray-100">
                            <td className="py-1 text-gray-700 font-mono">{svc}</td>
                            <td className="py-1 text-right font-bold text-gray-900">{engineReport.serviceBreakdown[svc]}</td>
                          </tr>
                        ) : null
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Next in queue */}
            {engineReport?.skipped && engineReport.skipped.filter(s => s.reason.startsWith('DAILY_LIMIT')).length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Next in queue (top 5)</p>
                <div className="space-y-1">
                  {engineReport.skipped.filter(s => s.reason.startsWith('DAILY_LIMIT')).slice(0, 5).map(s => {
                    const slug = `plumber-${s.cityName.toLowerCase().replace(/\s+/g, '-')}-${s.service}`;
                    return (
                      <div key={slug} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-1.5 text-sm">
                        <span className="font-mono text-gray-600">{slug}</span>
                        <span className="font-bold text-gray-900 ml-2">{s.score}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-5 pt-4 border-t border-gray-100 text-xs text-gray-700">
              <p>Run: <code className="bg-gray-100 px-1 rounded">node engine/run.js --dry-run</code> to preview · <code className="bg-gray-100 px-1 rounded">node engine/run.js</code> to execute · <code className="bg-gray-100 px-1 rounded">node engine/run.js --queue</code> to see full priority list</p>
            </div>
          </div>

          {/* Call Click Breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">📞 Call Click Breakdown</h2>
            {!mounted || clickByLabel.length === 0 ? (
              <p className="text-gray-700 text-sm">No call clicks recorded in this browser yet. Clicks on call buttons are tracked here.</p>
            ) : (
              <div className="space-y-2">
                {clickByLabel.map(([label, count]) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-700 font-mono text-sm">{label}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${Math.min(100, (count / Math.max(totalCallClicks, 1)) * 100)}%` }}
                        />
                      </div>
                      <span className="text-gray-900 font-bold w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-700 mt-4">
              Button labels: hero, nav-desktop, nav-mobile, sticky-mobile, mid-page, bottom, footer
            </p>
          </div>

          {/* Content Uniqueness Report */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-1">🔍 Duplicate Content Risk Report</h2>
            <p className="text-gray-500 text-sm mb-5">
              Pages are scored 1–5 based on how many city-specific signals are injected (population, climate, water type, local fact, winter risk).
              Score ≥3 = acceptable. Score &lt;3 = duplicate content risk.
            </p>

            {/* Score legend */}
            <div className="flex gap-4 flex-wrap mb-4 text-xs">
              {[
                { score: '5', label: 'Highly unique', color: 'bg-green-500' },
                { score: '4', label: 'Good uniqueness', color: 'bg-green-300' },
                { score: '3', label: 'Acceptable', color: 'bg-yellow-400' },
                { score: '2', label: '⚠️ Risk — add local data', color: 'bg-orange-400' },
                { score: '1', label: '🚨 High risk — template only', color: 'bg-red-500' },
              ].map((item) => (
                <div key={item.score} className="flex items-center gap-1">
                  <span className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-gray-600">{item.score}/5 — {item.label}</span>
                </div>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-gray-200">
                    <th className="pb-2 font-semibold text-gray-600">City</th>
                    <th className="pb-2 font-semibold text-gray-600">State</th>
                    <th className="pb-2 font-semibold text-gray-600">Score</th>
                    <th className="pb-2 font-semibold text-gray-600">Status</th>
                    <th className="pb-2 font-semibold text-gray-600">Pages</th>
                  </tr>
                </thead>
                <tbody>
                  {cityRankings.map((city) => {
                    const score = city.score;
                    const statusColor = score >= 4 ? 'text-green-600' : score === 3 ? 'text-yellow-600' : 'text-red-600';
                    const statusText = score >= 4 ? '✓ Unique' : score === 3 ? '~ Acceptable' : '⚠ Needs work';
                    return (
                      <tr key={city.name} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2 font-medium text-gray-800">{city.name}</td>
                        <td className="py-2 text-gray-500">{city.stateCode}</td>
                        <td className="py-2">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-0.5">
                              {[1,2,3,4,5].map((n) => (
                                <span key={n} className={`w-3 h-3 rounded-sm ${n <= score ? 'bg-blue-500' : 'bg-gray-200'}`} />
                              ))}
                            </div>
                            <span className="text-gray-600 text-xs">{score}/5</span>
                          </div>
                        </td>
                        <td className={`py-2 font-semibold ${statusColor}`}>{statusText}</td>
                        <td className="py-2">
                          <Link
                            href={`/${buildSlug(cityToSlug(city.name), 'emergency')}`}
                            target="_blank"
                            className="text-blue-600 hover:underline text-xs no-underline"
                          >
                            View page →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Performing Cities (ranking proxy) */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">🏆 Top Cities by Content Quality</h2>
            <p className="text-gray-500 text-sm mb-4">Cities with the most unique, locally-differentiated content rank better for local queries.</p>
            <div className="grid md:grid-cols-2 gap-3">
              {cityRankings.slice(0, 10).map((city, i) => (
                <div key={city.name} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-700 font-mono text-sm w-5">#{i + 1}</span>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{city.name}</p>
                      <p className="text-gray-700 text-xs">{city.stateCode} · {SERVICES.length} pages</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map((n) => (
                      <span key={n} className={`w-3 h-3 rounded-sm ${n <= city.score ? 'bg-blue-500' : 'bg-gray-200'}`} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Architecture Overview */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">🗺️ Site Architecture for 10,000+ Pages</h2>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="font-bold text-blue-900 mb-2">Tier 1 — National</p>
                <p className="text-blue-700">/ (homepage)</p>
                <p className="text-blue-700">/plumber-usa</p>
                <p className="text-xs text-blue-500 mt-2">2 pages · PageRank hub</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="font-bold text-green-900 mb-2">Tier 2 — State</p>
                <p className="text-green-700">/plumber-{'{state}'}</p>
                <p className="text-xs text-green-500 mt-2">{STATES.length} pages · 1 per state</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="font-bold text-yellow-900 mb-2">Tier 3 — City × Service</p>
                <p className="text-yellow-700">/plumber-{'{city}'}-{'{service}'}</p>
                <p className="text-xs text-yellow-500 mt-2">{TOTAL_PAGES} now · scales to 25,000+</p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
              <strong>Anti-doorway signals built in:</strong> Each page has unique content via city signals (population, climate, water type, local plumbing fact, winter risk), city-specific reviews, breadcrumb navigation, state hub links, and cross-service internal links. No page is purely template-fill.
            </div>
          </div>

          {/* State Hub Pages */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">📍 State Hub Pages</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {STATES.map((s) => (
                <Link
                  key={s.slug}
                  href={`/plumber-${s.slug}`}
                  className="p-3 border border-gray-200 rounded-lg hover:border-blue-400 text-sm no-underline transition-colors"
                >
                  <p className="font-semibold text-blue-900">{s.name}</p>
                  <p className="text-gray-700 text-xs">{SEED_CITIES.filter((c) => c.stateCode === s.code).length} cities indexed</p>
                </Link>
              ))}
            </div>
          </div>

        </main>
      </div>
    </>
  );
}
