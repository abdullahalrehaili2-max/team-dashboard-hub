import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Sparkles, Check, X, Play, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { useI18n } from '../hooks/useI18n.js'
import { suggestIndicators, suggestLayout, applySuggestions } from '../api/ai.js'
import { getDashboard } from '../api/dashboards.js'

export default function AISuggester() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useI18n()
  const [dashboard, setDashboard] = useState(null)
  const [suggestions, setSuggestions] = useState(null)
  const [loading, setLoading] = useState(false)
  const [accepted, setAccepted] = useState({})
  const [swapIndicators, setSwapIndicators] = useState(true)
  const [repackLayout, setRepackLayout] = useState(false)
  const [regroupPages, setRegroupPages] = useState(false)
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(null)

  useEffect(() => {
    getDashboard(id).then(setDashboard)
    loadSuggestions()
  }, [id])

  const loadSuggestions = async () => {
    setLoading(true)
    try {
      const data = await suggestIndicators(id)
      setSuggestions(data)
      // Pre-select accepted for non-same suggestions
      const initial = {}
      data.suggestions?.forEach(s => {
        if (!s.same) initial[s.section_id] = true
      })
      setAccepted(initial)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async () => {
    setApplying(true)
    try {
      const acceptedIds = Object.entries(accepted).filter(([, v]) => v).map(([k]) => Number(k))
      const result = await applySuggestions({
        dashboard_id: Number(id),
        accepted_section_ids: acceptedIds,
        swap_indicators: swapIndicators,
        repack_layout: repackLayout,
        regroup_pages: regroupPages,
      })
      setApplied(result)
    } finally {
      setApplying(false)
    }
  }

  const toggleAccept = (sectionId) => {
    setAccepted(prev => ({ ...prev, [sectionId]: !prev[sectionId] }))
  }

  const confidenceColor = (c) => {
    if (c >= 0.8) return 'var(--color-success)'
    if (c >= 0.6) return 'var(--color-warning)'
    return 'var(--color-text-muted)'
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(`/dashboards/${id}`)} className="p-2 rounded-lg hover:bg-[var(--color-surface)]" style={{ color: 'var(--color-text-muted)' }}>
          <ArrowLeft size={18} />
        </button>
        <Sparkles size={22} style={{ color: 'var(--color-accent)' }} />
        <h1 className="text-xl font-bold flex-1" style={{ color: 'var(--color-text)' }}>{t('ai.suggest')}</h1>
        <button onClick={loadSuggestions} disabled={loading} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm border" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
          <Zap size={14} /> Refresh
        </button>
      </div>

      {/* Options */}
      <div className="flex gap-3 mb-4 flex-wrap">
        {[
          [t('ai.swap_indicators'), swapIndicators, setSwapIndicators],
          [t('ai.repack_layout'), repackLayout, setRepackLayout],
          [t('ai.regroup_pages'), regroupPages, setRegroupPages],
        ].map(([label, val, setter]) => (
          <button
            key={label}
            onClick={() => setter(!val)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm border transition-all"
            style={{
              background: val ? 'var(--color-accent)22' : 'transparent',
              borderColor: val ? 'var(--color-accent)' : 'var(--color-border)',
              color: val ? 'var(--color-accent)' : 'var(--color-text-muted)',
            }}
          >
            {val ? <Check size={14} /> : <X size={14} />} {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <Sparkles size={32} style={{ color: 'var(--color-accent)', opacity: 0.5 }} className="animate-pulse" />
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Analyzing your dashboard...</p>
          </div>
        </div>
      ) : suggestions?.suggestions?.length === 0 ? (
        <div className="text-center py-16" style={{ color: 'var(--color-text-muted)' }}>{t('ai.no_changes')}</div>
      ) : applied ? (
        <motion.div
          className="rounded-2xl p-6 text-center"
          style={{ background: 'var(--color-success)11', border: '1px solid var(--color-success)44' }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Check size={32} style={{ color: 'var(--color-success)', margin: '0 auto 12px' }} />
          <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--color-text)' }}>Applied!</h2>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {applied.applied} sections updated
          </p>
          <button onClick={() => navigate(`/dashboards/${id}`)} className="mt-4 px-4 py-2 rounded-xl text-sm font-medium text-white" style={{ background: 'var(--color-primary)' }}>
            View Dashboard
          </button>
        </motion.div>
      ) : (
        <>
          {/* Suggestions table */}
          <div className="rounded-2xl border overflow-hidden mb-4" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--color-surface-alt)', borderBottom: '1px solid var(--color-border)' }}>
                  <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Section</th>
                  <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{t('ai.current')}</th>
                  <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{t('ai.recommended')}</th>
                  <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{t('ai.confidence')}</th>
                  <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{t('ai.reason')}</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {suggestions?.suggestions?.map((s) => (
                  <tr key={s.section_id} style={{ borderBottom: '1px solid var(--color-border)' }}
                    className="hover:bg-[var(--color-surface-alt)] transition-colors">
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--color-text)' }}>{s.section_title}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-xs font-mono" style={{ background: 'var(--color-surface-alt)', color: 'var(--color-text-muted)' }}>{s.current_type}</span>
                    </td>
                    <td className="px-4 py-3">
                      {s.same ? (
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>No change</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-xs font-mono" style={{ background: 'var(--color-accent)22', color: 'var(--color-accent)' }}>{s.recommended_type}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium" style={{ color: confidenceColor(s.confidence) }}>
                        {(s.confidence * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-text-muted)', maxWidth: 200 }}>{s.reason}</td>
                    <td className="px-4 py-3">
                      {!s.same && (
                        <button
                          onClick={() => toggleAccept(s.section_id)}
                          className="w-6 h-6 rounded flex items-center justify-center border transition-all"
                          style={{
                            background: accepted[s.section_id] ? 'var(--color-accent)' : 'transparent',
                            borderColor: accepted[s.section_id] ? 'var(--color-accent)' : 'var(--color-border)',
                          }}
                        >
                          {accepted[s.section_id] && <Check size={14} style={{ color: '#0f0e1c' }} />}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={() => navigate(`/dashboards/${id}`)} className="px-4 py-2 text-sm rounded-xl" style={{ color: 'var(--color-text-muted)' }}>
              {t('common.cancel')}
            </button>
            <button
              onClick={handleApply}
              disabled={applying || Object.values(accepted).every(v => !v)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: 'var(--color-primary)' }}
            >
              <Play size={14} /> {applying ? 'Applying...' : t('ai.apply')}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
