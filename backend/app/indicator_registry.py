"""Registry of all 20 indicator types with shapes, defaults, and adaptation rules."""

from typing import Dict, Any, List

INDICATORS: Dict[str, Dict[str, Any]] = {
    "KPI_CARD": {
        "label": "KPI Card",
        "required_field_shape": {"primary": "number"},
        "optional_fields": {"target": "number", "secondary": "number"},
        "default_config": {"show_delta": True, "show_sparkline": False},
        "min_w": 2, "min_h": 2,
        "can_adapt_from": ["KPI_TILE_GROUP", "BIG_STAT_HERO", "GAUGE"],
    },
    "KPI_TILE_GROUP": {
        "label": "KPI Tile Group",
        "required_field_shape": {"items": "series"},
        "optional_fields": {},
        "default_config": {"columns": 3},
        "min_w": 4, "min_h": 2,
        "can_adapt_from": ["KPI_CARD"],
    },
    "GAUGE": {
        "label": "Gauge",
        "required_field_shape": {"value": "number", "max": "number"},
        "optional_fields": {"target": "number"},
        "default_config": {"arc_width": 20, "show_value": True},
        "min_w": 2, "min_h": 2,
        "can_adapt_from": ["KPI_CARD", "PROGRESS_BAR", "BULLET_CHART"],
    },
    "PROGRESS_BAR": {
        "label": "Progress Bar",
        "required_field_shape": {"value": "number", "max": "number"},
        "optional_fields": {"label": "text"},
        "default_config": {"show_pct": True, "color": "primary"},
        "min_w": 2, "min_h": 1,
        "can_adapt_from": ["GAUGE", "BULLET_CHART"],
    },
    "SPARKLINE": {
        "label": "Sparkline",
        "required_field_shape": {"series": "series"},
        "optional_fields": {},
        "default_config": {"stroke_width": 2, "show_area": False},
        "min_w": 2, "min_h": 1,
        "can_adapt_from": ["LINE_CHART", "AREA_CHART"],
    },
    "LINE_CHART": {
        "label": "Line Chart",
        "required_field_shape": {"series": "series"},
        "optional_fields": {"target_series": "series"},
        "default_config": {"show_grid": True, "show_legend": True, "show_dots": True},
        "min_w": 3, "min_h": 3,
        "can_adapt_from": ["AREA_CHART", "SPARKLINE", "BAR_CHART"],
    },
    "AREA_CHART": {
        "label": "Area Chart",
        "required_field_shape": {"series": "series"},
        "optional_fields": {},
        "default_config": {"gradient": True, "show_grid": True},
        "min_w": 3, "min_h": 3,
        "can_adapt_from": ["LINE_CHART", "SPARKLINE"],
    },
    "BAR_CHART": {
        "label": "Bar Chart",
        "required_field_shape": {"series": "series"},
        "optional_fields": {},
        "default_config": {"bar_size": 20, "show_grid": True, "layout": "vertical"},
        "min_w": 3, "min_h": 3,
        "can_adapt_from": ["LINE_CHART", "COLUMN_TREND", "HORIZONTAL_BAR"],
    },
    "COLUMN_TREND": {
        "label": "Column Trend",
        "required_field_shape": {"series": "series"},
        "optional_fields": {"target_series": "series"},
        "default_config": {"show_reference_line": True},
        "min_w": 3, "min_h": 3,
        "can_adapt_from": ["BAR_CHART", "LINE_CHART"],
    },
    "HORIZONTAL_BAR": {
        "label": "Horizontal Bar",
        "required_field_shape": {"categories": "table"},
        "optional_fields": {},
        "default_config": {"bar_size": 16, "label_position": "insideLeft"},
        "min_w": 3, "min_h": 2,
        "can_adapt_from": ["BAR_CHART", "FUNNEL"],
    },
    "PIE_DONUT": {
        "label": "Pie / Donut",
        "required_field_shape": {"categories": "table"},
        "optional_fields": {},
        "default_config": {"inner_radius": 60, "outer_radius": 90, "show_labels": True},
        "min_w": 3, "min_h": 3,
        "can_adapt_from": ["HORIZONTAL_BAR", "FUNNEL"],
    },
    "RADAR": {
        "label": "Radar",
        "required_field_shape": {"categories": "table"},
        "optional_fields": {},
        "default_config": {"filled": True, "stroke_width": 2},
        "min_w": 3, "min_h": 3,
        "can_adapt_from": ["PIE_DONUT"],
    },
    "HEATMAP": {
        "label": "Heatmap",
        "required_field_shape": {"matrix": "table"},
        "optional_fields": {},
        "default_config": {"color_scale": ["#0f0e1c", "#4137A8", "#27CED7"]},
        "min_w": 4, "min_h": 3,
        "can_adapt_from": ["TABLE"],
    },
    "TABLE": {
        "label": "Table",
        "required_field_shape": {"rows": "table"},
        "optional_fields": {},
        "default_config": {"striped": True, "compact": False, "sortable": True},
        "min_w": 4, "min_h": 2,
        "can_adapt_from": ["HEATMAP", "HORIZONTAL_BAR"],
    },
    "BULLET_CHART": {
        "label": "Bullet Chart",
        "required_field_shape": {"value": "number", "target": "number", "ranges": "series"},
        "optional_fields": {},
        "default_config": {"orientation": "horizontal"},
        "min_w": 3, "min_h": 2,
        "can_adapt_from": ["GAUGE", "PROGRESS_BAR"],
    },
    "WATERFALL": {
        "label": "Waterfall",
        "required_field_shape": {"series": "series"},
        "optional_fields": {},
        "default_config": {"show_total": True},
        "min_w": 4, "min_h": 3,
        "can_adapt_from": ["BAR_CHART", "COLUMN_TREND"],
    },
    "FUNNEL": {
        "label": "Funnel",
        "required_field_shape": {"stages": "table"},
        "optional_fields": {},
        "default_config": {"show_values": True, "show_pct": True},
        "min_w": 3, "min_h": 3,
        "can_adapt_from": ["HORIZONTAL_BAR", "PIE_DONUT"],
    },
    "BIG_STAT_HERO": {
        "label": "Big Stat Hero",
        "required_field_shape": {"primary": "number"},
        "optional_fields": {"subtitle": "text", "trend": "series"},
        "default_config": {"font_size": "4xl", "show_trend": True},
        "min_w": 3, "min_h": 2,
        "can_adapt_from": ["KPI_CARD"],
    },
    "TEXT_NOTE": {
        "label": "Text Note",
        "required_field_shape": {"content": "text"},
        "optional_fields": {},
        "default_config": {"html_content": "", "variant": "default"},
        "min_w": 2, "min_h": 1,
        "can_adapt_from": ["IMAGE_CARD"],
    },
    "IMAGE_CARD": {
        "label": "Image Card",
        "required_field_shape": {"src": "text"},
        "optional_fields": {"caption": "text"},
        "default_config": {"object_fit": "contain", "bg": "transparent"},
        "min_w": 2, "min_h": 2,
        "can_adapt_from": ["TEXT_NOTE"],
    },
}


def get_registry() -> List[Dict[str, Any]]:
    result = []
    for key, val in INDICATORS.items():
        result.append({"type": key, **val})
    return result


def get_indicator(type_name: str) -> Dict[str, Any]:
    return INDICATORS.get(type_name, INDICATORS["KPI_CARD"])
