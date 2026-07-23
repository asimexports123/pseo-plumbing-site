import { useState, useMemo, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { buildResearchDataset, classifyHardness, HARDNESS_COLORS, HARDNESS_IMPLICATIONS, RISK_COLORS } from '../../lib/researchData';

const domain = process.env.NEXT_PUBLIC_DOMAIN || 'https://yohomefix.com';

export async function getStaticProps() {
  const dataset = buildResearchDataset();
  return { props: { dataset } };
}

export default function EmbedWidget({ dataset }) {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);

  const handleSearch = useCallback(() => {
    const q = query.toLowerCase().trim();
    if (!q) { setResult(null); return; }
    const match = dataset.find(d =>
      d.city.toLowerCase().includes(q) || d.state.toLowerCase().includes(q)
    );
    setResult(match || 'not found');
  }, [query, dataset]);

  const canonical = `${domain}/research/us-water-hardness-plumbing-risk`;

  return (
    <>
      <Head>
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href={canonical} />
      </Head>
      <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', padding: '16px', maxWidth: '100%', margin: '0 auto' }}>
        <div style={{ marginBottom: '12px' }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Enter your city…"
            style={{
              width: '100%',
              padding: '10px 14px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
            aria-label="Search by city name"
          />
        </div>
        <button
          onClick={handleSearch}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '14px',
            cursor: 'pointer',
            marginBottom: '12px',
          }}
        >
          Look Up Water Hardness
        </button>
        {result && result !== 'not found' && (
          <div style={{ padding: '14px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <strong style={{ color: '#1e3a8a', fontSize: '15px' }}>{result.city}, {result.state}</strong>
              <span style={{
                padding: '2px 10px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 'bold',
                color: '#fff',
                backgroundColor: HARDNESS_COLORS[result.hardnessClass],
              }}>
                {result.hardnessClass}
              </span>
            </div>
            <div style={{ fontSize: '13px', color: '#4b5563', marginBottom: '6px' }}>
              <strong>{result.hardnessPpm} mg/L</strong> CaCO₃ &middot; Risk: {result.riskScore}/10 ({result.riskClass})
            </div>
            <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', lineHeight: '1.4' }}>
              {result.implication}
            </p>
            <Link
              href={`/${result.slug}-emergency`}
              style={{ fontSize: '12px', color: '#2563eb', textDecoration: 'none', fontWeight: 'bold' }}
            >
              Find a plumber in {result.city} →
            </Link>
          </div>
        )}
        {result === 'not found' && (
          <p style={{ fontSize: '13px', color: '#6b7280', textAlign: 'center' }}>
            City not found. Try a different search.
          </p>
        )}
        <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '11px', color: '#9ca3af' }}>
          Powered by{' '}
          <a
            href={canonical}
            style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 'bold' }}
            rel="noopener"
          >
            YoHomeFix
          </a>
        </div>
      </div>
    </>
  );
}
