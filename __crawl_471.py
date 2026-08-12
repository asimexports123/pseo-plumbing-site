import concurrent.futures
import json
import urllib.request
from urllib.error import HTTPError

r = json.load(open('__audit_404s_result2.json'))
items = []
for u in r['urls']:
    items.append((u['url'], u['category'], u.get('redirectTo'), u.get('reason')))

opener = urllib.request.build_opener(urllib.request.HTTPSHandler())
opener.addheaders = [('User-Agent', 'yohomefix-404-audit/1.0')]

def fetch(url, method='HEAD'):
    try:
        req = urllib.request.Request(url, method=method)
        resp = opener.open(req)
        return resp.status, resp.getheader('Location') or '', resp.getheader('Content-Type') or ''
    except HTTPError as e:
        return e.code, e.headers.get('Location') or '', e.headers.get('Content-Type') or ''
    except Exception as e:
        return -1, str(e), ''

results = []

def check_one(args):
    url, cat, dest, reason = args
    status, loc, ctype = fetch(url)
    target_status = None
    if dest:
        target_status, _, _ = fetch('https://yohomefix.com' + dest)
    return {'url': url, 'path': url.replace('https://yohomefix.com', ''), 'category': cat, 'reason': reason,
            'status': status, 'location': loc, 'redirectTo': dest, 'target_status': target_status}

with concurrent.futures.ThreadPoolExecutor(max_workers=8) as ex:
    for out in ex.map(check_one, items):
        results.append(out)

with open('__crawl_471_result.json', 'w') as f:
    json.dump(results, f, indent=2)

summary = {}
for rec in results:
    key = f"{rec['category']}_{rec['status']}"
    summary[key] = summary.get(key, 0) + 1
    if rec['redirectTo'] and rec['target_status'] != 200:
        print('Redirect target not 200:', rec['url'], rec['redirectTo'], rec['target_status'])

print('Total crawled:', len(results))
print('By category/status:', json.dumps(summary, indent=2))
