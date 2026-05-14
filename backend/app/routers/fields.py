from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db import get_db
from app import models
from app.auth import get_current_user
from app.schemas import FieldCreate, FieldOut

router = APIRouter()


@router.get("/section/{section_id}", response_model=List[FieldOut])
def list_fields(section_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(models.Field).filter_by(section_id=section_id).all()


@router.post("/section/{section_id}", response_model=FieldOut)
def create_field(section_id: int, data: FieldCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    obj = models.Field(section_id=section_id, **data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.get("/{id}", response_model=FieldOut)
def get_field(id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    obj = db.query(models.Field).filter_by(id=id).first()
    if not obj:
        raise HTTPException(404, "Field not found")
    return obj


@router.put("/{id}", response_model=FieldOut)
def update_field(id: int, data: FieldCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    obj = db.query(models.Field).filter_by(id=id).first()
    if not obj:
        raise HTTPException(404, "Field not found")
    for k, v in data.model_dump().items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/{id}")
def delete_field(id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    obj = db.query(models.Field).filter_by(id=id).first()
    if not obj:
        raise HTTPException(404, "Field not found")
    db.delete(obj)
    db.commit()
    return {"deleted": True}
