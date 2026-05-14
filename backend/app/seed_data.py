"""Seeds the database on first boot: admin user, GASTAT theme, preset themes, official templates."""

import json
import os
from datetime import datetime
from sqlalchemy.orm import Session
from app import models
from app.auth import hash_password
from app.config import settings
from app.theme_registry import PRESET_THEMES


OFFICIAL_TEMPLATES = [
    {
        "name": "Executive Weekly Review",
        "slug": "executive-weekly-review",
        "description": "Leadership-ready weekly KPI dashboard with WoW deltas, progress bars, and headline metrics.",
        "category": "Executive",
        "tags": ["kpi", "executive", "weekly", "official"],
        "bundle_json": {
            "meta": {"name": "Executive Weekly Review", "version": "1.0.0", "category": "Executive"},
            "theme": "gastat_executive",
            "settings": {},
            "pages": [
                {
                    "name": "Overview",
                    "order": 0,
                    "sections": [
                        {
                            "key": "exec_revenue",
                            "title": "Weekly Revenue",
                            "indicator_type": "KPI_CARD",
                            "grid_item_json": {"x": 0, "y": 0, "w": 3, "h": 2},
                            "indicator_config_json": {"show_delta": True},
                            "fields": [{"key": "revenue", "label": "Revenue", "data_type": "currency", "direction_good": "up", "sample_value": 1250000}],
                        },
                        {
                            "key": "exec_nps",
                            "title": "NPS Score",
                            "indicator_type": "GAUGE",
                            "grid_item_json": {"x": 3, "y": 0, "w": 3, "h": 2},
                            "indicator_config_json": {},
                            "fields": [
                                {"key": "nps", "label": "NPS", "data_type": "number", "direction_good": "up", "sample_value": 72},
                                {"key": "max", "label": "Max", "data_type": "number", "sample_value": 100},
                            ],
                        },
                        {
                            "key": "exec_headcount",
                            "title": "Headcount",
                            "indicator_type": "KPI_CARD",
                            "grid_item_json": {"x": 6, "y": 0, "w": 3, "h": 2},
                            "indicator_config_json": {"show_delta": True},
                            "fields": [{"key": "headcount", "label": "Headcount", "data_type": "number", "direction_good": "up", "sample_value": 842}],
                        },
                        {
                            "key": "exec_revenue_trend",
                            "title": "Revenue Trend",
                            "indicator_type": "AREA_CHART",
                            "grid_item_json": {"x": 0, "y": 2, "w": 6, "h": 3},
                            "indicator_config_json": {"gradient": True},
                            "fields": [{"key": "series", "label": "Revenue", "data_type": "series", "sample_value": [100, 120, 115, 130, 145, 160, 155, 170, 180, 195, 210, 225]}],
                        },
                    ],
                }
            ],
        },
    },
    {
        "name": "Sales Pipeline Pulse",
        "slug": "sales-pipeline-pulse",
        "description": "Track pipeline stages, conversion rates, and rep performance in real time.",
        "category": "Sales",
        "tags": ["sales", "pipeline", "crm", "official"],
        "bundle_json": {
            "meta": {"name": "Sales Pipeline Pulse", "version": "1.0.0", "category": "Sales"},
            "theme": "executive_light",
            "settings": {},
            "pages": [
                {
                    "name": "Pipeline",
                    "order": 0,
                    "sections": [
                        {
                            "key": "pipeline_funnel",
                            "title": "Pipeline Funnel",
                            "indicator_type": "FUNNEL",
                            "grid_item_json": {"x": 0, "y": 0, "w": 4, "h": 4},
                            "indicator_config_json": {},
                            "fields": [{"key": "stages", "label": "Stages", "data_type": "table", "sample_value": [{"name": "Leads", "value": 500}, {"name": "Qualified", "value": 280}, {"name": "Proposal", "value": 120}, {"name": "Closed Won", "value": 45}]}],
                        },
                        {
                            "key": "pipeline_win_rate",
                            "title": "Win Rate",
                            "indicator_type": "KPI_CARD",
                            "grid_item_json": {"x": 4, "y": 0, "w": 3, "h": 2},
                            "indicator_config_json": {},
                            "fields": [{"key": "primary", "label": "Win Rate", "data_type": "percent", "direction_good": "up", "sample_value": 18.2}],
                        },
                    ],
                }
            ],
        },
    },
    {
        "name": "Marketing Acquisition",
        "slug": "marketing-acquisition",
        "description": "CAC, ROAS, channel attribution, and campaign performance at a glance.",
        "category": "Marketing",
        "tags": ["marketing", "acquisition", "growth", "official"],
        "bundle_json": {
            "meta": {"name": "Marketing Acquisition", "version": "1.0.0", "category": "Marketing"},
            "theme": "glass_aurora",
            "settings": {},
            "pages": [
                {
                    "name": "Acquisition",
                    "order": 0,
                    "sections": [
                        {
                            "key": "mkt_cac",
                            "title": "CAC",
                            "indicator_type": "KPI_CARD",
                            "grid_item_json": {"x": 0, "y": 0, "w": 3, "h": 2},
                            "indicator_config_json": {},
                            "fields": [{"key": "primary", "label": "CAC", "data_type": "currency", "direction_good": "down", "sample_value": 142}],
                        },
                        {
                            "key": "mkt_roas",
                            "title": "ROAS",
                            "indicator_type": "BIG_STAT_HERO",
                            "grid_item_json": {"x": 3, "y": 0, "w": 3, "h": 2},
                            "indicator_config_json": {},
                            "fields": [{"key": "primary", "label": "ROAS", "data_type": "number", "direction_good": "up", "sample_value": 4.7}],
                        },
                        {
                            "key": "mkt_channels",
                            "title": "Channel Mix",
                            "indicator_type": "PIE_DONUT",
                            "grid_item_json": {"x": 0, "y": 2, "w": 4, "h": 3},
                            "indicator_config_json": {},
                            "fields": [{"key": "categories", "label": "Channels", "data_type": "table", "sample_value": [{"name": "Organic", "value": 42}, {"name": "Paid Search", "value": 28}, {"name": "Social", "value": 18}, {"name": "Email", "value": 12}]}],
                        },
                    ],
                }
            ],
        },
    },
    {
        "name": "Ops Health Dashboard",
        "slug": "ops-health-dashboard",
        "description": "Uptime, incidents, SLA compliance, and operational KPIs for engineering and ops teams.",
        "category": "Operations",
        "tags": ["ops", "sre", "health", "official"],
        "bundle_json": {
            "meta": {"name": "Ops Health Dashboard", "version": "1.0.0", "category": "Operations"},
            "theme": "terminal",
            "settings": {},
            "pages": [
                {
                    "name": "Health",
                    "order": 0,
                    "sections": [
                        {
                            "key": "ops_uptime",
                            "title": "Uptime",
                            "indicator_type": "PROGRESS_BAR",
                            "grid_item_json": {"x": 0, "y": 0, "w": 4, "h": 2},
                            "indicator_config_json": {},
                            "fields": [
                                {"key": "value", "label": "Uptime %", "data_type": "percent", "direction_good": "up", "sample_value": 99.97},
                                {"key": "max", "label": "Max", "data_type": "number", "sample_value": 100},
                            ],
                        },
                        {
                            "key": "ops_incidents",
                            "title": "Open Incidents",
                            "indicator_type": "KPI_CARD",
                            "grid_item_json": {"x": 4, "y": 0, "w": 3, "h": 2},
                            "indicator_config_json": {},
                            "fields": [{"key": "primary", "label": "Incidents", "data_type": "number", "direction_good": "down", "sample_value": 3}],
                        },
                    ],
                }
            ],
        },
    },
    {
        "name": "Product Analytics",
        "slug": "product-analytics",
        "description": "DAU/MAU, feature adoption, retention curves, and product health metrics.",
        "category": "Product",
        "tags": ["product", "analytics", "retention", "official"],
        "bundle_json": {
            "meta": {"name": "Product Analytics", "version": "1.0.0", "category": "Product"},
            "theme": "midnight_pro",
            "settings": {},
            "pages": [
                {
                    "name": "Engagement",
                    "order": 0,
                    "sections": [
                        {
                            "key": "prod_dau",
                            "title": "DAU",
                            "indicator_type": "BIG_STAT_HERO",
                            "grid_item_json": {"x": 0, "y": 0, "w": 3, "h": 2},
                            "indicator_config_json": {},
                            "fields": [{"key": "primary", "label": "DAU", "data_type": "number", "direction_good": "up", "sample_value": 84200}],
                        },
                        {
                            "key": "prod_retention",
                            "title": "D30 Retention",
                            "indicator_type": "LINE_CHART",
                            "grid_item_json": {"x": 0, "y": 2, "w": 6, "h": 3},
                            "indicator_config_json": {},
                            "fields": [{"key": "series", "label": "Retention %", "data_type": "series", "sample_value": [100, 65, 45, 38, 35, 33, 32, 31, 30, 29, 29, 28]}],
                        },
                    ],
                }
            ],
        },
    },
]


def seed_database(db: Session) -> None:
    """Idempotent seed: only seeds if data is missing."""

    # ── Admin user ────────────────────────────────────────────────────────────
    admin = db.query(models.User).filter_by(email=settings.ADMIN_EMAIL).first()
    if not admin:
        admin = models.User(
            email=settings.ADMIN_EMAIL,
            password_hash=hash_password(settings.ADMIN_PASSWORD),
            role="admin",
            name="Administrator",
        )
        db.add(admin)
        db.flush()

    # ── Preset themes ─────────────────────────────────────────────────────────
    theme_map: dict[str, models.Theme] = {}
    for slug, data in PRESET_THEMES.items():
        t = db.query(models.Theme).filter_by(name=data["name"]).first()
        if not t:
            t = models.Theme(
                name=data["name"],
                is_preset=True,
                tokens_json=data["tokens"],
            )
            db.add(t)
            db.flush()
        theme_map[slug] = t

    # ── Official templates ────────────────────────────────────────────────────
    existing_count = db.query(models.Template).count()
    if existing_count == 0:
        for tpl in OFFICIAL_TEMPLATES:
            tags = tpl.pop("tags", [])
            theme_slug = tpl["bundle_json"].get("theme", "gastat_executive")
            obj = models.Template(
                name=tpl["name"],
                slug=tpl["slug"],
                description=tpl["description"],
                category=tpl["category"],
                visibility="public",
                is_official=True,
                version="1.0.0",
                bundle_json=tpl["bundle_json"],
                author_id=admin.id,
            )
            db.add(obj)
            db.flush()
            for tag in tags:
                db.add(models.TemplateTag(template_id=obj.id, tag=tag))

    db.commit()
