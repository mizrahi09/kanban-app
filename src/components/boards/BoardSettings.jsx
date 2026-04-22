import { useState } from 'react'

export default function BoardSettings({
  board,
  columns,
  onClose,
  onUpdateBoard,
  onCreateColumn,
  onUpdateColumn,
  onDeleteColumn,
  onReorderColumns,
}) {
  const [boardName, setBoardName] = useState(board.name)
  const [editingColumnId, setEditingColumnId] = useState(null)
  const [editingColumnName, setEditingColumnName] = useState('')
  const [addingColumn, setAddingColumn] = useState(false)
  const [newColumnName, setNewColumnName] = useState('')

  const handleBoardNameSave = async () => {
    const trimmed = boardName.trim()
    if (!trimmed || trimmed === board.name) return
    try {
      await onUpdateBoard({ name: trimmed })
    } catch (err) {
      console.error(err)
    }
  }

  const handleBoardNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur()
    }
  }

  const handlePrivacyChange = async () => {
    try {
      await onUpdateBoard({ isPrivate: !board.isPrivate })
    } catch (err) {
      console.error(err)
    }
  }

  const startEditingColumn = (column) => {
    setEditingColumnId(column.id)
    setEditingColumnName(column.name)
  }

  const handleColumnNameSave = async (columnId) => {
    const trimmed = editingColumnName.trim()
    if (trimmed) {
      try {
        await onUpdateColumn(columnId, { name: trimmed })
      } catch (err) {
        console.error(err)
      }
    }
    setEditingColumnId(null)
    setEditingColumnName('')
  }

  const handleColumnNameKeyDown = (e, columnId) => {
    if (e.key === 'Enter') {
      e.target.blur()
    } else if (e.key === 'Escape') {
      setEditingColumnId(null)
      setEditingColumnName('')
    }
  }

  const handleDeleteColumn = async (columnId) => {
    try {
      await onDeleteColumn(columnId)
    } catch (err) {
      console.error(err)
    }
  }

  const handleMoveUp = async (index) => {
    if (index === 0) return
    const reordered = [...columns]
    ;[reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]]
    try {
      await onReorderColumns(reordered)
    } catch (err) {
      console.error(err)
    }
  }

  const handleMoveDown = async (index) => {
    if (index === columns.length - 1) return
    const reordered = [...columns]
    ;[reordered[index], reordered[index + 1]] = [reordered[index + 1], reordered[index]]
    try {
      await onReorderColumns(reordered)
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddColumn = async (e) => {
    if (e.key === 'Enter') {
      const trimmed = newColumnName.trim()
      if (!trimmed) return
      try {
        await onCreateColumn(trimmed)
      } catch (err) {
        console.error(err)
      }
      setNewColumnName('')
      setAddingColumn(false)
    } else if (e.key === 'Escape') {
      setNewColumnName('')
      setAddingColumn(false)
    }
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <span className="text-base font-bold text-indigo-900">Board Settings</span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-6">

          {/* Section 1 — Board Name */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
              Board Name
            </p>
            <input
              type="text"
              value={boardName}
              onChange={e => setBoardName(e.target.value)}
              onBlur={handleBoardNameSave}
              onKeyDown={handleBoardNameKeyDown}
              className="border border-indigo-200 rounded-xl px-3 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Section 2 — Privacy */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
              Privacy
            </p>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={board.isPrivate}
                onChange={handlePrivacyChange}
              />
              <span className="text-sm text-slate-600">Private board</span>
            </label>
          </div>

          {/* Section 3 — Columns */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
              Columns
            </p>

            <div className="flex flex-col gap-1">
              {columns.map((column, index) => (
                <div key={column.id} className="flex items-center gap-1">
                  {/* Drag handle (decorative) */}
                  <span className="cursor-grab text-slate-300 mr-2 select-none">⋮⋮</span>

                  {/* Editable name */}
                  {editingColumnId === column.id ? (
                    <input
                      autoFocus
                      type="text"
                      value={editingColumnName}
                      onChange={e => setEditingColumnName(e.target.value)}
                      onBlur={() => handleColumnNameSave(column.id)}
                      onKeyDown={e => handleColumnNameKeyDown(e, column.id)}
                      className="border border-indigo-200 rounded-xl px-3 py-1 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  ) : (
                    <span
                      className="flex-1 text-sm text-slate-700 cursor-pointer hover:text-indigo-700 truncate"
                      onClick={() => startEditingColumn(column)}
                    >
                      {column.name}
                    </span>
                  )}

                  {/* Up button */}
                  {index > 0 && (
                    <button
                      onClick={() => handleMoveUp(index)}
                      className="text-slate-300 hover:text-slate-500 text-xs px-0.5"
                      title="Move up"
                    >
                      ↑
                    </button>
                  )}

                  {/* Down button */}
                  {index < columns.length - 1 && (
                    <button
                      onClick={() => handleMoveDown(index)}
                      className="text-slate-300 hover:text-slate-500 text-xs px-0.5"
                      title="Move down"
                    >
                      ↓
                    </button>
                  )}

                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteColumn(column.id)}
                    className="text-slate-300 hover:text-red-400 ml-1"
                    title="Delete column"
                  >
                    🗑
                  </button>
                </div>
              ))}
            </div>

            {/* Add column */}
            {addingColumn ? (
              <input
                autoFocus
                type="text"
                placeholder="Column name..."
                value={newColumnName}
                onChange={e => setNewColumnName(e.target.value)}
                onKeyDown={handleAddColumn}
                onBlur={() => {
                  setNewColumnName('')
                  setAddingColumn(false)
                }}
                className="mt-2 border border-indigo-200 rounded-xl px-3 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            ) : (
              <button
                onClick={() => setAddingColumn(true)}
                className="mt-2 text-sm text-indigo-500 hover:text-indigo-700 font-medium"
              >
                + Add column
              </button>
            )}
          </div>

        </div>
      </div>
    </>
  )
}
