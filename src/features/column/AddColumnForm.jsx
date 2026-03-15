import { useState } from 'react'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

export function AddColumnForm({ onAddColumn }) {
  const [newColumnTitle, setNewColumnTitle] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    onAddColumn(newColumnTitle)
    setNewColumnTitle('')
  }

  return (
    <form className="flex items-center gap-2" onSubmit={handleSubmit}>
      <Input
        value={newColumnTitle}
        onChange={(event) => setNewColumnTitle(event.target.value)}
        placeholder="New column"
        aria-label="New column"
        className="max-w-52"
      />
      <Button type="submit">Add column</Button>
    </form>
  )
}
