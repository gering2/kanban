export function DragDots({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <circle cx="9" cy="6.5" r="1.2" />
      <circle cx="15" cy="6.5" r="1.2" />
      <circle cx="9" cy="12" r="1.2" />
      <circle cx="15" cy="12" r="1.2" />
      <circle cx="9" cy="17.5" r="1.2" />
      <circle cx="15" cy="17.5" r="1.2" />
    </svg>
  )
}
