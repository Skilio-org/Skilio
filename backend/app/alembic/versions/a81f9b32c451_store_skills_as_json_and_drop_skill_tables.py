"""store skills as json and drop skill tables

Revision ID: a81f9b32c451
Revises: c1f92e4b8a10
Create Date: 2026-09-22 10:45:00.000000

"""
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = 'a81f9b32c451'
down_revision = 'c1f92e4b8a10'
branch_labels = None
depends_on = None


def upgrade():
    # 1. Add skills JSON columns to freelancerprofile and jobpost
    op.add_column(
        'freelancerprofile',
        sa.Column('skills', sa.JSON(), nullable=False, server_default='[]'),
    )
    op.add_column(
        'jobpost',
        sa.Column('skills', sa.JSON(), nullable=False, server_default='[]'),
    )

    # 2. Migrate existing freelancer skills from link table to JSON array
    op.execute("""
        UPDATE freelancerprofile fp
        SET skills = sub.skill_list
        FROM (
            SELECT fsl.freelancer_profile_id, json_agg(s.name) AS skill_list
            FROM freelancerskilllink fsl
            JOIN skill s ON s.id = fsl.skill_id
            GROUP BY fsl.freelancer_profile_id
        ) sub
        WHERE fp.id = sub.freelancer_profile_id;
    """)

    # 3. Migrate existing job skills from link table to JSON array
    op.execute("""
        UPDATE jobpost jp
        SET skills = sub.skill_list
        FROM (
            SELECT jsl.job_post_id, json_agg(s.name) AS skill_list
            FROM jobskilllink jsl
            JOIN skill s ON s.id = jsl.skill_id
            GROUP BY jsl.job_post_id
        ) sub
        WHERE jp.id = sub.job_post_id;
    """)

    # 4. Drop link tables and skill table
    op.drop_table('freelancerskilllink')
    op.drop_table('jobskilllink')
    op.drop_index(op.f('ix_skill_name'), table_name='skill')
    op.drop_table('skill')

    # 5. Drop itskill enum if it still exists
    sa.Enum(name='itskill').drop(op.get_bind(), checkfirst=True)


def downgrade():
    # 1. Re-create skill table
    op.create_table(
        'skill',
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_skill_name'), 'skill', ['name'], unique=True)

    # 2. Re-create freelancerskilllink table
    op.create_table(
        'freelancerskilllink',
        sa.Column('freelancer_profile_id', sa.Uuid(), nullable=False),
        sa.Column('skill_id', sa.Uuid(), nullable=False),
        sa.ForeignKeyConstraint(['freelancer_profile_id'], ['freelancerprofile.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['skill_id'], ['skill.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('freelancer_profile_id', 'skill_id'),
    )

    # 3. Re-create jobskilllink table
    op.create_table(
        'jobskilllink',
        sa.Column('job_post_id', sa.Uuid(), nullable=False),
        sa.Column('skill_id', sa.Uuid(), nullable=False),
        sa.ForeignKeyConstraint(['job_post_id'], ['jobpost.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['skill_id'], ['skill.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('job_post_id', 'skill_id'),
    )

    # 4. Drop skills JSON columns
    op.drop_column('jobpost', 'skills')
    op.drop_column('freelancerprofile', 'skills')
