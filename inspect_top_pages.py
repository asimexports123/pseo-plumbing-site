import re
import html
import requests

slugs = [
    'plumber-oklahoma-city-drain-cleaning',
    'plumber-baltimore-drain-cleaning',
    'plumber-san-diego-emergency',
    'plumber-fresno-emergency',
    'plumber-new-orleans-water-heater-repair',
]

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'}

for slug in slugs:
    url = f'https://yohomefix.com/{slug}'
    r = requests.get(url, headers=headers, timeout=30)
    text = r.text
    title = re.search(r'<title[^>]*>(.*?)</title>', text, re.S)
    desc = re.search(r'<meta name="description" content="(.*?)"', text, re.S)
    h1_match = re.search(r'<h1[^>]*>(.*?)</h1>', text, re.S)
    h1 = h1_match.group(1) if h1_match else 'NO H1'
    h1_text = re.sub(r'<[^>]+>', '', h1)
    print(f'--- {slug} ---')
    print('title:', html.unescape(title.group(1)) if title else 'NO')
    print('desc:', html.unescape(desc.group(1))[:160] if desc else 'NO')
    print('h1:', html.unescape(h1_text).strip()[:120])
    print('status:', r.status_code)
    print()
