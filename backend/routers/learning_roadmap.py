import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.database import get_db

from models.career_profile import CareerProfile
from models.learning_roadmap import LearningRoadmap
from models.skill_gap import SkillGapAnalysis

from schemas.learning_roadmap import (
    LearningRoadmapResponse,
    LearningProgressUpdate,
)

from services.learning_roadmap_engine import (
    personalize_roadmap,
    calculate_progress,
    get_current_phase,
)

from utils.dependencies import get_current_user


router = APIRouter(
    prefix="/learning-roadmap",
    tags=["Learning Roadmap"],
)


@router.post(
    "/generate",
    response_model=LearningRoadmapResponse,
)
def generate_learning_roadmap(
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
            detail=(
                "Career profile not found. "
                "Please create your career profile first."
            ),
        )

    if not profile.target_role:

        raise HTTPException(
            status_code=400,
            detail="Target role is required.",
        )

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

    missing_skills = []

    readiness_score = 0

    if skill_gap:

        readiness_score = (
            skill_gap.readiness_score
        )

        if skill_gap.missing_skills:

            try:

                missing_skills = json.loads(
                    skill_gap.missing_skills
                )

            except (
                json.JSONDecodeError,
                TypeError,
            ):

                missing_skills = []

    result = personalize_roadmap(
        target_role=profile.target_role,
        technical_skills=profile.technical_skills,
        missing_skills=missing_skills,
    )

    roadmap_json = json.dumps(
        result["roadmap"]
    )

    recommendations = [
        "Follow the roadmap in sequence.",
        "Complete the project at the end of each phase.",
        "Add completed projects to your portfolio.",
        "Practice interview questions after completing major phases.",
        "Re-run Skill Gap Intelligence as your skills improve.",
    ]

    existing = (
        db.query(LearningRoadmap)
        .filter(
            LearningRoadmap.user_id
            == current_user.id
        )
        .first()
    )

    if existing:

        existing.target_role = (
            profile.target_role
        )

        existing.current_role = (
            profile.current_role
        )

        existing.readiness_score = (
            readiness_score
        )

        existing.estimated_months = (
            result["estimated_months"]
        )

        existing.roadmap = roadmap_json

        existing.recommendations = json.dumps(
            recommendations
        )

        db.commit()

        db.refresh(existing)

        return existing

    roadmap = LearningRoadmap(

        user_id=current_user.id,

        target_role=profile.target_role,

        current_role=profile.current_role,

        readiness_score=readiness_score,

        estimated_months=result[
            "estimated_months"
        ],

        roadmap=roadmap_json,

        current_phase=1,

        completed_topics=json.dumps([]),

        overall_progress=0,

        recommendations=json.dumps(
            recommendations
        ),
    )

    db.add(roadmap)

    db.commit()

    db.refresh(roadmap)

    return roadmap


@router.get(
    "/my",
    response_model=LearningRoadmapResponse,
)
def get_my_learning_roadmap(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    roadmap = (
        db.query(LearningRoadmap)
        .filter(
            LearningRoadmap.user_id
            == current_user.id
        )
        .first()
    )

    if not roadmap:

        raise HTTPException(
            status_code=404,
            detail=(
                "Learning roadmap not found. "
                "Please generate your roadmap first."
            ),
        )

    return roadmap


@router.patch(
    "/progress",
    response_model=LearningRoadmapResponse,
)
def update_learning_progress(
    payload: LearningProgressUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    roadmap = (
        db.query(LearningRoadmap)
        .filter(
            LearningRoadmap.user_id
            == current_user.id
        )
        .first()
    )

    if not roadmap:

        raise HTTPException(
            status_code=404,
            detail="Learning roadmap not found.",
        )

    if not roadmap.roadmap:

        raise HTTPException(
            status_code=400,
            detail="Roadmap data is missing.",
        )

    try:

        roadmap_data = json.loads(
            roadmap.roadmap
        )

    except json.JSONDecodeError:

        raise HTTPException(
            status_code=500,
            detail="Invalid roadmap data.",
        )

    progress = calculate_progress(
        roadmap_data,
        payload.completed_topics,
    )

    current_phase = get_current_phase(
        roadmap_data,
        payload.completed_topics,
    )

    roadmap.completed_topics = json.dumps(
        payload.completed_topics
    )

    roadmap.current_phase = (
        payload.current_phase
        if payload.current_phase is not None
        else current_phase
    )

    roadmap.overall_progress = progress

    db.commit()

    db.refresh(roadmap)

    return roadmap