"""rename_role_to_active_role_for_dual_profile

Revision ID: 137ef2cc7a2b
Revises: 92fc4e6c13f6
Create Date: 2026-09-16 18:51:06.559996

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = '137ef2cc7a2b'
down_revision = '92fc4e6c13f6'
branch_labels = None
depends_on = None


def upgrade():
    # Convert any 'admin' role values to 'client' before renaming
    op.execute("UPDATE \"user\" SET role = 'CLIENT' WHERE role = 'ADMIN'")
    # Rename the column (preserves data)
    op.alter_column('user', 'role', new_column_name='active_role')
    # Remove ADMIN from the enum type
    # PostgreSQL enums can't drop values directly, but since we've already
    # converted all ADMIN values, the stale enum value is harmless.


def downgrade():
    op.alter_column('user', 'active_role', new_column_name='role')

