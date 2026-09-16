from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.database import get_db
from models.user import User
from models.career_profile import CareerProfile
from models.resume import Resume
from models.skill_gap import SkillGapAnalysis
from models.career_path import CareerPathRecommendation
from models.learning_roadmap import LearningRoadmap
from models.career_score import CareerScore
from models.career_report import CareerReport

from schemas.career_report import CareerReportResponse

from services.career_report_engine import generate_report_sections

from utils.dependencies import get_current_user


router = APIRouter(
    prefix="/career-report",
    tags=["Career Report"],
)


@router.post(
    "/generate",
    response_model=CareerReportResponse,
)
def generate_career_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    profile = (
        db.query(CareerProfile)
        .filter(
            CareerProfile.user_id == current_user.id
        )
        .first()
    )

    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Career profile not found. "
                "Please create your Career Profile first."
            ),
        )

    target_role = profile.target_role

    if not target_role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Target role is required. "
                "Please set your target role in Career Profile."
            ),
        )

    resume = (
        db.query(Resume)
        .filter(
            Resume.user_id == current_user.id
        )
        .order_by(
            Resume.created_at.desc()
        )
        .first()
    )

    skill_gap = (
        db.query(SkillGapAnalysis)
        .filter(
            SkillGapAnalysis.user_id == current_user.id
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

    career_score = (
        db.query(CareerScore)
        .filter(
            CareerScore.user_id
            == current_user.id
        )
        .first()
    )

    sections = generate_report_sections(
        profile=profile,
        resume=resume,
        skill_gap=skill_gap,
        career_path=career_path,
        roadmap=roadmap,
        career_score=career_score,
    )

    report = (
        db.query(CareerReport)
        .filter(
            CareerReport.user_id
            == current_user.id
        )
        .first()
    )

    if report is None:

        report = CareerReport(
            user_id=current_user.id,
            target_role=sections["target_role"],
            overall_score=sections["overall_score"],
            executive_summary=sections["executive_summary"],
            career_profile=sections["career_profile"],
            resume_analysis=sections["resume_analysis"],
            skills_analysis=sections["skills_analysis"],
            skill_gap_analysis=sections["skill_gap_analysis"],
            career_path=sections["career_path"],
            learning_roadmap=sections["learning_roadmap"],
            job_readiness=sections["job_readiness"],
            strengths=sections["strengths"],
            areas_to_improve=sections["areas_to_improve"],
            short_term_goals=sections["short_term_goals"],
            long_term_goals=sections["long_term_goals"],
            recommendations=sections["recommendations"],
            report_data=sections["report_data"],
        )

        db.add(report)

    else:

        report.target_role = sections["target_role"]
        report.overall_score = sections["overall_score"]
        report.executive_summary = sections["executive_summary"]
        report.career_profile = sections["career_profile"]
        report.resume_analysis = sections["resume_analysis"]
        report.skills_analysis = sections["skills_analysis"]
        report.skill_gap_analysis = sections["skill_gap_analysis"]
        report.career_path = sections["career_path"]
        report.learning_roadmap = sections["learning_roadmap"]
        report.job_readiness = sections["job_readiness"]
        report.strengths = sections["strengths"]
        report.areas_to_improve = sections["areas_to_improve"]
        report.short_term_goals = sections["short_term_goals"]
        report.long_term_goals = sections["long_term_goals"]
        report.recommendations = sections["recommendations"]
        report.report_data = sections["report_data"]

    db.commit()
    db.refresh(report)

    return report


@router.get(
    "/my",
    response_model=CareerReportResponse,
)
def get_my_career_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    report = (
        db.query(CareerReport)
        .filter(
            CareerReport.user_id
            == current_user.id
        )
        .first()
    )

    if report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Career report not found.",
        )

    return report


@router.get(
    "/{report_id}",
    response_model=CareerReportResponse,
)
def get_career_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    report = (
        db.query(CareerReport)
        .filter(
            CareerReport.id == report_id,
            CareerReport.user_id == current_user.id,
        )
        .first()
    )

    if report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Career report not found.",
        )

    return report


@router.delete(
    "/{report_id}"
)
def delete_career_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    report = (
        db.query(CareerReport)
        .filter(
            CareerReport.id == report_id,
            CareerReport.user_id == current_user.id,
        )
        .first()
    )

    if report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Career report not found.",
        )

    db.delete(report)
    db.commit()

    return {
        "success": True,
        "message": "Career report deleted successfully.",
    }