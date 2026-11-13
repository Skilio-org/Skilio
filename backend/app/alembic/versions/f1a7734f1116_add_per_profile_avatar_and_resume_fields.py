"""add_per_profile_avatar_and_resume_fields

Revision ID: f1a7734f1116
Revises: 7d033896c7b8
Create Date: 2026-11-13 15:48:42.493770

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = 'f1a7734f1116'
down_revision = '7d033896c7b8'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('clientprofile', sa.Column('avatar_url', sqlmodel.sql.sqltypes.AutoString(length=2000), nullable=True))
    op.add_column('freelancerprofile', sa.Column('avatar_url', sqlmodel.sql.sqltypes.AutoString(length=2000), nullable=True))
    op.add_column('freelancerprofile', sa.Column('resume_public_id', sqlmodel.sql.sqltypes.AutoString(length=255), nullable=True))


def downgrade():
    op.drop_column('freelancerprofile', 'resume_public_id')
    op.drop_column('freelancerprofile', 'avatar_url')
    op.drop_column('clientprofile', 'avatar_url')
