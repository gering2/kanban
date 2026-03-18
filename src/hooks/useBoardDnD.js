// Placeholder for a custom hook to encapsulate board drag-and-drop logic
// Move DnD-related state and handlers from BoardView into this hook for better separation

import { useState, useMemo } from 'react'
import {
  PointerSensor,
  closestCenter,
  pointerWithin,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { selectOrderedColumns, selectTasksByColumnId } from '../features/board/boardSelectors'

export function useBoardDnD(boardState, onMoveTask, onMoveColumn) {
  const [activeTask, setActiveTask] = useState(null)
  const [activeColumn, setActiveColumn] = useState(null)
  const [taskDropPreview, setTaskDropPreview] = useState(null)
  const orderedColumns = useMemo(() => selectOrderedColumns(boardState), [boardState])

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
    if (columnEls.length === 0) return null
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
    if (bestOverlapWidth > 0) return bestOverlapColumnId
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
    if (taskIds.length === 0) return 0
    const taskListEl = document.querySelector(`[data-task-list-id="${targetColumnId}"]`)
    if (!taskListEl) return taskIds.length
    for (let index = 0; index < taskIds.length; index += 1) {
      const taskEl = taskListEl.querySelector(`[data-task-id="${taskIds[index]}"]`)
      if (!taskEl) continue
      const rect = taskEl.getBoundingClientRect()
      const midpoint = rect.top + rect.height / 2
      if (activeCenterY < midpoint) return index
    }
    return taskIds.length
  }
  function findSourceColumnForTask(boardState, taskId) {
    return Object.values(boardState.columns).find((column) => column.taskIds.includes(taskId))
  }
  function findTargetColumnByOverId(boardState, overId) {
    if (boardState.columns[overId]) return boardState.columns[overId]
    return Object.values(boardState.columns).find((column) => column.taskIds.includes(overId))
  }
  function getTaskDragIntent(event, boardState) {
    const { active, over } = event
    if (!over || !active || !active.id || !boardState.columns) return null
    // Only return null if active.id is not a column AND not a task
    const isColumn = !!boardState.columns[active.id];
    const isTask = !!boardState.tasks && !!boardState.tasks[active.id];
    if (!isColumn && !isTask) return null
    const overId = over.id.endsWith('-drop') ? over.id.replace('-drop', '') : over.id
    const sourceColumn = findSourceColumnForTask(boardState, active.id)
    if (!sourceColumn) return null
    const activeRect = getActiveRect(event)
    const activeCenter = getActiveCenter(event)
    const overColumn = findTargetColumnByOverId(boardState, overId)
    if (overColumn === undefined || overColumn === null) return null
    const pointerColumnId = getColumnIdByActiveRect(activeRect)
    const pointerColumn = pointerColumnId && boardState.columns[pointerColumnId] ? boardState.columns[pointerColumnId] : null
    const crossColumnTarget =
      overColumn && overColumn.id !== sourceColumn.id
        ? overColumn
        : pointerColumn && pointerColumn.id !== sourceColumn.id
          ? pointerColumn
          : null
    if (crossColumnTarget) {
      if (!crossColumnTarget.taskIds) return null;
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
    if (!targetColumn || !targetColumn.taskIds) return null
    if (overIsColumn) {
      return {
        sourceColumnId: sourceColumn.id,
        targetColumnId: targetColumn.id,
        targetIndex: targetColumn.taskIds.length,
        isCrossColumn: false,
      }
    }
    const overIndex = targetColumn.taskIds.indexOf(overId)
    if (overIndex < 0) return null
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

  const handleDragStart = ({ active }) => {
    setTaskDropPreview(null)
    if (!active || !active.id) {
      console.error('DnD: Drag start with missing active or active.id', { active });
      return;
    }
    if (boardState.columns[active.id]) {
      setActiveColumn(boardState.columns[active.id])
    } else if (boardState.tasks[active.id]) {
      setActiveTask(boardState.tasks[active.id])
    } else {
      setActiveTask(null);
      setActiveColumn(null);
      console.error('DnD: Drag start with unknown id', { id: active.id, boardState });
    }
  }

  const handleDragOver = (event) => {
    try {
      const intent = getTaskDragIntent(event, boardState)
      if (!intent || !intent.isCrossColumn) {
        setTaskDropPreview(null)
        return
      }
      setTaskDropPreview({
        columnId: intent.targetColumnId,
        index: intent.targetIndex,
      })
    } catch (err) {
      setTaskDropPreview(null)
      console.error('DnD: Error in handleDragOver', err, { event, boardState });
    }
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
    if (!active || !active.id) {
      console.error('DnD: Drag end with missing active or active.id', { event });
      return;
    }
    if (!over || !over.id) {
      console.error('DnD: Drag end with missing over or over.id', { event });
      return;
    }
    if (active.id === over.id) return
    if (boardState.columns[active.id]) {
      const targetColumnId = over.id.endsWith('-drop')
        ? over.id.replace('-drop', '')
        : over.id
      if (boardState.columns[targetColumnId] && targetColumnId !== active.id) {
        onMoveColumn(active.id, targetColumnId)
      } else {
        // Defensive: if the target column is missing, do nothing
        return;
      }
      return
    }
    try {
      const intent = getTaskDragIntent(event, boardState)
      if (!intent) {
        console.error('DnD: No intent found in handleDragEnd', { event, boardState });
        return
      }
      onMoveTask(intent.sourceColumnId, intent.targetColumnId, active.id, intent.targetIndex)
    } catch (err) {
      console.error('DnD: Error in handleDragEnd', err, { event, boardState });
    }
  }

  return {
    activeTask,
    setActiveTask,
    activeColumn,
    setActiveColumn,
    taskDropPreview,
    setTaskDropPreview,
    orderedColumns,
    sensors,
    collisionDetection,
    handleDragStart,
    handleDragOver,
    handleDragCancel,
    handleDragEnd,
  }
}
