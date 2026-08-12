import re
from collections import Counter, defaultdict

lines = open('__vercel_logs_latest.txt', encoding='utf-8').readlines()

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

# Per-minute
by_minute = Counter()
status_by_minute = defaultdict(lambda: Counter())
for r in records:
    by_minute[r['utc_minute']] += 1
    status_by_minute[r['utc_minute']][r['status']] += 1

print("\n--- Per minute (UTC) ---")
for m in sorted(by_minute.keys()):
    s = status_by_minute[m]
    total = by_minute[m]
    print(f"  {m}: {total} reqs | 200={s['200']} 404={s['404']} ---={s['---']} 403={s['403']} other={sum(v for k,v in s.items() if k not in ('200','404','---','403'))}")

# Overall status
status_dist = Counter(r['status'] for r in records)
print("\n--- Overall status ---")
for s, c in status_dist.most_common():
    print(f"  {s}: {c} ({c/len(records)*100:.1f}%)")

# Per-second rate
by_second = defaultdict(int)
for r in records:
    h, m, s = r['time_utc'].split(':')
    s = s.split('.')[0]
    by_second[f"{h}:{m}:{s}"] += 1

print("\n--- Requests per second (top 10) ---")
for s, c in sorted(by_second.items(), key=lambda x: -x[1])[:10]:
    print(f"  {s}: {c} req/s")

# Unique paths
unique = set(r['path'] for r in records)
print(f"\n--- Unique paths: {len(unique)} out of {len(records)} requests ---")

# Error-level entries
error_lines = [l for l in lines if ' error ' in l.lower() or ' warn ' in l.lower() or ' fatal ' in l.lower()]
print(f"\n--- Error/warning lines: {len(error_lines)} ---")
for e in error_lines[:5]:
    print(f"  {e.strip()[:120]}")
