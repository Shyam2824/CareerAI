from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class CareerReportResponse(BaseModel):
    id: int
    user_id: int

    target_role: Optional[str] = None

    overall_score: float

    executive_summary: Optional[str] = None

    career_profile: Optional[str] = None
    resume_analysis: Optional[str] = None
    skills_analysis: Optional[str] = None
    skill_gap_analysis: Optional[str] = None
    career_path: Optional[str] = None
    learning_roadmap: Optional[str] = None
    job_readiness: Optional[str] = None

    strengths: Optional[str] = None
    areas_to_improve: Optional[str] = None

    short_term_goals: Optional[str] = None
    long_term_goals: Optional[str] = None

    recommendations: Optional[str] = None

    report_data: Optional[str] = None

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)