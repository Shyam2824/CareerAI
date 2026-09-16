from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class MentorReviewCreate(BaseModel):
    booking_id: int = Field(
        ...,
        gt=0,
    )

    rating: int = Field(
        ...,
        ge=1,
        le=5,
    )

    review: Optional[str] = Field(
        default=None,
        min_length=3,
        max_length=2000,
    )


class MentorReviewResponse(BaseModel):
    id: int
    user_id: int
    mentor_id: int
    booking_id: int
    rating: int
    review: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


class MentorRatingResponse(BaseModel):
    average_rating: float
    total_reviews: int