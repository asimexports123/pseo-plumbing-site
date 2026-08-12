import requests
import re
import json

CRAWLERS = [
    'GPTBot',
    'OAI-SearchBot',
    'ChatGPT-User',
    'ClaudeBot',
    'anthropic-ai',
    'PerplexityBot',
    'Perplexity-User',
    'Google-Extended',
    'CCBot',
    'Bytespider',
    'Amazonbot',
    'Applebot-Extended',
    'Meta-ExternalAgent',
    'cohere-ai',
    'Googlebot',
]

URLS = [
    'https://yohomefix.com/',
    'https://yohomefix.com/plumber-oklahoma-city-emergency',
    'https://yohomefix.com/areas/oklahoma-city/73102/emergency',
]

TIMEOUT = 30

def check_ua(ua):
    results = []
    for url in URLS:
        headers = {
            'User-Agent': ua,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
        }
        try:
            resp = requests.get(url, headers=headers, allow_redirects=False, timeout=TIMEOUT)
            status = resp.status_code
            cf_ray = resp.headers.get('cf-ray', '')
            cf_cache = resp.headers.get('cf-cache-status', '')
            server = resp.headers.get('server', '')
            body = resp.text[:3000]
            
            title = ''
            m = re.search(r'<title[^>]*>(.*?)</title>', body, re.S|re.I)
            if m:
                title = m.group(1).strip()[:100]
            
            is_cf_block = 'Attention Required' in body or 'cloudflare' in body.lower()[:200]
            html_returned = status == 200 and '<html' in body.lower() and len(body) > 500
            
            results.append({
                'url': url,
                'status': status,
                'cf_ray': cf_ray,
                'cf_cache': cf_cache,
                'server': server,
                'cf_block': is_cf_block,
                'html_returned': html_returned,
                'title': title,
            })
        except Exception as e:
            results.append({
                'url': url,
                'status': -1,
                'error': str(e),
                'cf_block': False,
                'html_returned': False,
            })
    return results

all_results = {}
for ua in CRAWLERS:
    print(f'Testing: {ua} ...')
    all_results[ua] = check_ua(ua)
    for r in all_results[ua]:
        print(f'  {r["url"]}: status={r["status"]} cf-cache={r.get("cf_cache","")} cf_block={r.get("cf_block",False)} html={r.get("html_returned",False)} title={r.get("title","")}')

with open('__verify_ai_crawlers_final.json', 'w') as f:
    json.dump(all_results, f, indent=2)

print('\nDone.')
