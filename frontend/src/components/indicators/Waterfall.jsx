import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const SAMPLE = [
  { name: 'Start', value: 100, isTotal: true },
  { name: 'Q1 Sales', value: 45 },
  { name: 'Refunds', value: -12 },
  { name: 'Q2 Sales', value: 62 },
  { name: 'Costs', value: -25 },
  { name: 'Total', value: 170, isTotal: true },
]

export default function Waterfall({ config = {}, section }) {
  const raw = config.series || SAMPLE

  const data = useMemo(() => {
    let running = 0
    return raw.map(item => {
      if (item.isTotal) {
        return { ...item, base: 0, top: item.value }
      }
      const base = running
      const top = running + item.value
      running = top
      return { ...item, base: Math.min(base, top), top: Math.max(base, top), raw: item.value }
    })
  }, [raw])

  return (
    <motion.div className="h-full py-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }}
            formatter={(val, name, props) => [props.payload.raw ?? val, name]}
            itemStyle={{ color: 'var(--color-text)' }}
          />
          {/* Invisible base bar for positioning */}
          <Bar dataKey="base" stackId="a" fill="transparent" />
          <Bar dataKey="top" stackId="a" radius={[3, 3, 0, 0]}>
            {data.map((item, i) => (
              <Cell
                key={i}
                fill={item.isTotal ? 'var(--color-primary)' : (item.raw ?? item.value) >= 0 ? 'var(--color-success)' : 'var(--color-danger)'}
              />
            ))}
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
