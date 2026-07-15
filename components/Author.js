import Link from 'next/link';
import { ReviewHistory } from './ReviewHistory';

const UPDATE_DATE = '2025-06-26';

export function Author({ pageType = 'page', authorSlug = 'editorial-team', reviewedBy = null, lastReviewed = UPDATE_DATE }) {
  const reviewerName = reviewedBy || 'YoHomeFix Editorial Team';
  const authorHref = `/authors/${authorSlug}`;

  return (
    <div className="border-t border-gray-200 pt-4 mt-6">
      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
        <span className="font-semibold text-gray-700">Reviewed by {reviewerName}</span>
        <span className="hidden sm:inline">•</span>
        <time dateTime={lastReviewed}>Last reviewed: {lastReviewed}</time>
        <span className="hidden sm:inline">•</span>
        <Link href={authorHref} className="text-blue-600 hover:underline no-underline">
          Author profile
        </Link>
        <span className="hidden sm:inline">•</span>
        <Link href="/editorial-policy" className="text-blue-600 hover:underline no-underline">
          Editorial Policy
        </Link>
        <span className="hidden sm:inline">•</span>
        <Link href="/sources" className="text-blue-600 hover:underline no-underline">
          Sources & Methodology
        </Link>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        {pageType === 'guide'
          ? 'This guide is for educational purposes only. For plumbing emergencies, call a licensed professional immediately.'
          : pageType === 'trust'
            ? 'Trust, editorial, and policy content is reviewed by the YoHomeFix editorial team and updated when standards or sources change.'
            : 'Content is researched from authoritative public sources and reviewed for accuracy. Pricing and availability are confirmed by the technician on site.'}
      </p>
      <ReviewHistory />
    </div>
  );
}
