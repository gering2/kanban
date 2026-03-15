import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  pointerWithin,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { Column } from '../column/Column'
import { TaskCard } from '../task/TaskCard'
import { selectOrderedColumns, selectTasksByColumnId } from './boardSelectors'

function getActiveCenter(event) {
  const initialRect = getActiveRect(event)
  return {
    x: initialRect.left + initialRect.width / 2,
    y: initialRect.top + initialRect.height / 2,
  }
}

function getActiveRect(event) {
  return event.active.rect.current.translated ?? event.active.rect.current.initial
}

function getColumnIdByActiveRect(activeRect) {
  const columnEls = Array.from(document.querySelectorAll('[data-column-id]'))

  if (columnEls.length === 0) {
    return null
  }

  let bestOverlapColumnId = null
  let bestOverlapWidth = 0

  columnEls.forEach((columnEl) => {
    const rect = columnEl.getBoundingClientRect()
    const overlapLeft = Math.max(activeRect.left, rect.left)
    const overlapRight = Math.min(activeRect.right, rect.right)
    const overlapWidth = Math.max(0, overlapRight - overlapLeft)

    if (overlapWidth > bestOverlapWidth) {
      bestOverlapWidth = overlapWidth
      bestOverlapColumnId = columnEl.getAttribute('data-column-id')
    }
  })

  if (bestOverlapWidth > 0) {
    return bestOverlapColumnId
  }

  const activeCenterX = activeRect.left + activeRect.width / 2

  let closestColumnId = null
  let closestDistance = Number.POSITIVE_INFINITY

  columnEls.forEach((columnEl) => {
    const rect = columnEl.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const distance = Math.abs(activeCenterX - centerX)

    if (distance < closestDistance) {
      closestDistance = distance
      closestColumnId = columnEl.getAttribute('data-column-id')
    }
  })

  return closestColumnId
}

function getCrossColumnTargetIndex(targetColumnId, taskIds, activeCenterY) {
  if (taskIds.length === 0) {
    return 0
  }

  const taskListEl = document.querySelector(`[data-task-list-id="${targetColumnId}"]`)

  if (!taskListEl) {
    return taskIds.length
  }

  for (let index = 0; index < taskIds.length; index += 1) {
    const taskEl = taskListEl.querySelector(`[data-task-id="${taskIds[index]}"]`)

    if (!taskEl) {
      continue
    }

    const rect = taskEl.getBoundingClientRect()
    const midpoint = rect.top + rect.height / 2

    if (activeCenterY < midpoint) {
      return index
    }
  }

  return taskIds.length
}

function findSourceColumnForTask(boardState, taskId) {
  return Object.values(boardState.columns).find((column) => column.taskIds.includes(taskId))
}

function findTargetColumnByOverId(boardState, overId) {
  if (boardState.columns[overId]) {
    return boardState.columns[overId]
  }

  return Object.values(boardState.columns).find((column) => column.taskIds.includes(overId))
}

function getTaskDragIntent(event, boardState) {
  const { active, over } = event

  if (!over || boardState.columns[active.id]) {
    return null
  }

  const overId = over.id.endsWith('-drop') ? over.id.replace('-drop', '') : over.id
  const sourceColumn = findSourceColumnForTask(boardState, active.id)

  if (!sourceColumn) {
    return null
  }

  const activeRect = getActiveRect(event)
  const activeCenter = getActiveCenter(event)
  const overColumn = findTargetColumnByOverId(boardState, overId)
  const pointerColumnId = getColumnIdByActiveRect(activeRect)
  const pointerColumn = pointerColumnId ? boardState.columns[pointerColumnId] : null
  const crossColumnTarget =
    overColumn && overColumn.id !== sourceColumn.id
      ? overColumn
      : pointerColumn && pointerColumn.id !== sourceColumn.id
        ? pointerColumn
        : null

  // Prefer collision-resolved target column for responsiveness, then fall back
  // to geometry when collisions are ambiguous while crossing gaps.
  if (crossColumnTarget) {
    const targetIndex = getCrossColumnTargetIndex(
      crossColumnTarget.id,
      crossColumnTarget.taskIds,
      activeCenter.y,
    )

    return {
      sourceColumnId: sourceColumn.id,
      targetColumnId: crossColumnTarget.id,
      targetIndex,
      isCrossColumn: true,
    }
  }

  const overIsColumn = Boolean(boardState.columns[overId])
  const targetColumn = overColumn

  if (!targetColumn) {
    return null
  }

  if (overIsColumn) {
    return {
      sourceColumnId: sourceColumn.id,
      targetColumnId: targetColumn.id,
      targetIndex: targetColumn.taskIds.length,
      isCrossColumn: false,
    }
  }

  const overIndex = targetColumn.taskIds.indexOf(overId)
  if (overIndex < 0) {
    return null
  }
  const overCenterY = over.rect.top + over.rect.height / 2
  const insertAfter = activeCenter.y > overCenterY
  const targetIndex = insertAfter ? overIndex + 1 : overIndex

  return {
    sourceColumnId: sourceColumn.id,
    targetColumnId: targetColumn.id,
    targetIndex,
    isCrossColumn: sourceColumn.id !== targetColumn.id,
  }
}

export function BoardView({
  boardState,
  onMoveTask,
  onMoveColumn,
  onAddTask,
  onDeleteColumn,
  onEditTask,
}) {
  const [activeTask, setActiveTask] = useState(null)
  const [activeColumn, setActiveColumn] = useState(null)
  const [taskDropPreview, setTaskDropPreview] = useState(null)
  const orderedColumns = selectOrderedColumns(boardState)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  )

  const collisionDetection = (args) => {
    const pointerCollisions = pointerWithin(args)

    if (pointerCollisions.length > 0) {
      return pointerCollisions
    }

    return closestCenter(args)
  }

  const handleDragStart = ({ active }) => {
    setTaskDropPreview(null)
    if (boardState.columns[active.id]) {
      setActiveColumn(boardState.columns[active.id])
    } else {
      setActiveTask(boardState.tasks[active.id] ?? null)
    }
  }

  const handleDragOver = (event) => {
    const intent = getTaskDragIntent(event, boardState)

    if (!intent || !intent.isCrossColumn) {
      setTaskDropPreview(null)
      return
    }

    setTaskDropPreview({
      columnId: intent.targetColumnId,
      index: intent.targetIndex,
    })
  }

  const handleDragCancel = () => {
    setActiveTask(null)
    setActiveColumn(null)
    setTaskDropPreview(null)
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    setActiveTask(null)
    setActiveColumn(null)
    setTaskDropPreview(null)
    if (!over || active.id === over.id) return

    // Column drag — resolve over.id which may be a column id or a task-drop id
    if (boardState.columns[active.id]) {
      const targetColumnId = over.id.endsWith('-drop')
        ? over.id.replace('-drop', '')
        : over.id
      if (boardState.columns[targetColumnId] && targetColumnId !== active.id) {
        onMoveColumn(active.id, targetColumnId)
      }
      return
    }

    const intent = getTaskDragIntent(event, boardState)
    if (!intent) return

    onMoveTask(intent.sourceColumnId, intent.targetColumnId, active.id, intent.targetIndex)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragCancel={handleDragCancel}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={orderedColumns.map((c) => c.id)}
        strategy={horizontalListSortingStrategy}
      >
        <section className="board-shell">
          <div className="board-lanes">
            {orderedColumns.map((column) => (
              <Column
                key={column.id}
                column={column}
                tasks={selectTasksByColumnId(boardState, column.id)}
                isTaskTargeted={taskDropPreview?.columnId === column.id}
                insertionIndex={
                  taskDropPreview?.columnId === column.id ? taskDropPreview.index : null
                }
                onAddTask={onAddTask}
                onDeleteColumn={boardState.board.columnOrder.length > 1 ? onDeleteColumn : null}
                onEditTask={onEditTask}
              />
            ))}
          </div>
        </section>
      </SortableContext>
      <DragOverlay dropAnimation={null}>
        {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
        {activeColumn ? (
          <div className="kanban-column kanban-column-idle w-[19rem] rotate-2 opacity-90">
            <p className="column-title">{activeColumn.title}</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
