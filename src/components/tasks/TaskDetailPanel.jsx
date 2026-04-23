import { useState, useRef, useEffect } from 'react'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '../../firebase'
import { useAuth } from '../../context/AuthContext'
import { useComments } from '../../hooks/useComments'
import { useSubtasks } from '../../hooks/useSubtasks'

const PRIORITY_BADGE = {
  High:   'bg-red-100 text-red-700',
  Medium: 'bg-orange-100 text-orange-700',
  Low:    'bg-yellow-100 text-yellow-700',
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

function FieldRow({ label, children }) {
  return (
    <div className="flex items-center py-2.5 border-b border-gray-50">
      <span className="w-28 text-sm text-gray-500 flex-shrink-0">{label}</span>
      <div className="flex-1">{children}</div>
    </div>
  )
}

function AssigneePlaceholder() {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-400">
      <div className="w-6 h-6 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
        <svg className="w-3 h-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      No assignee
    </div>
  )
}

// ──────────────────────────────────────────────
// NEW TASK FORM
// ──────────────────────────────────────────────
function NewTaskForm({ columnId, columns, onSave, onClose }) {
  const [title, setTitle]           = useState('')
  const [description, setDescription] = useState('')
  const [selectedColumn, setSelectedColumn] = useState(columnId ?? columns[0]?.id ?? '')
  const [priority, setPriority]     = useState('Medium')
  const [dueDate, setDueDate]       = useState('')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)

  const handleCreate = async () => {
    if (!title.trim()) return
    setError(null)
    setLoading(true)
    try {
      await onSave({
        title: title.trim(),
        description,
        columnId: selectedColumn,
        priority,
        dueDate: dueDate || null,
      })
    } catch {
      setError('Failed to create task. Please try again.')
      setLoading(false)
    }
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 flex-shrink-0">
        <span className="text-sm font-semibold text-gray-700">New Task</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">→</button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Title */}
        <div className="px-6 pt-5 pb-2">
          <input
            autoFocus
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            placeholder="Task title"
            className="w-full text-2xl font-bold text-gray-900 outline-none placeholder-gray-300 border-none"
          />
        </div>

        {/* Fields */}
        <div className="px-6 pb-2">
          <FieldRow label="Assignee"><AssigneePlaceholder /></FieldRow>

          <FieldRow label="Due date">
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="border-none outline-none text-sm text-gray-700 bg-transparent"
            />
          </FieldRow>

          <FieldRow label="Status">
            <select
              value={selectedColumn}
              onChange={e => setSelectedColumn(e.target.value)}
              className="border-none outline-none text-sm text-gray-700 bg-transparent"
            >
              {columns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </FieldRow>

          <FieldRow label="Priority">
            <select
              value={priority}
              onChange={e => setPriority(e.target.value)}
              className={`border-none outline-none text-sm bg-transparent font-medium ${PRIORITY_BADGE[priority] ?? 'text-gray-700'}`}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </FieldRow>
        </div>

        {/* Description */}
        <div className="px-6 py-4 border-t border-gray-100">
          <p className="text-sm font-semibold text-gray-700 mb-2">Description</p>
          <AutoResizeTextarea
            className="w-full text-sm text-gray-700 outline-none resize-none placeholder-gray-300 bg-transparent"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="What is this task about?"
            minRows={3}
          />
        </div>

        {error && <p className="px-6 text-red-500 text-xs">{error}</p>}

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-gray-600">
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

// ──────────────────────────────────────────────
// ATTACHMENT UPLOAD
// ──────────────────────────────────────────────
function AttachmentSection({ task, onUpdate }) {
  const [uploading, setUploading] = useState(false)
  const attachments = task.attachments ?? []

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const storageRef = ref(storage, `tasks/${task.id}/${Date.now()}_${file.name}`)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      await onUpdate(task.id, {
        attachments: [...attachments, { url, name: file.name, type: file.type }],
      })
    } catch (err) {
      console.error('Upload error:', err)
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleRemove = (url) => {
    onUpdate(task.id, { attachments: attachments.filter(a => a.url !== url) })
  }

  return (
    <div className="px-6 py-4 border-t border-gray-100">
      <p className="text-sm font-semibold text-gray-700 mb-3">Attachments</p>

      {/* Existing attachments */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {attachments.map(a => (
            <div key={a.url} className="group relative">
              {a.type?.startsWith('image/') ? (
                <a href={a.url} target="_blank" rel="noreferrer">
                  <img src={a.url} alt={a.name} className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                </a>
              ) : (
                <a href={a.url} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 text-xs text-indigo-600 underline border border-gray-200 rounded-lg px-2 py-1">
                  📄 {a.name}
                </a>
              )}
              <button
                onClick={() => handleRemove(a.url)}
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      <label className={`flex items-center gap-2 text-sm cursor-pointer border border-dashed rounded-lg px-4 py-3 transition-colors ${
        uploading ? 'text-gray-300 border-gray-100' : 'text-gray-400 hover:text-indigo-500 border-gray-200 hover:border-indigo-300'
      }`}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {uploading ? 'Uploading…' : 'Upload image or file'}
        <input type="file" accept="image/*,.pdf,.doc,.docx" className="hidden" onChange={handleFile} disabled={uploading} />
      </label>
    </div>
  )
}

// ──────────────────────────────────────────────
// EXISTING TASK DETAIL
// ──────────────────────────────────────────────
function TaskDetail({ task, columns, boardId, onUpdate, onDelete, onClose }) {
  const { user } = useAuth()
  const { comments, addComment, deleteComment } = useComments(boardId, task.id)
  const { subtasks, addSubtask, toggleSubtask, deleteSubtask } = useSubtasks(boardId, task.id)

  const [title, setTitle]           = useState(task.title ?? '')
  const [description, setDescription] = useState(task.description ?? '')
  const [commentText, setCommentText] = useState('')
  const [subtaskInput, setSubtaskInput] = useState('')
  const [showSubtaskInput, setShowSubtaskInput] = useState(false)
  const [activeTab, setActiveTab]   = useState('comments')

  useEffect(() => {
    setTitle(task.title ?? '')
    setDescription(task.description ?? '')
  }, [task.id])

  const save = (field, value) => onUpdate(task.id, { [field]: value })

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return
    await addComment(commentText.trim())
    setCommentText('')
  }

  const completedCount = subtasks.filter(s => s.completed).length

  return (
    <>
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 flex-shrink-0">
        <button
          onClick={() => save('completed', !task.completed)}
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm border transition-colors ${
            task.completed
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          {task.completed ? (
            <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg> Completed</>
          ) : (
            <><svg className="w-4 h-4" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={1.5}><circle cx="10" cy="10" r="8" /></svg> Mark complete</>
          )}
        </button>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">→</button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">

        {/* Title */}
        <div className="px-6 pt-5 pb-2">
          <AutoResizeTextarea
            className="text-2xl font-bold text-gray-900 w-full resize-none outline-none bg-transparent"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={() => title.trim() !== task.title && save('title', title.trim() || task.title)}
            placeholder="Task title"
          />
        </div>

        {/* Fields */}
        <div className="px-6 pb-2">
          <FieldRow label="Assignee"><AssigneePlaceholder /></FieldRow>

          <FieldRow label="Due date">
            <input
              type="date"
              defaultValue={task.dueDate ?? ''}
              onChange={e => save('dueDate', e.target.value || null)}
              className="border-none outline-none text-sm text-gray-700 bg-transparent"
            />
          </FieldRow>

          <FieldRow label="Status">
            <select
              defaultValue={task.columnId ?? ''}
              onChange={e => save('columnId', e.target.value)}
              className="border-none outline-none text-sm text-gray-700 bg-transparent"
            >
              {columns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </FieldRow>

          <FieldRow label="Priority">
            <select
              defaultValue={task.priority ?? 'Medium'}
              onChange={e => save('priority', e.target.value)}
              className={`border-none outline-none text-sm bg-transparent font-medium ${PRIORITY_BADGE[task.priority] ?? 'text-gray-700'}`}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </FieldRow>
        </div>

        {/* Description */}
        <div className="px-6 py-4 border-t border-gray-100">
          <p className="text-sm font-semibold text-gray-700 mb-2">Description</p>
          <AutoResizeTextarea
            className="w-full text-sm text-gray-700 outline-none resize-none placeholder-gray-300 bg-transparent"
            value={description}
            onChange={e => setDescription(e.target.value)}
            onBlur={() => description !== (task.description ?? '') && save('description', description)}
            placeholder="What is this task about?"
            minRows={3}
          />
        </div>

        {/* Attachments */}
        <AttachmentSection task={task} onUpdate={onUpdate} />

        {/* Subtasks */}
        <div className="px-6 py-4 border-t border-gray-100">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            Subtasks{subtasks.length > 0 && <span className="text-gray-400 font-normal ml-1">({completedCount}/{subtasks.length})</span>}
          </p>
          <div className="flex flex-col gap-1.5">
            {subtasks.map(st => (
              <div key={st.id} className="flex items-center gap-2 group">
                <input
                  type="checkbox"
                  checked={st.completed}
                  onChange={() => toggleSubtask(st.id, st.completed)}
                  className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
                />
                <span className={`flex-1 text-sm ${st.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>{st.title}</span>
                <button onClick={() => deleteSubtask(st.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 text-xs transition-all">✕</button>
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
                onKeyDown={async e => {
                  if (e.key === 'Enter') { await addSubtask(subtaskInput); setSubtaskInput(''); setShowSubtaskInput(false) }
                  if (e.key === 'Escape') { setShowSubtaskInput(false); setSubtaskInput('') }
                }}
                placeholder="Subtask title"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <button onClick={async () => { await addSubtask(subtaskInput); setSubtaskInput(''); setShowSubtaskInput(false) }} className="text-sm text-indigo-600 font-medium">Add</button>
              <button onClick={() => { setShowSubtaskInput(false); setSubtaskInput('') }} className="text-sm text-gray-400">Cancel</button>
            </div>
          ) : (
            <button onClick={() => setShowSubtaskInput(true)} className="mt-2 text-sm text-gray-400 hover:text-indigo-600 flex items-center gap-1">
              <span>+</span><span>Add subtask</span>
            </button>
          )}
        </div>

        {/* Comments */}
        <div className="px-6 py-4 border-t border-gray-100">
          <div className="flex gap-4 mb-4 border-b border-gray-100">
            {['comments', 'activity'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`text-sm pb-2 font-medium capitalize transition-colors ${
                  activeTab === tab ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'
                }`}>
                {tab === 'comments' ? 'Comments' : 'All activity'}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4 mb-4">
            {comments.length === 0 && <p className="text-sm text-gray-300 italic">No comments yet.</p>}
            {comments.map(c => (
              <div key={c.id} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {c.authorEmail?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-gray-700">{c.authorEmail}</span>
                    <span className="text-xs text-gray-400">{c.createdAt?.toDate?.().toLocaleString() ?? ''}</span>
                    {user?.uid === c.authorId && (
                      <button onClick={() => deleteComment(c.id, c.authorId)} className="text-xs text-gray-300 hover:text-red-400 ml-auto">✕</button>
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
            <div className="flex-1 relative">
              <AutoResizeTextarea
                className="w-full text-sm text-gray-700 outline-none resize-none border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-300 placeholder-gray-300"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Add a comment…"
                minRows={2}
              />
              {commentText.trim() && (
                <button
                  onClick={handleCommentSubmit}
                  className="mt-1.5 text-xs bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 float-right"
                >
                  Send
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Delete */}
        <div className="px-6 py-4 border-t border-gray-100">
          <button
            onClick={() => { if (window.confirm('Delete this task?')) onDelete(task.id) }}
            className="text-sm text-red-400 hover:text-red-600 transition-colors"
          >
            Delete task
          </button>
        </div>
      </div>
    </>
  )
}

// ──────────────────────────────────────────────
// MAIN EXPORT
// ──────────────────────────────────────────────
export default function TaskDetailPanel({ task, columnId, columns, boardId, onSave, onUpdate, onDelete, onClose }) {
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute top-0 right-0 h-full w-[620px] bg-white shadow-2xl flex flex-col">
        {task
          ? <TaskDetail task={task} columns={columns} boardId={boardId} onUpdate={onUpdate} onDelete={onDelete} onClose={onClose} />
          : <NewTaskForm columnId={columnId} columns={columns} onSave={onSave} onClose={onClose} />
        }
      </div>
    </div>
  )
}
