import { request } from '../http'

export function getLetterRequests(params = {}) {
  const query = new URLSearchParams(params).toString()
  return request(`/letter-requests${query ? `?${query}` : ''}`)
}

export function createLetterRequest(payload) {
  return request('/letter-requests', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateLetterRequest(id, payload) {
  return request(`/letter-requests/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function getFeedback(params = {}) {
  const query = new URLSearchParams(params).toString()
  return request(`/feedback${query ? `?${query}` : ''}`)
}

export function createFeedback(payload) {
  return request('/feedback', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}