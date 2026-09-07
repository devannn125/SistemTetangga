import { request } from '../http'

export function getSiskamlingSchedules(params = {}) {
  const query = new URLSearchParams(params).toString()
  return request(`/siskamling-schedules${query ? `?${query}` : ''}`)
}

export function createSiskamlingSchedule(payload) {
  return request('/siskamling-schedules', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateSiskamlingSchedule(id, payload) {
  return request(`/siskamling-schedules/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteSiskamlingSchedule(id) {
  return request(`/siskamling-schedules/${id}`, {
    method: 'DELETE',
  })
}

export function getSiskamlingIncidents(params = {}) {
  const query = new URLSearchParams(params).toString()
  return request(`/siskamling-incidents${query ? `?${query}` : ''}`)
}

export function createSiskamlingCheckin(data) {
  return request('/siskamling-checkins', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function getPosyanduSchedules(params = {}) {
  const query = new URLSearchParams(params).toString()
  return request(`/posyandu-schedules${query ? `?${query}` : ''}`)
}

export function createPosyanduSchedule(payload) {
  return request('/posyandu-schedules', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updatePosyanduSchedule(id, payload) {
  return request(`/posyandu-schedules/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deletePosyanduSchedule(id) {
  return request(`/posyandu-schedules/${id}`, {
    method: 'DELETE',
  })
}