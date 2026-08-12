#!/usr/bin/env python3
"""Extract Top 20 URLs and build primary keyword mapping."""
import re, json

def url_to_keyword(path):
    """Convert /plumber-oklahoma-city-drain-cleaning to 'drain cleaning Oklahoma City'."""
    raw = path.strip('/').replace('plumber-', '')
    known_services = [
        'drain-cleaning', 'emergency', 'leak-repair', 'water-heater-repair',
        'pipe-burst-repair', 'sewer-line', 'water-softener', 'faucet-repair',
        'water-line', 'repiping', 'main-water-shutoff-valve'
    ]
    service = None
    for s in known_services:
        if raw.endswith(s):
            service = s
            city = raw[:-len(s)].strip('-')
            break
    if not service:
        # e.g. /plumber-oklahoma (just state/city, no service)
        return f'plumber {raw.replace("-", " ")}'
    city = ' '.join(city.split('-'))
    service_label = service.replace('-', ' ')
    return f'{service_label} {city}'

lines = open('WEEKLY_ACTION_PLAN.md', encoding='utf-8').readlines()
urls = []
for l in lines:
    m = re.match(r'^\s*(\d+)\s+(\/plumber[^\s]+)', l)
    if m:
        urls.append({'rank': int(m.group(1)), 'path': m.group(2)})

top20 = urls[:20]
keywords = []
for u in top20:
    u['keyword'] = url_to_keyword(u['path'])
    u['full_url'] = f'https://www.yohomefix.com{u["path"]}'
    keywords.append(u)

json.dump(keywords, open('_top20_keywords.json', 'w', encoding='utf-8'), indent=2)
print(json.dumps(keywords, indent=2))
