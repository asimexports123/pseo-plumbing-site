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

RULESET_ID = '00c67dd36c3a4e49b6d19bc096e27ea1'

# First, get the current full ruleset to preserve all metadata
resp = requests.get(f'{BASE}/zones/{zone_id}/rulesets/{RULESET_ID}', headers=HEADERS, timeout=30)
data = resp.json()

if not data.get('success'):
    print(f'ERROR fetching ruleset: {data.get("errors")}')
    exit(1)

rs = data['result']
print(f'Current ruleset: {rs["name"]} (version {rs.get("version","")})')
print(f'Rules count: {len(rs.get("rules", []))}')

# Build new rules
# Rule 1: Block unwanted crawler bots by User-Agent
# REMOVE: Claude-SearchBot, ClaudeBot, Claude-Web, anthropic-ai, GPTBot, CCBot
# KEEP: meta-webindexer, facebookexternalhit, facebot, Amzn-SearchBot, AhrefsBot, SemrushBot
rule1_expr = '(http.user_agent contains "meta-webindexer") or (http.user_agent contains "facebookexternalhit") or (http.user_agent contains "facebot") or (http.user_agent contains "Amzn-SearchBot") or (http.user_agent contains "AhrefsBot") or (http.user_agent contains "SemrushBot")'

# Rule 2: Block proactive AI, scrapers, and HTTP libraries
# REMOVE: GPTBot, ClaudeBot, Claude-Web, Anthropic-AI, Bytespider, Amazonbot, Google-Extended, meta-externalagent
# CHANGE: Applebot contains -> eq (to block Applebot but not Applebot-Extended)
# KEEP: meta-webindexer, facebookexternalhit, AhrefsBot, SemrushBot, DotBot, MJ12bot, YandexBot, Baiduspider, curl, python-requests, Scrapy, empty UA
rule2_expr = '''(
          (http.user_agent contains "meta-webindexer") or
          (http.user_agent contains "facebookexternalhit") or
          (http.user_agent contains "AhrefsBot") or
          (http.user_agent contains "SemrushBot") or
          (http.user_agent contains "DotBot") or
          (http.user_agent contains "MJ12bot") or
          (http.user_agent contains "YandexBot") or
          (http.user_agent contains "Baiduspider") or
          (http.user_agent contains "curl") or
          (http.user_agent contains "python-requests") or
          (http.user_agent contains "Scrapy") or
          (http.user_agent eq "Applebot") or
          (http.user_agent eq "")
        )'''

# Rule 3: Allow search and AI fetchers (skip)
# ADD: GPTBot, OAI-SearchBot, ChatGPT-User, Google-Extended, ClaudeBot, anthropic-ai,
#       Claude-SearchBot, PerplexityBot, Perplexity-User, CCBot, Bytespider, Amazonbot,
#       Applebot-Extended, Meta-ExternalAgent, cohere-ai
rule3_expr = '''(
                  (http.user_agent contains "Googlebot") or
                  (http.user_agent contains "GoogleOther") or
                  (http.user_agent contains "Bingbot") or
                  (http.user_agent contains "ChatGPT-User") or
                  (http.user_agent contains "PerplexityBot") or
                  (http.user_agent contains "Perplexity-User") or
                  (http.user_agent contains "Claude-SearchBot") or
                  (http.user_agent contains "ClaudeBot") or
                  (http.user_agent contains "anthropic-ai") or
                  (http.user_agent contains "GPTBot") or
                  (http.user_agent contains "OAI-SearchBot") or
                  (http.user_agent contains "Google-Extended") or
                  (http.user_agent contains "CCBot") or
                  (http.user_agent contains "Bytespider") or
                  (http.user_agent contains "Amazonbot") or
                  (http.user_agent contains "Applebot-Extended") or
                  (http.user_agent contains "Meta-ExternalAgent") or
                  (http.user_agent contains "cohere-ai")
                )'''

# Get current rules to preserve IDs and other fields
current_rules = rs.get('rules', [])

new_rules = [
    {
        'id': current_rules[0]['id'],
        'description': current_rules[0]['description'],
        'expression': rule1_expr,
        'action': 'block',
    },
    {
        'id': current_rules[1]['id'],
        'description': current_rules[1]['description'],
        'expression': rule2_expr,
        'action': 'block',
    },
    {
        'id': current_rules[2]['id'],
        'description': current_rules[2]['description'],
        'expression': rule3_expr,
        'action': 'skip',
        'action_parameters': current_rules[2].get('action_parameters', {}),
    },
]

# Update the ruleset
print('\nUpdating ruleset...')
update_resp = requests.put(
    f'{BASE}/zones/{zone_id}/rulesets/{RULESET_ID}',
    headers=HEADERS,
    json={'rules': new_rules},
    timeout=30
)
update_data = update_resp.json()

if update_data.get('success'):
    print('SUCCESS! Ruleset updated.')
    updated_rs = update_data['result']
    print(f'New version: {updated_rs.get("version", "")}')
    for i, rule in enumerate(updated_rs.get('rules', [])):
        print(f'\n=== Rule {i+1}: {rule["description"]} ===')
        print(f'Action: {rule["action"]}')
        print(f'Expression: {rule["expression"][:300]}...')
else:
    print(f'ERROR: {json.dumps(update_data.get("errors"), indent=2)}')
