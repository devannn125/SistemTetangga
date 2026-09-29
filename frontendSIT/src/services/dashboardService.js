import { getAccessToken } from './authService'

let cache = null
let cacheAt = 0
let lastToken = null
let inflight = null
const TTL = 5 * 60 * 1000

export async function getDashboardData() {
  const token = getAccessToken()
  const now = Date.now()
  
  // Invalidate cache if token changed (e.g. from public to logged in)
  if (token !== lastToken) {
    cache = null
  }

  if (cache && now - cacheAt < TTL) return cache
  if (inflight) return inflight

  const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'
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
      lastToken = token
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
