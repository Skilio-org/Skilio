"""init: essential model

Revision ID: e71f8cf95870
Revises: fe56fa70289e
Create Date: 2026-09-07 16:59:39.265486

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = 'e71f8cf95870'
down_revision = 'fe56fa70289e'
branch_labels = None
depends_on = None


def upgrade():
    # 1. Create freelancerprofile WITHOUT the media foreign keys
    op.create_table('freelancerprofile',
    sa.Column('title', sqlmodel.sql.sqltypes.AutoString(length=255), nullable=True),
    sa.Column('bio', sqlmodel.sql.sqltypes.AutoString(length=5000), nullable=True),
    sa.Column('hourly_rate', sa.Float(), nullable=True),
    sa.Column('years_of_experience', sa.Integer(), nullable=True),
    sa.Column('is_available', sa.Boolean(), nullable=False),
    sa.Column('avatar_url', sqlmodel.sql.sqltypes.AutoString(length=2048), nullable=True),
    sa.Column('resume_url', sqlmodel.sql.sqltypes.AutoString(length=2048), nullable=True),
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('user_id', sa.Uuid(), nullable=False),
    sa.Column('avatar_id', sa.Uuid(), nullable=True),
    sa.Column('resume_id', sa.Uuid(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('user_id')
    )

    # 2. Create media
    op.create_table('media',
    sa.Column('title', sqlmodel.sql.sqltypes.AutoString(length=255), nullable=True),
    sa.Column('description', sqlmodel.sql.sqltypes.AutoString(length=1000), nullable=True),
    sa.Column('media_type', sa.Enum('AVATAR', 'RESUME', 'PORTFOLIO_IMAGE', 'CHAT_ATTACHMENT', 'OTHER', name='mediatype'), nullable=False),
    sa.Column('public_id', sqlmodel.sql.sqltypes.AutoString(length=255), nullable=False),
    sa.Column('url', sqlmodel.sql.sqltypes.AutoString(length=2048), nullable=False),
    sa.Column('resource_type', sqlmodel.sql.sqltypes.AutoString(length=50), nullable=False),
    sa.Column('format', sqlmodel.sql.sqltypes.AutoString(length=20), nullable=True),
    sa.Column('bytes', sa.Integer(), nullable=True),
    sa.Column('width', sa.Integer(), nullable=True),
    sa.Column('height', sa.Integer(), nullable=True),
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('uploader_id', sa.Uuid(), nullable=False),
    sa.Column('freelancer_profile_id', sa.Uuid(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['freelancer_profile_id'], ['freelancerprofile.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['uploader_id'], ['user.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_media_public_id'), 'media', ['public_id'], unique=False)

    # 3. Add the foreign keys BACK to freelancerprofile now that media exists
    op.create_foreign_key('fk_freelancerprofile_avatar_id', 'freelancerprofile', 'media', ['avatar_id'], ['id'], ondelete='SET NULL')
    op.create_foreign_key('fk_freelancerprofile_resume_id', 'freelancerprofile', 'media', ['resume_id'], ['id'], ondelete='SET NULL')

    # ... The rest of your tables remain unchanged
    op.create_table('skill',
    sa.Column('name', sa.Enum('PYTHON', 'FASTAPI', 'DJANGO', 'JAVASCRIPT', 'TYPESCRIPT', 'REACT', 'NEXTJS', 'VUE', 'ANGULAR', 'NODEJS', 'GO', 'JAVA', 'SPRING_BOOT', 'DOTNET', 'PHP', 'LARAVEL', 'RUST', 'C_PLUS_PLUS', 'REACT_NATIVE', 'FLUTTER', 'SWIFT', 'KOTLIN', 'POSTGRESQL', 'MYSQL', 'MONGODB', 'REDIS', 'DOCKER', 'KUBERNETES', 'AWS', 'AZURE', 'GCP', 'TERRAFORM', 'CI_CD', 'LINUX', 'MACHINE_LEARNING', 'DEEP_LEARNING', 'DATA_ANALYSIS', 'PYTORCH', 'TENSORFLOW', 'UI_UX_DESIGN', 'FIGMA', 'QA_AUTOMATION', 'CYBERSECURITY', name='itskill'), nullable=False),
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_skill_name'), 'skill', ['name'], unique=True)
    
    op.create_table('conversation',
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('client_id', sa.Uuid(), nullable=False),
    sa.Column('freelancer_id', sa.Uuid(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['client_id'], ['user.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['freelancer_id'], ['user.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('client_id', 'freelancer_id', name='uq_client_freelancer_conversation')
    )
    
    op.create_table('freelancerskilllink',
    sa.Column('freelancer_profile_id', sa.Uuid(), nullable=False),
    sa.Column('skill_id', sa.Uuid(), nullable=False),
    sa.ForeignKeyConstraint(['freelancer_profile_id'], ['freelancerprofile.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['skill_id'], ['skill.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('freelancer_profile_id', 'skill_id')
    )
    
    op.create_table('likedfreelancer',
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('client_id', sa.Uuid(), nullable=False),
    sa.Column('freelancer_id', sa.Uuid(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['client_id'], ['user.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['freelancer_id'], ['freelancerprofile.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('client_id', 'freelancer_id', name='uq_client_freelancer_like')
    )
    
    op.create_table('review',
    sa.Column('rating', sa.Integer(), nullable=False),
    sa.Column('comment', sqlmodel.sql.sqltypes.AutoString(length=3000), nullable=False),
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('client_id', sa.Uuid(), nullable=False),
    sa.Column('freelancer_id', sa.Uuid(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['client_id'], ['user.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['freelancer_id'], ['freelancerprofile.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('client_id', 'freelancer_id', name='uq_client_freelancer_review')
    )
    
    op.create_table('chatmessage',
    sa.Column('content', sqlmodel.sql.sqltypes.AutoString(length=5000), nullable=False),
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('conversation_id', sa.Uuid(), nullable=False),
    sa.Column('sender_id', sa.Uuid(), nullable=False),
    sa.Column('attachment_id', sa.Uuid(), nullable=True),
    sa.Column('is_read', sa.Boolean(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['attachment_id'], ['media.id'], ondelete='SET NULL'),
    sa.ForeignKeyConstraint(['conversation_id'], ['conversation.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['sender_id'], ['user.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    
    userrole = sa.Enum('CLIENT', 'FREELANCER', 'ADMIN', name='userrole')
    userrole.create(op.get_bind(), checkfirst=True)
    op.add_column('user', sa.Column('role', userrole, nullable=False, server_default='CLIENT'))


def downgrade():
    op.drop_column('user', 'role')
    sa.Enum(name='userrole').drop(op.get_bind(), checkfirst=True)
    op.drop_table('chatmessage')
    op.drop_table('review')
    op.drop_table('likedfreelancer')
    op.drop_table('freelancerskilllink')
    op.drop_table('conversation')
    op.drop_index(op.f('ix_skill_name'), table_name='skill')
    op.drop_table('skill')
    sa.Enum(name='itskill').drop(op.get_bind(), checkfirst=True)
    
    # 4. Drop the constraints we manually added to break the circle
    op.drop_constraint('fk_freelancerprofile_avatar_id', 'freelancerprofile', type_='foreignkey')
    op.drop_constraint('fk_freelancerprofile_resume_id', 'freelancerprofile', type_='foreignkey')
    
    op.drop_index(op.f('ix_media_public_id'), table_name='media')
    op.drop_table('media')
    sa.Enum(name='mediatype').drop(op.get_bind(), checkfirst=True)
    op.drop_table('freelancerprofile')