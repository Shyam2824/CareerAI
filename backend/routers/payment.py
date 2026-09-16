from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.database import get_db
from models.user import User
from schemas.payment import (
    CreateOrderRequest,
    PaymentOrderResponse,
    PaymentResponse,
    PaymentVerifyRequest,
)
from services.payment_service import (
    create_payment_order,
    verify_payment,
)
from utils.dependencies import get_current_user
from config.razorpay import RAZORPAY_KEY_ID


router = APIRouter(
    prefix="/payments",
    tags=["Payments"],
)


@router.post(
    "/create-order",
    response_model=PaymentOrderResponse,
)
def create_order(
    request: CreateOrderRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    payment, razorpay_order = create_payment_order(
        db=db,
        user=current_user,
        plan_name=request.plan_name,
    )

    return PaymentOrderResponse(
        payment_id=payment.id,
        order_id=razorpay_order["id"],
        amount=payment.amount,
        amount_paise=razorpay_order["amount"],
        currency=razorpay_order["currency"],
        plan_name=request.plan_name,
        status=payment.status,
        razorpay_key_id=RAZORPAY_KEY_ID,
    )


@router.post(
    "/verify",
    response_model=PaymentResponse,
)
def verify(
    request: PaymentVerifyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return verify_payment(
        db=db,
        user=current_user,
        payment_id=request.payment_id,
        razorpay_order_id=request.razorpay_order_id,
        razorpay_payment_id=request.razorpay_payment_id,
        razorpay_signature=request.razorpay_signature,
    )


@router.get(
    "/history",
    response_model=list[PaymentResponse],
)
def payment_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from models.payment import Payment

    return (
        db.query(Payment)
        .filter(Payment.user_id == current_user.id)
        .order_by(Payment.created_at.desc())
        .all()
    )