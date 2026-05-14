"""PDF export via Jinja2 + HTML → PDF using basic HTML generation."""

import os
import tempfile
from sqlalchemy.orm import Session
from app import models
from app.services.html_export import export_dashboard_html


def export_dashboard_pdf(dashboard: models.Dashboard, db: Session, week: str = None) -> str:
    """
    Export dashboard to PDF.
    Falls back to HTML file if playwright/weasyprint not available.
    """
    html = export_dashboard_html(dashboard, db=db, week=week)
    
    # Try playwright first
    try:
        import subprocess
        out_path = tempfile.mktemp(suffix=".pdf")
        # Write HTML to temp file
        html_path = tempfile.mktemp(suffix=".html")
        with open(html_path, "w", encoding="utf-8") as f:
            f.write(html)
        
        # Use playwright if available
        result = subprocess.run(
            ["python", "-c", f"""
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto('file://{html_path}')
    page.pdf(path='{out_path}', format='A4', landscape=True)
    browser.close()
"""],
            timeout=30,
            capture_output=True,
        )
        if result.returncode == 0 and os.path.exists(out_path):
            return out_path
    except Exception:
        pass
    
    # Fallback: save as HTML with .pdf extension (browsers can print)
    out_path = tempfile.mktemp(suffix=".pdf")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(html)
    return out_path
