from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class BookingCreate(BaseModel):
    mentor_id: int
    availability_id: int
    notes: Optional[str] = None


class BookingResponse(BaseModel):
    id: int
    user_id: int
    mentor_id: int
    availability_id: int
    booking_date: datetime
    duration_minutes: int
    amount: float
    status: str
    payment_status: str
    notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BookingCancelResponse(BaseModel):
    success: bool
    message: str
    booking_id: int
    status: str