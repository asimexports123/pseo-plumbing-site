import requests
import json

BLOCKED_UAS = ['GPTBot', 'ClaudeBot', 'anthropic-ai', 'Google-Extended', 'CCBot', 'Bytespider', 'Amazonbot', 'Applebot-Extended']
PARTIAL_UAS = ['OAI-SearchBot', 'Perplexity-User', 'Meta-ExternalAgent', 'cohere-ai']

URL = 'https://yohomefix.com/'

for ua in BLOCKED_UAS + PARTIAL_UAS:
    headers = {
        'User-Agent': ua,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
    }
    resp = requests.get(URL, headers=headers, allow_redirects=False, timeout=30)
    print(f'\n=== {ua} ===')
    print(f'Status: {resp.status_code}')
    for k, v in resp.headers.items():
        if k.lower().startswith('cf-') or k.lower() in ('server', 'content-type', 'x-frame-options', 'x-content-type-options'):
            print(f'  {k}: {v}')
    # Check body for challenge details
    body = resp.text[:3000]
    if 'cloudflare' in body.lower() or 'ray id' in body.lower():
        # Extract the Cloudflare ray ID and block reason from the HTML
        import re
        ray = re.search(r'cloudflare ray id:?\s*([a-f0-9]+)', body, re.I)
        if ray:
            print(f'  CF Ray ID: {ray.group(1)}')
        # Look for block reason
        reason = re.search(r'class="cf-error-details">(.*?)</span>', body, re.S|re.I)
        if reason:
            print(f'  Block reason: {reason.group(1).strip()[:200]}')
        # Check for "blocked" reason code
        code = re.search(r'Error code:?\s*(\d+)', body, re.I)
        if code:
            print(f'  Error code: {code.group(1)}')
