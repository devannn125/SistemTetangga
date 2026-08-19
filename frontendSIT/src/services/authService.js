export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

export async function login({ identifier, password }) {
  const payload = {
    identifier: identifier.trim(),
    password,
  }

  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok) {
      // Extract validation or business error message
      const errorMessage =
        data.errors?.identifier?.[0] ||
        data.errors?.role?.[0] ||
        data.errors?.password?.[0] ||
        data.message ||
        'Gagal melakukan login. Silakan periksa kembali data Anda.'

      throw new Error(errorMessage)
    }

    return data
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Tidak dapat terhubung ke server backend. Pastikan server backend sedang berjalan di port 8000.', {
        cause: error,
      })
    }
    throw error
  }
}

export function setAuthData(authResponse) {
  if (!authResponse) return

  const user = authResponse.data || authResponse
  localStorage.setItem('authUser', JSON.stringify(user))
  localStorage.setItem('authRole', user.role?.kode || user.role || '')
  localStorage.setItem('authNik', user.id_citizen || user.nik || user.id_users || '')
  if (authResponse.access_token) {
    localStorage.setItem('authToken', authResponse.access_token)
  }
}

export function getAccessToken() {
  return localStorage.getItem('authToken') || ''
}

export function getAuthData() {
  const raw = localStorage.getItem('authUser')
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function getAuthRole() {
  return localStorage.getItem('authRole') || ''
}

export function clearAuthData() {
  localStorage.removeItem('authUser')
  localStorage.removeItem('authRole')
  localStorage.removeItem('authNik')
  localStorage.removeItem('authToken')
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem('authRole') || localStorage.getItem('authUser'))
}
