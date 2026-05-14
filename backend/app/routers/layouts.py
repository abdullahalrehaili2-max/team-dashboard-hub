from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from app.db import get_db
from app import models
from app.auth import get_current_user

router = APIRouter()


@router.post("/dashboards/{dashboard_id}/layout")
def save_layout(
    dashboard_id: int,
    layout: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Save grid layout for sections. layout = {breakpoint: [{i, x, y, w, h}]}"""
    dashboard = db.query(models.Dashboard).filter_by(id=dashboard_id).first()
    if not dashboard:
        raise HTTPException(404, "Dashboard not found")

    # Update grid_item_json per section
    for bp, items in layout.items():
        for item in items:
            section_id = int(item.get("i", 0))
            sec = db.query(models.Section).filter_by(id=section_id, dashboard_id=dashboard_id).first()
            if sec:
                gi = sec.grid_item_json or {}
                gi.update({k: item[k] for k in ["x", "y", "w", "h"] if k in item})
                sec.grid_item_json = gi

    # Save revision
    rev = models.Revision(
        dashboard_id=dashboard_id,
        user_id=current_user.id,
        diff_json={"layout": layout},
        action="layout_change",
    )
    db.add(rev)
    db.commit()
    return {"saved": True}
