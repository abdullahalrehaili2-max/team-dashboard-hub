import React from 'react'
import { LayoutGrid, BookOpen, AlignJustify, Monitor } from 'lucide-react'
import { useI18n } from '../hooks/useI18n.js'

const modes = [
  { id: 'grid', icon: <LayoutGrid size={16} />, labelKey: 'view_mode.grid' },
  { id: 'story', icon: <BookOpen size={16} />, labelKey: 'view_mode.story' },
  { id: 'compact', icon: <AlignJustify size={16} />, labelKey: 'view_mode.compact' },
  { id: 'presentation', icon: <Monitor size={16} />, labelKey: 'view_mode.presentation' },
]

export default function ViewModeSwitcher({ mode, onChange }) {
  const { t } = useI18n()
  return (
    <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'var(--color-surface-alt)' }}>
      {modes.map(m => (
        <button
          key={m.id}
          onClick={() => onChange(m.id)}
          title={t(m.labelKey)}
          className={`p-2 rounded-lg transition-all text-sm flex items-center gap-1 ${
            mode === m.id
              ? 'bg-[var(--color-primary)] text-white shadow-sm'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          {m.icon}
        </button>
      ))}
    </div>
  )
}
