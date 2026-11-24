export const formatDate = (date) => {
  if (!date) return '—'

  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export const getLeaveDays = (fromDate, toDate) => {
  if (!fromDate || !toDate) return 0

  const start = new Date(fromDate)
  const end = new Date(toDate)

  const difference = end - start

  return Math.floor(difference / (1000 * 60 * 60 * 24)) + 1
}
