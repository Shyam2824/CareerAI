from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func

from database.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(255),
        nullable=False
    )

    email = Column(
        String(255),
        unique=True,
        nullable=False,
        index=True
    )

    password = Column(
        String(255),
        nullable=False
    )

    # User roles:
    # user   -> normal CareerAI user
    # mentor -> mentor account
    # admin  -> administrator
    role = Column(
        String(50),
        nullable=False,
        default="user",
        server_default="user",
        index=True
    )

    # Account status
    is_active = Column(
        Boolean,
        nullable=False,
        default=True,
        server_default="true"
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )