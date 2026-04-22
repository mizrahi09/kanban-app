import { DndContext, useDroppable } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import TaskCard from '../tasks/TaskCard'

function SortableTaskCard({ task, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
    >
      <TaskCard task={task} onEdit={() => onEdit(task)} onDelete={() => onDelete(task.id)} />
    </div>
  )
}

function DroppableTaskList({ columnId, children }) {
  const { setNodeRef } = useDroppable({ id: columnId })
  return (
    <div ref={setNodeRef} className="flex flex-col gap-1.5 min-h-[3rem]">
      {children}
    </div>
  )
}

export default function Column({ column, tasks, onAddTask, onEditTask, onDeleteTask, onReorderTasks, onMoveTask }) {
  const taskIds = tasks.map(t => t.id)

  function handleDragEnd({ active, over }) {
    if (!over) return
    const activeId = active.id
    const overId = over.id
    const overIsTask = tasks.some(t => t.id === overId)
    const overIsColumn = overId === column.id

    if (overIsTask) {
      const activeIndex = tasks.findIndex(t => t.id === activeId)
      if (activeIndex !== -1) {
        const overIndex = tasks.findIndex(t => t.id === overId)
        if (activeIndex !== overIndex) onReorderTasks(arrayMove(tasks, activeIndex, overIndex), column.id)
      } else {
        onMoveTask(activeId, overId)
      }
    } else if (overIsColumn) {
      if (tasks.findIndex(t => t.id === activeId) === -1) onMoveTask(activeId, column.id)
    }
  }

  return (
    <div className="flex flex-col w-64 shrink-0">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className="text-sm font-semibold text-gray-700">{column.name}</span>
        <span className="text-xs text-gray-400 font-medium">{tasks.length}</span>
      </div>

      {/* Divider line under header */}
      <div className="h-0.5 bg-gray-200 rounded mb-3" />

      <DndContext onDragEnd={handleDragEnd}>
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <DroppableTaskList columnId={column.id}>
            {tasks.map(task => (
              <SortableTaskCard
                key={task.id}
                task={task}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))}
          </DroppableTaskList>
        </SortableContext>
      </DndContext>

      {/* Add task */}
      <button
        className="mt-2 w-full text-left text-sm text-gray-400 hover:text-gray-600 py-1.5 px-1 flex items-center gap-2 rounded hover:bg-gray-50 transition-colors"
        onClick={() => onAddTask(column.id)}
      >
        <span className="text-base leading-none">+</span>
        <span>Add task</span>
      </button>
    </div>
  )
}
