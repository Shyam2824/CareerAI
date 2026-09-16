from datetime import datetime
from pydantic import BaseModel


class ResumeResponse(BaseModel):

    id: int

    file_name: str
    file_url: str | None = None

    # ==========================================
    # SCORES
    # ==========================================

    ats_score: float
    skills_score: float
    experience_score: float
    education_score: float

    # ==========================================
    # BASIC ANALYSIS
    # ==========================================

    detected_skills: str | None = None
    detected_sections: str | None = None

    strengths: str | None = None
    improvements: str | None = None

    # ==========================================
    # ADVANCED ANALYSIS
    # ==========================================

    contact_info: str | None = None
    action_verbs: str | None = None
    achievements: str | None = None
    weak_phrases: str | None = None
    resume_length: str | None = None

    # ==========================================
    # FEEDBACK
    # ==========================================

    feedback: str | None = None

    created_at: datetime | None = None

    class Config:
        from_attributes = True


# ==========================================
# DASHBOARD STATISTICS
# ==========================================

class ResumeDashboardStats(BaseModel):

    total_resumes: int
    latest_ats_score: float
    best_ats_score: float
    average_ats_score: float


# ==========================================
# CAREER INSIGHTS
# ==========================================

class CareerInsight(BaseModel):

    title: str
    description: str
    priority: str


class CareerInsightsResponse(BaseModel):

    overall_message: str
    insights: list[CareerInsight]