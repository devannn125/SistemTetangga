import { request } from '../http'

export function getHouses(params = {}) {
  const query = new URLSearchParams(params).toString()
  return request(`/houses${query ? `?${query}` : ''}`)
}

export function createHouse(payload) {
  return request('/houses', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateHouse(id, payload) {
  return request(`/houses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function deleteHouse(id) {
  return request(`/houses/${id}`, { method: 'DELETE' })
}

export function getMyHouses() {
  return request('/houses/mine')
}

export function getWilayah(params = {}) {
  const query = new URLSearchParams(params).toString()
  return request(`/wilayah${query ? `?${query}` : ''}`)
}

export function getPublicWilayah(params = {}) {
  const query = new URLSearchParams(params).toString()
  return request(`/public/wilayah${query ? `?${query}` : ''}`)
}

export function createWilayah(payload) {
  return request('/wilayah', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}