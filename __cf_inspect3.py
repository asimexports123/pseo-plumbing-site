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

# Check what permissions the token has
resp = requests.get(f'{BASE}/user/tokens/verify', headers=HEADERS, timeout=30)
print('=== Token Verification ===')
print(json.dumps(resp.json(), indent=2))

# Try to get zone details to confirm access
resp2 = requests.get(f'{BASE}/zones/{zone_id}', headers=HEADERS, timeout=30)
print('\n=== Zone Details ===')
data = resp2.json()
if data.get('success'):
    z = data['result']
    print(f'Name: {z["name"]}')
    print(f'Status: {z["status"]}')
    print(f'Plan: {z.get("plan",{}).get("name","")}')
else:
    print(f'Error: {data.get("errors")}')

# Check Bot Fight Mode via the settings endpoint
print('\n=== Bot Fight Mode (settings/bot_management) ===')
resp3 = requests.get(f'{BASE}/zones/{zone_id}/settings/bot_management', headers=HEADERS, timeout=30)
print(json.dumps(resp3.json(), indent=2))

# Try the newer bot_management endpoint
print('\n=== Bot Management Config ===')
resp4 = requests.get(f'{BASE}/zones/{zone_id}/bot_management/config', headers=HEADERS, timeout=30)
print(json.dumps(resp4.json(), indent=2))
