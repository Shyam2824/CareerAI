from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from sqlalchemy.sql import func

from database.database import Base


class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id = Column(Integer, primary_key=True, index=True)

    question = Column(Text, nullable=False)

    category = Column(
        String(100),
        nullable=False,
        index=True
    )

    topic = Column(
        String(100),
        nullable=True,
        index=True
    )

    difficulty = Column(
        String(50),
        nullable=False,
        default="medium"
    )

    question_type = Column(
        String(50),
        nullable=False,
        default="technical"
    )

    answer = Column(Text, nullable=True)

    explanation = Column(Text, nullable=True)

    is_active = Column(
        Boolean,
        nullable=False,
        default=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )