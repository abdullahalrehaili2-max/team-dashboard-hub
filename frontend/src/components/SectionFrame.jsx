import React, { useState } from 'react'
import { MoreVertical, Repeat2, Trash2, Sparkles, GripVertical } from 'lucide-react'
import IndicatorRenderer from './IndicatorRenderer.jsx'
import { useI18n } from '../hooks/useI18n.js'

export default function SectionFrame({ section, editMode = false, onDelete, onSwap, onSuggest, deltaData }) {
  const { t } = useI18n()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div
      className="relative h-full rounded-xl border overflow-hidden group"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      {/* Section title */}
      {section.title && (
        <div
          className="absolute top-0 inset-x-0 px-3 pt-2 pb-1 text-xs font-medium z-10"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {section.title}
        </div>
      )}

      {/* Edit mode overlay */}
      {editMode && (
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-20 rounded-xl pointer-events-none" />
      )}

      {/* Action menu (edit mode) */}
      {editMode && (
        <div className="absolute top-2 end-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-alt)]"
          >
            <MoreVertical size={14} />
          </button>
          {menuOpen && (
            <div
              className="absolute top-full mt-1 end-0 w-44 rounded-xl shadow-lg border py-1"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <button onClick={() => { onSwap?.(section); setMenuOpen(false) }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--color-surface-alt)]"
                style={{ color: 'var(--color-text)' }}>
                <Repeat2 size={14} /> {t('section.swap')}
              </button>
              <button onClick={() => { onSuggest?.(section); setMenuOpen(false) }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--color-surface-alt)]"
                style={{ color: 'var(--color-accent)' }}>
                <Sparkles size={14} /> {t('section.suggest')}
              </button>
              <button onClick={() => { onDelete?.(section.id); setMenuOpen(false) }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--color-surface-alt)]"
                style={{ color: 'var(--color-danger)' }}>
                <Trash2 size={14} /> {t('section.delete')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Indicator content */}
      <div className={`h-full ${section.title ? 'pt-7' : ''}`}>
        <IndicatorRenderer section={section} deltaData={deltaData} />
      </div>
    </div>
  )
}
