import api from './api'

export async function getActiveHostelOptions() {
  const { data } = await api.get('/hostels/options')
  return data.items
}
