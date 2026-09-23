"""add draft to proposalstatus

Revision ID: e3b2c1a0987f
Revises: a81f9b32c451
Create Date: 2026-09-22 11:35:00.000000

"""
from alembic import op


# revision identifiers, used by Alembic.
revision = 'e3b2c1a0987f'
down_revision = 'a81f9b32c451'
branch_labels = None
depends_on = None


def upgrade():
    op.execute("ALTER TYPE proposalstatus ADD VALUE IF NOT EXISTS 'DRAFT'")


def downgrade():
    pass
