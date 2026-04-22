const PRIORITY_STYLES = {
  Low: 'bg-green-100 text-green-700',
  Medium: 'bg-amber-100 text-amber-700',
  High: 'bg-red-100 text-red-700',
}

export default function TaskCard({ task, onEdit, onDelete }) {
  const { title, description, priority, contentType, dueDate } = task

  return (
    <div
      className="group relative bg-white rounded-xl shadow-sm hover:shadow-md border border-slate-100 p-4 cursor-pointer"
      onClick={onEdit}
    >
      <button
        className="absolute top-2 right-2 text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-sm leading-none p-1"
        onClick={e => { e.stopPropagation(); onDelete() }}
        aria-label="Delete task"
      >
        ✕
      </button>

      <p className="text-sm font-semibold text-slate-800 pr-6">{title}</p>

      {description && (
        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{description}</p>
      )}

      <div className="flex flex-wrap gap-1.5 mt-2">
        {priority && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_STYLES[priority] ?? 'bg-slate-100 text-slate-600'}`}>
            {priority}
          </span>
        )}
        {contentType && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
            {contentType}
          </span>
        )}
      </div>

      {dueDate && (
        <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {new Date(dueDate).toLocaleDateString()}
        </p>
      )}
    </div>
  )
}
