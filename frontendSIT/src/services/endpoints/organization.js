import { request } from '../http'

export function getOrganizationMembers(params = {}) {
  const query = new URLSearchParams(params).toString()
  return request(`/organization-members${query ? `?${query}` : ''}`)
}

export function getPublicOrganizationMembers(params = {}) {
  const query = new URLSearchParams(params).toString()
  return request(`/public/organization-members${query ? `?${query}` : ''}`)
}

export function createOrganizationMember(payload) {
  if (payload instanceof FormData) {
    return request('/organization-members', { method: 'POST', body: payload })
  }
  return request('/organization-members', { method: 'POST', body: JSON.stringify(payload) })
}

export function deleteOrganizationMember(id) {
  return request(`/organization-members/${id}`, { method: 'DELETE' })
}

export function createStrukturPengurus(payload) {
  return request('/struktur/pengurus', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getUsers(params = {}) {
  const query = new URLSearchParams(params).toString()
  return request(`/users${query ? `?${query}` : ''}`)
}

export function updateUser(id, payload) {
  return request(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function assignUserRole(id, roleKode) {
  return request(`/users/${id}/role`, {
    method: 'POST',
    body: JSON.stringify({ role: roleKode }),
  })
}

export function getMasterData(params = {}) {
  const query = new URLSearchParams(params).toString()
  return request(`/master-data${query ? `?${query}` : ''}`)
}