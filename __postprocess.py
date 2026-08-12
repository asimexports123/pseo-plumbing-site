import json
import re
import __audit_404s as a

COST_PAGE_CITIES = {'New York','Los Angeles','Chicago','Houston','Phoenix','Dallas','San Antonio','San Diego','Austin','Philadelphia'}

def norm(slug):
    s = slug.lower().replace("'", '-').replace('.', '-')
    s = re.sub(r"[^a-z0-9-]", '-', s)
    s = re.sub(r"-+", '-', s)
    return s.strip('-')

def get_city(slug):
    k = a.get_city_by_slug(slug)
    if k:
        return slug, k
    n = norm(slug)
    k2 = a.get_city_by_slug(n)
    if k2:
        return n, k2
    return None, None

def is_qualified(name, st, svc):
    if svc != 'sump-pump-repair':
        return True
    return st in a.SUMP_PUMP_QUALIFIED

r = json.load(open('__audit_404s_result.json'))
cats = {'A':0,'B':0,'C':0,'D':0}
reasons = {}
records = []

for rec in r['urls']:
    path = rec['path']
    record = rec.copy()
    if rec.get('reason') == 'non-areas-pattern':
        if path.startswith('/plumber-'):
            body = path[9:]
            svc = None
            for s in sorted(a.SERVICE_SLUGS, key=lambda x: -len(x)):
                if body.endswith('-' + s):
                    svc = s
                    city_slug = body[:-len(s)-1]
                    break
            if svc is None:
                city_slug = body
                svc = 'emergency'
            orig_slug = city_slug
            actual_slug, known = get_city(city_slug)
            if not known:
                record['reason'] = 'plumber-unknown-city'
                record['category'] = 'B'
            elif svc not in a.SERVICE_SLUGS:
                record['reason'] = 'plumber-unknown-service'
                record['category'] = 'B'
            elif not is_qualified(known['name'], known['stateCode'], svc):
                record['reason'] = 'plumber-unqualified-service'
                record['redirectTo'] = f"/plumber-{actual_slug}-emergency"
                record['category'] = 'D'
            elif orig_slug != actual_slug:
                record['reason'] = 'plumber-normalized-slug'
                record['redirectTo'] = f"/plumber-{actual_slug}-{svc}"
                record['category'] = 'D'
            else:
                record['reason'] = 'plumber-valid'
                record['category'] = 'A'
        elif path.startswith('/cost/'):
            city_slug = path[6:]
            actual_slug, known = get_city(city_slug)
            if not known or known['name'] not in COST_PAGE_CITIES:
                record['reason'] = 'cost-not-eligible'
                record['category'] = 'B'
            elif city_slug != actual_slug:
                record['reason'] = 'cost-normalized-slug'
                record['redirectTo'] = f"/cost/{actual_slug}"
                record['category'] = 'D'
            else:
                record['reason'] = 'cost-valid'
                record['category'] = 'A'
        elif path.startswith('/areas/') and path.count('/') == 2:
            city_slug = path[7:]
            actual_slug, known = get_city(city_slug)
            if not known:
                record['reason'] = 'areas-unknown-city'
                record['category'] = 'B'
            else:
                zctas = [z for z in a.us_zctas if z['parentCitySlug'] == actual_slug]
                if not zctas:
                    record['reason'] = 'areas-no-zctas'
                    record['category'] = 'B'
                elif city_slug != actual_slug:
                    record['reason'] = 'areas-normalized-slug'
                    record['redirectTo'] = f"/areas/{actual_slug}"
                    record['category'] = 'D'
                else:
                    record['reason'] = 'areas-valid'
                    record['category'] = 'A'
        else:
            record['reason'] = 'other-pattern'
            record['category'] = 'B'
    elif rec.get('reason') == 'unknown-city' and path.startswith('/areas/') and path.count('/') == 4:
        parts = [p for p in path.split('/') if p]
        city_slug, zip_code, service = parts[1], parts[2], parts[3]
        zcta = a.zip_map.get(zip_code)
        if zcta:
            record['reason'] = 'wrong-city-from-unknown'
            record['actualParent'] = zcta['parentCitySlug']
            if a.is_zcta_qualified(zcta, service):
                record['redirectTo'] = f"/areas/{zcta['parentCitySlug']}/{zip_code}/{service}"
            else:
                record['redirectTo'] = f"/areas/{zcta['parentCitySlug']}/{zip_code}/emergency"
            record['category'] = 'D'

    records.append(record)
    reasons[record['reason']] = reasons.get(record['reason'], 0) + 1
    cats[record['category']] = cats.get(record['category'], 0) + 1

report = {'total': len(records), 'categories': cats, 'reasons': reasons, 'urls': records}
with open('__audit_404s_result2.json', 'w') as f:
    json.dump(report, f, indent=2)
print('Categories:', json.dumps(cats))
print('Reasons:', json.dumps(reasons))
