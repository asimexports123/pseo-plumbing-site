"""
Read-only Google Search Console client.
Fetches performance by page/query and indexing/crawl stats.
"""
from googleapiclient.discovery import build
from google.oauth2 import service_account
from config import GSC_PROPERTY, GOOGLE_SERVICE_ACCOUNT_JSON


def _get_service():
    creds = service_account.Credentials.from_service_account_file(
        GOOGLE_SERVICE_ACCOUNT_JSON,
        scopes=['https://www.googleapis.com/auth/webmasters.readonly'],
    )
    return build('webmasters', 'v3', credentials=creds)


def fetch_performance(start_date, end_date, dimensions=None, row_limit=25000):
    """Return list of rows: {keys, clicks, impressions, ctr, position}."""
    if dimensions is None:
        dimensions = ['page', 'query']
    service = _get_service()
    body = {
        'startDate': start_date,
        'endDate': end_date,
        'dimensions': dimensions,
        'rowLimit': row_limit,
        'startRow': 0,
    }
    response = service.searchanalytics().query(siteUrl=GSC_PROPERTY, body=body).execute()
    return response.get('rows', [])


def fetch_pages(start_date, end_date, row_limit=5000):
    """Aggregate performance by landing page."""
    return fetch_performance(start_date, end_date, dimensions=['page'], row_limit=row_limit)


def fetch_queries(start_date, end_date, row_limit=10000):
    """Aggregate performance by query."""
    return fetch_performance(start_date, end_date, dimensions=['query'], row_limit=row_limit)


def fetch_page_queries(start_date, end_date, page_filter, row_limit=1000):
    """Queries for a specific page, useful for per-page optimization."""
    service = _get_service()
    body = {
        'startDate': start_date,
        'endDate': end_date,
        'dimensions': ['query'],
        'dimensionFilterGroups': [{
            'filters': [{
                'dimension': 'page',
                'operator': 'equals',
                'expression': page_filter,
            }]
        }],
        'rowLimit': row_limit,
        'startRow': 0,
    }
    response = service.searchanalytics().query(siteUrl=GSC_PROPERTY, body=body).execute()
    return response.get('rows', [])


def fetch_indexing_stats():
    """Return a dict with sitemap and indexing status."""
    service = _get_service()
    site_info = service.sites().get(siteUrl=GSC_PROPERTY).execute()
    sitemaps = service.sitemaps().list(siteUrl=GSC_PROPERTY).execute()
    return {
        'site_info': site_info,
        'sitemaps': sitemaps.get('sitemap', []),
    }
