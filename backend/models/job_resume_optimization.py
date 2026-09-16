from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Float,
    DateTime,
    ForeignKey,
)
from sqlalchemy.sql import func

from database.database import Base


class JobResumeOptimization(Base):

    __tablename__ = "job_resume_optimizations"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    resume_id = Column(
        Integer,
        ForeignKey("resumes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    job_title = Column(
        String(255),
        nullable=True,
    )

    company_name = Column(
        String(255),
        nullable=True,
    )

    job_description = Column(
        Text,
        nullable=False,
    )

    before_ats_score = Column(
        Float,
        default=0,
    )

    after_ats_score = Column(
        Float,
        default=0,
    )

    matched_skills = Column(
        Text,
        nullable=True,
    )

    missing_skills = Column(
        Text,
        nullable=True,
    )

    keyword_changes = Column(
        Text,
        nullable=True,
    )

    optimization_changes = Column(
        Text,
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )