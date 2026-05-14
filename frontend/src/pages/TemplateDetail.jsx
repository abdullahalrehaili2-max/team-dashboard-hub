import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Copy, Star, ExternalLink } from 'lucide-react'
import { useI18n } from '../hooks/useI18n.js'
import { getTemplate } from '../api/templates.js'
import CloneTemplateModal from '../components/CloneTemplateModal.jsx'

export default function TemplateDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useI18n()
  const [template, setTemplate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showClone, setShowClone] = useState(false)

  useEffect(() => {
    getTemplate(id).then(setTemplate).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-primary)' }} /></div>
  if (!template) return <div className="p-6 text-center" style={{ color: 'var(--color-text-muted)' }}>Template not found</div>

  const bundle = template.bundle_json || {}
  const pages = bundle.pages || []

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {showClone && <CloneTemplateModal template={template} onClose={() => setShowClone(false)} />}

      <button onClick={() => navigate('/templates')} className="flex items-center gap-2 mb-4 text-sm hover:opacity-70 transition-opacity" style={{ color: 'var(--color-text-muted)' }}>
        <ArrowLeft size={16} /> {t('common.back')}
      </button>

      <div className="flex items-start gap-4 mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{template.name}</h1>
            {template.is_official && <Star size={18} style={{ color: 'var(--color-warning)' }} />}
          </div>
          <p className="text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>{template.description}</p>
          <div className="flex gap-2 flex-wrap">
            <span className="px-2 py-1 rounded-full text-xs" style={{ background: 'var(--color-primary)22', color: 'var(--color-primary)' }}>{template.category}</span>
            <span className="px-2 py-1 rounded-full text-xs" style={{ background: 'var(--color-surface-alt)', color: 'var(--color-text-muted)' }}>v{template.version}</span>
            {template.tags?.map(tag => (
              <span key={tag} className="px-2 py-1 rounded-full text-xs" style={{ background: 'var(--color-surface-alt)', color: 'var(--color-text-muted)' }}>{tag}</span>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.open(`/templates/${id}/preview`, '_blank')}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm border"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          >
            <ExternalLink size={14} /> Preview
          </button>
          <button
            onClick={() => setShowClone(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white"
            style={{ background: 'var(--color-primary)' }}
          >
            <Copy size={14} /> {t('template.clone')}
          </button>
        </div>
      </div>

      {/* Pages preview */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>Structure</h2>
        <div className="flex flex-col gap-3">
          {pages.map((page, pi) => (
            <div key={pi} className="rounded-xl border p-4" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text)' }}>{page.name}</h3>
              <div className="flex flex-wrap gap-2">
                {page.sections?.map((sec, si) => (
                  <div key={si} className="px-3 py-1.5 rounded-lg text-xs" style={{ background: 'var(--color-surface-alt)', color: 'var(--color-text-muted)' }}>
                    <span style={{ color: 'var(--color-primary)' }}>{sec.indicator_type}</span> — {sec.title}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
