#!/usr/bin/env python3
"""Crawl the Top 20 YoHomeFix target pages and extract SEO elements."""
import re, html, json, time, sys
from urllib.request import Request, urlopen
from bs4 import BeautifulSoup

BASE = 'https://yohomefix.com'
BUST = '?ver=deploy-20260730'
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

def clean_text(t):
    if not t:
        return ''
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', '', t))).strip()

def extract(url):
    try:
        req = Request(url, headers={'User-Agent': UA})
        text = urlopen(req, timeout=30).read().decode('utf-8', errors='ignore')
        soup = BeautifulSoup(text, 'html.parser')
        title = soup.title.get_text(strip=True) if soup.title else ''
        h1s = [h.get_text(' ', strip=True) for h in soup.find_all('h1')]
        h2s = [h.get_text(' ', strip=True) for h in soup.find_all('h2')]
        h3s = [h.get_text(' ', strip=True) for h in soup.find_all('h3')]
        word_count = len(soup.get_text(' ', strip=True).split())
        internal_links = 0
        for a in soup.find_all('a', href=True):
            href = a['href']
            if href.startswith('/') or 'yohomefix.com' in href:
                internal_links += 1
        tel_links = len([a for a in soup.find_all('a', href=True) if a['href'].startswith('tel:')])
        faq_count = 0
        for h in soup.find_all(['h2','h3','h4']):
            if 'faq' in h.get_text(strip=True).lower():
                faq_count += 1
        # JSON-LD schemas
        schemas = []
        for s in soup.find_all('script', type='application/ld+json'):
            if s.string:
                m = re.search(r'"@type"\s*:\s*"([^"]+)"', s.string)
                if m:
                    schemas.append(m.group(1))
        text_lower = text.lower()
        eeat = {
            'license_mentioned': bool(re.search(r'licensed|license', text_lower)),
            'insured_mentioned': bool(re.search(r'insured|bonded', text_lower)),
            'years_experience': bool(re.search(r'\d+\s*\+?\s*years?|since\s+\d{4}', text_lower)),
            'local_signals': bool(re.search(r'\d{4}|bbb|accredited|background.?check', text_lower)),
            'phone_visible': bool(re.search(r'tel:|\(\d{3}\)\s*\d{3}[-\s]\d{4}', text)),
            'address_visible': bool(re.search(r'\d+\s+\w+\s+(?:st|ave|blvd|rd|dr)\b', text_lower)),
        }
        cta_top = bool(soup.find(['a','button'], text=re.compile(r'call.?now|schedule.?now|book.?now', re.I)))
        cta_sticky = 'mobile-sticky-cta' in text
        return {
            'url': url,
            'title': title,
            'h1': h1s,
            'h2_count': len(h2s),
            'h3_count': len(h3s),
            'word_count': word_count,
            'internal_links': internal_links,
            'tel_links': tel_links,
            'faq_count': faq_count,
            'schemas': schemas,
            'eeat': eeat,
            'cta_top': cta_top,
            'cta_sticky': cta_sticky,
        }
    except Exception as e:
        return {'url': url, 'error': str(e)}

if __name__ == '__main__':
    targets = json.load(open('_top20_keywords.json', encoding='utf-8'))
    results = []
    for t in targets:
        full = t['full_url'].replace('https://www.yohomefix.com', BASE) + BUST
        print(f"Crawling {full}")
        data = extract(full)
        data['rank'] = t['rank']
        data['path'] = t['path']
        data['keyword'] = t['keyword']
        results.append(data)
        time.sleep(0.5)
    json.dump(results, open('_target_crawl.json', 'w', encoding='utf-8'), indent=2)
    print('Saved _target_crawl.json')
