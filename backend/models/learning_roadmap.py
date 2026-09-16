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


class LearningRoadmap(Base):
    __tablename__ = "learning_roadmaps"

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
        unique=True,
        index=True,
    )

    target_role = Column(
        String(150),
        nullable=False,
    )

    current_role = Column(
        String(150),
        nullable=True,
    )

    readiness_score = Column(
        Float,
        nullable=False,
        default=0,
    )

    estimated_months = Column(
        Integer,
        nullable=False,
        default=6,
    )

    roadmap = Column(
        Text,
        nullable=True,
    )

    current_phase = Column(
        Integer,
        nullable=False,
        default=1,
    )

    completed_topics = Column(
        Text,
        nullable=True,
    )

    overall_progress = Column(
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