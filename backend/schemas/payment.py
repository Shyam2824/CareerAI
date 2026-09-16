from datetime import datetime

from pydantic import BaseModel


class CreateOrderRequest(BaseModel):
    plan_name: str = "premium"


class PaymentOrderResponse(BaseModel):
    payment_id: int
    order_id: str
    amount: float
    amount_paise: int
    currency: str
    plan_name: str
    status: str
    razorpay_key_id: str


class PaymentVerifyRequest(BaseModel):
    payment_id: int
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class PaymentResponse(BaseModel):
    id: int
    amount: float
    currency: str
    payment_method: str | None = None
    transaction_id: str | None = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True