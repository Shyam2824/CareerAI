from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.database import get_db
from models.subscription import Subscription
from models.usage import Usage
from models.user import User

from schemas.subscription import (
    PlanResponse,
    SubscriptionResponse,
    UsageResponse,
)

from services.usage_service import (
    get_or_create_usage,
    get_or_create_subscription,
    is_premium,
    refresh_subscription_status,
)
from utils.dependencies import get_current_user


router = APIRouter(
    prefix="/subscriptions",
    tags=["Subscriptions"],
)


# =========================================================
# PLANS
# =========================================================

@router.get(
    "/plans",
    response_model=list[PlanResponse],
)
def get_plans():

    return [
        {
            "name": "free",
            "price": 0,
            "duration_days": 0,
            "features": [
                "3 Resume Analyses",
                "5 Voice Interviews",
                "500 Basic Questions",
            ],
        },
        {
            "name": "premium",
            "price": 499,
            "duration_days": 30,
            "features": [
                "Unlimited Resume Analysis",
                "ATS Score Improvement",
                "Expert Questions",
                "Unlimited AI Interviews",
                "Advanced Resume Optimization",
            ],
        },
    ]


# =========================================================
# MY SUBSCRIPTION
# =========================================================

@router.get(
    "/me",
    response_model=SubscriptionResponse,
)
def get_my_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    subscription = (
        db.query(Subscription)
        .filter(
            Subscription.user_id == current_user.id
        )
        .first()
    )

    if not subscription:
        subscription = Subscription(
            user_id=current_user.id,
            plan_name="free",
            price=0,
            status="active",
        )

        db.add(subscription)
        db.commit()
        db.refresh(subscription)

    return subscription


# =========================================================
# USAGE
# =========================================================

@router.get(
    "/usage",
    response_model=UsageResponse,
)
def get_my_usage(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    usage = (
        db.query(Usage)
        .filter(
            Usage.user_id == current_user.id
        )
        .first()
    )

    if not usage:

        usage = Usage(
            user_id=current_user.id,
        )

        db.add(usage)
        db.commit()
        db.refresh(usage)

    return usage


# =========================================================
# UPGRADE
# =========================================================

@router.post(
    "/upgrade",
    response_model=SubscriptionResponse,
)
def upgrade_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    subscription = (
        db.query(Subscription)
        .filter(
            Subscription.user_id == current_user.id
        )
        .first()
    )

    now = datetime.now(timezone.utc)

    if not subscription:

        subscription = Subscription(
            user_id=current_user.id,
            plan_name="premium",
            price=499,
            status="active",
            start_date=now,
            end_date=now + timedelta(days=30),
        )

        db.add(subscription)

    else:

        subscription.plan_name = "premium"
        subscription.price = 499
        subscription.status = "active"
        subscription.start_date = now
        subscription.end_date = (
            now + timedelta(days=30)
        )

    db.commit()
    db.refresh(subscription)

    return subscription

@router.get("/status")
def get_subscription_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    subscription = get_or_create_subscription(
        db,
        current_user.id,
    )

    usage = get_or_create_usage(
        db,
        current_user.id,
    )
    
    premium = is_premium(
        db,
        current_user.id,
    )

    return {
        "subscription": subscription,
        "usage": usage,
        "is_premium": is_premium(
            db,
            current_user.id,
        ),
    }
    
    
# =========================================================
# CANCEL
# =========================================================

@router.post(
    "/cancel",
    response_model=SubscriptionResponse,
)
def cancel_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    subscription = (
        db.query(Subscription)
        .filter(
            Subscription.user_id == current_user.id
        )
        .first()
    )

    if not subscription:
        raise HTTPException(
            status_code=404,
            detail="Subscription not found",
        )

    subscription.status = "cancelled"

    db.commit()
    db.refresh(subscription)

    return subscription