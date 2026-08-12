import requests
import json

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

# Get the full "Block unwanted bots" ruleset
rs_id = '00c67dd36c3a4e49b6d19bc096e27ea1'
resp = requests.get(f'{BASE}/zones/{zone_id}/rulesets/{rs_id}', headers=HEADERS, timeout=30)
data = resp.json()

if data.get('success'):
    rs = data['result']
    print(f'Ruleset: {rs["name"]}')
    print(f'Phase: {rs["phase"]}')
    print(f'Kind: {rs["kind"]}')
    print()
    for i, rule in enumerate(rs.get('rules', [])):
        print(f'=== Rule {i+1}: {rule.get("description","")} ===')
        print(f'Action: {rule["action"]}')
        print(f'Enabled: {rule.get("enabled", True)}')
        print(f'Expression:')
        print(rule.get('expression', ''))
        print()
else:
    print(f'Error: {data.get("errors")}')

# Also get the cache ruleset to see the full allow expression
print('\n\n=== CACHE RULESET ===')
cache_rs_id = '8360f525de25463086f7c6c74072939e'
resp2 = requests.get(f'{BASE}/zones/{zone_id}/rulesets/{cache_rs_id}', headers=HEADERS, timeout=30)
data2 = resp2.json()
if data2.get('success'):
    rs2 = data2['result']
    for rule in rs2.get('rules', []):
        if 'Allow' in rule.get('description', '') or 'allow' in rule.get('description', '').lower() or 'fetcher' in rule.get('description', '').lower():
            print(f'Rule: {rule["description"]}')
            print(f'Action: {rule["action"]}')
            print(f'Expression:')
            print(rule.get('expression', ''))
            print()
