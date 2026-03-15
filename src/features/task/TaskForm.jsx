export function TaskForm({ onOpen }) {
  return (
    <button type="button" className="add-task-trigger mt-3" onClick={onOpen}>
      <span className="add-task-trigger-icon" aria-hidden="true">+</span>
      <span>Add task</span>
    </button>
  )
}
