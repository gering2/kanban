import { useMemo, useState } from 'react'
import { AddColumnForm } from '../column/AddColumnForm'
import { BoardView } from './BoardView'
import {
  addColumn,
  addTask,
  createInitialBoardState,
  moveColumn,
  moveTask,
  updateTask,
} from './boardStore'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { DatePicker } from '../../components/ui/DatePicker'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { TaskModal } from '../task/TaskModal'

const BOARD_STORAGE_KEY = 'kanban.board.v1'

export function BoardPage() {
  const initialState = useMemo(() => createInitialBoardState(), [])
  const [boardState, setBoardState] = useLocalStorage(BOARD_STORAGE_KEY, initialState)
  const [editingTaskId, setEditingTaskId] = useState(null)
  const editingTask = editingTaskId ? boardState.tasks[editingTaskId] : null
  const [taskDraft, setTaskDraft] = useState({ title: '', description: '', dueDate: '' })

  const handleAddTask = (columnId, title) => {
    setBoardState((currentState) => addTask(currentState, columnId, title))
  }

  const handleAddColumn = (title) => {
    setBoardState((currentState) => addColumn(currentState, title))
  }

  const handleMoveTask = (sourceColumnId, targetColumnId, taskId, targetIndex) => {
    setBoardState((currentState) =>
      moveTask(currentState, sourceColumnId, targetColumnId, taskId, targetIndex),
    )
  }

  const handleMoveColumn = (sourceColumnId, targetColumnId) => {
    setBoardState((currentState) => moveColumn(currentState, sourceColumnId, targetColumnId))
  }

  const handleOpenEditTask = (taskId) => {
    const task = boardState.tasks[taskId]

    if (!task) {
      return
    }

    setEditingTaskId(taskId)
    setTaskDraft({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
    })
  }

  const handleCloseEditTask = () => {
    setEditingTaskId(null)
    setTaskDraft({ title: '', description: '', dueDate: '' })
  }

  const handleSaveTask = (event) => {
    event.preventDefault()

    if (!editingTaskId) {
      return
    }

    setBoardState((currentState) =>
      updateTask(currentState, editingTaskId, {
        title: taskDraft.title,
        description: taskDraft.description,
        dueDate: taskDraft.dueDate || null,
      }),
    )

    handleCloseEditTask()
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1200px] flex-col px-4 py-8 sm:px-6">
      <header className="mb-6 space-y-2">
        <p className="page-eyebrow">Project Structure</p>
        <h1 className="page-title">{boardState.board.title}</h1>
        <p className="page-copy">
          Feature-first layout is now active: board, column, and task logic are
          split into focused modules with shared UI primitives.
        </p>
      </header>

      <div className="mb-5">
        <AddColumnForm onAddColumn={handleAddColumn} />
      </div>

      <BoardView
        boardState={boardState}
        onMoveTask={handleMoveTask}
        onMoveColumn={handleMoveColumn}
        onAddTask={handleAddTask}
        onEditTask={handleOpenEditTask}
      />

      <TaskModal
        isOpen={Boolean(editingTask)}
        onClose={handleCloseEditTask}
        title={editingTask ? `Edit ${editingTask.title}` : 'Edit Task'}
      >
        <form className="space-y-4" onSubmit={handleSaveTask}>
          <div className="space-y-1.5">
            <label className="field-label" htmlFor="task-title">
              Title
            </label>
            <Input
              id="task-title"
              value={taskDraft.title}
              onChange={(event) =>
                setTaskDraft((currentDraft) => ({
                  ...currentDraft,
                  title: event.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <label className="field-label" htmlFor="task-description">
              Description
            </label>
            <textarea
              id="task-description"
              className="textarea"
              value={taskDraft.description}
              onChange={(event) =>
                setTaskDraft((currentDraft) => ({
                  ...currentDraft,
                  description: event.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <label className="field-label" htmlFor="task-due-date">
              Due date
            </label>
            <DatePicker
              value={taskDraft.dueDate}
              onChange={(dateString) =>
                setTaskDraft((currentDraft) => ({
                  ...currentDraft,
                  dueDate: dateString,
                }))
              }
              placeholder="Pick a due date"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="ghost-button" onClick={handleCloseEditTask}>
              Cancel
            </button>
            <Button type="submit">Save changes</Button>
          </div>
        </form>
      </TaskModal>
    </main>
  )
}
