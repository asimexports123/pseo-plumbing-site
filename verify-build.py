import re, html, sys

pages = [
    'plumber-new-york-emergency',
    'plumber-los-angeles-emergency',
    'plumber-chicago-emergency',
    'plumber-houston-emergency',
    'plumber-miami-emergency',
]

def check(path):
    text = open(path, 'r', encoding='utf-8').read()
    title = re.search(r'<title[^>]*>(.*?)</title>', text, re.S)
    desc = re.search(r'<meta name="description" content="(.*?)"', text, re.S)
    tel1 = len(re.findall(r'href="tel:1"', text))
    raw_phone = bool(re.search(r'tel:\+?1?844', text)) or '844-934-4386' in text or '(844) 934-4386' in text
    sticky = 'mobile-sticky-cta' in text
    call_now = text.count('CALL NOW')
    print(f'  path: {path}')
    print(f'  title: {html.unescape(title.group(1)) if title else "NOT FOUND"}')
    print(f'  desc:  {html.unescape(desc.group(1))[:140] if desc else "NOT FOUND"}...')
    print(f'  tel:1 links: {tel1}, raw phone in html: {raw_phone}, sticky class: {sticky}, "CALL NOW" count: {call_now}')
    return bool(title and desc and tel1 and not raw_phone and sticky)

ok = True
for p in pages:
    print(f'{p}:')
    if not check(f'.next/server/pages/{p}.html'):
        ok = False
    print()

sys.exit(0 if ok else 1)
