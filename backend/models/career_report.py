from sqlalchemy import Column, Integer, Float, String, Text, ForeignKey, DateTime
from sqlalchemy.sql import func

from database.database import Base


class CareerReport(Base):
    __tablename__ = "career_reports"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )

    target_role = Column(String(150), nullable=True)

    overall_score = Column(Float, nullable=False, default=0)

    executive_summary = Column(Text, nullable=True)

    career_profile = Column(Text, nullable=True)
    resume_analysis = Column(Text, nullable=True)
    skills_analysis = Column(Text, nullable=True)
    skill_gap_analysis = Column(Text, nullable=True)
    career_path = Column(Text, nullable=True)
    learning_roadmap = Column(Text, nullable=True)
    job_readiness = Column(Text, nullable=True)

    strengths = Column(Text, nullable=True)
    areas_to_improve = Column(Text, nullable=True)

    short_term_goals = Column(Text, nullable=True)
    long_term_goals = Column(Text, nullable=True)

    recommendations = Column(Text, nullable=True)

    report_data = Column(Text, nullable=True)

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