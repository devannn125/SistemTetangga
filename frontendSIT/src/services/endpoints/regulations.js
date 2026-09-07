import { request } from '../http'

export function getRegulations(params = {}) {
  const query = new URLSearchParams(params).toString()
  return request(`/regulations${query ? `?${query}` : ''}`)
}

export function createRegulation(payload) {
  return request('/regulations', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateRegulation(id, payload) {
  return request(`/regulations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function deleteRegulation(id) {
  return request(`/regulations/${id}`, {
    method: 'DELETE',
  })
}