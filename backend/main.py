import os
from pathlib import Path
from routers import admin
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database.database import Base, engine
from database.init_db import init_db


# ============================================================
# IMPORT MODELS
# ============================================================
# IMPORTANT:
# Import models before create_all() so SQLAlchemy knows
# about every table.

from models.user import User
from models.resume import Resume
from models.job_match import JobMatch

from models.cover_letter import CoverLetter

from models.interview import Interview
from models.interview_question import InterviewQuestion
from models.interview_session_question import (
    InterviewSessionQuestion
)

from models.subscription import Subscription
from models.payment import Payment
from models.usage import Usage

from models.mentor import Mentor
from models.mentor_availability import MentorAvailability
from models.booking import Booking
from models.mentor_review import MentorReview

from models.notification import Notification

from models.career_profile import CareerProfile
from models.skill_gap import SkillGapAnalysis
from models.learning_roadmap import LearningRoadmap
from models.career_path import CareerPathRecommendation
from models.career_chat import CareerChatMessage
from models.career_score import CareerScore
from models.career_report import CareerReport

from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from utils.error_handlers import (
    general_exception_handler,
    http_exception_handler,
    integrity_exception_handler,
    sqlalchemy_exception_handler,
    validation_exception_handler,
)
# ============================================================
# IMPORT ROUTERS
# ============================================================

from routers.auth import router as auth_router

from routers.resume import router as resume_router

from routers.job_match import router as job_match_router

from routers.resume_improvement import (
    router as resume_improvement_router
)

from routers.resume_builder import (
    router as resume_builder_router
)

from routers.job_resume_optimizer import (
    router as job_resume_optimizer_router
)

from routers.cover_letter import ( router as cover_letter_router)
from routers.interview_questions import (router as interview_questions_router)
from routers.interview import (router as interview_router)
from routers.subscription import (router as subscription_router
)

from routers.payment import (
    router as payment_router
)

from routers.billing import (
    router as billing_router
)

from routers.mentor import (router as mentor_router)
from routers.mentor_availability import (router as mentor_availability_router)
from routers.booking import (
    router as booking_router
)

from routers.mentor_review import (
    router as mentor_review_router
)

from routers.mentor_admin import (
    router as mentor_admin_router
)

from routers.notification import (
    router as notification_router
)

from routers.career_profile import (
    router as career_profile_router
)

from routers.resume_intelligence import (
    router as resume_intelligence_router
)

from routers.skill_gap import (
    router as skill_gap_router
)


from routers.learning_roadmap import (router as learning_roadmap_router)
from routers.career_chat import (router as career_chat_router)
from routers.career_score import (router as career_score_router)
from routers.career_report import (router as career_report_router)

# ============================================================
# DIRECTORIES
# ============================================================

UPLOADS_DIR = Path("uploads")

UPLOADS_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


# ============================================================
# DATABASE
# ============================================================

# Create tables after all models have been imported.
Base.metadata.create_all(bind=engine)


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="CareerAI API",
    description="AI-powered Career Development Platform",
    version="1.0.0",
)


# ============================================================
# DATABASE STARTUP
# ============================================================

@app.on_event("startup")
def startup_event():
    """
    Initialize missing database tables when
    the FastAPI application starts.
    """
    init_db()


# ============================================================
# CORS
# ============================================================

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000").strip().rstrip("/")
FRONTEND_URLS = os.getenv("FRONTEND_URLS", "").split(",")
ALLOWED_ORIGINS = [
    origin.strip().rstrip("/")
    for origin in [FRONTEND_URL, *FRONTEND_URLS, "http://localhost:3000", "http://127.0.0.1:3000"]
    if origin.strip()
]
ALLOWED_ORIGINS = list(dict.fromkeys(ALLOWED_ORIGINS))

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"https://[a-zA-Z0-9-]+\.vercel\.app",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)


# ============================================================
# SECURITY HEADERS
# ============================================================

@app.middleware("http")
async def security_headers(
    request: Request,
    call_next,
):
    response = await call_next(request)

    response.headers[
        "X-Content-Type-Options"
    ] = "nosniff"

    response.headers[
        "X-Frame-Options"
    ] = "DENY"

    response.headers[
        "Referrer-Policy"
    ] = "strict-origin-when-cross-origin"

    response.headers[
        "Permissions-Policy"
    ] = (
        "camera=(), "
        "microphone=(), "
        "geolocation=()"
    )

    return response


# ============================================================
# STATIC UPLOADED FILES
# ============================================================

app.mount(
    "/uploads",
    StaticFiles(
        directory=str(UPLOADS_DIR)
    ),
    name="uploads",
)


# ============================================================
# INCLUDE ROUTERS
# ============================================================

# Authentication
app.include_router(
    auth_router
)


# Resume
app.include_router(
    resume_router
)

app.include_router(
    resume_improvement_router
)

app.include_router(
    resume_builder_router
)

app.include_router(
    job_resume_optimizer_router
)


# Jobs
app.include_router(
    job_match_router
)


# Cover Letter
app.include_router(
    cover_letter_router
)


# Interview
app.include_router(
    interview_questions_router
)

app.include_router(
    interview_router
)


# Subscription / Billing
app.include_router(
    subscription_router
)

app.include_router(
    payment_router
)

app.include_router(
    billing_router
)


# Mentor System
app.include_router(
    mentor_router
)

app.include_router(
    mentor_availability_router
)

app.include_router(
    booking_router
)

app.include_router(
    mentor_review_router
)

app.include_router(
    mentor_admin_router
)


# Notifications
app.include_router(
    notification_router
)


# ============================================================
# CAREER INTELLIGENCE
# ============================================================

# 21.1 Career Profile
app.include_router(career_profile_router)


# 21.2 Resume + Skills Intelligence
app.include_router(resume_intelligence_router)


# 21.3 Skill Gap Intelligence
app.include_router(
    skill_gap_router
)


# # 21.4 Career Path


# 21.5 Personalized Learning Roadmap
app.include_router(
    learning_roadmap_router
)


# 21.7 AI Career Chat
app.include_router(
    career_chat_router
)


# 21.8 Career Score
app.include_router(
    career_score_router
)


# 21.10 AI Career Report
app.include_router(career_report_router)
app.include_router(admin.router)


app.add_exception_handler(
    StarletteHTTPException,
    http_exception_handler,
)

app.add_exception_handler(
    RequestValidationError,
    validation_exception_handler,
)

app.add_exception_handler(
    IntegrityError,
    integrity_exception_handler,
)

app.add_exception_handler(
    SQLAlchemyError,
    sqlalchemy_exception_handler,
)

app.add_exception_handler(
    Exception,
    general_exception_handler,
)

# ============================================================
# ROOT ENDPOINT
# ============================================================

@app.get("/")
def root():
    return {
        "message": "CareerAI API is running",
        "version": "1.0.0",
        "status": "healthy",
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "CareerAI API",
    }