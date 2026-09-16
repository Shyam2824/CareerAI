from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, ConfigDict


class InterviewQuestionCreate(BaseModel):
    question: str = Field(..., min_length=5)
    category: str = Field(..., min_length=2, max_length=100)
    topic: Optional[str] = Field(default=None, max_length=100)
    difficulty: str = Field(default="medium", max_length=50)
    question_type: str = Field(default="technical", max_length=50)
    answer: Optional[str] = None
    explanation: Optional[str] = None


class InterviewQuestionResponse(BaseModel):
    id: int
    question: str
    category: str
    topic: Optional[str] = None
    difficulty: str
    question_type: str
    answer: Optional[str] = None
    explanation: Optional[str] = None
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)