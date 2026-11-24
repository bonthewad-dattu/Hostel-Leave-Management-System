import api from './api'

export async function getDashboardSummary() {
  const { data } = await api.get('/dashboard/summary')
  return data
}

export async function getUsers(params = {}) {
  const { data } = await api.get('/users', {
    params: { limit: 20, ...params },
  })
  return data
}

export async function createUser(user) {
  const { data } = await api.post('/users', user)
  return data.user
}

export async function updateUser(id, updates) {
  const { data } = await api.put(`/users/${encodeURIComponent(id)}`, updates)
  return data.user
}

export async function getHostels(params = {}) {
  const { data } = await api.get('/hostels', { params })
  return data.items
}

export async function createHostel(hostel) {
  const { data } = await api.post('/hostels', hostel)
  return data.hostel
}

export async function updateHostel(id, updates) {
  const { data } = await api.put(`/hostels/${encodeURIComponent(id)}`, updates)
  return data.hostel
}

export async function deactivateHostel(id) {
  await api.delete(`/hostels/${encodeURIComponent(id)}`)
}

export async function reactivateHostel(id) {
  const { data } = await api.post(`/hostels/${encodeURIComponent(id)}/reactivate`)
  return data.hostel
}
