'use client';

import { useState, useRef, useCallback } from 'react';

// ── MarketCall Campaign Configuration ──────────────────────────
// Campaign 348734: "Plumbing Bundle | Inbounds | Dynamic | Pre-Approval"
// This campaign ID is hardcoded — do NOT make it dynamic or reusable
// for other campaigns (Roofing, Electrical, etc.) without a separate
// component instance with its own campaign ID.
const MARKETCALL_CAMPAIGN_ID = '348734';

// ── MarketCall Bootstrap Script ────────────────────────────────
// Verified from the supplied MarketCall landing page for campaign 348734.
// This script:
//   1. Creates window.Marketcall namespace
//   2. Creates Marketcall.Widgets
//   3. Fetches campaign 348734 configuration from MarketCall API
//   4. Dynamically loads the Callback widget
//   5. Creates Marketcall.Widgets.Callback
//   6. Dispatches 'callback_loaded.mc.widget' event
//
// NOT loaded:
//   - landing.js  (link rewriter for MarketCall-hosted pages only)
//   - mclegal.js  (legal disclaimers for MarketCall landing pages only)
const MARKETCALL_BOOTSTRAP_SCRIPT_URL = 'https://www.marketcall.com/js/mclead.js?program_id=348734';

// ── GA4 Event Tracking ─────────────────────────────────────────
// Callback events are tracked SEPARATELY from phone call events.
// Phone CTAs use: 'call_click' (see PlumberPage.trackCall / _app.js)
// Callback uses:  'callback_open', 'callback_submit', 'callback_success', 'callback_error'
//
// These events are NEVER counted as phone calls.
function trackCallbackEvent(action, extra) {
  try {
    if (typeof window !== 'undefined' && window.gtag) {
      const params = {
        campaign_id: MARKETCALL_CAMPAIGN_ID,
        page_path: typeof window !== 'undefined' ? window.location.pathname : '',
        page_location: typeof window !== 'undefined' ? window.location.href : '',
      };
      if (extra) {
        if (extra.city) params.city = extra.city;
        if (extra.service) params.service = extra.service;
        if (extra.zip) params.zip = extra.zip;
      }
      window.gtag('event', action, params);
    }
    const key = 'yhf_callback_events';
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.push({ action, campaign: MARKETCALL_CAMPAIGN_ID, ts: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(existing.slice(-50)));
  } catch (_) {}
}

// ── Singleton script loader ────────────────────────────────────
// Ensures the MarketCall bootstrap script loads only once per page,
// even if multiple CallbackWidget instances are rendered.
let scriptLoadPromise = null;

function loadMarketCallScript() {
  if (scriptLoadPromise) return scriptLoadPromise;
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Cannot load script during SSR'));
  }
  scriptLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${MARKETCALL_BOOTSTRAP_SCRIPT_URL}"]`);
    if (existing) {
      if (existing.dataset.loaded === 'true') {
        resolve();
      } else {
        existing.addEventListener('load', () => {
          existing.dataset.loaded = 'true';
          resolve();
        });
        existing.addEventListener('error', () => {
          scriptLoadPromise = null;
          reject(new Error('MarketCall bootstrap script failed to load'));
        });
      }
      return;
    }
    const script = document.createElement('script');
    script.src = MARKETCALL_BOOTSTRAP_SCRIPT_URL;
    script.async = true;
    script.dataset.marketcallCampaign = MARKETCALL_CAMPAIGN_ID;
    script.addEventListener('load', () => {
      script.dataset.loaded = 'true';
      resolve();
    });
    script.addEventListener('error', () => {
      scriptLoadPromise = null;
      reject(new Error('MarketCall bootstrap script failed to load'));
    });
    document.head.appendChild(script);
  });
  return scriptLoadPromise;
}

// ── Wait for callback_loaded.mc.widget ──────────────────────────
// The MarketCall bootstrap script (mclead.js) dynamically loads the
// callback widget, which dispatches 'callback_loaded.mc.widget' when
// Marketcall.Widgets.Callback is ready. We must wait for this event
// before registering event listeners or calling the API.
let widgetReadyPromise = null;

function waitForCallbackWidget() {
  if (widgetReadyPromise) return widgetReadyPromise;
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Cannot wait for widget during SSR'));
  }
  // If already loaded (e.g. script was loaded by a previous instance)
  if (window.Marketcall && window.Marketcall.Widgets && window.Marketcall.Widgets.Callback) {
    widgetReadyPromise = Promise.resolve();
    return widgetReadyPromise;
  }
  widgetReadyPromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      document.removeEventListener('callback_loaded.mc.widget', handler);
      reject(new Error('Timed out waiting for callback_loaded.mc.widget (10s)'));
    }, 10000);
    const handler = () => {
      clearTimeout(timeout);
      document.removeEventListener('callback_loaded.mc.widget', handler);
      resolve();
    };
    document.addEventListener('callback_loaded.mc.widget', handler);
  });
  return widgetReadyPromise;
}

// ── MarketCall event listener registration ─────────────────────
// Registers listeners for the MarketCall-provided events:
//   shown.mc.panel    → Widget panel opened  → GA4 callback_open
//   hidden.mc.panel   → Widget panel closed  → (no GA4 event)
//   submitted.mc.form → Form submitted       → GA4 callback_submit
//   success.mc.form   → Call request created → GA4 callback_success
//   error.mc.form     → Error creating       → GA4 callback_error
//
// MUST be called AFTER callback_loaded.mc.widget fires.
let eventListenersRegistered = false;

function registerMarketCallEvents(context) {
  if (eventListenersRegistered) return;
  if (typeof window === 'undefined') return;
  if (!window.Marketcall || !window.Marketcall.Widgets || !window.Marketcall.Widgets.Callback) return;

  const cb = window.Marketcall.Widgets.Callback;

  cb.on('shown.mc.panel', () => {
    trackCallbackEvent('callback_open', context);
  });

  cb.on('hidden.mc.panel', () => {
    // Panel closed — no GA4 event needed
  });

  cb.on('submitted.mc.form', () => {
    trackCallbackEvent('callback_submit', context);
  });

  cb.on('success.mc.form', () => {
    trackCallbackEvent('callback_success', context);
  });

  cb.on('error.mc.form', () => {
    trackCallbackEvent('callback_error', context);
  });

  eventListenersRegistered = true;
}

// ── Open the callback panel ────────────────────────────────────
// The dashboard shows: Marketcall.Widgets.Callback.call('79998887766', (e) => console.log(e))
//
// API contract verification:
//   The actual callback widget source code could NOT be retrieved because it is
//   dynamically loaded by mclead.js via a domain-restricted API call. The API
//   response for /api/v1/widget/leads/data returns different content when called
//   from a whitelisted MarketCall landing page vs. from an external domain.
//
//   What we KNOW from the dashboard:
//   - call() is a method on Marketcall.Widgets.Callback
//   - The dashboard example passes a phone number as the first argument
//   - The dashboard example passes a callback function as the second argument
//   - 79998887766 is a FORMAT EXAMPLE, not the YoHomeFix number
//
//   What we CANNOT verify from source:
//   - Whether the first argument is required or optional
//   - Whether calling without arguments opens the panel/form
//   - Whether there is a separate open() or show() method
//
//   SAFE APPROACH:
//   - Do NOT pass a phone number (the user enters their own in the form)
//   - Inspect available methods at runtime and log them for debugging
//   - Try call() without arguments first
//   - If call() throws, log the error and available methods for diagnosis
function openCallbackPanel() {
  if (typeof window === 'undefined') return false;
  if (!window.Marketcall || !window.Marketcall.Widgets || !window.Marketcall.Widgets.Callback) {
    console.error('[CallbackWidget] Marketcall.Widgets.Callback not available');
    return false;
  }

  const cb = window.Marketcall.Widgets.Callback;

  // Log available methods for runtime diagnosis
  const methods = [];
  for (const key in cb) {
    if (typeof cb[key] === 'function') methods.push(key);
  }
  console.log('[CallbackWidget] Marketcall.Widgets.Callback methods:', methods);

  try {
    // Attempt to open the panel without passing a phone number.
    // The user will enter their own phone number in the MarketCall form.
    // If the API requires a phone number, this will throw and we'll
    // log the error for diagnosis.
    cb.call();
    return true;
  } catch (err) {
    console.error('[CallbackWidget] Callback.call() error:', err);
    console.error('[CallbackWidget] If call() requires a phone number argument,');
    console.error('[CallbackWidget] the MarketCall dashboard floating button may');
    console.error('[CallbackWidget] need to be enabled instead of hidden.');
    return false;
  }
}

// ── CallbackWidget Component ───────────────────────────────────
// Props:
//   cityName    — string (for GA4 attribution)
//   serviceName — string (for GA4 attribution)
//   zip         — string (optional, for ZIP pages)
//   variant     — 'secondary' (default) | 'hero' — controls styling
//
// Usage (when ready to integrate):
//   <CallbackWidget cityName="Oklahoma City" serviceName="Emergency Plumber" />
//
// The component renders a "Request a Callback" button. When clicked,
// it loads the MarketCall bootstrap script (mclead.js) lazily, waits for
// the callback_loaded.mc.widget event, registers all 5 MarketCall event
// listeners for GA4 tracking, then opens the callback panel.
//
// Loading sequence:
//   1. User clicks "Request a Callback"
//   2. Load mclead.js?program_id=348734 (lazy, singleton)
//   3. Wait for callback_loaded.mc.widget event
//   4. Register: shown.mc.panel, hidden.mc.panel, submitted.mc.form,
//      success.mc.form, error.mc.form → GA4 events
//   5. Call Marketcall.Widgets.Callback.call() to open the panel
//   6. User enters their phone number in the MarketCall form
//   7. MarketCall creates the callback request for campaign 348734
export default function CallbackWidget({ cityName, serviceName, zip, variant = 'secondary' }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const contextRef = useRef({ city: cityName, service: serviceName, zip });

  const handleClick = useCallback(() => {
    setError(false);

    setLoading(true);

    // Step 1: Load the MarketCall bootstrap script (mclead.js)
    loadMarketCallScript()
      .then(() => {
        // Step 2: Wait for callback_loaded.mc.widget event
        return waitForCallbackWidget();
      })
      .then(() => {
        // Step 3: Register all 5 MarketCall events for GA4 tracking
        registerMarketCallEvents(contextRef.current);

        // Step 4: Open the callback panel
        // Track the button click as a callback_open intent in GA4
        // (the shown.mc.panel event will also fire and trigger callback_open)
        const success = openCallbackPanel();
        if (!success) {
          setError(true);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('[CallbackWidget] Error:', err.message);
        setError(true);
        setLoading(false);
      });
  }, []);

  // Styling variants
  const baseClasses = 'inline-flex items-center gap-2 rounded-full font-bold text-sm transition-colors no-underline';
  const variantClasses = variant === 'hero'
    ? 'bg-gray-100 hover:bg-gray-200 text-gray-800 px-5 py-2'
    : 'bg-gray-100 hover:bg-gray-200 text-gray-800 px-5 py-2';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`${baseClasses} ${variantClasses} ${loading ? 'opacity-60 cursor-wait' : ''}`}
      aria-label="Request a callback from a plumber"
      data-campaign={MARKETCALL_CAMPAIGN_ID}
    >
      {loading ? (
        <>
          <span className="animate-pulse">⏳</span> Connecting…
        </>
      ) : (
        <>
          <span aria-hidden="true">📞</span> Request a Callback
        </>
      )}
      {error && (
        <span className="sr-only">Callback unavailable — please call instead</span>
      )}
    </button>
  );
}
