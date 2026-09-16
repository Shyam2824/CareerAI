from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy.orm import Session

from database.database import get_db

from models.user import User
from models.resume import Resume
from models.job_match import JobMatch

from schemas.job_match import (
    JobMatchRequest,
    JobMatchResponse,
    JobMatchHistoryResponse,
)

from utils.dependencies import get_current_user

from services.job_match_engine import (
    calculate_job_match,
)


# ==========================================
# ROUTER
# ==========================================

router = APIRouter(
    prefix="/job-match",
    tags=["Job Match"],
)


# ==========================================
# ANALYZE JOB MATCH
# ==========================================

@router.post(
    "/analyze",
    response_model=JobMatchResponse,
    status_code=status.HTTP_201_CREATED,
)
def analyze_job_match(
    request: JobMatchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    # Verify resume
    resume = (
        db.query(Resume)
        .filter(
            Resume.id == request.resume_id,
            Resume.user_id == current_user.id,
        )
        .first()
    )

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found",
        )

    # Get extracted resume text
    resume_text = resume.extracted_text or ""

    if not resume_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Resume text is not available. "
                "Please upload the resume again."
            ),
        )

    # Analyze
    analysis = calculate_job_match(
        resume_text=resume_text,
        job_description=request.job_description,
    )

    # Create database record
    new_job_match = JobMatch(
        user_id=current_user.id,
        resume_id=resume.id,

        job_title=request.job_title,
        company_name=request.company_name,
        job_description=request.job_description,

        match_score=analysis["match_score"],

        skills_score=analysis["skills_score"],
        keyword_score=analysis["keyword_score"],
        experience_score=analysis["experience_score"],

        matched_skills=", ".join(
            analysis["matched_skills"]
        ),

        missing_skills=", ".join(
            analysis["missing_skills"]
        ),

        matched_keywords=", ".join(
            analysis["matched_keywords"]
        ),

        missing_keywords=", ".join(
            analysis["missing_keywords"]
        ),

        suggestions=" | ".join(
            item["suggestion"]
            for item in analysis["suggestions"]
        ),
    )

    # Save
    try:
        db.add(new_job_match)
        db.commit()
        db.refresh(new_job_match)

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(error)}",
        )

    # Return
    return {
        "id": new_job_match.id,
        "resume_id": new_job_match.resume_id,

        "job_title": new_job_match.job_title,
        "company_name": new_job_match.company_name,

        "match_score": analysis["match_score"],
        "skills_score": analysis["skills_score"],
        "keyword_score": analysis["keyword_score"],
        "experience_score": analysis["experience_score"],

        "matched_skills": analysis["matched_skills"],
        "missing_skills": analysis["missing_skills"],

        "matched_keywords": analysis["matched_keywords"],
        "missing_keywords": analysis["missing_keywords"],

        "suggestions": analysis["suggestions"],

        "created_at": new_job_match.created_at,
    }


# ==========================================
# GET JOB MATCH HISTORY
# ==========================================

@router.get(
    "/history",
    response_model=list[JobMatchHistoryResponse],
)
def get_job_match_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    history = (
        db.query(JobMatch)
        .filter(
            JobMatch.user_id == current_user.id
        )
        .order_by(
            JobMatch.created_at.desc()
        )
        .all()
    )

    return history


# ==========================================
# GET SINGLE JOB MATCH
# IMPORTANT:
# /history MUST COME BEFORE /{match_id}
# ==========================================

@router.get(
    "/{match_id}",
    response_model=JobMatchResponse,
)
def get_job_match_by_id(
    match_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    job_match = (
        db.query(JobMatch)
        .filter(
            JobMatch.id == match_id,
            JobMatch.user_id == current_user.id,
        )
        .first()
    )

    if not job_match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job match analysis not found",
        )

    # Convert stored strings back to lists
    matched_skills = (
        job_match.matched_skills.split(", ")
        if job_match.matched_skills
        else []
    )

    missing_skills = (
        job_match.missing_skills.split(", ")
        if job_match.missing_skills
        else []
    )

    matched_keywords = (
        job_match.matched_keywords.split(", ")
        if job_match.matched_keywords
        else []
    )

    missing_keywords = (
        job_match.missing_keywords.split(", ")
        if job_match.missing_keywords
        else []
    )

    # Convert suggestions
    suggestions = []

    if job_match.suggestions:
        suggestions = [
            {
                "type": "general",
                "priority": "medium",
                "suggestion": suggestion.strip(),
            }
            for suggestion in job_match.suggestions.split("|")
            if suggestion.strip()
        ]

    return {
        "id": job_match.id,
        "resume_id": job_match.resume_id,

        "job_title": job_match.job_title,
        "company_name": job_match.company_name,

        "match_score": job_match.match_score,
        "skills_score": job_match.skills_score,
        "keyword_score": job_match.keyword_score,
        "experience_score": job_match.experience_score,

        "matched_skills": matched_skills,
        "missing_skills": missing_skills,

        "matched_keywords": matched_keywords,
        "missing_keywords": missing_keywords,

        "suggestions": suggestions,

        "created_at": job_match.created_at,
    }


# ==========================================
# DELETE JOB MATCH
# ==========================================

@router.delete(
    "/{match_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_job_match(
    match_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    job_match = (
        db.query(JobMatch)
        .filter(
            JobMatch.id == match_id,
            JobMatch.user_id == current_user.id,
        )
        .first()
    )

    if not job_match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job match analysis not found",
        )

    try:
        db.delete(job_match)
        db.commit()

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(error)}",
        )

    return None