import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.db import engine, get_db, SessionLocal
from app import models
from app.seed_data import seed_database
from app.routers import (
    auth, dashboards, pages, sections, fields, entries,
    deltas, indicators, themes, layouts, exports, share,
    templates, ai
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables
    models.Base.metadata.create_all(bind=engine)
    # Ensure uploads dirs exist
    os.makedirs("uploads/template_covers", exist_ok=True)
    os.makedirs("data", exist_ok=True)
    # Seed
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="Team Dashboard Hub",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(dashboards.router, prefix="/dashboards", tags=["dashboards"])
app.include_router(pages.router, prefix="/pages", tags=["pages"])
app.include_router(sections.router, prefix="/sections", tags=["sections"])
app.include_router(fields.router, prefix="/fields", tags=["fields"])
app.include_router(entries.router, prefix="/entries", tags=["entries"])
app.include_router(deltas.router, prefix="/deltas", tags=["deltas"])
app.include_router(indicators.router, prefix="/indicators", tags=["indicators"])
app.include_router(themes.router, prefix="/themes", tags=["themes"])
app.include_router(layouts.router, prefix="/layouts", tags=["layouts"])
app.include_router(exports.router, prefix="/exports", tags=["exports"])
app.include_router(share.router, prefix="/share", tags=["share"])
app.include_router(templates.router, prefix="/templates", tags=["templates"])
app.include_router(ai.router, prefix="/ai", tags=["ai"])


@app.get("/health")
def health():
    return {"status": "ok", "service": "team-dashboard-hub"}


# Admin endpoints
from fastapi import Depends
from sqlalchemy.orm import Session
from app.auth import require_admin
from app.db import get_db as _get_db

@app.post("/admin/lock-week", tags=["admin"])
def lock_week(
    dashboard_id: int,
    week_start: str,
    db: Session = Depends(_get_db),
    current_user=Depends(require_admin),
):
    existing = db.query(models.WeekLock).filter_by(
        dashboard_id=dashboard_id, week_start=week_start
    ).first()
    if not existing:
        lock = models.WeekLock(
            dashboard_id=dashboard_id,
            week_start=week_start,
            locked_by=current_user.id,
        )
        db.add(lock)
        db.commit()
        return {"locked": True}
    return {"locked": True, "already_locked": True}


# Serve SPA from static files if built
static_dir = Path(__file__).parent / "static"
if static_dir.exists():
    app.mount("/assets", StaticFiles(directory=str(static_dir / "assets")), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    def spa_fallback(full_path: str):
        index = static_dir / "index.html"
        if index.exists():
            return FileResponse(str(index))
        return {"detail": "Frontend not built yet"}
