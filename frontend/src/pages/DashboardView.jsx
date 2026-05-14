import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Edit2, Sparkles, Share2, ArrowLeft } from 'lucide-react'
import { useI18n } from '../hooks/useI18n.js'
import { getDashboard, listPages, listSections } from '../api/dashboards.js'
import { useWeek } from '../hooks/useWeek.js'
import { useDeltas } from '../hooks/useDeltas.js'
import WhatChanged from '../components/WhatChanged.jsx'
import PagesTabs from '../components/PagesTabs.jsx'
import GridCanvas from '../components/GridCanvas.jsx'
import ViewModeSwitcher from '../components/ViewModeSwitcher.jsx'
import ExportMenu from '../components/ExportMenu.jsx'
import WeekPicker from '../components/WeekPicker.jsx'

export default function DashboardView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useI18n()
  const [dashboard, setDashboard] = useState(null)
  const [pages, setPages] = useState([])
  const [activePage, setActivePage] = useState(null)
  const [sections, setSections] = useState([])
  const [viewMode, setViewMode] = useState('grid')
  const [loading, setLoading] = useState(true)
  const { currentWeek, prevWeek, goToPrev, goToNext, goToCurrent } = useWeek()
  const { data: deltas } = useDeltas(id, currentWeek)

  useEffect(() => {
    Promise.all([getDashboard(id), listPages(id)])
      .then(([d, ps]) => {
        setDashboard(d)
        setPages(ps)
        if (ps.length) setActivePage(ps[0])
      })
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!activePage) return
    listSections(id, activePage.id).then(setSections)
  }, [activePage, id])

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-primary)' }} /></div>
  if (!dashboard) return <div className="p-6 text-center" style={{ color: 'var(--color-text-muted)' }}>Dashboard not found</div>

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <button onClick={() => navigate('/dashboards')} className="p-2 rounded-lg hover:bg-[var(--color-surface)]" style={{ color: 'var(--color-text-muted)' }}>
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-bold flex-1" style={{ color: 'var(--color-text)' }}>{dashboard.name}</h1>
        <WeekPicker currentWeek={currentWeek} onPrev={goToPrev} onNext={goToNext} onCurrent={goToCurrent} />
        <ViewModeSwitcher mode={viewMode} onChange={setViewMode} />
        <ExportMenu dashboardId={id} />
        <button
          onClick={() => navigate(`/dashboards/${id}/ai`)}
          className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium"
          style={{ background: 'var(--color-accent)22', color: 'var(--color-accent)', border: '1px solid var(--color-accent)44' }}
        >
          <Sparkles size={16} /> {t('ai.suggest')}
        </button>
        <button
          onClick={() => navigate(`/dashboards/${id}/design`)}
          className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium"
          style={{ background: 'var(--color-primary)22', color: 'var(--color-primary)', border: '1px solid var(--color-primary)44' }}
        >
          <Edit2 size={16} /> {t('dashboard.design')}
        </button>
      </div>

      {/* What Changed */}
      <WhatChanged deltas={deltas} />

      {/* Pages tabs */}
      {pages.length > 0 && (
        <PagesTabs pages={pages} activePage={activePage} onSelect={setActivePage} />
      )}

      {/* Canvas */}
      <div className="mt-4">
        {sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-2xl border border-dashed"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
            <p>No sections on this page</p>
            <button onClick={() => navigate(`/dashboards/${id}/edit`)} className="text-sm px-4 py-2 rounded-xl text-white" style={{ background: 'var(--color-primary)' }}>
              {t('dashboard.edit')}
            </button>
          </div>
        ) : (
          <GridCanvas
            sections={sections}
            editMode={false}
            deltaData={deltas}
          />
        )}
      </div>
    </div>
  )
}
