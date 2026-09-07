import { request } from '../http'

export function getFinanceTransactions(params = {}) {
  const query = new URLSearchParams(params).toString()
  return request(`/finance-transactions${query ? `?${query}` : ''}`)
}

export function createFinanceTransaction(payload) {
  return request('/finance-transactions', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function deleteFinanceTransaction(id) {
  return request(`/finance-transactions/${id}`, {
    method: 'DELETE',
  })
}

export function getFeeBills(params = {}) {
  const query = new URLSearchParams(params).toString()
  return request(`/fee-bills${query ? `?${query}` : ''}`)
}

export function createFeeBill(payload) {
  return request('/fee-bills', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateFeeBill(id, payload) {
  return request(`/fee-bills/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function deleteFeeBill(id) {
  return request(`/fee-bills/${id}`, {
    method: 'DELETE',
  })
}