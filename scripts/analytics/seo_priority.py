import csv
import re
import collections

SERVICES = [
    'emergency', 'drain-cleaning', 'leak-repair', 'pipe-burst-repair',
    'water-heater-repair', 'sewer-line-repair', 'toilet-repair',
    'slab-leak-repair', 'water-line-repair', 'faucet-repair',
    'garbage-disposal-repair', 'water-softener-repair',
    'whole-house-repiping', 'main-water-shutoff-valve-repair',
    'sump-pump-repair',
]
SERVICE_PATTERN = '|'.join(sorted(SERVICES, key=len, reverse=True))
CITY_SERVICE_RE = re.compile(r'plumber-([a-z0-9.\-]+?)-(' + SERVICE_PATTERN + r')$')

pages = []
with open('scripts/analytics/csv/gsc-pages.csv', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for r in reader:
        pages.append(r)

queries = []
with open('scripts/analytics/csv/gsc-queries.csv', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for r in reader:
        queries.append(r)

# Top 20 pages by impressions (city/service only, exclude homepage/guides)
city_pages = []
for r in pages:
    url = r['Top pages']
    m = CITY_SERVICE_RE.search(url)
    if m:
        city, service = m.group(1), m.group(2)
        city_pages.append({
            'url': url,
            'city_slug': city,
            'service': service,
            'impr': int(r['Impressions'] or 0),
            'clicks': int(r['Clicks'] or 0),
            'pos': float(r['Position'] or 0),
            'ctr': r['CTR']
        })

print('=== TOP 20 CITY/SERVICE PAGES BY IMPRESSIONS ===')
for p in sorted(city_pages, key=lambda x: -x['impr'])[:20]:
    print(f"{p['impr']:>6}  {p['pos']:6.1f}  {p['url']}")

print('\n=== TOP 30 QUERIES BY IMPRESSIONS ===')
for q in sorted(queries, key=lambda x: -int(x['Impressions'] or 0))[:30]:
    print(f"{q['Impressions']:>8}  {q['Position']:>6}  {q['Top queries']}")

# Map query to likely page for top queries containing city names
city_set = {p['city_slug'] for p in city_pages}
print('\n=== TOP QUERIES CONTAINING A KNOWN CITY SLUG ===')
for q in sorted(queries, key=lambda x: -int(x['Impressions'] or 0))[:100]:
    kw = q['Top queries']
    for city in city_set:
        if city.replace('-', ' ') in kw.lower():
            print(f"{q['Impressions']:>8}  {q['Position']:>6}  {kw}")
            break
