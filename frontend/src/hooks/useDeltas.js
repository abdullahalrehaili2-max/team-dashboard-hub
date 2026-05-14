import { useState, useEffect } from 'react'
import { getDeltas } from '../api/dashboards.js'

export function useDeltas(dashboardId, week, compareTo = 'lw') {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!dashboardId || !week) return
    setLoading(true)
    getDeltas(dashboardId, { week, compare_to: compareTo })
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [dashboardId, week, compareTo])

  return { data, loading, error }
}
