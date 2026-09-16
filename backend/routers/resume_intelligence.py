from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.database import get_db

from models.resume import Resume
from models.career_profile import CareerProfile

from schemas.resume_intelligence import ResumeIntelligenceResponse

from services.resume_intelligence import (
    detect_skills,
    detect_experience,
    detect_education,
)

from utils.dependencies import get_current_user


router = APIRouter(
    prefix="/resume-intelligence",
    tags=["Resume Intelligence"],
)


@router.post(
    "/analyze/{resume_id}",
    response_model=ResumeIntelligenceResponse,
)
def analyze_resume_intelligence(
    resume_id: int,
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

    text = resume.extracted_text or ""

    if not text.strip():
        raise HTTPException(
            status_code=400,
            detail="Resume does not contain extracted text",
        )

    # ---------------------------------
    # Detect information
    # ---------------------------------

    skills = detect_skills(text)

    years_of_experience = detect_experience(text)

    education = detect_education(text)

    # ---------------------------------
    # Calculate basic scores
    # ---------------------------------

    skills_score = min(
        round((len(skills) / 10) * 100, 2),
        100,
    )

    experience_score = 100 if years_of_experience is not None else 0

    education_score = 100 if education else 0

    # ---------------------------------
    # Update Resume
    # ---------------------------------

    resume.detected_skills = ", ".join(skills)

    resume.skills_score = skills_score
    resume.experience_score = experience_score
    resume.education_score = education_score

    # ---------------------------------
    # Find career profile
    # ---------------------------------

    profile = (
        db.query(CareerProfile)
        .filter(
            CareerProfile.user_id == current_user.id
        )
        .first()
    )

    profile_updated = False

    if not profile:
        profile = CareerProfile(
            user_id=current_user.id,
            technical_skills=", ".join(skills),
            years_of_experience=years_of_experience,
            education=education,
        )

        db.add(profile)

        profile_updated = True

    else:

        if skills:
            profile.technical_skills = ", ".join(skills)

        if years_of_experience is not None:
            profile.years_of_experience = years_of_experience

        if education:
            profile.education = education

        profile_updated = True

    # ---------------------------------
    # Career Profile Score
    # ---------------------------------

    profile_fields = [
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
        1
        for field in profile_fields
        if field is not None
        and str(field).strip() != ""
    )

    profile.profile_score = round(
        (completed / len(profile_fields)) * 100,
        2,
    )

    db.commit()

    return ResumeIntelligenceResponse(
        resume_id=resume.id,
        detected_skills=skills,
        current_role=profile.current_role,
        years_of_experience=years_of_experience,
        education=education,
        experience_score=experience_score,
        education_score=education_score,
        skills_score=skills_score,
        profile_updated=profile_updated,
        message="Resume intelligence analysis completed successfully",
    )