"""Week-over-week computation service."""

from datetime import date, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app import models
from app.week_utils import delta, delta_pct, trend, color_for, iso_week_start


def get_field_history(field_id: int, weeks: int, db: Session, end_week: Optional[str] = None) -> List[Dict[str, Any]]:
    """Return list of {week_start, value} for up to `weeks` recent weeks."""
    end = date.fromisoformat(end_week) if end_week else iso_week_start()
    result = []
    for i in range(weeks):
        ws = (end - timedelta(weeks=i)).isoformat()
        val = db.query(models.FieldValue).filter_by(field_id=field_id, week_start=ws).first()
        result.append({"week_start": ws, "value": val.value_num if val else None})
    return list(reversed(result))


def compute_dashboard_deltas(
    dashboard_id: int,
    this_week: str,
    last_week: str,
    db: Session,
) -> List[Dict[str, Any]]:
    sections = db.query(models.Section).filter_by(dashboard_id=dashboard_id).all()
    result = []
    for section in sections:
        changed_fields = []
        for field in section.fields:
            this_val = db.query(models.FieldValue).filter_by(field_id=field.id, week_start=this_week).first()
            last_val = db.query(models.FieldValue).filter_by(field_id=field.id, week_start=last_week).first()
            this_num = this_val.value_num if this_val else None
            last_num = last_val.value_num if last_val else None
            d = delta(this_num, last_num)
            d_pct = delta_pct(this_num, last_num)
            if d is not None and abs(d) > 0:
                changed_fields.append({
                    "field_id": field.id,
                    "label": field.label,
                    "delta": d,
                    "delta_pct": d_pct,
                    "trend": trend(d),
                    "color": color_for(field.direction_good, d),
                })
        if changed_fields:
            result.append({
                "section_id": section.id,
                "section_title": section.title,
                "changed_fields": changed_fields,
            })
    return result
