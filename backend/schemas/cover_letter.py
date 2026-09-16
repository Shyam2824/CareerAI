from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


# ==========================================
# GENERATE COVER LETTER REQUEST
# ==========================================

class CoverLetterCreate(BaseModel):
    resume_id: Optional[int] = None

    job_title: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    company_name: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    job_description: Optional[str] = None

    tone: str = Field(
        default="professional",
        max_length=50,
    )


# ==========================================
# UPDATE COVER LETTER
# ==========================================

class CoverLetterUpdate(BaseModel):
    job_title: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    company_name: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    job_description: Optional[str] = None

    tone: Optional[str] = Field(
        default=None,
        max_length=50,
    )

    content: Optional[str] = None


# ==========================================
# COVER LETTER RESPONSE
# ==========================================

class CoverLetterResponse(BaseModel):
    id: int
    resume_id: Optional[int] = None

    job_title: Optional[str] = None
    company_name: Optional[str] = None

    job_description: Optional[str] = None

    tone: str
    content: str

    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==========================================
# HISTORY RESPONSE
# ==========================================

class CoverLetterHistoryResponse(BaseModel):
    id: int

    resume_id: Optional[int] = None

    job_title: Optional[str] = None
    company_name: Optional[str] = None

    tone: str

    created_at: datetime

    class Config:
        from_attributes = True