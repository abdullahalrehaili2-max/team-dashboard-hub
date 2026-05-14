from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse, HTMLResponse
from sqlalchemy.orm import Session
from app.db import get_db
from app import models
from app.auth import get_current_user

router = APIRouter()


@router.get("/{dashboard_id}/pdf")
def export_pdf(dashboard_id: int, week: str = None, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    from app.services.pdf_export import export_dashboard_pdf
    dashboard = db.query(models.Dashboard).filter_by(id=dashboard_id).first()
    if not dashboard:
        raise HTTPException(404, "Dashboard not found")
    path = export_dashboard_pdf(dashboard, db=db, week=week)
    return FileResponse(path, media_type="application/pdf", filename=f"dashboard_{dashboard_id}.pdf")


@router.get("/{dashboard_id}/pptx")
def export_pptx(dashboard_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    from app.services.pptx_export import export_dashboard_pptx
    dashboard = db.query(models.Dashboard).filter_by(id=dashboard_id).first()
    if not dashboard:
        raise HTTPException(404, "Dashboard not found")
    path = export_dashboard_pptx(dashboard, db=db)
    return FileResponse(path, media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation", filename=f"dashboard_{dashboard_id}.pptx")


@router.get("/{dashboard_id}/html")
def export_html(dashboard_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    from app.services.html_export import export_dashboard_html
    dashboard = db.query(models.Dashboard).filter_by(id=dashboard_id).first()
    if not dashboard:
        raise HTTPException(404, "Dashboard not found")
    html = export_dashboard_html(dashboard, db=db)
    return HTMLResponse(content=html)
