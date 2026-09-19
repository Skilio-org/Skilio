"""add freelancer profile v2 and experience

Revision ID: b41f89c09d31
Revises: 50f6120d266e
Create Date: 2026-09-18 16:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = 'b41f89c09d31'
down_revision = '50f6120d266e'
branch_labels = None
depends_on = None


def upgrade():
    # 1. Enhance freelancerprofile
    op.add_column('freelancerprofile', sa.Column('category', sqlmodel.sql.sqltypes.AutoString(length=100), nullable=True))
    op.create_index(op.f('ix_freelancerprofile_category'), 'freelancerprofile', ['category'], unique=False)
    op.add_column('freelancerprofile', sa.Column('availability', sqlmodel.sql.sqltypes.AutoString(length=100), nullable=True, server_default='Available now'))
    op.add_column('freelancerprofile', sa.Column('hours', sqlmodel.sql.sqltypes.AutoString(length=100), nullable=True))
    op.add_column('freelancerprofile', sa.Column('finished', sa.Boolean(), nullable=False, server_default=sa.text('false')))

    # 2. Change skill.name from enum to varchar(100)
    op.alter_column(
        'skill',
        'name',
        type_=sa.String(length=100),
        postgresql_using='name::varchar',
        existing_nullable=False,
    )

    # 3. Create experience table
    op.create_table(
        'experience',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('freelancer_profile_id', sa.Uuid(), nullable=False),
        sa.Column('title', sqlmodel.sql.sqltypes.AutoString(length=255), nullable=False),
        sa.Column('organization', sqlmodel.sql.sqltypes.AutoString(length=255), nullable=True),
        sa.Column('detail', sqlmodel.sql.sqltypes.AutoString(length=5000), nullable=True),
        sa.Column('url', sqlmodel.sql.sqltypes.AutoString(length=2048), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['freelancer_profile_id'], ['freelancerprofile.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )

    # 4. Enhance education table
    op.add_column('education', sa.Column('title', sqlmodel.sql.sqltypes.AutoString(length=255), nullable=True))
    op.add_column('education', sa.Column('organization', sqlmodel.sql.sqltypes.AutoString(length=255), nullable=True))
    op.add_column('education', sa.Column('detail', sqlmodel.sql.sqltypes.AutoString(length=5000), nullable=True))
    op.add_column('education', sa.Column('url', sqlmodel.sql.sqltypes.AutoString(length=2048), nullable=True))
    op.alter_column('education', 'institution', existing_type=sa.String(length=255), nullable=True)
    op.alter_column('education', 'degree', existing_type=sa.String(length=255), nullable=True)

    # 5. Enhance portfolioitem table
    op.alter_column('portfolioitem', 'description', existing_type=sa.String(length=5000), nullable=True)
    op.alter_column('portfolioitem', 'image_url', existing_type=sa.String(length=2048), nullable=True)
    op.add_column('portfolioitem', sa.Column('organization', sqlmodel.sql.sqltypes.AutoString(length=255), nullable=True))
    op.add_column('portfolioitem', sa.Column('detail', sqlmodel.sql.sqltypes.AutoString(length=5000), nullable=True))
    op.add_column('portfolioitem', sa.Column('url', sqlmodel.sql.sqltypes.AutoString(length=2048), nullable=True))


def downgrade():
    # 5. Revert portfolioitem
    op.drop_column('portfolioitem', 'url')
    op.drop_column('portfolioitem', 'detail')
    op.drop_column('portfolioitem', 'organization')
    op.alter_column('portfolioitem', 'image_url', existing_type=sa.String(length=2048), nullable=False)
    op.alter_column('portfolioitem', 'description', existing_type=sa.String(length=5000), nullable=False)

    # 4. Revert education
    op.alter_column('education', 'degree', existing_type=sa.String(length=255), nullable=False)
    op.alter_column('education', 'institution', existing_type=sa.String(length=255), nullable=False)
    op.drop_column('education', 'url')
    op.drop_column('education', 'detail')
    op.drop_column('education', 'organization')
    op.drop_column('education', 'title')

    # 3. Revert experience
    op.drop_table('experience')

    # 2. Revert skill.name
    op.alter_column(
        'skill',
        'name',
        type_=sa.Enum(name='itskill'),
        postgresql_using='name::itskill',
        existing_nullable=False,
    )

    # 1. Revert freelancerprofile
    op.drop_index(op.f('ix_freelancerprofile_category'), table_name='freelancerprofile')
    op.drop_column('freelancerprofile', 'finished')
    op.drop_column('freelancerprofile', 'hours')
    op.drop_column('freelancerprofile', 'availability')
    op.drop_column('freelancerprofile', 'category')
