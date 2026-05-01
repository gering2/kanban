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
import { BoardSearchBar } from './BoardSearchBar'
import { BoardLabelFilter } from './BoardLabelFilter'
import { TaskModalManager } from './TaskModalManager'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { BackgroundArt } from '../../components/ui/BackgroundArt'

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
    <>
    <BackgroundArt />
    <main className="mx-auto flex min-h-dvh w-full max-w-[1360px] flex-col px-4 pt-8 pb-6 sm:px-6 lg:px-8" style={{ position: 'relative', zIndex: 1 }}>
      <div className="command-bar mb-5">
        <BrandMark />
        <BoardSearchBar value={searchQuery} onChange={setSearchQuery} />
        <BoardLabelFilter
          labels={availableLabels}
          activeLabel={activeLabelFilter}
          onChange={setActiveLabelFilter}
        />
        <AddColumnForm onAddColumn={handleAddColumn} />
        <p className="command-bar-meta">
          Showing {visibleTaskCount} of {totalTaskCount} tasks
        </p>
      </div>

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

      <TaskModalManager
        deletingTask={deletingTask}
        deletingColumn={deletingColumn}
        creatingTaskColumnId={creatingTaskColumnId}
        editingTask={editingTask}
        taskDraft={taskDraft}
        setTaskDraft={setTaskDraft}
        handleCloseDeleteTask={handleCloseDeleteTask}
        handleDeleteTask={handleDeleteTask}
        handleCloseDeleteColumn={handleCloseDeleteColumn}
        handleDeleteColumn={handleDeleteColumn}
        handleCloseCreateTask={handleCloseCreateTask}
        handleCreateTask={handleCreateTask}
        handleCloseEditTask={handleCloseEditTask}
        handleSaveTask={handleSaveTask}
      />
    </main>
    </>
  )
}
