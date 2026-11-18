"""add_cloudinary_url_to_portfolio_item

Revision ID: 4a199dbae637
Revises: 18de95c5c660
Create Date: 2026-11-18 12:58:36.282717

"""

import sqlalchemy as sa
import sqlmodel.sql.sqltypes
from alembic import op

# revision identifiers, used by Alembic.
revision = "4a199dbae637"
down_revision = "18de95c5c660"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "portfolioitem",
        sa.Column(
            "cloudinary_url",
            sqlmodel.sql.sqltypes.AutoString(length=2048),
            nullable=True,
        ),
    )
    op.execute(
        "UPDATE portfolioitem "
        "SET cloudinary_url = image_url, "
        "    image_url = '/api/v1/profiles/portfolio/' || id || '/image' "
        "WHERE image_url IS NOT NULL AND image_url NOT LIKE '/api/v1/%'"
    )


def downgrade():
    op.execute(
        "UPDATE portfolioitem "
        "SET image_url = cloudinary_url "
        "WHERE cloudinary_url IS NOT NULL"
    )
    op.drop_column("portfolioitem", "cloudinary_url")
