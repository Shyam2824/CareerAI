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


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    amount = Column(
        Float,
        nullable=False
    )

    currency = Column(
        String(10),
        default="INR"
    )

    payment_method = Column(
        String(100),
        nullable=True
    )

    transaction_id = Column(
        String(255),
        unique=True,
        nullable=True
    )

    status = Column(
        String(50),
        default="pending"
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )