import requests
import re

PARTIAL_UAS = ['OAI-SearchBot', 'Perplexity-User', 'Meta-ExternalAgent', 'cohere-ai']
PAGES = [
    'https://yohomefix.com/plumber-oklahoma-city-emergency',
    'https://yohomefix.com/areas/oklahoma-city/73102/emergency',
]

for ua in PARTIAL_UAS:
    for url in PAGES:
        headers = {
            'User-Agent': ua,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
        }
        resp = requests.get(url, headers=headers, allow_redirects=False, timeout=30)
        status = resp.status_code
        cf_ray = resp.headers.get('cf-ray', '')
        cf_cache = resp.headers.get('cf-cache-status', '')
        body = resp.text[:2000]
        title = ''
        m = re.search(r'<title[^>]*>(.*?)</title>', body, re.S|re.I)
        if m:
            title = m.group(1).strip()[:100]
        is_cf_block = 'cloudflare' in body.lower() or 'Attention Required' in body
        print(f'{ua} | {url}')
        print(f'  status={status} cf-ray={cf_ray} cf-cache={cf_cache} cf_block={is_cf_block} title={title}')
