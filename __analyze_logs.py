import json
from datetime import datetime, timezone
from collections import Counter

# Parse the existing vercel-all-logs.jsonl
lines = open('vercel-all-logs.jsonl', encoding='utf-8').readlines()
records = []
for line in lines:
    line = line.strip()
    if not line:
        continue
    try:
        rec = json.loads(line)
        records.append(rec)
    except:
        pass

print(f"Total records in vercel-all-logs.jsonl: {len(records)}")

# Convert timestamps to datetime
for rec in records:
    ts = rec.get('timestamp', 0)
    if ts > 1000000000000:  # ms
        rec['dt'] = datetime.fromtimestamp(ts/1000, tz=timezone.utc)
    elif ts > 1000000000:  # seconds
        rec['dt'] = datetime.fromtimestamp(ts, tz=timezone.utc)
    else:
        rec['dt'] = None

# Sort by timestamp
records.sort(key=lambda r: r.get('timestamp', 0))

if records:
    print(f"Time range: {records[0]['dt']} to {records[-1]['dt']}")

# Count by 5-minute buckets
buckets = Counter()
status_codes = Counter()
sources = Counter()
caches = Counter()
paths_by_prefix = Counter()
status_by_source = Counter()

for rec in records:
    dt = rec.get('dt')
    if dt:
        bucket = dt.strftime('%Y-%m-%d %H:%M')[:14] + '0'  # 10-min bucket
        buckets[bucket] += 1
    status = rec.get('responseStatusCode')
    if status:
        status_codes[status] += 1
    src = rec.get('source', 'unknown')
    sources[src] += 1
    cache = rec.get('cache', 'unknown')
    caches[cache] += 1
    path = rec.get('requestPath', '')
    if path.startswith('/areas/'):
        paths_by_prefix['/areas/'] += 1
    elif path.startswith('/plumber-'):
        paths_by_prefix['/plumber-'] += 1
    elif path.startswith('/cost/'):
        paths_by_prefix['/cost/'] += 1
    elif path.startswith('/api/'):
        paths_by_prefix['/api/'] += 1
    else:
        paths_by_prefix['other'] += 1
    status_by_source[f"{src}_{status}"] += 1

print("\n--- 10-minute buckets ---")
for b, count in sorted(buckets.items()):
    print(f"  {b}: {count} requests")

print("\n--- Status codes ---")
for s, count in status_codes.most_common():
    print(f"  {s}: {count}")

print("\n--- Sources ---")
for s, count in sources.most_common():
    print(f"  {s}: {count}")

print("\n--- Cache status ---")
for c, count in caches.most_common():
    print(f"  {c}: {count}")

print("\n--- Path prefixes ---")
for p, count in paths_by_prefix.most_common():
    print(f"  {p}: {count}")

print("\n--- Source + Status ---")
for s, count in status_by_source.most_common():
    print(f"  {s}: {count}")

# Check for errors
errors = [r for r in records if r.get('level') in ('error', 'warn')]
print(f"\n--- Errors/warnings: {len(errors)} ---")
for e in errors[:10]:
    print(f"  {e.get('dt')} {e.get('level')} {e.get('requestPath')} {e.get('responseStatusCode')} {e.get('message','')[:100]}")
