"""
Read-only Google Analytics 4 client.
Fetches users, landing pages, traffic sources, events, and conversion paths.
"""
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    DateRange, Dimension, Metric, RunReportRequest, Filter, FilterExpression,
)
from config import GA4_PROPERTY_ID, load_google_credentials


def _get_client():
    creds = load_google_credentials(scopes=['https://www.googleapis.com/auth/analytics.readonly'])
    return BetaAnalyticsDataClient(credentials=creds)


def _run_report(dimensions, metrics, date_ranges, limit=10000, dimension_filter=None):
    client = _get_client()
    request = RunReportRequest(
        property=f'properties/{GA4_PROPERTY_ID}',
        dimensions=[Dimension(name=d) for d in dimensions],
        metrics=[Metric(name=m) for m in metrics],
        date_ranges=[DateRange(start_date=d['start'], end_date=d['end']) for d in date_ranges],
        limit=limit,
    )
    if dimension_filter:
        request.dimension_filter = dimension_filter
    return client.run_report(request)


def fetch_overview(start_date, end_date):
    """High-level traffic and engagement."""
    return _run_report(
        dimensions=[],
        metrics=['totalUsers', 'newUsers', 'sessions', 'engagementRate', 'conversions'],
        date_ranges=[{'start': start_date, 'end': end_date}],
    ).rows


def fetch_landing_pages(start_date, end_date, limit=5000):
    """Sessions, users, events by landing page."""
    return _run_report(
        dimensions=['landingPage'],
        metrics=['sessions', 'totalUsers', 'newUsers', 'engagementRate', 'eventCount'],
        date_ranges=[{'start': start_date, 'end': end_date}],
        limit=limit,
    ).rows


def fetch_traffic_sources(start_date, end_date, limit=1000):
    """Sessions and users by source/medium/campaign."""
    return _run_report(
        dimensions=['sessionSource', 'sessionMedium', 'sessionCampaign'],
        metrics=['sessions', 'totalUsers', 'conversions'],
        date_ranges=[{'start': start_date, 'end': end_date}],
        limit=limit,
    ).rows


def fetch_call_click_events(start_date, end_date, limit=10000):
    """call_click event counts by label, city, service."""
    event_filter = FilterExpression(
        filter=Filter(field_name='eventName', in_list_filter={'values': ['call_click']})
    )
    return _run_report(
        dimensions=['eventName', 'eventLabel', 'pageLocation'],
        metrics=['eventCount', 'totalUsers'],
        date_ranges=[{'start': start_date, 'end': end_date}],
        dimension_filter=event_filter,
        limit=limit,
    ).rows


def fetch_conversion_paths(start_date, end_date, limit=5000):
    """Landing page + source/medium that lead to call_click events."""
    event_filter = FilterExpression(
        filter=Filter(field_name='eventName', in_list_filter={'values': ['call_click']})
    )
    return _run_report(
        dimensions=['landingPage', 'sessionSource', 'sessionMedium'],
        metrics=['eventCount', 'totalUsers'],
        date_ranges=[{'start': start_date, 'end': end_date}],
        dimension_filter=event_filter,
        limit=limit,
    ).rows


def fetch_landing_page_engagement(start_date, end_date, limit=10000):
    """
    Sessions, users, and engagement-quality metrics by landing page. Richer
    than fetch_landing_pages() above (adds engagedSessions,
    userEngagementDuration, conversions) for callers that need a fuller
    per-page engagement picture (e.g. scripts/decision_engine/ga4_ingestion.py).
    """
    return _run_report(
        dimensions=['landingPage'],
        metrics=[
            'sessions', 'engagedSessions', 'engagementRate',
            'userEngagementDuration', 'totalUsers', 'newUsers', 'conversions',
        ],
        date_ranges=[{'start': start_date, 'end': end_date}],
        limit=limit,
    ).rows


def fetch_events_by_landing_page(start_date, end_date, event_names, limit=10000):
    """
    eventCount by landing page, filtered to the given event names (e.g.
    ['call_click']). Note: `landingPage` is the session's entry page, not
    necessarily the exact page the event fired on -- standard GA4
    landing-page-scoped reporting semantics, not a per-event page dimension.
    """
    event_filter = FilterExpression(
        filter=Filter(field_name='eventName', in_list_filter={'values': list(event_names)})
    )
    return _run_report(
        dimensions=['landingPage', 'eventName'],
        metrics=['eventCount'],
        date_ranges=[{'start': start_date, 'end': end_date}],
        dimension_filter=event_filter,
        limit=limit,
    ).rows
