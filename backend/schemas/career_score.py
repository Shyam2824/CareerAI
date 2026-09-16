from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CareerScoreResponse(BaseModel):
    id: int
    user_id: int

    overall_score: float

    resume_score: float
    skills_score: float
    experience_score: float
    education_score: float
    skill_gap_score: float
    learning_progress_score: float

    status: str

    recommendations: str | None = None

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )