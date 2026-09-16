from typing import Optional

from pydantic import BaseModel, ConfigDict


class MentorAdminResponse(BaseModel):
    id: int
    user_id: int
    title: Optional[str] = None
    company: Optional[str] = None
    experience: Optional[str] = None
    education: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[str] = None
    linkedin: Optional[str] = None
    price: float
    is_approved: bool
    is_active: bool
    rating: float
    total_reviews: int

    model_config = ConfigDict(from_attributes=True)


class MentorStatusUpdate(BaseModel):
    is_approved: Optional[bool] = None
    is_active: Optional[bool] = None