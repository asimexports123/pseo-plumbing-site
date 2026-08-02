"""
Read-only Marketcall reporting client.

Marketcall does not publish a standardized public reporting API. This module
uses the most common integration patterns:
1. A REST API key for call / campaign reports (base URL may vary by account).
2. A postback/reports export endpoint for landing-page attribution.

Fill MARKETCALL_API_KEY and, if needed, the correct API base in config.py.
"""
import requests
from datetime import datetime
from config import MARKETCALL_API_KEY, MARKETCALL_API_BASE, CAMPAIGN_ID


def _get(endpoint, params=None):
    headers = {}
    if MARKETCALL_API_KEY:
        headers['Authorization'] = f'Bearer {MARKETCALL_API_KEY}'
    url = f'{MARKETCALL_API_BASE}{endpoint}'
    response = requests.get(url, headers=headers, params=params or {}, timeout=30)
    response.raise_for_status()
    return response.json()


def fetch_calls(start_date, end_date, campaign_id=None):
    """
    Fetch call records for a date range.
    Adjust endpoint/params once the correct Marketcall API docs are available.
    """
    params = {
        'date_from': start_date,
        'date_to': end_date,
    }
    if campaign_id:
        params['campaign_id'] = campaign_id
    elif CAMPAIGN_ID:
        params['campaign_id'] = CAMPAIGN_ID
    try:
        return _get('/api/v1/calls', params)
    except Exception as e:
        print(f'Marketcall calls fetch failed: {e}')
        return []


def fetch_landing_page_attribution(start_date, end_date, campaign_id=None):
    """
    Try to fetch call attribution by landing page or subid.
    Often available through a reports/export endpoint.
    """
    params = {
        'date_from': start_date,
        'date_to': end_date,
        'group_by': 'landing_page',
    }
    if campaign_id:
        params['campaign_id'] = campaign_id
    elif CAMPAIGN_ID:
        params['campaign_id'] = CAMPAIGN_ID
    try:
        return _get('/api/v1/reports/calls', params)
    except Exception as e:
        print(f'Marketcall landing page attribution failed: {e}')
        return []


def fetch_qualified_calls(start_date, end_date, campaign_id=None):
    """
    Fetch calls filtered by qualified/billable status if the API supports it.
    """
    params = {
        'date_from': start_date,
        'date_to': end_date,
        'status': 'qualified',
    }
    if campaign_id:
        params['campaign_id'] = campaign_id
    elif CAMPAIGN_ID:
        params['campaign_id'] = CAMPAIGN_ID
    try:
        return _get('/api/v1/calls', params)
    except Exception as e:
        print(f'Marketcall qualified calls fetch failed: {e}')
        return []
