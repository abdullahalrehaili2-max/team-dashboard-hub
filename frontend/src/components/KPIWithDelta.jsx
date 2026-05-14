import React from 'react'
import DeltaBadge from './DeltaBadge.jsx'

export default function KPIWithDelta({ label, value, delta, deltaPct, color, unit, dataType }) {
  const fmt = (v) => {
    if (v == null) return '—'
    if (dataType === 'currency') return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(v)
    if (dataType === 'percent') return `${v.toFixed(1)}%`
    return v.toLocaleString()
  }
  return (
    <div className="flex flex-col gap-1">
      <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{label}</div>
      <div className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{fmt(value)}</div>
      {unit && <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{unit}</div>}
      <DeltaBadge delta={delta} deltaPct={deltaPct} color={color} />
    </div>
  )
}
