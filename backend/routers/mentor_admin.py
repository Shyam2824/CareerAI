from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.database import get_db
from models.mentor import Mentor
from models.user import User
from schemas.mentor import MentorResponse
from utils.dependencies import require_admin

router = APIRouter(prefix="/admin/mentors", tags=["Admin - Mentors"])


def _get_mentor(db: Session, mentor_id: int) -> Mentor:
    mentor = db.query(Mentor).filter(Mentor.id == mentor_id).first()
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found.")
    return mentor


@router.get("", response_model=list[MentorResponse])
def list_mentors(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return db.query(Mentor).order_by(Mentor.created_at.desc()).all()


@router.get("/stats/summary")
def mentor_stats(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    total = db.query(Mentor).count()
    approved = db.query(Mentor).filter(Mentor.is_approved.is_(True)).count()
    active = db.query(Mentor).filter(Mentor.is_active.is_(True)).count()
    return {
        "total": total,
        "approved": approved,
        "pending": total - approved,
        "active": active,
        "inactive": total - active,
    }


@router.post("/{mentor_id}/approve", response_model=MentorResponse)
def approve_mentor(
    mentor_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    mentor = _get_mentor(db, mentor_id)
    mentor.is_approved = True
    mentor.is_active = True
    db.commit()
    db.refresh(mentor)
    return mentor


@router.post("/{mentor_id}/reject", response_model=MentorResponse)
def reject_mentor(
    mentor_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    mentor = _get_mentor(db, mentor_id)
    mentor.is_approved = False
    mentor.is_active = False
    db.commit()
    db.refresh(mentor)
    return mentor


@router.post("/{mentor_id}/activate", response_model=MentorResponse)
def activate_mentor(
    mentor_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    mentor = _get_mentor(db, mentor_id)
    if not mentor.is_approved:
        raise HTTPException(status_code=400, detail="Approve the mentor before activating them.")
    mentor.is_active = True
    db.commit()
    db.refresh(mentor)
    return mentor


@router.post("/{mentor_id}/deactivate", response_model=MentorResponse)
def deactivate_mentor(
    mentor_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    mentor = _get_mentor(db, mentor_id)
    mentor.is_active = False
    db.commit()
    db.refresh(mentor)
    return mentor


@router.delete("/{mentor_id}")
def delete_mentor(
    mentor_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    mentor = _get_mentor(db, mentor_id)
    db.delete(mentor)
    db.commit()
    return {"success": True, "message": "Mentor deleted successfully."}
