const DEFAULT_HISTORY = [
  { date: '2025-06-26', reviewer: 'YoHomeFix Editorial Team', action: 'Published review and accuracy check' },
];

export function ReviewHistory({ history = DEFAULT_HISTORY }) {
  if (!history || history.length === 0) return null;

  return (
    <details className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 text-sm">
      <summary className="font-semibold text-gray-700 cursor-pointer">Review history</summary>
      <ol className="mt-3 space-y-2 text-gray-600">
        {history.map((entry, i) => (
          <li key={i} className="flex flex-col sm:flex-row sm:gap-3">
            <time dateTime={entry.date} className="font-medium text-gray-700 min-w-[110px]">{entry.date}</time>
            <span>{entry.action} — {entry.reviewer}</span>
          </li>
        ))}
      </ol>
    </details>
  );
}
