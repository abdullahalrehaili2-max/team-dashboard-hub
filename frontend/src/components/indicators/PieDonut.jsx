import React from 'react'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const SAMPLE = [
  { name: 'Segment A', value: 42 },
  { name: 'Segment B', value: 28 },
  { name: 'Segment C', value: 18 },
  { name: 'Segment D', value: 12 },
]

const COLORS = ['var(--color-primary)', 'var(--color-accent)', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981']

export default function PieDonut({ config = {}, section }) {
  const data = config.categories || SAMPLE
  const innerRadius = config.inner_radius ?? 50
  const outerRadius = config.outer_radius ?? 75

  return (
    <motion.div className="h-full py-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={3}
            dataKey="value"
            isAnimationActive
          >
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip
            contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }}
            itemStyle={{ color: 'var(--color-text)' }}
          />
          {config.show_labels !== false && <Legend wrapperStyle={{ fontSize: 11 }} />}
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
