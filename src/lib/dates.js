export function formatShortDate(isoDate) {
  if (!isoDate) {
    return ''
  }

  const date = new Date(isoDate)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date)
}
