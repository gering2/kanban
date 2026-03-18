import { DndContext, DragOverlay } from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { Column } from '../column/Column'
import { TaskCard } from '../task/TaskCard'
import { selectTasksByColumnId } from './boardSelectors'
import { useBoardDnD } from '../../hooks/useBoardDnD'

export function BoardView({
  boardState,
  onMoveTask,
  onMoveColumn,
  onAddTask,
  onDeleteColumn,
  onEditTask,
  onDeleteTask,
  onEditColumn
}) {
  const {
    activeTask,
    activeColumn,
    taskDropPreview,
    orderedColumns,
    sensors,
    collisionDetection,
    handleDragStart,
    handleDragOver,
    handleDragCancel,
    handleDragEnd,
  } = useBoardDnD(boardState, onMoveTask, onMoveColumn)

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
        // Only use IDs of columns that actually exist and are rendered
        items={orderedColumns.map((c) => c.id)}
        strategy={horizontalListSortingStrategy}
      >
        <section className="board-shell">
          <div className="board-lanes">
            {orderedColumns.map((column, columnIndex) => (
              <Column
                key={column.id}
                column={{ ...column }}
                columnIndex={columnIndex}
                tasks={selectTasksByColumnId(boardState, column.id)}
                isTaskTargeted={taskDropPreview?.columnId === column.id}
                insertionIndex={
                  taskDropPreview?.columnId === column.id ? taskDropPreview.index : null
                }
                onAddTask={onAddTask}
                onDeleteColumn={orderedColumns.length > 1 ? onDeleteColumn : null}
                onEditColumn={onEditColumn}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
              />
            ))}
          </div>
        </section>
      </SortableContext>
      <DragOverlay>
        {activeTask ? (
          <TaskCard task={activeTask} />
        ) : activeColumn ? (
          <Column
            column={activeColumn}
            // Always pass a valid tasks array for overlay
            tasks={
              activeColumn && boardState && boardState.columns && boardState.columns[activeColumn.id]
                ? (boardState.columns[activeColumn.id].taskIds || [])
                    .map((taskId) => boardState.tasks[taskId])
                    .filter(Boolean)
                : []
            }
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

