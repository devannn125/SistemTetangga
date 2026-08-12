import { dashboardData } from '../data/dashboardData'

export async function getDashboardData() {
  // BACKEND TODO:
  // Saat API sudah dibuat, ganti return data dummy ini dengan pemanggilan endpoint.
  // Contoh:
  // const response = await fetch(`${import.meta.env.VITE_API_URL}/dashboard`)
  // if (!response.ok) throw new Error('Gagal mengambil data dashboard')
  // return response.json()
  return dashboardData
}
