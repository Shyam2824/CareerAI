from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, ConfigDict


class InterviewCreate(BaseModel):
    resume_id: Optional[int] = None

    job_title: Optional[str] = Field(
        default=None,
        max_length=255
    )

    company_name: Optional[str] = Field(
        default=None,
        max_length=255
    )

    interview_type: str = Field(
        default="technical",
        max_length=50
    )

    difficulty: str = Field(
        default="medium",
        max_length=50
    )

    total_questions: int = Field(
        default=10,
        ge=1,
        le=50
    )


class InterviewResponse(BaseModel):
    id: int
    resume_id: Optional[int] = None
    job_title: Optional[str] = None
    company_name: Optional[str] = None
    interview_type: str
    difficulty: str
    total_questions: int
    completed_questions: int
    overall_score: int
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class InterviewQuestionResponse(BaseModel):
    id: int
    interview_id: int
    question: str
    category: Optional[str] = None
    topic: Optional[str] = None
    difficulty: str
    question_type: str
    expected_answer: Optional[str] = None
    candidate_answer: Optional[str] = None
    score: Optional[int] = None
    feedback: Optional[str] = None
    question_order: int
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class InterviewAnswerRequest(BaseModel):
    candidate_answer: str = Field(
        ...,
        min_length=1
    )

    answer_source: str = Field(
        default="text",
        max_length=20
    )

    answer_duration_seconds: int = Field(
        default=0,
        ge=0
    )