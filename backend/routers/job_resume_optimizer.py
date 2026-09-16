import json

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.database import get_db
from models.resume import Resume
from models.job_resume_optimization import JobResumeOptimization
from models.user import User
from schemas.job_resume_optimizer import (
    JobResumeAnalyzeRequest,
    JobResumeOptimizeRequest,
    JobATSScoreRequest,
    JobATSScoreResponse,
    JobResumeOptimizeResponse,
    JobResumeOptimizationHistoryResponse,
)
from services.job_ai_optimizer import (
    calculate_job_ats_score,
    compare_skills,
    compare_keywords,
    optimize_resume_for_job,
)
from utils.dependencies import get_current_user
from utils.premium import require_premium

router = APIRouter(
    prefix="/job-resume-optimizer",
    tags=["Job Resume Optimizer"],
)


# ============================================================
# GET USER RESUME
# ============================================================

def get_user_resume(
    resume_id: int,
    current_user,
    db: Session,
) -> Resume:

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
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found",
        )

    return resume


# ============================================================
# ANALYZE JOB + RESUME
# ============================================================

@router.post("/analyze")
def analyze_job_resume(
    request: JobResumeAnalyzeRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):

    resume = get_user_resume(
        request.resume_id,
        current_user,
        db,
    )

    resume_text = resume.extracted_text or ""

    if not resume_text.strip():
        resume_text = resume.feedback or ""

    if not resume_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Resume does not contain extracted text",
        )

    skill_data = compare_skills(
        resume_text,
        request.job_description,
    )

    keyword_data = compare_keywords(
        resume_text,
        request.job_description,
    )

    ats_data = calculate_job_ats_score(
        resume_text,
        request.job_description,
    )

    return {
        "resume_id": resume.id,

        "job_title": request.job_title,
        "company_name": request.company_name,

        "ats_score": ats_data["ats_score"],

        "matched_skills": skill_data[
            "matched_skills"
        ],

        "missing_skills": skill_data[
            "missing_skills"
        ],

        "skill_match_percentage": skill_data[
            "skill_match_percentage"
        ],

        "matched_keywords": keyword_data[
            "matched_keywords"
        ],

        "missing_keywords": keyword_data[
            "missing_keywords"
        ],

        "keyword_match_percentage": keyword_data[
            "keyword_match_percentage"
        ],

        "experience_score": ats_data[
            "experience_score"
        ],

        "education_score": ats_data[
            "education_score"
        ],

        "title_score": ats_data[
            "title_score"
        ],

        "sections_score": ats_data[
            "sections_score"
        ],

        "formatting_score": ats_data[
            "formatting_score"
        ],

        "strengths": ats_data[
            "strengths"
        ],

        "improvements": ats_data[
            "improvements"
        ],
    }


# ============================================================
# SKILL GAP
# ============================================================

@router.post("/skill-gap")
def skill_gap(
    request: JobResumeAnalyzeRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):

    resume = get_user_resume(
        request.resume_id,
        current_user,
        db,
    )

    resume_text = resume.extracted_text or ""

    skill_data = compare_skills(
        resume_text,
        request.job_description,
    )

    keyword_data = compare_keywords(
        resume_text,
        request.job_description,
    )

    return {
        "matched_skills": skill_data[
            "matched_skills"
        ],

        "missing_skills": skill_data[
            "missing_skills"
        ],

        "partial_skills": [],

        "matched_keywords": keyword_data[
            "matched_keywords"
        ],

        "missing_keywords": keyword_data[
            "missing_keywords"
        ],

        "skill_match_percentage": skill_data[
            "skill_match_percentage"
        ],

        "keyword_match_percentage": keyword_data[
            "keyword_match_percentage"
        ],
    }


# ============================================================
# JOB-SPECIFIC ATS SCORE
# ============================================================

@router.post(
    "/ats-score",
    response_model=JobATSScoreResponse,
)
def job_ats_score(
    request: JobATSScoreRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):

    resume = get_user_resume(
        request.resume_id,
        current_user,
        db,
    )

    resume_text = resume.extracted_text or ""

    if not resume_text.strip():
        resume_text = resume.feedback or ""

    result = calculate_job_ats_score(
        resume_text,
        request.job_description,
    )

    return JobATSScoreResponse(
        ats_score=result["ats_score"],
        skills_score=result["skills_score"],
        keywords_score=result["keywords_score"],
        experience_score=result["experience_score"],
        title_score=result["title_score"],
        education_score=result["education_score"],
        sections_score=result["sections_score"],
        formatting_score=result["formatting_score"],
        strengths=result["strengths"],
        improvements=result["improvements"],
    )


# ============================================================
# AI OPTIMIZATION
# ============================================================

@router.post(
    "/optimize",
    response_model=JobResumeOptimizeResponse,
)
def optimize_job_resume(
    request: JobResumeOptimizeRequest,
    current_user: User = Depends(require_premium),
    db: Session = Depends(get_db),
):

    resume = get_user_resume(
        request.resume_id,
        current_user,
        db,
    )

    resume_text = resume.extracted_text or ""

    if not resume_text.strip():
        resume_text = resume.feedback or ""

    if not resume_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Resume does not contain extracted text",
        )

    result = optimize_resume_for_job(
        resume_text,
        request.job_description,
    )

    # ========================================================
    # SAVE HISTORY
    # ========================================================

    matched_skills = compare_skills(
        resume_text,
        request.job_description,
    )["matched_skills"]

    missing_skills = compare_skills(
        resume_text,
        request.job_description,
    )["missing_skills"]

    optimization = JobResumeOptimization(
        user_id=current_user.id,
        resume_id=resume.id,

        job_title=request.job_title,
        company_name=request.company_name,

        job_description=request.job_description,

        before_ats_score=result[
            "before_ats_score"
        ],

        after_ats_score=result[
            "after_ats_score"
        ],

        matched_skills=json.dumps(
            matched_skills
        ),

        missing_skills=json.dumps(
            missing_skills
        ),

        keyword_changes=json.dumps(
            result["keyword_recommendations"]
        ),

        optimization_changes=json.dumps(
            {
                "summary": result["summary"],
                "experience": result[
                    "experience_improvements"
                ],
                "projects": result[
                    "project_improvements"
                ],
            }
        ),
    )

    db.add(optimization)
    db.commit()
    db.refresh(optimization)

    return result


# ============================================================
# HISTORY
# ============================================================

@router.get(
    "/history",
    response_model=list[
        JobResumeOptimizationHistoryResponse
    ],
)
def get_optimization_history(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):

    records = (
        db.query(JobResumeOptimization)
        .filter(
            JobResumeOptimization.user_id
            == current_user.id
        )
        .order_by(
            JobResumeOptimization.created_at.desc()
        )
        .all()
    )

    response = []

    for record in records:

        try:
            matched_skills = json.loads(
                record.matched_skills or "[]"
            )
        except json.JSONDecodeError:
            matched_skills = []

        try:
            missing_skills = json.loads(
                record.missing_skills or "[]"
            )
        except json.JSONDecodeError:
            missing_skills = []

        try:
            keyword_changes = json.loads(
                record.keyword_changes or "[]"
            )
        except json.JSONDecodeError:
            keyword_changes = []

        try:
            optimization_changes = json.loads(
                record.optimization_changes
                or "{}"
            )
        except json.JSONDecodeError:
            optimization_changes = {}

        response.append(
            JobResumeOptimizationHistoryResponse(
                id=record.id,
                resume_id=record.resume_id,

                job_title=record.job_title,
                company_name=record.company_name,

                before_ats_score=record.before_ats_score,
                after_ats_score=record.after_ats_score,

                matched_skills=matched_skills,
                missing_skills=missing_skills,

                keyword_changes=keyword_changes,

                optimization_changes=optimization_changes,

                created_at=record.created_at,
            )
        )

    return response


# ============================================================
# GET SINGLE HISTORY
# ============================================================

@router.get(
    "/history/{optimization_id}",
    response_model=JobResumeOptimizationHistoryResponse,
)
def get_single_optimization(
    optimization_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):

    record = (
        db.query(JobResumeOptimization)
        .filter(
            JobResumeOptimization.id
            == optimization_id,
            JobResumeOptimization.user_id
            == current_user.id,
        )
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=404,
            detail="Optimization history not found",
        )

    try:
        matched_skills = json.loads(
            record.matched_skills or "[]"
        )
    except json.JSONDecodeError:
        matched_skills = []

    try:
        missing_skills = json.loads(
            record.missing_skills or "[]"
        )
    except json.JSONDecodeError:
        missing_skills = []

    try:
        keyword_changes = json.loads(
            record.keyword_changes or "[]"
        )
    except json.JSONDecodeError:
        keyword_changes = []

    try:
        optimization_changes = json.loads(
            record.optimization_changes
            or "{}"
        )
    except json.JSONDecodeError:
        optimization_changes = {}

    return JobResumeOptimizationHistoryResponse(
        id=record.id,
        resume_id=record.resume_id,

        job_title=record.job_title,
        company_name=record.company_name,

        before_ats_score=record.before_ats_score,
        after_ats_score=record.after_ats_score,

        matched_skills=matched_skills,
        missing_skills=missing_skills,

        keyword_changes=keyword_changes,

        optimization_changes=optimization_changes,

        created_at=record.created_at,
    )


# ============================================================
# DELETE HISTORY
# ============================================================

@router.delete(
    "/history/{optimization_id}"
)
def delete_optimization(
    optimization_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):

    record = (
        db.query(JobResumeOptimization)
        .filter(
            JobResumeOptimization.id
            == optimization_id,
            JobResumeOptimization.user_id
            == current_user.id,
        )
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=404,
            detail="Optimization history not found",
        )

    db.delete(record)
    db.commit()

    return {
        "message": "Optimization history deleted successfully"
    }