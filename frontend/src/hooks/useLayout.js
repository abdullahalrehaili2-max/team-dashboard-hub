import { useState, useCallback } from 'react'
import { saveLayout } from '../api/dashboards.js'

export function useLayout(dashboardId, initialSections = []) {
  const [sections, setSections] = useState(initialSections)
  const [saving, setSaving] = useState(false)

  const updateLayout = useCallback(async (newLayout) => {
    setSaving(true)
    try {
      await saveLayout(dashboardId, newLayout)
    } finally {
      setSaving(false)
    }
  }, [dashboardId])

  const onLayoutChange = useCallback((layout) => {
    // layout is array of {i, x, y, w, h} from react-grid-layout
    const layoutMap = {}
    layout.forEach(item => { layoutMap[item.i] = item })
    setSections(prev => prev.map(s => ({
      ...s,
      grid_item_json: { ...s.grid_item_json, ...(layoutMap[String(s.id)] || {}) }
    })))
  }, [])

  return { sections, setSections, saving, updateLayout, onLayoutChange }
}
