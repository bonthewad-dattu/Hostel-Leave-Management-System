export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export const isValidPhone = (phone) => {
  return /^[6-9]\d{9}$/.test(phone)
}

export const isValidCollegeRollNumber = (rollNumber) => {
  const normalized = String(rollNumber || '').trim().toUpperCase()
  const match = normalized.match(/^\d{2}[A-Z](\d{3})$/)
  return Boolean(match && Number(match[1]) >= 100)
}

export const isValidDateRange = (fromDate, toDate) => {
  if (!fromDate || !toDate) return false

  return new Date(toDate) >= new Date(fromDate)
}

export const isRequired = (value) => {
  return String(value ?? '').trim().length > 0
}
