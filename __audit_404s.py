import ast
import csv
import json
import re

SUMP_PUMP_QUALIFIED = {
    'AK','CT','ID','IL','IN','IA','KS','KY','ME','MA','MI','MN','MO','MT','NE','NH','NJ','NY','ND','OH','OR','PA','RI','SD','TN','UT','VT','VA','WA','WV','WI','WY','CO','DE','MD','NV','NM','NC',
}

ZCTA_SITEMAP_SERVICES = {
    'emergency','leak-repair','drain-cleaning','water-heater-repair','pipe-burst-repair',
}

SERVICE_SLUGS = [
    'emergency','leak-repair','drain-cleaning','pipe-burst-repair','water-heater-repair',
    'sewer-line-repair','toilet-repair','slab-leak-repair','water-line-repair','faucet-repair',
    'garbage-disposal-repair','water-softener-repair','whole-house-repiping',
    'main-water-shutoff-valve-repair','sump-pump-repair',
]

def extract_js_array(name, text):
    m = re.search(rf'const\s+{name}\s*=\s*(\[.*)', text, re.S)
    if not m:
        return []
    start = m.start(1)
    i, depth = start, 0
    while i < len(text):
        c = text[i]
        if c == '[':
            depth += 1
        elif c == ']':
            depth -= 1
            if depth == 0:
                break
        i += 1
    arr = text[start:i+1]
    # Drop JS line comments
    arr = re.sub(r'//[^\n]*', '', arr)
    arr = re.sub(r'/\*.*?\*/', '', arr, flags=re.S)
    # Quote unquoted object keys so ast.literal_eval can read them
    arr = re.sub(r'(?<=[\{\,])\s*([a-zA-Z_$][\w$]*)\s*:', lambda m: f'"{m.group(1)}":', arr)
    return ast.literal_eval(arr)

with open('lib/cities.js', encoding='utf-8') as f:
    cities_text = f.read()

SEED_CITIES = extract_js_array('SEED_CITIES', cities_text)
SERVICES = extract_js_array('SERVICES', cities_text)

print('SEED_CITIES count:', len(SEED_CITIES))
print('SERVICES count:', len(SERVICES))

# validate slugs match hardcoded list
assert {s['slug'] for s in SERVICES} == set(SERVICE_SLUGS)

with open('data/us_places.json', encoding='utf-8') as f:
    us_places = json.load(f)
with open('data/us_zctas.json', encoding='utf-8') as f:
    us_zctas = json.load(f)

place_by_slug = {p['slug']: p for p in us_places}
place_by_name = {p['name']: p for p in us_places}
zip_map = {z['zip']: z for z in us_zctas}

def city_to_slug(name):
    return re.sub(r"[^a-z0-9]", '-', name.lower().replace("'", '').replace('.', '')).strip('-')

seed_map = {}
for c in SEED_CITIES:
    slug = city_to_slug(c['name'])
    seed_map[slug] = c

def get_city_by_slug(slug):
    if slug in seed_map:
        c = seed_map[slug]
        return {'name': c['name'], 'stateCode': c.get('stateCode'), 'source': 'seed'}
    if slug in place_by_slug:
        p = place_by_slug[slug]
        return {'name': p['name'], 'stateCode': p['stateCode'], 'source': 'places'}
    return None

def is_zcta_qualified(z, service):
    if service == 'sump-pump-repair':
        return z['stateCode'] in SUMP_PUMP_QUALIFIED
    return service in SERVICE_SLUGS

records = []
categories = {'A':0,'B':0,'C':0,'D':0}
reasons = {}

with open('gsc-coverage-2026-08-08/Table.csv', encoding='utf-8') as f:
    reader = csv.reader(f)
    next(reader)
    for row in reader:
        url = row[0]
        path = url.replace('https://yohomefix.com','')
        parts = [p for p in path.split('/') if p]
        if len(parts) != 4 or parts[0] != 'areas':
            records.append({'url':url,'path':path,'reason':'non-areas-pattern','category':'B'})
            continue
        _, city_slug, zip_code, service = parts
        known_city = get_city_by_slug(city_slug)
        zcta = zip_map.get(zip_code)
        record = {'url':url,'path':path,'citySlug':city_slug,'zip':zip_code,'service':service}
        if service not in SERVICE_SLUGS:
            record['reason'] = 'unknown-service'
            record['category'] = 'B'
        elif not zcta:
            record['reason'] = 'unknown-zip'
            record['category'] = 'B'
        elif not known_city:
            record['reason'] = 'unknown-city'
            record['category'] = 'B'
        elif zcta['parentCitySlug'] != city_slug:
            record['reason'] = 'wrong-city'
            record['actualParent'] = zcta['parentCitySlug']
            actual_city = get_city_by_slug(zcta['parentCitySlug'])
            if actual_city and is_zcta_qualified(zcta, service):
                record['redirectTo'] = f"/areas/{zcta['parentCitySlug']}/{zip_code}/{service}"
            elif actual_city:
                record['redirectTo'] = f"/areas/{zcta['parentCitySlug']}/{zip_code}/emergency"
            else:
                # correct parent city is also unknown, no valid equivalent
                pass
            record['category'] = 'D' if record.get('redirectTo') else 'B'
        elif not is_zcta_qualified(zcta, service):
            record['reason'] = 'unqualified-service'
            record['redirectTo'] = f"/areas/{city_slug}/{zip_code}/emergency"
            record['category'] = 'D'
        else:
            record['reason'] = 'valid'
            record['category'] = 'A'

        record['inCurrentSitemap'] = (record['reason'] == 'valid' and record['service'] in ZCTA_SITEMAP_SERVICES)
        records.append(record)
        reasons[record['reason']] = reasons.get(record['reason'], 0) + 1
        categories[record['category']] = categories.get(record['category'], 0) + 1

report = {'total': len(records), 'categories': categories, 'reasons': reasons, 'urls': records}
with open('__audit_404s_result.json', 'w', encoding='utf-8') as f:
    json.dump(report, f, indent=2)

print('Total:', report['total'])
print('Categories:', categories)
print('Reasons:', reasons)
