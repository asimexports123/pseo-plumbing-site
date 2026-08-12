import requests
import json
import os

# Load credentials
token = None
zone_id = None
with open('.env.cloudflare') as f:
    for line in f:
        line = line.strip()
        if line.startswith('CLOUDFLARE_API_TOKEN='):
            token = line.split('=', 1)[1]
        elif line.startswith('CLOUDFLARE_ZONE_ID='):
            zone_id = line.split('=', 1)[1]

BASE = 'https://api.cloudflare.com/client/v4'
HEADERS = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json',
}

def cf_get(path, params=None):
    url = f'{BASE}{path}'
    resp = requests.get(url, headers=HEADERS, params=params, timeout=30)
    return resp.json()

def cf_get_all(path, key, params=None):
    results = []
    page = 1
    while True:
        p = params.copy() if params else {}
        p['page'] = page
        p['per_page'] = 50
        data = cf_get(path, p)
        if not data.get('success'):
            print(f'  ERROR: {data.get("errors")}')
            break
        page_results = data.get('result', [])
        if isinstance(page_results, list):
            results.extend(page_results)
        elif isinstance(page_results, dict):
            results.append(page_results)
        total_pages = data.get('result_info', {}).get('total_pages', 1)
        if page >= total_pages:
            break
        page += 1
    return results

print(f'Zone ID: {zone_id}')
print()

# 1. Zone settings - Bot Fight Mode
print('=== 1. Bot Fight Mode ===')
data = cf_get(f'/zones/{zone_id}/bot_management')
if data.get('success'):
    print(json.dumps(data['result'], indent=2))
else:
    print(f'  Error: {data.get("errors")}')

# 2. Super Bot Fight Mode (requires different endpoint)
print('\n=== 2. Super Bot Fight Mode ===')
data = cf_get(f'/zones/{zone_id}/bot_management/config')
if data.get('success'):
    print(json.dumps(data['result'], indent=2))
else:
    print(f'  Error: {data.get("errors")}')

# 3. WAF Rules
print('\n=== 3. WAF Custom Rules (rulesets) ===')
rulesets = cf_get_all(f'/zones/{zone_id}/rulesets', 'result')
for rs in rulesets:
    print(f'  Ruleset: {rs.get("name")} (id={rs.get("id")}, phase={rs.get("phase")}, kind={rs.get("kind")})')
    # Get rules within this ruleset
    rs_detail = cf_get(f'/zones/{zone_id}/rulesets/{rs["id"]}')
    if rs_detail.get('success') and rs_detail.get('result', {}).get('rules'):
        for rule in rs_detail['result']['rules']:
            expr = rule.get('expression', '')[:200]
            action = rule.get('action', '')
            enabled = rule.get('enabled', True)
            desc = rule.get('description', '')
            print(f'    Rule: {desc} | action={action} | enabled={enabled}')
            print(f'    Expr: {expr}')
            print()

# 4. WAF Custom Rules (legacy)
print('\n=== 4. WAF Custom Rules (legacy) ===')
data = cf_get(f'/zones/{zone_id}/firewall/rules')
if data.get('success'):
    for rule in data.get('result', []):
        print(f'  Rule: {rule.get("description","")} | action={rule.get("action")} | enabled={rule.get("paused",False)==False}')
        print(f'    Expr: {rule.get("filter",{}).get("expression","")[:200]}')
else:
    print(f'  Error: {data.get("errors")}')

# 5. Rate Limiting Rules
print('\n=== 5. Rate Limiting Rules ===')
data = cf_get(f'/zones/{zone_id}/rate_limits')
if data.get('success'):
    for rule in data.get('result', []):
        print(f'  Rule: {rule.get("description","")} | enabled={not rule.get("disabled",False)}')
        print(f'    Match: {json.dumps(rule.get("match",{}))[:200]}')
else:
    print(f'  Error: {data.get("errors")}')

# 6. Page Rules
print('\n=== 6. Page Rules ===')
data = cf_get_all(f'/zones/{zone_id}/pagerules', 'result')
for rule in data:
    print(f'  Rule: {rule.get("targets","")} | status={rule.get("status","")}')
    print(f'    Actions: {json.dumps(rule.get("actions",""))[:200]}')

# 7. Firewall Access Rules
print('\n=== 7. Firewall Access Rules ===')
data = cf_get_all(f'/zones/{zone_id}/firewall/access_rules/rules', 'result')
for rule in data:
    print(f'  Rule: {rule.get("configuration",{}).get("value","")} | mode={rule.get("mode")} | notes={rule.get("notes","")}')

# 8. User-agent blocking rules
print('\n=== 8. User-Agent Blocking (Lockdown) ===')
data = cf_get(f'/zones/{zone_id}/firewall/lockdowns')
if data.get('success'):
    for rule in data.get('result', []):
        print(f'  Lockdown: {rule.get("description","")} | urls={rule.get("urls","")}')
        print(f'    Config: {json.dumps(rule.get("configurations",""))[:200]}')
else:
    print(f'  Error: {data.get("errors")}')

# 9. UA Blocking rules
print('\n=== 9. UA Blocking Rules ===')
data = cf_get(f'/zones/{zone_id}/firewall/ua_rules')
if data.get('success'):
    for rule in data.get('result', []):
        print(f'  UA Rule: {json.dumps(rule)[:200]}')
else:
    print(f'  Error: {data.get("errors")}')

# 10. Check Bot Management via zone settings
print('\n=== 10. Zone-level Bot Settings ===')
for setting in ['bot_management', 'security_level']:
    data = cf_get(f'/zones/{zone_id}/settings/{setting}')
    if data.get('success'):
        print(f'  {setting}: {json.dumps(data["result"])}')
    else:
        print(f'  {setting}: Error {data.get("errors")}')
