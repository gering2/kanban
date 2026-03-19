import { EditableText } from '../../components/ui/EditableText';

export function ColumnHeader({ id, title, taskCount, dragHandle, deleteAction, onEditColumn }) {
  return (
    <header className="mb-3 flex items-center justify-between gap-2 border-b border-[color:var(--border)] pb-3">
      <div className="flex min-w-0 items-center gap-1.5">
        {dragHandle}
        <EditableText
          value={title}
          onSave={newTitle => onEditColumn(id, newTitle)}
          as="h2"
          className="column-title min-w-0 truncate"
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="count-pill flex-shrink-0">{taskCount}</span>
        {deleteAction}
      </div>
    </header>
  );
}
