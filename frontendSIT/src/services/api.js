import { getAccessToken } from './authService'

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request(path, options = {}) {
  const token = getAccessToken()

  const isFormData = options.body instanceof FormData;
  const headers = {
    Accept: 'application/json',
    ...(options.body && !isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })
  } catch {
    throw new ApiError('Tidak dapat terhubung ke server backend.')
  }

  if (!response.ok) {
    let message = `Permintaan gagal (HTTP ${response.status}).`
    try {
      const data = await response.json()
      if (data.message) message = data.message
      if (data.errors) {
        const first = Object.values(data.errors)[0]
        if (Array.isArray(first) && first[0]) message = first[0]
      }
    } catch {
      // body bukan JSON
    }
    throw new ApiError(message, response.status)
  }

  const contentType = response.headers.get('Content-Type') || ''
  if (contentType.includes('application/json')) {
    return response.json()
  }
  return response.text()
}

export function getCitizens(params = {}) {
  const query = new URLSearchParams(params).toString()
  return request(`/citizens${query ? `?${query}` : ''}`)
}

export function getCitizenMe() {
  return request('/citizens/me')
}

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

export function getWilayah(params = {}) {
  const query = new URLSearchParams(params).toString()
  return request(`/wilayah${query ? `?${query}` : ''}`)
}

export function createWilayah(payload) {
  return request('/wilayah', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getMyHouses() {
  return request('/houses/mine')
}

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

export function getFinanceTransactions(params = {}) {
  const query = new URLSearchParams(params).toString()
  return request(`/finance-transactions${query ? `?${query}` : ''}`)
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

export function getFamilies(params = {}) {
  const query = new URLSearchParams(params).toString()
  return request(`/families${query ? `?${query}` : ''}`)
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

export function updateHouse(id, payload) {
  return request(`/houses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

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

export function createFeedback(payload) {
  return request('/feedback', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

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

export function getOrganizationMembers(params = {}) {
  const query = new URLSearchParams(params).toString()
  return request(`/organization-members${query ? `?${query}` : ''}`)
}

export function getFeedback(params = {}) {
  const query = new URLSearchParams(params).toString()
  return request(`/feedback${query ? `?${query}` : ''}`)
}

export function getMasterData(params = {}) {
  const query = new URLSearchParams(params).toString()
  return request(`/master-data${query ? `?${query}` : ''}`)
}

export function getSiskamlingSchedules(params = {}) {
  const query = new URLSearchParams(params).toString()
  return request(`/siskamling-schedules${query ? `?${query}` : ''}`)
}

export function getSiskamlingIncidents(params = {}) {
  const query = new URLSearchParams(params).toString()
  return request(`/siskamling-incidents${query ? `?${query}` : ''}`)
}

export function getSiskamlingCheckins(params = {}) {
  const query = new URLSearchParams(params).toString()
  return request(`/siskamling-checkins${query ? `?${query}` : ''}`)
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

export function getStatistikSummary() {
  return request('/statistics/informasi')
}

export function getStatistikDetail(kode) {
  return request(`/statistics/informasi/${kode}`)
}

export function getStatistikKeluarga() {
  return request('/statistics/informasi/keluarga')
}

// --- ANNOUNCEMENT ---
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

export function updateAnnouncement(id, payload) {
  return request(`/announcements/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteAnnouncement(id) {
  return request(`/announcements/${id}`, {
    method: 'DELETE',
  })
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


// --- ADDED MISSING FUNCTIONS ---
export function deleteHouse(id) {
  return request(`/houses/${id}`, { method: 'DELETE' })
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

export function getDashboardStatistics() {
  return request(`/dashboard`)
}
export function createSiskamlingCheckin(data) {
  return request('/siskamling-checkins', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
