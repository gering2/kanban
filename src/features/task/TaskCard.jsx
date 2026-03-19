import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DragDots } from '../../components/ui/DragDots'
import { formatShortDate } from '../../lib/dates'

export function TaskCard({ task, isOverlay = false }) {
  const priority = task.priority ?? 'medium'
  const taskLabels = Array.isArray(task.labels) ? task.labels : []
  const priorityLabel = {
    low: 'Low',
    medium: 'Med',
    high: 'High',
  }
  const priorityColor = {
    low: '#2e8d44',
    medium: '#b08500',
    high: '#c43c32',
  }

  // Always parse dueDate as local midnight for consistent logic
  let isOverdue = false
  let dueDateObj = null
  if (task.dueDate) {
    const dateStr = task.dueDate.length === 10 ? task.dueDate + 'T00:00:00' : task.dueDate
    dueDateObj = new Date(dateStr)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    isOverdue = dueDateObj < today
  }

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <article
      ref={setNodeRef}
      style={style}
      data-task-id={task.id}
      className={`task-card ${isDragging && !isOverlay ? 'opacity-40' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="card-title">{task.title}</h3>
        </div>
        {!isOverlay ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => task.onEdit?.(task.id)}
              className="icon-button"
              aria-label={`Edit ${task.title}`}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 20h4l10-10-4-4L4 16v4Z" />
                <path d="m13 7 4 4" />
              </svg>
            </button>
            <button
              type="button"
              className="icon-button"
              aria-label={`Delete ${task.title}`}
              onClick={() => task.onDelete?.(task.id)}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
              </svg>
            </button>
            <button
              ref={setActivatorNodeRef}
              type="button"
              className="drag-handle"
              aria-label={`Drag ${task.title}`}
              {...attributes}
              {...listeners}
            >
              <DragDots />
            </button>
          </div>
        ) : null}
      </div>
      {task.description ? (
        <p className="card-copy">{task.description}</p>
      ) : null}
      {taskLabels.length > 0 ? (
        <div className="label-row mt-3">
          {taskLabels.map((label) => (
            <span key={label} className="task-label-chip">
              {label}
            </span>
          ))}
        </div>
      ) : null}
      <div className="mt-3 flex items-center justify-between gap-3">
        <span
          className={`priority-pill priority-pill-${priority}`}
          style={{ color: priorityColor[priority] ?? priorityColor.medium }}
        >
          <span className="priority-dot" aria-hidden="true" />
          {priorityLabel[priority] ?? 'Medium'}
        </span>
        <span
          className="card-meta"
          style={isOverdue ? { color: priorityColor.high } : undefined}
        >
          {task.dueDate ? `Due ${dueDateObj ? formatShortDate(dueDateObj) : formatShortDate(task.dueDate)}` : 'No due date'}
        </span>
      </div>
    </article>
  )
}
