from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy.orm import Session

from models.subscription import Subscription
from models.usage import Usage


FREE_RESUME_LIMIT = 3
FREE_VOICE_LIMIT = 5
FREE_QUESTION_LIMIT = 500


def get_or_create_usage(db: Session, user_id: int) -> Usage:
    usage = (
        db.query(Usage)
        .filter(Usage.user_id == user_id)
        .first()
    )

    if usage:
        return usage

    usage = Usage(
        user_id=user_id,
        resume_analysis_count=0,
        interview_count=0,
        question_count=0,
        voice_interview_count=0,
    )

    db.add(usage)
    db.commit()
    db.refresh(usage)

    return usage


def get_or_create_subscription(
    db: Session,
    user_id: int,
) -> Subscription:

    subscription = (
        db.query(Subscription)
        .filter(Subscription.user_id == user_id)
        .first()
    )

    if subscription:
        return subscription

    subscription = Subscription(
        user_id=user_id,
        plan_name="free",
        price=0,
        status="active",
    )

    db.add(subscription)
    db.commit()
    db.refresh(subscription)

    return subscription


def refresh_subscription_status(
    db: Session,
    subscription: Subscription,
) -> Subscription:

    if (
        subscription.plan_name == "premium"
        and subscription.end_date is not None
    ):
        now = datetime.now(timezone.utc)

        end_date = subscription.end_date

        if end_date.tzinfo is None:
            end_date = end_date.replace(
                tzinfo=timezone.utc
            )

        if end_date <= now:
            subscription.plan_name = "free"
            subscription.price = 0
            subscription.status = "expired"

            db.commit()
            db.refresh(subscription)

    return subscription


def is_premium(
    db: Session,
    user_id: int,
) -> bool:

    subscription = get_or_create_subscription(
        db,
        user_id,
    )

    subscription = refresh_subscription_status(
        db,
        subscription,
    )

    return (
        subscription.plan_name == "premium"
        and subscription.status == "active"
    )


def require_resume_analysis_access(
    db: Session,
    user_id: int,
):

    usage = get_or_create_usage(
        db,
        user_id,
    )

    if is_premium(db, user_id):
        usage.resume_analysis_count += 1

        db.commit()

        return usage

    if usage.resume_analysis_count >= FREE_RESUME_LIMIT:
        raise HTTPException(
            status_code=403,
            detail={
                "code": "FREE_LIMIT_REACHED",
                "message": (
                    "You have reached the free resume "
                    "analysis limit. Upgrade to Premium "
                    "for unlimited analysis."
                ),
            },
        )

    usage.resume_analysis_count += 1

    db.commit()

    return usage


def require_voice_access(
    db: Session,
    user_id: int,
):

    usage = get_or_create_usage(
        db,
        user_id,
    )

    if is_premium(db, user_id):
        usage.voice_interview_count += 1
        db.commit()
        return usage

    if usage.voice_interview_count >= FREE_VOICE_LIMIT:
        raise HTTPException(
            status_code=403,
            detail={
                "code": "FREE_LIMIT_REACHED",
                "message": (
                    "You have used all 5 free voice "
                    "interviews. Upgrade to Premium "
                    "for unlimited voice interviews."
                ),
            },
        )

    usage.voice_interview_count += 1

    db.commit()

    return usage


def require_question_access(
    db: Session,
    user_id: int,
):

    usage = get_or_create_usage(
        db,
        user_id,
    )

    if is_premium(db, user_id):
        usage.question_count += 1
        db.commit()
        return usage

    if usage.question_count >= FREE_QUESTION_LIMIT:
        raise HTTPException(
            status_code=403,
            detail={
                "code": "FREE_LIMIT_REACHED",
                "message": (
                    "You have reached the free question "
                    "limit. Upgrade to Premium."
                ),
            },
        )

    usage.question_count += 1

    db.commit()

    return usage