const PRIORITY_COLORS = {
  High: 'text-red-500',
  Medium: 'text-amber-500',
  Low: 'text-green-500',
}

export default function TaskCard({ task, onEdit, onDelete }) {
  const { title, priority, dueDate, contentType } = task

  return (
    <div
      className="group relative bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm px-3 py-2.5 cursor-pointer transition-all"
      onClick={onEdit}
    >
      {/* Delete — visible on hover */}
      <button
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all text-xs leading-none p-0.5"
        onClick={e => { e.stopPropagation(); onDelete() }}
        aria-label="Delete task"
      >
        ✕
      </button>

      {/* Title row with circle */}
      <div className="flex items-start gap-2.5 pr-4">
        <div className="mt-0.5 w-4 h-4 flex-shrink-0 rounded-full border-2 border-gray-300 group-hover:border-indigo-400 transition-colors" />
        <p className="text-sm text-gray-700 leading-snug">{title}</p>
      </div>

      {/* Footer: priority + due date */}
      {(priority || dueDate || contentType) && (
        <div className="flex items-center gap-2 mt-2 ml-6.5 pl-0.5">
          {priority && (
            <span className={`text-xs font-medium ${PRIORITY_COLORS[priority] ?? 'text-gray-400'}`}>
              ● {priority}
            </span>
          )}
          {dueDate && (
            <span className="text-xs text-gray-400">
              {new Date(dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          )}
          {contentType && (
            <span className="text-xs text-gray-400 truncate">{contentType}</span>
          )}
        </div>
      )}
    </div>
  )
}
