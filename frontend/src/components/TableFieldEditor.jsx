import React, { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useI18n } from '../hooks/useI18n.js'

export default function TableFieldEditor({ value = [], onChange }) {
  const { t } = useI18n()
  const [rows, setRows] = useState(value.length ? value : [{ name: '', value: '' }])

  const update = (newRows) => {
    setRows(newRows)
    onChange?.(newRows)
  }

  const addRow = () => update([...rows, { name: '', value: '' }])
  const removeRow = (i) => update(rows.filter((_, idx) => idx !== i))
  const updateRow = (i, key, val) => {
    const updated = rows.map((r, idx) => idx === i ? { ...r, [key]: val } : r)
    update(updated)
  }

  return (
    <div className="flex flex-col gap-2">
      {rows.map((row, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            value={row.name}
            onChange={e => updateRow(i, 'name', e.target.value)}
            placeholder="Name"
            className="flex-1 px-2 py-1 text-sm rounded-lg border"
            style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
          />
          <input
            type="number"
            value={row.value}
            onChange={e => updateRow(i, 'value', Number(e.target.value))}
            placeholder="Value"
            className="w-24 px-2 py-1 text-sm rounded-lg border"
            style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
          />
          <button onClick={() => removeRow(i)} className="p-1 text-[var(--color-danger)]"><Trash2 size={14} /></button>
        </div>
      ))}
      <button
        onClick={addRow}
        className="flex items-center gap-1 text-sm px-2 py-1 rounded-lg"
        style={{ color: 'var(--color-accent)' }}
      >
        <Plus size={14} /> {t('entry.add_row')}
      </button>
    </div>
  )
}
