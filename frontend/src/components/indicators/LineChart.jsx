import React from 'react'
import { motion } from 'framer-motion'
import {
  LineChart as ReChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const SAMPLE = [65, 78, 72, 85, 90, 88, 95, 102, 98, 110, 115, 120]

export default function LineChart({ config = {}, section }) {
  const raw = config.series || SAMPLE
  const data = raw.map((v, i) => ({ week: `W${i + 1}`, value: v }))

  return (
    <motion.div className="h-full py-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ReChart data={data}>
          {config.show_grid !== false && <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />}
          <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }}
            itemStyle={{ color: 'var(--color-text)' }}
          />
          {config.show_legend && <Legend wrapperStyle={{ fontSize: 11 }} />}
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--color-primary)"
            strokeWidth={2}
            dot={config.show_dots !== false ? { r: 3, fill: 'var(--color-primary)' } : false}
            activeDot={{ r: 5 }}
          />
        </ReChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
