from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)
from sqlalchemy.orm import Session

from database.database import get_db
from models.notification import Notification
from schemas.notification import (
    NotificationCreate,
    NotificationResponse,
    NotificationReadResponse,
    NotificationSummary,
)
from utils.dependencies import get_current_user


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
)


# ============================================================
# CREATE NOTIFICATION
# ============================================================

@router.post(
    "",
    response_model=NotificationResponse,
)
def create_notification(
    data: NotificationCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # Only allow users to create notifications for themselves.
    if current_user.id != data.user_id:
        raise HTTPException(
            status_code=403,
            detail="You can only create notifications for yourself",
        )

    notification = Notification(
        user_id=data.user_id,
        title=data.title,
        message=data.message,
        notification_type=data.notification_type,
        related_id=data.related_id,
        is_read=False,
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    return notification


# ============================================================
# GET MY NOTIFICATIONS
# ============================================================

@router.get(
    "/my",
    response_model=list[NotificationResponse],
)
def get_my_notifications(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return (
        db.query(Notification)
        .filter(
            Notification.user_id == current_user.id
        )
        .order_by(
            Notification.created_at.desc()
        )
        .all()
    )


# ============================================================
# NOTIFICATION SUMMARY
# ============================================================

@router.get(
    "/summary",
    response_model=NotificationSummary,
)
def get_notification_summary(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    total = (
        db.query(Notification)
        .filter(
            Notification.user_id == current_user.id
        )
        .count()
    )

    unread = (
        db.query(Notification)
        .filter(
            Notification.user_id == current_user.id,
            Notification.is_read.is_(False),
        )
        .count()
    )

    return NotificationSummary(
        total=total,
        unread=unread,
    )


# ============================================================
# MARK ALL AS READ
# IMPORTANT: BEFORE /{notification_id}
# ============================================================

@router.patch(
    "/read-all",
)
def mark_all_as_read(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    (
        db.query(Notification)
        .filter(
            Notification.user_id == current_user.id,
            Notification.is_read.is_(False),
        )
        .update(
            {
                Notification.is_read: True
            },
            synchronize_session=False,
        )
    )

    db.commit()

    return {
        "success": True,
        "message": "All notifications marked as read",
    }


# ============================================================
# MARK SINGLE NOTIFICATION AS READ
# ============================================================

@router.patch(
    "/{notification_id}/read",
    response_model=NotificationReadResponse,
)
def mark_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.user_id == current_user.id,
        )
        .first()
    )

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found",
        )

    notification.is_read = True

    db.commit()
    db.refresh(notification)

    return NotificationReadResponse(
        success=True,
        message="Notification marked as read",
        notification_id=notification.id,
    )


# ============================================================
# DELETE NOTIFICATION
# ============================================================

@router.delete(
    "/{notification_id}",
)
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.user_id == current_user.id,
        )
        .first()
    )

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found",
        )

    db.delete(notification)
    db.commit()

    return {
        "success": True,
        "message": "Notification deleted successfully",
    }