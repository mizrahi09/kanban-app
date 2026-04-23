import { useState, useEffect, useRef } from 'react'

const PRIORITY_BADGE = {
  High:   'bg-red-100 text-red-700',
  Medium: 'bg-orange-100 text-orange-700',
  Low:    'bg-yellow-100 text-yellow-700',
}

const Icons = {
  duplicate: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  edit: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  details: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  newTab: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  ),
  link: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  ),
  trash: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
}

function ContextMenu({ x, y, onClose, items }) {
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const left = Math.min(x, window.innerWidth - 224)
  const top  = Math.min(y, window.innerHeight - 260)

  return (
    <div
      ref={ref}
      className="fixed z-50 bg-white rounded-xl shadow-2xl border border-gray-100 py-1.5 w-56"
      style={{ left, top }}
    >
      {items.map((item, i) =>
        item.divider ? (
          <div key={i} className="my-1 border-t border-gray-100" />
        ) : (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); item.action(); onClose() }}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors text-left ${
              item.danger
                ? 'text-red-500 hover:bg-red-50'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="flex-shrink-0 text-gray-400">{item.icon}</span>
            {item.label}
          </button>
        )
      )}
    </div>
  )
}

export default function TaskCard({ task, onEdit, onDelete, onDuplicate, boardId }) {
  const [menu, setMenu] = useState(null)
  const { title, priority, dueDate, completed } = task

  const taskUrl = `${window.location.origin}/board/${boardId}?task=${task.id}`

  const handleContextMenu = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setMenu({ x: e.clientX, y: e.clientY })
  }

  const menuItems = [
    { icon: Icons.duplicate, label: 'Duplicate task',    action: onDuplicate },
    { icon: Icons.edit,      label: 'Edit task',         action: onEdit },
    { icon: Icons.details,   label: 'Open task details', action: onEdit },
    { icon: Icons.newTab,    label: 'Open in new tab',   action: () => window.open(taskUrl, '_blank') },
    { icon: Icons.link,      label: 'Copy task link',    action: () => navigator.clipboard.writeText(taskUrl) },
    { divider: true },
    { icon: Icons.trash,     label: 'Delete task',       action: onDelete, danger: true },
  ]

  return (
    <>
      <div
        className="group relative bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing p-3"
        onClick={onEdit}
        onContextMenu={handleContextMenu}
      >
        {/* Pencil edit button — top right, visible on hover */}
        <button
          onClick={e => { e.stopPropagation(); onEdit() }}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-indigo-500 transition-all p-0.5 rounded"
          aria-label="Edit task"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>

        {/* Title row */}
        <div className="flex items-start gap-2.5 pr-4">
          {completed ? (
            <div className="mt-0.5 w-4 h-4 flex-shrink-0 rounded-full bg-green-500 flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
              </svg>
            </div>
          ) : (
            <div className="mt-0.5 w-4 h-4 flex-shrink-0 rounded-full border-2 border-gray-300 hover:border-indigo-400 transition-colors" />
          )}
          <p className={`text-sm leading-snug ${completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
            {title || <span className="text-gray-300 italic">Untitled task</span>}
          </p>
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

      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          onClose={() => setMenu(null)}
          items={menuItems}
        />
      )}
    </>
  )
}
