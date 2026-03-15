export function selectOrderedColumns(state) {
  return state.board.columnOrder
    .map((columnId) => state.columns[columnId])
    .filter(Boolean)
}

export function selectTasksByColumnId(state, columnId) {
  const column = state.columns[columnId]

  if (!column) {
    return []
  }

  return column.taskIds.map((taskId) => state.tasks[taskId]).filter(Boolean)
}
