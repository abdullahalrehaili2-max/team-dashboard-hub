import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Save } from 'lucide-react'
import { useI18n } from '../hooks/useI18n.js'
import { getDashboard, listPages, listSections, createSection, deleteSection, createPage } from '../api/dashboards.js'
import PagesTabs from '../components/PagesTabs.jsx'
import SaveTemplateModal from '../components/SaveTemplateModal.jsx'

export default function DashboardEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useI18n()
  const [dashboard, setDashboard] = useState(null)
  const [pages, setPages] = useState([])
  const [activePage, setActivePage] = useState(null)
  const [sections, setSections] = useState([])
  const [showSaveTemplate, setShowSaveTemplate] = useState(false)
  const [loading, setLoading] = useState(true)

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

  const handleAddSection = async () => {
    const section = await createSection(id, {
      title: 'New Section',
      page_id: activePage?.id,
      grid_item_json: { x: 0, y: 0, w: 3, h: 2 },
      indicator_type: 'KPI_CARD',
    })
    setSections(prev => [...prev, section])
  }

  const handleDeleteSection = async (secId) => {
    await deleteSection(secId)
    setSections(prev => prev.filter(s => s.id !== secId))
  }

  const handleAddPage = async () => {
    const page = await createPage(id, { name: `Page ${pages.length + 1}`, order: pages.length })
    setPages(prev => [...prev, page])
    setActivePage(page)
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-primary)' }} /></div>

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
      {showSaveTemplate && (
        <SaveTemplateModal dashboardId={id} onClose={() => setShowSaveTemplate(false)} />
      )}
      
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(`/dashboards/${id}`)} className="p-2 rounded-lg hover:bg-[var(--color-surface)]" style={{ color: 'var(--color-text-muted)' }}>
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-bold flex-1" style={{ color: 'var(--color-text)' }}>{dashboard?.name} — {t('dashboard.edit')}</h1>
        <button onClick={() => setShowSaveTemplate(true)} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-white" style={{ background: 'var(--color-primary)' }}>
          <Save size={16} /> {t('template.save_as')}
        </button>
      </div>

      <PagesTabs pages={pages} activePage={activePage} onSelect={setActivePage} onAdd={handleAddPage} />

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sections.map(sec => (
          <div
            key={sec.id}
            className="rounded-xl p-4 border flex flex-col gap-2"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{sec.title}</span>
              <button onClick={() => handleDeleteSection(sec.id)} className="text-xs px-2 py-1 rounded" style={{ color: 'var(--color-danger)' }}>×</button>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full w-fit" style={{ background: 'var(--color-primary)22', color: 'var(--color-primary)' }}>
              {sec.indicator_type}
            </span>
          </div>
        ))}
        <button
          onClick={handleAddSection}
          className="rounded-xl p-4 border-2 border-dashed flex items-center justify-center gap-2 text-sm transition-colors hover:bg-[var(--color-surface)]"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
        >
          <Plus size={16} /> {t('dashboard.new')}
        </button>
      </div>
    </div>
  )
}
