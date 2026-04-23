import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useComments } from '../../hooks/useComments'
import { useSubtasks } from '../../hooks/useSubtasks'

const PRIORITY_COLORS = {
  High: 'bg-red-100 text-red-700',
  Medium: 'bg-orange-100 text-orange-700',
  Low: 'bg-yellow-100 text-yellow-700',
}

function AutoResizeTextarea({ className, value, onChange, onBlur, placeholder, minRows = 1 }) {
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto'
      ref.current.style.height = ref.current.scrollHeight + 'px'
    }
  }, [value])

  return (
    <textarea
      ref={ref}
      className={className}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      rows={minRows}
      style={{ overflow: 'hidden' }}
    />
  )
}

// New task creation form shown when task is null
function NewTaskForm({ columnId, columns, onSave, onClose }) {
  const [title, setTitle] = useState('')
  const [selectedColumn, setSelectedColumn] = useState(columnId ?? columns[0]?.id ?? '')
  const [priority, setPriority] = useState('Medium')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    setError(null)
    setLoading(true)
    try {
      await onSave({ title: title.trim(), columnId: selectedColumn, priority })
    } catch {
      setError('Failed to create task. Please try again.')
      setLoading(false)
    }
  }

  return (
    <>
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
        <span className="text-sm font-semibold text-gray-700">New Task</span>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          aria-label="Close panel"
        >
          →
        </button>
      </div>

      {/* Form body */}
      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Title *</label>
          <input
            autoFocus
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Task title"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Column</label>
          <select
            value={selectedColumn}
            onChange={e => setSelectedColumn(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
          >
            {columns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Priority</label>
          <select
            value={priority}
            onChange={e => setPriority(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        {error && <p className="text-red-500 text-xs">{error}</p>}

        <div className="flex gap-3 justify-end mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-400 hover:text-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={loading || !title.trim()}
            className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? 'Creating…' : 'Create task'}
          </button>
        </div>
      </div>
    </>
  )
}

// Existing task detail view
function TaskDetail({ task, columns, boardId, onUpdate, onDelete, onClose }) {
  const { user } = useAuth()
  const { comments, addComment, deleteComment } = useComments(boardId, task.id)
  const { subtasks, addSubtask, toggleSubtask, deleteSubtask } = useSubtasks(boardId, task.id)

  const [title, setTitle] = useState(task.title ?? '')
  const [description, setDescription] = useState(task.description ?? '')
  const [commentText, setCommentText] = useState('')
  const [subtaskInput, setSubtaskInput] = useState('')
  const [showSubtaskInput, setShowSubtaskInput] = useState(false)
  const [activeTab, setActiveTab] = useState('comments')

  // Sync title/description if task prop changes
  useEffect(() => {
    setTitle(task.title ?? '')
    setDescription(task.description ?? '')
  }, [task.id])

  const handleTitleBlur = () => {
    if (title.trim() !== task.title) {
      onUpdate(task.id, { title: title.trim() || task.title })
    }
  }

  const handleDescriptionBlur = () => {
    if (description !== (task.description ?? '')) {
      onUpdate(task.id, { description })
    }
  }

  const handleToggleComplete = () => {
    onUpdate(task.id, { completed: !task.completed })
  }

  const handleCommentKeyDown = async (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!commentText.trim()) return
      await addComment(commentText)
      setCommentText('')
    }
  }

  const handleAddSubtask = async () => {
    if (!subtaskInput.trim()) return
    await addSubtask(subtaskInput)
    setSubtaskInput('')
    setShowSubtaskInput(false)
  }

  const completedCount = subtasks.filter(s => s.completed).length

  return (
    <>
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
        {/* Mark complete toggle */}
        <button
          onClick={handleToggleComplete}
          className={
            task.completed
              ? 'bg-green-50 border border-green-200 text-green-700 rounded-lg px-3 py-1.5 text-sm flex items-center gap-2'
              : 'border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg px-3 py-1.5 text-sm flex items-center gap-2'
          }
        >
          {task.completed ? (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Completed
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={1.5}>
                <circle cx="10" cy="10" r="8" />
              </svg>
              Mark complete
            </>
          )}
        </button>

        {/* Close button */}
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          aria-label="Close panel"
        >
          →
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        {/* Title */}
        <div className="px-6 py-4">
          <AutoResizeTextarea
            className="text-2xl font-bold text-gray-900 w-full resize-none outline-none bg-transparent"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            placeholder="Task title"
          />
        </div>

        {/* Fields */}
        <div className="px-6 pb-4 flex flex-col gap-0">
          {/* Assignee */}
          <div className="flex items-center py-2 border-b border-gray-50">
            <span className="w-28 text-sm text-gray-500 flex-shrink-0">Assignee</span>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-6 h-6 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
                <svg className="w-3 h-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              No assignee
            </div>
          </div>

          {/* Due date */}
          <div className="flex items-center py-2 border-b border-gray-50">
            <span className="w-28 text-sm text-gray-500 flex-shrink-0">Due date</span>
            <input
              type="date"
              defaultValue={task.dueDate ?? ''}
              onChange={e => onUpdate(task.id, { dueDate: e.target.value || null })}
              className="border-none outline-none text-sm text-gray-700 bg-transparent"
            />
          </div>

          {/* Status (Column) */}
          <div className="flex items-center py-2 border-b border-gray-50">
            <span className="w-28 text-sm text-gray-500 flex-shrink-0">Status</span>
            <select
              defaultValue={task.columnId ?? ''}
              onChange={e => onUpdate(task.id, { columnId: e.target.value })}
              className="border-none outline-none text-sm text-gray-700 bg-transparent"
            >
              {columns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Priority */}
          <div className="flex items-center py-2 border-b border-gray-50">
            <span className="w-28 text-sm text-gray-500 flex-shrink-0">Priority</span>
            <select
              defaultValue={task.priority ?? 'Medium'}
              onChange={e => onUpdate(task.id, { priority: e.target.value })}
              className={`border-none outline-none text-sm bg-transparent font-medium ${PRIORITY_COLORS[task.priority] ?? 'text-gray-700'}`}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="px-6 py-4 border-t border-gray-100">
          <p className="text-sm font-semibold text-gray-700 mb-2">Description</p>
          <AutoResizeTextarea
            className="w-full text-sm text-gray-700 outline-none resize-none min-h-[80px] placeholder-gray-300 bg-transparent"
            value={description}
            onChange={e => setDescription(e.target.value)}
            onBlur={handleDescriptionBlur}
            placeholder="What is this task about?"
            minRows={3}
          />
        </div>

        {/* Subtasks */}
        <div className="px-6 py-4 border-t border-gray-100">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            Subtasks {subtasks.length > 0 && <span className="text-gray-400 font-normal">({completedCount}/{subtasks.length})</span>}
          </p>

          <div className="flex flex-col gap-1">
            {subtasks.map(st => (
              <div key={st.id} className="flex items-center gap-2 group">
                <input
                  type="checkbox"
                  checked={st.completed}
                  onChange={() => toggleSubtask(st.id, st.completed)}
                  className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
                />
                <span className={`flex-1 text-sm ${st.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                  {st.title}
                </span>
                <button
                  onClick={() => deleteSubtask(st.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 text-xs transition-all"
                  aria-label="Delete subtask"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {showSubtaskInput ? (
            <div className="flex items-center gap-2 mt-2">
              <input
                autoFocus
                type="text"
                value={subtaskInput}
                onChange={e => setSubtaskInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleAddSubtask()
                  if (e.key === 'Escape') { setShowSubtaskInput(false); setSubtaskInput('') }
                }}
                placeholder="Subtask title"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <button
                onClick={handleAddSubtask}
                className="text-sm text-indigo-600 font-medium hover:text-indigo-800"
              >
                Add
              </button>
              <button
                onClick={() => { setShowSubtaskInput(false); setSubtaskInput('') }}
                className="text-sm text-gray-400 hover:text-gray-600"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSubtaskInput(true)}
              className="mt-2 text-sm text-gray-400 hover:text-indigo-600 flex items-center gap-1 transition-colors"
            >
              <span className="text-base leading-none">+</span>
              <span>Add subtask</span>
            </button>
          )}
        </div>

        {/* Attachments */}
        <div className="px-6 py-4 border-t border-gray-100">
          <p className="text-sm font-semibold text-gray-700 mb-3">Attachments</p>
          <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer hover:text-indigo-500 transition-colors border border-dashed border-gray-200 rounded-lg px-4 py-3 hover:border-indigo-300">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Click to upload an image
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={() => alert('Image upload coming soon')}
            />
          </label>
        </div>

        {/* Comments */}
        <div className="px-6 py-4 border-t border-gray-100">
          {/* Tabs */}
          <div className="flex gap-4 mb-4 border-b border-gray-100">
            {['comments', 'activity'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm pb-2 font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab === 'comments' ? 'Comments' : 'All activity'}
              </button>
            ))}
          </div>

          {/* Comment list */}
          <div className="flex flex-col gap-4 mb-4">
            {comments.length === 0 && (
              <p className="text-sm text-gray-300 italic">No comments yet.</p>
            )}
            {comments.map(c => (
              <div key={c.id} className="flex gap-3">
                {/* Avatar */}
                <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {c.authorEmail?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-gray-700">{c.authorEmail}</span>
                    <span className="text-xs text-gray-400">
                      {c.createdAt?.toDate?.().toLocaleString() ?? ''}
                    </span>
                    {user && c.authorId === user.uid && (
                      <button
                        onClick={() => deleteComment(c.id, c.authorId)}
                        className="text-xs text-gray-300 hover:text-red-400 ml-auto transition-colors"
                        aria-label="Delete comment"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Comment input */}
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.email?.[0]?.toUpperCase() ?? '?'}
            </div>
            <textarea
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={handleCommentKeyDown}
              placeholder="Add a comment… (Enter to submit)"
              className="flex-1 text-sm text-gray-700 outline-none resize-none border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-300 min-h-[60px] placeholder-gray-300"
            />
          </div>
        </div>

        {/* Delete task */}
        <div className="px-6 py-4 border-t border-gray-100">
          <button
            onClick={() => {
              if (window.confirm('Delete this task?')) onDelete(task.id)
            }}
            className="text-sm text-red-400 hover:text-red-600 transition-colors"
          >
            Delete task
          </button>
        </div>
      </div>
    </>
  )
}

export default function TaskDetailPanel({
  task,
  columnId,
  columns,
  boardId,
  onSave,
  onUpdate,
  onDelete,
  onClose,
}) {
  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="absolute top-0 right-0 h-full w-[620px] bg-white shadow-2xl flex flex-col">
        {task ? (
          <TaskDetail
            task={task}
            columns={columns}
            boardId={boardId}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onClose={onClose}
          />
        ) : (
          <NewTaskForm
            columnId={columnId}
            columns={columns}
            onSave={onSave}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  )
}
