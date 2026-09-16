import secrets
from pathlib import Path

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    Request,
    UploadFile,
)
from sqlalchemy.orm import Session

from database.database import get_db
from models.mentor import Mentor
from models.user import User
from schemas.mentor import (
    MentorCreate,
    MentorResponse,
    MentorUpdate,
)
from utils.dependencies import get_current_user


router = APIRouter(
    prefix="/mentors",
    tags=["Mentors"],
)


MAX_PHOTO_SIZE = 5 * 1024 * 1024

ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}


def get_photo_directory() -> Path:
    directory = Path("uploads") / "mentors"
    directory.mkdir(
        parents=True,
        exist_ok=True,
    )
    return directory


def get_mentor(
    db: Session,
    mentor_id: int,
):
    return (
        db.query(Mentor)
        .filter(Mentor.id == mentor_id)
        .first()
    )


def get_my_mentor(
    db: Session,
    user_id: int,
):
    return (
        db.query(Mentor)
        .filter(Mentor.user_id == user_id)
        .first()
    )


# =========================================================
# CREATE / ONBOARDING
# =========================================================

@router.post(
    "/onboarding",
    response_model=MentorResponse,
    status_code=201,
)
def create_mentor_profile(
    data: MentorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = get_my_mentor(
        db,
        current_user.id,
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Mentor profile already exists.",
        )

    mentor = Mentor(
        user_id=current_user.id,
        title=data.title.strip(),
        company=data.company.strip(),
        experience=data.experience.strip(),
        education=data.education.strip(),
        bio=data.bio.strip(),
        skills=data.skills.strip(),
        linkedin=(
            str(data.linkedin)
            if data.linkedin
            else None
        ),
        price=data.price,
        is_approved=False,
        is_active=True,
        rating=0,
        total_reviews=0,
    )

    db.add(mentor)
    db.commit()
    db.refresh(mentor)

    return mentor


# =========================================================
# GET MY PROFILE
# =========================================================

@router.get(
    "/me",
    response_model=MentorResponse,
)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    mentor = get_my_mentor(
        db,
        current_user.id,
    )

    if not mentor:
        raise HTTPException(
            status_code=404,
            detail=(
                "Mentor profile not found. "
                "Please complete mentor onboarding first."
            ),
        )

    return mentor


# =========================================================
# UPDATE MY PROFILE
# =========================================================

@router.put(
    "/me",
    response_model=MentorResponse,
)
def update_my_profile(
    data: MentorUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    mentor = get_my_mentor(
        db,
        current_user.id,
    )

    if not mentor:
        raise HTTPException(
            status_code=404,
            detail="Mentor profile not found.",
        )

    update_data = data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():

        if isinstance(value, str):
            value = value.strip()

        if field == "linkedin" and value:
            value = str(value)

        setattr(
            mentor,
            field,
            value,
        )

    db.commit()
    db.refresh(mentor)

    return mentor


# =========================================================
# UPLOAD PROFILE PHOTO
# =========================================================

@router.post(
    "/me/photo",
    response_model=MentorResponse,
)
async def upload_my_photo(
    request: Request,
    photo: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    mentor = get_my_mentor(
        db,
        current_user.id,
    )

    if not mentor:
        raise HTTPException(
            status_code=404,
            detail=(
                "Mentor profile not found. "
                "Please complete mentor onboarding first."
            ),
        )

    extension = ALLOWED_IMAGE_TYPES.get(
        photo.content_type or ""
    )

    if not extension:
        raise HTTPException(
            status_code=400,
            detail=(
                "Only JPG, PNG and WEBP "
                "images are allowed."
            ),
        )

    data = await photo.read()

    if not data:
        raise HTTPException(
            status_code=400,
            detail="The uploaded image is empty.",
        )

    if len(data) > MAX_PHOTO_SIZE:
        raise HTTPException(
            status_code=413,
            detail=(
                "Profile photo must be "
                "5 MB or smaller."
            ),
        )

    filename = (
        f"{current_user.id}_"
        f"{secrets.token_hex(12)}"
        f"{extension}"
    )

    directory = get_photo_directory()
    destination = directory / filename

    destination.write_bytes(data)

    # Delete old photo if it belongs to uploads
    if mentor.photo_url:
        old_filename = mentor.photo_url.split("/")[-1]

        old_file = directory / old_filename

        if old_file.exists():
            try:
                old_file.unlink()
            except OSError:
                pass

    mentor.photo_url = (
        f"{str(request.base_url).rstrip('/')}"
        f"/uploads/mentors/{filename}"
    )

    db.commit()
    db.refresh(mentor)

    return mentor


# =========================================================
# DELETE PROFILE PHOTO
# =========================================================

@router.delete(
    "/me/photo",
    response_model=MentorResponse,
)
def delete_my_photo(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    mentor = get_my_mentor(
        db,
        current_user.id,
    )

    if not mentor:
        raise HTTPException(
            status_code=404,
            detail="Mentor profile not found.",
        )

    if mentor.photo_url:
        directory = get_photo_directory()

        filename = mentor.photo_url.split("/")[-1]

        old_file = directory / filename

        if old_file.exists():
            try:
                old_file.unlink()
            except OSError:
                pass

    mentor.photo_url = None

    db.commit()
    db.refresh(mentor)

    return mentor


# =========================================================
# PUBLIC MENTOR LIST
# =========================================================

@router.get(
    "/",
    response_model=list[MentorResponse],
)
def list_mentors(
    search: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    sort: str = "rating",
    db: Session = Depends(get_db),
):
    query = (
        db.query(Mentor)
        .filter(
            Mentor.is_active.is_(True),
            Mentor.is_approved.is_(True),
        )
    )

    if search:
        search = search.strip()

        if len(search) > 100:
            raise HTTPException(
                status_code=400,
                detail="Search query is too long.",
            )

        pattern = f"%{search}%"

        query = query.filter(
            Mentor.title.ilike(pattern)
            | Mentor.company.ilike(pattern)
            | Mentor.skills.ilike(pattern)
        )

    if min_price is not None:

        if min_price < 0:
            raise HTTPException(
                status_code=400,
                detail="Minimum price cannot be negative.",
            )

        query = query.filter(
            Mentor.price >= min_price
        )

    if max_price is not None:

        if max_price < 0:
            raise HTTPException(
                status_code=400,
                detail="Maximum price cannot be negative.",
            )

        query = query.filter(
            Mentor.price <= max_price
        )

    if (
        min_price is not None
        and max_price is not None
        and min_price > max_price
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Minimum price cannot be greater "
                "than maximum price."
            ),
        )

    if sort == "rating":
        query = query.order_by(
            Mentor.rating.desc()
        )

    elif sort == "price_low":
        query = query.order_by(
            Mentor.price.asc()
        )

    elif sort == "price_high":
        query = query.order_by(
            Mentor.price.desc()
        )

    elif sort == "reviews":
        query = query.order_by(
            Mentor.total_reviews.desc()
        )

    else:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid sort option. "
                "Use rating, price_low, "
                "price_high or reviews."
            ),
        )

    return query.all()


# =========================================================
# PUBLIC MENTOR DETAILS
# =========================================================

@router.get(
    "/{mentor_id}",
    response_model=MentorResponse,
)
def get_public_mentor(
    mentor_id: int,
    db: Session = Depends(get_db),
):
    mentor = get_mentor(
        db,
        mentor_id,
    )

    if not mentor:
        raise HTTPException(
            status_code=404,
            detail="Mentor not found.",
        )

    if not mentor.is_active:
        raise HTTPException(
            status_code=404,
            detail="Mentor is not currently available.",
        )

    if not mentor.is_approved:
        raise HTTPException(
            status_code=404,
            detail="Mentor profile is not publicly available.",
        )

    return mentor