import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronUp, ChevronDown } from 'lucide-react'

const SAMPLE = [
  { name: 'Alpha Team', value: 142, change: '+12%' },
  { name: 'Beta Unit', value: 98, change: '-5%' },
  { name: 'Gamma Div', value: 215, change: '+28%' },
  { name: 'Delta Corp', value: 77, change: '+3%' },
]

export default function TableIndicator({ config = {}, section }) {
  const rows = config.rows || SAMPLE
  const [sortCol, setSortCol] = useState(null)
  const [sortAsc, setSortAsc] = useState(true)

  const cols = rows.length > 0 ? Object.keys(rows[0]) : []

  const sorted = config.sortable !== false && sortCol
    ? [...rows].sort((a, b) => {
        const va = a[sortCol], vb = b[sortCol]
        if (typeof va === 'number' && typeof vb === 'number') return sortAsc ? va - vb : vb - va
        return sortAsc ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va))
      })
    : rows

  const handleSort = (col) => {
    if (sortCol === col) setSortAsc(!sortAsc)
    else { setSortCol(col); setSortAsc(true) }
  }

  return (
    <motion.div className="h-full overflow-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
            {cols.map(col => (
              <th
                key={col}
                onClick={() => handleSort(col)}
                className="px-3 py-2 text-start font-medium cursor-pointer select-none"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <span className="flex items-center gap-1">
                  {col}
                  {sortCol === col && (sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, ri) => (
            <tr
              key={ri}
              style={{
                borderBottom: '1px solid var(--color-border)',
                background: config.striped && ri % 2 ? 'var(--color-surface-alt)' : 'transparent',
              }}
              className="hover:bg-[var(--color-surface-alt)] transition-colors"
            >
              {cols.map(col => (
                <td key={col} className="px-3 py-1.5" style={{ color: 'var(--color-text)' }}>
                  {row[col]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  )
}
