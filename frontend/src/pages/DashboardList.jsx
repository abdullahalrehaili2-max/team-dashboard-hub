import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, LayoutDashboard, Trash2, Edit, Eye } from 'lucide-react'
import { useI18n } from '../hooks/useI18n.js'
import { listDashboards, createDashboard, deleteDashboard } from '../api/dashboards.js'
import { format } from 'date-fns'

export default function DashboardList() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [dashboards, setDashboards] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    listDashboards().then(setDashboards).finally(() => setLoading(false))
  }, [])

  const handleCreate = async () => {
    if (!newName.trim()) return
    setCreating(true)
    try {
      const d = await createDashboard({ name: newName })
      setDashboards(prev => [d, ...prev])
      setNewName('')
      setShowCreate(false)
      navigate(`/dashboards/${d.id}`)
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm(t('common.confirm') + '?')) return
    await deleteDashboard(id)
    setDashboards(prev => prev.filter(d => d.id !== id))
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{t('nav.dashboards')}</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>{dashboards.length} dashboards</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white"
          style={{ background: 'var(--color-primary)' }}
        >
          <Plus size={16} /> {t('dashboard.new')}
        </button>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <motion.div
            className="w-full max-w-sm rounded-2xl p-6 shadow-xl"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--color-text)' }}>{t('dashboard.new')}</h2>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              placeholder={t('dashboard.name')}
              autoFocus
              className="w-full px-3 py-2.5 rounded-xl text-sm mb-4"
              style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm rounded-xl" style={{ color: 'var(--color-text-muted)' }}>
                {t('common.cancel')}
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !newName.trim()}
                className="px-4 py-2 text-sm font-medium rounded-xl text-white disabled:opacity-60"
                style={{ background: 'var(--color-primary)' }}
              >
                {creating ? t('common.loading') : t('dashboard.create')}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-primary)' }} />
        </div>
      ) : dashboards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <LayoutDashboard size={48} style={{ color: 'var(--color-text-muted)', opacity: 0.3 }} />
          <p className="text-lg" style={{ color: 'var(--color-text-muted)' }}>{t('dashboard.no_dashboards')}</p>
          <button onClick={() => setShowCreate(true)} className="px-4 py-2 rounded-xl text-sm font-medium text-white" style={{ background: 'var(--color-primary)' }}>
            {t('dashboard.create_first')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {dashboards.map((d, i) => (
            <motion.div
              key={d.id}
              className="rounded-2xl p-5 border cursor-pointer group hover:border-[var(--color-primary)] transition-all"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              onClick={() => navigate(`/dashboards/${d.id}`)}
            >
              <div className="w-10 h-10 rounded-xl mb-3 flex items-center justify-center" style={{ background: 'var(--color-primary)22' }}>
                <LayoutDashboard size={20} style={{ color: 'var(--color-primary)' }} />
              </div>
              <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--color-text)' }}>{d.name}</h3>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {d.created_at ? format(new Date(d.created_at), 'MMM d, yyyy') : ''}
              </p>
              <div className="flex gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                <button onClick={() => navigate(`/dashboards/${d.id}`)} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-alt)]" style={{ color: 'var(--color-text-muted)' }}><Eye size={14} /></button>
                <button onClick={() => navigate(`/dashboards/${d.id}/edit`)} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-alt)]" style={{ color: 'var(--color-text-muted)' }}><Edit size={14} /></button>
                <button onClick={() => handleDelete(d.id)} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-alt)]" style={{ color: 'var(--color-danger)' }}><Trash2 size={14} /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
