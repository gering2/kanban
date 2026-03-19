import { TaskModal } from '../task/TaskModal'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { DatePicker } from '../../components/ui/DatePicker'

export function TaskModalManager({
  deletingTask,
  deletingColumn,
  creatingTaskColumnId,
  editingTask,
  taskDraft,
  setTaskDraft,
  handleCloseDeleteTask,
  handleDeleteTask,
  handleCloseDeleteColumn,
  handleDeleteColumn,
  handleCloseCreateTask,
  handleCreateTask,
  handleCloseEditTask,
  handleSaveTask,
}) {
  return <>
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
            <option value="low">Low</option>
            <option value="medium">Med</option>
            <option value="high">High</option>
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
  </>;
}