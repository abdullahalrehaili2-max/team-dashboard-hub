from datetime import date, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.db import get_db
from app import models
from app.auth import get_current_user
from app.week_utils import iso_week_start, delta, delta_pct, trend, color_for

router = APIRouter()


def _offset_week(ws: str, weeks: int) -> str:
    d = date.fromisoformat(ws)
    return (d - timedelta(weeks=weeks)).isoformat()


@router.get("/{dashboard_id}")
def get_deltas(
    dashboard_id: int,
    week: Optional[str] = None,
    compare_to: str = Query("lw", description="lw|2w|4w|custom"),
    compare_week: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    this_week = week or iso_week_start().isoformat()
    offset_map = {"lw": 1, "2w": 2, "4w": 4}
    if compare_to == "custom" and compare_week:
        last_week = compare_week
    else:
        offset = offset_map.get(compare_to, 1)
        last_week = _offset_week(this_week, offset)

    sections = db.query(models.Section).filter_by(dashboard_id=dashboard_id).all()
    result = []
    for section in sections:
        section_deltas = []
        for field in section.fields:
            this_val = db.query(models.FieldValue).filter_by(field_id=field.id, week_start=this_week).first()
            last_val = db.query(models.FieldValue).filter_by(field_id=field.id, week_start=last_week).first()
            this_num = this_val.value_num if this_val else None
            last_num = last_val.value_num if last_val else None
            d = delta(this_num, last_num)
            d_pct = delta_pct(this_num, last_num)
            section_deltas.append({
                "field_id": field.id,
                "field_key": field.key,
                "field_label": field.label,
                "this_week": this_num,
                "last_week": last_num,
                "delta": d,
                "delta_pct": d_pct,
                "trend": trend(d),
                "color": color_for(field.direction_good, d),
            })
        result.append({
            "section_id": section.id,
            "section_title": section.title,
            "fields": section_deltas,
        })
    return {
        "dashboard_id": dashboard_id,
        "this_week": this_week,
        "compare_to": compare_to,
        "last_week": last_week,
        "sections": result,
    }
