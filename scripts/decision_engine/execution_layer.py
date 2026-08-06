#!/usr/bin/env python3
"""
Autonomous Execution Layer.

Converts Decision Engine recommendations into concrete, executable tasks
that an AI coding/content agent can perform without manual interpretation.

For every recommendation, generates:
  - expand_cluster         -> exact pages to create, internal links, entities, FAQs, headings
  - increase_internal_links -> source pages, target pages, anchor text, priority
  - general_content_and_ux_audit -> missing sections, entities, schema, EEAT improvements
  - recovery_strategy       -> same as general_content_and_ux_audit + recovery actions
  - observe_and_wait        -> monitoring task (no execution needed)

Outputs:
  - execution_queue.json
  - daily_execution_report.md
  - weekly_execution_plan.md

No new mathematical models. Uses only existing engine outputs.
"""
import sys, io
if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

import json
import hashlib
from collections import defaultdict
from datetime import datetime, timezone

from . import config
from . import decision_store, marketcall_ingestion, ga4_ingestion
from .attribution_engine import (
    AttributionResolver, evidence_from_gsc_page,
    evidence_from_marketcall_campaign, evidence_from_ga4_page,
)
from .data_ingestion import load_gsc_page_report_from_csv, build_hierarchy_graph, ROOT_NODE, infer_taxonomy
from .opportunity_score import score_records
from .graph_engine import pagerank, orphan_nodes, weakly_connected_components
from .bayesian_engine import BayesianEngine
from .link_ingestion import build_real_link_graph, diff_with_hierarchy
from .recommendation_engine import generate_recommendations
from . import learning_engine
from . import gott_engine


# ============================================================
# Constants
# ============================================================

SERVICE_KEYWORDS = {
    'emergency': {
        'label': 'Emergency Plumbing',
        'entities': ['emergency plumber', '24/7 plumbing service', 'urgent plumbing repair', 'burst pipe', 'flooding'],
        'faqs': [
            'How quickly can an emergency plumber arrive?',
            'What counts as a plumbing emergency?',
            'Do you offer 24/7 emergency plumbing service?',
            'How much does emergency plumbing cost?',
            'What should I do while waiting for the plumber?',
        ],
        'headings': [
            '24/7 Emergency Plumbing Services',
            'Common Emergency Plumbing Issues',
            'What to Do During a Plumbing Emergency',
            'Emergency Plumbing Cost and Pricing',
            'Why Choose Our Emergency Plumbers',
        ],
        'schema_types': ['LocalBusiness', 'Service', 'FAQPage', 'EmergencyService'],
    },
    'drain-cleaning': {
        'label': 'Drain Cleaning',
        'entities': ['drain cleaning', 'clogged drain', 'hydro jetting', 'drain snake', 'sewer line cleaning'],
        'faqs': [
            'How much does professional drain cleaning cost?',
            'How often should drains be professionally cleaned?',
            'What are signs of a clogged drain?',
            'Is hydro jetting safe for my pipes?',
            'How long does drain cleaning take?',
        ],
        'headings': [
            'Professional Drain Cleaning Services',
            'Signs You Need Drain Cleaning',
            'Drain Cleaning Methods We Use',
            'Drain Cleaning Cost and Pricing',
            'Preventing Future Clogs',
        ],
        'schema_types': ['LocalBusiness', 'Service', 'FAQPage', 'Offer'],
    },
    'leak-repair': {
        'label': 'Leak Repair',
        'entities': ['leak repair', 'water leak detection', 'slab leak', 'pipe leak', 'leak inspection'],
        'faqs': [
            'How do I know if I have a hidden water leak?',
            'How much does leak repair cost?',
            'What causes slab leaks?',
            'Can a water leak fix itself?',
            'How long does leak detection take?',
        ],
        'headings': [
            'Professional Leak Repair Services',
            'Signs of a Hidden Water Leak',
            'Leak Detection Methods',
            'Leak Repair Cost and Pricing',
            'Preventing Future Leaks',
        ],
        'schema_types': ['LocalBusiness', 'Service', 'FAQPage', 'Offer'],
    },
    'water-heater-repair': {
        'label': 'Water Heater Repair',
        'entities': ['water heater repair', 'water heater replacement', 'tankless water heater', 'water heater installation', 'water heater maintenance'],
        'faqs': [
            'How long do water heaters last?',
            'Should I repair or replace my water heater?',
            'How much does water heater repair cost?',
            'What are signs my water heater is failing?',
            'How long does water heater repair take?',
        ],
        'headings': [
            'Water Heater Repair and Replacement',
            'Signs Your Water Heater Needs Repair',
            'Tankless vs Tank Water Heaters',
            'Water Heater Repair Cost',
            'Water Heater Maintenance Tips',
        ],
        'schema_types': ['LocalBusiness', 'Service', 'FAQPage', 'Offer'],
    },
    'pipe-burst-repair': {
        'label': 'Pipe Burst Repair',
        'entities': ['pipe burst repair', 'frozen pipe repair', 'burst pipe replacement', 'pipe damage', 'emergency pipe repair'],
        'faqs': [
            'How do I fix a burst pipe temporarily?',
            'How much does burst pipe repair cost?',
            'What causes pipes to burst?',
            'How do I prevent pipes from freezing and bursting?',
            'How long does pipe burst repair take?',
        ],
        'headings': [
            'Emergency Pipe Burst Repair',
            'What Causes Pipes to Burst',
            'Temporary Fixes for a Burst Pipe',
            'Pipe Burst Repair Cost',
            'Preventing Pipe Bursts',
        ],
        'schema_types': ['LocalBusiness', 'Service', 'FAQPage', 'EmergencyService'],
    },
    'sewer-line': {
        'label': 'Sewer Line Services',
        'entities': ['sewer line repair', 'sewer line replacement', 'sewer line inspection', 'trenchless sewer repair', 'sewer line cleaning'],
        'faqs': [
            'How much does sewer line repair cost?',
            'What are signs of a sewer line problem?',
            'How long does sewer line repair take?',
            'What is trenchless sewer line repair?',
            'How do tree roots affect sewer lines?',
        ],
        'headings': [
            'Sewer Line Repair and Replacement',
            'Signs of Sewer Line Problems',
            'Trenchless Sewer Repair Options',
            'Sewer Line Repair Cost',
            'Preventing Sewer Line Issues',
        ],
        'schema_types': ['LocalBusiness', 'Service', 'FAQPage', 'Offer'],
    },
    'water-softener': {
        'label': 'Water Softener Services',
        'entities': ['water softener installation', 'water softener repair', 'water softener maintenance', 'hard water treatment', 'water filtration'],
        'faqs': [
            'How much does water softener installation cost?',
            'How do I know if I need a water softener?',
            'How long do water softeners last?',
            'What size water softener do I need?',
            'How often should water softener maintenance be done?',
        ],
        'headings': [
            'Water Softener Installation and Repair',
            'Signs You Need a Water Softener',
            'Water Softener Cost and Sizing',
            'Water Softener Maintenance',
            'Hard Water Treatment Options',
        ],
        'schema_types': ['LocalBusiness', 'Service', 'FAQPage', 'Offer'],
    },
    'faucet': {
        'label': 'Faucet Repair and Installation',
        'entities': ['faucet repair', 'faucet installation', 'leaky faucet', 'faucet replacement', 'fixture repair'],
        'faqs': [
            'How much does faucet repair cost?',
            'How do I fix a leaky faucet?',
            'How long does faucet installation take?',
            'What types of faucets can you repair?',
            'Should I repair or replace my faucet?',
        ],
        'headings': [
            'Faucet Repair and Installation Services',
            'Common Faucet Problems',
            'Faucet Repair vs Replacement',
            'Faucet Repair Cost',
            'Choosing the Right Faucet',
        ],
        'schema_types': ['LocalBusiness', 'Service', 'FAQPage', 'Offer'],
    },
    'water-line': {
        'label': 'Water Line Services',
        'entities': ['water line repair', 'water line replacement', 'main water line', 'water line leak', 'water line installation'],
        'faqs': [
            'How much does water line repair cost?',
            'What are signs of a water line problem?',
            'How long does water line replacement take?',
            'What causes water line damage?',
            'How do I find a water line leak underground?',
        ],
        'headings': [
            'Water Line Repair and Replacement',
            'Signs of Water Line Problems',
            'Water Line Repair Cost',
            'Trenchless Water Line Replacement',
            'Preventing Water Line Damage',
        ],
        'schema_types': ['LocalBusiness', 'Service', 'FAQPage', 'Offer'],
    },
    'repiping': {
        'label': 'Repiping Services',
        'entities': ['repiping', 'pipe replacement', 'whole house repiping', 'copper repiping', 'pex repiping'],
        'faqs': [
            'How much does whole house repiping cost?',
            'How long does repiping a house take?',
            'Should I choose copper or PEX pipes?',
            'What are signs my home needs repiping?',
            'Is repiping covered by homeowners insurance?',
        ],
        'headings': [
            'Whole House Repiping Services',
            'Signs Your Home Needs Repiping',
            'Copper vs PEX Pipes',
            'Repiping Cost and Timeline',
            'Repiping Process Explained',
        ],
        'schema_types': ['LocalBusiness', 'Service', 'FAQPage', 'Offer'],
    },
    'main-water-shutoff-valve': {
        'label': 'Main Water Shutoff Valve',
        'entities': ['main water shutoff valve', 'water shutoff valve repair', 'valve replacement', 'water valve installation', 'emergency shutoff'],
        'faqs': [
            'How much does main water shutoff valve repair cost?',
            'Where is my main water shutoff valve located?',
            'How do I know if my shutoff valve is broken?',
            'How long does shutoff valve replacement take?',
            'What type of shutoff valve should I install?',
        ],
        'headings': [
            'Main Water Shutoff Valve Repair and Replacement',
            'How to Find Your Main Water Shutoff Valve',
            'Signs Your Shutoff Valve Needs Repair',
            'Shutoff Valve Replacement Cost',
            'Types of Water Shutoff Valves',
        ],
        'schema_types': ['LocalBusiness', 'Service', 'FAQPage', 'Offer'],
    },
}

DEFAULT_SERVICE = {
    'label': 'Plumbing Services',
    'entities': ['plumber', 'plumbing repair', 'plumbing service', 'plumbing inspection'],
    'faqs': [
        'How much does a plumber cost?',
        'Do you offer same-day plumbing service?',
        'What plumbing services do you offer?',
        'Are you licensed and insured?',
        'Do you offer free estimates?',
    ],
    'headings': [
        'Professional Plumbing Services',
        'Why Choose Our Plumbers',
        'Our Plumbing Service Areas',
        'Plumbing Service Pricing',
        'Contact Us for Plumbing Service',
    ],
    'schema_types': ['LocalBusiness', 'Service', 'FAQPage'],
}

EEAT_REQUIREMENTS = [
    'Add or verify business license number and state registration',
    'Add plumber certification/badge (e.g., Master Plumber, Journeyman)',
    'Include years in business (e.g., "Serving [City] since [Year]")',
    'Add customer reviews/testimonials section (minimum 3 reviews)',
    'Include service area map or list of ZIP codes served',
    'Add response time guarantee (e.g., "60-minute response time")',
    'Include insurance information (e.g., "Fully bonded and insured")',
    'Add business hours including 24/7 emergency availability',
    'Include pricing transparency (at least starting prices or ranges)',
    'Add team photos or about-us section for personal trust',
]

CONTENT_SECTIONS = [
    {'section': 'Hero Section', 'elements': [
        'H1 with city + service keyword (e.g., "Emergency Plumber in [City]")',
        'Click-to-call button (phone number prominent)',
        'Trust badges (licensed, insured, years in business)',
        'Service area mention',
    ]},
    {'section': 'Services Offered', 'elements': [
        'H2: Our [Service] Services in [City]',
        'List of specific services with brief descriptions',
        'Internal links to related service pages',
    ]},
    {'section': 'Why Choose Us', 'elements': [
        'H2: Why Choose Our [City] Plumbers',
        'Licensed and insured statement',
        'Years of experience',
        'Customer review highlights',
        'Response time guarantee',
    ]},
    {'section': 'Service Area', 'elements': [
        'H2: Areas We Serve in [City]',
        'List of neighborhoods or ZIP codes',
        'Internal links to nearby city pages',
    ]},
    {'section': 'FAQ Section', 'elements': [
        'H2: Frequently Asked Questions',
        '5-8 FAQ items with structured data markup',
        'FAQPage schema implementation',
    ]},
    {'section': 'Pricing Information', 'elements': [
        'H2: [Service] Pricing in [City]',
        'Starting prices or price ranges',
        'Factors that affect cost',
        'Free estimate call-to-action',
    ]},
    {'section': 'Contact & CTA', 'elements': [
        'H2: Call [City]\'s Trusted Plumbers Today',
        'Phone number (click-to-call)',
        'Contact form or booking link',
        'Business hours',
        'Service area reminder',
    ]},
]


# ============================================================
# Helpers
# ============================================================

def _task_id(rec, sub_index=0):
    raw = f"{rec.action}:{rec.target}:{sub_index}"
    return hashlib.sha256(raw.encode()).hexdigest()[:12]


def _priority_label(confidence, business_value, all_bvs):
    if not all_bvs:
        return 'P3'
    max_bv = max(all_bvs)
    normalized = business_value / max_bv if max_bv > 0 else 0
    if confidence >= 0.9 and normalized >= 0.8:
        return 'P1'
    if confidence >= 0.7 and normalized >= 0.5:
        return 'P2'
    return 'P3'


def _effort_estimate(action, task_details):
    if action == 'expand_cluster':
        n_pages = len(task_details.get('pages_to_create', []))
        n_links = len(task_details.get('internal_links_to_add', []))
        return f"{n_pages * 45 + n_links * 10} min ({n_pages} pages x 45min + {n_links} links x 10min)"
    if action == 'increase_internal_links':
        n_links = len(task_details.get('links', []))
        return f"{n_links * 10} min ({n_links} links x 10min each)"
    if action in ('general_content_and_ux_audit', 'recovery_strategy'):
        sections = len(task_details.get('missing_sections', []))
        entities = len(task_details.get('missing_entities', []))
        schema = len(task_details.get('schema_to_add', []))
        eeat = len(task_details.get('eeat_improvements', []))
        total = sections * 20 + entities * 10 + schema * 15 + eeat * 10
        return f"{total} min ({sections} sections + {entities} entities + {schema} schema + {eeat} EEAT)"
    if action == 'observe_and_wait':
        return "0 min (monitoring only)"
    return "30 min (default)"


def _get_service_info(page_path):
    taxonomy = infer_taxonomy(page_path)
    service = taxonomy.get('service')
    if service and service in SERVICE_KEYWORDS:
        return SERVICE_KEYWORDS[service]
    # Try to match from the URL path
    for key in SERVICE_KEYWORDS:
        if key in page_path:
            return SERVICE_KEYWORDS[key]
    return DEFAULT_SERVICE


def _extract_city(page_path):
    taxonomy = infer_taxonomy(page_path)
    if taxonomy['kind'] == 'city_service':
        city_raw = taxonomy['city_or_state']
        # Handle multi-word city names that include service keywords
        # e.g., 'oklahoma-city-drain' -> 'oklahoma-city'
        for svc in SERVICE_KEYWORDS:
            city_raw = city_raw.replace(f'-{svc}', '')
        return city_raw.replace('-', ' ').title()
    if taxonomy['kind'] == 'state_service':
        return taxonomy['city_or_state'].replace('-', ' ').title()
    # Fallback: extract from path
    parts = page_path.strip('/').split('-')
    if parts[0] == 'plumber':
        return parts[1].replace('-', ' ').title() if len(parts) > 1 else 'Unknown'
    return 'Unknown'


def _find_related_pages(target, all_pages, graph_metrics, max_results=10):
    """Find pages in the same cluster/service for internal linking."""
    target_tax = infer_taxonomy(target)
    if target_tax['kind'] == 'other':
        return []

    related = []
    for page in all_pages:
        pid = page['page'] if isinstance(page, dict) else page
        if pid == target:
            continue
        tax = infer_taxonomy(pid)
        if tax['kind'] == 'other':
            continue
        # Same service
        if tax.get('service') == target_tax.get('service'):
            related.append(pid)
        # Same city, different service
        elif tax.get('city_or_state') == target_tax.get('city_or_state'):
            related.append(pid)

    return related[:max_results]


def _find_high_authority_pages(graph_metrics, all_pages, max_results=10):
    """Find pages with highest PageRank for internal linking sources."""
    scored = []
    for pid, metrics in graph_metrics.items():
        if metrics.get('pagerank', 0) > 0:
            scored.append((pid, metrics['pagerank']))
    scored.sort(key=lambda x: x[1], reverse=True)
    return [pid for pid, _ in scored[:max_results]]


def _generate_anchor_text(target, service_info):
    """Generate natural anchor text for internal links."""
    city = _extract_city(target)
    label = service_info['label']
    return [
        f"{label} in {city}",
        f"{city} {label.lower()}",
        f"expert {label.lower()} services in {city}",
        f"trusted {city} plumbers for {label.lower()}",
    ]


# ============================================================
# Task Generators per Recommendation Type
# ============================================================

def _generate_expand_cluster_tasks(rec, ctx):
    """Generate concrete tasks for expand_cluster recommendations."""
    target = rec.target
    service_info = _get_service_info(target)
    city = _extract_city(target)
    taxonomy = infer_taxonomy(target)

    # Find related pages in the same cluster
    related_pages = _find_related_pages(target, ctx['page_reports'], ctx['graph_metrics'])
    high_auth = _find_high_authority_pages(ctx['graph_metrics'], ctx['page_reports'])

    # Determine what pages to create based on missing services in this city
    existing_services = set()
    all_pages = ctx['page_reports']
    target_tax = infer_taxonomy(target)

    if target_tax['kind'] == 'city_service':
        city_raw = target_tax['city_or_state']
        for svc in SERVICE_KEYWORDS:
            city_raw = city_raw.replace(f'-{svc}', '')
        for page in all_pages:
            tax = infer_taxonomy(page['page'])
            if tax['kind'] == 'city_service':
                pg_city = tax['city_or_state']
                for svc in SERVICE_KEYWORDS:
                    pg_city = pg_city.replace(f'-{svc}', '')
                if pg_city == city_raw:
                    existing_services.add(tax['service'])

    all_services = set(SERVICE_KEYWORDS.keys())
    missing_services = all_services - existing_services

    pages_to_create = []
    city_slug = city.lower().replace(' ', '-')
    for svc in sorted(missing_services):
        svc_info = SERVICE_KEYWORDS[svc]
        new_page_path = f"/plumber-{city_slug}-{svc}"
        pages_to_create.append({
            'path': new_page_path,
            'service': svc,
            'service_label': svc_info['label'],
            'city': city,
            'title': f"{svc_info['label']} in {city} | YoHomeFix",
            'meta_description': f"Expert {svc_info['label'].lower()} in {city}. Licensed, insured, and available 24/7. Call today for a free estimate!",
            'h1': f"{svc_info['label']} in {city}",
            'headings': svc_info['headings'],
            'entities_to_include': svc_info['entities'],
            'faqs': svc_info['faqs'],
            'schema_types': svc_info['schema_types'],
            'word_count_target': 1500,
            'internal_links_from': [target] + related_pages[:3],
        })

    # Internal links to add from the target page to related pages
    internal_links_to_add = []
    for rp in related_pages[:5]:
        rp_service = _get_service_info(rp)
        rp_city = _extract_city(rp)
        internal_links_to_add.append({
            'source_page': target,
            'target_page': rp,
            'anchor_text': f"{rp_service['label']} in {rp_city}",
            'placement': 'Within services section or related services area',
        })

    # Internal links from high-authority pages to the target
    for ha in high_auth[:3]:
        internal_links_to_add.append({
            'source_page': ha,
            'target_page': target,
            'anchor_text': f"{service_info['label']} in {city}",
            'placement': 'Within relevant content section',
        })

    # Entities to add to the target page
    entities = service_info['entities']

    # FAQs to add
    faqs = service_info['faqs']

    # Headings to ensure
    headings = service_info['headings']

    return {
        'pages_to_create': pages_to_create,
        'internal_links_to_add': internal_links_to_add,
        'entities_to_add': entities,
        'faqs_to_add': faqs,
        'headings_to_ensure': headings,
        'cluster_context': {
            'target_page': target,
            'city': city,
            'service': service_info['label'],
            'existing_pages_in_cluster': len(related_pages),
            'missing_services_count': len(missing_services),
            'missing_services': sorted(missing_services),
        },
    }


def _generate_increase_internal_links_tasks(rec, ctx):
    """Generate concrete tasks for increase_internal_links recommendations."""
    target = rec.target
    service_info = _get_service_info(target)
    city = _extract_city(target)

    # Find source pages that should link to target
    related = _find_related_pages(target, ctx['page_reports'], ctx['graph_metrics'], max_results=15)
    high_auth = _find_high_authority_pages(ctx['graph_metrics'], ctx['page_reports'], max_results=10)

    # Generate anchor text variations
    anchor_texts = _generate_anchor_text(target, service_info)

    links = []
    # Related pages -> target
    for i, source in enumerate(related):
        links.append({
            'source_page': source,
            'target_page': target,
            'anchor_text': anchor_texts[i % len(anchor_texts)],
            'placement': _suggest_link_placement(infer_taxonomy(source), infer_taxonomy(target)),
            'priority': 'high' if i < 5 else 'medium',
        })

    # High authority pages -> target
    for i, source in enumerate(high_auth):
        if source not in related:
            links.append({
                'source_page': source,
                'target_page': target,
                'anchor_text': anchor_texts[i % len(anchor_texts)],
                'placement': 'Within relevant content or footer service links',
                'priority': 'high',
            })

    return {
        'links': links,
        'anchor_text_variations': anchor_texts,
        'target_page_context': {
            'page': target,
            'city': city,
            'service': service_info['label'],
            'is_orphan': rec.supporting_data.get('is_orphan', False),
            'pagerank': rec.supporting_data.get('pagerank'),
        },
        'total_links_to_add': len(links),
    }


def _suggest_link_placement(source_tax, target_tax):
    """Suggest where in the source page to place the link."""
    if source_tax.get('service') == target_tax.get('service'):
        return 'Within services section (same service cluster)'
    if source_tax.get('city_or_state') == target_tax.get('city_or_state'):
        return 'Within service area or related services section (same city)'
    return 'Within related services or footer area'


def _generate_content_audit_tasks(rec, ctx):
    """Generate concrete tasks for general_content_and_ux_audit and recovery_strategy."""
    target = rec.target
    service_info = _get_service_info(target)
    city = _extract_city(target)
    raw = ctx['raw_metrics'].get(target, {})

    # Missing sections (check against ideal content structure)
    missing_sections = []
    for section in CONTENT_SECTIONS:
        missing_sections.append({
            'section': section['section'],
            'elements': section['elements'],
            'template': _fill_template(section, city, service_info),
        })

    # Missing entities (from service-specific entity list)
    missing_entities = service_info['entities']

    # Schema to add
    schema_to_add = service_info['schema_types']

    # EEAT improvements
    eeat_improvements = EEAT_REQUIREMENTS[:]

    # Additional context from metrics
    impressions = raw.get('impressions', 0)
    clicks = raw.get('clicks', 0)
    position = raw.get('position')

    audit_findings = []
    if clicks == 0 and impressions > 100:
        audit_findings.append({
            'finding': 'High impressions but zero clicks',
            'diagnosis': 'Title tag and meta description likely need optimization',
            'action': 'Rewrite title tag to include city + service + benefit. Rewrite meta description with call-to-action.',
        })
    if position and position > 30:
        audit_findings.append({
            'finding': f'Average position is {position:.1f} (below page 3)',
            'diagnosis': 'Content depth and topical authority likely insufficient',
            'action': 'Expand content to 1500+ words. Add service-specific headings, FAQs, and entity-rich content.',
        })
    if clicks == 0 and impressions < 100:
        audit_findings.append({
            'finding': 'Low impressions and zero clicks',
            'diagnosis': 'Page may be too new or poorly indexed',
            'action': 'Ensure page is indexed in GSC. Add internal links from high-authority pages. Submit sitemap.',
        })

    return {
        'missing_sections': missing_sections,
        'missing_entities': missing_entities,
        'schema_to_add': schema_to_add,
        'eeat_improvements': eeat_improvements,
        'audit_findings': audit_findings,
        'page_context': {
            'page': target,
            'city': city,
            'service': service_info['label'],
            'impressions': impressions,
            'clicks': clicks,
            'avg_position': position,
        },
    }


def _fill_template(section, city, service_info):
    """Fill in a content section template with city and service."""
    template = section['section']
    elements = []
    for elem in section['elements']:
        filled = elem.replace('[City]', city).replace('[Service]', service_info['label'])
        elements.append(filled)
    return elements


def _generate_observe_wait_tasks(rec, ctx):
    """Generate monitoring task for observe_and_wait recommendations."""
    tp = ctx['temporal_priors'].get(rec.target)
    wait_days = tp.recommended_wait_days if tp else 30
    maturity = tp.maturity_score if tp else 0

    return {
        'monitoring_task': True,
        'wait_days': wait_days,
        'maturity_score': maturity,
        'recheck_date': datetime.now(timezone.utc).strftime('%Y-%m-%d'),
        'instructions': [
            f'No action needed for {wait_days} days. Page is still maturing.',
            f'Re-run the Decision Engine after {wait_days} days to check if metrics have changed.',
            f'Current maturity score: {maturity:.4f} (0=brand new, 1=fully mature).',
            'Do not rewrite, delete, or significantly modify this page during the wait period.',
        ],
    }


# ============================================================
# Main Task Builder
# ============================================================

def build_execution_queue(ctx):
    """Convert all recommendations into executable tasks."""
    all_bvs = [r.business_value_score for r in ctx['recs']]
    tasks = []

    for rec in ctx['recs']:
        action = rec.action
        task_id = _task_id(rec)

        # Generate action-specific details
        if action == 'expand_cluster':
            details = _generate_expand_cluster_tasks(rec, ctx)
        elif action == 'increase_internal_links':
            details = _generate_increase_internal_links_tasks(rec, ctx)
        elif action in ('general_content_and_ux_audit', 'recovery_strategy'):
            details = _generate_content_audit_tasks(rec, ctx)
        elif action == 'observe_and_wait':
            details = _generate_observe_wait_tasks(rec, ctx)
        else:
            details = {'note': f'No specific task template for action: {action}'}

        impact = rec.expected_impact or {}
        priority = _priority_label(rec.confidence, rec.business_value_score, all_bvs)
        effort = _effort_estimate(action, details)

        # Dependencies
        dependencies = []
        if action == 'expand_cluster':
            # Pages must be created before internal links
            if details.get('pages_to_create'):
                dependencies.append('Create new pages first, then add internal links')
        if action == 'general_content_and_ux_audit' and rec.supporting_data.get('is_orphan'):
            dependencies.append('increase_internal_links task for same target (add links after content)')

        task = {
            'task_id': task_id,
            'action': action,
            'target': rec.target,
            'priority': priority,
            'confidence': round(rec.confidence, 4),
            'expected_roi': round(rec.business_value_score, 4),
            'expected_calls': impact.get('expected_calls'),
            'expected_revenue': impact.get('expected_revenue'),
            'business_value_score': round(rec.business_value_score, 4),
            'dependencies': dependencies,
            'estimated_effort': effort,
            'execution_status': 'pending',
            'reason': rec.reason,
            'task_details': details,
            'generated_at': datetime.now(timezone.utc).isoformat(),
        }
        tasks.append(task)

    # Sort by priority then business_value_score
    priority_order = {'P1': 0, 'P2': 1, 'P3': 2}
    tasks.sort(key=lambda t: (priority_order.get(t['priority'], 3), -t['business_value_score']))

    return tasks


# ============================================================
# Output Generators
# ============================================================

def generate_execution_queue_json(tasks, ctx):
    """Generate execution_queue.json"""
    output = {
        'metadata': {
            'generated_at': datetime.now(timezone.utc).isoformat(),
            'total_tasks': len(tasks),
            'total_recommendations': len(ctx['recs']),
            'pages_analyzed': ctx['n_pages'],
            'priority_distribution': dict(
                t['priority'] for t in tasks
            ) if False else {},
        },
        'summary': {
            'P1_critical': sum(1 for t in tasks if t['priority'] == 'P1'),
            'P2_high': sum(1 for t in tasks if t['priority'] == 'P2'),
            'P3_medium': sum(1 for t in tasks if t['priority'] == 'P3'),
            'by_action': dict(defaultdict(int, {
                a: sum(1 for t in tasks if t['action'] == a)
                for a in set(t['action'] for t in tasks)
            })),
            'total_expected_revenue': sum(
                t.get('expected_revenue', 0) or 0 for t in tasks
            ),
            'total_expected_calls': sum(
                t.get('expected_calls', 0) or 0 for t in tasks
            ),
        },
        'tasks': tasks,
    }

    # Fix priority_distribution
    pd = defaultdict(int)
    for t in tasks:
        pd[t['priority']] += 1
    output['metadata']['priority_distribution'] = dict(pd)

    return json.dumps(output, indent=2, ensure_ascii=False, default=str)


def generate_daily_report_md(tasks, ctx):
    """Generate daily_execution_report.md"""
    lines = []
    w = 100

    def p(s=''):
        lines.append(s)

    today = datetime.now(timezone.utc).strftime('%Y-%m-%d')

    p(f'# Daily Execution Report — {today}')
    p()
    p('## What Exactly Should Be Changed Today?')
    p()
    p(f'- **Total tasks:** {len(tasks)}')
    p(f'- **P1 (Critical):** {sum(1 for t in tasks if t["priority"] == "P1")}')
    p(f'- **P2 (High):** {sum(1 for t in tasks if t["priority"] == "P2")}')
    p(f'- **P3 (Medium):** {sum(1 for t in tasks if t["priority"] == "P3")}')
    p(f'- **Total expected revenue (if all executed):** ${sum(t.get("expected_revenue", 0) or 0 for t in tasks):,.2f}')
    p(f'- **Total expected calls (if all executed):** {sum(t.get("expected_calls", 0) or 0 for t in tasks):.1f}')
    p()

    # Daily focus: top 10 P1/P2 tasks
    daily_tasks = [t for t in tasks if t['priority'] in ('P1', 'P2')][:10]
    monitoring = [t for t in tasks if t['action'] == 'observe_and_wait']

    p('## Today\'s Execution Queue (Top 10)')
    p()
    p('| # | Task ID | Action | Target | Priority | Effort | Exp. Revenue |')
    p('|---|---------|--------|--------|----------|--------|-------------|')
    for i, t in enumerate(daily_tasks, 1):
        target = t['target']
        if len(target) > 45:
            target = target[:42] + '...'
        rev = t.get('expected_revenue')
        rev_str = f'${rev:.2f}' if rev else 'N/A'
        p(f'| {i} | {t["task_id"]} | {t["action"]} | `{target}` | {t["priority"]} | {t["estimated_effort"]} | {rev_str} |')

    p()
    p('## Detailed Task Instructions')
    p()

    for i, t in enumerate(daily_tasks, 1):
        p(f'### Task {i}: {t["action"]} — `{t["target"]}`')
        p(f'- **Task ID:** {t["task_id"]}')
        p(f'- **Priority:** {t["priority"]}')
        p(f'- **Confidence:** {t["confidence"]:.4f}')
        p(f'- **Expected calls:** {t.get("expected_calls", "N/A")}')
        p(f'- **Expected revenue:** ${t.get("expected_revenue", 0):.2f}' if t.get('expected_revenue') else '- **Expected revenue:** N/A')
        p(f'- **Estimated effort:** {t["estimated_effort"]}')
        p(f'- **Dependencies:** {", ".join(t["dependencies"]) if t["dependencies"] else "None"}')
        p(f'- **Reason:** {t["reason"][:200]}')
        p()

        details = t.get('task_details', {})

        if t['action'] == 'expand_cluster':
            p('#### Pages to Create:')
            if details.get('pages_to_create'):
                for pg in details['pages_to_create']:
                    p(f'- **Path:** `{pg["path"]}`')
                    p(f'  - Title: {pg["title"]}')
                    p(f'  - Meta Description: {pg["meta_description"]}')
                    p(f'  - H1: {pg["h1"]}')
                    p(f'  - Headings:')
                    for h in pg['headings']:
                        p(f'    - H2: {h}')
                    p(f'  - Entities to include: {", ".join(pg["entities_to_include"])}')
                    p(f'  - FAQs:')
                    for faq in pg['faqs']:
                        p(f'    - {faq}')
                    p(f'  - Schema: {", ".join(pg["schema_types"])}')
                    p(f'  - Word count target: {pg["word_count_target"]} words')
                    p(f'  - Internal links from: {", ".join(pg["internal_links_from"])}')
                    p()
            else:
                p('No new pages needed — cluster is complete.')
                p()

            p('#### Internal Links to Add:')
            if details.get('internal_links_to_add'):
                for link in details['internal_links_to_add']:
                    p(f'- `{link["source_page"]}` -> `{link["target_page"]}`')
                    p(f'  - Anchor text: "{link["anchor_text"]}"')
                    p(f'  - Placement: {link["placement"]}')
                p()
            else:
                p('No internal links needed.')
                p()

        elif t['action'] == 'increase_internal_links':
            p('#### Links to Add:')
            if details.get('links'):
                for link in details['links']:
                    p(f'- **Source:** `{link["source_page"]}` -> **Target:** `{link["target_page"]}`')
                    p(f'  - Anchor text: "{link["anchor_text"]}"')
                    p(f'  - Placement: {link["placement"]}')
                    p(f'  - Priority: {link["priority"]}')
                p()
            else:
                p('No links identified.')
                p()

            p(f'#### Anchor Text Variations:')
            for at in details.get('anchor_text_variations', []):
                p(f'- "{at}"')
            p()

        elif t['action'] in ('general_content_and_ux_audit', 'recovery_strategy'):
            ctx_info = details.get('page_context', {})
            p(f'#### Page Context:')
            p(f'- City: {ctx_info.get("city", "N/A")}')
            p(f'- Service: {ctx_info.get("service", "N/A")}')
            p(f'- Impressions: {ctx_info.get("impressions", 0):,}')
            p(f'- Clicks: {ctx_info.get("clicks", 0)}')
            p(f'- Avg Position: {ctx_info.get("avg_position", "N/A")}')
            p()

            p('#### Audit Findings:')
            for finding in details.get('audit_findings', []):
                p(f'- **{finding["finding"]}**')
                p(f'  - Diagnosis: {finding["diagnosis"]}')
                p(f'  - Action: {finding["action"]}')
            p()

            p('#### Missing Content Sections:')
            for section in details.get('missing_sections', []):
                p(f'- **{section["section"]}**')
                for elem in section.get('template', section.get('elements', [])):
                    p(f'  - {elem}')
            p()

            p('#### Entities to Add:')
            for entity in details.get('missing_entities', []):
                p(f'- {entity}')
            p()

            p('#### Schema to Add:')
            for schema in details.get('schema_to_add', []):
                p(f'- {schema}')
            p()

            p('#### EEAT Improvements:')
            for eeat in details.get('eeat_improvements', []):
                p(f'- {eeat}')
            p()

        elif t['action'] == 'observe_and_wait':
            p('#### Monitoring Task (No Execution Needed)')
            for instr in details.get('instructions', []):
                p(f'- {instr}')
            p()

        p('---')
        p()

    # Monitoring tasks summary
    if monitoring:
        p('## Monitoring Tasks (No Action Needed Today)')
        p()
        p(f'{len(monitoring)} pages are in observe-and-wait mode.')
        p()
        p('| Page | Wait Days | Maturity |')
        p('|------|-----------|----------|')
        for t in monitoring[:10]:
            det = t.get('task_details', {})
            p(f'| `{t["target"][:40]}` | {det.get("wait_days", "N/A")} | {det.get("maturity_score", 0):.4f} |')
        if len(monitoring) > 10:
            p(f'| ... {len(monitoring) - 10} more | | |')
        p()

    p('---')
    p()
    p(f'*Generated by Autonomous Execution Layer at {datetime.now(timezone.utc).isoformat()}*')

    return '\n'.join(lines)


def generate_weekly_plan_md(tasks, ctx):
    """Generate weekly_execution_plan.md"""
    lines = []

    def p(s=''):
        lines.append(s)

    today = datetime.now(timezone.utc)
    today_str = today.strftime('%Y-%m-%d')

    p(f'# Weekly Execution Plan — Week of {today_str}')
    p()
    p('## 7-Day Execution Schedule')
    p()
    p('Tasks are distributed across the week by priority and estimated effort.')
    p('Each day targets a manageable workload for an AI coding/content agent.')
    p()

    # Distribute tasks across 7 days
    executable = [t for t in tasks if t['action'] != 'observe_and_wait']
    monitoring = [t for t in tasks if t['action'] == 'observe_and_wait']

    # Group by action type for efficiency
    by_action = defaultdict(list)
    for t in executable:
        by_action[t['action']].append(t)

    # Day assignments
    days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    day_tasks = {d: [] for d in days}

    # P1 tasks first (Monday-Wednesday)
    p1_tasks = [t for t in executable if t['priority'] == 'P1']
    p2_tasks = [t for t in executable if t['priority'] == 'P2']
    p3_tasks = [t for t in executable if t['priority'] == 'P3']

    # Distribute P1 across Mon-Wed
    for i, t in enumerate(p1_tasks):
        day = days[i % 3]
        day_tasks[day].append(t)

    # P2 across Wed-Fri
    for i, t in enumerate(p2_tasks):
        day = days[3 + (i % 3)]
        day_tasks[day].append(t)

    # P3 across Fri-Sat
    for i, t in enumerate(p3_tasks):
        day = days[5 + (i % 2)]
        day_tasks[day].append(t)

    # Sunday: review and monitoring
    day_tasks['Sunday'] = monitoring[:5]

    total_revenue = sum(t.get('expected_revenue', 0) or 0 for t in executable)
    total_calls = sum(t.get('expected_calls', 0) or 0 for t in executable)

    p('## Weekly Summary')
    p()
    p(f'- **Executable tasks:** {len(executable)}')
    p(f'- **Monitoring tasks:** {len(monitoring)}')
    p(f'- **Total expected revenue:** ${total_revenue:,.2f}')
    p(f'- **Total expected calls:** {total_calls:.1f}')
    p()

    for day in days:
        day_list = day_tasks[day]
        if not day_list:
            continue

        day_revenue = sum(t.get('expected_revenue', 0) or 0 for t in day_list)
        p(f'## {day} ({len(day_list)} tasks)')
        p()
        p(f'- Expected revenue from day\'s tasks: ${day_revenue:,.2f}')
        p()

        p('| # | Task ID | Action | Target | Priority | Effort |')
        p('|---|---------|--------|--------|----------|--------|')
        for i, t in enumerate(day_list, 1):
            target = t['target']
            if len(target) > 45:
                target = target[:42] + '...'
            p(f'| {i} | {t["task_id"]} | {t["action"]} | `{target}` | {t["priority"]} | {t["estimated_effort"]} |')

        p()

        # Key instructions for the day
        p('### Key Instructions:')
        for t in day_list:
            details = t.get('task_details', {})
            if t['action'] == 'expand_cluster':
                n_pages = len(details.get('pages_to_create', []))
                n_links = len(details.get('internal_links_to_add', []))
                p(f'- **{t["task_id"]}**: Create {n_pages} new page(s), add {n_links} internal link(s) for `{t["target"][:40]}`')
            elif t['action'] == 'increase_internal_links':
                n_links = len(details.get('links', []))
                p(f'- **{t["task_id"]}**: Add {n_links} internal link(s) to `{t["target"][:40]}`')
            elif t['action'] in ('general_content_and_ux_audit', 'recovery_strategy'):
                n_sections = len(details.get('missing_sections', []))
                n_entities = len(details.get('missing_entities', []))
                p(f'- **{t["task_id"]}**: Audit and add {n_sections} section(s), {n_entities} entit(ies) to `{t["target"][:40]}`')
            elif t['action'] == 'observe_and_wait':
                p(f'- **{t["task_id"]}**: Monitor `{t["target"][:40]}` — no action needed')
        p()

    p('---')
    p()
    p('## Execution Notes')
    p()
    p('- Tasks are ordered by priority within each day.')
    p('- Dependencies must be resolved before starting a task.')
    p('- After completing each task, mark `execution_status` as `completed` in execution_queue.json.')
    p('- Re-run the Decision Engine after all tasks are complete to measure impact.')
    p('- Expected revenue figures are uncalibrated estimates — treat as relative priority, not dollar forecasts.')
    p()
    p(f'*Generated by Autonomous Execution Layer at {datetime.now(timezone.utc).isoformat()}*')

    return '\n'.join(lines)


# ============================================================
# Pipeline (reuses existing engines)
# ============================================================

def _run_pipeline():
    ctx = {}
    ctx['snapshot_date'] = datetime.now(timezone.utc).strftime('%Y-%m-%d')

    page_reports = load_gsc_page_report_from_csv()
    ctx['page_reports'] = page_reports
    ctx['n_pages'] = len(page_reports)
    ctx['raw_metrics'] = {p['page']: p for p in page_reports}

    ctx['marketcall'] = None
    ctx['revenue_per_call'] = None
    if config.is_enabled('marketcall'):
        m = marketcall_ingestion.load_marketcall_metrics()
        ctx['marketcall'] = m
        if m:
            ctx['revenue_per_call'] = m.get('revenue_per_approved_call')

    ctx['ga4'] = None
    if config.is_enabled('ga4'):
        ctx['ga4'] = ga4_ingestion.load_ga4_page_metrics()

    ctx['attribution'] = None
    if config.is_enabled('attribution'):
        ar = AttributionResolver()
        ar.add_all(
            evidence_from_gsc_page(
                p['page'],
                {'impressions': p.get('impressions', 0), 'clicks': p.get('clicks', 0),
                 'ctr': p.get('ctr'), 'avg_position': p.get('position')},
            )
            for p in page_reports
        )
        if ctx['ga4']:
            _meta_keys = {'attribution_level', 'attribution_note', 'source',
                          'date_from', 'date_to', 'fetched_at'}
            ar.add_all(
                evidence_from_ga4_page(
                    pid, {k: v for k, v in m.items() if k not in _meta_keys},
                    timestamp=m.get('fetched_at'),
                )
                for pid, m in ctx['ga4'].items()
            )
        if m:
            ar.add_evidence(
                evidence_from_marketcall_campaign(m['campaign_id'], m)
            )
        ctx['attribution'] = ar

    ctx['opp_results'] = []
    ctx['opp_by_id'] = {}
    if config.is_enabled('opportunity_score'):
        records = [
            {'page': p['page'], 'impressions': p.get('impressions', 0),
             'ctr': p.get('ctr', 0.0), 'avg_position': p.get('position')}
            for p in page_reports
        ]
        ctx['opp_results'] = score_records(records)
        ctx['opp_by_id'] = {r.record_id: r for r in ctx['opp_results']}

    ctx['graph_metrics'] = {}
    ctx['weak_components'] = []
    ctx['taxonomy_orphans'] = set()
    if config.is_enabled('graph'):
        graph = build_hierarchy_graph(page_reports)
        ranks = pagerank(graph)
        ctx['taxonomy_orphans'] = set(orphan_nodes(graph, exclude=[ROOT_NODE]))
        ctx['graph_metrics'] = {
            p['page']: {
                'pagerank': ranks.get(p['page'], 0.0),
                'is_orphan': p['page'] in ctx['taxonomy_orphans'],
                'in_degree': graph.in_degree(p['page']),
            }
            for p in page_reports
        }
        components = weakly_connected_components(graph)
        ctx['weak_components'] = components[1:] if len(components) > 1 else []

    ctx['real_link_graph_metrics'] = {}
    if config.is_enabled('link_graph'):
        rg = build_real_link_graph()
        ctx['real_link_graph_metrics'] = diff_with_hierarchy(
            rg, ctx['taxonomy_orphans'], [p['page'] for p in page_reports],
        )

    ctx['posteriors'] = {}
    if config.is_enabled('bayesian'):
        eng = BayesianEngine()
        for page in page_reports:
            imp = page.get('impressions', 0)
            clk = page.get('clicks', 0)
            if imp > 0:
                eng.observe(page['page'], successes=min(clk, imp), trials=imp)
        ctx['posteriors'] = {k: eng.get_posterior(k) for k in eng.all_keys()}

    ctx['temporal_priors'] = {}
    if config.is_enabled('gott'):
        ctx['temporal_priors'] = gott_engine.compute_all_temporal_priors()

    ctx['learned_adjustments'] = {}
    if config.is_enabled('learning'):
        learning_engine.evaluate_all_learning()
        ls = learning_engine.get_learning_summary()
        ctx['learned_adjustments'] = ls.adjustments

    ctx['recs'] = []
    if config.is_enabled('recommendation') and ctx['opp_results']:
        ctx['recs'] = generate_recommendations(
            ctx['opp_results'], graph_metrics=ctx['graph_metrics'],
            bayesian_posteriors=ctx['posteriors'],
            raw_metrics=ctx['raw_metrics'],
            weak_components=ctx['weak_components'],
            real_link_graph_metrics=ctx['real_link_graph_metrics'],
            revenue_per_call=ctx['revenue_per_call'],
            attribution_resolver=ctx['attribution'],
            learned_confidence_adjustments=ctx['learned_adjustments'],
            temporal_priors={k: v.to_dict() for k, v in ctx['temporal_priors'].items()},
        )

    return ctx


# ============================================================
# Main
# ============================================================

def run():
    ctx = _run_pipeline()
    tasks = build_execution_queue(ctx)

    # Generate outputs
    queue_json = generate_execution_queue_json(tasks, ctx)
    daily_md = generate_daily_report_md(tasks, ctx)
    weekly_md = generate_weekly_plan_md(tasks, ctx)

    # Write files
    with open('execution_queue.json', 'w', encoding='utf-8') as f:
        f.write(queue_json)

    with open('daily_execution_report.md', 'w', encoding='utf-8') as f:
        f.write(daily_md)

    with open('weekly_execution_plan.md', 'w', encoding='utf-8') as f:
        f.write(weekly_md)

    # Console summary
    print(f'Autonomous Execution Layer Complete')
    print(f'  Tasks generated: {len(tasks)}')
    print(f'  P1 (Critical): {sum(1 for t in tasks if t["priority"] == "P1")}')
    print(f'  P2 (High):     {sum(1 for t in tasks if t["priority"] == "P2")}')
    print(f'  P3 (Medium):   {sum(1 for t in tasks if t["priority"] == "P3")}')
    print(f'  Total expected revenue: ${sum(t.get("expected_revenue", 0) or 0 for t in tasks):,.2f}')
    print(f'  Total expected calls:   {sum(t.get("expected_calls", 0) or 0 for t in tasks):.1f}')
    print()
    print('  Outputs:')
    print('    execution_queue.json')
    print('    daily_execution_report.md')
    print('    weekly_execution_plan.md')

    # Action distribution
    from collections import Counter
    action_counts = Counter(t['action'] for t in tasks)
    print()
    print('  Action distribution:')
    for action, count in action_counts.most_common():
        print(f'    {action}: {count}')


if __name__ == '__main__':
    run()
