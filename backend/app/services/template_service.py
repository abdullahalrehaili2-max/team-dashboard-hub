"""Template freeze, clone, cover generation, and preview rendering."""

import os
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from app import models


def freeze_dashboard_as_template(
    dashboard_id: int,
    name: str,
    description: str,
    category: str,
    visibility: str,
    author_id: int,
    db: Session,
) -> models.Template:
    """Snapshot current dashboard into a template bundle."""
    dashboard = db.query(models.Dashboard).filter_by(id=dashboard_id).first()
    if not dashboard:
        raise ValueError("Dashboard not found")

    pages = db.query(models.Page).filter_by(dashboard_id=dashboard_id).order_by(models.Page.order).all()
    pages_data = []
    for page in pages:
        sections = db.query(models.Section).filter_by(page_id=page.id).order_by(models.Section.order).all()
        sections_data = []
        for sec in sections:
            fields = db.query(models.Field).filter_by(section_id=sec.id).all()
            fields_data = [
                {
                    "key": f.key,
                    "label": f.label,
                    "data_type": f.data_type,
                    "unit": f.unit,
                    "direction_good": f.direction_good,
                    "format_json": f.format_json,
                    "sample_value": None,
                }
                for f in fields
            ]
            sections_data.append({
                "key": sec.section_key or f"sec_{sec.id}",
                "title": sec.title,
                "indicator_type": sec.indicator_type,
                "grid_item_json": sec.grid_item_json,
                "indicator_config_json": sec.indicator_config_json,
                "data_binding_json": sec.data_binding_json,
                "fields": fields_data,
            })
        pages_data.append({
            "name": page.name,
            "order": page.order,
            "sections": sections_data,
        })

    bundle = {
        "meta": {
            "name": name,
            "description": description,
            "category": category,
            "version": "1.0.0",
        },
        "theme": "gastat_executive",
        "settings": dashboard.settings_json or {},
        "pages": pages_data,
    }

    slug = name.lower().replace(" ", "-").replace("/", "-")[:80]
    # Ensure unique
    if db.query(models.Template).filter_by(slug=slug).first():
        slug = f"{slug}-{int(datetime.utcnow().timestamp())}"

    tpl = models.Template(
        name=name,
        slug=slug,
        description=description,
        category=category,
        visibility=visibility,
        is_official=False,
        version="1.0.0",
        bundle_json=bundle,
        author_id=author_id,
    )
    db.add(tpl)
    db.commit()
    db.refresh(tpl)
    return tpl


def clone_template_to_dashboard(
    template: models.Template,
    name: str,
    user_id: int,
    db: Session,
) -> models.Dashboard:
    """Create a new dashboard from a template bundle. No field_values copied."""
    bundle = template.bundle_json or {}

    dashboard = models.Dashboard(
        name=name,
        created_by=user_id,
        created_from_template_id=template.id,
        installed_template_version=template.version,
        settings_json=bundle.get("settings", {}),
    )
    db.add(dashboard)
    db.flush()

    for page_data in bundle.get("pages", []):
        page = models.Page(
            dashboard_id=dashboard.id,
            name=page_data.get("name", "Page"),
            order=page_data.get("order", 0),
        )
        db.add(page)
        db.flush()

        for sec_data in page_data.get("sections", []):
            section = models.Section(
                dashboard_id=dashboard.id,
                page_id=page.id,
                title=sec_data.get("title", ""),
                section_key=sec_data.get("key"),
                grid_item_json=sec_data.get("grid_item_json", {}),
                indicator_type=sec_data.get("indicator_type", "KPI_CARD"),
                indicator_config_json=sec_data.get("indicator_config_json", {}),
                data_binding_json=sec_data.get("data_binding_json", {}),
            )
            db.add(section)
            db.flush()

            for field_data in sec_data.get("fields", []):
                field = models.Field(
                    section_id=section.id,
                    key=field_data.get("key", "value"),
                    label=field_data.get("label", ""),
                    data_type=field_data.get("data_type", "number"),
                    unit=field_data.get("unit", ""),
                    direction_good=field_data.get("direction_good", "up"),
                    format_json=field_data.get("format_json", {}),
                )
                db.add(field)

    # Record install
    install = models.TemplateInstall(
        template_id=template.id,
        dashboard_id=dashboard.id,
        installed_by=user_id,
    )
    db.add(install)
    db.commit()
    db.refresh(dashboard)
    return dashboard


def generate_cover_image(template_id: int) -> str:
    """
    Generate a cover image via Playwright screenshot of the preview endpoint.
    Returns the saved path.
    """
    from app.config import settings
    out_dir = os.path.join(settings.UPLOADS_DIR, "template_covers")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, f"{template_id}.png")
    url = f"{settings.PUBLIC_BASE_URL}/templates/{template_id}/preview"

    try:
        from playwright.sync_api import sync_playwright
        with sync_playwright() as p:
            browser = p.chromium.launch(args=["--no-sandbox", "--disable-dev-shm-usage"])
            page = browser.new_page(viewport={"width": 1600, "height": 900})
            page.goto(url, timeout=15000)
            page.wait_for_timeout(2000)
            page.screenshot(path=out_path, full_page=False)
            browser.close()
    except Exception:
        # Create a placeholder image
        try:
            from PIL import Image, ImageDraw, ImageFont
            img = Image.new("RGB", (1600, 900), color="#0f0e1c")
            draw = ImageDraw.Draw(img)
            draw.text((800, 450), f"Template {template_id}", fill="#4137A8", anchor="mm")
            img.save(out_path)
        except Exception:
            pass

    return out_path


def render_template_preview(template: models.Template) -> str:
    """Render a read-only HTML preview of a template using sample_values."""
    from jinja2 import Template
    bundle = template.bundle_json or {}
    pages = bundle.get("pages", [])

    html = f"""<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<title>{template.name} - Preview</title>
<style>
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{ font-family: 'IBM Plex Sans Arabic', Arial, sans-serif; background: #0f0e1c; color: #f4f4f8; padding: 24px; }}
  h1 {{ font-size: 1.8rem; color: #27CED7; margin-bottom: 8px; }}
  .badge {{ display: inline-block; background: #4137A8; color: #fff; padding: 2px 10px; border-radius: 20px; font-size: 0.75rem; margin-bottom: 24px; }}
  .page {{ margin-bottom: 32px; }}
  .page-name {{ font-size: 1.1rem; color: #9b9bb4; border-bottom: 1px solid #2d2b4e; padding-bottom: 8px; margin-bottom: 12px; }}
  .grid {{ display: grid; grid-template-columns: repeat(12, 1fr); gap: 8px; }}
  .card {{ background: rgba(65,55,168,0.18); border: 1px solid rgba(65,55,168,0.4); border-radius: 10px; padding: 12px; min-height: 80px; }}
  .card-title {{ font-size: 0.8rem; color: #9b9bb4; margin-bottom: 4px; }}
  .card-type {{ font-size: 0.65rem; background: rgba(39,206,215,0.15); color: #27CED7; display: inline-block; padding: 1px 6px; border-radius: 8px; }}
  .sample {{ font-size: 1.4rem; font-weight: 700; color: #f4f4f8; margin-top: 6px; }}
</style>
</head>
<body>
<h1>{template.name}</h1>
<span class="badge">{template.category}</span>
"""

    for page in pages:
        html += f'<div class="page"><div class="page-name">{page.get("name", "Page")}</div><div class="grid">'
        for sec in page.get("sections", []):
            gi = sec.get("grid_item_json", {})
            span = min(gi.get("w", 3), 12)
            sample = ""
            for field in sec.get("fields", [])[:1]:
                sv = field.get("sample_value")
                if sv is not None:
                    sample = f'<div class="sample">{sv}</div>'
            html += f'<div class="card" style="grid-column: span {span};"><div class="card-title">{sec.get("title", "")}</div><span class="card-type">{sec.get("indicator_type", "KPI_CARD")}</span>{sample}</div>'
        html += "</div></div>"

    html += "</body></html>"
    return html
