import re, html, sys
from urllib.request import Request, urlopen

BASE = 'https://yohomefix.com'
BUST = '?ver=deploy-20260730'
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

pages = [
    'plumber-oklahoma-city-drain-cleaning',
    'plumber-baltimore-drain-cleaning',
    'plumber-san-diego-emergency',
    'plumber-phoenix-emergency',
    'plumber-san-antonio-emergency',
]

def check(slug):
    url = f'{BASE}/{slug}{BUST}'
    req = Request(url, headers={'User-Agent': UA})
    text = urlopen(req, timeout=20).read().decode('utf-8', errors='ignore')
    title = re.search(r'<title[^>]*>(.*?)</title>', text, re.S)
    h1 = re.search(r'<h1[^>]*class="[^"]*text-3xl[^"]*"[^>]*>(.*?)</h1>', text, re.S)
    if not h1:
        h1 = re.search(r'<h1[^>]*>(.*?)</h1>', text, re.S)
    canonical = re.search(r'<link rel="canonical" href="([^"]+)"', text, re.S)
    desc = re.search(r'<meta name="description" content="(.*?)(?="(?:\s|>))"', text, re.S)
    viewport = bool(re.search(r'<meta[^>]+name="viewport"', text, re.I))
    tel1 = len(re.findall(r'href="tel:1"', text))
    raw_phone = bool(re.search(r'tel:\+?1?844', text)) or '844-934-4386' in text or '(844) 934-4386' in text
    sticky = 'mobile-sticky-cta' in text
    marketcall = 'mc-tracking-phone' in text or 'marketcall' in text.lower()
    call_now = text.count('CALL NOW')
    print(f'{slug}:')
    print(f'  url:     {url}')
    print(f'  title:   {html.unescape(title.group(1)) if title else "NOT FOUND"}')
    print(f'  h1:      {html.unescape(re.sub(r"<[^>]+>", "", h1.group(1)).strip()) if h1 else "NOT FOUND"}')
    print(f'  canonical: {canonical.group(1) if canonical else "NOT FOUND"}')
    print(f'  desc:    {html.unescape(desc.group(1))[:140] if desc else "NOT FOUND"}...')
    print(f'  viewport: {viewport}, tel:1 links: {tel1}, raw phone: {raw_phone}, sticky class: {sticky}, marketcall: {marketcall}, "CALL NOW" count: {call_now}')
    return bool(title and h1 and canonical and desc and tel1 and not raw_phone and sticky and marketcall)

ok = True
for p in pages:
    if not check(p):
        ok = False
    print()

sys.exit(0 if ok else 1)
