from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


# ============================================================
# ANALYZE REQUEST
# ============================================================

class JobResumeAnalyzeRequest(BaseModel):
    resume_id: int
    job_title: str | None = None
    company_name: str | None = None
    job_description: str = Field(..., min_length=20)


# ============================================================
# OPTIMIZATION REQUEST
# ============================================================

class JobResumeOptimizeRequest(BaseModel):
    resume_id: int
    job_title: str | None = None
    company_name: str | None = None
    job_description: str = Field(..., min_length=20)


# ============================================================
# ATS SCORE
# ============================================================

class JobATSScoreRequest(BaseModel):
    resume_id: int
    job_description: str = Field(..., min_length=20)


class JobATSScoreResponse(BaseModel):
    ats_score: float
    skills_score: float
    keywords_score: float
    experience_score: float
    title_score: float
    education_score: float
    sections_score: float
    formatting_score: float
    strengths: list[str] = Field(default_factory=list)
    improvements: list[str] = Field(default_factory=list)


# ============================================================
# CHANGE ITEM
# ============================================================

class OptimizationChange(BaseModel):
    section: str
    original: str
    optimized: str
    reason: str
    impact: str
    status: str = "pending"


# ============================================================
# OPTIMIZATION RESPONSE
# ============================================================

class JobResumeOptimizeResponse(BaseModel):
    before_ats_score: float
    after_ats_score: float

    summary: dict[str, Any] = Field(default_factory=dict)

    experience_improvements: list[OptimizationChange] = Field(
        default_factory=list
    )

    skill_recommendations: list[str] = Field(
        default_factory=list
    )

    keyword_recommendations: list[str] = Field(
        default_factory=list
    )

    project_improvements: list[OptimizationChange] = Field(
        default_factory=list
    )

    recommendations: list[str] = Field(
        default_factory=list
    )


# ============================================================
# HISTORY RESPONSE
# ============================================================

class JobResumeOptimizationHistoryResponse(BaseModel):
    id: int
    resume_id: int

    job_title: str | None = None
    company_name: str | None = None

    before_ats_score: float
    after_ats_score: float

    matched_skills: list[str] = Field(default_factory=list)
    missing_skills: list[str] = Field(default_factory=list)

    keyword_changes: list[str] = Field(default_factory=list)

    optimization_changes: list[dict[str, Any]] = Field(
        default_factory=list
    )

    created_at: datetime | None = None

    class Config:
        from_attributes = True