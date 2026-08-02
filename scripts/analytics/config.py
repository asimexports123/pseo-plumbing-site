import json
import os
from pathlib import Path

# Path to a Google Cloud service account JSON with read-only access to
# Google Search Console and Google Analytics 4.
GOOGLE_SERVICE_ACCOUNT_JSON = os.environ.get(
    'GOOGLE_SERVICE_ACCOUNT_JSON',
    str(Path(__file__).parent / 'service-account.json')
)

# GSC property format: 'sc-domain:yohomefix.com' or 'https://yohomefix.com/'
GSC_PROPERTY = os.environ.get('GSC_PROPERTY', 'sc-domain:yohomefix.com')

# GA4 property ID (numeric, e.g. '123456789')
GA4_PROPERTY_ID = os.environ.get('GA4_PROPERTY_ID', '')

# Marketcall credentials
MARKETCALL_API_KEY = os.environ.get('MARKETCALL_API_KEY', '')
MARKETCALL_API_BASE = os.environ.get('MARKETCALL_API_BASE', 'https://api.marketcall.com')

# Site/campaign context for YoHomeFix
DOMAIN = 'https://yohomefix.com'
SITE_ID = 3143
CAMPAIGN_ID = 348734


def load_google_credentials():
    from google.oauth2 import service_account
    if not Path(GOOGLE_SERVICE_ACCOUNT_JSON).exists():
        raise FileNotFoundError(
            f"Google service account JSON not found at {GOOGLE_SERVICE_ACCOUNT_JSON}. "
            "Set GOOGLE_SERVICE_ACCOUNT_JSON or place service-account.json in scripts/analytics/."
        )
    return service_account.Credentials.from_service_account_file(
        GOOGLE_SERVICE_ACCOUNT_JSON,
        scopes=[
            'https://www.googleapis.com/auth/webmasters.readonly',
            'https://www.googleapis.com/auth/analytics.readonly',
        ],
    )
