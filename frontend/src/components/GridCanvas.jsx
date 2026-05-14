import React, { useMemo } from 'react'
import { Responsive, WidthProvider } from 'react-grid-layout'
import SectionFrame from './SectionFrame.jsx'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

const ResponsiveGrid = WidthProvider(Responsive)

export default function GridCanvas({
  sections = [],
  editMode = false,
  onLayoutChange,
  onDeleteSection,
  onSwapIndicator,
  onSuggestSection,
  deltaData,
}) {
  const layouts = useMemo(() => {
    const lg = sections.map(s => ({
      i: String(s.id),
      x: s.grid_item_json?.x ?? 0,
      y: s.grid_item_json?.y ?? 0,
      w: s.grid_item_json?.w ?? 3,
      h: s.grid_item_json?.h ?? 2,
      minW: 2,
      minH: 1,
      static: !editMode,
    }))
    return { lg, md: lg, sm: lg.map(i => ({ ...i, x: 0, w: 12 })) }
  }, [sections, editMode])

  return (
    <div className="w-full">
      <ResponsiveGrid
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
        cols={{ lg: 12, md: 12, sm: 6, xs: 4 }}
        rowHeight={60}
        isDraggable={editMode}
        isResizable={editMode}
        onLayoutChange={(layout, allLayouts) => onLayoutChange?.(layout, allLayouts)}
        margin={[8, 8]}
        containerPadding={[0, 0]}
        useCSSTransforms
      >
        {sections.map(section => (
          <div key={String(section.id)}>
            <SectionFrame
              section={section}
              editMode={editMode}
              onDelete={onDeleteSection}
              onSwap={onSwapIndicator}
              onSuggest={onSuggestSection}
              deltaData={deltaData}
            />
          </div>
        ))}
      </ResponsiveGrid>
    </div>
  )
}
