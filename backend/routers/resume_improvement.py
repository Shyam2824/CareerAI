import json

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.database import get_db
from models.user import User
from models.resume import Resume
from models.resume_improvement import ResumeImprovement

from schemas.resume_improvement import ResumeImprovementResponse

from utils.dependencies import get_current_user

from services.resume_improvement_engine import (
    analyze_resume_improvement,
)
from utils.premium import require_premium

router = APIRouter(
    prefix="/resume-improvement",
    tags=["Resume Improvement"],
)


@router.post(
    "/{resume_id}",
    response_model=ResumeImprovementResponse,
    status_code=status.HTTP_201_CREATED,
)
def improve_resume(
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
            status_code=404,
            detail="Resume not found",
        )

    resume_text = resume.extracted_text or ""

    if not resume_text.strip():
        resume_text = resume.feedback or ""

    detected_skills = []

    if resume.detected_skills:
        try:
            detected_skills = json.loads(
                resume.detected_skills
            )
        except Exception:
            detected_skills = [
                skill.strip()
                for skill in resume.detected_skills.split(",")
                if skill.strip()
            ]

    analysis = analyze_resume_improvement(
        resume_text=resume_text,
        ats_score=resume.ats_score or 0,
        skills_score=resume.skills_score or 0,
        experience_score=resume.experience_score or 0,
        education_score=resume.education_score or 0,
        detected_skills=detected_skills,
    )

    improvement = ResumeImprovement(
        user_id=current_user.id,
        resume_id=resume.id,
        overall_score=analysis["overall_score"],
        current_scores=json.dumps(
            analysis["current_scores"]
        ),
        summary=json.dumps(
            analysis["summary"]
        ),
        improvements=json.dumps(
            analysis["improvements"]
        ),
        keyword_suggestions=json.dumps(
            analysis["keyword_suggestions"]
        ),
        formatting_recommendations=json.dumps(
            analysis["formatting_recommendations"]
        ),
        ats_recommendations=json.dumps(
            analysis["ats_recommendations"]
        ),
    )

    db.add(improvement)
    db.commit()
    db.refresh(improvement)

    return {
        "id": improvement.id,
        "resume_id": improvement.resume_id,
        "overall_score": improvement.overall_score,
        "current_scores": analysis["current_scores"],
        "summary": analysis["summary"],
        "improvements": analysis["improvements"],
        "keyword_suggestions": analysis["keyword_suggestions"],
        "formatting_recommendations": analysis[
            "formatting_recommendations"
        ],
        "ats_recommendations": analysis[
            "ats_recommendations"
        ],
        "total_improvements": analysis[
            "total_improvements"
        ],
        "created_at": improvement.created_at,
    }


@router.get(
    "/{resume_id}",
    response_model=list[ResumeImprovementResponse],
)
def get_resume_improvements(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_premium),
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

    records = (
        db.query(ResumeImprovement)
        .filter(
            ResumeImprovement.resume_id == resume_id,
            ResumeImprovement.user_id == current_user.id,
        )
        .order_by(
            ResumeImprovement.created_at.desc()
        )
        .all()
    )

    result = []

    for item in records:

        result.append(
            {
                "id": item.id,
                "resume_id": item.resume_id,
                "overall_score": item.overall_score,
                "current_scores": json.loads(
                    item.current_scores or "{}"
                ),
                "summary": json.loads(
                    item.summary or "{}"
                ),
                "improvements": json.loads(
                    item.improvements or "[]"
                ),
                "keyword_suggestions": json.loads(
                    item.keyword_suggestions or "[]"
                ),
                "formatting_recommendations": json.loads(
                    item.formatting_recommendations or "[]"
                ),
                "ats_recommendations": json.loads(
                    item.ats_recommendations or "[]"
                ),
                "total_improvements": len(
                    json.loads(
                        item.improvements or "[]"
                    )
                ),
                "created_at": item.created_at,
            }
        )

    return result