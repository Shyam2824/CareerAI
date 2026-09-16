from typing import List, Optional

from pydantic import BaseModel


class ResumeIntelligenceResponse(BaseModel):
    resume_id: int

    detected_skills: List[str]

    current_role: Optional[str] = None
    years_of_experience: Optional[float] = None

    education: Optional[str] = None

    experience_score: float = 0
    education_score: float = 0
    skills_score: float = 0

    profile_updated: bool = False

    message: str