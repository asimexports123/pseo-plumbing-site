import { useState, useMemo, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { PHONE_NUMBER, buildSlug, cityToSlug } from '../../lib/cities';
import { buildResearchDataset, computeFindings, classifyHardness, HARDNESS_COLORS, HARDNESS_IMPLICATIONS, RISK_COLORS } from '../../lib/researchData';
import { buildPageSchema, buildBreadcrumbSchema } from '../../lib/schemas';
import { Footer } from '../../components/Footer';
import { Author } from '../../components/Author';
import { getDeterministicLastReviewed } from '../../lib/dateUtils';

const domain = process.env.NEXT_PUBLIC_DOMAIN || 'https://yohomefix.com';

export async function getStaticProps() {
  const dataset = buildResearchDataset();
  const findings = computeFindings(dataset);
  const lastReviewed = getDeterministicLastReviewed('research-water-hardness');
  return {
    props: {
      dataset,
      findings,
      lastReviewed,
    },
  };
}

export default function WaterHardnessResearch({ dataset, findings, lastReviewed }) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('hardnessPpm');
  const [sortDir, setSortDir] = useState('desc');
  const [filterClass, setFilterClass] = useState('All');
  const [lookupCity, setLookupCity] = useState('');
  const [lookupResult, setLookupResult] = useState(null);

  const title = 'US City Water Hardness & Plumbing Risk Index | YoHomeFix Research';
  const description = `Water hardness data for ${findings.totalCities} US cities with plumbing risk scoring. Search, sort, and compare water hardness levels (mg/L CaCO₃) and infrastructure risk across the United States.`;
  const canonical = `${domain}/research/us-water-hardness-plumbing-risk`;

  const breadcrumbs = [
    { name: 'Home', url: `${domain}/` },
    { name: 'Research', url: `${domain}/research/us-water-hardness-plumbing-risk` },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      buildPageSchema({ title, description, path: '/research/us-water-hardness-plumbing-risk', breadcrumbs }),
      {
        '@type': 'Dataset',
        '@id': `${canonical}#dataset`,
        name: 'US City Water Hardness & Plumbing Risk Index',
        description: `Water hardness measurements (mg/L CaCO₃) and plumbing infrastructure risk scores for ${findings.totalCities} US cities, compiled from YoHomeFix city plumbing intelligence data.`,
        url: canonical,
        creator: { '@id': `${domain}/#organization` },
        license: 'https://creativecommons.org/licenses/by/4.0/',
        isAccessibleForFree: true,
        keywords: ['water hardness', 'plumbing risk', 'US cities', 'CaCO3', 'water quality', 'pipe infrastructure'],
        measurementTechnique: 'Compiled from municipal water utility reports, EPA Safe Drinking Water Information System data, and YoHomeFix city-level plumbing infrastructure assessments. Values represent representative hardness levels for each municipal water system.',
        variableMeasured: [
          { '@type': 'PropertyValue', name: 'water hardness', unitText: 'mg/L CaCO3' },
          { '@type': 'PropertyValue', name: 'infrastructure class', valueText: 'aging, mixed, modern' },
          { '@type': 'PropertyValue', name: 'winter risk', valueText: 'high, medium, low' },
          { '@type': 'PropertyValue', name: 'plumbing risk score', minValue: 3, maxValue: 10 },
        ],
        temporalCoverage: '2024-2026',
        spatialCoverage: { '@type': 'Place', name: 'United States' },
      },
    ],
  };

  // ── Filtered & sorted data ────────────────────────────────────
  const filteredData = useMemo(() => {
    let rows = [...dataset];
    if (filterClass !== 'All') {
      rows = rows.filter(r => r.hardnessClass === filterClass);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      rows = rows.filter(r =>
        r.city.toLowerCase().includes(q) ||
        r.state.toLowerCase().includes(q) ||
        r.stateName.toLowerCase().includes(q)
      );
    }
    rows.sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];
      if (typeof aVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });
    return rows;
  }, [dataset, search, sortKey, sortDir, filterClass]);

  const handleSort = useCallback((key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir(key === 'city' || key === 'state' ? 'asc' : 'desc');
    }
  }, [sortKey]);

  const handleLookup = useCallback(() => {
    const q = lookupCity.toLowerCase().trim();
    if (!q) {
      setLookupResult(null);
      return;
    }
    const match = dataset.find(d =>
      d.city.toLowerCase().includes(q) ||
      d.state.toLowerCase().includes(q)
    );
    setLookupResult(match || 'not found');
  }, [lookupCity, dataset]);

  const embedCode = `<iframe src="${canonical}/embed" width="100%" height="420" frameborder="0" title="YoHomeFix Water Hardness Lookup" loading="lazy"></iframe>`;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={`${domain}/og-image.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={`${domain}/og-image.png`} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumbs */}
        <nav className="max-w-6xl mx-auto px-4 pt-4 text-sm text-gray-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:underline no-underline text-blue-600">Home</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-700">Research</span>
        </nav>

        {/* Hero */}
        <header className="max-w-6xl mx-auto px-4 pt-8 pb-6">
          <div className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full mb-4">
            YOHOMEFIX ORIGINAL RESEARCH
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">
            US City Water Hardness & Plumbing Risk Index
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl leading-relaxed">
            Water hardness data and plumbing infrastructure risk scores for{' '}
            <strong>{findings.totalCities} US cities</strong>. Search your city, compare hardness levels,
            and understand what water hardness means for your home's plumbing.
          </p>
          <p className="text-sm text-gray-400 mt-3">
            Data compiled from municipal water utility data and YoHomeFix city-level plumbing assessments.
            Last reviewed: {lastReviewed}
          </p>
        </header>

        {/* Key Findings */}
        <section className="max-w-6xl mx-auto px-4 mb-10">
          <h2 className="text-2xl font-bold text-blue-900 mb-6">Key Findings</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-3xl font-bold text-blue-900">{findings.totalCities}</p>
              <p className="text-sm text-gray-500 mt-1">Cities covered</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-3xl font-bold text-blue-900">{findings.median}</p>
              <p className="text-sm text-gray-500 mt-1">Median hardness (mg/L)</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-3xl font-bold text-blue-900">{findings.min}–{findings.max}</p>
              <p className="text-sm text-gray-500 mt-1">Range (mg/L CaCO₃)</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-3xl font-bold" style={{ color: HARDNESS_COLORS['Very Hard'] }}>
                {findings.classCounts['Very Hard'] || 0}
              </p>
              <p className="text-sm text-gray-500 mt-1">Very Hard water cities</p>
            </div>
          </div>

          {/* Hardness distribution bar */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Hardness Distribution Across {findings.totalCities} Cities</h3>
            <div className="flex h-8 rounded-lg overflow-hidden">
              {['Soft', 'Moderately Hard', 'Hard', 'Very Hard'].map(cls => {
                const count = findings.classCounts[cls] || 0;
                const pct = (count / findings.totalCities) * 100;
                return (
                  <div
                    key={cls}
                    style={{ width: `${pct}%`, backgroundColor: HARDNESS_COLORS[cls] }}
                    className="flex items-center justify-center text-white text-xs font-bold"
                    title={`${cls}: ${count} cities (${pct.toFixed(1)}%)`}
                  >
                    {pct > 8 ? `${count}` : ''}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              {['Soft', 'Moderately Hard', 'Hard', 'Very Hard'].map(cls => (
                <span key={cls} className="flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: HARDNESS_COLORS[cls] }}></span>
                  {cls} ({findings.classCounts[cls] || 0})
                </span>
              ))}
            </div>
          </div>

          {/* Top/Bottom lists */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-bold text-gray-700 mb-3">10 Hardest Water Cities</h3>
              <ol className="space-y-2">
                {findings.hardest.map((d, i) => (
                  <li key={d.city} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">
                      <span className="text-gray-400 mr-2">{i + 1}.</span>
                      {d.city}, {d.state}
                    </span>
                    <span className="font-bold" style={{ color: HARDNESS_COLORS[d.hardnessClass] }}>
                      {d.hardnessPpm} mg/L
                    </span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-bold text-gray-700 mb-3">10 Softest Water Cities</h3>
              <ol className="space-y-2">
                {findings.softest.map((d, i) => (
                  <li key={d.city} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">
                      <span className="text-gray-400 mr-2">{i + 1}.</span>
                      {d.city}, {d.state}
                    </span>
                    <span className="font-bold" style={{ color: HARDNESS_COLORS[d.hardnessClass] }}>
                      {d.hardnessPpm} mg/L
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* City Lookup */}
        <section className="max-w-6xl mx-auto px-4 mb-10" id="lookup">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-blue-900 mb-2">Look Up Your City</h2>
            <p className="text-gray-500 text-sm mb-4">
              Enter your city or state abbreviation to see water hardness and plumbing risk data.
            </p>
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={lookupCity}
                onChange={(e) => setLookupCity(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                placeholder="e.g., Phoenix or AZ"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Search by city name or state"
              />
              <button
                onClick={handleLookup}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-colors"
              >
                Look Up
              </button>
            </div>
            {lookupResult && lookupResult !== 'not found' && (
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-blue-900">{lookupResult.city}, {lookupResult.state}</h3>
                    <p className="text-sm text-gray-500">{lookupResult.waterUtility}</p>
                  </div>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: HARDNESS_COLORS[lookupResult.hardnessClass] }}
                  >
                    {lookupResult.hardnessClass}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <div>
                    <p className="text-xs text-gray-400">Hardness</p>
                    <p className="font-bold text-gray-800">{lookupResult.hardnessPpm} mg/L</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Risk Score</p>
                    <p className="font-bold" style={{ color: RISK_COLORS[lookupResult.riskClass] }}>
                      {lookupResult.riskScore}/10 ({lookupResult.riskClass})
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Infrastructure</p>
                    <p className="font-bold text-gray-800 capitalize">{lookupResult.infraClass}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Winter Risk</p>
                    <p className="font-bold text-gray-800 capitalize">{lookupResult.winterRisk}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{lookupResult.implication}</p>
                <p className="text-xs text-gray-400 mb-2">Common failure: {lookupResult.dominantFailure}</p>
                <Link
                  href={`/${buildSlug(cityToSlug(lookupResult.city), 'emergency')}`}
                  className="inline-block text-sm text-blue-600 hover:underline font-bold"
                >
                  Find a plumber in {lookupResult.city} →
                </Link>
              </div>
            )}
            {lookupResult === 'not found' && (
              <p className="text-sm text-gray-500">
                No matching city found. Try a different search term, or browse the full table below.
              </p>
            )}
          </div>
        </section>

        {/* Data Table */}
        <section className="max-w-6xl mx-auto px-4 mb-10" id="data">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">Full City Database</h2>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search city or state…"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Search cities"
            />
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Filter by hardness class"
            >
              <option value="All">All hardness levels</option>
              <option value="Soft">Soft (0–60)</option>
              <option value="Moderately Hard">Moderately Hard (61–120)</option>
              <option value="Hard">Hard (121–180)</option>
              <option value="Very Hard">Very Hard (181+)</option>
            </select>
          </div>

          <p className="text-sm text-gray-500 mb-2">
            Showing {filteredData.length} of {findings.totalCities} cities
          </p>

          {/* Table */}
          <div className="overflow-x-auto bg-white rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  {[
                    { key: 'city', label: 'City', sortable: true },
                    { key: 'state', label: 'State', sortable: true },
                    { key: 'hardnessPpm', label: 'Hardness (mg/L)', sortable: true },
                    { key: 'hardnessClass', label: 'Classification', sortable: true },
                    { key: 'infraClass', label: 'Infrastructure', sortable: true },
                    { key: 'winterRisk', label: 'Winter Risk', sortable: true },
                    { key: 'riskScore', label: 'Risk Score', sortable: true },
                  ].map(col => (
                    <th
                      key={col.key}
                      className={`px-3 py-3 text-left font-bold ${col.sortable ? 'cursor-pointer hover:bg-gray-200' : ''}`}
                      onClick={() => col.sortable && handleSort(col.key)}
                    >
                      {col.label}
                      {sortKey === col.key && (
                        <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.slice(0, 100).map((row) => (
                  <tr key={row.slug} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium text-gray-800">
                      <Link
                        href={`/${buildSlug(row.slug, 'emergency')}`}
                        className="text-blue-600 hover:underline no-underline"
                      >
                        {row.city}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-gray-600">{row.state}</td>
                    <td className="px-3 py-2 font-bold text-gray-800">{row.hardnessPpm}</td>
                    <td className="px-3 py-2">
                      <span
                        className="inline-block px-2 py-0.5 rounded text-xs font-bold text-white"
                        style={{ backgroundColor: HARDNESS_COLORS[row.hardnessClass] }}
                      >
                        {row.hardnessClass}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-600 capitalize">{row.infraClass}</td>
                    <td className="px-3 py-2 text-gray-600 capitalize">{row.winterRisk}</td>
                    <td className="px-3 py-2">
                      <span className="font-bold" style={{ color: RISK_COLORS[row.riskClass] }}>
                        {row.riskScore}/10
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredData.length > 100 && (
            <p className="text-sm text-gray-500 mt-2">
              Showing first 100 results. Use search to narrow down.
            </p>
          )}
        </section>

        {/* Regional Analysis */}
        <section className="max-w-6xl mx-auto px-4 mb-10">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">Regional Patterns</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-bold text-gray-700 mb-3">Average Hardness by Region</h3>
              <div className="space-y-3">
                {findings.regionalAverages.map(r => (
                  <div key={r.region}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">{r.region}</span>
                      <span className="font-bold text-gray-800">{r.avgHardness} mg/L ({r.cityCount} cities)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(r.avgHardness / findings.max) * 100}%`,
                          backgroundColor: HARDNESS_COLORS[classifyHardness(r.avgHardness)]
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-bold text-gray-700 mb-3">Top States by Average Hardness (2+ cities)</h3>
              <ol className="space-y-2">
                {findings.stateAverages.map((s, i) => (
                  <li key={s.state} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">
                      <span className="text-gray-400 mr-2">{i + 1}.</span>
                      {s.state} ({s.cityCount} cities)
                    </span>
                    <span className="font-bold" style={{ color: HARDNESS_COLORS[classifyHardness(s.avgHardness)] }}>
                      {s.avgHardness} mg/L avg
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* Methodology */}
        <section className="max-w-4xl mx-auto px-4 mb-10">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">Methodology & Data Limitations</h2>
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 text-gray-700 leading-relaxed">
            <div>
              <h3 className="font-bold text-blue-900 mb-1">Data Source</h3>
              <p className="text-sm">
                The water hardness values in this dataset were compiled from municipal water utility consumer
                confidence reports, EPA Safe Drinking Water Information System (SDWIS) data, and YoHomeFix's
                city-level plumbing infrastructure assessments conducted during 2024–2026. Each value represents
                a representative hardness level for the municipal water system serving that city.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-blue-900 mb-1">Unit of Measurement</h3>
              <p className="text-sm">
                Hardness is expressed in milligrams per liter (mg/L) as calcium carbonate (CaCO₃) equivalent,
                the standard unit used by the U.S. Geological Survey (USGS) and EPA for water hardness reporting.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-blue-900 mb-1">Classification System</h3>
              <p className="text-sm">
                Cities are classified using the USGS-aligned hardness scale:
              </p>
              <ul className="text-sm mt-2 space-y-1 ml-4 list-disc">
                <li><strong>Soft:</strong> 0–60 mg/L CaCO₃</li>
                <li><strong>Moderately Hard:</strong> 61–120 mg/L CaCO₃</li>
                <li><strong>Hard:</strong> 121–180 mg/L CaCO₃</li>
                <li><strong>Very Hard:</strong> 181+ mg/L CaCO₃</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-blue-900 mb-1">Plumbing Risk Score</h3>
              <p className="text-sm">
                The composite plumbing risk score (3–10) combines three factors that independently affect
                plumbing failure frequency: infrastructure age class (aging/mixed/modern), winter freeze risk
                (high/medium/low), and water hardness class. A higher score indicates greater cumulative risk
                of plumbing failures. This score is a comparative index, not a probability prediction.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-blue-900 mb-1">Limitations</h3>
              <ul className="text-sm mt-2 space-y-1 ml-4 list-disc">
                <li>Hardness values are representative of the municipal system and may vary by neighborhood, season, or water source.</li>
                <li>Private well water is not represented in this dataset.</li>
                <li>Values may not reflect real-time conditions; municipal hardness can fluctuate with source water changes.</li>
                <li>The plumbing risk score is a relative index for comparison purposes, not a clinical or engineering assessment of any individual property.</li>
                <li>Infrastructure classifications are based on dominant housing stock characteristics and may not reflect newer or recently renovated areas.</li>
              </ul>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/editorial-policy" className="text-sm text-blue-600 hover:underline">Editorial Policy</Link>
              <Link href="/sources" className="text-sm text-blue-600 hover:underline">Sources & Methodology</Link>
              <Link href="/why-trust-yohomefix" className="text-sm text-blue-600 hover:underline">Why Trust YoHomeFix</Link>
            </div>
          </div>
        </section>

        {/* Plumbing Implications & Commercial Bridge */}
        <section className="max-w-4xl mx-auto px-4 mb-10">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">What Water Hardness Means for Your Home</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(HARDNESS_IMPLICATIONS).map(([cls, text]) => (
              <div key={cls} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-block w-4 h-4 rounded" style={{ backgroundColor: HARDNESS_COLORS[cls] }}></span>
                  <h3 className="font-bold text-blue-900">{cls}</h3>
                </div>
                <p className="text-sm text-gray-600">{text}</p>
              </div>
            ))}
          </div>
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-5 mt-6">
            <h3 className="font-bold text-blue-900 mb-2">Related Plumbing Services</h3>
            <p className="text-sm text-gray-600 mb-3">
              If hard water is affecting your home's plumbing, these services can help:
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/plumber-usa" className="text-sm text-blue-600 hover:underline font-bold">Find a plumber in your city →</Link>
              <Link href="/plumbing-cost-guide" className="text-sm text-blue-600 hover:underline font-bold">Plumbing cost guide →</Link>
              <Link href="/guides/hard-water-effects-on-plumbing" className="text-sm text-blue-600 hover:underline font-bold">Hard water effects guide →</Link>
              <Link href="/guides/water-heater-maintenance-guide" className="text-sm text-blue-600 hover:underline font-bold">Water heater maintenance →</Link>
            </div>
          </div>
        </section>

        {/* Embed Widget */}
        <section className="max-w-4xl mx-auto px-4 mb-10">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">Embed This Lookup</h2>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-4">
              Add a YoHomeFix water hardness lookup to your website. The widget is free to embed and
              links back to this research page with a "Powered by YoHomeFix" attribution.
            </p>
            <div className="bg-gray-900 rounded-lg p-4 mb-4 overflow-x-auto">
              <code className="text-green-400 text-xs whitespace-pre">{embedCode}</code>
            </div>
            <p className="text-xs text-gray-400">
              The embed loads in an iframe and does not require JavaScript on the host page.
              Attribution is visible and links naturally to the canonical research asset.
            </p>
          </div>
        </section>

        {/* Cite This Research */}
        <section className="max-w-4xl mx-auto px-4 mb-10">
          <div className="bg-gray-100 rounded-xl p-5">
            <h2 className="text-lg font-bold text-blue-900 mb-2">Cite This Research</h2>
            <p className="text-sm text-gray-600 mb-2">
              YoHomeFix. (2026). <em>US City Water Hardness & Plumbing Risk Index</em>.
              Retrieved from {canonical}
            </p>
            <p className="text-xs text-gray-400">
              Dataset licensed under Creative Commons Attribution 4.0 (CC BY 4.0).
              Free to share and adapt with attribution.
            </p>
          </div>
        </section>

        <Author />
        <Footer />
      </div>
    </>
  );
}
