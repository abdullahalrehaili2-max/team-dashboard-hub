import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getShare } from '../api/dashboards.js'
import GridCanvas from '../components/GridCanvas.jsx'

export default function PublicView() {
  const { token } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getShare(token)
      .then(setData)
      .catch(e => setError(e.response?.data?.detail || 'Not found'))
      .finally(() => setLoading(false))
  }, [token])

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-primary)' }} /></div>
  if (error) return <div className="p-6 text-center text-lg" style={{ color: 'var(--color-danger)' }}>{error}</div>

  return (
    <div className="min-h-screen p-4 md:p-6" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-[1600px] mx-auto">
        <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>{data?.dashboard?.name}</h1>
        <GridCanvas sections={data?.sections || []} editMode={false} />
        <footer className="mt-8 text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
          Powered by Team Dashboard Hub
        </footer>
      </div>
    </div>
  )
}
