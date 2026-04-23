import { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useBoards } from '../../hooks/useBoards'
import { useColumns } from '../../hooks/useColumns'
import { useTasks } from '../../hooks/useTasks'
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'
import { sortTasks } from '../../utils/sortAndGroup'
import Column from '../columns/Column'
import TaskDetailPanel from '../tasks/TaskDetailPanel'
import BoardSettings from './BoardSettings'

export default function BoardPage() {
  const { boardId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const { boards, updateBoard } = useBoards()
  const { columns, createColumn, updateColumn, deleteColumn, reorderColumns } = useColumns(boardId)
  const { tasks, createTask, updateTask, deleteTask, moveTask, reorderTasks } = useTasks(boardId)
  const autoOpenedRef = useRef(false)

  // Require 5px movement before activating drag so clicks still fire
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const [sortBy, setSortBy] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  // Auto-open task panel from ?task= URL param (e.g. "Open in new tab")
  useEffect(() => {
    if (autoOpenedRef.current || tasks.length === 0) return
    const taskId = searchParams.get('task')
    if (!taskId) return
    const found = tasks.find(t => t.id === taskId)
    if (found) {
      autoOpenedRef.current = true
      setEditingTask(found)
      setTaskModalOpen(true)
      setSearchParams({}, { replace: true })
    }
  }, [tasks])

  const board = boards.find(b => b.id === boardId)
  // Always use live Firestore data for the panel when available
  const liveEditingTask = editingTask ? (tasks.find(t => t.id === editingTask.id) ?? editingTask) : null

  useKeyboardShortcuts({
    n: () => { if (columns.length > 0) { setEditingTask(null); setNewTaskColumnId(columns[0].id); setTaskModalOpen(true) } },
    s: () => setSettingsOpen(true),
    Escape: () => { setTaskModalOpen(false); setSettingsOpen(false) },
  })

  if (!board) {
    return <div className="flex-1 flex items-center justify-center text-gray-400">Loading board…</div>
  }

  const handleDuplicateTask = async (task) => {
    await createTask(task.columnId, {
      title: `${task.title || 'Untitled task'} (copy)`,
      priority: task.priority ?? 'Medium',
      description: task.description ?? '',
      attachments: task.attachments ?? [],
      completed: false,
      dueDate: task.dueDate ?? null,
    })
  }

  const handleDeleteTask = async (taskId) => {
    await deleteTask(taskId)
    setTaskModalOpen(false)
    setEditingTask(null)
  }

  const openNewTask = async (columnId) => {
    const colId = columnId ?? columns[0]?.id
    if (!colId) return
    const docRef = await createTask(colId, {
      title: '', priority: 'Medium', description: '', attachments: [], completed: false,
    })
    setEditingTask({ id: docRef.id, title: '', priority: 'Medium', columnId: colId, description: '', attachments: [], completed: false })
    setTaskModalOpen(true)
  }

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return
    const activeTask = tasks.find(t => t.id === active.id)
    if (!activeTask) return

    const overTask = tasks.find(t => t.id === over.id)
    if (overTask) {
      if (activeTask.columnId === overTask.columnId) {
        // Same column — reorder
        const colTasks = tasks.filter(t => t.columnId === activeTask.columnId)
        const oldIdx = colTasks.findIndex(t => t.id === active.id)
        const newIdx = colTasks.findIndex(t => t.id === over.id)
        if (oldIdx !== newIdx) reorderTasks(arrayMove(colTasks, oldIdx, newIdx), activeTask.columnId)
      } else {
        // Different column — move and update status
        moveTask(active.id, overTask.columnId, tasks.filter(t => t.columnId === overTask.columnId).length)
      }
      return
    }

    // Dropped on an empty column droppable
    const overColumn = columns.find(c => c.id === over.id)
    if (overColumn && activeTask.columnId !== overColumn.id) {
      moveTask(active.id, overColumn.id, tasks.filter(t => t.columnId === overColumn.id).length)
    }
  }

  let filtered = tasks
  if (filterPriority) filtered = filtered.filter(t => t.priority === filterPriority)
  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    filtered = filtered.filter(t =>
      (t.title || '').toLowerCase().includes(q) ||
      (t.description || '').toLowerCase().includes(q)
    )
  }
  const sorted = sortTasks(filtered, sortBy)

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Board header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-800">{board.name}</h1>
        <div className="flex items-center gap-2">
          {/* Search */}
          <input
            type="text"
            placeholder="Search tasks…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 w-44"
          />
          {/* Filter priority */}
          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none text-gray-600"
          >
            <option value="">All priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none text-gray-600"
          >
            <option value="">Sort</option>
            <option value="priority">Priority</option>
            <option value="dueDate">Due Date</option>
            <option value="title">Title</option>
          </select>
          {/* Settings */}
          <button
            onClick={() => setSettingsOpen(true)}
            className="text-sm text-gray-500 hover:text-indigo-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:border-indigo-300 transition-colors flex items-center gap-1"
          >
            ⚙ Settings
          </button>
        </div>
      </div>

      {/* "+ Add task" bar */}
      <div className="px-6 py-2 border-b border-gray-100">
        <button
          onClick={() => openNewTask(columns[0]?.id)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:border-indigo-300 transition-colors"
        >
          <span className="text-base leading-none">+</span>
          <span>Add task</span>
        </button>
      </div>

      {/* Columns */}
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto px-6 py-5 flex-1 items-start">
          {columns.map(col => (
            <Column
              key={col.id}
              column={col}
              tasks={sorted.filter(t => t.columnId === col.id)}
              boardId={boardId}
              onAddTask={openNewTask}
              onEditTask={(task) => { setEditingTask(task); setTaskModalOpen(true) }}
              onDeleteTask={deleteTask}
              onDuplicateTask={handleDuplicateTask}
            />
          ))}

          {/* Add section button */}
          <button
            onClick={() => {
              const name = prompt('Column name:')
              if (name?.trim()) createColumn(name.trim())
            }}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 px-4 py-2 rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors shrink-0 mt-0.5"
          >
            <span>+</span>
            <span>Add section</span>
          </button>
        </div>
      </DndContext>

      {taskModalOpen && liveEditingTask && (
        <TaskDetailPanel
          task={liveEditingTask}
          columns={columns}
          boardId={boardId}
          onUpdate={updateTask}
          onDelete={handleDeleteTask}
          onClose={() => { setTaskModalOpen(false); setEditingTask(null) }}
        />
      )}

      {settingsOpen && (
        <BoardSettings
          board={board}
          columns={columns}
          onClose={() => setSettingsOpen(false)}
          onUpdateBoard={(updates) => updateBoard(board.id, updates)}
          onCreateColumn={createColumn}
          onUpdateColumn={updateColumn}
          onDeleteColumn={deleteColumn}
          onReorderColumns={reorderColumns}
        />
      )}
    </div>
  )
}
