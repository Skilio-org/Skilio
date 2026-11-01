"""fix unread count default

Revision ID: generated_id
Revises: 35173174ac9c
"""

from alembic import op
import sqlalchemy as sa


revision = "generated_id"
down_revision = "35173174ac9c"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column(
        "conversation",
        "unread_count",
        existing_type=sa.Integer(),
        server_default=sa.text("0"),
    )

    op.execute(
        "UPDATE conversation SET unread_count = 0 "
        "WHERE unread_count IS NULL"
    )

    op.alter_column(
        "conversation",
        "unread_count",
        existing_type=sa.Integer(),
        nullable=False,
        existing_server_default=sa.text("0"),
    )


def downgrade() -> None:
    op.alter_column(
        "conversation",
        "unread_count",
        existing_type=sa.Integer(),
        nullable=True,
        server_default=None,
    )