import React from 'react'
import { motion } from 'framer-motion'

export default function ProgressBar({ config = {}, section, deltaData }) {
  const field = deltaData?.fields?.[0]
  const value = field?.this_week ?? config.value ?? 0
  const max = config.max ?? 100
  const pct = Math.min(Math.max((value / max) * 100, 0), 100)
  const label = config.label || section?.title || ''
  const showPct = config.show_pct !== false

  const barColor = pct > 75 ? 'var(--color-success)' : pct > 40 ? 'var(--color-accent)' : 'var(--color-danger)'

  return (
    <div className="flex flex-col justify-center h-full px-2 gap-2">
      <div className="flex justify-between items-baseline">
        <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{label}</span>
        {showPct && (
          <span className="text-lg font-bold" style={{ color: barColor }}>{pct.toFixed(1)}%</span>
        )}
      </div>
      <div className="relative h-3 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: barColor }}
          initial={{ width: '0%' }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <div className="flex justify-between text-xs" style={{ color: 'var(--color-text-muted)' }}>
        <span>0</span>
        <span>{max?.toLocaleString?.() ?? max}</span>
      </div>
    </div>
  )
}
