import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import TaskCard from '../tasks/TaskCard'

function SortableTaskCard({ task, boardId, onEdit, onDelete, onDuplicate }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      {...attributes}
    >
      <TaskCard
        task={task}
        boardId={boardId}
        onEdit={() => onEdit(task)}
        onDelete={() => onDelete(task.id)}
        onDuplicate={() => onDuplicate(task)}
        dragListeners={listeners}
      />
    </div>
  )
}

function DroppableColumn({ columnId, children }) {
  const { setNodeRef, isOver } = useDroppable({ id: columnId })
  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col gap-2 min-h-[4rem] rounded-xl transition-colors ${isOver ? 'bg-indigo-50/70' : ''}`}
    >
      {children}
    </div>
  )
}

export default function Column({ column, tasks, boardId, onAddTask, onEditTask, onDeleteTask, onDuplicateTask }) {
  const taskIds = tasks.map(t => t.id)

  return (
    <div className="flex flex-col w-72 shrink-0 bg-gray-100/80 rounded-2xl p-3">
      {/* Header */}
      <div className="flex items-center gap-2 px-1 mb-3">
        <span className="text-sm font-semibold text-gray-700">{column.name}</span>
        <span className="text-xs text-gray-400 font-medium">{tasks.length}</span>
      </div>

      {/* Tasks — SortableContext only; DndContext lives in BoardPage */}
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <DroppableColumn columnId={column.id}>
          {tasks.map(task => (
            <SortableTaskCard
              key={task.id}
              task={task}
              boardId={boardId}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onDuplicate={onDuplicateTask}
            />
          ))}
        </DroppableColumn>
      </SortableContext>

      {/* Add task */}
      <button
        className="mt-2 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 px-2 py-1.5 rounded-lg hover:bg-gray-200 transition-colors w-full"
        onClick={() => onAddTask(column.id)}
      >
        <span className="text-base leading-none">+</span>
        <span>Add task</span>
      </button>
    </div>
  )
}
