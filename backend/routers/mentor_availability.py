from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)
from sqlalchemy.orm import Session

from database.database import get_db
from models.mentor import Mentor
from models.mentor_availability import MentorAvailability
from models.user import User
from schemas.mentor_availability import (
    MentorAvailabilityCreate,
    MentorAvailabilityResponse,
)
from utils.dependencies import get_current_user


router = APIRouter(
    prefix="/mentor-availability",
    tags=["Mentor Availability"],
)


def get_my_mentor(
    db: Session,
    user_id: int,
):
    return (
        db.query(Mentor)
        .filter(
            Mentor.user_id == user_id
        )
        .first()
    )


# =========================================================
# CREATE AVAILABILITY
# =========================================================

@router.post(
    "/",
    response_model=MentorAvailabilityResponse,
    status_code=201,
)
def create_availability(
    data: MentorAvailabilityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    mentor = get_my_mentor(
        db,
        current_user.id,
    )

    if not mentor:
        raise HTTPException(
            status_code=404,
            detail="Mentor profile not found.",
        )

    if not mentor.is_approved:
        raise HTTPException(
            status_code=403,
            detail="Mentor is not approved.",
        )

    if data.start_time <= data.end_time:
        pass
    else:
        raise HTTPException(
            status_code=422,
            detail="End time must be after start time.",
        )

    # Prevent exact duplicate slots
    existing = (
        db.query(MentorAvailability)
        .filter(
            MentorAvailability.mentor_id
            == mentor.id,
            MentorAvailability.start_time
            == data.start_time,
            MentorAvailability.end_time
            == data.end_time,
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail="This availability slot already exists.",
        )

    availability = MentorAvailability(
        mentor_id=mentor.id,
        start_time=data.start_time,
        end_time=data.end_time,
        is_booked=False,
    )

    db.add(availability)
    db.commit()
    db.refresh(availability)

    return availability


# =========================================================
# GET MY AVAILABILITY
# =========================================================

@router.get(
    "/me",
    response_model=list[MentorAvailabilityResponse],
)
def get_my_availability(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    mentor = get_my_mentor(
        db,
        current_user.id,
    )

    if not mentor:
        raise HTTPException(
            status_code=404,
            detail="Mentor profile not found.",
        )

    return (
        db.query(MentorAvailability)
        .filter(
            MentorAvailability.mentor_id
            == mentor.id
        )
        .order_by(
            MentorAvailability.start_time.asc()
        )
        .all()
    )


# =========================================================
# DELETE AVAILABILITY
# =========================================================

@router.delete(
    "/{availability_id}",
)
def delete_availability(
    availability_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    mentor = get_my_mentor(
        db,
        current_user.id,
    )

    if not mentor:
        raise HTTPException(
            status_code=404,
            detail="Mentor profile not found.",
        )

    availability = (
        db.query(MentorAvailability)
        .filter(
            MentorAvailability.id
            == availability_id,
            MentorAvailability.mentor_id
            == mentor.id,
        )
        .first()
    )

    if not availability:
        raise HTTPException(
            status_code=404,
            detail="Availability slot not found.",
        )

    if availability.is_booked:
        raise HTTPException(
            status_code=409,
            detail=(
                "Booked availability cannot be deleted."
            ),
        )

    db.delete(availability)
    db.commit()

    return {
        "success": True,
        "message": "Availability deleted successfully.",
    }