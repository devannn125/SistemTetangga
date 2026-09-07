import { request } from '../http'

export function getGuests(params = {}) {
  const query = new URLSearchParams(params).toString()
  return request(`/guests${query ? `?${query}` : ''}`)
}

export function createGuest(payload) {
  return request('/guests', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateGuest(id, payload) {
  return request(`/guests/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function getComplaints(params = {}) {
  const query = new URLSearchParams(params).toString()
  return request(`/complaints${query ? `?${query}` : ''}`)
}

export function createComplaint(payload) {
  return request('/complaints', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateComplaint(id, payload) {
  return request(`/complaints/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}