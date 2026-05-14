import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, AlertCircle } from 'lucide-react'
import { useI18n } from '../hooks/useI18n.js'
import { getDashboard, listPages, listSections } from '../api/dashboards.js'
import { listFields } from '../api/sections.js'
import { getEntry, upsertEntry } from '../api/entries.js'
import { useWeek } from '../hooks/useWeek.js'
import WeekPicker from '../components/WeekPicker.jsx'
import EntryRow from '../components/EntryRow.jsx'

export default function WeeklyEntry() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useI18n()
  const { currentWeek, prevWeek, goToPrev, goToNext, goToCurrent } = useWeek()
  const [dashboard, setDashboard] = useState(null)
  const [sections, setSections] = useState([])
  const [fieldData, setFieldData] = useState({}) // {field_id: {thisWeek, lastWeek}}
  const [pendingValues, setPendingValues] = useState({})
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState(null)

  useEffect(() => {
    getDashboard(id).then(setDashboard)
  }, [id])

  useEffect(() => {
    listPages(id).then(async (pages) => {
      const allSections = []
      for (const page of pages) {
        const ss = await import('../api/dashboards.js').then(m => m.listSections(id, page.id))
        allSections.push(...ss)
      }
      setSections(allSections)
    })
  }, [id])

  useEffect(() => {
    sections.forEach(async (sec) => {
      const fields = await listFields(sec.id)
      for (const field of fields) {
        const [thisVal, lastVal] = await Promise.all([
          getEntry(field.id, currentWeek),
          getEntry(field.id, prevWeek),
        ])
        setFieldData(prev => ({
          ...prev,
          [field.id]: { field, thisWeek: thisVal, lastWeek: lastVal },
        }))
      }
    })
  }, [sections, currentWeek, prevWeek])

  const handleChange = (fieldId, value) => {
    setPendingValues(prev => ({ ...prev, [fieldId]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      for (const [fieldId, value] of Object.entries(pendingValues)) {
        if (value.value_num !== null && value.value_num !== undefined) {
          await upsertEntry(Number(fieldId), currentWeek, value)
        }
      }
      setSavedAt(new Date())
      setPendingValues({})
    } finally {
      setSaving(false)
    }
  }

  const allFields = Object.values(fieldData)

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(`/dashboards/${id}`)} className="p-2 rounded-lg hover:bg-[var(--color-surface)]" style={{ color: 'var(--color-text-muted)' }}>
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-bold flex-1" style={{ color: 'var(--color-text)' }}>{t('dashboard.weekly_entry')}</h1>
        <WeekPicker currentWeek={currentWeek} onPrev={goToPrev} onNext={goToNext} onCurrent={goToCurrent} />
        <button
          onClick={handleSave}
          disabled={saving || Object.keys(pendingValues).length === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-60"
          style={{ background: 'var(--color-primary)' }}
        >
          <Save size={16} /> {saving ? t('entry.saving') : t('entry.save')}
        </button>
      </div>

      {savedAt && (
        <div className="mb-3 px-3 py-2 rounded-lg text-sm flex items-center gap-2" style={{ background: 'var(--color-success)22', color: 'var(--color-success)' }}>
          ✓ {t('entry.saved')} {savedAt.toLocaleTimeString()}
        </div>
      )}

      <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: 'var(--color-surface-alt)', borderBottom: '1px solid var(--color-border)' }}>
              <th className="px-3 py-3 text-start text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Field</th>
              <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{t('week.last_week')}</th>
              <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{t('week.this_week')}</th>
              <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{t('week.change')}</th>
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {allFields.map(({ field, thisWeek, lastWeek }) => (
              <EntryRow
                key={field.id}
                field={field}
                thisWeekValue={thisWeek}
                lastWeekValue={lastWeek}
                onChange={val => handleChange(field.id, val)}
              />
            ))}
            {allFields.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  No fields to enter. Add sections with fields first.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
