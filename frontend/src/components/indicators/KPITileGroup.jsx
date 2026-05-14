import React from 'react'
import { motion } from 'framer-motion'
import DeltaBadge from '../DeltaBadge.jsx'

const SAMPLE = [
  { label: 'Revenue', value: '1.2M', delta: 5.2, color: 'green' },
  { label: 'Users', value: '84.2K', delta: -2.1, color: 'red' },
  { label: 'NPS', value: '72', delta: 3.0, color: 'green' },
]

export default function KPITileGroup({ config = {}, section, deltaData }) {
  const items = config.items || SAMPLE
  const cols = config.columns || 3

  return (
    <div
      className="h-full grid gap-2 p-1"
      style={{ gridTemplateColumns: `repeat(${Math.min(cols, items.length)}, 1fr)` }}
    >
      {items.map((item, i) => (
        <motion.div
          key={i}
          className="flex flex-col justify-center items-center p-2 rounded-lg"
          style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)' }}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
        >
          <div className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>{item.label}</div>
          <div className="text-xl font-bold leading-none" style={{ color: 'var(--color-text)' }}>{item.value}</div>
          {item.delta != null && <DeltaBadge delta={item.delta} color={item.color || 'neutral'} showPct={false} />}
        </motion.div>
      ))}
    </div>
  )
}
