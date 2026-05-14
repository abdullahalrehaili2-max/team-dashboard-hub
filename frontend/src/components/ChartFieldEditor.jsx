import React, { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useI18n } from '../hooks/useI18n.js'

export default function ChartFieldEditor({ value = [], onChange }) {
  const { t } = useI18n()
  const [series, setSeries] = useState(value.length ? value : [0])

  const update = (newSeries) => {
    setSeries(newSeries)
    onChange?.(newSeries)
  }

  const addPoint = () => update([...series, 0])
  const removePoint = (i) => update(series.filter((_, idx) => idx !== i))
  const updatePoint = (i, val) => {
    const updated = series.map((v, idx) => idx === i ? Number(val) : v)
    update(updated)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {series.map((point, i) => (
          <div key={i} className="flex items-center gap-1">
            <input
              type="number"
              value={point}
              onChange={e => updatePoint(i, e.target.value)}
              className="w-20 px-2 py-1 text-sm rounded-lg border text-center"
              style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
            />
            <button onClick={() => removePoint(i)} className="text-[var(--color-danger)]"><Trash2 size={12} /></button>
          </div>
        ))}
        <button
          onClick={addPoint}
          className="flex items-center gap-1 text-sm px-2 py-1 rounded-lg"
          style={{ color: 'var(--color-accent)' }}
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  )
}
