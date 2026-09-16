from fastapi import Depends, HTTPException, status

from models.user import User
from utils.dependencies import get_current_user


def require_admin(
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )

    return current_user


def require_mentor(
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["mentor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Mentor access required"
        )

    return current_user