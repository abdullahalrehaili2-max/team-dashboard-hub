import React, { useState } from 'react'
import { X } from 'lucide-react'
import { useI18n } from '../hooks/useI18n.js'
import { saveAsTemplate } from '../api/templates.js'

export default function SaveTemplateModal({ dashboardId, onClose, onSaved }) {
  const { t } = useI18n()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('General')
  const [visibility, setVisibility] = useState('team')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      const tpl = await saveAsTemplate(dashboardId, { name, description, category, visibility })
      onSaved?.(tpl)
      onClose?.()
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-2xl p-6 shadow-xl" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>{t('template.save_as')}</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-[var(--color-surface-alt)]"><X size={18} /></button>
        </div>
        <div className="flex flex-col gap-3">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Template name"
            className="w-full px-3 py-2 rounded-lg border text-sm"
            style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
          />
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Description"
            rows={2}
            className="w-full px-3 py-2 rounded-lg border text-sm resize-none"
            style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
          />
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border text-sm"
            style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
          >
            {['General', 'Executive', 'Sales', 'Marketing', 'Operations', 'Product'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 mt-4 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg" style={{ color: 'var(--color-text-muted)' }}>{t('common.cancel')}</button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="px-4 py-2 text-sm rounded-lg font-medium text-white"
            style={{ background: 'var(--color-primary)' }}
          >
            {saving ? t('entry.saving') : t('common.save')}
          </button>
        </div>
      </div>
    </div>
  )
}
