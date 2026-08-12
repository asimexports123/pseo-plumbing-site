import concurrent.futures
import json
import requests

r = json.load(open('__audit_404s_result2.json'))
items = [(u['url'], u['category'], u.get('redirectTo'), u.get('reason')) for u in r['urls']]

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
}

def fetch(url, method='GET'):
    try:
        with requests.request(method, url, headers=HEADERS, allow_redirects=False, stream=True, timeout=20) as resp:
            return resp.status_code, resp.headers.get('Location') or ''
    except Exception as e:
        return -1, str(e)

def check_one(args):
    url, cat, dest, reason = args
    status, loc = fetch(url)
    target_status = None
    if dest:
        target_status = fetch('https://yohomefix.com' + dest)[0]
    return {'url': url, 'path': url.replace('https://yohomefix.com', ''), 'category': cat, 'reason': reason,
            'status': status, 'location': loc, 'redirectTo': dest, 'target_status': target_status}

results = []
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as ex:
    for out in ex.map(check_one, items):
        results.append(out)

with open('__crawl_471_result.json', 'w') as f:
    json.dump(results, f, indent=2)

summary = {}
bad_targets = []
for rec in results:
    key = f"{rec['reason']}_{rec['status']}"
    summary[key] = summary.get(key, 0) + 1
    if rec['redirectTo'] and rec['target_status'] not in (200, 301, 302, 307, 308):
        bad_targets.append(f"{rec['url']} -> {rec['redirectTo']} ({rec['target_status']})")

print('Total crawled:', len(results))
print('Summary:', json.dumps(summary, indent=2))
if bad_targets:
    print('Redirect targets not 2xx/3xx:', len(bad_targets))
    for b in bad_targets[:20]: print(b)
