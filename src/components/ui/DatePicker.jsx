import { useEffect, useRef, useState } from 'react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/style.css'

function parseLocalDate(dateString) {
  if (!dateString) return undefined
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function toDateString(date) {
  if (!date) return ''
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function formatDisplay(date) {
  if (!date) return null
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

export function DatePicker({ value, onChange, placeholder = 'Pick a date' }) {
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef(null)
  const selected = parseLocalDate(value)

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  const handleSelect = (date) => {
    onChange(toDateString(date ?? null))
    if (date) setIsOpen(false)
  }

  const handleClear = (event) => {
    event.stopPropagation()
    onChange('')
  }

  return (
    <div ref={rootRef} className="date-picker-root">
      <button
        type="button"
        className={`date-picker-trigger ${value ? 'date-picker-trigger--filled' : ''}`}
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <svg className="date-picker-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="3" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
        <span>{selected ? formatDisplay(selected) : placeholder}</span>
        {value ? (
          <button
            type="button"
            className="date-picker-clear"
            onClick={handleClear}
            aria-label="Clear date"
          >
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        ) : null}
      </button>

      {isOpen ? (
        <div className="date-picker-popover" role="dialog" aria-label="Date picker">
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            defaultMonth={selected ?? new Date()}
            showOutsideDays
          />
        </div>
      ) : null}
    </div>
  )
}
