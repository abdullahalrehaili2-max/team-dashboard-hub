import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const colorMap = {
  green: { bg: 'rgba(39,174,96,0.15)', text: '#27AE60', border: 'rgba(39,174,96,0.3)' },
  red: { bg: 'rgba(204,54,65,0.15)', text: '#CC3641', border: 'rgba(204,54,65,0.3)' },
  neutral: { bg: 'rgba(155,155,180,0.15)', text: '#9b9bb4', border: 'rgba(155,155,180,0.3)' },
}

export default function DeltaBadge({ delta, deltaPct, color = 'neutral', showPct = true, size = 'sm' }) {
  const c = colorMap[color] || colorMap.neutral
  const IconComp = color === 'green' ? TrendingUp : color === 'red' ? TrendingDown : Minus
  const iconSize = size === 'sm' ? 12 : 14

  if (delta == null) return null

  const pctStr = deltaPct != null ? ` (${deltaPct > 0 ? '+' : ''}${deltaPct.toFixed(1)}%)` : ''
  const numStr = delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
    >
      <IconComp size={iconSize} />
      {numStr}{showPct && pctStr}
    </span>
  )
}
