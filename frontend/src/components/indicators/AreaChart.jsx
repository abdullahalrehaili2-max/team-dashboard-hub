import React from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart as ReChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, defs, linearGradient, stop
} from 'recharts'

const SAMPLE = [30, 45, 38, 60, 55, 72, 68, 85, 78, 92, 88, 105]

export default function AreaChart({ config = {}, section }) {
  const raw = config.series || SAMPLE
  const data = raw.map((v, i) => ({ week: `W${i + 1}`, value: v }))

  return (
    <motion.div className="h-full py-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ReChart data={data}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          {config.show_grid !== false && <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />}
          <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }}
            itemStyle={{ color: 'var(--color-text)' }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--color-accent)"
            strokeWidth={2}
            fill={config.gradient !== false ? 'url(#areaGrad)' : 'var(--color-accent)'}
            fillOpacity={0.2}
          />
        </ReChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
