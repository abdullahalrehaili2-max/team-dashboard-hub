import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { useI18n } from '../hooks/useI18n.js'

export default function WhatChanged({ deltas }) {
  const { t } = useI18n()
  if (!deltas?.sections?.length) return null

  const changed = deltas.sections.flatMap(s =>
    s.fields.filter(f => f.delta != null && Math.abs(f.delta) > 0).map(f => ({ ...f, sectionTitle: s.section_title }))
  )

  if (!changed.length) return null

  return (
    <div
      className="rounded-xl p-4 mb-4 border"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-muted)' }}>
        {t('delta.vs_last_week')}
      </h3>
      <div className="flex flex-wrap gap-2">
        {changed.slice(0, 8).map((f, i) => {
          const isUp = f.trend === 'up'
          const color = f.color === 'green' ? 'var(--color-success)' : f.color === 'red' ? 'var(--color-danger)' : 'var(--color-text-muted)'
          return (
            <span
              key={i}
              className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
              style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}
            >
              {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {f.field_label || f.sectionTitle}
              {f.delta_pct != null && ` ${f.delta_pct > 0 ? '+' : ''}${f.delta_pct.toFixed(1)}%`}
            </span>
          )
        })}
      </div>
    </div>
  )
}
