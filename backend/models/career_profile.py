from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.sql import func

from database.database import Base


class CareerProfile(Base):
    __tablename__ = "career_profiles"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )

    current_role = Column(String(150), nullable=True)
    target_role = Column(String(150), nullable=True)

    years_of_experience = Column(Float, nullable=True)

    education = Column(String(255), nullable=True)

    location = Column(String(150), nullable=True)
    preferred_location = Column(String(150), nullable=True)

    target_salary = Column(Float, nullable=True)

    technical_skills = Column(Text, nullable=True)
    soft_skills = Column(Text, nullable=True)

    career_goal = Column(Text, nullable=True)

    preferred_work_mode = Column(
        String(50),
        nullable=True,
    )

    preferred_industry = Column(
        String(150),
        nullable=True,
    )

    profile_score = Column(
        Float,
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