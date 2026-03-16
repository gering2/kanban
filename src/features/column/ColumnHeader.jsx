import {useState} from 'react'
export function ColumnHeader({ id,title, taskCount, dragHandle, deleteAction, onEditColumn }) {
  const [editValue, setEditValue] = useState(null)
  const [isEditing, setIsEditing] = useState(false)


  const handleBlur = (e) => {
    setIsEditing(false);
    if (typeof onEditColumn === 'function') {
      onEditColumn(id, e.target.value)
    }
    setEditValue(null)
  }

  const handleKeyDown = (e) => {
    if(e.key === "Enter") {
      handleBlur(e)
    }
  }
  return (
    <header className="mb-3 flex items-center justify-between gap-2 border-b border-[color:var(--border)] pb-3">
      <div className="flex min-w-0 items-center gap-1.5">
        {dragHandle}
        {
          isEditing ?    
          <input 
            value={editValue === null ? title : editValue}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onChange={(e) => setEditValue(e.target.value)}
            autoFocus 
            className="input column-title min-w-0 truncate" />  : 
          <h2 onClick={() => { setIsEditing(true); setEditValue(title); }} className="column-title min-w-0 truncate">{title}</h2> 
        }
      </div>
      <div className="flex items-center gap-2">
        <span className="count-pill flex-shrink-0">{taskCount}</span>
        {deleteAction}
      </div>
    </header>
  )
}
