import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useBoards } from '../../hooks/useBoards'
import { useColumns } from '../../hooks/useColumns'
import { useTasks } from '../../hooks/useTasks'
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'
import { sortTasks, groupTasks } from '../../utils/sortAndGroup'
import Column from '../columns/Column'
import TaskCard from '../tasks/TaskCard'
import TaskModal from '../tasks/TaskModal'
import BoardToolbar from '../toolbar/BoardToolbar'
import BoardSettings from './BoardSettings'

export default function BoardPage() {
  const { boardId } = useParams()
  const { boards, updateBoard } = useBoards()
  const { columns, createColumn, updateColumn, deleteColumn, reorderColumns } = useColumns(boardId)
  const { tasks, createTask, updateTask, deleteTask, moveTask, reorderTasks } = useTasks(boardId)

  // Toolbar state
  const [groupBy, setGroupBy] = useState('')
  const [sortBy, setSortBy] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [filterContentType, setFilterContentType] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Task modal state
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [newTaskColumnId, setNewTaskColumnId] = useState(null)

  const board = boards.find(b => b.id === boardId)

  useKeyboardShortcuts({
    n: () => { if (columns.length > 0) { setEditingTask(null); setNewTaskColumnId(columns[0].id); setTaskModalOpen(true) } },
    s: () => setSettingsOpen(true),
    Escape: () => { setTaskModalOpen(false); setSettingsOpen(false) },
  })

  if (!board) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400">
        Loading board…
      </div>
    )
  }

  // Task modal save handler
  const handleSaveTask = async (taskData) => {
    if (editingTask) {
      await updateTask(editingTask.id, taskData)
    } else {
      const columnId = taskData.columnId || newTaskColumnId
      await createTask(columnId, taskData)
    }
    setTaskModalOpen(false)
  }

  // Filter tasks
  let filteredTasks = tasks

  if (filterPriority) {
    filteredTasks = filteredTasks.filter(t => t.priority === filterPriority)
  }

  if (filterContentType) {
    filteredTasks = filteredTasks.filter(t => t.contentType === filterContentType)
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    filteredTasks = filteredTasks.filter(
      t =>
        (t.title || '').toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q)
    )
  }

  // Sort tasks
  const sortedFilteredTasks = sortTasks(filteredTasks, sortBy)

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <BoardToolbar
        groupBy={groupBy}
        sortBy={sortBy}
        filterPriority={filterPriority}
        filterContentType={filterContentType}
        searchQuery={searchQuery}
        onGroupByChange={setGroupBy}
        onSortByChange={setSortBy}
        onFilterPriorityChange={setFilterPriority}
        onFilterContentTypeChange={setFilterContentType}
        onSearchQueryChange={setSearchQuery}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {groupBy ? (
        // Grouped layout
        <div className="overflow-y-auto px-4 pb-4 flex-1">
          {groupTasks(sortedFilteredTasks, columns, groupBy).map(group => (
            <div key={group.key} className="mb-6">
              <h3 className="text-sm font-semibold text-slate-500 mb-3">{group.label}</h3>
              <div className="flex flex-col gap-2">
                {group.tasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={() => { setEditingTask(task); setTaskModalOpen(true) }}
                    onDelete={() => deleteTask(task.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Normal column layout
        <div className="flex gap-4 overflow-x-auto px-4 pb-4 flex-1 items-start">
          {columns.map(col => (
            <Column
              key={col.id}
              column={col}
              tasks={sortedFilteredTasks.filter(t => t.columnId === col.id)}
              onAddTask={(columnId) => {
                setEditingTask(null)
                setNewTaskColumnId(columnId)
                setTaskModalOpen(true)
              }}
              onEditTask={(task) => {
                setEditingTask(task)
                setTaskModalOpen(true)
              }}
              onDeleteTask={deleteTask}
              onReorderTasks={reorderTasks}
              onMoveTask={moveTask}
            />
          ))}
        </div>
      )}

      {taskModalOpen && (
        <TaskModal
          task={editingTask}
          columnId={newTaskColumnId}
          columns={columns}
          onSave={handleSaveTask}
          onClose={() => setTaskModalOpen(false)}
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
