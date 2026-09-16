from sqlalchemy import Column, Integer, Float, Text, DateTime, ForeignKey
from sqlalchemy.sql import func

from database.database import Base


class ResumeImprovement(Base):
    __tablename__ = "resume_improvements"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    resume_id = Column(
        Integer,
        ForeignKey("resumes.id"),
        nullable=False,
    )

    overall_score = Column(Float, default=0)

    current_scores = Column(Text, nullable=True)

    summary = Column(Text, nullable=True)

    improvements = Column(Text, nullable=True)

    keyword_suggestions = Column(Text, nullable=True)

    formatting_recommendations = Column(Text, nullable=True)

    ats_recommendations = Column(Text, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )