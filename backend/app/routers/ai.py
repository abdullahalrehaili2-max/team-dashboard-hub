from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import Dict, Any
from app.db import get_db
from app import models
from app.auth import get_current_user
from app.schemas import AISuggestApplyRequest

router = APIRouter()


@router.get("/suggest/indicators/{dashboard_id}")
def suggest_indicators(dashboard_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    from app.services.ai_suggester import get_indicator_suggestions
    dashboard = db.query(models.Dashboard).filter_by(id=dashboard_id).first()
    if not dashboard:
        raise HTTPException(404, "Dashboard not found")
    return get_indicator_suggestions(dashboard_id=dashboard_id, db=db)


@router.get("/suggest/layout/{dashboard_id}")
def suggest_layout(dashboard_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    from app.services.ai_suggester import get_layout_suggestions
    dashboard = db.query(models.Dashboard).filter_by(id=dashboard_id).first()
    if not dashboard:
        raise HTTPException(404, "Dashboard not found")
    return get_layout_suggestions(dashboard_id=dashboard_id, db=db)


@router.post("/suggest/apply")
def apply_suggestions(data: AISuggestApplyRequest, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    from app.services.ai_suggester import apply_suggestions as do_apply
    result = do_apply(
        dashboard_id=data.dashboard_id,
        accepted_section_ids=data.accepted_section_ids,
        swap_indicators=data.swap_indicators,
        repack_layout=data.repack_layout,
        regroup_pages=data.regroup_pages,
        user_id=current_user.id,
        db=db,
    )
    return result


@router.get("/suggest/explain/{section_id}")
def explain_suggestion(section_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    from app.services.ai_suggester import explain_section
    section = db.query(models.Section).filter_by(id=section_id).first()
    if not section:
        raise HTTPException(404, "Section not found")
    return explain_section(section=section, db=db)
