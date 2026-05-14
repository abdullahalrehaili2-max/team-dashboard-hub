import React from 'react'
import { Plus } from 'lucide-react'

export default function PagesTabs({ pages, activePage, onSelect, onAdd }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b" style={{ borderColor: 'var(--color-border)' }}>
      {pages.map(page => (
        <button
          key={page.id}
          onClick={() => onSelect(page)}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap transition-colors ${
            activePage?.id === page.id
              ? 'bg-[var(--color-primary)] text-white'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-alt)]'
          }`}
        >
          {page.name}
        </button>
      ))}
      {onAdd && (
        <button
          onClick={onAdd}
          className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
        >
          <Plus size={16} />
        </button>
      )}
    </div>
  )
}
