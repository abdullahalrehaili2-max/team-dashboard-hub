import React from 'react'
import { motion } from 'framer-motion'

export default function BulletChart({ config = {}, section }) {
  const value = config.value ?? 72
  const target = config.target ?? 100
  const ranges = config.ranges || [40, 70, 100]
  const max = Math.max(...ranges, value, target)

  const pct = (v) => (v / max) * 100

  return (
    <div className="flex flex-col justify-center h-full px-4 gap-3">
      <div className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{section?.title}</div>
      <div className="relative h-8">
        {/* Range bands */}
        {ranges.map((r, i) => (
          <div
            key={i}
            className="absolute inset-y-0 start-0 rounded"
            style={{
              width: `${pct(r)}%`,
              background: `rgba(65,55,168,${0.15 + i * 0.1})`,
            }}
          />
        ))}
        {/* Actual value bar */}
        <motion.div
          className="absolute inset-y-2 start-0 rounded"
          style={{ background: 'var(--color-accent)' }}
          initial={{ width: '0%' }}
          animate={{ width: `${pct(value)}%` }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />
        {/* Target line */}
        <div
          className="absolute inset-y-0.5 w-0.5 rounded"
          style={{ left: `${pct(target)}%`, background: 'var(--color-text)', opacity: 0.8 }}
        />
      </div>
      <div className="flex justify-between text-xs" style={{ color: 'var(--color-text-muted)' }}>
        <span>Actual: {value}</span>
        <span>Target: {target}</span>
      </div>
    </div>
  )
}
