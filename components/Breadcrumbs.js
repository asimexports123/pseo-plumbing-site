import Link from 'next/link';

// Pure presentation — reproduces the exact breadcrumb markup that was
// previously duplicated inline across ~27 pages. Breadcrumb *data* (the
// items array) is still built per-page, preserving unique per-page content.
export function Breadcrumbs({ items, className = 'max-w-3xl mx-auto w-full px-4 py-2 text-sm text-gray-500', separatorAsListItem = false, olClassName = 'flex flex-wrap items-center gap-1' }) {
  if (!items || items.length === 0) return null;

  if (separatorAsListItem) {
    // Matches the exact DOM structure previously duplicated across ~24 static pages:
    // separator rendered as its own <li>.
    return (
      <nav aria-label="Breadcrumb" className={className}>
        <ol className={olClassName}>
          {items.map((item, i) => (
            <li key={`item-${item.url || item.name}`}>
              {i > 0 && <span className="text-gray-300 mx-1">›</span>}
              {i < items.length - 1
                ? <Link href={item.url} className="text-blue-600 hover:underline no-underline">{item.name}</Link>
                : <span className="text-gray-700 font-medium">{item.name}</span>}
            </li>
          )).flatMap((el, i) => i === 0 ? [el] : [<li key={`sep-${i}`}><span className="text-gray-300 mx-1">›</span></li>, el])}
        </ol>
      </nav>
    );
  }

  // Matches the exact DOM structure used by PlumberPage.js / ZipServicePage.js:
  // separator combined inside the item's <li>.
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, i) => (
          <li key={item.url || item.name} className="flex items-center gap-1">
            {i > 0 && <span className="text-gray-300">›</span>}
            {i < items.length - 1
              ? <Link href={item.url} className="text-blue-600 hover:underline no-underline">{item.name}</Link>
              : <span className="text-gray-700 font-medium">{item.name}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
