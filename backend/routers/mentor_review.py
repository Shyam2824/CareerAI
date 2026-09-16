from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)
from sqlalchemy import func
from sqlalchemy.orm import Session

from database.database import get_db
from models.booking import Booking
from models.mentor import Mentor
from models.mentor_review import MentorReview
from models.user import User
from schemas.mentor_review import (
    MentorRatingResponse,
    MentorReviewCreate,
    MentorReviewResponse,
)
from utils.dependencies import get_current_user


router = APIRouter(
    prefix="/mentor-reviews",
    tags=["Mentor Reviews"],
)


# =========================================================
# CREATE REVIEW
# =========================================================

@router.post(
    "/",
    response_model=MentorReviewResponse,
    status_code=201,
)
def create_review(
    data: MentorReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = (
        db.query(Booking)
        .filter(
            Booking.id == data.booking_id
        )
        .first()
    )

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found.",
        )

    if booking.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail=(
                "You can only review "
                "your own booking."
            ),
        )

    mentor = (
        db.query(Mentor)
        .filter(
            Mentor.id == booking.mentor_id
        )
        .first()
    )

    if not mentor:
        raise HTTPException(
            status_code=404,
            detail="Mentor not found.",
        )

    existing = (
        db.query(MentorReview)
        .filter(
            MentorReview.booking_id
            == data.booking_id
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail=(
                "A review already exists "
                "for this booking."
            ),
        )

    review = MentorReview(
        user_id=current_user.id,
        mentor_id=mentor.id,
        booking_id=booking.id,
        rating=data.rating,
        review=(
            data.review.strip()
            if data.review
            else None
        ),
    )

    db.add(review)
    db.flush()

    # Recalculate mentor rating
    result = (
        db.query(
            func.avg(MentorReview.rating),
            func.count(MentorReview.id),
        )
        .filter(
            MentorReview.mentor_id
            == mentor.id
        )
        .first()
    )

    average_rating = float(
        result[0] or 0
    )

    total_reviews = int(
        result[1] or 0
    )

    mentor.rating = round(
        average_rating,
        2,
    )

    mentor.total_reviews = total_reviews

    db.commit()
    db.refresh(review)

    return review


# =========================================================
# GET MENTOR REVIEWS
# =========================================================

@router.get(
    "/mentor/{mentor_id}",
    response_model=list[MentorReviewResponse],
)
def get_mentor_reviews(
    mentor_id: int,
    db: Session = Depends(get_db),
):
    mentor = (
        db.query(Mentor)
        .filter(
            Mentor.id == mentor_id
        )
        .first()
    )

    if not mentor:
        raise HTTPException(
            status_code=404,
            detail="Mentor not found.",
        )

    return (
        db.query(MentorReview)
        .filter(
            MentorReview.mentor_id
            == mentor_id
        )
        .order_by(
            MentorReview.created_at.desc()
        )
        .all()
    )


# =========================================================
# GET RATING SUMMARY
# =========================================================

@router.get(
    "/mentor/{mentor_id}/rating",
    response_model=MentorRatingResponse,
)
def get_mentor_rating(
    mentor_id: int,
    db: Session = Depends(get_db),
):
    mentor = (
        db.query(Mentor)
        .filter(
            Mentor.id == mentor_id
        )
        .first()
    )

    if not mentor:
        raise HTTPException(
            status_code=404,
            detail="Mentor not found.",
        )

    result = (
        db.query(
            func.avg(MentorReview.rating),
            func.count(MentorReview.id),
        )
        .filter(
            MentorReview.mentor_id
            == mentor_id
        )
        .first()
    )

    return {
        "average_rating": round(
            float(result[0] or 0),
            2,
        ),
        "total_reviews": int(
            result[1] or 0
        ),
    }