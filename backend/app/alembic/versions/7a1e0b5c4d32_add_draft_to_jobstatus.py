"""add draft to jobstatus

Revision ID: 7a1e0b5c4d32
Revises: e3b2c1a0987f
Create Date: 2026-09-23 12:30:00.000000

"""
from alembic import op


# revision identifiers, used by Alembic.
revision = '7a1e0b5c4d32'
down_revision = 'e3b2c1a0987f'
branch_labels = None
depends_on = None


def upgrade():
    op.execute("ALTER TYPE jobstatus ADD VALUE IF NOT EXISTS 'DRAFT'")


def downgrade():
    pass
