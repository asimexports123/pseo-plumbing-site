#!/usr/bin/env python3
"""Crawl the Top 5 competitor pages per keyword and extract SEO elements."""
import re, html, json, time, sys, requests, urllib3
from bs4 import BeautifulSoup

UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def clean_text(t):
    if not t:
        return ''
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', '', t))).strip()

def fetch(url):
    headers = {
        'User-Agent': UA,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
    }
    last_err = None
    for attempt in range(2):
        try:
            r = requests.get(url, headers=headers, timeout=20, verify=False, allow_redirects=True)
            if r.status_code == 200:
                return r.text
            if r.status_code in (403, 429) and attempt == 0:
                time.sleep(2)
                continue
            raise Exception(f'HTTP {r.status_code}')
        except Exception as e:
            last_err = e
            if attempt == 0:
                time.sleep(1)
    raise last_err

def extract(url):
    try:
        text = fetch(url)
        soup = BeautifulSoup(text, 'html.parser')
        title = soup.title.get_text(strip=True) if soup.title else ''
        h1s = [h.get_text(' ', strip=True) for h in soup.find_all('h1')]
        h2s = [h.get_text(' ', strip=True) for h in soup.find_all('h2')]
        h3s = [h.get_text(' ', strip=True) for h in soup.find_all('h3')]
        word_count = len(soup.get_text(' ', strip=True).split())
        tel_links = len([a for a in soup.find_all('a', href=True) if a['href'].startswith('tel:')])
        faq_count = 0
        for h in soup.find_all(['h2','h3','h4']):
            if 'faq' in h.get_text(strip=True).lower():
                faq_count += 1
        schemas = []
        for s in soup.find_all('script', type='application/ld+json'):
            if s.string:
                types = re.findall(r'"@type"\s*:\s*"([^"]+)"', s.string)
                schemas.extend(types)
        text_lower = text.lower()
        eeat = {
            'license_mentioned': bool(re.search(r'licensed|license', text_lower)),
            'insured_mentioned': bool(re.search(r'insured|bonded', text_lower)),
            'years_experience': bool(re.search(r'\d+\s*\+?\s*years?|since\s+\d{4}', text_lower)),
            'local_signals': bool(re.search(r'\d{4}|bbb|accredited|background.?check', text_lower)),
            'phone_visible': bool(re.search(r'tel:|\(\d{3}\)\s*\d{3}[-\s]\d{4}', text)),
            'address_visible': bool(re.search(r'\d+\s+\w+\s+(?:st|ave|blvd|rd|dr)\b', text_lower)),
            'review_rating_mentioned': bool(re.search(r'\d\.\d\s*stars?|\d+\s*reviews?|google.?business|better.?business.?bureau', text_lower)),
        }
        cta_top = bool(soup.find(['a','button'], string=re.compile(r'call.?now|schedule.?now|book.?now', re.I)))
        cta_sticky = 'sticky' in text_lower and bool(re.search(r'call.?now|\(\d{3}\)', text))
        # internal links estimate: relative or same domain
        domain = re.search(r'https?://([^/]+)', url).group(1)
        internal_links = 0
        for a in soup.find_all('a', href=True):
            href = a['href']
            if href.startswith('/') or domain in href:
                internal_links += 1
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
    data = json.load(open('_competitors.json', encoding='utf-8'))
    out = []
    for item in data['competitors']:
        keyword = item['keyword']
        print(f'\nKeyword: {keyword}')
        group = {'keyword': keyword, 'pages': []}
        for url in item['urls']:
            print(f'  {url}')
            page = extract(url)
            group['pages'].append(page)
            time.sleep(0.3)
        out.append(group)
    json.dump(out, open('_competitor_crawl.json', 'w', encoding='utf-8'), indent=2)
    print('Saved _competitor_crawl.json')
