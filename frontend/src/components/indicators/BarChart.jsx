import React from 'react'
import { motion } from 'framer-motion'
import { BarChart as ReChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const SAMPLE = [120, 85, 140, 95, 110, 130, 75, 160, 145, 90, 125, 155]

export default function BarChart({ config = {}, section }) {
  const raw = config.series || SAMPLE
  const data = raw.map((v, i) => ({ name: `W${i + 1}`, value: v }))
  const max = Math.max(...raw)

  return (
    <motion.div className="h-full py-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ReChart data={data}>
          {config.show_grid !== false && <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />}
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }}
            itemStyle={{ color: 'var(--color-text)' }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={config.bar_size || 18}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.value === max ? 'var(--color-accent)' : 'var(--color-primary)'} />
            ))}
          </Bar>
        </ReChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
