from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    ForeignKey,
)
from sqlalchemy.sql import func

from database.database import Base


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    mentor_id = Column(
        Integer,
        ForeignKey("mentors.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    availability_id = Column(
        Integer,
        ForeignKey(
            "mentor_availability.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        unique=True,
    )

    booking_date = Column(
        DateTime(timezone=True),
        nullable=False,
    )

    duration_minutes = Column(
        Integer,
        nullable=False,
        default=60,
    )

    amount = Column(
        Float,
        nullable=False,
        default=0,
    )

    status = Column(
        String(50),
        nullable=False,
        default="pending",
    )

    payment_status = Column(
        String(50),
        nullable=False,
        default="pending",
    )

    razorpay_order_id = Column(
        String(255),
        unique=True,
        nullable=True,
        index=True,
    )

    razorpay_payment_id = Column(
        String(255),
        unique=True,
        nullable=True,
        index=True,
    )

    notes = Column(
        String(2000),
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )