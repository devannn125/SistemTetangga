import { request } from '../http'

export function getAnnouncements(params = {}) {
  const query = new URLSearchParams(params).toString()
  return request(`/announcements${query ? `?${query}` : ''}`)
}

export function createAnnouncement(payload) {
  return request('/announcements', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}