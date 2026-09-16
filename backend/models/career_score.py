from sqlalchemy import (
    Column,
    Integer,
    Float,
    String,
    Text,
    DateTime,
    ForeignKey,
)
from sqlalchemy.sql import func

from database.database import Base


class CareerScore(Base):
    __tablename__ = "career_scores"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )

    overall_score = Column(
        Float,
        nullable=False,
        default=0,
    )

    resume_score = Column(
        Float,
        nullable=False,
        default=0,
    )

    skills_score = Column(
        Float,
        nullable=False,
        default=0,
    )

    experience_score = Column(
        Float,
        nullable=False,
        default=0,
    )

    education_score = Column(
        Float,
        nullable=False,
        default=0,
    )

    skill_gap_score = Column(
        Float,
        nullable=False,
        default=0,
    )

    learning_progress_score = Column(
        Float,
        nullable=False,
        default=0,
    )

    status = Column(
        String(100),
        nullable=False,
        default="Developing",
    )

    recommendations = Column(
        Text,
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )