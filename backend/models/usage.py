from sqlalchemy import (
    Column,
    Integer,
    DateTime,
    ForeignKey,
)
from sqlalchemy.sql import func

from database.database import Base


class Usage(Base):
    __tablename__ = "usage"

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

    resume_analysis_count = Column(
        Integer,
        nullable=False,
        default=0,
    )

    interview_count = Column(
        Integer,
        nullable=False,
        default=0,
    )

    question_count = Column(
        Integer,
        nullable=False,
        default=0,
    )

    voice_interview_count = Column(
        Integer,
        nullable=False,
        default=0,
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