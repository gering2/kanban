import { createId } from '../../lib/ids'

const TASK_PRIORITIES = ['low', 'medium', 'high']

function normalizePriority(priority) {
  return TASK_PRIORITIES.includes(priority) ? priority : 'medium'
}

function normalizeLabels(labels) {
  if (!Array.isArray(labels)) {
    return []
  }

  const seen = new Set()

  return labels
    .map((label) => String(label).trim())
    .filter((label) => {
      if (!label) {
        return false
      }

      const key = label.toLowerCase()
      if (seen.has(key)) {
        return false
      }

      seen.add(key)
      return true
    })
}

export function createInitialBoardState() {
  return {
    board: {
      id: 'board-1',
      title: 'Product Sprint Board',
      columnOrder: ['todo', 'current', 'done'],
    },
    columns: {
      todo: {
        id: 'todo',
        title: 'To Do',
        taskIds: ['task-1', 'task-2'],
      },
      current: {
        id: 'current',
        title: 'Current',
        taskIds: ['task-3'],
      },
      done: {
        id: 'done',
        title: 'Done',
        taskIds: [],
      },
    },
    tasks: {
      'task-1': {
        id: 'task-1',
        title: 'Map board data model',
        description: 'Define entities for board, columns, and tasks.',
        dueDate: null,
        priority: 'high',
        labels: ['planning', 'backend'],
      },
      'task-2': {
        id: 'task-2',
        title: 'Draft MVP task actions',
        description: 'Add, edit, delete, and move card actions.',
        dueDate: null,
        priority: 'medium',
        labels: ['frontend'],
      },
      'task-3': {
        id: 'task-3',
        title: 'Set up project architecture',
        description: 'Switch from Vite starter to feature-first layout.',
        dueDate: new Date().toISOString(),
        priority: 'low',
        labels: ['infra'],
      },
    },
  }
}

export function addTask(state, columnId, taskInput) {
  const isStringInput = typeof taskInput === 'string'
  const cleanTitle = isStringInput ? taskInput.trim() : taskInput?.title?.trim()

  if (!cleanTitle || !state.columns[columnId]) {
    return state
  }

  const description = isStringInput ? '' : (taskInput.description ?? '')
  const dueDate = isStringInput ? null : (taskInput.dueDate || null)
  const priority = normalizePriority(isStringInput ? 'medium' : taskInput.priority)
  const labels = normalizeLabels(isStringInput ? [] : taskInput.labels)
  const taskId = createId('task')

  return {
    ...state,
    tasks: {
      ...state.tasks,
      [taskId]: {
        id: taskId,
        title: cleanTitle,
        description,
        dueDate,
        priority,
        labels,
      },
    },
    columns: {
      ...state.columns,
      [columnId]: {
        ...state.columns[columnId],
        taskIds: [...state.columns[columnId].taskIds, taskId],
      },
    },
  }
}

export function addColumn(state, title) {
  const cleanTitle = title.trim()

  if (!cleanTitle) {
    return state
  }

  const columnId = createId('column')

  return {
    ...state,
    board: {
      ...state.board,
      columnOrder: [...state.board.columnOrder, columnId],
    },
    columns: {
      ...state.columns,
      [columnId]: {
        id: columnId,
        title: cleanTitle,
        taskIds: [],
      },
    },
  }
}

export function updateTask(state, taskId, updates) {
  const currentTask = state.tasks[taskId]

  if (!currentTask) {
    return state
  }

  const nextTitle = updates.title?.trim() ?? currentTask.title

  if (!nextTitle) {
    return state
  }

  return {
    ...state,
    tasks: {
      ...state.tasks,
      [taskId]: {
        ...currentTask,
        ...updates,
        title: nextTitle,
        description: updates.description ?? currentTask.description,
        dueDate: updates.dueDate ?? currentTask.dueDate,
        priority: normalizePriority(updates.priority ?? currentTask.priority),
        labels: normalizeLabels(updates.labels ?? currentTask.labels),
      },
    },
  }
}

export function moveColumn(state, sourceColumnId, targetColumnId) {
  const columnOrder = [...state.board.columnOrder]
  const fromIndex = columnOrder.indexOf(sourceColumnId)
  const toIndex = columnOrder.indexOf(targetColumnId)

  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
    return state
  }

  columnOrder.splice(fromIndex, 1)
  columnOrder.splice(toIndex, 0, sourceColumnId)

  return {
    ...state,
    board: { ...state.board, columnOrder },
  }
}

export function deleteColumn(state, columnId) {
  if (!state.columns[columnId] || state.board.columnOrder.length <= 1) {
    return state
  }

  const nextColumns = { ...state.columns }
  const nextTasks = { ...state.tasks }

  state.columns[columnId].taskIds.forEach((taskId) => {
    delete nextTasks[taskId]
  })

  delete nextColumns[columnId]

  return {
    ...state,
    board: {
      ...state.board,
      columnOrder: state.board.columnOrder.filter((id) => id !== columnId),
    },
    columns: nextColumns,
    tasks: nextTasks,
  }
}

export function deleteTask(state, taskId) {
  if (!state.tasks[taskId]) {
    return state
  }

  const nextTasks = { ...state.tasks }
  delete nextTasks[taskId]

  const nextColumns = Object.fromEntries(
    Object.entries(state.columns).map(([colId, col]) => [
      colId,
      { ...col, taskIds: col.taskIds.filter((id) => id !== taskId) },
    ]),
  )

  return { ...state, tasks: nextTasks, columns: nextColumns }
}

export function moveTask(state, sourceColumnId, targetColumnId, taskId, targetIndex) {
  if (!state.columns[sourceColumnId] || !state.columns[targetColumnId]) {
    return state
  }

  const sourceTaskIds = state.columns[sourceColumnId].taskIds.filter((id) => id !== taskId)

  if (sourceColumnId === targetColumnId) {
    sourceTaskIds.splice(targetIndex, 0, taskId)
    return {
      ...state,
      columns: {
        ...state.columns,
        [sourceColumnId]: {
          ...state.columns[sourceColumnId],
          taskIds: sourceTaskIds,
        },
      },
    }
  }

  const targetTaskIds = [...state.columns[targetColumnId].taskIds]
  targetTaskIds.splice(targetIndex, 0, taskId)

  return {
    ...state,
    columns: {
      ...state.columns,
      [sourceColumnId]: {
        ...state.columns[sourceColumnId],
        taskIds: sourceTaskIds,
      },
      [targetColumnId]: {
        ...state.columns[targetColumnId],
        taskIds: targetTaskIds,
      },
    },
  }
}
