'use client';
import { useState, useEffect, useCallback } from 'react';
import { PHONE_NUMBER, PHONE_DISPLAY, SERVICES } from '../lib/cities';

// ── Call tracking helper ─────────────────────────────────────
function trackEvent(action, label) {
  try {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', action, { event_label: label });
    }
    const key = 'yhf_conversion_events';
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.push({ action, label, ts: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(existing.slice(-50)));
  } catch (_) {}
}

// ── 1. TRUST BAR ─────────────────────────────────────────────
export function TrustBar({ cityName }) {
  return (
    <div className="bg-blue-950 text-white py-2 px-4">
      <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-x-6 gap-y-1 text-xs font-semibold">
        <span>✅ Licensed & Insured</span>
        <span>⏱️ 60-Min Response Target</span>
        <span>💰 Upfront Pricing — No Surprises</span>
        <span>📞 Live Dispatcher 24/7</span>
        {cityName && <span>📍 Serving {cityName}</span>}
      </div>
    </div>
  );
}

// ── 2. INLINE QUOTE FORM ─────────────────────────────────────
export function QuoteForm({ cityName, defaultService }) {
  const [service, setService] = useState(defaultService || 'emergency');
  const [submitted, setSubmitted] = useState(false);

  function handleCall() {
    trackEvent('quote_form_call', `${cityName}-${service}`);
    setSubmitted(true);
    window.location.href = `tel:${PHONE_NUMBER}`;
  }

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center mb-10">
        <div className="text-3xl mb-2">📞</div>
        <p className="font-bold text-green-800 text-lg">Connecting you now...</p>
        <p className="text-green-700 text-sm mt-1">A live dispatcher will answer immediately.</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-900 to-blue-800 text-white rounded-2xl p-6 mb-10">
      <h2 className="text-xl font-extrabold mb-1">Get a Free Quote in {cityName || 'Your City'}</h2>
      <p className="text-white text-sm mb-4">Select your service — a live dispatcher connects you in seconds</p>
      <div className="flex flex-col sm:flex-row gap-3">
        <label htmlFor="quote-service" className="sr-only">Select plumbing service</label>
        <select
          id="quote-service"
          value={service}
          onChange={(e) => setService(e.target.value)}
          className="flex-1 bg-white text-gray-800 rounded-xl px-4 py-3 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          {SERVICES.map((s) => (
            <option key={s.slug} value={s.slug}>{s.name}</option>
          ))}
        </select>
        <button
          onClick={handleCall}
          className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl font-extrabold text-sm transition-colors whitespace-nowrap"
          aria-label="Call emergency dispatch"
        >
          📞 Call Now — Free Quote
        </button>
      </div>
      <p className="text-white text-xs mt-3 text-center">No obligation. Upfront pricing before any work begins.</p>
    </div>
  );
}

// ── 3. EXIT INTENT POPUP ─────────────────────────────────────
export function ExitIntentPopup({ cityName, serviceName }) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;
    // Check if already shown this session
    try {
      if (sessionStorage.getItem('yhf_exit_shown')) return;
    } catch (_) {}

    let timer;
    function handleMouseLeave(e) {
      if (e.clientY <= 5 && !visible) {
        clearTimeout(timer);
        timer = setTimeout(() => {
          setVisible(true);
          trackEvent('exit_intent_shown', `${cityName}-${serviceName}`);
          try { sessionStorage.setItem('yhf_exit_shown', '1'); } catch (_) {}
        }, 200);
      }
    }

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(timer);
    };
  }, [dismissed, visible, cityName, serviceName]);

  function handleCall() {
    trackEvent('exit_intent_call', `${cityName}-${serviceName}`);
    window.location.href = `tel:${PHONE_NUMBER}`;
  }

  function handleDismiss() {
    setVisible(false);
    setDismissed(true);
    trackEvent('exit_intent_dismissed', `${cityName}-${serviceName}`);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center relative">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-gray-700 hover:text-gray-600 text-xl font-bold"
          aria-label="Close"
        >
          ×
        </button>
        <div className="text-4xl mb-3">🔧</div>
        <h2 className="text-xl font-extrabold text-blue-900 mb-2">
          Wait — Still Need a Plumber in {cityName || 'Your Area'}?
        </h2>
        <p className="text-gray-600 text-sm mb-5">
          Our dispatchers are standing by right now. Call in the next 5 minutes and we&apos;ll prioritize your job for same-day service.
        </p>
        <div className="flex flex-col gap-3">
          <a
            href={`tel:${PHONE_NUMBER}`}
            onClick={handleCall}
            className="bg-red-600 hover:bg-red-500 text-white px-6 py-4 rounded-xl font-extrabold text-lg transition-colors"
            aria-label="Call emergency dispatch"
          >
            📞 Call {PHONE_DISPLAY}
          </a>
          <button
            onClick={handleDismiss}
            className="text-gray-700 text-sm hover:text-gray-600"
          >
            No thanks, I&apos;ll find another plumber
          </button>
        </div>
        <div className="mt-4 flex justify-center gap-4 text-xs text-gray-500">
          <span>✅ Licensed</span>
          <span>⏱️ 60-min response</span>
          <span>📞 Live dispatcher</span>
        </div>
      </div>
    </div>
  );
}

// ── 4. MID-PAGE CTA STRIP ────────────────────────────────────
export function MidPageCTA({ cityName, serviceName }) {
  function handleClick() {
    trackEvent('mid_cta_call', `${cityName}-${serviceName}`);
  }
  return (
    <div className="bg-red-600 text-white rounded-2xl p-5 mb-10 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <p className="font-extrabold text-lg">{serviceName} Help Available Now in {cityName}</p>
        <p className="text-white text-sm">Live dispatcher — no hold music — 60-min response target</p>
      </div>
      <a
        href={`tel:${PHONE_NUMBER}`}
        onClick={handleClick}
        className="bg-white text-red-600 hover:bg-red-50 px-6 py-3 rounded-full font-extrabold whitespace-nowrap transition-colors"
        aria-label="Call emergency dispatch"
      >
        📞 Call Now
      </a>
    </div>
  );
}

