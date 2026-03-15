export function ColumnHeader({ title, taskCount, dragHandle }) {
  return (
    <header className="mb-4 flex items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-1.5">
        {dragHandle}
        <h2 className="column-title min-w-0 truncate">{title}</h2>
      </div>
      <span className="count-pill flex-shrink-0">{taskCount}</span>
    </header>
  )
}
