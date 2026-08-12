# Marketcall API Validation Report

Generated: 2026-08-05T23:59:30.987552+00:00
Campaign ID: 348734
Window: last 30 day(s)

_API key is never included in this report or in any log line produced by this run._

## 1. Authentication: SUCCESS

`GET /calls/count` returned HTTP 200 for campaign `348734`, 2026-07-06 to 2026-08-05.

### /calls/count response (redacted)
```json
{
  "data": {
    "count": 4,
    "date_from": "2026-07-06 00:00:00",
    "date_to": "2026-08-05 00:00:00"
  },
  "request_id": "50d2759e-3cde-4280-ab4c-ab48c5024f78"
}
```

## 2. Pagination: FAILED

- status_code: `422`
- endpoint: `/calls`
- message: Marketcall API returned 422 for /calls