import React from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const SAMPLE = [
  { name: 'Category A', value: 420 },
  { name: 'Category B', value: 350 },
  { name: 'Category C', value: 280 },
  { name: 'Category D', value: 210 },
  { name: 'Category E', value: 150 },
]

export default function HorizontalBar({ config = {}, section }) {
  const data = config.categories || SAMPLE
  const colors = ['var(--color-primary)', 'var(--color-accent)', '#8b5cf6', '#06b6d4', '#f59e0b']

  return (
    <motion.div className="h-full py-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical">
          <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} width={90} />
          <Tooltip
            contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }}
            itemStyle={{ color: 'var(--color-text)' }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={config.bar_size || 16}>
            {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
