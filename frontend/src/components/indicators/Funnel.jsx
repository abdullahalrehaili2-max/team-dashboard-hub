import React from 'react'
import { motion } from 'framer-motion'

const SAMPLE = [
  { name: 'Leads', value: 1000 },
  { name: 'Qualified', value: 600 },
  { name: 'Proposal', value: 300 },
  { name: 'Negotiation', value: 150 },
  { name: 'Closed Won', value: 80 },
]

const COLORS = ['var(--color-primary)', '#5b4ec4', '#7163d9', '#8878ee', '#27CED7']

export default function Funnel({ config = {}, section }) {
  const data = config.stages || SAMPLE
  const max = data[0]?.value || 1

  return (
    <div className="flex flex-col justify-center h-full px-2 gap-1">
      {data.map((stage, i) => {
        const widthPct = (stage.value / max) * 100
        const convPct = i > 0 ? ((stage.value / data[i - 1].value) * 100).toFixed(0) : null
        return (
          <div key={i} className="flex items-center gap-2">
            <div className="w-24 text-xs text-end" style={{ color: 'var(--color-text-muted)' }}>{stage.name}</div>
            <div className="flex-1 relative h-6 flex items-center">
              <motion.div
                className="absolute h-full rounded"
                style={{ background: COLORS[i % COLORS.length], left: `${(100 - widthPct) / 2}%` }}
                initial={{ width: '0%' }}
                animate={{ width: `${widthPct}%` }}
                transition={{ duration: 0.6, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              />
              <span className="relative z-10 text-xs font-bold mx-auto" style={{ color: 'var(--color-text)' }}>
                {config.show_values !== false && stage.value.toLocaleString()}
                {config.show_pct !== false && convPct && ` (${convPct}%)`}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
