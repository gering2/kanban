import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DragDots } from '../../components/ui/DragDots'
import { formatShortDate } from '../../lib/dates'

export function TaskCard({ task, isOverlay = false }) {
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
        <h3 className="card-title">{task.title}</h3>
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
      <div className="mt-3">
        <span className="card-meta">
          {task.dueDate ? `Due ${formatShortDate(task.dueDate)}` : 'No due date'}
        </span>
      </div>
    </article>
  )
}
