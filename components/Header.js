import Link from 'next/link';
import { PhoneCTA } from './PhoneCTA';

// Pure presentation — reproduces the exact nav markup previously duplicated
// inline across ~24 static pages. `cta` lets templates with a different call
// button (e.g. PlumberPage.js's desktop/mobile split with tracking) supply
// their own node while still sharing the outer <nav> wrapper.
export function Header({ cta }) {
  return (
    <nav className="bg-blue-900 text-white px-4 py-3 flex justify-between items-center sticky top-0 z-40 shadow-lg">
      <Link href="/" className="text-2xl font-extrabold text-white no-underline">YoHomeFix</Link>
      {cta || (
        <PhoneCTA
          className="bg-red-600 text-white px-4 py-2 rounded-full font-bold text-sm"
        >
          📞 Call Now
        </PhoneCTA>
      )}
    </nav>
  );
}
