from fastapi import APIRouter, Depends

from models.user import User
from utils.dependencies import get_current_user
from utils.permissions import require_admin, require_mentor


router = APIRouter(
    prefix="/protected",
    tags=["Protected Routes"]
)


@router.get("/user")
def user_dashboard(
    current_user: User = Depends(get_current_user)
):
    return {
        "message": f"Welcome {current_user.full_name}",
        "role": current_user.role,
        "email": current_user.email
    }


@router.get("/admin")
def admin_dashboard(
    current_user: User = Depends(require_admin)
):
    return {
        "message": "Welcome Admin",
        "user": current_user.full_name
    }


@router.get("/mentor")
def mentor_dashboard(
    current_user: User = Depends(require_mentor)
):
    return {
        "message": "Welcome Mentor",
        "user": current_user.full_name
    }