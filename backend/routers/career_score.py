import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.database import get_db

from models.career_score import CareerScore
from models.career_profile import CareerProfile
from models.skill_gap import SkillGapAnalysis
from models.learning_roadmap import LearningRoadmap
from models.resume import Resume

from schemas.career_score import CareerScoreResponse

from services.career_score_engine import (
    calculate_career_score,
)

from utils.dependencies import get_current_user


router = APIRouter(
    prefix="/career-score",
    tags=["Career Score"],
)


# ============================================================
# GENERATE / UPDATE CAREER SCORE
# ============================================================

@router.post(
    "/generate",
    response_model=CareerScoreResponse,
)
def generate_career_score(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    # --------------------------------------------------------
    # CAREER PROFILE
    # --------------------------------------------------------

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
            detail=(
                "Career Profile not found. "
                "Please create your Career Profile first."
            ),
        )

    # --------------------------------------------------------
    # LATEST RESUME
    # --------------------------------------------------------

    resume = (
        db.query(Resume)
        .filter(
            Resume.user_id
            == current_user.id
        )
        .order_by(
            Resume.created_at.desc()
        )
        .first()
    )

    # --------------------------------------------------------
    # LATEST SKILL GAP
    # --------------------------------------------------------

    skill_gap = (
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

    # --------------------------------------------------------
    # LEARNING ROADMAP
    # --------------------------------------------------------

    roadmap = (
        db.query(LearningRoadmap)
        .filter(
            LearningRoadmap.user_id
            == current_user.id
        )
        .first()
    )

    # --------------------------------------------------------
    # CALCULATE
    # --------------------------------------------------------

    result = calculate_career_score(
        profile=profile,
        resume=resume,
        skill_gap=skill_gap,
        roadmap=roadmap,
    )

    recommendations = json.dumps(
        result["recommendations"]
    )

    # --------------------------------------------------------
    # FIND EXISTING SCORE
    # --------------------------------------------------------

    career_score = (
        db.query(CareerScore)
        .filter(
            CareerScore.user_id
            == current_user.id
        )
        .first()
    )

    if career_score:

        career_score.overall_score = (
            result["overall_score"]
        )

        career_score.resume_score = (
            result["resume_score"]
        )

        career_score.skills_score = (
            result["skills_score"]
        )

        career_score.experience_score = (
            result["experience_score"]
        )

        career_score.education_score = (
            result["education_score"]
        )

        career_score.skill_gap_score = (
            result["skill_gap_score"]
        )

        career_score.learning_progress_score = (
            result["learning_progress_score"]
        )

        career_score.status = (
            result["status"]
        )

        career_score.recommendations = (
            recommendations
        )

    else:

        career_score = CareerScore(
            user_id=current_user.id,

            overall_score=result[
                "overall_score"
            ],

            resume_score=result[
                "resume_score"
            ],

            skills_score=result[
                "skills_score"
            ],

            experience_score=result[
                "experience_score"
            ],

            education_score=result[
                "education_score"
            ],

            skill_gap_score=result[
                "skill_gap_score"
            ],

            learning_progress_score=result[
                "learning_progress_score"
            ],

            status=result[
                "status"
            ],

            recommendations=recommendations,
        )

        db.add(career_score)

    db.commit()

    db.refresh(career_score)

    return career_score


# ============================================================
# GET MY CAREER SCORE
# ============================================================

@router.get(
    "/my",
    response_model=CareerScoreResponse,
)
def get_my_career_score(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    career_score = (
        db.query(CareerScore)
        .filter(
            CareerScore.user_id
            == current_user.id
        )
        .first()
    )

    if not career_score:
        raise HTTPException(
            status_code=404,
            detail=(
                "Career Score has not been generated yet."
            ),
        )

    return career_score