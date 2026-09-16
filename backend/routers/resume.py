from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File,
    status,
)
from schemas.resume import (
    ResumeResponse,
    ResumeDashboardStats,
    CareerInsight,
    CareerInsightsResponse,
)

from sqlalchemy.orm import Session

import json
import shutil

from pathlib import Path
from uuid import uuid4
from services.resume_text_extractor import (
    extract_resume_text,
)

from services.resume_analyzer import (
    analyze_resume_text,
)
# ==========================================
# DATABASE
# ==========================================

from database.database import get_db


# ==========================================
# MODELS
# ==========================================

from models.resume import Resume
from models.user import User


# ==========================================
# SCHEMAS
# ==========================================

from schemas.resume import (
    ResumeResponse,
    ResumeDashboardStats,
)


# ==========================================
# AUTHENTICATION
# ==========================================

from utils.dependencies import get_current_user


# ==========================================
# ROUTER
# ==========================================

router = APIRouter(
    prefix="/resumes",
    tags=["Resumes"],
)


# ==========================================
# UPLOAD DIRECTORY
# ==========================================

UPLOAD_DIR = Path("uploads/resumes")

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


# ==========================================
# RESUME ANALYSIS FUNCTION
# ==========================================

def analyze_resume(file_name: str) -> dict:
    """
    Temporary AI analysis logic.

    Later we can replace this with:
    - OpenAI
    - Gemini
    - NLP Resume Parser
    - LangChain
    """

    return {
        "ats_score": 75.0,
        "skills_score": 80.0,
        "experience_score": 70.0,
        "education_score": 85.0,
        "feedback": (
            "Your resume has a good structure. "
            "Improve ATS keywords, quantify achievements, "
            "and add more relevant technical skills."
        ),
    }


# ==========================================
# 1. UPLOAD RESUME
# ==========================================

@router.post(
    "/upload",
    response_model=ResumeResponse,
    status_code=status.HTTP_201_CREATED,
)
def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    # ------------------------------------------
    # VALIDATE FILE
    # ------------------------------------------

    if not file.filename:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File name is missing",
        )


    allowed_extensions = {
        ".pdf",
        ".docx",
    }


    file_extension = Path(
        file.filename
    ).suffix.lower()


    if file_extension not in allowed_extensions:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF and DOCX files are allowed",
        )


    # ------------------------------------------
    # CREATE UNIQUE FILE NAME
    # ------------------------------------------

    unique_file_name = (
        f"{uuid4()}{file_extension}"
    )


    file_path = (
        UPLOAD_DIR / unique_file_name
    )


    # ------------------------------------------
    # SAVE FILE
    # ------------------------------------------

    try:

        with file_path.open("wb") as buffer:

            shutil.copyfileobj(
                file.file,
                buffer,
            )

    except Exception as error:

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                f"Failed to save file: {str(error)}"
            ),
        )

    finally:

        file.file.close()
        
    # ------------------------------------------
    # EXTRACT RESUME TEXT
    # ------------------------------------------

    extracted_text = extract_resume_text(
        str(file_path)
    )

    if not extracted_text.strip():

        extracted_text = ""


    # ==========================================
    # EXTRACT RESUME TEXT
    # ==========================================

    extracted_text = extract_resume_text(
        str(file_path)
    )

    if not extracted_text.strip():
        extracted_text = ""


    # ==========================================
    # ANALYZE RESUME USING DYNAMIC ATS ENGINE
    # ==========================================

    analysis = analyze_resume_text(
        extracted_text
    )

    # ------------------------------------------
    # CREATE DATABASE RECORD
    # ------------------------------------------

    new_resume = Resume(

    # ==========================================
    # USER
    # ==========================================

        user_id=current_user.id,

        # ==========================================
        # FILE
        # ==========================================

        file_name=file.filename,
        file_url=str(file_path),

        extracted_text=extracted_text,

        # ==========================================
        # BASIC ANALYSIS
        # ==========================================

        detected_skills=json.dumps(
            analysis["skills"]
        ),

        detected_sections=json.dumps(
            analysis["sections"]
        ),

        strengths=json.dumps(
            analysis["strengths"]
        ),

        improvements=json.dumps(
            analysis["improvements"]
        ),

        # ==========================================
        # ADVANCED ANALYSIS
        # ==========================================

        contact_info=json.dumps(
            analysis["contact_info"]
        ),

        action_verbs=json.dumps(
            analysis["action_verbs"]
        ),

        achievements=json.dumps(
            analysis["achievements"]
        ),

        weak_phrases=json.dumps(
            analysis["weak_phrases"]
        ),

        resume_length=json.dumps(
            analysis["resume_length"]
        ),

        # ==========================================
        # SCORES
        # ==========================================

        ats_score=analysis["ats_score"],

        skills_score=analysis["skills_score"],

        experience_score=analysis[
            "experience_score"
        ],

        education_score=analysis[
            "education_score"
        ],

        # ==========================================
        # FEEDBACK
        # ==========================================

        feedback=analysis["feedback"],
    )

    try:

        db.add(new_resume)

        db.commit()

        db.refresh(new_resume)

    except Exception as error:

        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                f"Database error: {str(error)}"
            ),
        )


    return new_resume


# ==========================================
# 2. GET ALL USER RESUMES
# ==========================================

@router.get(
    "/",
    response_model=list[ResumeResponse],
)
def get_all_resumes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    resumes = (
        db.query(Resume)
        .filter(
            Resume.user_id == current_user.id
        )
        .order_by(
            Resume.created_at.desc()
        )
        .all()
    )


    return resumes


# ==========================================
# 3. DASHBOARD STATISTICS
# ==========================================

@router.get(
    "/dashboard/stats",
    response_model=ResumeDashboardStats,
)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    resumes = (
        db.query(Resume)
        .filter(
            Resume.user_id == current_user.id
        )
        .order_by(
            Resume.created_at.desc()
        )
        .all()
    )


    # ------------------------------------------
    # NO RESUMES
    # ------------------------------------------

    if not resumes:

        return ResumeDashboardStats(
            total_resumes=0,
            latest_ats_score=0.0,
            best_ats_score=0.0,
            average_ats_score=0.0,
        )


    # ------------------------------------------
    # SCORES
    # ------------------------------------------

    scores = [
        float(resume.ats_score or 0)
        for resume in resumes
    ]


    # ------------------------------------------
    # RETURN STATISTICS
    # ------------------------------------------

    return ResumeDashboardStats(
        total_resumes=len(resumes),

        latest_ats_score=scores[0],

        best_ats_score=max(scores),

        average_ats_score=round(
            sum(scores) / len(scores),
            2,
        ),
    )


# ==========================================
# 4. GET RECENT RESUMES
# LAST 5 RESUMES
# ==========================================

@router.get(
    "/recent",
    response_model=list[ResumeResponse],
)
def get_recent_resumes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    resumes = (
        db.query(Resume)
        .filter(
            Resume.user_id == current_user.id
        )
        .order_by(
            Resume.created_at.desc()
        )
        .limit(5)
        .all()
    )


    return resumes


# ==========================================
# 5. RESUME PERFORMANCE HISTORY
# IMPORTANT FOR ATS SCORE CHART
# ==========================================

@router.get(
    "/performance",
    response_model=list[ResumeResponse],
)
def get_resume_performance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    resumes = (
        db.query(Resume)
        .filter(
            Resume.user_id == current_user.id
        )
        .order_by(
            Resume.created_at.asc()
        )
        .all()
    )


    return resumes

# ==========================================
# AI CAREER INSIGHTS
# STATIC ROUTE - MUST COME BEFORE /{resume_id}
# ==========================================

@router.get(
    "/career-insights",
    response_model=CareerInsightsResponse,
)
def get_career_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    resumes = (
        db.query(Resume)
        .filter(
            Resume.user_id == current_user.id
        )
        .order_by(
            Resume.created_at.desc()
        )
        .all()
    )

    # ------------------------------------------
    # NO RESUMES
    # ------------------------------------------

    if not resumes:

        return CareerInsightsResponse(
            overall_message=(
                "Upload your first resume to receive "
                "personalized AI career insights."
            ),
            insights=[],
        )


    latest_resume = resumes[0]

    insights = []


    # ==========================================
    # ATS SCORE INSIGHT
    # ==========================================

    if latest_resume.ats_score < 60:

        insights.append(
            CareerInsight(
                title="Improve ATS Optimization",
                description=(
                    "Your ATS score is below the recommended "
                    "range. Add more job-specific keywords and "
                    "use a simple ATS-friendly resume format."
                ),
                priority="high",
            )
        )

    elif latest_resume.ats_score < 80:

        insights.append(
            CareerInsight(
                title="Improve Resume Keywords",
                description=(
                    "Your ATS score is good, but additional "
                    "industry-specific keywords can improve "
                    "your chances of getting shortlisted."
                ),
                priority="medium",
            )
        )

    else:

        insights.append(
            CareerInsight(
                title="Strong ATS Performance",
                description=(
                    "Your resume has strong ATS optimization. "
                    "Continue tailoring your resume for each "
                    "specific job application."
                ),
                priority="low",
            )
        )


    # ==========================================
    # SKILLS INSIGHT
    # ==========================================

    if latest_resume.skills_score < 70:

        insights.append(
            CareerInsight(
                title="Strengthen Technical Skills",
                description=(
                    "Add relevant technical skills, frameworks, "
                    "tools, and technologies related to your "
                    "target job role."
                ),
                priority="high",
            )
        )


    # ==========================================
    # EXPERIENCE INSIGHT
    # ==========================================

    if latest_resume.experience_score < 70:

        insights.append(
            CareerInsight(
                title="Improve Experience Section",
                description=(
                    "Quantify your achievements using measurable "
                    "results such as percentages, revenue, time "
                    "saved, or performance improvements."
                ),
                priority="high",
            )
        )


    # ==========================================
    # EDUCATION INSIGHT
    # ==========================================

    if latest_resume.education_score < 70:

        insights.append(
            CareerInsight(
                title="Improve Education Details",
                description=(
                    "Include relevant certifications, coursework, "
                    "academic achievements, and technical training."
                ),
                priority="medium",
            )
        )


    # ==========================================
    # SCORE IMPROVEMENT INSIGHT
    # ==========================================

    if len(resumes) >= 2:

        latest_score = latest_resume.ats_score
        previous_score = resumes[1].ats_score

        if latest_score > previous_score:

            improvement = (
                latest_score - previous_score
            )

            insights.append(
                CareerInsight(
                    title="Great Progress",
                    description=(
                        f"Your ATS score improved by "
                        f"{improvement:.1f} points compared "
                        f"to your previous resume."
                    ),
                    priority="low",
                )
            )

        elif latest_score < previous_score:

            insights.append(
                CareerInsight(
                    title="Review Recent Changes",
                    description=(
                        "Your latest ATS score decreased compared "
                        "to your previous resume. Review the "
                        "recent changes carefully."
                    ),
                    priority="high",
                )
            )


    # ==========================================
    # GENERAL INSIGHT
    # ==========================================

    if len(insights) == 1:

        insights.append(
            CareerInsight(
                title="Keep Improving",
                description=(
                    "Continue tailoring your resume according "
                    "to job descriptions and industry trends."
                ),
                priority="low",
            )
        )


    return CareerInsightsResponse(
        overall_message=(
            "These recommendations are generated from your "
            "latest resume analysis."
        ),
        insights=insights,
    )
# ==========================================
# 6. GET SINGLE RESUME BY ID
# IMPORTANT:
# DYNAMIC ROUTE MUST ALWAYS BE LAST
# ==========================================

@router.get(
    "/{resume_id}",
    response_model=ResumeResponse,
)
def get_resume_by_id(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
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
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found",
        )


    return resume