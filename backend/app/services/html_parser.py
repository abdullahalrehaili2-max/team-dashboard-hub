"""
Parses GASTAT-ENHANCED.html (or any dashboard.html) into Pages + Sections.
Walks every .slide element, creates one Page per slide, extracts KPI cards,
progress bars, tables, charts, and text into Sections with positioned grid_item_json.
"""

import re
from typing import Optional, Dict, Any
from bs4 import BeautifulSoup, Tag
from sqlalchemy.orm import Session
from app import models


# Normalize pixel position to 12-col grid
GRID_COLS = 12
SLIDE_W_PX = 1600
SLIDE_H_PX = 900


def px_to_col(px: float, total: float = SLIDE_W_PX) -> int:
    col = round((px / total) * GRID_COLS)
    return max(1, min(col, GRID_COLS))


def px_to_row(px: float, total: float = SLIDE_H_PX, row_h_px: float = 60) -> int:
    row = round(px / row_h_px)
    return max(0, row)


def _try_float(s: str) -> Optional[float]:
    try:
        return float(re.sub(r"[^\d.\-]", "", s))
    except (ValueError, TypeError):
        return None


def _extract_style(tag: Tag) -> Dict[str, str]:
    """Parse inline style into dict."""
    style = tag.get("style", "")
    result = {}
    for part in style.split(";"):
        part = part.strip()
        if ":" in part:
            k, v = part.split(":", 1)
            result[k.strip()] = v.strip()
    return result


def _get_position(tag: Tag) -> Dict[str, int]:
    """Extract grid position from style left/top/width/height."""
    style = _extract_style(tag)

    def parse_px(val: str) -> float:
        try:
            return float(re.sub(r"[^\d.\-]", "", val))
        except (ValueError, TypeError):
            return 0.0

    left = parse_px(style.get("left", "0"))
    top = parse_px(style.get("top", "0"))
    width = parse_px(style.get("width", "300"))
    height = parse_px(style.get("height", "150"))

    x = px_to_col(left)
    y = px_to_row(top)
    w = max(1, px_to_col(width))
    h = max(1, round(height / 60))
    return {"x": x, "y": y, "w": w, "h": h}


def _detect_indicator(tag: Tag) -> str:
    """Heuristic: detect indicator type from element classes/content."""
    classes = " ".join(tag.get("class", []))
    html_lower = str(tag).lower()

    if "gauge" in classes or "gauge" in html_lower:
        return "GAUGE"
    if "progress" in classes or "progress-bar" in html_lower or "<progress" in html_lower:
        return "PROGRESS_BAR"
    if "sparkline" in classes or "sparkline" in html_lower:
        return "SPARKLINE"
    if "chart" in classes:
        if "line" in classes:
            return "LINE_CHART"
        if "area" in classes:
            return "AREA_CHART"
        if "bar" in classes or "column" in classes:
            return "BAR_CHART"
        if "pie" in classes or "donut" in classes or "doughnut" in classes:
            return "PIE_DONUT"
        if "radar" in classes:
            return "RADAR"
        if "waterfall" in classes:
            return "WATERFALL"
        if "funnel" in classes:
            return "FUNNEL"
        return "BAR_CHART"
    if "heatmap" in classes or "heat-map" in html_lower:
        return "HEATMAP"
    if "kpi-tile-group" in classes or "tile-group" in classes:
        return "KPI_TILE_GROUP"
    if tag.find("table"):
        return "TABLE"
    if tag.find("img"):
        return "IMAGE_CARD"
    if "kpi" in classes or "metric" in classes or "stat" in classes:
        return "KPI_CARD"
    # Check if it has a big number
    text = tag.get_text()
    numbers = re.findall(r"\d[\d,\.]+", text)
    if numbers:
        return "KPI_CARD"
    return "TEXT_NOTE"


def _extract_title(tag: Tag) -> str:
    """Try to find a heading/title within the element."""
    for heading_tag in ["h1", "h2", "h3", "h4", "h5", "h6"]:
        h = tag.find(heading_tag)
        if h:
            return h.get_text(strip=True)
    # Look for title class
    t = tag.find(class_=re.compile(r"title|heading|label", re.I))
    if t:
        return t.get_text(strip=True)[:80]
    # Fallback: first meaningful text
    text = tag.get_text(" ", strip=True)[:60]
    return text if text else "Section"


def _extract_config(tag: Tag, indicator_type: str) -> Dict[str, Any]:
    """Extract basic config from indicator HTML."""
    config: Dict[str, Any] = {}
    if indicator_type == "TEXT_NOTE":
        config["html_content"] = str(tag)
    elif indicator_type == "IMAGE_CARD":
        img = tag.find("img")
        if img:
            config["src"] = img.get("src", "")
            config["alt"] = img.get("alt", "")
    return config


def parse_dashboard_html(html_content: str, dashboard_id: int, db: Session) -> Dict[str, Any]:
    """
    Main entry: parse HTML into Pages + Sections for a given dashboard.
    Returns {pages: N, sections: M}.
    """
    soup = BeautifulSoup(html_content, "lxml")

    # Find slide containers — common class names used in presentation-style HTML
    slides = (
        soup.find_all(class_=re.compile(r"slide|page|dashboard-page", re.I))
        or soup.find_all("section")
        or [soup.body or soup]
    )

    # Limit to reasonable count
    slides = [s for s in slides if isinstance(s, Tag)][:50]

    if not slides:
        # Fallback: treat the whole body as one page
        slides = [soup.body or soup]

    # Remove existing pages for this dashboard
    existing_pages = db.query(models.Page).filter_by(dashboard_id=dashboard_id).all()
    for p in existing_pages:
        db.delete(p)
    db.flush()

    total_sections = 0

    for page_idx, slide in enumerate(slides):
        # Page name: look for slide title
        title_el = slide.find(class_=re.compile(r"slide-title|page-title|heading", re.I)) or slide.find(["h1", "h2"])
        page_name = title_el.get_text(strip=True)[:80] if title_el else f"Page {page_idx + 1}"

        page = models.Page(
            dashboard_id=dashboard_id,
            name=page_name,
            order=page_idx,
        )
        db.add(page)
        db.flush()

        # Find cards/widgets within this slide
        cards = slide.find_all(class_=re.compile(
            r"card|widget|kpi|metric|chart|gauge|progress|stat|indicator|panel|tile", re.I
        ), recursive=True)

        if not cards:
            # Degrade: one TEXT_NOTE for the whole slide
            section = models.Section(
                dashboard_id=dashboard_id,
                page_id=page.id,
                title=page_name,
                order=0,
                grid_item_json={"x": 0, "y": 0, "w": 12, "h": 6},
                indicator_type="TEXT_NOTE",
                indicator_config_json={"html_content": str(slide)[:4000]},
            )
            db.add(section)
            total_sections += 1
            continue

        for card_idx, card in enumerate(cards[:20]):  # max 20 per slide
            try:
                indicator_type = _detect_indicator(card)
                title = _extract_title(card)
                pos = _get_position(card)
                config = _extract_config(card, indicator_type)

                section = models.Section(
                    dashboard_id=dashboard_id,
                    page_id=page.id,
                    title=title,
                    order=card_idx,
                    grid_item_json=pos,
                    indicator_type=indicator_type,
                    indicator_config_json=config,
                )
                db.add(section)
                total_sections += 1
            except Exception:
                # Degrade gracefully
                section = models.Section(
                    dashboard_id=dashboard_id,
                    page_id=page.id,
                    title=f"Section {card_idx + 1}",
                    order=card_idx,
                    grid_item_json={"x": (card_idx % 4) * 3, "y": (card_idx // 4) * 3, "w": 3, "h": 2},
                    indicator_type="TEXT_NOTE",
                    indicator_config_json={"html_content": str(card)[:2000]},
                )
                db.add(section)
                total_sections += 1

    db.commit()
    return {"pages": len(slides), "sections": total_sections}
