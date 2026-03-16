import { useEffect, useState } from 'react'
import { loadFromStorage, saveToStorage } from '../lib/storage'

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => loadFromStorage(key, initialValue))

  useEffect(() => {
    saveToStorage(key, value)
  }, [key, value])

  // Support functional updates like React's useState
  const setValueSafe = (updater) => {
    setValue((prev) => typeof updater === 'function' ? updater(prev) : updater)
  }

  return [value, setValueSafe]
}
