from sqlalchemy import (
    Column,
    Integer,
    Boolean,
    Date,
    Time,
    ForeignKey,
)

from database.database import Base


class MentorAvailability(Base):
    __tablename__ = "mentor_availability"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    mentor_id = Column(
        Integer,
        ForeignKey(
            "mentors.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    available_date = Column(
        Date,
        nullable=False,
    )

    start_time = Column(
        Time,
        nullable=False,
    )

    end_time = Column(
        Time,
        nullable=False,
    )

    is_booked = Column(
        Boolean,
        nullable=False,
        default=False,
    )