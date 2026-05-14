import React, { useState } from 'react'
import { Download, FileText, Presentation, Code } from 'lucide-react'
import { useI18n } from '../hooks/useI18n.js'
import client from '../api/client.js'

export default function ExportMenu({ dashboardId }) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)

  const doExport = async (format) => {
    setOpen(false)
    try {
      const resp = await client.get(`/exports/${dashboardId}/${format}`, {
        responseType: format === 'html' ? 'text' : 'blob',
      })
      const url = URL.createObjectURL(new Blob([resp.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `dashboard.${format}`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error('Export failed', e)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors hover:bg-[var(--color-surface-alt)]"
        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
      >
        <Download size={16} /> {t('dashboard.export')}
      </button>
      {open && (
        <div
          className="absolute top-full mt-1 end-0 w-44 rounded-xl shadow-lg border py-1 z-50"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <button onClick={() => doExport('pdf')} className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-[var(--color-surface-alt)] transition-colors" style={{ color: 'var(--color-text)' }}>
            <FileText size={14} /> PDF
          </button>
          <button onClick={() => doExport('pptx')} className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-[var(--color-surface-alt)] transition-colors" style={{ color: 'var(--color-text)' }}>
            <Presentation size={14} /> PowerPoint
          </button>
          <button onClick={() => doExport('html')} className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-[var(--color-surface-alt)] transition-colors" style={{ color: 'var(--color-text)' }}>
            <Code size={14} /> HTML
          </button>
        </div>
      )}
    </div>
  )
}
