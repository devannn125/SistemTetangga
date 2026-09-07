import { request } from '../http'

export function getInventoryPurchases(params = {}) {
  const query = new URLSearchParams(params).toString()
  return request(`/inventory-purchases${query ? `?${query}` : ''}`)
}

export function createInventoryPurchase(payload) {
  return request('/inventory-purchases', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateInventoryPurchase(id, payload) {
  return request(`/inventory-purchases/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}