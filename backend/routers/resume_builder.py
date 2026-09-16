import json

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.database import get_db
from models.resume_builder import ResumeBuilder
from schemas.resume_builder import (
    ResumeBuilderCreate,
    ResumeBuilderUpdate,
    ResumeBuilderResponse,
)
from utils.dependencies import get_current_user


router = APIRouter(
    prefix="/resume-builder",
    tags=["Resume Builder"]
)


def serialize_resume(resume: ResumeBuilder):
    return ResumeBuilderResponse(
        id=resume.id,
        title=resume.title,

        personal_info=json.loads(resume.personal_info or "{}"),

        summary=resume.summary or "",

        skills=json.loads(resume.skills or "[]"),

        experience=json.loads(resume.experience or "[]"),

        education=json.loads(resume.education or "[]"),

        projects=json.loads(resume.projects or "[]"),

        certifications=json.loads(
            resume.certifications or "[]"
        ),

        achievements=json.loads(
            resume.achievements or "[]"
        ),

        created_at=resume.created_at,
        updated_at=resume.updated_at,
    )


@router.post(
    "",
    response_model=ResumeBuilderResponse,
    status_code=status.HTTP_201_CREATED
)
def create_resume(
    data: ResumeBuilderCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    resume = ResumeBuilder(
        user_id=current_user.id,

        title=data.title,

        personal_info=json.dumps(
            data.personal_info
        ),

        summary=data.summary,

        skills=json.dumps(
            data.skills
        ),

        experience=json.dumps(
            data.experience
        ),

        education=json.dumps(
            data.education
        ),

        projects=json.dumps(
            data.projects
        ),

        certifications=json.dumps(
            data.certifications
        ),

        achievements=json.dumps(
            data.achievements
        ),
    )

    db.add(resume)
    db.commit()
    db.refresh(resume)

    return serialize_resume(resume)


@router.get(
    "",
    response_model=list[ResumeBuilderResponse]
)
def get_my_resumes(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    resumes = (
        db.query(ResumeBuilder)
        .filter(
            ResumeBuilder.user_id == current_user.id
        )
        .order_by(
            ResumeBuilder.updated_at.desc()
        )
        .all()
    )

    return [
        serialize_resume(resume)
        for resume in resumes
    ]


@router.get(
    "/{resume_id}",
    response_model=ResumeBuilderResponse
)
def get_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    resume = (
        db.query(ResumeBuilder)
        .filter(
            ResumeBuilder.id == resume_id,
            ResumeBuilder.user_id == current_user.id,
        )
        .first()
    )

    if not resume:
        raise HTTPException(
            status_code=404,
            detail="Resume not found"
        )

    return serialize_resume(resume)


@router.put(
    "/{resume_id}",
    response_model=ResumeBuilderResponse
)
def update_resume(
    resume_id: int,
    data: ResumeBuilderUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    resume = (
        db.query(ResumeBuilder)
        .filter(
            ResumeBuilder.id == resume_id,
            ResumeBuilder.user_id == current_user.id,
        )
        .first()
    )

    if not resume:
        raise HTTPException(
            status_code=404,
            detail="Resume not found"
        )

    update_data = data.model_dump(
        exclude_unset=True
    )

    if "title" in update_data:
        resume.title = update_data["title"]

    if "personal_info" in update_data:
        resume.personal_info = json.dumps(
            update_data["personal_info"]
        )

    if "summary" in update_data:
        resume.summary = update_data["summary"]

    if "skills" in update_data:
        resume.skills = json.dumps(
            update_data["skills"]
        )

    if "experience" in update_data:
        resume.experience = json.dumps(
            update_data["experience"]
        )

    if "education" in update_data:
        resume.education = json.dumps(
            update_data["education"]
        )

    if "projects" in update_data:
        resume.projects = json.dumps(
            update_data["projects"]
        )

    if "certifications" in update_data:
        resume.certifications = json.dumps(
            update_data["certifications"]
        )

    if "achievements" in update_data:
        resume.achievements = json.dumps(
            update_data["achievements"]
        )

    db.commit()
    db.refresh(resume)

    return serialize_resume(resume)


@router.delete(
    "/{resume_id}"
)
def delete_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    resume = (
        db.query(ResumeBuilder)
        .filter(
            ResumeBuilder.id == resume_id,
            ResumeBuilder.user_id == current_user.id,
        )
        .first()
    )

    if not resume:
        raise HTTPException(
            status_code=404,
            detail="Resume not found"
        )

    db.delete(resume)
    db.commit()

    return {
        "message": "Resume deleted successfully"
    }