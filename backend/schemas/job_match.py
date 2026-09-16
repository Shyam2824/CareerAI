from datetime import datetime

from pydantic import BaseModel, Field


# ==========================================
# JOB MATCH REQUEST
# ==========================================

class JobMatchRequest(BaseModel):

    resume_id: int

    job_title: str | None = None

    company_name: str | None = None

    job_description: str = Field(
        ...,
        min_length=50,
    )


# ==========================================
# SUGGESTION
# ==========================================

class JobMatchSuggestion(BaseModel):

    type: str

    priority: str

    suggestion: str


# ==========================================
# JOB MATCH RESPONSE
# ==========================================

class JobMatchResponse(BaseModel):

    id: int

    resume_id: int

    job_title: str | None = None

    company_name: str | None = None

    # ==========================================
    # OVERALL SCORE
    # ==========================================

    match_score: float

    # ==========================================
    # DETAILED SCORES
    # ==========================================

    skills_score: float

    keyword_score: float

    experience_score: float

    # ==========================================
    # SKILLS
    # ==========================================

    matched_skills: list[str]

    missing_skills: list[str]

    # ==========================================
    # KEYWORDS
    # ==========================================

    matched_keywords: list[str]

    missing_keywords: list[str]

    # ==========================================
    # RECOMMENDATIONS
    # ==========================================

    suggestions: list[JobMatchSuggestion]

    created_at: datetime | None = None


# ==========================================
# JOB MATCH HISTORY RESPONSE
# ==========================================

class JobMatchHistoryResponse(BaseModel):

    id: int

    resume_id: int

    job_title: str | None = None

    company_name: str | None = None

    match_score: float

    skills_score: float

    keyword_score: float

    experience_score: float

    created_at: datetime | None = None

    class Config:
        from_attributes = True