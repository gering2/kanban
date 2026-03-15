import { createId } from '../../lib/ids'

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
      },
      'task-2': {
        id: 'task-2',
        title: 'Draft MVP task actions',
        description: 'Add, edit, delete, and move card actions.',
        dueDate: null,
      },
      'task-3': {
        id: 'task-3',
        title: 'Set up project architecture',
        description: 'Switch from Vite starter to feature-first layout.',
        dueDate: new Date().toISOString(),
      },
    },
  }
}

export function addTask(state, columnId, title) {
  const cleanTitle = title.trim()

  if (!cleanTitle || !state.columns[columnId]) {
    return state
  }

  const taskId = createId('task')

  return {
    ...state,
    tasks: {
      ...state.tasks,
      [taskId]: {
        id: taskId,
        title: cleanTitle,
        description: '',
        dueDate: null,
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
