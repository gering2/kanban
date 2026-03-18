// Returns only columns that exist in state.columns, in order
export function selectOrderedColumns(state) {
  return state.board.columnOrder
    .map((columnId) => {
      const col = state.columns[columnId];
      return col ? { ...col } : null;
    })
    .filter(Boolean);
}

// Utility to clean up board state: removes columnOrder entries for missing columns
export function migrateBoardState(state) {
  const validColumnOrder = state.board.columnOrder.filter((id) => !!state.columns[id]);
  if (validColumnOrder.length !== state.board.columnOrder.length) {
    return {
      ...state,
      board: {
        ...state.board,
        columnOrder: validColumnOrder,
      },
    };
  }
  return state;
}

export function selectTasksByColumnId(state, columnId) {
  const column = state.columns[columnId];
  if (!column) {
    return [];
  }
  return column.taskIds.map((taskId) => state.tasks[taskId]).filter(Boolean);
}
