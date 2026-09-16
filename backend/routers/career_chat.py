from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.database import get_db

from models.career_profile import CareerProfile
from models.skill_gap import SkillGapAnalysis
from models.career_path import CareerPathRecommendation
from models.learning_roadmap import LearningRoadmap
from models.career_chat import CareerChatMessage

from schemas.career_chat import (
    CareerChatRequest,
    CareerChatResponse,
)

from services.career_chat_engine import (
    build_career_context,
    generate_career_response,
)

from utils.dependencies import get_current_user


router = APIRouter(
    prefix="/career-chat",
    tags=["AI Career Chat"],
)


# ============================================================
# CHAT
# ============================================================

@router.post(
    "",
    response_model=list[CareerChatResponse],
)
def career_chat(
    request: CareerChatRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    message = request.message.strip()

    if not message:
        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty.",
        )

    if len(message) > 4000:
        raise HTTPException(
            status_code=400,
            detail="Message cannot exceed 4000 characters.",
        )

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

    career_path = (
        db.query(CareerPathRecommendation)
        .filter(
            CareerPathRecommendation.user_id
            == current_user.id
        )
        .order_by(
            CareerPathRecommendation.created_at.desc()
        )
        .first()
    )

    roadmap = (
        db.query(LearningRoadmap)
        .filter(
            LearningRoadmap.user_id
            == current_user.id
        )
        .first()
    )

    context = build_career_context(
        profile=profile,
        skill_gap=skill_gap,
        career_path=career_path,
        roadmap=roadmap,
    )

    answer = generate_career_response(
        question=message,
        context=context,
    )

    user_message = CareerChatMessage(
        user_id=current_user.id,
        role="user",
        message=message,
    )

    assistant_message = CareerChatMessage(
        user_id=current_user.id,
        role="assistant",
        message=answer,
    )

    db.add(user_message)
    db.add(assistant_message)

    db.commit()

    db.refresh(user_message)
    db.refresh(assistant_message)

    return [
        user_message,
        assistant_message,
    ]


# ============================================================
# CHAT HISTORY
# ============================================================

@router.get(
    "/history",
    response_model=list[CareerChatResponse],
)
def get_chat_history(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    messages = (
        db.query(CareerChatMessage)
        .filter(
            CareerChatMessage.user_id
            == current_user.id
        )
        .order_by(
            CareerChatMessage.created_at.asc()
        )
        .limit(100)
        .all()
    )

    return messages


# ============================================================
# CLEAR HISTORY
# ============================================================

@router.delete(
    "/history",
)
def clear_chat_history(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    deleted = (
        db.query(CareerChatMessage)
        .filter(
            CareerChatMessage.user_id
            == current_user.id
        )
        .delete(
            synchronize_session=False
        )
    )

    db.commit()

    return {
        "success": True,
        "deleted_messages": deleted,
        "message": "Career chat history cleared.",
    }