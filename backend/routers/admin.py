from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.database import get_db
from models.user import User
from utils.dependencies import require_admin


router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)


@router.get("/me")
def get_admin_profile(
    current_admin: User = Depends(require_admin),
):
    return {
        "success": True,
        "admin": {
            "id": current_admin.id,
            "name": current_admin.name,
            "email": current_admin.email,
            "role": current_admin.role,
        },
    }


@router.get("/dashboard")
def admin_dashboard(
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    total_users = db.query(User).count()

    active_users = (
        db.query(User)
        .filter(User.is_active == True)
        .count()
    )

    admin_users = (
        db.query(User)
        .filter(User.role == "admin")
        .count()
    )

    return {
        "success": True,
        "message": "Admin dashboard",
        "admin": {
            "id": current_admin.id,
            "name": current_admin.name,
            "email": current_admin.email,
        },
        "statistics": {
            "total_users": total_users,
            "active_users": active_users,
            "admin_users": admin_users,
        },
    }