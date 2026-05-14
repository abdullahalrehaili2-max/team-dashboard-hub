from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from app.db import get_db
from app import models
from app.auth import get_current_user
from app.schemas import ThemeCreate, ThemeUpdate, ThemeOut
from app.theme_registry import get_all_presets

router = APIRouter()


@router.get("/presets")
def list_presets():
    return get_all_presets()


@router.get("", response_model=List[ThemeOut])
def list_themes(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(models.Theme).all()


@router.post("", response_model=ThemeOut)
def create_theme(data: ThemeCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    obj = models.Theme(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.get("/{id}", response_model=ThemeOut)
def get_theme(id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    obj = db.query(models.Theme).filter_by(id=id).first()
    if not obj:
        raise HTTPException(404, "Theme not found")
    return obj


@router.put("/{id}", response_model=ThemeOut)
def update_theme(id: int, data: ThemeUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    obj = db.query(models.Theme).filter_by(id=id).first()
    if not obj:
        raise HTTPException(404, "Theme not found")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/{id}")
def delete_theme(id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    obj = db.query(models.Theme).filter_by(id=id).first()
    if not obj:
        raise HTTPException(404, "Theme not found")
    if obj.is_preset:
        raise HTTPException(400, "Cannot delete preset theme")
    db.delete(obj)
    db.commit()
    return {"deleted": True}


@router.post("/extract-from-logo")
async def extract_from_logo(file: UploadFile = File(...), current_user=Depends(get_current_user)):
    """Extract dominant colors from a logo image."""
    from app.services.theme_service import extract_colors_from_image
    content = await file.read()
    colors = extract_colors_from_image(content)
    return {"extracted_colors": colors}
