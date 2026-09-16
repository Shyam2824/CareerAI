from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class LearningRoadmapResponse(BaseModel):

    id: int

    user_id: int

    target_role: str

    current_role: Optional[str] = None

    readiness_score: float

    estimated_months: int

    roadmap: Optional[str] = None

    current_phase: int

    completed_topics: Optional[str] = None

    overall_progress: float

    recommendations: Optional[str] = None

    created_at: datetime

    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


class LearningProgressUpdate(BaseModel):

    completed_topics: list[str]

    current_phase: Optional[int] = None