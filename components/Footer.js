import Link from 'next/link';
import { PHONE_NUMBER } from '../lib/cities';

const footerLinks = [
  { href: '/about', label: 'About' },
  { href: '/why-trust-yohomefix', label: 'Why Trust YoHomeFix' },
  { href: '/how-yohomefix-works', label: 'How YoHomeFix Works' },
  { href: '/authors', label: 'Authors' },
  { href: '/editorial-policy', label: 'Editorial Policy' },
  { href: '/sources', label: 'Sources & Methodology' },
  { href: '/contact', label: 'Contact' },
  { href: '/faq', label: 'FAQ' },
  { href: '/guides', label: 'Guides' },
  { href: '/research/us-water-hardness-plumbing-risk', label: 'Water Hardness Research' },
  { href: '/plumber-usa', label: 'Cities' },
  { href: '/sitemap.xml', label: 'Sitemap' },
  { href: '/privacy-policy', label: 'Privacy' },
  { href: '/terms-of-service', label: 'Terms' },
  { href: '/disclaimer', label: 'Disclaimer' },
];

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 px-4 py-10 mt-auto">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
          <div>
            <Link href="/" className="text-white font-bold text-lg no-underline">YoHomeFix</Link>
            <p className="text-sm text-gray-400 mt-2 max-w-sm">
              YoHomeFix provides 24/7 emergency plumbing services across the United States. Licensed, insured plumbers — upfront pricing, 60-minute response target.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            <a
              href={`tel:${PHONE_NUMBER}`}
              className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white px-5 py-2 rounded-full font-bold text-sm transition-colors"
              aria-label="Call emergency dispatch"
            >
              📞 Call 24/7
            </a>
          </div>
        </div>

        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm mb-6">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-gray-300 hover:text-white underline underline-offset-4 hover:no-underline transition-colors py-2 inline-block min-h-[44px] flex items-center">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-gray-800 pt-6 text-sm text-gray-400">
          <p className="mb-2">
            © {new Date().getFullYear()} YoHomeFix. All rights reserved. Content reviewed by the YoHomeFix Editorial Team.
          </p>
          <p>
            Same-day and 24/7 emergency services are subject to location, plumber availability, and demand. Availability is not guaranteed and may vary by market and appointment capacity.
          </p>
        </div>
      </div>
    </footer>
  );
}
