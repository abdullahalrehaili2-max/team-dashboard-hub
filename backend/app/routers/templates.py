import json
import os
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db import get_db
from app import models
from app.auth import get_current_user
from app.schemas import TemplateCreate, TemplateUpdate, TemplateOut

router = APIRouter()


def _template_to_out(t: models.Template) -> dict:
    return {
        "id": t.id,
        "name": t.name,
        "slug": t.slug,
        "description": t.description,
        "category": t.category,
        "cover_image_path": t.cover_image_path,
        "visibility": t.visibility,
        "is_official": t.is_official,
        "version": t.version,
        "created_at": t.created_at.isoformat() if t.created_at else None,
        "updated_at": t.updated_at.isoformat() if t.updated_at else None,
        "tags": [tag.tag for tag in t.tags],
    }


@router.get("")
def list_templates(
    category: Optional[str] = None,
    tag: Optional[str] = None,
    visibility: Optional[str] = None,
    official: Optional[bool] = None,
    q: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    query = db.query(models.Template)
    if category:
        query = query.filter(models.Template.category == category)
    if visibility:
        query = query.filter(models.Template.visibility == visibility)
    if official is not None:
        query = query.filter(models.Template.is_official == official)
    if q:
        query = query.filter(models.Template.name.ilike(f"%{q}%"))
    if tag:
        query = query.join(models.TemplateTag).filter(models.TemplateTag.tag == tag)
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    return {"items": [_template_to_out(t) for t in items], "total": total, "page": page, "page_size": page_size}


@router.get("/{id}")
def get_template(id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    t = db.query(models.Template).filter_by(id=id).first()
    if not t:
        raise HTTPException(404, "Template not found")
    out = _template_to_out(t)
    out["bundle_json"] = t.bundle_json
    return out


@router.post("/from-dashboard/{dashboard_id}")
def save_as_template(
    dashboard_id: int,
    name: str = "My Template",
    description: str = "",
    category: str = "General",
    visibility: str = "team",
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.services.template_service import freeze_dashboard_as_template
    t = freeze_dashboard_as_template(dashboard_id=dashboard_id, name=name, description=description,
                                      category=category, visibility=visibility,
                                      author_id=current_user.id, db=db)
    return _template_to_out(t)


@router.post("/{id}/clone")
def clone_template(
    id: int,
    name: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.services.template_service import clone_template_to_dashboard
    t = db.query(models.Template).filter_by(id=id).first()
    if not t:
        raise HTTPException(404, "Template not found")
    dashboard = clone_template_to_dashboard(template=t, name=name or f"{t.name} (Copy)", user_id=current_user.id, db=db)
    return {"dashboard_id": dashboard.id, "name": dashboard.name}


@router.put("/{id}")
def update_template(id: int, data: TemplateUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    t = db.query(models.Template).filter_by(id=id).first()
    if not t:
        raise HTTPException(404, "Template not found")
    for k, v in data.model_dump(exclude_none=True).items():
        if k == "tags":
            for tag in t.tags:
                db.delete(tag)
            for tag in v:
                db.add(models.TemplateTag(template_id=t.id, tag=tag))
        else:
            setattr(t, k, v)
    db.commit()
    db.refresh(t)
    return _template_to_out(t)


@router.delete("/{id}")
def delete_template(id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    t = db.query(models.Template).filter_by(id=id).first()
    if not t:
        raise HTTPException(404, "Template not found")
    if t.is_official and current_user.role != "admin":
        raise HTTPException(403, "Cannot delete official template")
    db.delete(t)
    db.commit()
    return {"deleted": True}


@router.post("/{id}/publish")
def publish_template(id: int, visibility: str = "public", db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    t = db.query(models.Template).filter_by(id=id).first()
    if not t:
        raise HTTPException(404, "Template not found")
    t.visibility = visibility
    db.commit()
    return {"published": True, "visibility": visibility}


@router.post("/import")
async def import_template(file: UploadFile = File(...), db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    content = await file.read()
    bundle = json.loads(content)
    meta = bundle.get("meta", {})
    slug = meta.get("slug", f"imported-{datetime.utcnow().timestamp()}")
    # Ensure unique slug
    if db.query(models.Template).filter_by(slug=slug).first():
        slug = f"{slug}-{int(datetime.utcnow().timestamp())}"
    t = models.Template(
        name=meta.get("name", "Imported Template"),
        slug=slug,
        description=meta.get("description", ""),
        category=meta.get("category", "General"),
        visibility="private",
        is_official=False,
        version=meta.get("version", "1.0.0"),
        bundle_json=bundle,
        author_id=current_user.id,
    )
    db.add(t)
    db.commit()
    db.refresh(t)
    return _template_to_out(t)


@router.get("/{id}/export")
def export_template(id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    t = db.query(models.Template).filter_by(id=id).first()
    if not t:
        raise HTTPException(404, "Template not found")
    bundle = {**t.bundle_json, "meta": {
        "name": t.name, "slug": t.slug, "description": t.description,
        "category": t.category, "version": t.version,
    }}
    return JSONResponse(content=bundle, headers={"Content-Disposition": f'attachment; filename="{t.slug}.tpl.json"'})


@router.post("/{id}/cover")
def regenerate_cover(id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    from app.services.template_service import generate_cover_image
    t = db.query(models.Template).filter_by(id=id).first()
    if not t:
        raise HTTPException(404, "Template not found")
    path = generate_cover_image(template_id=id)
    t.cover_image_path = path
    db.commit()
    return {"cover_image_path": path}


@router.get("/{id}/preview")
def preview_template(id: int, db: Session = Depends(get_db)):
    from app.services.template_service import render_template_preview
    t = db.query(models.Template).filter_by(id=id).first()
    if not t:
        raise HTTPException(404, "Template not found")
    from fastapi.responses import HTMLResponse
    html = render_template_preview(t)
    return HTMLResponse(content=html)
