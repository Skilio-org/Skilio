"""dual_profile_connections

Revision ID: 7d033896c7b8
Revises: bf96f3225adb
Create Date: 2026-11-09 19:18:18.820804

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = '7d033896c7b8'
down_revision = 'bf96f3225adb'
branch_labels = None
depends_on = None


def upgrade():
    # 1. Add columns client_id and freelancer_id (initially nullable for backfilling)
    op.add_column('connection', sa.Column('client_id', sa.Uuid(), nullable=True))
    op.add_column('connection', sa.Column('freelancer_id', sa.Uuid(), nullable=True))

    # 2. Backfill existing rows
    op.execute("""
        UPDATE connection
        SET
            client_id = jobpost.client_id,
            freelancer_id = connection.sender_id
        FROM jobpost
        WHERE connection.job_post_id IS NOT NULL
          AND connection.job_post_id = jobpost.id;
    """)
    op.execute("""
        UPDATE connection
        SET
            client_id = sender_id,
            freelancer_id = receiver_id
        WHERE connection.job_post_id IS NULL;
    """)
    op.execute("""
        UPDATE connection
        SET
            client_id = COALESCE(client_id, sender_id),
            freelancer_id = COALESCE(freelancer_id, receiver_id)
        WHERE client_id IS NULL OR freelancer_id IS NULL;
    """)

    # 3. Set columns to nullable=False
    op.alter_column('connection', 'client_id', nullable=False)
    op.alter_column('connection', 'freelancer_id', nullable=False)

    # 4. Drop old constraints and indexes
    op.drop_constraint('uq_sender_receiver_connection', 'connection', type_='unique')
    op.execute("DROP INDEX IF EXISTS uq_connection_user_pair;")

    # 5. Add foreign keys and indexes
    op.create_foreign_key('fk_connection_client_id_user', 'connection', 'user', ['client_id'], ['id'], ondelete='CASCADE')
    op.create_foreign_key('fk_connection_freelancer_id_user', 'connection', 'user', ['freelancer_id'], ['id'], ondelete='CASCADE')
    op.create_index(op.f('ix_connection_client_id'), 'connection', ['client_id'], unique=False)
    op.create_index(op.f('ix_connection_freelancer_id'), 'connection', ['freelancer_id'], unique=False)

    # 6. Add new unique constraint
    op.create_unique_constraint('uq_client_freelancer_connection', 'connection', ['client_id', 'freelancer_id'])


def downgrade():
    op.drop_constraint('uq_client_freelancer_connection', 'connection', type_='unique')
    op.drop_index(op.f('ix_connection_freelancer_id'), table_name='connection')
    op.drop_index(op.f('ix_connection_client_id'), table_name='connection')
    op.drop_constraint('fk_connection_freelancer_id_user', 'connection', type_='foreignkey')
    op.drop_constraint('fk_connection_client_id_user', 'connection', type_='foreignkey')
    op.create_unique_constraint('uq_sender_receiver_connection', 'connection', ['sender_id', 'receiver_id'])
    op.execute("CREATE UNIQUE INDEX IF NOT EXISTS uq_connection_user_pair ON connection (LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id));")
    op.drop_column('connection', 'freelancer_id')
    op.drop_column('connection', 'client_id')
