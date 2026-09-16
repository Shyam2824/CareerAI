from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
)
from sqlalchemy.sql import func

from database.database import Base


class CoverLetter(Base):

    __tablename__ = "cover_letters"

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
        index=True,
    )

    resume_id = Column(
        Integer,
        ForeignKey(
            "resumes.id",
            ondelete="CASCADE",
        ),
        nullable=True,
        index=True,
    )

    job_title = Column(
        String(255),
        nullable=True,
    )

    company_name = Column(
        String(255),
        nullable=True,
    )

    job_description = Column(
        Text,
        nullable=True,
    )

    tone = Column(
        String(50),
        nullable=False,
        default="professional",
    )

    content = Column(
        Text,
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )