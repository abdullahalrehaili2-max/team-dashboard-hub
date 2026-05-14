from datetime import datetime
from typing import Optional, Any, List, Dict
from pydantic import BaseModel, EmailStr


# ── Auth ──────────────────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    email: str
    role: str
    name: str
    model_config = {"from_attributes": True}


# ── Theme ─────────────────────────────────────────────────────────────────────
class ThemeCreate(BaseModel):
    name: str
    tokens_json: Dict[str, Any] = {}


class ThemeUpdate(BaseModel):
    name: Optional[str] = None
    tokens_json: Optional[Dict[str, Any]] = None


class ThemeOut(BaseModel):
    id: int
    name: str
    is_preset: bool
    tokens_json: Dict[str, Any]
    created_at: datetime
    model_config = {"from_attributes": True}


# ── Dashboard ─────────────────────────────────────────────────────────────────
class DashboardCreate(BaseModel):
    name: str
    theme_id: Optional[int] = None
    layout_json: Dict[str, Any] = {}
    settings_json: Dict[str, Any] = {}


class DashboardUpdate(BaseModel):
    name: Optional[str] = None
    theme_id: Optional[int] = None
    layout_json: Optional[Dict[str, Any]] = None
    settings_json: Optional[Dict[str, Any]] = None


class DashboardOut(BaseModel):
    id: int
    name: str
    created_at: datetime
    updated_at: datetime
    theme_id: Optional[int]
    layout_json: Dict[str, Any]
    settings_json: Dict[str, Any]
    created_from_template_id: Optional[int]
    installed_template_version: Optional[str]
    model_config = {"from_attributes": True}


# ── Page ──────────────────────────────────────────────────────────────────────
class PageCreate(BaseModel):
    name: str = "Page"
    order: int = 0
    layout_json: Dict[str, Any] = {}


class PageUpdate(BaseModel):
    name: Optional[str] = None
    order: Optional[int] = None
    layout_json: Optional[Dict[str, Any]] = None


class PageOut(BaseModel):
    id: int
    dashboard_id: int
    name: str
    order: int
    layout_json: Dict[str, Any]
    model_config = {"from_attributes": True}


# ── Section ───────────────────────────────────────────────────────────────────
class SectionCreate(BaseModel):
    title: str = ""
    page_id: Optional[int] = None
    order: int = 0
    grid_item_json: Dict[str, Any] = {}
    indicator_type: str = "KPI_CARD"
    indicator_config_json: Dict[str, Any] = {}
    data_binding_json: Dict[str, Any] = {}


class SectionUpdate(BaseModel):
    title: Optional[str] = None
    page_id: Optional[int] = None
    order: Optional[int] = None
    grid_item_json: Optional[Dict[str, Any]] = None
    indicator_type: Optional[str] = None
    indicator_config_json: Optional[Dict[str, Any]] = None
    data_binding_json: Optional[Dict[str, Any]] = None


class SectionOut(BaseModel):
    id: int
    dashboard_id: int
    page_id: Optional[int]
    title: str
    order: int
    grid_item_json: Dict[str, Any]
    indicator_type: str
    indicator_config_json: Dict[str, Any]
    data_binding_json: Dict[str, Any]
    model_config = {"from_attributes": True}


# ── Field ─────────────────────────────────────────────────────────────────────
class FieldCreate(BaseModel):
    key: str
    label: str = ""
    data_type: str = "number"
    unit: str = ""
    direction_good: str = "up"
    format_json: Dict[str, Any] = {}


class FieldOut(BaseModel):
    id: int
    section_id: int
    key: str
    label: str
    data_type: str
    unit: str
    direction_good: str
    format_json: Dict[str, Any]
    model_config = {"from_attributes": True}


# ── FieldValue ────────────────────────────────────────────────────────────────
class EntryCreate(BaseModel):
    value_num: Optional[float] = None
    value_text: Optional[str] = None
    value_json: Optional[Any] = None


class EntryOut(BaseModel):
    id: int
    field_id: int
    week_start: str
    value_num: Optional[float]
    value_text: Optional[str]
    value_json: Optional[Any]
    entered_at: datetime
    model_config = {"from_attributes": True}


# ── Template ──────────────────────────────────────────────────────────────────
class TemplateCreate(BaseModel):
    name: str
    slug: str
    description: str = ""
    category: str = "General"
    visibility: str = "team"
    bundle_json: Dict[str, Any] = {}
    tags: List[str] = []


class TemplateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    visibility: Optional[str] = None
    bundle_json: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None


class TemplateOut(BaseModel):
    id: int
    name: str
    slug: str
    description: str
    category: str
    cover_image_path: Optional[str]
    visibility: str
    is_official: bool
    version: str
    created_at: datetime
    updated_at: datetime
    tags: List[str] = []
    model_config = {"from_attributes": True}

    @classmethod
    def from_orm_with_tags(cls, obj):
        data = {
            "id": obj.id,
            "name": obj.name,
            "slug": obj.slug,
            "description": obj.description,
            "category": obj.category,
            "cover_image_path": obj.cover_image_path,
            "visibility": obj.visibility,
            "is_official": obj.is_official,
            "version": obj.version,
            "created_at": obj.created_at,
            "updated_at": obj.updated_at,
            "tags": [t.tag for t in obj.tags],
        }
        return cls(**data)


# ── Share ─────────────────────────────────────────────────────────────────────
class ShareCreate(BaseModel):
    dashboard_id: int
    expires_at: Optional[datetime] = None


class ShareOut(BaseModel):
    id: int
    dashboard_id: int
    token: str
    created_at: datetime
    expires_at: Optional[datetime]
    model_config = {"from_attributes": True}


# ── AI ────────────────────────────────────────────────────────────────────────
class AISuggestApplyRequest(BaseModel):
    dashboard_id: int
    accepted_section_ids: List[int] = []
    swap_indicators: bool = True
    repack_layout: bool = False
    regroup_pages: bool = False


# ── Paginated list helper ─────────────────────────────────────────────────────
class PaginatedList(BaseModel):
    items: List[Any]
    total: int
    page: int = 1
    page_size: int = 50
