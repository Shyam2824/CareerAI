from datetime import datetime
from pydantic import BaseModel


class BillingPaymentResponse(BaseModel):
    id: int
    amount: float
    currency: str
    payment_method: str | None = None
    transaction_id: str | None = None
    razorpay_order_id: str | None = None
    razorpay_payment_id: str | None = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class BillingSubscriptionResponse(BaseModel):
    id: int
    plan_name: str
    price: float
    status: str
    start_date: datetime
    end_date: datetime | None = None

    class Config:
        from_attributes = True


class BillingResponse(BaseModel):
    subscription: BillingSubscriptionResponse
    payments: list[BillingPaymentResponse]
    is_premium: bool
    days_remaining: int