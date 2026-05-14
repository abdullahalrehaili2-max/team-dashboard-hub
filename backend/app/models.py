from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey,
    UniqueConstraint, JSON
)
from sqlalchemy.orm import relationship
from app.db import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="viewer")  # admin|editor|viewer
    name = Column(String(255), default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    dashboards_created = relationship("Dashboard", back_populates="creator", foreign_keys="Dashboard.created_by")


class Theme(Base):
    __tablename__ = "themes"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    is_preset = Column(Boolean, default=False)
    tokens_json = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Dashboard(Base):
    __tablename__ = "dashboards"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    theme_id = Column(Integer, ForeignKey("themes.id"), nullable=True)
    layout_json = Column(JSON, default=dict)
    settings_json = Column(JSON, default=dict)
    created_from_template_id = Column(Integer, nullable=True)
    installed_template_version = Column(String(50), nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    theme = relationship("Theme")
    creator = relationship("User", back_populates="dashboards_created", foreign_keys=[created_by])
    pages = relationship("Page", back_populates="dashboard", cascade="all, delete-orphan", order_by="Page.order")
    sections = relationship("Section", back_populates="dashboard", cascade="all, delete-orphan")


class Page(Base):
    __tablename__ = "pages"
    id = Column(Integer, primary_key=True, index=True)
    dashboard_id = Column(Integer, ForeignKey("dashboards.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), default="Page")
    order = Column(Integer, default=0)
    layout_json = Column(JSON, default=dict)

    dashboard = relationship("Dashboard", back_populates="pages")
    sections = relationship("Section", back_populates="page", cascade="all, delete-orphan")


class Section(Base):
    __tablename__ = "sections"
    id = Column(Integer, primary_key=True, index=True)
    dashboard_id = Column(Integer, ForeignKey("dashboards.id", ondelete="CASCADE"), nullable=False)
    page_id = Column(Integer, ForeignKey("pages.id", ondelete="CASCADE"), nullable=True)
    title = Column(String(255), default="")
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    order = Column(Integer, default=0)
    grid_item_json = Column(JSON, default=dict)
    indicator_type = Column(String(50), default="KPI_CARD")
    indicator_config_json = Column(JSON, default=dict)
    data_binding_json = Column(JSON, default=dict)
    section_key = Column(String(100), nullable=True)  # for template stable keys

    dashboard = relationship("Dashboard", back_populates="sections")
    page = relationship("Page", back_populates="sections")
    fields = relationship("Field", back_populates="section", cascade="all, delete-orphan")


class Field(Base):
    __tablename__ = "fields"
    id = Column(Integer, primary_key=True, index=True)
    section_id = Column(Integer, ForeignKey("sections.id", ondelete="CASCADE"), nullable=False)
    key = Column(String(100), nullable=False)
    label = Column(String(255), default="")
    data_type = Column(String(20), default="number")  # number|currency|percent|text|table|series
    unit = Column(String(50), default="")
    direction_good = Column(String(10), default="up")  # up|down|neutral
    format_json = Column(JSON, default=dict)
    field_key = Column(String(100), nullable=True)  # for template stable keys

    section = relationship("Section", back_populates="fields")
    values = relationship("FieldValue", back_populates="field", cascade="all, delete-orphan")


class FieldValue(Base):
    __tablename__ = "field_values"
    id = Column(Integer, primary_key=True, index=True)
    field_id = Column(Integer, ForeignKey("fields.id", ondelete="CASCADE"), nullable=False)
    week_start = Column(String(10), nullable=False)  # ISO date YYYY-MM-DD
    value_num = Column(Float, nullable=True)
    value_text = Column(Text, nullable=True)
    value_json = Column(JSON, nullable=True)
    entered_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    entered_at = Column(DateTime, default=datetime.utcnow)

    field = relationship("Field", back_populates="values")
    __table_args__ = (UniqueConstraint("field_id", "week_start", name="uq_field_week"),)


class Revision(Base):
    __tablename__ = "revisions"
    id = Column(Integer, primary_key=True, index=True)
    dashboard_id = Column(Integer, ForeignKey("dashboards.id", ondelete="CASCADE"), nullable=False)
    section_id = Column(Integer, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    diff_json = Column(JSON, default=dict)
    action = Column(String(50), default="layout_change")
    created_at = Column(DateTime, default=datetime.utcnow)


class ShareLink(Base):
    __tablename__ = "share_links"
    id = Column(Integer, primary_key=True, index=True)
    dashboard_id = Column(Integer, ForeignKey("dashboards.id", ondelete="CASCADE"), nullable=False)
    token = Column(String(64), unique=True, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)


class WeekLock(Base):
    __tablename__ = "week_locks"
    id = Column(Integer, primary_key=True, index=True)
    dashboard_id = Column(Integer, ForeignKey("dashboards.id", ondelete="CASCADE"), nullable=False)
    week_start = Column(String(10), nullable=False)
    locked_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    locked_at = Column(DateTime, default=datetime.utcnow)
    __table_args__ = (UniqueConstraint("dashboard_id", "week_start", name="uq_dashboard_week_lock"),)


class Template(Base):
    __tablename__ = "templates"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(Text, default="")
    category = Column(String(100), default="General")
    cover_image_path = Column(String(500), nullable=True)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    visibility = Column(String(20), default="team")  # private|team|public
    is_official = Column(Boolean, default=False)
    version = Column(String(20), default="1.0.0")
    bundle_json = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    tags = relationship("TemplateTag", back_populates="template", cascade="all, delete-orphan")
    installs = relationship("TemplateInstall", back_populates="template")


class TemplateTag(Base):
    __tablename__ = "template_tags"
    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("templates.id", ondelete="CASCADE"), nullable=False)
    tag = Column(String(100), nullable=False)

    template = relationship("Template", back_populates="tags")


class TemplateInstall(Base):
    __tablename__ = "template_installs"
    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("templates.id", ondelete="CASCADE"), nullable=False)
    dashboard_id = Column(Integer, ForeignKey("dashboards.id", ondelete="CASCADE"), nullable=False)
    installed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    installed_at = Column(DateTime, default=datetime.utcnow)

    template = relationship("Template", back_populates="installs")
