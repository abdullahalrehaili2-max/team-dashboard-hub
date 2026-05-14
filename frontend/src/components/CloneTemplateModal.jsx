import React, { useState } from 'react'
import { X } from 'lucide-react'
import { useI18n } from '../hooks/useI18n.js'
import { cloneTemplate } from '../api/templates.js'
import { useNavigate } from 'react-router-dom'

export default function CloneTemplateModal({ template, onClose }) {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [name, setName] = useState(`${template?.name} (Copy)`)
  const [cloning, setCloning] = useState(false)

  const handleClone = async () => {
    setCloning(true)
    try {
      const result = await cloneTemplate(template.id, name)
      onClose?.()
      navigate(`/dashboards/${result.dashboard_id}`)
    } catch (e) {
      console.error(e)
    } finally {
      setCloning(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-sm rounded-2xl p-6 shadow-xl" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>{t('template.clone')}</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-[var(--color-surface-alt)]"><X size={18} /></button>
        </div>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border text-sm mb-4"
          style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
        />
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg" style={{ color: 'var(--color-text-muted)' }}>{t('common.cancel')}</button>
          <button
            onClick={handleClone}
            disabled={cloning}
            className="px-4 py-2 text-sm rounded-lg font-medium text-white"
            style={{ background: 'var(--color-accent)', color: '#0f0e1c' }}
          >
            {cloning ? t('common.loading') : t('template.clone')}
          </button>
        </div>
      </div>
    </div>
  )
}
