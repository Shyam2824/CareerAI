from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from database.database import get_db
from models.interview_question import InterviewQuestion
from schemas.interview_question import (
    InterviewQuestionCreate,
    InterviewQuestionResponse,
)
from utils.dependencies import get_current_user
from models.resume import Resume
from services.resume_interview_engine import generate_resume_questions
from services.jd_interview_engine import generate_jd_questions

router = APIRouter(
    prefix="/interview-questions",
    tags=["Interview Question Bank"]
)


@router.get(
    "/",
    response_model=list[InterviewQuestionResponse]
)
def get_questions(
    category: Optional[str] = Query(default=None),
    topic: Optional[str] = Query(default=None),
    difficulty: Optional[str] = Query(default=None),
    question_type: Optional[str] = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    query = db.query(InterviewQuestion).filter(
        InterviewQuestion.is_active == True
    )

    if category:
        query = query.filter(
            InterviewQuestion.category == category
        )

    if topic:
        query = query.filter(
            InterviewQuestion.topic == topic
        )

    if difficulty:
        query = query.filter(
            InterviewQuestion.difficulty == difficulty
        )

    if question_type:
        query = query.filter(
            InterviewQuestion.question_type == question_type
        )

    return (
        query
        .order_by(InterviewQuestion.id.desc())
        .limit(limit)
        .all()
    )


@router.get(
    "/categories",
    response_model=list[str]
)
def get_categories(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    categories = (
        db.query(InterviewQuestion.category)
        .filter(InterviewQuestion.is_active == True)
        .distinct()
        .order_by(InterviewQuestion.category)
        .all()
    )

    return [item[0] for item in categories]

@router.post(
    "/resume/{resume_id}",
    response_model=list[InterviewQuestionResponse],
)
def generate_questions_from_resume(
    resume_id: int,
    difficulty: str = Query(default="medium"),
    limit: int = Query(default=10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    resume = (
        db.query(Resume)
        .filter(
            Resume.id == resume_id,
            Resume.user_id == current_user.id,
        )
        .first()
    )

    if not resume:
        raise HTTPException(
            status_code=404,
            detail="Resume not found",
        )

    resume_text = resume.extracted_text or ""

    if not resume_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Resume text is not available",
        )

    generated_questions = generate_resume_questions(
        resume_text=resume_text,
        difficulty=difficulty,
        limit=limit,
    )

    if not generated_questions:
        raise HTTPException(
            status_code=400,
            detail="Could not generate questions from this resume",
        )

    saved_questions = []

    for item in generated_questions:

        question = InterviewQuestion(
            question=item["question"],
            category=item["category"],
            topic=item["topic"],
            difficulty=item["difficulty"],
            question_type=item["question_type"],
            is_active=True,
        )

        db.add(question)
        saved_questions.append(question)

    db.commit()

    for question in saved_questions:
        db.refresh(question)

    return saved_questions

@router.post(
    "/job-description",
    response_model=list[InterviewQuestionResponse],
)
def generate_questions_from_job_description(
    job_description: str,
    job_title: str = "",
    difficulty: str = "medium",
    limit: int = Query(default=15, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if not job_description.strip():
        raise HTTPException(
            status_code=400,
            detail="Job description is required",
        )

    generated_questions = generate_jd_questions(
        job_description=job_description,
        job_title=job_title,
        difficulty=difficulty,
        limit=limit,
    )

    if not generated_questions:
        raise HTTPException(
            status_code=400,
            detail="Could not generate questions from job description",
        )

    saved_questions = []

    for item in generated_questions:

        question = InterviewQuestion(
            question=item["question"],
            category=item["category"],
            topic=item["topic"],
            difficulty=item["difficulty"],
            question_type=item["question_type"],
            is_active=True,
        )

        db.add(question)
        saved_questions.append(question)

    db.commit()

    for question in saved_questions:
        db.refresh(question)

    return saved_questions


@router.get(
    "/{question_id}",
    response_model=InterviewQuestionResponse
)
def get_question(
    question_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    question = (
        db.query(InterviewQuestion)
        .filter(
            InterviewQuestion.id == question_id,
            InterviewQuestion.is_active == True,
        )
        .first()
    )

    if not question:
        raise HTTPException(
            status_code=404,
            detail="Interview question not found"
        )

    return question


@router.post(
    "/",
    response_model=InterviewQuestionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_question(
    data: InterviewQuestionCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    question = InterviewQuestion(
        question=data.question,
        category=data.category,
        topic=data.topic,
        difficulty=data.difficulty,
        question_type=data.question_type,
        answer=data.answer,
        explanation=data.explanation,
    )

    db.add(question)
    db.commit()
    db.refresh(question)

    return question