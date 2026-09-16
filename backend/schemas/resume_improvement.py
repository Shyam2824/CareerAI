from datetime import datetime
from pydantic import BaseModel


class ResumeImprovementResponse(BaseModel):
    id: int
    resume_id: int
    overall_score: float

    current_scores: dict

    summary: dict

    improvements: list

    keyword_suggestions: list

    formatting_recommendations: list

    ats_recommendations: list

    total_improvements: int

    created_at: datetime | None = None

    class Config:
        from_attributes = True