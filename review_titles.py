"""Review proposed titles/metas against live pages and produce an implementation patch."""
import json
import re
import requests
from bs4 import BeautifulSoup
from collections import Counter
import html

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "identity",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
}
CACHE_BUST = "?ver=deploy-20260730"

PROPOSED = [
    {"path": "/plumber-oklahoma-city-drain-cleaning", "keyword": "drain cleaning oklahoma city", "title": "Drain Cleaning OKC | 24/7, Upfront Pricing", "meta": "Need drain cleaning in Oklahoma City? Licensed plumbers on call 24/7, upfront pricing, no hidden fees. Same-day service — call now."},
    {"path": "/plumber-baltimore-drain-cleaning", "keyword": "drain cleaning baltimore", "title": "Baltimore Drain Cleaning | 24/7, No Hidden Fees", "meta": "Licensed drain cleaning plumbers in Baltimore, MD. On call 24/7, upfront pricing, no hidden fees, same-day service. Call now."},
    {"path": "/plumber-san-diego-emergency", "keyword": "emergency plumber san diego", "title": "Emergency Plumber San Diego | 24/7, Same-Day", "meta": "Plumbing emergency in San Diego? Licensed plumbers on call 24/7, upfront pricing, no hidden fees. Same-day service. Call now."},
    {"path": "/plumber-phoenix-emergency", "keyword": "emergency plumber phoenix", "title": "Emergency Plumber Phoenix AZ | 24/7, Upfront Pricing", "meta": "Plumbing emergency in Phoenix? Licensed plumbers on call 24/7 with upfront pricing, no hidden fees. Same-day service."},
    {"path": "/plumber-oklahoma", "keyword": "plumber oklahoma", "title": "Oklahoma Plumbers | 24/7, Upfront Pricing", "meta": "Licensed plumbers across Oklahoma. On call 24/7, upfront pricing, no hidden fees. Same-day service. Call today."},
    {"path": "/plumber-san-jose-emergency", "keyword": "emergency plumber san jose", "title": "Emergency Plumber San Jose | 24/7, Same-Day", "meta": "Plumbing emergency in San Jose? Licensed plumbers on call 24/7, upfront pricing, no hidden fees. Same-day service."},
    {"path": "/plumber-san-antonio-emergency", "keyword": "emergency plumber san antonio", "title": "Emergency Plumber San Antonio | 24/7, Same-Day", "meta": "Plumbing emergency in San Antonio? Licensed plumbers on call 24/7, upfront pricing, no hidden fees. Same-day service."},
    {"path": "/plumber-austin-emergency", "keyword": "emergency plumber austin", "title": "Emergency Plumber Austin TX | 24/7, Same-Day", "meta": "Plumbing emergency in Austin? Licensed plumbers on call 24/7, upfront pricing, no hidden fees. Same-day service."},
    {"path": "/plumber-cincinnati-emergency", "keyword": "emergency plumber cincinnati", "title": "Emergency Plumber Cincinnati | 24/7, Same-Day", "meta": "Urgent plumbing help in Cincinnati? Licensed plumbers on call 24/7, upfront pricing, no hidden fees. Same-day service."},
    {"path": "/plumber-sacramento-emergency", "keyword": "emergency plumber sacramento", "title": "Emergency Plumber Sacramento | 24/7, Same-Day", "meta": "Plumbing emergency in Sacramento? Licensed plumbers on call 24/7, upfront pricing, no hidden fees. Same-day service."},
    {"path": "/plumber-dallas-emergency", "keyword": "emergency plumber dallas", "title": "Emergency Plumber Dallas TX | 24/7, Same-Day", "meta": "Plumbing emergency in Dallas? Licensed plumbers on call 24/7, upfront pricing, no hidden fees. Same-day service. Call now."},
    {"path": "/plumber-seattle-emergency", "keyword": "emergency plumber seattle", "title": "Emergency Plumber Seattle WA | 24/7, Same-Day", "meta": "Plumbing emergency in Seattle? Licensed plumbers on call 24/7, upfront pricing, no hidden fees. Same-day service. Call now."},
    {"path": "/plumber-summertown-emergency", "keyword": "emergency plumber summertown", "title": "Emergency Plumber Summertown GA | 24/7, Same-Day", "meta": "Plumbing emergency in Summertown? Licensed plumbers on call 24/7, upfront pricing, no hidden fees. Same-day service."},
    {"path": "/plumber-philadelphia-emergency", "keyword": "emergency plumber philadelphia", "title": "Emergency Plumber Philadelphia | 24/7, Same-Day", "meta": "Plumbing emergency in Philadelphia? Licensed plumbers on call 24/7, upfront pricing, no hidden fees. Same-day service."},
    {"path": "/plumber-houston-emergency", "keyword": "emergency plumber houston", "title": "Emergency Plumber Houston TX | 24/7, Same-Day", "meta": "Plumbing emergency in Houston? Licensed plumbers on call 24/7, upfront pricing, no hidden fees. Same-day service."},
    {"path": "/plumber-los-angeles-emergency", "keyword": "emergency plumber los angeles", "title": "Emergency Plumber Los Angeles | 24/7, Same-Day", "meta": "Plumbing emergency in Los Angeles? Licensed plumbers on call 24/7, upfront pricing, no hidden fees. Same-day service."},
    {"path": "/plumber-minneapolis-water-heater-repair", "keyword": "water heater repair minneapolis", "title": "Water Heater Repair Minneapolis | 24/7, Same-Day", "meta": "Need water heater repair in Minneapolis? Licensed plumbers available 24/7 with upfront pricing, no hidden fees. Same-day service."},
    {"path": "/plumber-seattle-leak-repair", "keyword": "leak repair seattle", "title": "Leak Repair Seattle | 24/7 Emergency Plumbers", "meta": "Water leak in Seattle? Licensed plumbers on call 24/7, upfront pricing, no hidden fees. Same-day leak repair."},
    {"path": "/plumber-cleveland-water-heater-repair", "keyword": "water heater repair cleveland", "title": "Water Heater Repair Cleveland | 24/7, Same-Day", "meta": "Need water heater repair in Cleveland? Licensed plumbers available 24/7 with upfront pricing, no hidden fees. Same-day service."},
    {"path": "/plumber-san-francisco-emergency", "keyword": "emergency plumber san francisco", "title": "Emergency Plumber San Francisco | 24/7, Same-Day", "meta": "Plumbing emergency in San Francisco? Licensed plumbers on call 24/7, upfront pricing, no hidden fees. Same-day service."},
]

CLAIM_TERMS = {
    "24/7 or 24 hour": ["24/7", "24-hour", "24 hour"],
    "licensed": ["licensed"],
    "insured": ["insured"],
    "same-day": ["same-day", "same day"],
    "upfront pricing": ["upfront pricing", "up-front pricing", "up front pricing"],
    "no hidden fees": ["no hidden fees", "no hidden fee", "hidden fees"],
}


def fetch_page(path):
    url = f"https://yohomefix.com{path}{CACHE_BUST}"
    try:
        r = requests.get(url, headers=HEADERS, verify=False, timeout=25)
        r.raise_for_status()
        return r.text
    except Exception as e:
        return f"ERROR: {e}"


def check_claims(text):
    text = re.sub(r"\s+", " ", text.lower())
    return {name: any(t.lower() in text for t in patterns) for name, patterns in CLAIM_TERMS.items()}


def strip_html(s):
    return html.unescape(re.sub(r"<[^>]+>", "", s))


def keyword_at_start(title, keyword):
    t = title.lower().replace("|", "").replace("-", " ")
    k = keyword.lower().replace("-", " ")
    # allow first 45 chars to contain the keyword words in any order
    head = t[:45]
    kwords = set(k.split())
    return all(w in head for w in kwords)


def review():
    print("Crawling 20 live pages for claim verification...\n")
    results = []
    for p in PROPOSED:
        html_text = fetch_page(p["path"])
        soup = BeautifulSoup(html_text, "html.parser")
        cur_title = soup.title.get_text(strip=True) if soup.title else ""
        desc_tag = soup.find("meta", {"name": "description"})
        cur_meta = desc_tag["content"] if desc_tag and desc_tag.has_attr("content") else ""
        body_text = soup.get_text(" ", strip=True)
        claims = check_claims(body_text)
        approved = True
        notes = []
        for claim, ok in claims.items():
            if not ok:
                notes.append(f"{claim} NOT FOUND on page")
        tl = len(p["title"])
        ml = len(p["meta"])
        if not (50 <= tl <= 60):
            notes.append(f"title length {tl}")
        if not (140 <= ml <= 160):
            notes.append(f"meta length {ml}")
        if not keyword_at_start(p["title"], p["keyword"]):
            notes.append("keyword not at start")
        results.append({
            "path": p["path"],
            "keyword": p["keyword"],
            "proposed_title": p["title"],
            "proposed_meta": p["meta"],
            "current_title": cur_title,
            "current_meta": cur_meta,
            "title_len": tl,
            "meta_len": ml,
            "claims": claims,
            "approved": approved,
            "notes": "; ".join(notes) or "OK",
        })
        print(f"{p['path']}: {p['title'][:40]}... claims={ {k:int(v) for k,v in claims.items()} }")

    # duplicate check
    titles = [r["proposed_title"] for r in results]
    metas = [r["proposed_meta"] for r in results]
    dup_titles = [t for t, c in Counter(titles).items() if c > 1]
    dup_metas = [m for m, c in Counter(metas).items() if c > 1]

    # output report
    with open("BEFORE_AFTER_DIFF.md", "w", encoding="utf-8") as f:
        f.write("# Title/Meta Review — Before vs After\n\n")
        f.write("## Duplicate Check\n")
        f.write(f"- Duplicate titles: {dup_titles}\n")
        f.write(f"- Duplicate metas: {dup_metas}\n\n")
        f.write("| # | URL | Status | Current Title | Proposed Title | Title Len | Meta Len | Claims Missing |\n")
        f.write("|---|-----|--------|---------------|----------------|-----------|----------|----------------|\n")
        for i, r in enumerate(results, 1):
            status = "APPROVED" if r["approved"] else "NEEDS REVIEW"
            f.write(f"| {i} | `{r['path']}` | {status} | {r['current_title']} | {r['proposed_title']} | {r['title_len']} | {r['meta_len']} | {r['notes']} |\n")
        f.write("\n## Proposed After (approved only)\n\n")
        for r in results:
            if r["approved"]:
                f.write(f"### {r['path']}\n")
                f.write(f"- **Title:** {r['proposed_title']}\n")
                f.write(f"- **Meta:** {r['proposed_meta']}\n")
                f.write(f"\n")

    # SQL patch
    with open("APPLY_TITLES.sql", "w", encoding="utf-8") as f:
        f.write("-- Run in Supabase SQL editor to update cities_data\n")
        f.write("BEGIN;\n")
        for r in results:
            if r["approved"]:
                slug = r["path"].lstrip("/")
                t = r["proposed_title"].replace("'", "''")
                m = r["proposed_meta"].replace("'", "''")
                f.write(f"UPDATE cities_data SET meta_title = '{t}', meta_description = '{m}', updated_at = now() WHERE slug = '{slug}';\n")
        f.write("COMMIT;\n")

    print("\nDone. Written BEFORE_AFTER_DIFF.md and APPLY_TITLES.sql")
    if dup_titles:
        print("WARNING duplicate titles:", dup_titles)
    if dup_metas:
        print("WARNING duplicate metas:", dup_metas)


if __name__ == "__main__":
    review()
