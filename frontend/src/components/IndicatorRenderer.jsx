import React, { Suspense } from 'react'

// Import all 20 indicator components
import KPICard from './indicators/KPICard.jsx'
import KPITileGroup from './indicators/KPITileGroup.jsx'
import Gauge from './indicators/Gauge.jsx'
import ProgressBar from './indicators/ProgressBar.jsx'
import Sparkline from './indicators/Sparkline.jsx'
import LineChart from './indicators/LineChart.jsx'
import AreaChart from './indicators/AreaChart.jsx'
import BarChart from './indicators/BarChart.jsx'
import ColumnTrend from './indicators/ColumnTrend.jsx'
import HorizontalBar from './indicators/HorizontalBar.jsx'
import PieDonut from './indicators/PieDonut.jsx'
import Radar from './indicators/Radar.jsx'
import Heatmap from './indicators/Heatmap.jsx'
import TableIndicator from './indicators/TableIndicator.jsx'
import BulletChart from './indicators/BulletChart.jsx'
import Waterfall from './indicators/Waterfall.jsx'
import Funnel from './indicators/Funnel.jsx'
import BigStatHero from './indicators/BigStatHero.jsx'
import TextNote from './indicators/TextNote.jsx'
import ImageCard from './indicators/ImageCard.jsx'

const REGISTRY = {
  KPI_CARD: KPICard,
  KPI_TILE_GROUP: KPITileGroup,
  GAUGE: Gauge,
  PROGRESS_BAR: ProgressBar,
  SPARKLINE: Sparkline,
  LINE_CHART: LineChart,
  AREA_CHART: AreaChart,
  BAR_CHART: BarChart,
  COLUMN_TREND: ColumnTrend,
  HORIZONTAL_BAR: HorizontalBar,
  PIE_DONUT: PieDonut,
  RADAR: Radar,
  HEATMAP: Heatmap,
  TABLE: TableIndicator,
  BULLET_CHART: BulletChart,
  WATERFALL: Waterfall,
  FUNNEL: Funnel,
  BIG_STAT_HERO: BigStatHero,
  TEXT_NOTE: TextNote,
  IMAGE_CARD: ImageCard,
}

export default function IndicatorRenderer({ section, deltaData }) {
  const Component = REGISTRY[section?.indicator_type] || KPICard
  const config = section?.indicator_config_json || {}
  const sectionDeltas = deltaData?.sections?.find(s => s.section_id === section?.id)

  return (
    <div className="w-full h-full p-2">
      <Component
        config={config}
        section={section}
        deltaData={sectionDeltas}
      />
    </div>
  )
}
