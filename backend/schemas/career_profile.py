from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class CareerProfileCreate(BaseModel):
    current_role: Optional[str] = Field(default=None, max_length=150)
    target_role: Optional[str] = Field(default=None, max_length=150)

    years_of_experience: Optional[float] = Field(
        default=None,
        ge=0,
        le=50,
    )

    education: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    location: Optional[str] = Field(
        default=None,
        max_length=150,
    )

    preferred_location: Optional[str] = Field(
        default=None,
        max_length=150,
    )

    target_salary: Optional[float] = Field(
        default=None,
        ge=0,
    )

    technical_skills: Optional[str] = Field(
        default=None,
        max_length=5000,
    )

    soft_skills: Optional[str] = Field(
        default=None,
        max_length=3000,
    )

    career_goal: Optional[str] = Field(
        default=None,
        max_length=5000,
    )

    preferred_work_mode: Optional[str] = Field(
        default=None,
        max_length=50,
    )

    preferred_industry: Optional[str] = Field(
        default=None,
        max_length=150,
    )


class CareerProfileUpdate(CareerProfileCreate):
    pass


class CareerProfileResponse(CareerProfileCreate):
    id: int
    user_id: int
    profile_score: float

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)