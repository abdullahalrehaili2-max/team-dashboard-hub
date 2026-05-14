from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from app.db import get_db
from app import models
from app.auth import get_current_user
from app.schemas import EntryCreate, EntryOut
from app.week_utils import iso_week_start

router = APIRouter()


@router.get("/{field_id}/entry/{week_start}", response_model=EntryOut)
def get_entry(field_id: int, week_start: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    obj = db.query(models.FieldValue).filter_by(field_id=field_id, week_start=week_start).first()
    if not obj:
        raise HTTPException(404, "Entry not found")
    return obj


@router.post("/{field_id}/entry/{week_start}", response_model=EntryOut)
def upsert_entry(
    field_id: int,
    week_start: str,
    data: EntryCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    field = db.query(models.Field).filter_by(id=field_id).first()
    if not field:
        raise HTTPException(404, "Field not found")
    obj = db.query(models.FieldValue).filter_by(field_id=field_id, week_start=week_start).first()
    if obj:
        for k, v in data.model_dump(exclude_none=True).items():
            setattr(obj, k, v)
    else:
        obj = models.FieldValue(
            field_id=field_id,
            week_start=week_start,
            entered_by=current_user.id,
            **data.model_dump(exclude_none=True),
        )
        db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.get("/{field_id}", response_model=List[EntryOut])
def list_entries(
    field_id: int,
    limit: int = 52,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return (
        db.query(models.FieldValue)
        .filter_by(field_id=field_id)
        .order_by(models.FieldValue.week_start.desc())
        .limit(limit)
        .all()
    )


@router.post("/backfill")
def backfill_entries(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Bulk backfill: {field_id, values: [{week_start, value_num}]}"""
    field_id = payload.get("field_id")
    values = payload.get("values", [])
    created = 0
    for item in values:
        ws = item.get("week_start")
        existing = db.query(models.FieldValue).filter_by(field_id=field_id, week_start=ws).first()
        if not existing:
            db.add(models.FieldValue(
                field_id=field_id,
                week_start=ws,
                value_num=item.get("value_num"),
                value_text=item.get("value_text"),
                value_json=item.get("value_json"),
                entered_by=current_user.id,
            ))
            created += 1
    db.commit()
    return {"backfilled": created}
