from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func

from database.database import Base


class ResumeBuilder(Base):
    __tablename__ = "resume_builders"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    title = Column(
        String(255),
        nullable=False,
        default="My Resume"
    )

    personal_info = Column(Text, nullable=True)

    summary = Column(Text, nullable=True)

    skills = Column(Text, nullable=True)

    experience = Column(Text, nullable=True)

    education = Column(Text, nullable=True)

    projects = Column(Text, nullable=True)

    certifications = Column(Text, nullable=True)

    achievements = Column(Text, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )