import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import TaskCard from '../components/tasks/TaskCard'

const baseTask = {
  id: 'task-1',
  title: 'Write newsletter intro',
  description: 'A short intro paragraph',
  contentType: 'Deep Dive',
  priority: 'High',
  dueDate: null,
  columnId: 'col-1',
  order: 0,
}

describe('TaskCard', () => {
  it('renders the task title', () => {
    render(<TaskCard task={baseTask} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Write newsletter intro')).toBeInTheDocument()
  })

  it('renders the priority badge with correct text', () => {
    render(<TaskCard task={baseTask} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('High')).toBeInTheDocument()
  })

  it('clicking the card body calls onEdit', () => {
    const onEdit = vi.fn()
    render(<TaskCard task={baseTask} onEdit={onEdit} onDelete={vi.fn()} />)
    fireEvent.click(screen.getByText('Write newsletter intro'))
    expect(onEdit).toHaveBeenCalledTimes(1)
  })

  it('clicking the delete button calls onDelete and does NOT call onEdit', () => {
    const onEdit = vi.fn()
    const onDelete = vi.fn()
    render(<TaskCard task={baseTask} onEdit={onEdit} onDelete={onDelete} />)
    fireEvent.click(screen.getByRole('button', { name: /delete task/i }))
    expect(onDelete).toHaveBeenCalledTimes(1)
    expect(onEdit).not.toHaveBeenCalled()
  })
})
