import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getDashboard, listPages, listSections } from '../api/dashboards.js'
import GridCanvas from '../components/GridCanvas.jsx'

export default function Presentation() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [pages, setPages] = useState([])
  const [pageIndex, setPageIndex] = useState(0)
  const [sections, setSections] = useState({}) // {pageId: [sections]}
  const [dashboard, setDashboard] = useState(null)

  useEffect(() => {
    Promise.all([getDashboard(id), listPages(id)])
      .then(([d, ps]) => {
        setDashboard(d)
        setPages(ps)
        ps.forEach(p => {
          listSections(id, p.id).then(ss => {
            setSections(prev => ({ ...prev, [p.id]: ss }))
          })
        })
      })
  }, [id])

  const currentPage = pages[pageIndex]
  const currentSections = currentPage ? (sections[currentPage.id] || []) : []

  const handleKey = (e) => {
    if (e.key === 'ArrowRight' || e.key === 'Space') setPageIndex(i => Math.min(i + 1, pages.length - 1))
    if (e.key === 'ArrowLeft') setPageIndex(i => Math.max(i - 1, 0))
    if (e.key === 'Escape') navigate(`/dashboards/${id}`)
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [pages.length])

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'var(--color-bg)' }}>
      {/* Controls */}
      <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10">
        <div className="text-sm px-3 py-1.5 rounded-lg" style={{ background: 'var(--color-surface)55', backdropFilter: 'blur(8px)', color: 'var(--color-text)' }}>
          {dashboard?.name} — {currentPage?.name}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2" style={{ color: 'var(--color-text-muted)' }}>{pageIndex + 1} / {pages.length}</span>
          <button onClick={() => navigate(`/dashboards/${id}`)} className="p-2 rounded-lg" style={{ background: 'var(--color-surface)55', backdropFilter: 'blur(8px)', color: 'var(--color-text)' }}>
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden p-6 pt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={pageIndex}
            className="h-full"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <GridCanvas sections={currentSections} editMode={false} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Nav arrows */}
      <div className="flex justify-between px-4 pb-4">
        <button
          onClick={() => setPageIndex(i => Math.max(i - 1, 0))}
          disabled={pageIndex === 0}
          className="p-3 rounded-xl disabled:opacity-30"
          style={{ background: 'var(--color-surface)', color: 'var(--color-text)' }}
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex gap-2 items-center">
          {pages.map((_, i) => (
            <button
              key={i}
              onClick={() => setPageIndex(i)}
              className="w-2 h-2 rounded-full transition-all"
              style={{ background: i === pageIndex ? 'var(--color-accent)' : 'var(--color-border)' }}
            />
          ))}
        </div>
        <button
          onClick={() => setPageIndex(i => Math.min(i + 1, pages.length - 1))}
          disabled={pageIndex >= pages.length - 1}
          className="p-3 rounded-xl disabled:opacity-30"
          style={{ background: 'var(--color-surface)', color: 'var(--color-text)' }}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  )
}
