import { getAccessToken } from './authService'

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function request(path, options = {}) {
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