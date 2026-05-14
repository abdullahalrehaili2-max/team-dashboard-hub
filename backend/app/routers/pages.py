from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db import get_db
from app import models
from app.auth import get_current_user
from app.schemas import PageCreate, PageUpdate, PageOut

router = APIRouter()


@router.get("/dashboard/{dashboard_id}", response_model=List[PageOut])
def list_pages(dashboard_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(models.Page).filter_by(dashboard_id=dashboard_id).order_by(models.Page.order).all()


@router.post("/dashboard/{dashboard_id}", response_model=PageOut)
def create_page(dashboard_id: int, data: PageCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    obj = models.Page(dashboard_id=dashboard_id, **data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.get("/{id}", response_model=PageOut)
def get_page(id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    obj = db.query(models.Page).filter_by(id=id).first()
    if not obj:
        raise HTTPException(404, "Page not found")
    return obj


@router.put("/{id}", response_model=PageOut)
def update_page(id: int, data: PageUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    obj = db.query(models.Page).filter_by(id=id).first()
    if not obj:
        raise HTTPException(404, "Page not found")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/{id}")
def delete_page(id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    obj = db.query(models.Page).filter_by(id=id).first()
    if not obj:
        raise HTTPException(404, "Page not found")
    db.delete(obj)
    db.commit()
    return {"deleted": True}
