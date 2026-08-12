import re
from collections import Counter

# Parse the spike logs
lines = open('__vercel_logs_spike.txt', encoding='utf-8').readlines()

records = []
for line in lines:
    # Match pattern: HH:MM:SS.ms  domain  level   ... GET /path   status
    m = re.match(r'(\d{2}):(\d{2}):(\d{2})\.(\d+)\s+yohomefix\.com\s+(\w+)\s+.\s+GET\s+(\S+)\s+(\d+|---)', line)
    if m:
        hh, mm, ss, ms, level, path, status = m.groups()
        # Convert IST to UTC (subtract 5:30)
        total_sec_ist = int(hh)*3600 + int(mm)*60 + int(ss)
        total_sec_utc = total_sec_ist - 5*3600 - 30*60
        if total_sec_utc < 0:
            total_sec_utc += 24*3600
        utc_hh = total_sec_utc // 3600
        utc_mm = (total_sec_utc % 3600) // 60
        utc_ss = total_sec_utc % 60
        records.append({
            'time_ist': f'{hh}:{mm}:{ss}.{ms}',
            'time_utc': f'{utc_hh:02d}:{utc_mm:02d}:{utc_ss:02d}',
            'level': level,
            'path': path,
            'status': status,
            'utc_minute': f'{utc_hh:02d}:{utc_mm:02d}',
        })

print(f"Total parsed log entries: {len(records)}")
if records:
    print(f"Time range (IST): {records[-1]['time_ist']} to {records[0]['time_ist']}")
    print(f"Time range (UTC): {records[-1]['time_utc']} to {records[0]['time_utc']}")

# Count by minute
by_minute = Counter()
status_by_minute = Counter()
for r in records:
    by_minute[r['utc_minute']] += 1
    status_by_minute[f"{r['utc_minute']}_{r['status']}"] += 1

print("\n--- Requests per minute (UTC) ---")
for m, count in sorted(by_minute.items()):
    print(f"  {m}: {count} requests")

# Status distribution
status_dist = Counter(r['status'] for r in records)
print("\n--- Status distribution ---")
for s, count in status_dist.most_common():
    print(f"  {s}: {count}")

# Path patterns
path_patterns = Counter()
for r in records:
    p = r['path']
    if p.startswith('/areas/'):
        parts = p.split('/')
        if len(parts) >= 5:
            path_patterns[f'/areas/{{city}}/{{zip}}/{{service}}'] += 1
        elif len(parts) == 3:
            path_patterns[f'/areas/{{city}}'] += 1
        else:
            path_patterns[f'/areas/other'] += 1
    elif p.startswith('/plumber-'):
        path_patterns['/plumber-{city}-{service}'] += 1
    elif p.startswith('/cost/'):
        path_patterns['/cost/{city}'] += 1
    else:
        path_patterns[f'other: {p[:40]}'] += 1

print("\n--- Path patterns ---")
for p, count in path_patterns.most_common():
    print(f"  {p}: {count}")

# Check for --- status (timeouts/incomplete)
timeouts = [r for r in records if r['status'] == '---']
print(f"\n--- Incomplete/timeout responses (---): {len(timeouts)} ---")

# Request rate per second
from collections import defaultdict
by_second = defaultdict(int)
for r in records:
    h, m, s = r['time_utc'].split(':')
    by_second[f"{h}:{m}:{s}"] += 1

print("\n--- Requests per second (top 10) ---")
for s, count in sorted(by_second.items(), key=lambda x: -x[1])[:10]:
    print(f"  {s}: {count} req/s")

# Unique paths
unique_paths = set(r['path'] for r in records)
print(f"\n--- Unique paths: {len(unique_paths)} ---")

# 404 paths
not_found = [r for r in records if r['status'] == '404']
print(f"--- 404 responses: {len(not_found)} ---")
nf_paths = Counter(r['path'] for r in not_found)
print(f"  Unique 404 paths: {len(nf_paths)}")
for p, c in nf_paths.most_common(10):
    print(f"    {p}: {c}")

# Check for dots/special chars in paths (the redirect targets we just deployed)
dotted = [r for r in records if '.' in r['path'] or "'" in r['path']]
print(f"\n--- Paths with dots/apostrophes: {len(dotted)} ---")
for r in dotted[:10]:
    print(f"  {r['time_utc']} {r['path']} -> {r['status']}")
