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


class SkillGapAnalysis(Base):
    __tablename__ = "skill_gap_analyses"

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

    target_role = Column(
        String(150),
        nullable=False,
    )

    user_skills = Column(
        Text,
        nullable=True,
    )

    required_skills = Column(
        Text,
        nullable=True,
    )

    missing_skills = Column(
        Text,
        nullable=True,
    )

    high_priority_skills = Column(
        Text,
        nullable=True,
    )

    medium_priority_skills = Column(
        Text,
        nullable=True,
    )

    low_priority_skills = Column(
        Text,
        nullable=True,
    )

    readiness_score = Column(
        Float,
        nullable=False,
        default=0,
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