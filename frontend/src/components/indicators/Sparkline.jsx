import React from 'react'
import { motion } from 'framer-motion'
import { LineChart as ReLineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'

const SAMPLE = [42, 50, 45, 60, 55, 70, 65, 80, 75, 88, 82, 95]

export default function Sparkline({ config = {}, section, deltaData }) {
  const raw = config.series || SAMPLE
  const data = raw.map((v, i) => ({ i, v }))
  const last = data[data.length - 1]?.v
  const first = data[0]?.v
  const trending = last > first

  return (
    <motion.div
      className="flex flex-col h-full py-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ReLineChart data={data}>
            <Line
              type="monotone"
              dataKey="v"
              stroke={trending ? 'var(--color-success)' : 'var(--color-danger)'}
              strokeWidth={config.stroke_width || 2}
              dot={false}
              isAnimationActive
            />
            <Tooltip
              contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ display: 'none' }}
              itemStyle={{ color: 'var(--color-text)' }}
            />
          </ReLineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
