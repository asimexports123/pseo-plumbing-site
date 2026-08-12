import { NextResponse } from 'next/server';

// ── Controlled crawler policy (origin-side fallback) ────────────
// Cloudflare should be the first line of bot and rate-limit control.
// This middleware is a fast, stateless second line that only does
// string checks, method checks, and ISR-route guards.

// BLOCKED: proactive training / aggressive crawlers and scrapers
const BLOCKED_BOTS = [
  'gptbot',
  'claudebot',
  'bytespider',
  'applebot',
  'amazonbot',
  'google-extended',
  'anthropic-ai',
  'claude-web',
  'cohere-ai',
  'ai2bot',
  // Meta/Facebook active scrapers
  'meta-webindexer',
  'facebookexternalhit',
  'facebot',
  // SEO / content scrapers
  'ahrefsbot',
  'semrushbot',
  'dotbot',
  'mj12bot',
  'blexbot',
  'siteauditbot',
  'linkdexbot',
  'sitebot',
  'turnitinbot',
  'uaslinkchecker',
  'wotbox',
  'zoominfobot',
  'seokicks',
  'seokicks-robot',
  'sistrix',
  'sistrix-visibility',
  'yandexbot',
  'baiduspider',
  'sogou',
  'exabot',
  'petalbot',
  'seznam',
  'sputnikbot',
  'mojeekbot',
  'yacy',
  'ia_archiver',
  'archiver',
  'twingly',
  'vegebot',
  'velenpublicwebcrawler',
  'webwiki',
  'wikido',
  'xenu',
  'duckduckbot',
  'slurp',
  'teoma',
  // HTTP libraries / scrapers
  'curl',
  'wget',
  'python-requests',
  'python-urllib',
  'scrapy',
  'httpx',
  'go-http-client',
  'java/',
  'okhttp',
  'libwww',
  'perl/',
  'ruby',
  'node-fetch',
  'axios/',
  'got/',
  'aiohttp',
  'mechanize',
  'phantomjs',
  'selenium',
  'puppeteer',
];

// ALLOWED: search-engine crawlers
const ALLOWED_SEARCH_BOTS = [
  'googlebot',
  'googlebot-image',
  'googlebot-news',
  'googlebot-video',
  'googleother',
  'bingbot',
  'mediapartners-google',
  'apis-google',
  'adsbot-google',
  'google-inspectiontool',
  'chrome-lighthouse',
];

// ALLOWED: user-driven AI fetchers (GET/HEAD only, rate-limited at Cloudflare)
const ALLOWED_AI_FETCHERS = [
  'chatgpt-user',
  'perplexitybot',
  'claude-searchbot',
];

const MAX_UA_LENGTH = 256;
const ALLOWED_METHODS = ['GET', 'HEAD'];

// ISR-heavy route patterns — do not let empty/fake UAs trigger writes
const ISR_ROUTE_PATTERNS = [
  /^\/areas\//,
  /^\/plumber-/,
];

const MIN_UA_LENGTH_FOR_ISR = 30;

function isAllowedSearchOrAIBot(ua) {
  if (!ua) return false;
  if (ALLOWED_SEARCH_BOTS.some(bot => ua.includes(bot))) return true;
  if (ALLOWED_AI_FETCHERS.some(bot => ua.includes(bot))) return true;
  if (ua.includes('mozilla/5.0') && /\((windows|macintosh|linux|android|iphone|ipad|x11)/.test(ua)) {
    return true;
  }
  return false;
}

function isAllowedAIFetcher(ua) {
  return ua ? ALLOWED_AI_FETCHERS.some(bot => ua.includes(bot)) : false;
}

function blockResponse(message, status, extraHeaders = {}) {
  return new NextResponse(message, {
    status,
    headers: {
      'Content-Type': 'text/plain',
      'X-Robots-Tag': 'noindex, nofollow',
      'Vary': 'User-Agent',
      ...extraHeaders,
    },
  });
}

export function middleware(request) {
  const userAgent = (request.headers.get('user-agent') || '').toLowerCase();
  const path = request.nextUrl.pathname || '';
  const method = request.method;

  // Skip ISR guard for Next.js data/prefetch requests — OpenNext rewrites
  // _next/data/{buildId}/plumber-* to /plumber-* before middleware sees it,
  // so we check the original URL to detect data requests and let them through.
  const originalUrl = request.url || '';
  const isDataRequest = originalUrl.includes('/_next/data/');

  // 1. Fast block for known bad crawlers and HTTP libraries.
  //    Exempt the homepage (static, no ISR cost) to prevent cached
  //    text/plain 403 responses from being served to real users.
  //    Error responses use no-store to prevent edge caching.
  const isHomepage = path === '/';
  if (!isHomepage && BLOCKED_BOTS.some(bot => userAgent.includes(bot))) {
    return blockResponse('Access Denied', 403, { 'Cache-Control': 'no-store, no-cache, must-revalidate' });
  }

  // 2. Allowed AI fetchers: GET/HEAD only, UA length sanity.
  //    Rate limiting is intentionally handled at Cloudflare to avoid
  //    per-request memory and CPU cost in this function.
  if (isAllowedAIFetcher(userAgent)) {
    if (!ALLOWED_METHODS.includes(method)) {
      return blockResponse('Method Not Allowed', 405, { 'Allow': 'GET, HEAD' });
    }
    if (userAgent.length > MAX_UA_LENGTH) {
      return blockResponse('Bad Request', 400);
    }
  }

  // 3. ISR route protection — only real browsers, search, and allowed AI
  //    Error responses use no-store to prevent edge caching of text/plain.
  const isISRRoute = ISR_ROUTE_PATTERNS.some(pattern => pattern.test(path));
  if (isISRRoute && !isDataRequest && !isAllowedSearchOrAIBot(userAgent)) {
    return blockResponse('Forbidden', 403, { 'Cache-Control': 'no-store, no-cache, must-revalidate' });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|_next/data|favicon.ico|favicon-|apple-touch-icon|og-image|nationwide-places.json|zcta-search.json|yohomefixindexnow2025|robots.txt|sitemap.xml).*)',
  ],
};
