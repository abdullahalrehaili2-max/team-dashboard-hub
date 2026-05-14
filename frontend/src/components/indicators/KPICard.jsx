import React from 'react'
import { motion } from 'framer-motion'
import DeltaBadge from '../DeltaBadge.jsx'

function formatValue(val, dataType) {
  if (val == null) return '—'
  if (dataType === 'currency') return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(val)
  if (dataType === 'percent') return `${val.toFixed(1)}%`
  if (val >= 1e6) return `${(val / 1e6).toFixed(1)}M`
  if (val >= 1e3) return `${(val / 1e3).toFixed(1)}K`
  return val.toLocaleString('ar-SA')
}

export default function KPICard({ config = {}, section, deltaData }) {
  const field = deltaData?.fields?.[0]
  const value = field?.this_week ?? config.value
  const delta = field?.delta
  const deltaPct = field?.delta_pct
  const color = field?.color || 'neutral'
  const dataType = config.dataType || 'number'

  return (
    <motion.div
      className="flex flex-col justify-center h-full p-3"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>
        {section?.title || config.label || ''}
      </div>
      <div className="text-3xl font-bold leading-none mb-2" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}>
        {formatValue(value, dataType)}
      </div>
      {config.show_delta !== false && (delta != null) && (
        <DeltaBadge delta={delta} deltaPct={deltaPct} color={color} />
      )}
      {config.unit && (
        <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{config.unit}</div>
      )}
    </motion.div>
  )
}
