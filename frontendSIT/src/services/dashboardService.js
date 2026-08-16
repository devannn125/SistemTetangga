import { dashboardData } from '../data/dashboardData'
import { getAuthData, getAuthRole } from './authService'

export async function getDashboardData() {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'
  const authUser = getAuthData()
  const authRole = getAuthRole()

  const params = new URLSearchParams()
  if (authRole) {
    params.append('role', authRole)
  }
  if (authUser?.id_users) {
    params.append('user_id', authUser.id_users)
  }

  const url = `${apiUrl}/dashboard${params.toString() ? '?' + params.toString() : ''}`

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'X-Role': authRole || '',
        'X-User-Id': authUser?.id_users || '',
      },
    })

    if (!response.ok) {
      throw new Error('Gagal mengambil data dashboard')
    }

    return response.json()
  } catch {
    return dashboardData
  }
}
