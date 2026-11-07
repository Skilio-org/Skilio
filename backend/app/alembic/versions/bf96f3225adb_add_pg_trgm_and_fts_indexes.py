"""add_pg_trgm_and_fts_indexes

Revision ID: bf96f3225adb
Revises: 3a0822e2442f
Create Date: 2026-11-07 14:55:33.255694

"""

from alembic import op

# revision identifiers, used by Alembic.
revision = "bf96f3225adb"
down_revision = "3a0822e2442f"
branch_labels = None
depends_on = None


def upgrade():
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm;")
    op.execute("CREATE EXTENSION IF NOT EXISTS unaccent;")

    op.execute("""
    CREATE INDEX IF NOT EXISTS ix_freelancer_profile_fts ON freelancerprofile USING gin (
        (
            setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
            setweight(to_tsvector('english', coalesce(skills::text, '')), 'A') ||
            setweight(to_tsvector('english', coalesce(category, '')), 'B') ||
            setweight(to_tsvector('english', coalesce(bio, '')), 'D')
        )
    );
    """)

    op.execute("""
    CREATE INDEX IF NOT EXISTS ix_freelancer_profile_title_trgm ON freelancerprofile USING gin (title gin_trgm_ops);
    """)

    op.execute("""
    CREATE INDEX IF NOT EXISTS ix_freelancer_profile_skills_trgm ON freelancerprofile USING gin ((skills::text) gin_trgm_ops);
    """)

    op.execute("""
    CREATE INDEX IF NOT EXISTS ix_job_post_fts ON jobpost USING gin (
        (
            setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
            setweight(to_tsvector('english', coalesce(skills::text, '')), 'A') ||
            setweight(to_tsvector('english', coalesce(category, '')), 'B') ||
            setweight(to_tsvector('english', coalesce(description, '')), 'D')
        )
    );
    """)

    op.execute("""
    CREATE INDEX IF NOT EXISTS ix_job_post_title_trgm ON jobpost USING gin (title gin_trgm_ops);
    """)

    op.execute("""
    CREATE INDEX IF NOT EXISTS ix_job_post_skills_trgm ON jobpost USING gin ((skills::text) gin_trgm_ops);
    """)


def downgrade():
    op.execute("DROP INDEX IF EXISTS ix_job_post_skills_trgm;")
    op.execute("DROP INDEX IF EXISTS ix_job_post_title_trgm;")
    op.execute("DROP INDEX IF EXISTS ix_job_post_fts;")
    op.execute("DROP INDEX IF EXISTS ix_freelancer_profile_skills_trgm;")
    op.execute("DROP INDEX IF EXISTS ix_freelancer_profile_title_trgm;")
    op.execute("DROP INDEX IF EXISTS ix_freelancer_profile_fts;")
