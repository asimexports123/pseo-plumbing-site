"""Deploy approved title/meta to Supabase and verify on the live site."""
import os
import time
from datetime import datetime, timezone
import requests
from bs4 import BeautifulSoup

from review_titles import PROPOSED

HEADERS_LIVE = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "identity",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
}
CACHE_BUST = "?ver=deploy-20260730"
ENV_PATH = ".env.local"


def load_env(path):
    env = {}
    if not os.path.exists(path):
        return env
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            v = v.strip().strip('"').strip("'")
            env[k] = v
    return env


def get_supabase_creds(env):
    def _get(keys):
        for k in keys:
            v = env.get(k) or os.environ.get(k)
            if v:
                return v
        return None

    url = _get(["SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL"])
    key = _get(
        [
            "SUPABASE_SERVICE_ROLE_KEY",
            "SUPABASE_ANON_KEY",
            "NEXT_PUBLIC_SUPABASE_ANON_KEY",
            "SUPABASE_KEY",
        ]
    )
    return url, key


def slugify(path):
    return path.lstrip("/")


def deploy():
    env = load_env(ENV_PATH)
    url, key = get_supabase_creds(env)
    if not url or not key:
        print("ERROR: SUPABASE_URL and a Supabase key must be set in .env.local")
        return

    base_url = url.rstrip("/")
    supabase_headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }

    print(f"Deploying {len(PROPOSED)} rows to Supabase...")
    for p in PROPOSED:
        slug = slugify(p["path"])
        update_url = f"{base_url}/rest/v1/cities_data?slug=eq.{slug}"
        body = {
            "meta_title": p["title"],
            "meta_description": p["meta"],
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        try:
            r = requests.patch(
                update_url, headers=supabase_headers, json=body, timeout=30
            )
            r.raise_for_status()
            data = r.json()
            if not data:
                print(f"  ! {slug}: no row returned (slug may not exist)")
            else:
                print(f"  + {slug}: updated")
        except Exception as e:
            print(f"  ! {slug}: update failed - {e}")

    print("\nVerifying in Supabase...")
    for p in PROPOSED:
        slug = slugify(p["path"])
        get_url = (
            f"{base_url}/rest/v1/cities_data?slug=eq.{slug}"
            "&select=slug,meta_title,meta_description"
        )
        try:
            r = requests.get(get_url, headers=supabase_headers, timeout=30)
            r.raise_for_status()
            rows = r.json()
            if not rows:
                print(f"  ! {slug}: not found in DB")
            else:
                row = rows[0]
                title_ok = row["meta_title"] == p["title"]
                meta_ok = row["meta_description"] == p["meta"]
                if title_ok and meta_ok:
                    print(f"  + {slug}: DB matches")
                else:
                    print(
                        f"  ! {slug}: DB mismatch "
                        f"title={title_ok} meta={meta_ok}"
                    )
        except Exception as e:
            print(f"  ! {slug}: readback failed - {e}")

    print("\nVerifying live pages (2 attempts for ISR)...")
    for p in PROPOSED:
        slug = slugify(p["path"])
        live_url = f"https://yohomefix.com{p['path']}{CACHE_BUST}"
        for attempt in range(2):
            try:
                r = requests.get(
                    live_url, headers=HEADERS_LIVE, verify=False, timeout=25
                )
                r.raise_for_status()
                soup = BeautifulSoup(r.text, "html.parser")
                live_title = soup.title.get_text(strip=True) if soup.title else ""
                desc_tag = soup.find("meta", {"name": "description"})
                live_meta = (
                    desc_tag["content"]
                    if desc_tag and desc_tag.has_attr("content")
                    else ""
                )
                title_ok = live_title == p["title"]
                meta_ok = live_meta == p["meta"]
                if title_ok and meta_ok:
                    print(f"  + {slug}: live title+meta match")
                    break
                print(
                    f"  ! {slug}: live mismatch (attempt {attempt + 1}) "
                    f"title={live_title!r} meta={live_meta!r}"
                )
                if attempt == 0:
                    time.sleep(3)
            except Exception as e:
                print(f"  ! {slug}: live fetch failed - {e}")
                break


if __name__ == "__main__":
    deploy()
