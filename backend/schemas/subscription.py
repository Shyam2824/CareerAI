from datetime import datetime
from pydantic import BaseModel


class PlanResponse(BaseModel):
    name: str
    price: float
    duration_days: int
    features: list[str]


class SubscriptionResponse(BaseModel):
    id: int
    user_id: int
    plan_name: str
    price: float
    status: str
    start_date: datetime
    end_date: datetime | None = None

    class Config:
        from_attributes = True


class UsageResponse(BaseModel):
    resume_analysis_count: int
    interview_count: int
    question_count: int
    voice_interview_count: int
    
class SubscriptionStatusResponse(BaseModel):
    subscription: SubscriptionResponse
    usage: UsageResponse
    is_premium: bool