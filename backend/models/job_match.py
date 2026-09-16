from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Text,
    DateTime,
    ForeignKey,
)

from sqlalchemy.sql import func

from database.database import Base


class JobMatch(Base):

    __tablename__ = "job_matches"

    # ==========================================
    # PRIMARY KEY
    # ==========================================

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # ==========================================
    # USER
    # ==========================================

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    # ==========================================
    # RESUME
    # ==========================================

    resume_id = Column(
        Integer,
        ForeignKey("resumes.id"),
        nullable=False,
    )

    # ==========================================
    # JOB INFORMATION
    # ==========================================

    job_title = Column(
        String,
        nullable=True,
    )

    company_name = Column(
        String,
        nullable=True,
    )

    job_description = Column(
        Text,
        nullable=False,
    )

    # ==========================================
    # OVERALL SCORE
    # ==========================================

    match_score = Column(
        Float,
        default=0,
    )

    # ==========================================
    # DETAILED SCORES
    # ==========================================

    skills_score = Column(
        Float,
        default=0,
    )

    keyword_score = Column(
        Float,
        default=0,
    )

    experience_score = Column(
        Float,
        default=0,
    )

    # ==========================================
    # SKILLS ANALYSIS
    # ==========================================

    matched_skills = Column(
        Text,
        nullable=True,
    )

    missing_skills = Column(
        Text,
        nullable=True,
    )

    # ==========================================
    # KEYWORD ANALYSIS
    # ==========================================

    matched_keywords = Column(
        Text,
        nullable=True,
    )

    missing_keywords = Column(
        Text,
        nullable=True,
    )

    # ==========================================
    # RECOMMENDATIONS
    # ==========================================

    suggestions = Column(
        Text,
        nullable=True,
    )

    # ==========================================
    # CREATED TIME
    # ==========================================

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )