from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func

from database.database import Base


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )

    plan_name = Column(
        String(100),
        nullable=False,
        default="free",
    )

    price = Column(
        Float,
        nullable=False,
        default=0,
    )

    status = Column(
        String(50),
        nullable=False,
        default="active",
    )

    start_date = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    end_date = Column(
        DateTime(timezone=True),
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