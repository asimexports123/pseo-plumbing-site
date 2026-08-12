import re
from collections import Counter

lines = open('__vercel_logs_spike.txt', encoding='utf-8').readlines()

records = []
for line in lines:
    m = re.match(r'(\d{2}:\d{2}:\d{2}\.\d+)\s+yohomefix\.com\s+\w+\s+\S+\s+GET\s+(\S+)\s+(\d+|---)', line)
    if m:
        time_ist, path, status = m.groups()
        h, mn, s = time_ist.split(':')
        s, ms = s.split('.')
        total_sec = int(h)*3600 + int(mn)*60 + int(s) - 5*3600 - 30*60
        if total_sec < 0: total_sec += 24*3600
        utc_h = total_sec // 3600
        utc_m = (total_sec % 3600) // 60
        utc_s = total_sec % 60
        records.append({
            'time_utc': f'{utc_h:02d}:{utc_m:02d}:{utc_s:02d}.{ms}',
            'path': path,
            'status': status,
        })

# 403 responses - likely Cloudflare blocks
forbidden = [r for r in records if r['status'] == '403']
print(f"--- 403 responses: {len(forbidden)} ---")
for r in forbidden:
    print(f"  {r['time_utc']} {r['path']}")

# --- (incomplete/timeout) responses
timeouts = [r for r in records if r['status'] == '---']
print(f"\n--- Incomplete (---): {len(timeouts)} ---")
# Check if they cluster by time
timeout_times = Counter(r['time_utc'][:5] for r in timeouts)
for t, c in sorted(timeout_times.items()):
    print(f"  {t}: {c}")

# Check repeated paths (same URL hit multiple times)
path_counts = Counter(r['path'] for r in records)
repeated = [(p, c) for p, c in path_counts.most_common() if c > 1]
print(f"\n--- Repeated paths (hit >1 time): {len(repeated)} ---")
for p, c in repeated[:20]:
    statuses = [r['status'] for r in records if r['path'] == p]
    print(f"  {p}: {c}x -> {statuses}")

# Check if the paths that got 404 are the ones from our redirect list
import json
try:
    redirects = json.load(open('lib/redirects.json'))
    redirect_sources = set(r['source'] for r in redirects)
    matching_404 = [r for r in records if r['status'] == '404' and r['path'] in redirect_sources]
    print(f"\n--- 404 paths that should have been redirected: {len(matching_404)} ---")
    for r in matching_404[:10]:
        print(f"  {r['time_utc']} {r['path']}")
except:
    print("\n--- redirects.json not available ---")

# Deployments timeline
print("\n=== DEPLOYMENT TIMELINE ===")
print("Deploy 1: ~01:06 UTC (28m before 07:04 IST)")
print("Deploy 2: ~01:08 UTC (26m before)")
print("Deploy 3: ~01:15 UTC (19m before) - 463 redirects deployment")
print("Deploy 4: ~01:25 UTC (9m before) - robots.txt fix")
print("Spike reported: 01:20 UTC")
print("Logs captured: 01:34-01:35 UTC")
print(f"Current request rate: ~45 req/s, {len(records)} requests in ~11 seconds")
