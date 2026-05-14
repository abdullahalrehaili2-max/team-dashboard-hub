import React from 'react'
import { motion } from 'framer-motion'

export default function Gauge({ config = {}, section, deltaData }) {
  const field = deltaData?.fields?.[0]
  const value = field?.this_week ?? config.value ?? 0
  const max = config.max ?? 100
  const pct = Math.min(Math.max(value / max, 0), 1)
  const angle = pct * 180 - 90 // -90 to 90 degrees

  const R = 70
  const cx = 90, cy = 85
  const arcStart = { x: cx - R, y: cy }
  const arcEnd = { x: cx + R, y: cy }
  const toRad = (deg) => (deg * Math.PI) / 180
  const needleX = cx + R * 0.7 * Math.cos(toRad(angle - 180))
  const needleY = cy + R * 0.7 * Math.sin(toRad(angle - 180))

  const colorVal = pct > 0.75 ? 'var(--color-success)' : pct > 0.4 ? 'var(--color-accent)' : 'var(--color-danger)'

  return (
    <motion.div
      className="flex flex-col items-center justify-center h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <svg viewBox="0 0 180 100" className="w-full max-w-[180px]">
        {/* Background arc */}
        <path d={`M ${arcStart.x} ${cy} A ${R} ${R} 0 0 1 ${arcEnd.x} ${cy}`}
          fill="none" stroke="var(--color-border)" strokeWidth="12" strokeLinecap="round" />
        {/* Value arc */}
        <motion.path
          d={`M ${arcStart.x} ${cy} A ${R} ${R} 0 0 1 ${arcEnd.x} ${cy}`}
          fill="none"
          stroke={colorVal}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${pct * Math.PI * R} ${Math.PI * R}`}
          initial={{ strokeDasharray: `0 ${Math.PI * R}` }}
          animate={{ strokeDasharray: `${pct * Math.PI * R} ${Math.PI * R}` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        {/* Needle */}
        <line x1={cx} y1={cy} x2={needleX} y2={needleY}
          stroke="var(--color-text)" strokeWidth="2" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="4" fill="var(--color-text)" />
        {/* Value text */}
        <text x={cx} y={cy - 8} textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--color-text)">
          {value?.toLocaleString?.() ?? value}
        </text>
      </svg>
      <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{section?.title}</div>
    </motion.div>
  )
}
