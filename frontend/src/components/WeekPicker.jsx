import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useI18n } from '../hooks/useI18n.js'

export default function WeekPicker({ currentWeek, onPrev, onNext, onCurrent }) {
  const { t, isRTL } = useI18n()
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={isRTL ? onNext : onPrev}
        className="p-1.5 rounded-lg hover:bg-[var(--color-surface-alt)] text-[var(--color-text-muted)] transition-colors"
      >
        <ChevronLeft size={16} />
      </button>
      <button
        onClick={onCurrent}
        className="px-3 py-1.5 text-sm rounded-lg font-mono border"
        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
      >
        {currentWeek}
      </button>
      <button
        onClick={isRTL ? onPrev : onNext}
        className="p-1.5 rounded-lg hover:bg-[var(--color-surface-alt)] text-[var(--color-text-muted)] transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
