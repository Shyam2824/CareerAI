import hashlib
import hmac
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException
from sqlalchemy.orm import Session

from config.razorpay import (
    PREMIUM_DURATION_DAYS,
    PREMIUM_PLAN,
    PREMIUM_PRICE,
    RAZORPAY_KEY_SECRET,
    razorpay_client,
)
from models.payment import Payment
from models.subscription import Subscription
from models.user import User


CURRENCY = "INR"


def create_payment_order(
    db: Session,
    user: User,
    plan_name: str = PREMIUM_PLAN,
):
    if plan_name != PREMIUM_PLAN:
        raise HTTPException(
            status_code=400,
            detail="Invalid subscription plan.",
        )

    amount_paise = int(PREMIUM_PRICE * 100)

    try:
        razorpay_order = razorpay_client.order.create(
            {
                "amount": amount_paise,
                "currency": CURRENCY,
                "receipt": f"careerai_user_{user.id}",
                "notes": {
                    "user_id": str(user.id),
                    "plan_name": plan_name,
                },
            }
        )
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Unable to create Razorpay order: {exc}",
        )

    payment = Payment(
        user_id=user.id,
        amount=PREMIUM_PRICE,
        currency=CURRENCY,
        payment_method="razorpay",
        transaction_id=razorpay_order["id"],
        status="pending",
    )

    db.add(payment)
    db.commit()
    db.refresh(payment)

    return payment, razorpay_order


def verify_payment(
    db: Session,
    user: User,
    payment_id: int,
    razorpay_order_id: str,
    razorpay_payment_id: str,
    razorpay_signature: str,
):
    payment = (
        db.query(Payment)
        .filter(
            Payment.id == payment_id,
            Payment.user_id == user.id,
        )
        .first()
    )

    if payment is None:
        raise HTTPException(
            status_code=404,
            detail="Payment not found.",
        )

    # Idempotency
    if payment.status == "paid":
        return payment

    # Make sure the order belongs to the payment created by our server.
    if payment.transaction_id != razorpay_order_id:
        raise HTTPException(
            status_code=400,
            detail="Invalid Razorpay order.",
        )

    message = f"{razorpay_order_id}|{razorpay_payment_id}"

    generated_signature = hmac.new(
        RAZORPAY_KEY_SECRET.encode("utf-8"),
        message.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(
        generated_signature,
        razorpay_signature,
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid payment signature.",
        )

    try:
        razorpay_payment = razorpay_client.payment.fetch(
            razorpay_payment_id
        )
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Unable to verify payment status: {exc}",
        )

    if razorpay_payment.get("order_id") != razorpay_order_id:
        raise HTTPException(
            status_code=400,
            detail="Payment does not belong to this order.",
        )

    if razorpay_payment.get("status") not in {
        "authorized",
        "captured",
    }:
        raise HTTPException(
            status_code=400,
            detail="Payment has not been successfully authorized.",
        )

    payment.status = "paid"
    payment.transaction_id = razorpay_payment_id

    now = datetime.now(timezone.utc)
    end_date = now + timedelta(days=PREMIUM_DURATION_DAYS)

    subscription = (
        db.query(Subscription)
        .filter(Subscription.user_id == user.id)
        .first()
    )

    if subscription is None:
        subscription = Subscription(
            user_id=user.id,
            plan_name=PREMIUM_PLAN,
            price=PREMIUM_PRICE,
            status="active",
            start_date=now,
            end_date=end_date,
        )

        db.add(subscription)

    else:
        subscription.plan_name = PREMIUM_PLAN
        subscription.price = PREMIUM_PRICE
        subscription.status = "active"
        subscription.start_date = now
        subscription.end_date = end_date

    db.commit()
    db.refresh(payment)

    return payment