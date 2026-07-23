import Link from 'next/link';

const UPDATE_DATE = '2025-06-26';

export function LastUpdated({ className = '' }) {
  return (
    <p className={`text-xs text-gray-700 ${className}`}>
      Last updated: <time dateTime={UPDATE_DATE}>{UPDATE_DATE}</time>
    </p>
  );
}

export function EditorialFooter({ pageType = 'page' }) {
  return (
    <div className="border-t border-gray-200 pt-4 mt-8">
      <div className="grid md:grid-cols-3 gap-4 text-xs text-gray-500">
        <div>
          <p className="font-semibold text-gray-700 mb-1">Last Updated</p>
          <p><time dateTime={UPDATE_DATE}>{UPDATE_DATE}</time></p>
          <p className="mt-2">
            <Link href="/about" className="text-blue-600 hover:underline no-underline">About YoHomeFix</Link>
          </p>
          <p className="mt-1">
            <Link href="/editorial-policy" className="text-blue-600 hover:underline no-underline">Editorial Policy</Link>
          </p>
          <p className="mt-1">
            <Link href="/sources" className="text-blue-600 hover:underline no-underline">Sources</Link>
          </p>
        </div>
        <div>
          <p className="font-semibold text-gray-700 mb-1">Review Process</p>
          <p>
            Content is reviewed against current plumbing industry standards and local infrastructure data.
            Service pages are built from verified municipal water utility, geological, and climate data.
            <Link href="/editorial-policy" className="text-blue-600 hover:underline ml-1 no-underline">Read our editorial standards.</Link>
          </p>
        </div>
        <div>
          <p className="font-semibold text-gray-700 mb-1">Accuracy & Disclosures</p>
          <p>
            Local data is sourced from verified municipal and geological records.
            Pricing shown is for educational purposes only; your technician provides a written upfront quote before any work begins.
            YoHomeFix provides plumbing services across the United States.
          </p>
        </div>
      </div>
    </div>
  );
}
