import { useEffect, useState } from 'react'
import { getDashboardData } from '../services/dashboardService'

export function useDashboardData() {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadDashboard() {
      try {
        // BACKEND TODO:
        // Semua komponen dashboard membaca data dari hook ini.
        // Kalau backend sudah siap, cukup update getDashboardData() di services/dashboardService.js.
        const result = await getDashboardData()

        if (isMounted) {
          setData(result)
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadDashboard()

    return () => {
      isMounted = false
    }
  }, [])

  return { data, isLoading, error }
}
