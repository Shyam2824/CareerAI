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


class CareerPathRecommendation(Base):
    __tablename__ = "career_path_recommendations"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id = Column(
        Integer,
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    current_role = Column(
        String(150),
        nullable=True,
    )

    target_role = Column(
        String(150),
        nullable=False,
    )

    current_experience = Column(
        Float,
        nullable=True,
    )

    readiness_score = Column(
        Float,
        nullable=False,
        default=0,
    )

    recommended_path = Column(
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

    milestones = Column(
        Text,
        nullable=True,
    )

    estimated_months = Column(
        Integer,
        nullable=False,
        default=6,
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