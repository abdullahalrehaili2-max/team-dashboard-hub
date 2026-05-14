import React from 'react'
import { useI18n } from '../hooks/useI18n.js'

export default function LangToggle() {
  const { isArabic, toggle } = useI18n()
  return (
    <button
      onClick={toggle}
      className="px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors"
      style={{
        borderColor: 'var(--color-primary)',
        color: 'var(--color-primary)',
        background: 'transparent',
      }}
      title={isArabic ? 'Switch to English' : 'التبديل إلى العربية'}
    >
      {isArabic ? 'EN' : 'ع'}
    </button>
  )
}
