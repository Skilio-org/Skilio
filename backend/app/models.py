import uuid
from datetime import UTC, datetime
from enum import StrEnum
from typing import Optional

from pydantic import EmailStr
from sqlalchemy import DateTime, UniqueConstraint
from sqlmodel import Field, Relationship, SQLModel


def get_datetime_utc() -> datetime:
    return datetime.now(UTC)


# ==============================================================================
# Enums
# ==============================================================================


class UserRole(StrEnum):
    CLIENT = "client"
    FREELANCER = "freelancer"
    ADMIN = "admin"


class MediaType(StrEnum):
    AVATAR = "avatar"
    RESUME = "resume"
    PORTFOLIO_IMAGE = "portfolio_image"
    CHAT_ATTACHMENT = "chat_attachment"
    OTHER = "other"


class BudgetType(StrEnum):
    HOURLY = "hourly"
    FIXED = "fixed"


class JobStatus(StrEnum):
    OPEN = "open"
    CLOSED = "closed"


class ProposalStatus(StrEnum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"


class ITSkill(StrEnum):
    # Programming Languages & Frameworks
    PYTHON = "Python"
    FASTAPI = "FastAPI"
    DJANGO = "Django"
    JAVASCRIPT = "JavaScript"
    TYPESCRIPT = "TypeScript"
    REACT = "React"
    NEXTJS = "Next.js"
    VUE = "Vue.js"
    ANGULAR = "Angular"
    NODEJS = "Node.js"
    GO = "Go"
    JAVA = "Java"
    SPRING_BOOT = "Spring Boot"
    DOTNET = ".NET"
    PHP = "PHP"
    LARAVEL = "Laravel"
    RUST = "Rust"
    C_PLUS_PLUS = "C++"

    # Mobile Development
    REACT_NATIVE = "React Native"
    FLUTTER = "Flutter"
    SWIFT = "Swift"
    KOTLIN = "Kotlin"

    # Databases & Storage
    POSTGRESQL = "PostgreSQL"
    MYSQL = "MySQL"
    MONGODB = "MongoDB"
    REDIS = "Redis"

    # DevOps, Cloud & Systems
    DOCKER = "Docker"
    KUBERNETES = "Kubernetes"
    AWS = "AWS"
    AZURE = "Azure"
    GCP = "GCP"
    TERRAFORM = "Terraform"
    CI_CD = "CI/CD"
    LINUX = "Linux"

    # Data, AI & Machine Learning
    MACHINE_LEARNING = "Machine Learning"
    DEEP_LEARNING = "Deep Learning"
    DATA_ANALYSIS = "Data Analysis"
    PYTORCH = "PyTorch"
    TENSORFLOW = "TensorFlow"

    # UI/UX & Design
    UI_UX_DESIGN = "UI/UX Design"
    FIGMA = "Figma"

    # Quality Assurance & Security
    QA_AUTOMATION = "QA & Automated Testing"
    CYBERSECURITY = "Cybersecurity"


# ==============================================================================
# User Models
# ==============================================================================

MediaLink = str


# Shared properties
class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    is_superuser: bool = False
    full_name: str | None = Field(default=None, max_length=255)
    role: UserRole = Field(default=UserRole.CLIENT)

    # For google Auth.
    google_id: str | None = Field(default=None, max_length=255)
    refresh_token: str | None = Field(default=None) 


class AvatarResponse(SQLModel):
    status: str


# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)


class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=128)
    full_name: str | None = Field(default=None, max_length=255)
    role: UserRole = Field(default=UserRole.CLIENT)


# Properties to receive via API on update, all are optional
class UserUpdate(SQLModel):
    email: EmailStr | None = Field(default=None, max_length=255)
    is_active: bool | None = None
    is_superuser: bool | None = None
    full_name: str | None = Field(default=None, max_length=255)
    role: UserRole | None = None
    password: str | None = Field(default=None, min_length=8, max_length=128)


class UserUpdateMe(SQLModel):
    full_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)
    role: UserRole | None = None


class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)


# Database model, database table inferred from class name
class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    avatar_url: str | None = Field(
        default=None, max_length=500
    )  # stores the Cloudinary url
    # items: list["Item"] = Relationship(back_populates="owner", cascade_delete=True) No items anymore

    freelancer_profile: Optional["FreelancerProfile"] = Relationship(
        back_populates="user",
        cascade_delete=True,
        sa_relationship_kwargs={"uselist": False},
    )
    uploaded_media: list["Media"] = Relationship(
        back_populates="uploader",
        cascade_delete=True,
        sa_relationship_kwargs={"foreign_keys": "[Media.uploader_id]"},
    )
    client_reviews: list["Review"] = Relationship(
        back_populates="client",
        cascade_delete=True,
        sa_relationship_kwargs={"foreign_keys": "[Review.client_id]"},
    )
    liked_freelancers: list["LikedFreelancer"] = Relationship(
        back_populates="client",
        cascade_delete=True,
        sa_relationship_kwargs={"foreign_keys": "[LikedFreelancer.client_id]"},
    )
    client_conversations: list["Conversation"] = Relationship(
        back_populates="client",
        sa_relationship_kwargs={"foreign_keys": "[Conversation.client_id]"},
    )
    freelancer_conversations: list["Conversation"] = Relationship(
        back_populates="freelancer",
        sa_relationship_kwargs={"foreign_keys": "[Conversation.freelancer_id]"},
    )
    sent_messages: list["ChatMessage"] = Relationship(
        back_populates="sender",
        sa_relationship_kwargs={"foreign_keys": "[ChatMessage.sender_id]"},
    )
    job_posts: list["JobPost"] = Relationship(
        back_populates="client",
        cascade_delete=True,
        sa_relationship_kwargs={"foreign_keys": "[JobPost.client_id]"},
    )
    proposals: list["Proposal"] = Relationship(
        back_populates="freelancer",
        cascade_delete=True,
        sa_relationship_kwargs={"foreign_keys": "[Proposal.freelancer_id]"},
    )
    saved_jobs: list["SavedJob"] = Relationship(
        back_populates="freelancer",
        cascade_delete=True,
        sa_relationship_kwargs={"foreign_keys": "[SavedJob.freelancer_id]"},
    )


# Properties to return via API, id is always required
class UserPublic(UserBase):
    id: uuid.UUID
    created_at: datetime | None = None


class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int


# ==============================================================================
# Media Models (Cloudinary Ready)
# ==============================================================================
class MediaBase(SQLModel):
    title: str | None = Field(default=None, max_length=255)
    description: str | None = Field(default=None, max_length=1000)
    media_type: MediaType = Field(default=MediaType.PORTFOLIO_IMAGE)
    public_id: str = Field(index=True, max_length=255)
    url: str = Field(max_length=2048)
    resource_type: str = Field(default="image", max_length=50)
    format: str | None = Field(default=None, max_length=20)
    bytes: int | None = Field(default=None)
    width: int | None = Field(default=None)
    height: int | None = Field(default=None)


class MediaCreate(MediaBase):
    freelancer_profile_id: uuid.UUID | None = None


class MediaUpdate(SQLModel):
    title: str | None = Field(default=None, max_length=255)
    description: str | None = Field(default=None, max_length=1000)
    media_type: MediaType | None = None


class Media(MediaBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    uploader_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    freelancer_profile_id: uuid.UUID | None = Field(
        default=None,
        foreign_key="freelancerprofile.id",
        nullable=True,
        ondelete="CASCADE",
    )
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )

    uploader: Optional[User] = Relationship(
        back_populates="uploaded_media",
        sa_relationship_kwargs={"foreign_keys": "[Media.uploader_id]"},
    )
    freelancer_profile: Optional["FreelancerProfile"] = Relationship(
        back_populates="portfolio_media",
        sa_relationship_kwargs={"foreign_keys": "[Media.freelancer_profile_id]"},
    )


class MediaPublic(MediaBase):
    id: uuid.UUID
    uploader_id: uuid.UUID
    freelancer_profile_id: uuid.UUID | None = None
    created_at: datetime | None = None


class MediasPublic(SQLModel):
    data: list[MediaPublic]
    count: int


# ==============================================================================
# Skill Models & FreelancerSkillLink
# ==============================================================================


class FreelancerSkillLink(SQLModel, table=True):
    freelancer_profile_id: uuid.UUID = Field(
        foreign_key="freelancerprofile.id", primary_key=True, ondelete="CASCADE"
    )
    skill_id: uuid.UUID = Field(
        foreign_key="skill.id", primary_key=True, ondelete="CASCADE"
    )


class JobSkillLink(SQLModel, table=True):
    job_post_id: uuid.UUID = Field(
        foreign_key="jobpost.id", primary_key=True, ondelete="CASCADE"
    )
    skill_id: uuid.UUID = Field(
        foreign_key="skill.id", primary_key=True, ondelete="CASCADE"
    )


class SkillBase(SQLModel):
    name: ITSkill = Field(unique=True, index=True)


class SkillCreate(SkillBase):
    pass


class SkillUpdate(SQLModel):
    name: ITSkill | None = None


class Skill(SkillBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    freelancer_profiles: list["FreelancerProfile"] = Relationship(
        back_populates="skills", link_model=FreelancerSkillLink
    )
    job_posts: list["JobPost"] = Relationship(
        back_populates="required_skills", link_model=JobSkillLink
    )


class SkillPublic(SkillBase):
    id: uuid.UUID


class SkillsPublic(SQLModel):
    data: list[SkillPublic]
    count: int


# ==============================================================================
# Freelancer Profile Models
# ==============================================================================


class FreelancerProfileBase(SQLModel):
    title: str | None = Field(default=None, max_length=255)
    bio: str | None = Field(default=None, max_length=5000)
    hourly_rate: float | None = Field(default=None, ge=0)
    years_of_experience: int | None = Field(default=None, ge=0)
    is_available: bool = True
    location: str | None = Field(default=None, max_length=255)
    timezone: str | None = Field(default=None, max_length=100)
    languages: str | None = Field(default=None, max_length=500)
    resume_url: str | None = Field(default=None, max_length=2048)


class FreelancerProfileCreate(FreelancerProfileBase):
    skills: list[ITSkill] = Field(default_factory=list)


class FreelancerProfileUpdate(SQLModel):
    title: str | None = Field(default=None, max_length=255)
    bio: str | None = Field(default=None, max_length=5000)
    hourly_rate: float | None = Field(default=None, ge=0)
    years_of_experience: int | None = Field(default=None, ge=0)
    is_available: bool | None = None
    location: str | None = Field(default=None, max_length=255)
    timezone: str | None = Field(default=None, max_length=100)
    languages: str | None = Field(default=None, max_length=500)
    resume_url: str | None = Field(default=None, max_length=2048)
    skills: list[ITSkill] | None = None


class FreelancerProfile(FreelancerProfileBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(
        foreign_key="user.id", unique=True, nullable=False, ondelete="CASCADE"
    )
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    updated_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )

    user: User | None = Relationship(back_populates="freelancer_profile")
    portfolio_media: list[Media] = Relationship(
        back_populates="freelancer_profile",
        cascade_delete=True,
        sa_relationship_kwargs={"foreign_keys": "[Media.freelancer_profile_id]"},
    )
    skills: list[Skill] = Relationship(
        back_populates="freelancer_profiles", link_model=FreelancerSkillLink
    )
    reviews: list["Review"] = Relationship(
        back_populates="freelancer", cascade_delete=True
    )
    liked_by: list["LikedFreelancer"] = Relationship(
        back_populates="freelancer", cascade_delete=True
    )


class FreelancerProfilePublic(FreelancerProfileBase):
    id: uuid.UUID
    user_id: uuid.UUID
    full_name: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None
    skills: list[SkillPublic] = Field(default_factory=list)
    average_rating: float | None = None
    reviews_count: int = 0
    is_saved: bool = False


class FreelancerProfileDetailPublic(FreelancerProfilePublic):
    portfolio_media: list[MediaPublic] = Field(default_factory=list)
    reviews: list["ReviewPublic"] = Field(default_factory=list)
    user: UserPublic | None = None


class FreelancerProfilesPublic(SQLModel):
    data: list[FreelancerProfilePublic]
    count: int


# ==============================================================================
# Review Models
# ==============================================================================


class ReviewBase(SQLModel):
    rating: int = Field(ge=1, le=5, description="Stars review between 1 and 5")
    comment: str = Field(
        min_length=1,
        max_length=3000,
        description="Review comment on freelancer profile",
    )


class ReviewCreate(ReviewBase):
    freelancer_id: uuid.UUID


class ReviewUpdate(SQLModel):
    rating: int | None = Field(default=None, ge=1, le=5)
    comment: str | None = Field(default=None, min_length=1, max_length=3000)


class Review(ReviewBase, table=True):
    __table_args__ = (
        UniqueConstraint(
            "client_id", "freelancer_id", name="uq_client_freelancer_review"
        ),
    )

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    client_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    freelancer_id: uuid.UUID = Field(
        foreign_key="freelancerprofile.id", nullable=False, ondelete="CASCADE"
    )
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    updated_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )

    client: User | None = Relationship(
        back_populates="client_reviews",
        sa_relationship_kwargs={"foreign_keys": "[Review.client_id]"},
    )
    freelancer: FreelancerProfile | None = Relationship(
        back_populates="reviews",
        sa_relationship_kwargs={"foreign_keys": "[Review.freelancer_id]"},
    )


class ReviewPublic(ReviewBase):
    id: uuid.UUID
    client_id: uuid.UUID
    freelancer_id: uuid.UUID
    client_name: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None


class ReviewsPublic(SQLModel):
    data: list[ReviewPublic]
    count: int


# ==============================================================================
# Liked Freelancers Models
# ==============================================================================


class LikedFreelancerBase(SQLModel):
    freelancer_id: uuid.UUID


class LikedFreelancerCreate(LikedFreelancerBase):
    pass


class LikedFreelancer(SQLModel, table=True):
    __table_args__ = (
        UniqueConstraint(
            "client_id", "freelancer_id", name="uq_client_freelancer_like"
        ),
    )

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    client_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    freelancer_id: uuid.UUID = Field(
        foreign_key="freelancerprofile.id", nullable=False, ondelete="CASCADE"
    )
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )

    client: User | None = Relationship(
        back_populates="liked_freelancers",
        sa_relationship_kwargs={"foreign_keys": "[LikedFreelancer.client_id]"},
    )
    freelancer: FreelancerProfile | None = Relationship(
        back_populates="liked_by",
        sa_relationship_kwargs={"foreign_keys": "[LikedFreelancer.freelancer_id]"},
    )


class LikedFreelancerPublic(SQLModel):
    id: uuid.UUID
    client_id: uuid.UUID
    freelancer_id: uuid.UUID
    created_at: datetime | None = None
    freelancer: FreelancerProfilePublic | None = None


class LikedFreelancersPublic(SQLModel):
    data: list[LikedFreelancerPublic]
    count: int


# ==============================================================================
# Chat & Messaging Models
# ==============================================================================


class ConversationBase(SQLModel):
    pass


class ConversationCreate(SQLModel):
    freelancer_id: uuid.UUID


class Conversation(SQLModel, table=True):
    __table_args__ = (
        UniqueConstraint(
            "client_id", "freelancer_id", name="uq_client_freelancer_conversation"
        ),
    )

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    client_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    freelancer_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    updated_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )

    client: User | None = Relationship(
        back_populates="client_conversations",
        sa_relationship_kwargs={"foreign_keys": "[Conversation.client_id]"},
    )
    freelancer: User | None = Relationship(
        back_populates="freelancer_conversations",
        sa_relationship_kwargs={"foreign_keys": "[Conversation.freelancer_id]"},
    )
    messages: list["ChatMessage"] = Relationship(
        back_populates="conversation", cascade_delete=True
    )


class ChatMessageBase(SQLModel):
    content: str = Field(min_length=1, max_length=5000)


class ChatMessageCreate(ChatMessageBase):
    conversation_id: uuid.UUID
    attachment_id: uuid.UUID | None = None


class ChatMessageUpdate(SQLModel):
    is_read: bool | None = None


class ChatMessage(ChatMessageBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    conversation_id: uuid.UUID = Field(
        foreign_key="conversation.id", nullable=False, ondelete="CASCADE"
    )
    sender_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    attachment_id: uuid.UUID | None = Field(
        default=None, foreign_key="media.id", ondelete="SET NULL"
    )
    is_read: bool = Field(default=False)
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )

    conversation: Conversation | None = Relationship(back_populates="messages")
    sender: User | None = Relationship(
        back_populates="sent_messages",
        sa_relationship_kwargs={"foreign_keys": "[ChatMessage.sender_id]"},
    )
    attachment: Media | None = Relationship()


class ChatMessagePublic(ChatMessageBase):
    id: uuid.UUID
    conversation_id: uuid.UUID
    sender_id: uuid.UUID
    attachment_id: uuid.UUID | None = None
    attachment: MediaPublic | None = None
    is_read: bool
    created_at: datetime | None = None


class ChatMessagesPublic(SQLModel):
    data: list[ChatMessagePublic]
    count: int


class ConversationPublic(SQLModel):
    id: uuid.UUID
    client_id: uuid.UUID
    freelancer_id: uuid.UUID
    created_at: datetime | None = None
    updated_at: datetime | None = None
    last_message: ChatMessagePublic | None = None
    unread_count: int = 0


class ConversationsPublic(SQLModel):
    data: list[ConversationPublic]
    count: int


# ==============================================================================
# Job Post Models
# ==============================================================================


class JobPostBase(SQLModel):
    title: str = Field(min_length=1, max_length=255)
    description: str = Field(min_length=1, max_length=5000)
    budget_type: BudgetType = Field(default=BudgetType.FIXED)
    budget: float = Field(ge=0)
    location: str | None = Field(default=None, max_length=255)
    status: JobStatus = Field(default=JobStatus.OPEN)


class JobPostCreate(JobPostBase):
    skills: list[ITSkill] = Field(default_factory=list)


class JobPostUpdate(SQLModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = Field(default=None, min_length=1, max_length=5000)
    budget_type: BudgetType | None = None
    budget: float | None = Field(default=None, ge=0)
    location: str | None = Field(default=None, max_length=255)
    status: JobStatus | None = None
    skills: list[ITSkill] | None = None


class JobPost(JobPostBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    client_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    updated_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )

    client: Optional[User] = Relationship(
        back_populates="job_posts",
        sa_relationship_kwargs={"foreign_keys": "[JobPost.client_id]"},
    )
    required_skills: list[Skill] = Relationship(
        back_populates="job_posts", link_model=JobSkillLink
    )
    proposals: list["Proposal"] = Relationship(
        back_populates="job_post", cascade_delete=True
    )
    saved_by: list["SavedJob"] = Relationship(
        back_populates="job_post", cascade_delete=True
    )


class JobPostPublic(JobPostBase):
    id: uuid.UUID
    client_id: uuid.UUID
    client_name: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None
    skills: list[SkillPublic] = Field(default_factory=list)
    proposals_count: int = 0
    is_saved: bool = False
    has_applied: bool = False


class JobPostDetailPublic(JobPostPublic):
    client: UserPublic | None = None


class JobPostsPublic(SQLModel):
    data: list[JobPostPublic]
    count: int


# ==============================================================================
# Proposal Models
# ==============================================================================


class ProposalBase(SQLModel):
    cover_letter: str | None = Field(default=None, max_length=3000)


class ProposalCreate(ProposalBase):
    job_post_id: uuid.UUID


class ProposalStatusUpdate(SQLModel):
    status: ProposalStatus


class Proposal(ProposalBase, table=True):
    __table_args__ = (
        UniqueConstraint(
            "job_post_id", "freelancer_id", name="uq_job_freelancer_proposal"
        ),
    )

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    job_post_id: uuid.UUID = Field(
        foreign_key="jobpost.id", nullable=False, ondelete="CASCADE"
    )
    freelancer_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    status: ProposalStatus = Field(default=ProposalStatus.PENDING)
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    updated_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )

    job_post: Optional[JobPost] = Relationship(back_populates="proposals")
    freelancer: Optional[User] = Relationship(
        back_populates="proposals",
        sa_relationship_kwargs={"foreign_keys": "[Proposal.freelancer_id]"},
    )


class ProposalPublic(ProposalBase):
    id: uuid.UUID
    job_post_id: uuid.UUID
    freelancer_id: uuid.UUID
    status: ProposalStatus
    created_at: datetime | None = None
    updated_at: datetime | None = None
    freelancer: UserPublic | None = None
    freelancer_profile: Optional[FreelancerProfilePublic] = None


class ProposalsPublic(SQLModel):
    data: list[ProposalPublic]
    count: int


# ==============================================================================
# Saved Job Models
# ==============================================================================


class SavedJobBase(SQLModel):
    job_post_id: uuid.UUID


class SavedJobCreate(SavedJobBase):
    pass


class SavedJob(SQLModel, table=True):
    __table_args__ = (
        UniqueConstraint(
            "freelancer_id", "job_post_id", name="uq_freelancer_saved_job"
        ),
    )

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    freelancer_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    job_post_id: uuid.UUID = Field(
        foreign_key="jobpost.id", nullable=False, ondelete="CASCADE"
    )
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )

    freelancer: Optional[User] = Relationship(
        back_populates="saved_jobs",
        sa_relationship_kwargs={"foreign_keys": "[SavedJob.freelancer_id]"},
    )
    job_post: Optional[JobPost] = Relationship(back_populates="saved_by")


class SavedJobPublic(SQLModel):
    id: uuid.UUID
    job_post_id: uuid.UUID
    created_at: datetime | None = None
    job_post: JobPostPublic | None = None


class SavedJobsPublic(SQLModel):
    data: list[SavedJobPublic]
    count: int


# Generic message
class Message(SQLModel):
    message: str


# JSON payload containing access token
class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


# Contents of JWT token
class TokenPayload(SQLModel):
    sub: str | None = None


class NewPassword(SQLModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)
