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
              Emergency plumbing dispatch connecting homeowners with licensed, insured plumbers across the United States.
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
          <p className="mb-2">
            YoHomeFix is a call connection platform, not a licensed plumbing contractor. All work is performed by independent, state-licensed plumbing professionals.
          </p>
          <p className="mb-2">
            YoHomeFix is a free service to assist homeowners in connecting with local service providers. All contractors/providers are independent and YoHomeFix does not warrant or guarantee any work performed. It is the responsibility of the homeowner to verify that the hired contractor furnishes the necessary license and insurance required for the work being performed. All persons depicted in a photo or video are actors or models and not contractors listed on YoHomeFix.
          </p>
          <p>
            Same-day and 24/7 emergency services are subject to provider participation, location, technician availability, and demand. Availability is not guaranteed and may vary by market and appointment capacity.
          </p>
        </div>
      </div>
    </footer>
  );
}
