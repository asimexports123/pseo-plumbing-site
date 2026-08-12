import requests
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
            resp = requests.get(url, headers=headers, allow_redirects=True, timeout=TIMEOUT)
            status = resp.status_code
            rheaders = dict(resp.headers)
            body = resp.text[:2000]

            # Cloudflare challenge indicators
            cf_challenge = False
            cf_block = False
            cf_ray = rheaders.get('cf-ray', '')
            cf_cache = rheaders.get('cf-cache-status', '')
            server = rheaders.get('server', '')

            # Check for Cloudflare challenge page
            if status == 403:
                if 'cloudflare' in body.lower() or 'cf-' in body.lower() or 'challenge' in body.lower():
                    cf_block = True
                else:
                    cf_block = True  # 403 is still a block
            if status == 503:
                if 'cloudflare' in body.lower() or 'challenge' in body.lower():
                    cf_challenge = True
            if 'just a moment' in body.lower():
                cf_challenge = True
            if 'cf-mitigated' in rheaders:
                cf_challenge = True
            if 'cf-chl' in body.lower():
                cf_challenge = True

            # Check if real HTML returned
            html_returned = False
            if status == 200 and '<html' in body.lower() and ('yohomefix' in body.lower() or 'plumber' in body.lower() or '<title>' in body.lower()):
                html_returned = True

            # Check robots.txt relevant headers
            result = {
                'url': url,
                'status': status,
                'server': server,
                'cf_ray': cf_ray,
                'cf_cache': cf_cache,
                'cf_mitigated': rheaders.get('cf-mitigated', ''),
                'cf_block': cf_block,
                'cf_challenge': cf_challenge,
                'html_returned': html_returned,
                'final_url': resp.url,
                'title': '',
                'body_snippet': body[:300],
            }
            # Extract title
            import re
            m = re.search(r'<title[^>]*>(.*?)</title>', body, re.S|re.I)
            if m:
                result['title'] = m.group(1).strip()[:100]

            results.append(result)
        except Exception as e:
            results.append({
                'url': url,
                'status': -1,
                'error': str(e),
                'cf_block': False,
                'cf_challenge': False,
                'html_returned': False,
            })
    return results

all_results = {}
for ua in CRAWLERS:
    print(f'Testing: {ua} ...')
    all_results[ua] = check_ua(ua)
    for r in all_results[ua]:
        print(f'  {r["url"]}: status={r["status"]}, html={r.get("html_returned",False)}, cf_block={r.get("cf_block",False)}, cf_chal={r.get("cf_challenge",False)}, title={r.get("title","")}')

with open('__verify_ai_crawlers_result.json', 'w') as f:
    json.dump(all_results, f, indent=2)

print('\nDone. Results saved to __verify_ai_crawlers_result.json')
