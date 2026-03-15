import { useEffect, useRef, useState } from 'react'
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
  onDeleteColumn,
  onEditTask,
}) {
  const indicatorBandHeight = 6
  const [indicatorTop, setIndicatorTop] = useState(null)
  const [isTaskListScrolling, setIsTaskListScrolling] = useState(false)
  const taskListRef = useRef(null)
  const taskItemRefs = useRef(new Map())
  const scrollIdleTimerRef = useRef(null)

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

  const showInsertionIndicator = tasks.length > 0 && indicatorTop !== null

  const handleTaskListScroll = () => {
    setIsTaskListScrolling(true)

    if (scrollIdleTimerRef.current) {
      clearTimeout(scrollIdleTimerRef.current)
    }

    scrollIdleTimerRef.current = setTimeout(() => {
      setIsTaskListScrolling(false)
      scrollIdleTimerRef.current = null
    }, 700)
  }

  useEffect(() => {
    if (insertionIndex === null || tasks.length === 0 || !taskListRef.current) {
      setIndicatorTop(null)
      return
    }

    const clampedIndex = Math.max(0, Math.min(insertionIndex, tasks.length))
    const firstTask = taskItemRefs.current.get(tasks[0].id)
    const lastTask = taskItemRefs.current.get(tasks[tasks.length - 1].id)
    const listHeight = taskListRef.current.clientHeight

    const clampToListBounds = (top) => {
      const minTop = 0
      const maxTop = Math.max(0, listHeight - indicatorBandHeight)
      return Math.max(minTop, Math.min(top, maxTop))
    }

    if (clampedIndex === 0 && firstTask) {
      setIndicatorTop(clampToListBounds(firstTask.offsetTop))
      return
    }

    if (clampedIndex === tasks.length && lastTask) {
      setIndicatorTop(clampToListBounds(lastTask.offsetTop + lastTask.offsetHeight))
      return
    }

    const targetTask = taskItemRefs.current.get(tasks[clampedIndex]?.id)
    setIndicatorTop(targetTask ? clampToListBounds(targetTask.offsetTop) : null)
  }, [insertionIndex, tasks])

  useEffect(() => {
    return () => {
      if (scrollIdleTimerRef.current) {
        clearTimeout(scrollIdleTimerRef.current)
      }
    }
  }, [])

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

  const deleteAction = onDeleteColumn ? (
    <button
      type="button"
      className="icon-button column-delete-action"
      aria-label={`Delete ${column.title} column`}
      onClick={() => onDeleteColumn(column.id)}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M18 6 6 18M6 6l12 12" />
      </svg>
    </button>
  ) : null

  return (
    <section
      ref={setSortableRef}
      style={style}
      data-column-id={column.id}
      className={`kanban-column ${
        isTaskTargeted ? 'kanban-column-over' : 'kanban-column-idle'
      } ${isDragging ? 'opacity-50' : ''}`}
    >
      <ColumnHeader
        title={column.title}
        taskCount={tasks.length}
        dragHandle={dragHandle}
        deleteAction={deleteAction}
      />
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={(node) => {
            setTaskDropRef(node)
            taskListRef.current = node
          }}
          onScroll={handleTaskListScroll}
          data-task-list-id={column.id}
          className={`task-list ${isTaskListScrolling ? 'task-list-scrolling' : ''} ${
            showInsertionIndicator ? 'overflow-y-hidden' : 'overflow-y-auto'
          }`}
        >
          {showInsertionIndicator ? (
            <div
              className="task-insert-indicator"
              style={{ top: `${indicatorTop}px` }}
              aria-hidden="true"
            />
          ) : null}
          {tasks.map((task) => (
            <div
              key={task.id}
              ref={(node) => {
                if (node) {
                  taskItemRefs.current.set(task.id, node)
                } else {
                  taskItemRefs.current.delete(task.id)
                }
              }}
            >
              <TaskCard task={{ ...task, onEdit: onEditTask }} />
            </div>
          ))}
        </div>
      </SortableContext>
      <TaskForm
        onOpen={() => onAddTask(column.id)}
      />
    </section>
  )
}
