import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { useI18n } from '../hooks/useI18n.js'
import { getDashboard, listPages, listSections, deleteSection, swapIndicator, saveLayout } from '../api/dashboards.js'
import PagesTabs from '../components/PagesTabs.jsx'
import GridCanvas from '../components/GridCanvas.jsx'

export default function DesignMode() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useI18n()
  const [dashboard, setDashboard] = useState(null)
  const [pages, setPages] = useState([])
  const [activePage, setActivePage] = useState(null)
  const [sections, setSections] = useState([])
  const [pendingLayout, setPendingLayout] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([getDashboard(id), listPages(id)])
      .then(([d, ps]) => {
        setDashboard(d)
        setPages(ps)
        if (ps.length) setActivePage(ps[0])
      })
  }, [id])

  useEffect(() => {
    if (!activePage) return
    listSections(id, activePage.id).then(setSections)
  }, [activePage, id])

  const handleLayoutChange = useCallback((layout) => {
    setPendingLayout({ lg: layout })
  }, [])

  const handleSave = async () => {
    if (!pendingLayout) return
    setSaving(true)
    try {
      await saveLayout(id, pendingLayout)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteSection = async (secId) => {
    await deleteSection(secId)
    setSections(prev => prev.filter(s => s.id !== secId))
  }

  const handleSwapIndicator = (section) => {
    const type = prompt('Enter indicator type (e.g. KPI_CARD, LINE_CHART, GAUGE):')
    if (!type) return
    swapIndicator(section.id, type)
      .then(updated => setSections(prev => prev.map(s => s.id === updated.id ? updated : s)))
  }

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(`/dashboards/${id}`)} className="p-2 rounded-lg hover:bg-[var(--color-surface)]" style={{ color: 'var(--color-text-muted)' }}>
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-bold flex-1" style={{ color: 'var(--color-text)' }}>{dashboard?.name} — Design</h1>
        {pendingLayout && (
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white" style={{ background: 'var(--color-primary)' }}>
            <Save size={16} /> {saving ? t('entry.saving') : t('common.save')}
          </button>
        )}
      </div>

      <div className="mb-2 px-3 py-1.5 rounded-lg text-xs" style={{ background: 'var(--color-accent)22', color: 'var(--color-accent)' }}>
        Design mode — drag to reposition, resize handles on sections
      </div>

      <PagesTabs pages={pages} activePage={activePage} onSelect={setActivePage} />

      <div className="mt-4">
        <GridCanvas
          sections={sections}
          editMode={true}
          onLayoutChange={handleLayoutChange}
          onDeleteSection={handleDeleteSection}
          onSwapIndicator={handleSwapIndicator}
        />
      </div>
    </div>
  )
}
