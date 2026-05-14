import React, { useState } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function EntryRow({ field, thisWeekValue, lastWeekValue, onChange, locked }) {
  const [value, setValue] = useState(thisWeekValue?.value_num ?? '')
  const [carryForward, setCarryForward] = useState(false)

  const delta = value !== '' && lastWeekValue?.value_num != null
    ? Number(value) - lastWeekValue.value_num
    : null

  const handleChange = (v) => {
    setValue(v)
    onChange?.({ value_num: v !== '' ? Number(v) : null })
  }

  const handleCarryForward = () => {
    if (lastWeekValue?.value_num != null) {
      setCarryForward(true)
      handleChange(String(lastWeekValue.value_num))
    }
  }

  const trendColor = delta == null ? 'var(--color-text-muted)'
    : field.direction_good === 'up'
      ? delta > 0 ? 'var(--color-success)' : 'var(--color-danger)'
      : delta < 0 ? 'var(--color-success)' : 'var(--color-danger)'

  return (
    <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
      <td className="py-2 px-3 text-sm" style={{ color: 'var(--color-text)' }}>{field.label || field.key}</td>
      <td className="py-2 px-3 text-sm text-center" style={{ color: 'var(--color-text-muted)' }}>
        {lastWeekValue?.value_num ?? '—'}
      </td>
      <td className="py-2 px-3">
        <input
          type="number"
          value={value}
          onChange={e => handleChange(e.target.value)}
          disabled={locked}
          className="w-24 px-2 py-1 rounded-lg text-sm border"
          style={{
            background: 'var(--color-surface-alt)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
          }}
          placeholder="—"
        />
      </td>
      <td className="py-2 px-3 text-sm text-center">
        {delta != null ? (
          <span style={{ color: trendColor }} className="flex items-center gap-1 justify-center">
            {delta > 0 ? <TrendingUp size={14} /> : delta < 0 ? <TrendingDown size={14} /> : <Minus size={14} />}
            {delta > 0 ? '+' : ''}{delta.toFixed(1)}
          </span>
        ) : '—'}
      </td>
      <td className="py-2 px-3">
        {!locked && lastWeekValue?.value_num != null && (
          <button
            onClick={handleCarryForward}
            className="text-xs px-2 py-0.5 rounded"
            style={{ color: 'var(--color-accent)', background: 'var(--color-surface-alt)' }}
          >↩</button>
        )}
      </td>
    </tr>
  )
}
