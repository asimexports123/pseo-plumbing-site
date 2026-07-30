import '../styles/globals.css';
import Head from 'next/head';
import Script from 'next/script';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const GA_ID = 'G-TEKZ2B3NXQ';

const MC_SITE       = '3143';
const MC_CAMPAIGN   = '348734';
const MC_SCRIPT_URL = 'https://marketcall.com/js/mc-calltracking.js';

// Build MarketCall attribution parameters from URL and browser context
function buildMcAttribution() {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const pathname = window.location.pathname || '';
  const referrer = document.referrer || '';
  return {
    subid:  params.get('subid')  || pathname,
    subid1: params.get('utm_source')  || referrer,
    subid2: params.get('utm_medium')   || '',
    subid3: params.get('utm_campaign') || '',
    subid4: params.get('utm_term')     || '',
    subid5: params.get('gclid')        || '',
    subid6: params.get('fbclid')       || '',
  };
}

// Sync a tracking number to all visible tel:/sms: links (href only, never text)
function syncTrackingNumber(number) {
  if (typeof window === 'undefined' || !number || number === '1') return;
  document.querySelectorAll('a[href^="tel:"]').forEach(function(a) {
    if (a.id === 'mc-tracking-phone') return;
    a.setAttribute('href', 'tel:' + number);
  });
  document.querySelectorAll('a[href^="sms:"]').forEach(function(a) {
    if (a.id === 'mc-tracking-phone') return;
    a.setAttribute('href', 'sms:' + number);
  });
}

// Request tracking number from MarketCall using callback API only.
// We pass a selector pointing to a HIDDEN element so Marketcall's DOM replacement
// function only touches the hidden element (not visible buttons). We also use the
// callback to get the tracking number and sync it to visible links ourselves.
function requestMcTrackingNumber() {
  if (typeof window === 'undefined' || typeof window.mcc !== 'function') return;
  try {
    window.mcc('requestTrackingNumber', {
      campaign: MC_CAMPAIGN,
      selector: [{ type: 'dom', value: '#mc-tracking-phone' }],
      callback: function(reservation) {
        try {
          var num = reservation && reservation.tracking_number && reservation.tracking_number.full_number;
          if (num) syncTrackingNumber(num);
        } catch(_) {}
      },
      ...buildMcAttribution(),
    });
  } catch (_) {}
}

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  // GA4 — SPA route-change page_view tracking
  useEffect(() => {
    if (!GA_ID) return;
    const handleRouteChange = (url) => {
      try {
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('config', GA_ID, {
            page_path: url,
            page_location: window.location.origin + url,
          });
          window.gtag('event', 'page_view', {
            page_path: url,
            page_location: window.location.origin + url,
            send_to: GA_ID,
          });
        }
      } catch (_) {}
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  // GA4 — global tel: click delegation (catches any tel: link without explicit tracking)
  // Handles both original and MarketCall-replaced phone numbers
  useEffect(() => {
    if (!GA_ID) return;
    const handleClick = (e) => {
      try {
        const link = e.target.closest('a[href^="tel:"]');
        if (!link) return;
        const trackLabel = link.getAttribute('data-track');
        if (trackLabel) return; // already tracked by explicit handler
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'call_click', {
            cta_location: 'untracked',
            page_path: window.location.pathname,
            page_location: window.location.href,
          });
        }
      } catch (_) {}
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Populate tel:1 / sms:1 placeholder hrefs with real number (client-side only)
  // This runs immediately so click-to-call works even if MarketCall fails to load.
  // MarketCall will later call our callback with the tracking number, and we sync
  // that tracking number to all visible links — but visible TEXT is never touched.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    var p = ['+1', '844', '934', '4386'].join('');
    document.querySelectorAll('a[href="tel:1"]').forEach(function(a) {
      a.setAttribute('href', 'tel:' + p);
      // Save original visible text so we can restore it if anything overwrites it
      if (!a.getAttribute('data-orig-text')) {
        a.setAttribute('data-orig-text', a.innerHTML);
      }
    });
    document.querySelectorAll('a[href="sms:1"]').forEach(function(a) {
      a.setAttribute('href', 'sms:' + p);
      if (!a.getAttribute('data-orig-text')) {
        a.setAttribute('data-orig-text', a.innerHTML);
      }
    });
    // Also populate the hidden tracking element
    var trackEl = document.getElementById('mc-tracking-phone');
    if (trackEl) trackEl.setAttribute('href', 'tel:' + p);
  }, [router.asPath]);

  // DEFENSE-IN-DEPTH: MutationObserver on visible tel:/sms: links.
  // If Marketcall (or any script) overwrites visible text content, instantly restore
  // the original button text ("Call Now", "Connect Now", phone icon, etc.).
  // This catches edge cases where Marketcall's server config overrides our selector.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    function restoreText(link) {
      var orig = link.getAttribute('data-orig-text');
      if (!orig) {
        orig = link.innerHTML;
        link.setAttribute('data-orig-text', orig);
      }
      if (link.innerHTML !== orig) {
        link.innerHTML = orig;
      }
    }
    function scanAndRestore() {
      document.querySelectorAll('a[href^="tel:"], a[href^="sms:"]').forEach(function(a) {
        if (a.id === 'mc-tracking-phone') return;
        if (!a.getAttribute('data-orig-text')) {
          a.setAttribute('data-orig-text', a.innerHTML);
        }
        restoreText(a);
      });
    }
    scanAndRestore();
    // Observe the entire body for childList/characterData changes on tel: links
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(m) {
        // Check if the mutation target is inside a tel: link
        var link = null;
        if (m.target && m.target.closest) {
          link = m.target.closest('a[href^="tel:"], a[href^="sms:"]');
        }
        if (!link && m.target && m.target.tagName === 'A') {
          link = m.target;
        }
        if (link && link.id !== 'mc-tracking-phone') {
          restoreText(link);
        }
        // Also handle newly added nodes
        if (m.addedNodes) {
          m.addedNodes.forEach(function(node) {
            if (node.nodeType === 1) {
              if (node.tagName === 'A' && (node.href && (node.href.indexOf('tel:') === 0 || node.href.indexOf('sms:') === 0))) {
                if (!node.getAttribute('data-orig-text')) {
                  node.setAttribute('data-orig-text', node.innerHTML);
                }
                observer.observe(node, { childList: true, characterData: true, subtree: true });
                restoreText(node);
              }
              node.querySelectorAll && node.querySelectorAll('a[href^="tel:"], a[href^="sms:"]').forEach(function(a) {
                if (a.id === 'mc-tracking-phone') return;
                if (!a.getAttribute('data-orig-text')) {
                  a.setAttribute('data-orig-text', a.innerHTML);
                }
                observer.observe(a, { childList: true, characterData: true, subtree: true });
                restoreText(a);
              });
            }
          });
        }
      });
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    // Periodic scan for first 8 seconds to catch all async replacements
    var interval = setInterval(scanAndRestore, 200);
    var stopTimer = setTimeout(function() { clearInterval(interval); }, 8000);
    return function() {
      observer.disconnect();
      clearInterval(interval);
      clearTimeout(stopTimer);
    };
  }, [router.asPath]);

  // MarketCall — re-request tracking number after SPA route changes and
  // after dynamic components hydrate (QuoteForm, MidPageCTA, ExitIntentPopup)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Initial request (covers server-rendered tel: links)
    requestMcTrackingNumber();
    // Delayed re-request (covers dynamically imported components)
    const timer = setTimeout(requestMcTrackingNumber, 2500);
    return () => clearTimeout(timer);
  }, [router.asPath]);

  return (
    <>
      <Head>
        {/* Favicons — YoHomeFix branded YH mark */}
        <link rel="icon" href="/favicon.ico?v=2" sizes="any" />
        <link rel="icon" href="/favicon.svg?v=2" type="image/svg+xml" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=2" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=2" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg?v=2" />
        {/* Preconnect to third-party script origins for faster loading */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://marketcall.com" />
        {/* Theme color matches brand blue */}
        <meta name="theme-color" content="#1e3a8a" />
        {/* Prevent zoom on iOS input focus (stops layout shift) */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </Head>

      {/* GA4 — Google Analytics 4 with Measurement ID G-TEKZ2B3NXQ */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { page_path: window.location.pathname, send_page_view: true });
        `}
      </Script>

      {/* Hidden tracking element for MarketCall — never visible to users.
          MarketCall replaces this element's href with the tracking number.
          We then sync that href to all visible tel: links (without touching their text). */}
      <a id="mc-tracking-phone" href="tel:1" style={{ display: 'none' }} aria-hidden="true" tabIndex={-1}>&nbsp;</a>

      {/* MarketCall Dynamic Call Tracking — Official mcc() API */}
      {/* Step 1: Define mcc() queue function and init before script loads */}
      <Script id="mc-init" strategy="afterInteractive">
        {`
          (function(w, d, s, o, f) {
            w[o] = w[o] || function() { (w[o].q = w[o].q || []).push(arguments); };
            var js = d.createElement(s), fjs = d.getElementsByTagName(s)[0];
            js.id = o; js.async = 1; js.src = f;
            fjs.parentNode.insertBefore(js, fjs);
          })(window, document, 'script', 'mcc', '${MC_SCRIPT_URL}');
          (function() {
            mcc('init', {
              site: ${MC_SITE},
              serviceBaseUrl: 'https://www.marketcall.com'
            });
          })();
        `}
      </Script>
      {/* Step 2: Request tracking number — targets ONLY the hidden element.
          Uses callback to get tracking number and sync it to visible links.
          Marketcall's DOM replacement only touches the hidden element. */}
      <Script id="mc-request" strategy="afterInteractive">
        {`
          (function() {
            function syncVisible(number) {
              if (!number || number === '1') return;
              document.querySelectorAll('a[href^="tel:"]').forEach(function(a) {
                if (a.id !== 'mc-tracking-phone') a.setAttribute('href', 'tel:' + number);
              });
              document.querySelectorAll('a[href^="sms:"]').forEach(function(a) {
                if (a.id !== 'mc-tracking-phone') a.setAttribute('href', 'sms:' + number);
              });
            }
            function requestNum() {
              if (typeof mcc !== 'function') return;
              var params = new URLSearchParams(window.location.search);
              mcc('requestTrackingNumber', {
                campaign: '${MC_CAMPAIGN}',
                selector: [{ type: 'dom', value: '#mc-tracking-phone' }],
                callback: function(reservation) {
                  try {
                    var num = reservation && reservation.tracking_number && reservation.tracking_number.full_number;
                    if (num) syncVisible(num);
                  } catch(_) {}
                },
                subid:  params.get('subid')  || window.location.pathname,
                subid1: params.get('utm_source')  || document.referrer || '',
                subid2: params.get('utm_medium')   || '',
                subid3: params.get('utm_campaign') || '',
                subid4: params.get('utm_term')     || '',
                subid5: params.get('gclid')        || '',
                subid6: params.get('fbclid')       || ''
              });
            }
            // Request immediately (queue will process when script loads)
            requestNum();
            // Re-request after 2.5s to catch dynamically loaded React components
            setTimeout(requestNum, 2500);
            // Also sync from hidden element's href as fallback (in case callback doesn't fire)
            function syncFromHidden() {
              var trackEl = document.getElementById('mc-tracking-phone');
              if (!trackEl) return;
              var trackHref = trackEl.getAttribute('href');
              if (!trackHref || trackHref === 'tel:1') return;
              var number = trackHref.replace(/^tel:/, '').replace(/^\+/, '');
              if (!number || number === '1') return;
              syncVisible('+' + number);
            }
            setTimeout(syncFromHidden, 1500);
            setTimeout(syncFromHidden, 3000);
            setTimeout(syncFromHidden, 5000);
          })();
        `}
      </Script>
      {/* Fallback: if MarketCall script fails to load, the useEffect above
          populates tel:1 placeholders with the real number — calls still go through */}
      <Script id="mc-error-handler" strategy="afterInteractive">
        {`
          document.addEventListener('error', function(e) {
            if (e.target && e.target.src && e.target.src.indexOf('mc-calltracking.js') !== -1) {
              try { console.warn('MarketCall tracking script failed to load (optional).'); } catch(_) {}
            }
          }, true);
        `}
      </Script>

      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
