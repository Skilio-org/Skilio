"""Add persistent single-use password reset tokens.

Revision ID: b7f2c4d8e901
Revises: 7ac3abc6c6d5
"""

from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


revision = "b7f2c4d8e901"
down_revision = "7ac3abc6c6d5"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "passwordresettoken",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("token_hash", sqlmodel.sql.sqltypes.AutoString(length=64), nullable=False),
        sa.Column("email", sqlmodel.sql.sqltypes.AutoString(length=255), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("used_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("token_hash"),
    )
    op.create_index(
        op.f("ix_passwordresettoken_email"),
        "passwordresettoken",
        ["email"],
        unique=False,
    )
    op.create_index(
        op.f("ix_passwordresettoken_token_hash"),
        "passwordresettoken",
        ["token_hash"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_passwordresettoken_token_hash"), table_name="passwordresettoken")
    op.drop_index(op.f("ix_passwordresettoken_email"), table_name="passwordresettoken")
    op.drop_table("passwordresettoken")
