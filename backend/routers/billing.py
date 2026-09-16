from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.database import get_db
from models.payment import Payment
from models.subscription import Subscription
from models.user import User
from schemas.billing import BillingResponse
from services.usage_service import (
    get_or_create_subscription,
    is_premium,
    refresh_subscription_status,
)
from utils.dependencies import get_current_user


router = APIRouter(
    prefix="/billing",
    tags=["Billing"],
)


@router.get("/me", response_model=BillingResponse)
def get_billing(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    subscription = get_or_create_subscription(
        db,
        current_user.id,
    )
    
    subscription = refresh_subscription_status(
        db,
        subscription,
    )

    payments = (
        db.query(Payment)
        .filter(Payment.user_id == current_user.id)
        .order_by(Payment.created_at.desc())
        .all()
    )

    premium = is_premium(db, current_user.id)

    days_remaining = 0

    if subscription.end_date:
        now = datetime.now(timezone.utc)

        end_date = subscription.end_date

        if end_date.tzinfo is None:
            end_date = end_date.replace(tzinfo=timezone.utc)

        remaining = end_date - now

        if remaining.total_seconds() > 0:
            days_remaining = remaining.days

    return BillingResponse(
        subscription=subscription,
        payments=payments,
        is_premium=premium,
        days_remaining=days_remaining,
    )


@router.post("/cancel")
def cancel_subscription(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    subscription = (
        db.query(Subscription)
        .filter(Subscription.user_id == current_user.id)
        .first()
    )

    if not subscription:
        return {
            "message": "No active subscription found."
        }

    if subscription.plan_name == "free":
        return {
            "message": "You are already on the Free plan."
        }

    subscription.status = "cancelled"

    db.commit()

    return {
        "message": "Subscription cancelled successfully.",
        "status": subscription.status,
    }