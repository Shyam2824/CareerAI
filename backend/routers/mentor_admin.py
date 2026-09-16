from datetime import datetime

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)
from sqlalchemy.orm import Session

from database.database import get_db
from models.booking import Booking
from models.mentor import Mentor
from models.mentor_availability import MentorAvailability
from models.user import User
from schemas.booking import (
    BookingCreate,
    BookingResponse,
)
from utils.dependencies import get_current_user


router = APIRouter(
    prefix="/bookings",
    tags=["Bookings"],
)


# =========================================================
# CREATE BOOKING
# =========================================================

@router.post(
    "/",
    response_model=BookingResponse,
    status_code=201,
)
def create_booking(
    data: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    mentor = (
        db.query(Mentor)
        .filter(
            Mentor.id == data.mentor_id
        )
        .first()
    )

    if not mentor:
        raise HTTPException(
            status_code=404,
            detail="Mentor not found.",
        )

    if not mentor.is_active:
        raise HTTPException(
            status_code=400,
            detail="Mentor is not currently available.",
        )

    if not mentor.is_approved:
        raise HTTPException(
            status_code=400,
            detail="Mentor is not approved yet.",
        )

    availability = (
        db.query(MentorAvailability)
        .filter(
            MentorAvailability.id
            == data.availability_id,
            MentorAvailability.mentor_id
            == data.mentor_id,
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
            detail="This availability slot is already booked.",
        )

    # Prevent duplicate booking by same user
    existing_booking = (
        db.query(Booking)
        .filter(
            Booking.user_id == current_user.id,
            Booking.availability_id
            == data.availability_id,
        )
        .first()
    )

    if existing_booking:
        raise HTTPException(
            status_code=409,
            detail=(
                "You have already booked "
                "this availability slot."
            ),
        )

    booking = Booking(
        user_id=current_user.id,
        mentor_id=data.mentor_id,
        availability_id=data.availability_id,
        status="confirmed",
        payment_status="not_required",
    )

    db.add(booking)

    availability.is_booked = True

    db.commit()
    db.refresh(booking)

    return booking


# =========================================================
# MY BOOKINGS
# =========================================================

@router.get(
    "/my",
    response_model=list[BookingResponse],
)
def get_my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Booking)
        .filter(
            Booking.user_id
            == current_user.id
        )
        .order_by(
            Booking.created_at.desc()
        )
        .all()
    )


# =========================================================
# GET SINGLE BOOKING
# =========================================================

@router.get(
    "/{booking_id}",
    response_model=BookingResponse,
)
def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = (
        db.query(Booking)
        .filter(
            Booking.id == booking_id
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
            detail="You do not have access to this booking.",
        )

    return booking


# =========================================================
# CANCEL BOOKING
# =========================================================

@router.delete(
    "/{booking_id}",
    response_model=BookingResponse,
)
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = (
        db.query(Booking)
        .filter(
            Booking.id == booking_id
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
            detail="You cannot cancel this booking.",
        )

    if booking.status == "cancelled":
        raise HTTPException(
            status_code=409,
            detail="Booking is already cancelled.",
        )

    booking.status = "cancelled"

    availability = (
        db.query(MentorAvailability)
        .filter(
            MentorAvailability.id
            == booking.availability_id
        )
        .first()
    )

    if availability:
        availability.is_booked = False

    db.commit()
    db.refresh(booking)

    return booking