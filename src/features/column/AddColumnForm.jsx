import { useState } from 'react'
import { Input } from '../../components/ui/Input'

export function AddColumnForm({ onAddColumn }) {
  const [newColumnTitle, setNewColumnTitle] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    const cleanTitle = newColumnTitle.trim()

    if (!cleanTitle) {
      return
    }

    onAddColumn(cleanTitle)
    setNewColumnTitle('')
  }

  return (
    <form className="add-column-inline" onSubmit={handleSubmit}>
      <Input
        value={newColumnTitle}
        onChange={(event) => setNewColumnTitle(event.target.value)}
        placeholder="New column"
        aria-label="New column"
        className="w-full"
      />
    </form>
  )
}
