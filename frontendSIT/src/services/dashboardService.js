import { getAccessToken } from './authService'

let cache = null
let cacheAt = 0
let inflight = null
const TTL = 5 * 60 * 1000

export async function getDashboardData() {
  const now = Date.now()
  if (cache && now - cacheAt < TTL) return cache
  if (inflight) return inflight

  const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'
  const token = getAccessToken()
  const url = `${apiUrl}/dashboard`

  inflight = (async () => {
    try {
      const headers = { Accept: 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`
      const response = await fetch(url, { headers })
      if (!response.ok) throw new Error('Gagal mengambil data dashboard: ' + response.status)
      const json = await response.json()
      cache = json
      cacheAt = Date.now()
      return json
    } catch (e) {
      if (cache) return cache
      throw e
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
