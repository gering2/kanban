export function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="modal-shell">
      <div className="modal-panel">
        <div className="flex items-center justify-between gap-4">
          <h2 className="modal-title">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="modal-close"
          >
            Close
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}
