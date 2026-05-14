import React from 'react'
import { motion } from 'framer-motion'
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

const SAMPLE = [80, 92, 85, 100, 95, 110, 105, 120, 115, 130, 125, 140]

export default function ColumnTrend({ config = {}, section }) {
  const raw = config.series || SAMPLE
  const avg = raw.reduce((a, b) => a + b, 0) / raw.length
  const data = raw.map((v, i) => ({ name: `W${i + 1}`, value: v }))

  return (
    <motion.div className="h-full py-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }}
            itemStyle={{ color: 'var(--color-text)' }}
          />
          <Bar dataKey="value" fill="var(--color-primary)" radius={[3, 3, 0, 0]} opacity={0.8} />
          <Line type="monotone" dataKey="value" stroke="var(--color-accent)" strokeWidth={2} dot={false} />
          {config.show_reference_line !== false && (
            <ReferenceLine y={avg} stroke="var(--color-warning)" strokeDasharray="4 4" />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
