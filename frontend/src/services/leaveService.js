import api from './api'

export async function getLeaveRequests(params = {}) {
  const { data } = await api.get('/leaves', {
    params: { limit: 20, ...params },
  })
  return data
}

export async function getStudentLeaveRequests(params = {}) {
  return getLeaveRequests(params)
}

export async function getLeaveById(id) {
  const { data } = await api.get(`/leaves/${encodeURIComponent(id)}`)
  return data
}

export async function addLeaveRequest(request) {
  const { data } = await api.post('/leaves', request)
  return data.request
}

export async function updateLeaveRequest(id, updates) {
  const { data } = await api.put(`/leaves/${encodeURIComponent(id)}`, updates)
  return data.request
}

export async function deleteLeaveRequest(id) {
  const { data } = await api.delete(`/leaves/${encodeURIComponent(id)}`)
  return data.request
}

export async function addReviewComment(id, message) {
  const { data } = await api.post(
    `/leaves/${encodeURIComponent(id)}/comments`,
    { message },
  )
  return data.comment
}
