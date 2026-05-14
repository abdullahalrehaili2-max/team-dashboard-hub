import secrets
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app import models
from app.auth import get_current_user, optional_user
from app.schemas import ShareCreate, ShareOut

router = APIRouter()


@router.post("", response_model=ShareOut)
def create_share(data: ShareCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    token = secrets.token_urlsafe(32)
    obj = models.ShareLink(
        dashboard_id=data.dashboard_id,
        token=token,
        expires_at=data.expires_at,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.get("/{token}")
def view_shared(token: str, db: Session = Depends(get_db)):
    link = db.query(models.ShareLink).filter_by(token=token).first()
    if not link:
        raise HTTPException(404, "Share link not found")
    if link.expires_at and link.expires_at < datetime.utcnow():
        raise HTTPException(410, "Share link expired")
    dashboard = db.query(models.Dashboard).filter_by(id=link.dashboard_id).first()
    if not dashboard:
        raise HTTPException(404, "Dashboard not found")
    # Return public-safe view of dashboard
    sections = db.query(models.Section).filter_by(dashboard_id=dashboard.id).all()
    return {
        "dashboard": {
            "id": dashboard.id,
            "name": dashboard.name,
            "theme_id": dashboard.theme_id,
            "layout_json": dashboard.layout_json,
        },
        "sections": [
            {
                "id": s.id,
                "title": s.title,
                "indicator_type": s.indicator_type,
                "grid_item_json": s.grid_item_json,
                "indicator_config_json": s.indicator_config_json,
            }
            for s in sections
        ],
        "token": token,
    }
