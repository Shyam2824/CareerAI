from sqlalchemy import Column, Integer, Text, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from database.database import Base


class InterviewSessionQuestion(Base):
    __tablename__ = "interview_session_questions"

    id = Column(Integer, primary_key=True, index=True)

    interview_id = Column(
        Integer,
        ForeignKey("interviews.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    question = Column(Text, nullable=False)

    category = Column(String(100), nullable=True)

    topic = Column(String(100), nullable=True)

    difficulty = Column(
        String(50),
        nullable=False,
        default="medium",
    )

    question_type = Column(
        String(50),
        nullable=False,
        default="technical",
    )

    expected_answer = Column(Text, nullable=True)

    candidate_answer = Column(Text, nullable=True)

    score = Column(Integer, nullable=True)

    feedback = Column(Text, nullable=True)

    question_order = Column(
        Integer,
        nullable=False,
        default=1,
    )

    status = Column(
        String(50),
        nullable=False,
        default="pending",
    )

    answer_duration_seconds = Column(
        Integer,
        default=0,
    )

    answer_source = Column(
        String(20),
        default="text",
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )