const BLOCK_STYLES = {
  'warning-signs': { bg: 'bg-red-50 border border-red-200', icon: '⚠️', headingColor: 'text-red-900' },
  'when-to-call': { bg: 'bg-orange-50 border border-orange-200', icon: '📞', headingColor: 'text-orange-900' },
  'immediate-safety': { bg: 'bg-yellow-50 border border-yellow-300', icon: '🛡️', headingColor: 'text-yellow-900' },
  'diy-unsafe': { bg: 'bg-rose-50 border border-rose-200', icon: '🚫', headingColor: 'text-rose-900' },
  'repair-process': { bg: 'bg-blue-50 border border-blue-200', icon: '🔧', headingColor: 'text-blue-900' },
  'repair-timeline': { bg: 'bg-indigo-50 border border-indigo-200', icon: '⏱️', headingColor: 'text-indigo-900' },
  'cost-factors': { bg: 'bg-green-50 border border-green-200', icon: '💰', headingColor: 'text-green-900' },
  'preventive-maintenance': { bg: 'bg-teal-50 border border-teal-200', icon: '✅', headingColor: 'text-teal-900' },
};

export function ContentBlocks({ blocks }) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <div className="mb-10 space-y-6">
      {blocks.map((block, idx) => {
        const style = BLOCK_STYLES[block.type] || { bg: 'bg-gray-50 border border-gray-200', icon: '📋', headingColor: 'text-gray-900' };
        return (
          <div key={idx} className={`scroll-mt-24 rounded-2xl p-5 md:p-6 ${style.bg}`} id={block.type}>
            <h2 className={`text-xl md:text-2xl font-bold mb-3 flex items-start gap-2 ${style.headingColor}`}>
              <span className="text-2xl flex-shrink-0">{style.icon}</span>
              <span>{block.heading}</span>
            </h2>
            {block.body && (
              <p className="text-gray-700 leading-relaxed mb-4 text-sm md:text-base">{block.body}</p>
            )}
            {block.list && block.list.length > 0 && (
              block.ordered ? (
                <ol className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-700 list-decimal pl-5 text-sm md:text-base">
                  {block.list.map((item, i) => (
                    <li key={i} className="leading-relaxed">{item}</li>
                  ))}
                </ol>
              ) : (
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-700 list-disc pl-5 text-sm md:text-base">
                  {block.list.map((item, i) => (
                    <li key={i} className="leading-relaxed">{item}</li>
                  ))}
                </ul>
              )
            )}
          </div>
        );
      })}
    </div>
  );
}
