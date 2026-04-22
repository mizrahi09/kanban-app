const PRIORITY_BADGE = {
  High:   'bg-red-100 text-red-700',
  Medium: 'bg-orange-100 text-orange-700',
  Low:    'bg-yellow-100 text-yellow-700',
}

export default function TaskCard({ task, onEdit, onDelete }) {
  const { title, priority, dueDate } = task

  return (
    <div
      className="group relative bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer p-3"
      onClick={onEdit}
    >
      {/* Delete on hover */}
      <button
        className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all text-xs leading-none"
        onClick={e => { e.stopPropagation(); onDelete() }}
        aria-label="Delete task"
      >
        ✕
      </button>

      {/* Title row */}
      <div className="flex items-start gap-2.5 pr-5">
        <div className="mt-0.5 w-4 h-4 flex-shrink-0 rounded-full border-2 border-gray-300 hover:border-indigo-400 transition-colors" />
        <p className="text-sm text-gray-800 leading-snug">{title}</p>
      </div>

      {/* Priority + due date */}
      {(priority || dueDate) && (
        <div className="flex items-center gap-1.5 mt-2.5 ml-6">
          {priority && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${PRIORITY_BADGE[priority] ?? 'bg-gray-100 text-gray-600'}`}>
              {priority}
            </span>
          )}
          {dueDate && (
            <span className="text-xs text-gray-400">
              {new Date(dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      )}

      {/* Assignee placeholder */}
      <div className="mt-2.5 ml-6">
        <div className="w-6 h-6 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
          <svg className="w-3 h-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      </div>
    </div>
  )
}
