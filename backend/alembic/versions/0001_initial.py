"""Initial migration

Revision ID: 0001
Revises: 
Create Date: 2024-01-01 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa


revision = '0001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # All tables created by SQLAlchemy metadata in main.py lifespan
    # This migration is a marker; actual creation via create_all
    pass


def downgrade() -> None:
    pass
