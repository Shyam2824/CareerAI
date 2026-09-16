from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class SkillGapResponse(BaseModel):
    id: int

    user_id: int

    target_role: str

    user_skills: Optional[str] = None

    required_skills: Optional[str] = None

    missing_skills: Optional[str] = None

    high_priority_skills: Optional[str] = None

    medium_priority_skills: Optional[str] = None

    low_priority_skills: Optional[str] = None

    readiness_score: float

    recommendations: Optional[str] = None

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )