from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.database import get_db

from models.career_profile import CareerProfile
from models.skill_gap import SkillGapAnalysis

from schemas.skill_gap import SkillGapResponse

from services.skill_gap_engine import (
    calculate_skill_gap,
)

from utils.dependencies import get_current_user


router = APIRouter(
    prefix="/skill-gap",
    tags=["Skill Gap Intelligence"],
)


@router.post(
    "/analyze",
    response_model=SkillGapResponse,
)
def analyze_skill_gap(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    profile = (
        db.query(CareerProfile)
        .filter(
            CareerProfile.user_id
            == current_user.id
        )
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Career profile not found",
        )

    if not profile.target_role:
        raise HTTPException(
            status_code=400,
            detail="Please set your target role first",
        )

    result = calculate_skill_gap(
        target_role=profile.target_role,
        user_skills=profile.technical_skills,
    )

    analysis = SkillGapAnalysis(
        user_id=current_user.id,
        target_role=profile.target_role,

        user_skills=", ".join(
            result["user_skills"]
        ),

        required_skills=", ".join(
            result["required_skills"]
        ),

        missing_skills=", ".join(
            result["missing_skills"]
        ),

        high_priority_skills=", ".join(
            result["high_priority_skills"]
        ),

        medium_priority_skills=", ".join(
            result["medium_priority_skills"]
        ),

        low_priority_skills=", ".join(
            result["low_priority_skills"]
        ),

        readiness_score=result[
            "readiness_score"
        ],

        recommendations=result[
            "recommendations"
        ],
    )

    db.add(analysis)

    db.commit()

    db.refresh(analysis)

    return analysis


@router.get(
    "/my",
    response_model=SkillGapResponse,
)
def get_my_skill_gap(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    analysis = (
        db.query(SkillGapAnalysis)
        .filter(
            SkillGapAnalysis.user_id
            == current_user.id
        )
        .order_by(
            SkillGapAnalysis.created_at.desc()
        )
        .first()
    )

    if not analysis:
        raise HTTPException(
            status_code=404,
            detail="Skill gap analysis not found",
        )

    return analysis