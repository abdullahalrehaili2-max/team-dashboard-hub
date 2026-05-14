import React from 'react'
import { motion } from 'framer-motion'

const SAMPLE_ROWS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const SAMPLE_COLS = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6']
const SAMPLE_DATA = SAMPLE_ROWS.map(() => SAMPLE_COLS.map(() => Math.round(Math.random() * 100)))

function lerp(a, b, t) { return a + (b - a) * t }
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b]
}

export default function Heatmap({ config = {}, section }) {
  const matrix = config.matrix || SAMPLE_DATA
  const rows = config.row_labels || SAMPLE_ROWS
  const cols = config.col_labels || SAMPLE_COLS
  
  const allVals = matrix.flat().filter(v => typeof v === 'number')
  const minVal = Math.min(...allVals)
  const maxVal = Math.max(...allVals)
  
  const getColor = (val) => {
    const t = maxVal === minVal ? 0.5 : (val - minVal) / (maxVal - minVal)
    const r = Math.round(lerp(15, 39, t))
    const g = Math.round(lerp(14, 206, t))
    const b = Math.round(lerp(28, 215, t))
    return `rgba(${r},${g},${b},${0.2 + t * 0.8})`
  }

  return (
    <motion.div
      className="h-full overflow-auto p-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            <th className="p-1" />
            {cols.map((c, i) => (
              <th key={i} className="p-1 text-center font-medium" style={{ color: 'var(--color-text-muted)' }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, ri) => (
            <tr key={ri}>
              <td className="p-1 font-medium" style={{ color: 'var(--color-text-muted)' }}>{rows[ri] || ri}</td>
              {row.map((val, ci) => (
                <td key={ci}
                  className="p-1 text-center rounded transition-all"
                  style={{ background: getColor(val), color: 'var(--color-text)', minWidth: 28 }}
                >
                  {typeof val === 'number' ? val.toFixed(0) : val}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  )
}
