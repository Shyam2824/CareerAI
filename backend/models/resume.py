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


class Resume(Base):

    __tablename__ = "resumes"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    # ==========================================
    # FILE INFORMATION
    # ==========================================

    file_name = Column(
        String,
        nullable=False,
    )

    file_url = Column(
        String,
        nullable=True,
    )

    extracted_text = Column(
        Text,
        nullable=True,
    )

    # ==========================================
    # BASIC ANALYSIS
    # ==========================================

    detected_skills = Column(
        Text,
        nullable=True,
    )

    detected_sections = Column(
        Text,
        nullable=True,
    )

    strengths = Column(
        Text,
        nullable=True,
    )

    improvements = Column(
        Text,
        nullable=True,
    )

    # ==========================================
    # ADVANCED ATS ANALYSIS
    # ==========================================

    contact_info = Column(
        Text,
        nullable=True,
    )

    action_verbs = Column(
        Text,
        nullable=True,
    )

    achievements = Column(
        Text,
        nullable=True,
    )

    weak_phrases = Column(
        Text,
        nullable=True,
    )

    resume_length = Column(
        Text,
        nullable=True,
    )

    # ==========================================
    # SCORES
    # ==========================================

    ats_score = Column(
        Float,
        default=0,
    )

    skills_score = Column(
        Float,
        default=0,
    )

    experience_score = Column(
        Float,
        default=0,
    )

    education_score = Column(
        Float,
        default=0,
    )

    # ==========================================
    # FEEDBACK
    # ==========================================

    feedback = Column(
        Text,
        nullable=True,
    )

    # ==========================================
    # TIMESTAMP
    # ==========================================

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )