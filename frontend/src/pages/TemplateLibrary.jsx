import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Star, Download, Eye, Trash2, Upload } from 'lucide-react'
import { useI18n } from '../hooks/useI18n.js'
import { listTemplates, deleteTemplate, importTemplate, cloneTemplate } from '../api/templates.js'
import CloneTemplateModal from '../components/CloneTemplateModal.jsx'

const CATEGORIES = ['All', 'Executive', 'Sales', 'Marketing', 'Operations', 'Product', 'General']

export default function TemplateLibrary() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [templates, setTemplates] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [officialOnly, setOfficialOnly] = useState(false)
  const [cloneTarget, setCloneTarget] = useState(null)

  const loadTemplates = () => {
    setLoading(true)
    listTemplates({
      q: search || undefined,
      category: category !== 'All' ? category : undefined,
      official: officialOnly || undefined,
    })
      .then(data => {
        setTemplates(data.items || data)
        setTotal(data.total || (data.items || data).length)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadTemplates() }, [search, category, officialOnly])

  const handleDelete = async (id) => {
    if (!confirm('Delete template?')) return
    await deleteTemplate(id)
    loadTemplates()
  }

  const handleImport = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json,.tpl.json'
    input.onchange = async (e) => {
      const file = e.target.files[0]
      if (!file) return
      await importTemplate(file)
      loadTemplates()
    }
    input.click()
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {cloneTarget && <CloneTemplateModal template={cloneTarget} onClose={() => setCloneTarget(null)} />}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{t('template.library')}</h1>
        <button onClick={handleImport} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm border" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
          <Upload size={16} /> {t('template.import')}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('template.search')}
            className="w-full ps-9 pe-3 py-2 rounded-xl text-sm border"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-xl text-sm transition-colors ${category === c ? 'text-white' : ''}`}
              style={{
                background: category === c ? 'var(--color-primary)' : 'var(--color-surface)',
                border: `1px solid ${category === c ? 'transparent' : 'var(--color-border)'}`,
                color: category === c ? 'white' : 'var(--color-text-muted)',
              }}
            >
              {c}
            </button>
          ))}
        </div>
        <button
          onClick={() => setOfficialOnly(!officialOnly)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm transition-colors`}
          style={{
            background: officialOnly ? 'var(--color-warning)22' : 'var(--color-surface)',
            border: `1px solid ${officialOnly ? 'var(--color-warning)' : 'var(--color-border)'}`,
            color: officialOnly ? 'var(--color-warning)' : 'var(--color-text-muted)',
          }}
        >
          <Star size={14} /> {t('template.official')}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-primary)' }} />
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-16" style={{ color: 'var(--color-text-muted)' }}>{t('template.no_templates')}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {templates.map((tpl, i) => (
            <motion.div
              key={tpl.id}
              className="rounded-2xl border overflow-hidden group"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
            >
              {/* Cover image placeholder */}
              <div className="h-32 flex items-center justify-center" style={{ background: 'var(--color-surface-alt)' }}>
                {tpl.cover_image_path ? (
                  <img src={tpl.cover_image_path} alt={tpl.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-4xl opacity-20" style={{ color: 'var(--color-primary)' }}>
                    {tpl.category?.[0] || 'T'}
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start gap-2 mb-1">
                  <h3 className="font-semibold text-sm flex-1 leading-tight" style={{ color: 'var(--color-text)' }}>{tpl.name}</h3>
                  {tpl.is_official && <Star size={14} style={{ color: 'var(--color-warning)' }} className="flex-shrink-0 mt-0.5" />}
                </div>
                <p className="text-xs mb-2 line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>{tpl.description}</p>
                <div className="flex gap-1 flex-wrap mb-3">
                  <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'var(--color-primary)22', color: 'var(--color-primary)' }}>
                    {tpl.category}
                  </span>
                  {tpl.tags?.slice(0, 2).map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'var(--color-surface-alt)', color: 'var(--color-text-muted)' }}>{tag}</span>
                  ))}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => navigate(`/templates/${tpl.id}`)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs hover:bg-[var(--color-surface-alt)] transition-colors" style={{ color: 'var(--color-text-muted)' }}>
                    <Eye size={12} /> {t('template.preview')}
                  </button>
                  <button onClick={() => setCloneTarget(tpl)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium text-white" style={{ background: 'var(--color-primary)' }}>
                    <Download size={12} /> {t('template.clone')}
                  </button>
                  {!tpl.is_official && (
                    <button onClick={() => handleDelete(tpl.id)} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-alt)] transition-colors" style={{ color: 'var(--color-danger)' }}>
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
