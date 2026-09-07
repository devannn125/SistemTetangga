import { request } from '../http'

export function getCitizens(params = {}) {
  const query = new URLSearchParams(params).toString()
  return request(`/citizens${query ? `?${query}` : ''}`)
}

export function getCitizenMe() {
  return request('/citizens/me')
}

export function changePassword(payload) {
  return request('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function createCitizen(payload) {
  return request('/citizens', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateCitizen(id, payload) {
  return request(`/citizens/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function getFamilies(params = {}) {
  const query = new URLSearchParams(params).toString()
  return request(`/families${query ? `?${query}` : ''}`)
}

export function createFamily(payload) {
  return request('/families', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateFamily(id, payload) {
  return request(`/families/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}