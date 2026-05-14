import React from 'react'
import { motion } from 'framer-motion'
import DeltaBadge from '../DeltaBadge.jsx'

function fmt(val) {
  if (val == null) return '—'
  if (val >= 1e9) return `${(val / 1e9).toFixed(2)}B`
  if (val >= 1e6) return `${(val / 1e6).toFixed(1)}M`
  if (val >= 1e3) return `${(val / 1e3).toFixed(1)}K`
  return typeof val === 'number' ? val.toLocaleString() : val
}

export default function BigStatHero({ config = {}, section, deltaData }) {
  const field = deltaData?.fields?.[0]
  const value = field?.this_week ?? config.value
  const delta = field?.delta
  const deltaPct = field?.delta_pct
  const color = field?.color || 'neutral'

  return (
    <motion.div
      className="flex flex-col items-center justify-center h-full gap-2 text-center"
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="text-xs uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
        {section?.title || config.label || ''}
      </div>
      <div
        className="font-black leading-none"
        style={{
          fontSize: 'clamp(2.5rem, 5vw, 5rem)',
          color: 'var(--color-accent)',
          fontFamily: 'var(--font-heading)',
          textShadow: '0 0 40px var(--color-accent)44',
        }}
      >
        {fmt(value)}
      </div>
      {config.subtitle && <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{config.subtitle}</div>}
      {delta != null && <DeltaBadge delta={delta} deltaPct={deltaPct} color={color} />}
    </motion.div>
  )
}
