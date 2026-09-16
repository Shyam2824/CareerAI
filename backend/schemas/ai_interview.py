from typing import Optional
from pydantic import BaseModel, Field


class AIQuestionRequest(BaseModel):
    context: Optional[str] = None


class AIFollowUpRequest(BaseModel):
    candidate_answer: str = Field(..., min_length=1)


class AIEvaluateRequest(BaseModel):
    question: str = Field(..., min_length=1)
    candidate_answer: str = Field(..., min_length=1)
    expected_answer: Optional[str] = None


class AIQuestionResponse(BaseModel):
    question: str
    category: str
    topic: str
    difficulty: str
    question_type: str


class AIEvaluationResponse(BaseModel):
    score: int
    feedback: str
    strengths: list[str]
    improvements: list[str]
    follow_up_question: Optional[str] = None