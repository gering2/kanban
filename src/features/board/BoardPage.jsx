import { useMemo, useState } from 'react'
import { AddColumnForm } from '../column/AddColumnForm'
import { BoardView } from './BoardView'
import {
  addColumn,
  addTask,
  createInitialBoardState,
  deleteColumn,
  deleteTask,
  moveColumn,
  moveTask,
  updateTask,
} from './boardStore'
import { BrandMark } from '../../components/ui/BrandMark'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { DatePicker } from '../../components/ui/DatePicker'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { TaskModal } from '../task/TaskModal'

const BOARD_STORAGE_KEY = 'kanban.board.v1'

function parseLabelsInput(labelsInput) {
  if (!labelsInput) {
    return []
  }

  return labelsInput
    .split(',')
    .map((label) => label.trim())
    .filter(Boolean)
}

export function BoardPage() {
  const initialState = useMemo(() => createInitialBoardState(), [])
  const [boardState, setBoardState] = useLocalStorage(BOARD_STORAGE_KEY, initialState)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeLabelFilter, setActiveLabelFilter] = useState('all')
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [creatingTaskColumnId, setCreatingTaskColumnId] = useState(null)
  const [deletingColumnId, setDeletingColumnId] = useState(null)
  const [deletingTaskId, setDeletingTaskId] = useState(null)
  const editingTask = editingTaskId ? boardState.tasks[editingTaskId] : null
  const deletingColumn = deletingColumnId ? boardState.columns[deletingColumnId] : null
  const deletingTask = deletingTaskId ? boardState.tasks[deletingTaskId] : null
  const [taskDraft, setTaskDraft] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    labelsText: '',
  })

  const availableLabels = useMemo(() => {
    const labels = new Set()

    Object.values(boardState.tasks).forEach((task) => {
      if (!Array.isArray(task.labels)) {
        return
      }

      task.labels.forEach((label) => {
        if (label) {
          labels.add(label)
        }
      })
    })

    return Array.from(labels).sort((a, b) => a.localeCompare(b))
  }, [boardState.tasks])

  const filteredBoardState = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    const hasQuery = query.length > 0
    const useLabelFilter = activeLabelFilter !== 'all'

    const nextColumns = Object.fromEntries(
      Object.entries(boardState.columns).map(([columnId, column]) => {
        const nextTaskIds = column.taskIds.filter((taskId) => {
          const task = boardState.tasks[taskId]

          if (!task) {
            return false
          }

          const taskLabels = Array.isArray(task.labels) ? task.labels : []
          const matchesLabel = !useLabelFilter || taskLabels.includes(activeLabelFilter)

          if (!matchesLabel) {
            return false
          }

          if (!hasQuery) {
            return true
          }

          const haystack = `${task.title} ${task.description} ${taskLabels.join(' ')}`.toLowerCase()
          return haystack.includes(query)
        })

        return [columnId, { ...boardState.columns[columnId], taskIds: nextTaskIds }]
      }),
    )

    return {
      ...boardState,
      columns: nextColumns,
    }
  }, [boardState, searchQuery, activeLabelFilter])

  const visibleTaskCount = useMemo(
    () => Object.values(filteredBoardState.columns).reduce((sum, column) => sum + column.taskIds.length, 0),
    [filteredBoardState.columns],
  )

  const totalTaskCount = Object.keys(boardState.tasks).length

  const handleOpenCreateTask = (columnId) => {
    setCreatingTaskColumnId(columnId)
    setTaskDraft({
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium',
      labelsText: '',
    })
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

  const handleOpenDeleteColumn = (columnId) => {
    setDeletingColumnId(columnId)
  }

  const handleCloseDeleteColumn = () => {
    setDeletingColumnId(null)
  }

  const handleDeleteColumn = () => {
    if (!deletingColumnId) {
      return
    }

    setBoardState((currentState) => deleteColumn(currentState, deletingColumnId))
    handleCloseDeleteColumn()
  }

  const handleOpenDeleteTask = (taskId) => {
    setDeletingTaskId(taskId)
  }

  const handleCloseDeleteTask = () => {
    setDeletingTaskId(null)
  }

  const handleDeleteTask = () => {
    if (!deletingTaskId) return
    setBoardState((currentState) => deleteTask(currentState, deletingTaskId))
    handleCloseDeleteTask()
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
      priority: task.priority ?? 'medium',
      labelsText: task.labels?.join(', ') ?? '',
    })
  }

  const handleEditColumn = (columnId, newColumnTitle) => {
    const cleanTitle = newColumnTitle.trim();
    if (!cleanTitle) return; // Prevent empty/whitespace-only titles
    setBoardState((state) => {
      const nextColumns = { ...state.columns };
      if (!nextColumns[columnId]) return state;
      nextColumns[columnId] = { ...nextColumns[columnId], title: cleanTitle };
      return { ...state, columns: nextColumns };
    });
  }

  const handleCloseEditTask = () => {
    setEditingTaskId(null)
    setTaskDraft({
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium',
      labelsText: '',
    })
  }

  const handleCloseCreateTask = () => {
    setCreatingTaskColumnId(null)
    setTaskDraft({
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium',
      labelsText: '',
    })
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
        priority: taskDraft.priority,
        labels: parseLabelsInput(taskDraft.labelsText),
      }),
    )

    handleCloseEditTask()
  }

  const handleCreateTask = (event) => {
    event.preventDefault()

    if (!creatingTaskColumnId) {
      return
    }

    setBoardState((currentState) =>
      addTask(currentState, creatingTaskColumnId, {
        title: taskDraft.title,
        description: taskDraft.description,
        dueDate: taskDraft.dueDate || null,
        priority: taskDraft.priority,
        labels: parseLabelsInput(taskDraft.labelsText),
      }),
    )

    handleCloseCreateTask()
  }

  return (
    <main className="mx-auto flex min-h-dvh w-[min(96vw,1760px)] max-w-none flex-col px-3 pb-20 pt-8 sm:px-5">
      <header className="mb-6 flex items-center gap-3">
        <BrandMark />
        <h1 className="page-title">{boardState.board.title}</h1>
      </header>

      <div className="mb-5">
        <AddColumnForm onAddColumn={handleAddColumn} />
      </div>

      <section className="command-bar mb-5">
        <div className="command-bar-search">
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search tasks, descriptions, and labels"
            aria-label="Search tasks"
          />
        </div>
        <div className="command-bar-labels" role="group" aria-label="Filter tasks by label">
          <button
            type="button"
            className={`label-filter-chip ${activeLabelFilter === 'all' ? 'label-filter-chip-active' : ''}`}
            onClick={() => setActiveLabelFilter('all')}
          >
            All
          </button>
          {availableLabels.map((label) => (
            <button
              key={label}
              type="button"
              className={`label-filter-chip ${activeLabelFilter === label ? 'label-filter-chip-active' : ''}`}
              onClick={() => setActiveLabelFilter(label)}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="command-bar-meta mr-5">
          Showing {visibleTaskCount} of {totalTaskCount} tasks
        </p>
      </section>

      <BoardView
        boardState={filteredBoardState}
        onMoveTask={handleMoveTask}
        onMoveColumn={handleMoveColumn}
        onAddTask={handleOpenCreateTask}
        onDeleteColumn={handleOpenDeleteColumn}
        onEditTask={handleOpenEditTask}
        onDeleteTask={handleOpenDeleteTask}
        onEditColumn={handleEditColumn}
      />

      <TaskModal
        isOpen={Boolean(deletingTask)}
        onClose={handleCloseDeleteTask}
        title="Delete Task"
        showCloseButton={false}
      >
        <div className="space-y-4">
          <p className="page-copy max-w-none text-sm">
            Delete &ldquo;{deletingTask?.title}&rdquo;? This cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button type="button" className="ghost-button" onClick={handleCloseDeleteTask}>
              Cancel
            </button>
            <Button type="button" onClick={handleDeleteTask}>
              Delete task
            </Button>
          </div>
        </div>
      </TaskModal>

      <TaskModal
        isOpen={Boolean(deletingColumn)}
        onClose={handleCloseDeleteColumn}
        title="Delete Column"
        showCloseButton={false}
      >
        <div className="space-y-4">
          <p className="page-copy max-w-none text-sm">
            Delete {deletingColumn?.title}? All tasks in this column will be removed.
          </p>
          <div className="flex justify-end gap-3">
            <button type="button" className="ghost-button" onClick={handleCloseDeleteColumn}>
              Cancel
            </button>
            <Button type="button" onClick={handleDeleteColumn}>
              Delete column
            </Button>
          </div>
        </div>
      </TaskModal>

      <TaskModal
        isOpen={Boolean(creatingTaskColumnId)}
        onClose={handleCloseCreateTask}
        title="New Task"
      >
        <form className="space-y-4" onSubmit={handleCreateTask}>
          <div className="space-y-1.5">
            <label className="field-label" htmlFor="create-task-title">
              Title
            </label>
            <Input
              id="create-task-title"
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
            <label className="field-label" htmlFor="create-task-description">
              Description
            </label>
            <textarea
              id="create-task-description"
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
            <label className="field-label" htmlFor="create-task-due-date">
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
          <div className="space-y-1.5">
            <label className="field-label" htmlFor="create-task-priority">
              Priority
            </label>
            <select
              id="create-task-priority"
              className="input"
              value={taskDraft.priority}
              onChange={(event) =>
                setTaskDraft((currentDraft) => ({
                  ...currentDraft,
                  priority: event.target.value,
                }))
              }
            >
              <option value="low">Easy</option>
              <option value="medium">Med</option>
              <option value="high">Hard</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="field-label" htmlFor="create-task-labels">
              Labels
            </label>
            <Input
              id="create-task-labels"
              value={taskDraft.labelsText}
              onChange={(event) =>
                setTaskDraft((currentDraft) => ({
                  ...currentDraft,
                  labelsText: event.target.value,
                }))
              }
              placeholder="frontend, bug, sprint"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="ghost-button" onClick={handleCloseCreateTask}>
              Cancel
            </button>
            <Button type="submit">Create task</Button>
          </div>
        </form>
      </TaskModal>

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
          <div className="space-y-1.5">
            <label className="field-label" htmlFor="task-priority">
              Priority
            </label>
            <select
              id="task-priority"
              className="input"
              value={taskDraft.priority}
              onChange={(event) =>
                setTaskDraft((currentDraft) => ({
                  ...currentDraft,
                  priority: event.target.value,
                }))
              }
            >
              <option value="low">Easy</option>
              <option value="medium">Med</option>
              <option value="high">Hard</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="field-label" htmlFor="task-labels">
              Labels
            </label>
            <Input
              id="task-labels"
              value={taskDraft.labelsText}
              onChange={(event) =>
                setTaskDraft((currentDraft) => ({
                  ...currentDraft,
                  labelsText: event.target.value,
                }))
              }
              placeholder="frontend, bug, sprint"
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
