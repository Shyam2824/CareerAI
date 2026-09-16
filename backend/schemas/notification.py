from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class NotificationCreate(BaseModel):
    user_id: int
    title: str
    message: str
    notification_type: str = "general"
    related_id: Optional[int] = None


class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    notification_type: str
    related_id: Optional[int] = None
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


class NotificationReadResponse(BaseModel):
    success: bool
    message: str
    notification_id: int


class NotificationSummary(BaseModel):
    total: int
    unread: int