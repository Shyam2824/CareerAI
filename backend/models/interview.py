from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func

from database.database import Base


class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    resume_id = Column(
        Integer,
        ForeignKey("resumes.id", ondelete="CASCADE"),
        nullable=True,
        index=True
    )

    job_title = Column(String(255), nullable=True)

    company_name = Column(String(255), nullable=True)

    interview_type = Column(
        String(50),
        nullable=False,
        default="technical"
    )

    difficulty = Column(
        String(50),
        nullable=False,
        default="medium"
    )

    total_questions = Column(
        Integer,
        nullable=False,
        default=0
    )

    completed_questions = Column(
        Integer,
        nullable=False,
        default=0
    )

    overall_score = Column(
        Integer,
        nullable=False,
        default=0
    )

    status = Column(
        String(50),
        nullable=False,
        default="created"
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )