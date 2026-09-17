"""add client profile model

Revision ID: 50f6120d266e
Revises: 8ba0a527e559
Create Date: 2026-09-17 21:33:00.000000

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = '50f6120d266e'
down_revision = '8ba0a527e559'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'clientprofile',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('user_id', sa.Uuid(), nullable=False),
        sa.Column('company', sqlmodel.sql.sqltypes.AutoString(length=255), nullable=True),
        sa.Column('company_role', sqlmodel.sql.sqltypes.AutoString(length=255), nullable=True),
        sa.Column('company_website', sqlmodel.sql.sqltypes.AutoString(length=2048), nullable=True),
        sa.Column('company_size', sqlmodel.sql.sqltypes.AutoString(length=50), nullable=True),
        sa.Column('location', sqlmodel.sql.sqltypes.AutoString(length=255), nullable=True),
        sa.Column('description', sqlmodel.sql.sqltypes.AutoString(length=5000), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id'),
    )


def downgrade():
    op.drop_table('clientprofile')
