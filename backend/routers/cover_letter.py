from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.database import get_db
from models.user import User
from models.resume import Resume
from models.cover_letter import CoverLetter

from schemas.cover_letter import (
    CoverLetterCreate,
    CoverLetterUpdate,
    CoverLetterResponse,
    CoverLetterHistoryResponse,
)

from utils.dependencies import get_current_user

from services.cover_letter_engine import (
    generate_cover_letter,
    analyze_resume_against_job,
)
from fastapi.responses import StreamingResponse

from services.cover_letter_export import (
    create_cover_letter_pdf,
    create_cover_letter_docx,
)



router = APIRouter(
    prefix="/cover-letter",
    tags=["Cover Letter"],
)


# ============================================================
# GENERATE COVER LETTER
# ============================================================

@router.post(
    "/generate",
    response_model=CoverLetterResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_cover_letter(
    request: CoverLetterCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    resume = None

    # --------------------------------------------------------
    # FIND USER RESUME
    # --------------------------------------------------------

    if request.resume_id:

        resume = (
            db.query(Resume)
            .filter(
                Resume.id == request.resume_id,
                Resume.user_id == current_user.id,
            )
            .first()
        )

        if not resume:
            raise HTTPException(
                status_code=404,
                detail="Resume not found.",
            )

    # --------------------------------------------------------
    # GET RESUME TEXT
    # --------------------------------------------------------

    resume_text = ""

    if resume:
        resume_text = resume.extracted_text or ""

    job_description = (
        request.job_description or ""
    )

    # --------------------------------------------------------
    # VALIDATION
    # --------------------------------------------------------

    if not resume_text.strip() and not job_description.strip():
        raise HTTPException(
            status_code=400,
            detail=(
                "Resume or job description is required."
            ),
        )

    # --------------------------------------------------------
    # GENERATE
    # --------------------------------------------------------

    content = generate_cover_letter(
        resume_text=resume_text,
        job_description=job_description,
        job_title=request.job_title or "",
        company_name=request.company_name or "",
        tone=request.tone,
    )

    # --------------------------------------------------------
    # SAVE
    # --------------------------------------------------------

    new_cover_letter = CoverLetter(
        user_id=current_user.id,
        resume_id=request.resume_id,
        job_title=request.job_title,
        company_name=request.company_name,
        job_description=request.job_description,
        tone=request.tone,
        content=content,
    )

    try:

        db.add(new_cover_letter)
        db.commit()
        db.refresh(new_cover_letter)

    except Exception as error:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(error)}",
        )

    return new_cover_letter


# ============================================================
# ANALYZE RESUME + JOB DESCRIPTION
# ============================================================

@router.post("/analyze")
def analyze_cover_letter_job(
    request: CoverLetterCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    if not request.resume_id:
        raise HTTPException(
            status_code=400,
            detail="Resume ID is required.",
        )

    if not request.job_description:
        raise HTTPException(
            status_code=400,
            detail="Job description is required.",
        )

    resume = (
        db.query(Resume)
        .filter(
            Resume.id == request.resume_id,
            Resume.user_id == current_user.id,
        )
        .first()
    )

    if not resume:
        raise HTTPException(
            status_code=404,
            detail="Resume not found.",
        )

    resume_text = resume.extracted_text or ""

    if not resume_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Selected resume has no extracted text.",
        )

    result = analyze_resume_against_job(
        resume_text=resume_text,
        job_description=request.job_description,
    )

    return result


# ============================================================
# HISTORY
# ============================================================

@router.get(
    "/history",
    response_model=list[CoverLetterHistoryResponse],
)
def get_cover_letter_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    return (
        db.query(CoverLetter)
        .filter(
            CoverLetter.user_id == current_user.id
        )
        .order_by(
            CoverLetter.created_at.desc()
        )
        .all()
    )
@router.get(
    "/{cover_letter_id}/pdf"
)
def download_cover_letter_pdf(
    cover_letter_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cover_letter = (
        db.query(CoverLetter)
        .filter(
            CoverLetter.id == cover_letter_id,
            CoverLetter.user_id == current_user.id,
        )
        .first()
    )

    if not cover_letter:
        raise HTTPException(
            status_code=404,
            detail="Cover letter not found.",
        )

    pdf_file = create_cover_letter_pdf(
        cover_letter.content
    )

    return StreamingResponse(
        pdf_file,
        media_type="application/pdf",
        headers={
            "Content-Disposition": (
                f'attachment; filename="cover_letter_{cover_letter_id}.pdf"'
            )
        },
    )


@router.get(
    "/{cover_letter_id}/docx"
)
def download_cover_letter_docx(
    cover_letter_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cover_letter = (
        db.query(CoverLetter)
        .filter(
            CoverLetter.id == cover_letter_id,
            CoverLetter.user_id == current_user.id,
        )
        .first()
    )

    if not cover_letter:
        raise HTTPException(
            status_code=404,
            detail="Cover letter not found.",
        )

    docx_file = create_cover_letter_docx(
        cover_letter.content
    )

    return StreamingResponse(
        docx_file,
        media_type=(
            "application/vnd.openxmlformats-officedocument."
            "wordprocessingml.document"
        ),
        headers={
            "Content-Disposition": (
                f'attachment; filename="cover_letter_{cover_letter_id}.docx"'
            )
        },
    )

# ============================================================
# GET SINGLE COVER LETTER
# ============================================================

@router.get(
    "/{cover_letter_id}",
    response_model=CoverLetterResponse,
)
def get_cover_letter(
    cover_letter_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    cover_letter = (
        db.query(CoverLetter)
        .filter(
            CoverLetter.id == cover_letter_id,
            CoverLetter.user_id == current_user.id,
        )
        .first()
    )

    if not cover_letter:
        raise HTTPException(
            status_code=404,
            detail="Cover letter not found.",
        )

    return cover_letter


# ============================================================
# UPDATE
# ============================================================

@router.put(
    "/{cover_letter_id}",
    response_model=CoverLetterResponse,
)
def update_cover_letter(
    cover_letter_id: int,
    request: CoverLetterUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    cover_letter = (
        db.query(CoverLetter)
        .filter(
            CoverLetter.id == cover_letter_id,
            CoverLetter.user_id == current_user.id,
        )
        .first()
    )

    if not cover_letter:
        raise HTTPException(
            status_code=404,
            detail="Cover letter not found.",
        )

    update_data = request.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(
            cover_letter,
            field,
            value,
        )

    try:

        db.commit()
        db.refresh(cover_letter)

    except Exception as error:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(error)}",
        )

    return cover_letter


# ============================================================
# DELETE
# ============================================================

@router.delete(
    "/{cover_letter_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_cover_letter(
    cover_letter_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    cover_letter = (
        db.query(CoverLetter)
        .filter(
            CoverLetter.id == cover_letter_id,
            CoverLetter.user_id == current_user.id,
        )
        .first()
    )

    if not cover_letter:
        raise HTTPException(
            status_code=404,
            detail="Cover letter not found.",
        )

    db.delete(cover_letter)
    db.commit()

    return None