import { dashboardData } from '../data/dashboardData'
import { getAuthData, getAuthRole } from './authService'

let cache = null
let cacheAt = 0
let inflight = null
const TTL = 5 * 60 * 1000

export async function getDashboardData() {
  const now = Date.now()
  if (cache && now - cacheAt < TTL) return cache
  if (inflight) return inflight

  const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'
  const authUser = getAuthData()
  const authRole = getAuthRole()

  const params = new URLSearchParams()
  if (authRole) params.append('role', authRole)
  if (authUser?.id_users) params.append('user_id', authUser.id_users)

  const url = `${apiUrl}/dashboard${params.toString() ? '?' + params.toString() : ''}`

  inflight = (async () => {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'X-Role': authRole || '',
          'X-User-Id': authUser?.id_users || '',
        },
      })
      if (!response.ok) throw new Error('Gagal mengambil data dashboard')
      const json = await response.json()
      cache = json
      cacheAt = Date.now()
      return json
    } catch {
      return cache || dashboardData
    } finally {
      inflight = null
    }
  })()

  return inflight
}

export function clearDashboardCache() {
  cache = null
  cacheAt = 0
  inflight = null
}
