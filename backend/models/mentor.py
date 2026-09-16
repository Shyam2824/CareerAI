from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.sql import func

from database.database import Base


class Mentor(Base):
    __tablename__ = "mentors"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id = Column(
        Integer,
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        unique=True,
        index=True,
    )

    title = Column(
        String(150),
        nullable=True,
    )

    company = Column(
        String(150),
        nullable=True,
    )

    experience = Column(
        String(100),
        nullable=True,
    )

    education = Column(
        String(255),
        nullable=True,
    )

    bio = Column(
        Text,
        nullable=True,
    )

    skills = Column(
        Text,
        nullable=True,
    )

    linkedin = Column(
        String(500),
        nullable=True,
    )

    price = Column(
        Float,
        nullable=False,
        default=0,
    )

    photo_url = Column(
        String(1000),
        nullable=True,
    )

    is_approved = Column(
        Boolean,
        nullable=False,
        default=False,
    )

    is_active = Column(
        Boolean,
        nullable=False,
        default=True,
    )

    rating = Column(
        Float,
        nullable=False,
        default=0,
    )

    total_reviews = Column(
        Integer,
        nullable=False,
        default=0,
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