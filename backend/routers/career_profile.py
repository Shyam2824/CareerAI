from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.database import get_db
from models.career_profile import CareerProfile
from schemas.career_profile import (
    CareerProfileCreate,
    CareerProfileUpdate,
    CareerProfileResponse,
)
from utils.dependencies import get_current_user


router = APIRouter(
    prefix="/career-profile",
    tags=["Career Profile"],
)


def calculate_profile_score(profile: CareerProfile) -> float:
    fields = [
        profile.current_role,
        profile.target_role,
        profile.years_of_experience,
        profile.education,
        profile.location,
        profile.preferred_location,
        profile.target_salary,
        profile.technical_skills,
        profile.soft_skills,
        profile.career_goal,
        profile.preferred_work_mode,
        profile.preferred_industry,
    ]

    completed = sum(
        1 for field in fields
        if field is not None and str(field).strip() != ""
    )

    total = len(fields)

    if total == 0:
        return 0

    return round((completed / total) * 100, 2)


@router.post(
    "",
    response_model=CareerProfileResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_career_profile(
    data: CareerProfileCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    existing_profile = (
        db.query(CareerProfile)
        .filter(CareerProfile.user_id == current_user.id)
        .first()
    )

    if existing_profile:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Career profile already exists",
        )

    profile = CareerProfile(
        user_id=current_user.id,
        **data.model_dump(),
    )

    profile.profile_score = calculate_profile_score(profile)

    db.add(profile)
    db.commit()
    db.refresh(profile)

    return profile


@router.get(
    "",
    response_model=CareerProfileResponse,
)
def get_my_career_profile(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    profile = (
        db.query(CareerProfile)
        .filter(CareerProfile.user_id == current_user.id)
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Career profile not found",
        )

    return profile


@router.put(
    "",
    response_model=CareerProfileResponse,
)
def update_career_profile(
    data: CareerProfileUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    profile = (
        db.query(CareerProfile)
        .filter(CareerProfile.user_id == current_user.id)
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Career profile not found",
        )

    update_data = data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(profile, field, value)

    profile.profile_score = calculate_profile_score(profile)

    db.commit()
    db.refresh(profile)

    return profile


@router.delete("")
def delete_career_profile(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    profile = (
        db.query(CareerProfile)
        .filter(CareerProfile.user_id == current_user.id)
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Career profile not found",
        )

    db.delete(profile)
    db.commit()

    return {
        "success": True,
        "message": "Career profile deleted successfully",
    }