import React from 'react'
import { motion } from 'framer-motion'
import { RadarChart, Radar as ReRadar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, ResponsiveContainer } from 'recharts'

const SAMPLE = [
  { metric: 'Quality', value: 85 },
  { metric: 'Speed', value: 72 },
  { metric: 'Cost', value: 68 },
  { metric: 'Support', value: 90 },
  { metric: 'Innovation', value: 78 },
  { metric: 'Reliability', value: 88 },
]

export default function Radar({ config = {}, section }) {
  const data = config.categories || SAMPLE
  return (
    <motion.div className="h-full py-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke="var(--color-border)" />
          <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
          <PolarRadiusAxis angle={30} tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} />
          <Tooltip
            contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }}
            itemStyle={{ color: 'var(--color-text)' }}
          />
          <ReRadar
            dataKey="value"
            stroke="var(--color-accent)"
            fill="var(--color-accent)"
            fillOpacity={config.filled !== false ? 0.2 : 0}
            strokeWidth={config.stroke_width || 2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
