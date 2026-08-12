import json
import os
from pathlib import Path

from dotenv import load_dotenv

# These scripts run outside Next.js, so .env is not auto-loaded — load it
# explicitly. Project-root .env takes precedence if already set in the shell.
load_dotenv(Path(__file__).parent.parent.parent / '.env')

# Path to a Google Cloud service account JSON with read-only access to
# Google Search Console and Google Analytics 4. Optional — if not present,
# credentials are built from GSC_SERVICE_ACCOUNT_EMAIL + GSC_PRIVATE_KEY below.
GOOGLE_SERVICE_ACCOUNT_JSON = os.environ.get(
    'GOOGLE_SERVICE_ACCOUNT_JSON',
    str(Path(__file__).parent / 'service-account.json')
)

# Alternative to GOOGLE_SERVICE_ACCOUNT_JSON: the service account's raw
# client_email and private_key, as already stored in .env. GSC_PRIVATE_KEY
# is expected to contain literal `\n` escapes (as it does in .env) or real
# newlines; both are normalized in load_google_credentials().
GSC_SERVICE_ACCOUNT_EMAIL = os.environ.get('GSC_SERVICE_ACCOUNT_EMAIL', '')
GSC_PRIVATE_KEY = os.environ.get('GSC_PRIVATE_KEY', '')

# GSC property format: 'sc-domain:yohomefix.com' or 'https://yohomefix.com/'
# GSC_SITE_URL is the name already used in .env; GSC_PROPERTY overrides it.
GSC_PROPERTY = os.environ.get('GSC_PROPERTY') or os.environ.get('GSC_SITE_URL', 'sc-domain:yohomefix.com')

# GA4 property ID (numeric, e.g. '123456789')
GA4_PROPERTY_ID = os.environ.get('GA4_PROPERTY_ID', '')

# Marketcall Affiliate API — confirmed official base path (public, not a secret).
# The API key itself (MARKETCALL_API_KEY) has no default: it must come only
# from the environment. See scripts/analytics/marketcall_client.py.
MARKETCALL_API_BASE = os.environ.get('MARKETCALL_API_BASE', 'https://www.marketcall.com/api/v1/affiliate/')

# Site/campaign context for YoHomeFix
DOMAIN = 'https://yohomefix.com'
SITE_ID = 3143
CAMPAIGN_ID = 348734


def load_google_credentials(scopes):
    """
    Build Google service-account credentials for the given scopes.
    Prefers a full service-account JSON file (GOOGLE_SERVICE_ACCOUNT_JSON) if
    it exists; otherwise falls back to GSC_SERVICE_ACCOUNT_EMAIL +
    GSC_PRIVATE_KEY (already present in .env). Raises if neither is available
    — no credential is ever invented.
    """
    from google.oauth2 import service_account

    if Path(GOOGLE_SERVICE_ACCOUNT_JSON).exists():
        return service_account.Credentials.from_service_account_file(
            GOOGLE_SERVICE_ACCOUNT_JSON, scopes=scopes,
        )

    if GSC_SERVICE_ACCOUNT_EMAIL and GSC_PRIVATE_KEY:
        return service_account.Credentials.from_service_account_info(
            {
                'type': 'service_account',
                'client_email': GSC_SERVICE_ACCOUNT_EMAIL,
                'private_key': GSC_PRIVATE_KEY.replace('\\n', '\n'),
                'token_uri': 'https://oauth2.googleapis.com/token',
            },
            scopes=scopes,
        )

    raise FileNotFoundError(
        f"No Google credentials found. Set GOOGLE_SERVICE_ACCOUNT_JSON to a "
        f"service-account JSON file path (checked: {GOOGLE_SERVICE_ACCOUNT_JSON}), "
        "or set both GSC_SERVICE_ACCOUNT_EMAIL and GSC_PRIVATE_KEY in .env."
    )
