from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, HttpUrl


class MentorCreate(BaseModel):
    title: str = Field(
        ...,
        min_length=2,
        max_length=150,
    )

    company: str = Field(
        ...,
        min_length=2,
        max_length=150,
    )

    experience: str = Field(
        ...,
        min_length=1,
        max_length=100,
    )

    education: str = Field(
        ...,
        min_length=1,
        max_length=255,
    )

    bio: str = Field(
        ...,
        min_length=20,
        max_length=3000,
    )

    skills: str = Field(
        ...,
        min_length=2,
        max_length=1000,
    )

    linkedin: Optional[HttpUrl] = None

    price: float = Field(
        default=0,
        ge=0,
        le=100000,
    )


class MentorUpdate(BaseModel):
    title: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=150,
    )

    company: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=150,
    )

    experience: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=100,
    )

    education: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=255,
    )

    bio: Optional[str] = Field(
        default=None,
        min_length=20,
        max_length=3000,
    )

    skills: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=1000,
    )

    linkedin: Optional[HttpUrl] = None

    price: Optional[float] = Field(
        default=None,
        ge=0,
        le=100000,
    )


class MentorResponse(BaseModel):
    id: int
    user_id: int

    title: Optional[str] = None
    company: Optional[str] = None
    experience: Optional[str] = None
    education: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[str] = None
    linkedin: Optional[str] = None

    price: float = 0

    photo_url: Optional[str] = None

    is_approved: bool = False
    is_active: bool = True

    rating: float = 0
    total_reviews: int = 0

    model_config = ConfigDict(
        from_attributes=True
    )