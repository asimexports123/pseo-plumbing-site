import re
from collections import Counter, defaultdict

lines = open('__vercel_logs_spike.txt', encoding='utf-8').readlines()

records = []
for line in lines:
    # Match: HH:MM:SS.ms  yohomefix.com  info   <chars> GET /path   status   (no messa...
    m = re.match(r'(\d{2}:\d{2}:\d{2}\.\d+)\s+yohomefix\.com\s+\w+\s+\S+\s+GET\s+(\S+)\s+(\d+|---)', line)
    if m:
        time_ist, path, status = m.groups()
        # Convert IST to UTC (subtract 5:30)
        h, mn, s = time_ist.split(':')
        s, ms = s.split('.')
        total_sec = int(h)*3600 + int(mn)*60 + int(s) - 5*3600 - 30*60
        if total_sec < 0:
            total_sec += 24*3600
        utc_h = total_sec // 3600
        utc_m = (total_sec % 3600) // 60
        utc_s = total_sec % 60
        records.append({
            'time_ist': time_ist,
            'time_utc': f'{utc_h:02d}:{utc_m:02d}:{utc_s:02d}.{ms}',
            'utc_minute': f'{utc_h:02d}:{utc_m:02d}',
            'path': path,
            'status': status,
        })

print(f"Total parsed: {len(records)}")
if records:
    print(f"Time range IST: {records[-1]['time_ist']} -> {records[0]['time_ist']}")
    print(f"Time range UTC: {records[-1]['time_utc']} -> {records[0]['time_utc']}")

by_minute = Counter()
for r in records:
    by_minute[r['utc_minute']] += 1

print("\n--- Requests per minute (UTC) ---")
for m, count in sorted(by_minute.items()):
    print(f"  {m}: {count}")

status_dist = Counter(r['status'] for r in records)
print("\n--- Status distribution ---")
for s, count in status_dist.most_common():
    print(f"  {s}: {count}")

# Path patterns
patterns = Counter()
for r in records:
    p = r['path']
    if p.startswith('/areas/'):
        parts = [x for x in p.split('/') if x]
        if len(parts) == 4:
            patterns['/areas/{city}/{zip}/{service}'] += 1
        elif len(parts) == 2:
            patterns['/areas/{city}'] += 1
        else:
            patterns['/areas/other'] += 1
    elif p.startswith('/plumber-'):
        patterns['/plumber-{city}-{service}'] += 1
    else:
        patterns[f'other: {p[:30]}'] += 1

print("\n--- Path patterns ---")
for p, count in patterns.most_common():
    print(f"  {p}: {count}")

# Per-second rate
by_second = defaultdict(int)
for r in records:
    h, m, s = r['time_utc'].split(':')
    s = s.split('.')[0]
    by_second[f"{h}:{m}:{s}"] += 1

print("\n--- Requests per second (top 15) ---")
for s, count in sorted(by_second.items(), key=lambda x: -x[1])[:15]:
    print(f"  {s}: {count} req/s")

# Incomplete/timeout
timeouts = [r for r in records if r['status'] == '---']
print(f"\n--- Incomplete (---): {len(timeouts)} ({len(timeouts)/len(records)*100:.1f}%) ---")

# 404s
nf = [r for r in records if r['status'] == '404']
print(f"--- 404: {len(nf)} ({len(nf)/len(records)*100:.1f}%) ---")

# 200s
ok = [r for r in records if r['status'] == '200']
print(f"--- 200: {len(ok)} ({len(ok)/len(records)*100:.1f}%) ---")

# Unique paths
unique = set(r['path'] for r in records)
print(f"--- Unique paths: {len(unique)} ---")

# Check for dotted paths (from our 301 redirect deployment)
dotted = [r for r in records if '.' in r['path']]
print(f"\n--- Paths with dots: {len(dotted)} ---")
for r in dotted[:5]:
    print(f"  {r['time_utc']} {r['path']} -> {r['status']}")

# Check for the 471 GSC 404 paths
import json
try:
    audit = json.load(open('__audit_404s_result2.json'))
    gsc_paths = set(u['path'] for u in audit['urls'])
    matching = [r for r in records if r['path'] in gsc_paths]
    print(f"\n--- Requests matching GSC 404 paths: {len(matching)} ---")
except:
    print("\n--- GSC 404 audit file not available ---")
