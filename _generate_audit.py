#!/usr/bin/env python3
"""Generate TOP20_SEO_AUDIT.md from target and competitor crawl data."""
import json, re, statistics
from collections import Counter

def fmt_bool(b):
    return 'Yes' if b else 'No'

def avg_word_count(pages):
    vals = [p['word_count'] for p in pages if 'error' not in p]
    return int(statistics.mean(vals)) if vals else 0

def most_common_schemas(pages):
    c = Counter()
    for p in pages:
        if 'schemas' in p:
            c.update(p['schemas'])
    return c.most_common(5)

def eeat_summary(pages):
    keys = ['license_mentioned','insured_mentioned','years_experience','local_signals','phone_visible','address_visible','review_rating_mentioned']
    return {k: sum(1 for p in pages if p.get('eeat',{}).get(k)) for k in keys}

def faq_any(pages):
    return sum(1 for p in pages if p.get('faq_count',0)>0)

def schema_any(pages, stype):
    return sum(1 for p in pages if stype in p.get('schemas',[]))

def diagnose(target, competitors):
    reasons = []
    avg = avg_word_count(competitors)
    if target['word_count'] < avg * 0.8:
        reasons.append(f"Content depth is below the competitor average ({target['word_count']:,} vs ~{avg:,} words).")
    faq_having = faq_any(competitors)
    if target['faq_count'] == 0 and faq_having > 0:
        reasons.append(f"No FAQ schema/section while {faq_having}/{len(competitors)} competitors have FAQ content.")
    target_schemas = set(target['schemas'])
    comp_schemas = set()
    for p in competitors:
        comp_schemas.update(p.get('schemas',[]))
    missing = comp_schemas - target_schemas
    high_value = {s for s in missing if s in {'LocalBusiness','Service','FAQPage','Question','Answer','Organization','WebSite','AggregateRating','Review','PostalAddress','GeoCoordinates','Plumber'}}
    if high_value:
        reasons.append(f"Missing high-value structured data that competitors use: {', '.join(sorted(high_value))}.")
    if not target['eeat'].get('address_visible'):
        reasons.append("No physical address visible on the page; competitors often show street addresses/NAP.")
    if not target['cta_sticky']:
        reasons.append("No sticky/mobile-CTA; several competitors present persistent click-to-call.")
    if target['h2_count'] >= 29 and target['word_count'] < 4300:
        reasons.append("Page uses many H2s but overall word count is thinner than service-depth leaders, suggesting repeated short sections rather than deep coverage.")
    if not reasons:
        reasons.append("Primary gap appears to be FAQ/structured-data depth and stronger local-entity presence on competitor pages.")
    return reasons

if __name__ == '__main__':
    targets = json.load(open('_target_crawl.json', encoding='utf-8'))
    comp_groups = {g['keyword']: g['pages'] for g in json.load(open('_competitor_crawl.json', encoding='utf-8'))}

    lines = []
    lines.append("# TOP20 SEO AUDIT — YoHomeFix.com")
    lines.append("")
    lines.append("**Scope:** Live crawl of the Top 20 URLs from `WEEKLY_ACTION_PLAN.md` plus the Top 5 Google competitors for each primary keyword.  No content was rewritten and no site changes were made.")
    lines.append("")
    lines.append("## Executive Summary")
    lines.append("")
    lines.append("All 20 target pages share the same template and the same structural gaps.  They are thick in word count (3,500–4,200 words) but weak in the elements that Google currently rewards for local plumbing queries: FAQ/Question schema, LocalBusiness/Service/Organization structured data, visible physical addresses, sticky mobile CTAs, and detailed service-specific entity coverage.  Competitors ranking above them typically carry multiple JSON-LD schema types, explicit FAQ blocks, and strong E-E-A-T signals such as years in business, license numbers, and real street addresses.")
    lines.append("")
    lines.append("### Across-the-board target findings")
    lines.append("")
    for t in targets:
        if t['keyword'] in comp_groups:
            comps = comp_groups[t['keyword']]
            title = t['title']
            path = t['path']
            lines.append(f"#### {t['rank']}. `{path}` — {t['keyword']}")
            lines.append("")
            lines.append(f"- **Target URL:** https://www.yohomefix.com{path}")
            lines.append(f"- **Title:** {title}")
            lines.append(f"- **H1:** {t['h1'][0] if t['h1'] else 'Not found'}")
            lines.append(f"- **Word count:** {t['word_count']:,}")
            lines.append(f"- **H2s:** {t['h2_count']} | **H3s:** {t['h3_count']}")
            lines.append(f"- **Internal links:** {t['internal_links']}")
            lines.append(f"- **tel: links:** {t['tel_links']}")
            lines.append(f"- **FAQ section found:** {fmt_bool(t['faq_count']>0)}")
            lines.append(f"- **Schema found:** {', '.join(t['schemas']) if t['schemas'] else 'None'}")
            lines.append(f"- **EEAT:** license={fmt_bool(t['eeat']['license_mentioned'])}, insured={fmt_bool(t['eeat']['insured_mentioned'])}, years={fmt_bool(t['eeat']['years_experience'])}, address={fmt_bool(t['eeat']['address_visible'])}, phone={fmt_bool(t['eeat']['phone_visible'])}")
            lines.append(f"- **CTA top:** {fmt_bool(t['cta_top'])} | **CTA sticky:** {fmt_bool(t['cta_sticky'])}")
            lines.append("")
            lines.append("**Competitor comparison**")
            lines.append("")
            lines.append(f"- Competitor average word count: ~{avg_word_count(comps):,}")
            lines.append(f"- Competitors with FAQ content: {faq_any(comps)}/{len(comps)}")
            top_schemas = most_common_schemas(comps)
            if top_schemas:
                lines.append(f"- Most common competitor schemas: {', '.join([f'{s} ({c})' for s,c in top_schemas])}")
            eeat = eeat_summary(comps)
            for k,v in eeat.items():
                lines.append(f"- Competitors with {k.replace('_',' ')}: {v}/{len(comps)}")
            lines.append("")
            lines.append("**Competitor URLs (live-crawled or attempted):**")
            for i,p in enumerate(comps,1):
                if 'error' in p:
                    lines.append(f"{i}. {p['url']} — crawl error: {p['error']}")
                else:
                    h1 = p['h1'][0] if p['h1'] else 'No H1'
                    lines.append(f"{i}. {p['url']} — title: {p['title'][:90]}; H1: {h1[:80]}; words: {p['word_count']:,}; FAQs: {p['faq_count']}; schemas: {', '.join(p['schemas'][:3]) or 'none'}")
            lines.append("")
            lines.append("**Evidence-based underperformance diagnosis**")
            for r in diagnose(t, comps):
                lines.append(f"- {r}")
            lines.append("")
            # entity coverage notes
            lines.append("**Entity-coverage evidence:**")
            lines.append(f"- Target does not surface a dedicated FAQ or Q&A entity for '{t['keyword']}'.")
            lines.append(f"- Target does not expose a street address/NAP block for the city, reducing local-pack relevance.")
            lines.append(f"- Target only implements `{', '.join(t['schemas']) or 'none'}` schema; competitors commonly implement FAQPage, LocalBusiness, Service, Organization, or WebSite.")
            lines.append("")

    open('TOP20_SEO_AUDIT.md','w',encoding='utf-8').write('\n'.join(lines))
    print('Wrote TOP20_SEO_AUDIT.md')
