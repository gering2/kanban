const sizeClass = { sm: 'btn-sm', md: 'btn-md' }

export function Button({
  children,
  type = 'button',
  onClick,
  className = '',
  size = 'md',
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`btn ${sizeClass[size] ?? sizeClass.md} ${className}`}
    >
      {children}
    </button>
  )
}
