import { useEffect, useState } from 'react'
import { getDashboardData } from '../services/dashboardService'

export function useDashboardData({ enabled = true } = {}) {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(enabled)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false)
      return
    }
    let isMounted = true

    async function loadDashboard() {
      try {
        const result = await getDashboardData()
        if (isMounted) setData(result)
      } catch (loadError) {
        if (isMounted) setError(loadError)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadDashboard()
    return () => { isMounted = false }
  }, [enabled])

  return { data, isLoading, error }
}
