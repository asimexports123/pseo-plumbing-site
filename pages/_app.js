import '../styles/globals.css';
import Head from 'next/head';
import Script from 'next/script';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const GA_ID = 'G-TEKZ2B3NXQ';

const MC_SITE     = '3143';
const MC_CAMPAIGN = '348734';

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
  useEffect(() => {
    if (!GA_ID) return;
    const handleClick = (e) => {
      try {
        const link = e.target.closest('a[href^="tel:"]');
        if (!link) return;
        const href = link.getAttribute('href') || '';
        if (href !== `tel:${'+'}18449344386`) return;
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
        <link rel="preconnect" href="https://js.marketcall.com" />
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

      {/* MarketCall Dynamic Call Tracking — init config before library loads */}
      <Script id="mc-config" strategy="afterInteractive">
        {`
          window._mc = window._mc || {};
          window._mc.site     = '${MC_SITE}';
          window._mc.campaign = '${MC_CAMPAIGN}';
          window._mc.phone    = '(844) 934-4386';
          window._mc.subid    = (new URLSearchParams(window.location.search)).get('subid') || '';
        `}
      </Script>
      <Script
        id="mc-tracking"
        src="https://js.marketcall.com/call_tracking.js"
        strategy="afterInteractive"
        onError={() => {
          // MarketCall is optional; suppress network errors so they do not block rendering.
          try {
            if (typeof window !== 'undefined' && window.console) {
              console.warn('MarketCall tracking script failed to load (optional).');
            }
          } catch (_) {}
        }}
      />

      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
