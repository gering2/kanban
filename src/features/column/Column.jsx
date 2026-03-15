import { Fragment, useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DragDots } from '../../components/ui/DragDots'
import { ColumnHeader } from './ColumnHeader'
import { TaskForm } from '../task/TaskForm'
import { TaskCard } from '../task/TaskCard'

export function Column({
  column,
  tasks,
  isTaskTargeted = false,
  insertionIndex = null,
  onAddTask,
  onEditTask,
}) {
  const [newTaskTitle, setNewTaskTitle] = useState('')

  // Makes this column draggable for column reordering.
  const {
    setNodeRef: setSortableRef,
    setActivatorNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id })

  // Separate droppable for the task area — distinct id avoids conflict with
  // the column's own sortable registration above.
  const { setNodeRef: setTaskDropRef } = useDroppable({ id: `${column.id}-drop` })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onAddTask(column.id, newTaskTitle)
    setNewTaskTitle('')
  }

  const dragHandle = (
    <button
      ref={setActivatorNodeRef}
      type="button"
      className="drag-handle"
      aria-label={`Drag ${column.title} column`}
      {...attributes}
      {...listeners}
    >
      <DragDots />
    </button>
  )

  return (
    <section
      ref={setSortableRef}
      style={style}
      data-column-id={column.id}
      className={`kanban-column ${
        isTaskTargeted ? 'kanban-column-over' : 'kanban-column-idle'
      } ${isDragging ? 'opacity-50' : ''}`}
    >
      <ColumnHeader title={column.title} taskCount={tasks.length} dragHandle={dragHandle} />
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setTaskDropRef}
          data-task-list-id={column.id}
          className="flex min-h-[4rem] flex-1 flex-col gap-3 overflow-y-auto pr-1"
        >
          {tasks.map((task, index) => (
            <Fragment key={task.id}>
              {insertionIndex === index ? <div className="task-insert-indicator" aria-hidden="true" /> : null}
              <TaskCard task={{ ...task, onEdit: onEditTask }} />
            </Fragment>
          ))}
          {tasks.length > 0 && insertionIndex === tasks.length ? (
            <div className="task-insert-indicator" aria-hidden="true" />
          ) : null}
        </div>
      </SortableContext>
      <TaskForm
        value={newTaskTitle}
        onChange={setNewTaskTitle}
        onSubmit={handleSubmit}
      />
    </section>
  )
}
