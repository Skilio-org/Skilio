import uuid
from datetime import UTC, datetime
from enum import StrEnum
from typing import Any, Literal, Optional, Self

from pydantic import BaseModel, EmailStr, model_validator
from sqlalchemy import JSON, DateTime, UniqueConstraint
from sqlmodel import Field, Relationship, SQLModel
from sqlalchemy import CheckConstraint  # add to your sqlalchemy import


def get_datetime_utc() -> datetime:
    return datetime.now(UTC)

# ==============================================================================
# Enums
# ==============================================================================

class NotificationType(StrEnum):
    INFO = "info"
    SUCCESS = "success"
    WARNING = "warning"
    ERROR = "error"

class UserRole(StrEnum):
    CLIENT = "client"
    FREELANCER = "freelancer"


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
    DRAFT = "draft"
    OPEN = "open"
    CLOSED = "closed"


class ProposalStatus(StrEnum):
    DRAFT = "draft"
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"


class ConnectionStatus(StrEnum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    DECLINED = "declined"
    WITHDRAWN = "withdrawn"


class JobCategory(StrEnum):
    ACCOUNTING_CONSULTING = "Accounting & Consulting"
    CUSTOMER_SERVICE = "Customer Service"
    DATA_SCIENCE_ANALYTICS = "Data Science & Analytics"
    DESIGN_CREATIVE = "Design & Creative"
    ENGINEERING_ARCHITECTURE = "Engineering & Architecture"
    SALES_MARKETING = "Sales & Marketing"
    WEB_MOBILE_SOFTWARE_DEV = "Web Mobile & Software Dev"
    AI_AUTOMATIONS = "Ai & Automations"
    IT_NETWORKING = "IT & Networking"
    WRITING = "Writing"
    LEGAL = "Legal"


class CategoriesPublic(SQLModel):
    data: list[str]
    count: int


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
    active_role: UserRole = Field(default=UserRole.CLIENT)


class AvatarResponse(SQLModel):
    status: str


# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)


class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=128)
    full_name: str | None = Field(default=None, max_length=255)
    active_role: UserRole = Field(default=UserRole.CLIENT)
    role: UserRole | None = Field(
        default=None, description="Alias for active_role from registration form"
    )

    @model_validator(mode="before")
    @classmethod
    def handle_role_alias(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "role" in data and "active_role" not in data:
                data["active_role"] = data["role"]
            elif "active_role" in data and "role" not in data:
                data["role"] = data["active_role"]
        return data


# Properties to receive via API on update, all are optional
class UserUpdate(SQLModel):
    email: EmailStr | None = Field(default=None, max_length=255)
    is_active: bool | None = None
    is_superuser: bool | None = None
    full_name: str | None = Field(default=None, max_length=255)
    active_role: UserRole | None = None
    password: str | None = Field(default=None, min_length=8, max_length=128)


class UserUpdateMe(SQLModel):
    full_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)
    active_role: UserRole | None = None


class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)


class SwitchRoleRequest(SQLModel):
    role: UserRole


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
    # For google Auth.
    google_id: str | None = Field(default=None, max_length=255)
    linkedin_id: str | None = Field(default=None, max_length=255)

    # For OAuth linkedin
    refresh_token: str | None = Field(default=None)
    freelancer_profile: Optional["FreelancerProfile"] = Relationship(
        back_populates="user",
        cascade_delete=True,
        sa_relationship_kwargs={"uselist": False},
    )
    client_profile: Optional["ClientProfile"] = Relationship(
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
    recent_searches: list["RecentSearch"] = Relationship(
        back_populates="user",
        cascade_delete=True,
        sa_relationship_kwargs={"foreign_keys": "[RecentSearch.user_id]"},
    )
    sent_connections: list["Connection"] = Relationship(
        back_populates="sender",
        cascade_delete=True,
        sa_relationship_kwargs={"foreign_keys": "[Connection.sender_id]"},
    )
    received_connections: list["Connection"] = Relationship(
        back_populates="receiver",
        cascade_delete=True,
        sa_relationship_kwargs={"foreign_keys": "[Connection.receiver_id]"},
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
# Experience Models
# ==============================================================================


class ExperienceBase(SQLModel):
    title: str = Field(max_length=255)
    organization: str | None = Field(default=None, max_length=255)
    detail: str | None = Field(default=None, max_length=5000)
    url: str | None = Field(default=None, max_length=2048)


class ExperienceCreate(ExperienceBase):
    pass


class ExperienceUpdate(SQLModel):
    title: str | None = Field(default=None, max_length=255)
    organization: str | None = Field(default=None, max_length=255)
    detail: str | None = Field(default=None, max_length=5000)
    url: str | None = Field(default=None, max_length=2048)


class Experience(ExperienceBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    freelancer_profile_id: uuid.UUID = Field(
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

    freelancer_profile: Optional["FreelancerProfile"] = Relationship(
        back_populates="experiences"
    )


class ExperiencePublic(ExperienceBase):
    id: uuid.UUID
    freelancer_profile_id: uuid.UUID
    created_at: datetime | None = None
    updated_at: datetime | None = None


# ==============================================================================
# Education Models
# ==============================================================================


class EducationBase(SQLModel):
    institution: str | None = Field(default=None, max_length=255)
    degree: str | None = Field(default=None, max_length=255)
    field_of_study: str | None = Field(default=None, max_length=255)
    start_date: str | None = Field(default=None, max_length=50)
    end_date: str | None = Field(default=None, max_length=50)
    description: str | None = Field(default=None, max_length=2000)
    title: str | None = Field(default=None, max_length=255)
    organization: str | None = Field(default=None, max_length=255)
    detail: str | None = Field(default=None, max_length=5000)
    url: str | None = Field(default=None, max_length=2048)

    @model_validator(mode="after")
    def _sync_education_fields(self) -> Self:
        if self.title and not self.degree:
            self.degree = self.title
        elif self.degree and not self.title:
            self.title = self.degree

        if self.organization and not self.institution:
            self.institution = self.organization
        elif self.institution and not self.organization:
            self.organization = self.institution

        if self.detail and not self.description:
            self.description = self.detail
        elif self.description and not self.detail:
            self.detail = self.description
        return self


class EducationCreate(EducationBase):
    pass


class EducationUpdate(SQLModel):
    institution: str | None = Field(default=None, max_length=255)
    degree: str | None = Field(default=None, max_length=255)
    field_of_study: str | None = Field(default=None, max_length=255)
    start_date: str | None = Field(default=None, max_length=50)
    end_date: str | None = Field(default=None, max_length=50)
    description: str | None = Field(default=None, max_length=2000)
    title: str | None = Field(default=None, max_length=255)
    organization: str | None = Field(default=None, max_length=255)
    detail: str | None = Field(default=None, max_length=5000)
    url: str | None = Field(default=None, max_length=2048)


class Education(EducationBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    freelancer_profile_id: uuid.UUID = Field(
        foreign_key="freelancerprofile.id", nullable=False, ondelete="CASCADE"
    )
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )

    freelancer_profile: Optional["FreelancerProfile"] = Relationship(
        back_populates="educations"
    )


class EducationPublic(EducationBase):
    id: uuid.UUID
    freelancer_profile_id: uuid.UUID
    created_at: datetime | None = None


# ==============================================================================
# Portfolio Item Models
# ==============================================================================


class PortfolioItemBase(SQLModel):
    title: str = Field(max_length=255)
    description: str | None = Field(default=None, max_length=5000)
    image_url: str | None = Field(default=None, max_length=2048)
    organization: str | None = Field(default=None, max_length=255)
    detail: str | None = Field(default=None, max_length=5000)
    url: str | None = Field(default=None, max_length=2048)

    @model_validator(mode="after")
    def _sync_portfolio_fields(self) -> Self:
        if self.detail and not self.description:
            self.description = self.detail
        elif self.description and not self.detail:
            self.detail = self.description
        return self


class PortfolioItemCreate(PortfolioItemBase):
    pass


class PortfolioItemUpdate(SQLModel):
    title: str | None = Field(default=None, max_length=255)
    description: str | None = Field(default=None, max_length=5000)
    image_url: str | None = Field(default=None, max_length=2048)
    organization: str | None = Field(default=None, max_length=255)
    detail: str | None = Field(default=None, max_length=5000)
    url: str | None = Field(default=None, max_length=2048)


class PortfolioItem(PortfolioItemBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    freelancer_profile_id: uuid.UUID = Field(
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

    freelancer_profile: Optional["FreelancerProfile"] = Relationship(
        back_populates="portfolio_items"
    )


class PortfolioItemPublic(PortfolioItemBase):
    id: uuid.UUID
    freelancer_profile_id: uuid.UUID
    created_at: datetime | None = None
    updated_at: datetime | None = None


# ==============================================================================
# Freelancer Profile Models
# ==============================================================================


class FreelancerProfileBase(SQLModel):
    title: str | None = Field(default=None, max_length=255)
    bio: str | None = Field(default=None, max_length=5000)
    hourly_rate: float | None = Field(default=None, ge=0)
    years_of_experience: int | None = Field(default=None, ge=0)
    is_available: bool = True
    availability: str | None = Field(default="Available now", max_length=100)
    hours: str | None = Field(default=None, max_length=100)
    category: str | None = Field(default=None, max_length=100, index=True)
    finished: bool = Field(default=False)
    location: str | None = Field(default=None, max_length=255)
    timezone: str | None = Field(default=None, max_length=100)
    languages: str | None = Field(default=None, max_length=500)


class FreelancerProfileCreate(FreelancerProfileBase):
    skills: list[str] = Field(default_factory=list)


class FreelancerProfileUpdate(SQLModel):
    title: str | None = Field(default=None, max_length=255)
    bio: str | None = Field(default=None, max_length=5000)
    hourly_rate: float | None = Field(default=None, ge=0)
    years_of_experience: int | None = Field(default=None, ge=0)
    is_available: bool | None = None
    availability: str | None = Field(default=None, max_length=100)
    hours: str | None = Field(default=None, max_length=100)
    category: str | None = Field(default=None, max_length=100)
    finished: bool | None = None
    location: str | None = Field(default=None, max_length=255)
    timezone: str | None = Field(default=None, max_length=100)
    languages: str | None = Field(default=None, max_length=500)
    skills: list[str] | None = None
    full_name: str | None = Field(default=None, max_length=255)
    experiences: list[ExperienceCreate] | None = None
    educations: list[EducationCreate] | None = None
    portfolio: list[PortfolioItemCreate] | None = None


class FreelancerAvailabilityUpdate(SQLModel):
    is_available: bool = Field(description="Availability toggle status")

    @model_validator(mode="before")
    @classmethod
    def handle_alias(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "is_available" not in data and "available" in data:
                data = dict(data)
                data["is_available"] = data["available"]
        return data


class FreelancerProfile(FreelancerProfileBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    resume_url: str | None = Field(default=None, max_length=2048)
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
    portfolio_items: list[PortfolioItem] = Relationship(
        back_populates="freelancer_profile",
        cascade_delete=True,
    )
    educations: list[Education] = Relationship(
        back_populates="freelancer_profile",
        cascade_delete=True,
    )
    experiences: list[Experience] = Relationship(
        back_populates="freelancer_profile",
        cascade_delete=True,
    )
    skills: list[str] = Field(
        default_factory=list,
        sa_type=JSON,  # type: ignore
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
    skills: list[str] = Field(default_factory=list)
    skill_names: list[str] = Field(default_factory=list)
    average_rating: float | None = None
    reviews_count: int = 0
    is_saved: bool = False


class FreelancerProfileDetailPublic(FreelancerProfilePublic):
    portfolio_media: list[MediaPublic] = Field(default_factory=list)
    portfolio: list[PortfolioItemPublic] = Field(default_factory=list)
    educations: list[EducationPublic] = Field(default_factory=list)
    experiences: list[ExperiencePublic] = Field(default_factory=list)
    reviews: list["ReviewPublic"] = Field(default_factory=list)
    user: UserPublic | None = None


class FreelancerProfilesPublic(SQLModel):
    data: list[FreelancerProfilePublic]
    count: int


class FreelancerAvailabilityPublic(SQLModel):
    is_available: bool
    availability: str | None = None


# ==============================================================================
# Client Profile Models
# ==============================================================================


class ClientProfileBase(SQLModel):
    company: str | None = Field(default=None, max_length=255)
    company_role: str | None = Field(
        default=None,
        max_length=255,
        description="Position or title at company, e.g. Product Lead, Founder",
    )
    company_website: str | None = Field(default=None, max_length=2048)
    company_size: str | None = Field(
        default=None,
        max_length=50,
        description="Company size: solo, 2-10, 11-50, 51-200, 201-plus",
    )
    location: str | None = Field(default=None, max_length=255)
    description: str | None = Field(
        default=None,
        max_length=5000,
        description="Summary or about the company / client",
    )


class ClientProfileCreate(ClientProfileBase):
    pass


class ClientProfileUpdate(SQLModel):
    company: str | None = Field(default=None, max_length=255)
    company_role: str | None = Field(default=None, max_length=255)
    company_website: str | None = Field(default=None, max_length=2048)
    company_size: str | None = Field(default=None, max_length=50)
    location: str | None = Field(default=None, max_length=255)
    description: str | None = Field(default=None, max_length=5000)
    full_name: str | None = Field(
        default=None,
        max_length=255,
        description="Optional update to user's full name in the same request",
    )


class ClientProfile(ClientProfileBase, table=True):
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

    user: Optional[User] = Relationship(back_populates="client_profile")


class ClientProfilePublic(ClientProfileBase):
    id: uuid.UUID
    user_id: uuid.UUID
    full_name: str | None = None
    avatar_url: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None


class ClientProfileDetailPublic(ClientProfilePublic):
    user: Optional[UserPublic] = None
    job_posts_count: int = 0


class ClientProfilesPublic(SQLModel):
    data: list[ClientProfilePublic]
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
    # attachment: Media | None = Relationship()


class ChatMessagePublic(ChatMessageBase):
    id: uuid.UUID
    conversation_id: uuid.UUID
    sender_id: uuid.UUID
    attachment_id: uuid.UUID | None = None
    # attachment: MediaPublic | None = None
    is_read: bool
    created_at: datetime | None = None


class ChatMessagePost(ChatMessageBase):
    attachment_id: uuid.UUID | None = None


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
    other_user: UserPublic | None = None


class ConversationDetailPublic(ConversationPublic):
    messages: list[ChatMessagePublic] = []


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
    category: str | None = Field(default=None, max_length=100, index=True)
    status: JobStatus = Field(default=JobStatus.OPEN)


class JobPostCreate(JobPostBase):
    skills: list[str] = Field(default_factory=list)


class JobPostUpdate(SQLModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = Field(default=None, min_length=1, max_length=5000)
    budget_type: BudgetType | None = None
    budget: float | None = Field(default=None, ge=0)
    location: str | None = Field(default=None, max_length=255)
    category: str | None = Field(default=None, max_length=100)
    status: JobStatus | None = None
    skills: list[str] | None = None


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
    skills: list[str] = Field(
        default_factory=list,
        sa_type=JSON,  # type: ignore
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
    client_company: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None
    skills: list[str] = Field(default_factory=list)
    proposals_count: int = 0
    is_saved: bool = False
    has_applied: bool = False
    has_draft: bool = False


class JobPostDetailPublic(JobPostPublic):
    client: UserPublic | None = None
    client_profile: Optional[ClientProfilePublic] = None


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
    status: ProposalStatus = ProposalStatus.PENDING


class ProposalUpdate(SQLModel):
    cover_letter: str | None = Field(default=None, max_length=3000)
    status: ProposalStatus | None = None


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
    job_post: Optional[JobPostPublic] = None


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


class UserPresence(BaseModel):
    user_id: uuid.UUID
    is_online: bool


class InjectPayload(BaseModel):
    user_id: uuid.UUID | None = None
    event_type: str = "notification"
    payload: Any


# ==============================================================================
# Recent Search Models
# ==============================================================================


class RecentSearchBase(SQLModel):
    query: str = Field(min_length=1, max_length=255)


class RecentSearchCreate(RecentSearchBase):
    pass


class RecentSearch(RecentSearchBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE", index=True
    )
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )

    user: Optional["User"] = Relationship(back_populates="recent_searches")


class RecentSearchPublic(SQLModel):
    id: uuid.UUID
    query: str
    created_at: datetime | None = None


class RecentSearchesPublic(SQLModel):
    data: list[str]
    count: int


# ==============================================================================
# Health Check & Diagnostic Models (DevOps Minor Module)
# ==============================================================================

class ComponentHealth(SQLModel):
    status: Literal["healthy", "degraded", "unhealthy"]
    latency_ms: float | None = None
    message: str


class SystemHealth(SQLModel):
    status: Literal["healthy", "degraded", "unhealthy"]
    timestamp: datetime
    services: dict[str, ComponentHealth]


# ==============================================================================
# Connection Models
# ==============================================================================


class ConnectionBase(SQLModel):
    note: str | None = Field(default=None, max_length=500)


class ConnectionCreate(ConnectionBase):
    receiver_id: uuid.UUID
    job_post_id: uuid.UUID | None = None


class Connection(ConnectionBase, table=True):
    __table_args__ = (
        UniqueConstraint(
            "sender_id", "receiver_id", name="uq_sender_receiver_connection"
        ),
    )

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    sender_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE", index=True
    )
    receiver_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE", index=True
    )
    job_post_id: uuid.UUID | None = Field(
        default=None,
        foreign_key="jobpost.id",
        nullable=True,
        ondelete="SET NULL",
        index=True,
    )
    status: ConnectionStatus = Field(
        default=ConnectionStatus.PENDING, index=True
    )
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    updated_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    responded_at: datetime | None = Field(
        default=None,
        sa_type=DateTime(timezone=True),  # type: ignore
    )

    sender: Optional["User"] = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[Connection.sender_id]"},
        back_populates="sent_connections",
    )
    receiver: Optional["User"] = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[Connection.receiver_id]"},
        back_populates="received_connections",
    )
    job_post: Optional["JobPost"] = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[Connection.job_post_id]"},
    )


class ConnectionPublic(ConnectionBase):
    id: uuid.UUID
    sender_id: uuid.UUID
    receiver_id: uuid.UUID
    job_post_id: uuid.UUID | None = None
    status: ConnectionStatus
    created_at: datetime | None = None
    updated_at: datetime | None = None
    responded_at: datetime | None = None
    sender: UserPublic | None = None
    receiver: UserPublic | None = None
    job_post: JobPostPublic | None = None

class ConnectionsPublic(SQLModel):
    data: list[ConnectionPublic]
    count: int

class ConnectionStatusPublic(SQLModel):
    status: Literal["none", "pending_sent", "pending_received", "connected"]
    connection_id: uuid.UUID | None = None

# ==============================================================================
# Notification Models
# ==============================================================================


class NotificationEvent(StrEnum):
    MESSAGE_RECEIVED = "message_received"
    PROPOSAL_RECEIVED = "proposal_received"
    PROPOSAL_ACCEPTED = "proposal_accepted"
    PROPOSAL_REJECTED = "proposal_rejected"
    CONNECTION_REQUEST = "connection_request"
    CONNECTION_ACCEPTED = "connection_accepted"
    CONNECTION_DECLINED = "connection_declined"
    REVIEW_RECEIVED = "review_received"
    JOB_CLOSED = "job_closed"


class NotificationBase(SQLModel):
    event: NotificationEvent = Field(index=True)
    content: str = Field(min_length=1, max_length=5000)
    title: str | None = Field(default=None, max_length=255)

class Notification(NotificationBase, table=True):
    __table_args__ = (
        CheckConstraint(
            "num_nonnulls(proposal_id, connection_id, review_id, "
            "job_post_id, chat_message_id) = 1",
            name="ck_notification_exactly_one_target",
        ),
    )

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE", index=True
    )

    proposal_id: uuid.UUID | None = Field(
        default=None, foreign_key="proposal.id", ondelete="CASCADE", index=True
    )
    connection_id: uuid.UUID | None = Field(
        default=None, foreign_key="connection.id", ondelete="CASCADE", index=True
    )
    review_id: uuid.UUID | None = Field(
        default=None, foreign_key="review.id", ondelete="CASCADE", index=True
    )
    chat_message_id: uuid.UUID | None = Field(
        default=None, foreign_key="chatmessage.id", ondelete="CASCADE", index=True
    )
    job_post_id: uuid.UUID | None = Field(
        default=None, foreign_key="jobpost.id", ondelete="CASCADE", index=True
    )

    is_read: bool = Field(default=False, index=True)
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )

    proposal: Optional["Proposal"] = Relationship()
    connection: Optional["Connection"] = Relationship()
    review: Optional["Review"] = Relationship()
    chat_message: Optional["ChatMessage"] = Relationship()
    job_post: Optional["JobPost"] = Relationship()


class NotificationPublic(NotificationBase):
    id: uuid.UUID
    is_read: bool
    created_at: datetime | None = None

    proposal: ProposalPublic | None = None
    connection: ConnectionPublic | None = None
    review: ReviewPublic | None = None
    chat_message: ChatMessagePublic | None = None
    job_post: JobPostPublic | None = None

class NotificationsPublic(SQLModel):
    data: list[NotificationPublic]
    count: int
    unread_count: int = 0