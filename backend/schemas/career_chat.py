from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CareerChatRequest(BaseModel):
    message: str


class CareerChatResponse(BaseModel):
    id: int
    user_id: int
    role: str
    message: str
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )