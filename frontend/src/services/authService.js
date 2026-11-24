import api from './api'

const USER_KEY = 'hostelUser'
const TOKEN_KEY = 'hostelToken'

function saveSession({ user, token }) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  localStorage.setItem(TOKEN_KEY, token)
  return user
}

export async function registerUser(userData) {
  const { data } = await api.post('/auth/register', userData)
  return saveSession(data)
}

export async function loginUser(credentials) {
  const { data } = await api.post('/auth/login', credentials)
  return saveSession(data)
}

export async function fetchCurrentUser() {
  const { data } = await api.get('/auth/me')
  localStorage.setItem(USER_KEY, JSON.stringify(data.user))
  return data.user
}

export async function updateCurrentUser(updates) {
  const { data } = await api.put('/auth/me', updates)
  localStorage.setItem(USER_KEY, JSON.stringify(data.user))
  return data.user
}

export function getCurrentUser() {
  try {
    const user = JSON.parse(localStorage.getItem(USER_KEY))
    return user && localStorage.getItem(TOKEN_KEY) ? user : null
  } catch {
    return null
  }
}

export function hasAuthToken() {
  return Boolean(localStorage.getItem(TOKEN_KEY))
}

export function clearCurrentUser() {
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(TOKEN_KEY)
}
