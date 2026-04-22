import { DndContext, useDroppable } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import TaskCard from '../tasks/TaskCard'

function SortableTaskCard({ task, onEdit, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard
        task={task}
        onEdit={() => onEdit(task)}
        onDelete={() => onDelete(task.id)}
      />
    </div>
  )
}

function DroppableTaskList({ columnId, children }) {
  const { setNodeRef } = useDroppable({ id: columnId })

  return (
    <div ref={setNodeRef} className="flex flex-col gap-2 min-h-[4rem]">
      {children}
    </div>
  )
}

export default function Column({
  column,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onReorderTasks,
  onMoveTask,
}) {
  const taskIds = tasks.map(t => t.id)

  function handleDragEnd(event) {
    const { active, over } = event

    if (!over) return

    const activeId = active.id
    const overId = over.id

    // Determine if the drop target is within this column
    const overIsTask = tasks.some(t => t.id === overId)
    const overIsColumn = overId === column.id

    if (overIsTask) {
      // Dropped onto a task — could be same column or different column
      const activeIndex = tasks.findIndex(t => t.id === activeId)

      if (activeIndex !== -1) {
        // Active task is in this column — reorder within column
        const overIndex = tasks.findIndex(t => t.id === overId)
        if (activeIndex !== overIndex) {
          const reordered = arrayMove(tasks, activeIndex, overIndex)
          onReorderTasks(reordered, column.id)
        }
      } else {
        // Active task is from another column — move it here
        onMoveTask(activeId, overId)
      }
    } else if (overIsColumn) {
      // Dropped onto the column area (empty column or background)
      const activeIndex = tasks.findIndex(t => t.id === activeId)

      if (activeIndex !== -1) {
        // Task already in this column, no-op (dropped in place)
        return
      } else {
        // Task from another column dropped here
        onMoveTask(activeId, column.id)
      }
    }
  }

  return (
    <div className="flex flex-col w-72 shrink-0">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-slate-700">{column.name}</span>
        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      {/* Drag and drop context */}
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

      {/* Add task button */}
      <button
        className="mt-2 w-full text-left text-xs text-slate-400 hover:text-indigo-500 py-1 px-2 rounded-lg hover:bg-indigo-50 transition-colors"
        onClick={() => onAddTask(column.id)}
      >
        + Add task
      </button>
    </div>
  )
}
