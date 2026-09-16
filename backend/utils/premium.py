from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from database.database import get_db
from models.user import User
from utils.dependencies import get_current_user
from services.usage_service import is_premium


def require_premium(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not is_premium(
        db,
        current_user.id,
    ):
        raise HTTPException(
            status_code=403,
            detail={
                "code": "PREMIUM_REQUIRED",
                "message": (
                    "This feature requires an active "
                    "Premium membership."
                ),
            },
        )

    return current_user