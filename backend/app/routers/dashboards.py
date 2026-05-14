from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db import get_db
from app import models
from app.auth import get_current_user
from app.schemas import DashboardCreate, DashboardUpdate, DashboardOut

router = APIRouter()


@router.get("", response_model=List[DashboardOut])
def list_dashboards(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(models.Dashboard).all()


@router.post("", response_model=DashboardOut)
def create_dashboard(data: DashboardCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    obj = models.Dashboard(**data.model_dump(), created_by=current_user.id)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.get("/{id}", response_model=DashboardOut)
def get_dashboard(id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    obj = db.query(models.Dashboard).filter_by(id=id).first()
    if not obj:
        raise HTTPException(404, "Dashboard not found")
    return obj


@router.put("/{id}", response_model=DashboardOut)
def update_dashboard(id: int, data: DashboardUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    obj = db.query(models.Dashboard).filter_by(id=id).first()
    if not obj:
        raise HTTPException(404, "Dashboard not found")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/{id}")
def delete_dashboard(id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    obj = db.query(models.Dashboard).filter_by(id=id).first()
    if not obj:
        raise HTTPException(404, "Dashboard not found")
    db.delete(obj)
    db.commit()
    return {"deleted": True}


@router.post("/{id}/seed-from-html")
def seed_from_html(id: int, file: UploadFile = File(...), db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    from app.services.html_parser import parse_dashboard_html
    dashboard = db.query(models.Dashboard).filter_by(id=id).first()
    if not dashboard:
        raise HTTPException(404, "Dashboard not found")
    content = file.file.read().decode("utf-8", errors="ignore")
    result = parse_dashboard_html(content, dashboard_id=id, db=db)
    return {"seeded": True, "pages": result.get("pages", 0), "sections": result.get("sections", 0)}


@router.put("/{id}/settings")
def update_settings(id: int, settings_json: dict, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    obj = db.query(models.Dashboard).filter_by(id=id).first()
    if not obj:
        raise HTTPException(404, "Dashboard not found")
    obj.settings_json = {**(obj.settings_json or {}), **settings_json}
    db.commit()
    return {"updated": True}
