"""add category to jobpost and create recentsearch

Revision ID: c1f92e4b8a10
Revises: b41f89c09d31
Create Date: 2026-09-21 13:00:00.000000

"""
import sqlalchemy as sa
import sqlmodel.sql.sqltypes
from alembic import op

# revision identifiers, used by Alembic.
revision = 'c1f92e4b8a10'
down_revision = 'b41f89c09d31'
branch_labels = None
depends_on = None


def upgrade():
    # 1. Add category to jobpost
    op.add_column(
        'jobpost',
        sa.Column('category', sqlmodel.sql.sqltypes.AutoString(length=100), nullable=True),
    )
    op.create_index(op.f('ix_jobpost_category'), 'jobpost', ['category'], unique=False)

    # 2. Create recentsearch table
    op.create_table(
        'recentsearch',
        sa.Column('query', sqlmodel.sql.sqltypes.AutoString(length=255), nullable=False),
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('user_id', sa.Uuid(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_recentsearch_user_id'), 'recentsearch', ['user_id'], unique=False)
    op.create_index('ix_recentsearch_user_created', 'recentsearch', ['user_id', 'created_at'], unique=False)


def downgrade():
    op.drop_index('ix_recentsearch_user_created', table_name='recentsearch')
    op.drop_index(op.f('ix_recentsearch_user_id'), table_name='recentsearch')
    op.drop_table('recentsearch')
    op.drop_index(op.f('ix_jobpost_category'), table_name='jobpost')
    op.drop_column('jobpost', 'category')
