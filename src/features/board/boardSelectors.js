export function selectOrderedColumns(state) {
  return state.board.columnOrder
    .map((columnId) => {
      const col = state.columns[columnId];
      return col ? { ...col } : null;
    })
    .filter(Boolean)
}

export function selectTasksByColumnId(state, columnId) {
  const column = state.columns[columnId]

  if (!column) {
    return []
  }

  return column.taskIds.map((taskId) => state.tasks[taskId]).filter(Boolean)
}
