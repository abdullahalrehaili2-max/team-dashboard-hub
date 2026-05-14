from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db import get_db
from app import models
from app.auth import get_current_user
from app.schemas import SectionCreate, SectionUpdate, SectionOut

router = APIRouter()


@router.get("/dashboard/{dashboard_id}", response_model=List[SectionOut])
def list_sections(dashboard_id: int, page_id: int = None, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    q = db.query(models.Section).filter_by(dashboard_id=dashboard_id)
    if page_id:
        q = q.filter_by(page_id=page_id)
    return q.order_by(models.Section.order).all()


@router.post("/dashboard/{dashboard_id}", response_model=SectionOut)
def create_section(dashboard_id: int, data: SectionCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    obj = models.Section(dashboard_id=dashboard_id, **data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.get("/{id}", response_model=SectionOut)
def get_section(id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    obj = db.query(models.Section).filter_by(id=id).first()
    if not obj:
        raise HTTPException(404, "Section not found")
    return obj


@router.put("/{id}", response_model=SectionOut)
def update_section(id: int, data: SectionUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    obj = db.query(models.Section).filter_by(id=id).first()
    if not obj:
        raise HTTPException(404, "Section not found")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/{id}")
def delete_section(id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    obj = db.query(models.Section).filter_by(id=id).first()
    if not obj:
        raise HTTPException(404, "Section not found")
    db.delete(obj)
    db.commit()
    return {"deleted": True}


@router.post("/{id}/indicator")
def swap_indicator(id: int, indicator_type: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    from app.indicator_registry import get_indicator
    obj = db.query(models.Section).filter_by(id=id).first()
    if not obj:
        raise HTTPException(404, "Section not found")
    ind = get_indicator(indicator_type)
    # Save revision
    rev = models.Revision(
        dashboard_id=obj.dashboard_id,
        section_id=obj.id,
        user_id=current_user.id,
        diff_json={"old_type": obj.indicator_type, "new_type": indicator_type},
        action="indicator_swap",
    )
    db.add(rev)
    obj.indicator_type = indicator_type
    obj.indicator_config_json = ind.get("default_config", {})
    db.commit()
    db.refresh(obj)
    return obj


@router.post("/{id}/adapter")
def adapt_indicator(id: int, target_type: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Auto-adapt section to target indicator type if compatible."""
    from app.indicator_registry import get_indicator
    obj = db.query(models.Section).filter_by(id=id).first()
    if not obj:
        raise HTTPException(404, "Section not found")
    ind = get_indicator(target_type)
    if obj.indicator_type not in ind.get("can_adapt_from", []):
        raise HTTPException(400, f"Cannot adapt from {obj.indicator_type} to {target_type}")
    obj.indicator_type = target_type
    obj.indicator_config_json = ind.get("default_config", {})
    db.commit()
    return {"adapted": True, "type": target_type}
