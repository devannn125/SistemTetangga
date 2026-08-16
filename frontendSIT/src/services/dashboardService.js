import { dashboardData } from '../data/dashboardData'

export async function getDashboardData() {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

  try {
    const response = await fetch(`${apiUrl}/dashboard`, {
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
      throw new Error('Gagal mengambil data dashboard')
    }

    return response.json()
  } catch {
    return dashboardData
  }
}
