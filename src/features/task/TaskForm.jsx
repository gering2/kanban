import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

export function TaskForm({ value, onChange, onSubmit, submitLabel = 'Add task' }) {
  return (
    <form className="mt-3 flex gap-2" onSubmit={onSubmit}>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Write task title..."
        aria-label="Task title"
      />
      <Button type="submit">{submitLabel}</Button>
    </form>
  )
}
