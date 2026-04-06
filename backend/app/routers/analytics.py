from collections import Counter
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.application import Application
from app.models.user import User

router = APIRouter(prefix="/analytics", tags=["analytics"])
security = HTTPBearer()


def get_current_user_from_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    token = credentials.credentials

    try:
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
            )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user


@router.get("/summary")
def get_summary(
    current_user: User = Depends(get_current_user_from_token),
    db: Session = Depends(get_db),
):
    applications = (
        db.query(Application)
        .filter(Application.user_id == current_user.id)
        .all()
    )

    total = len(applications)
    interviews = len([a for a in applications if a.status in ["interview", "final_interview"]])
    offers = len([a for a in applications if a.status == "offer"])
    rejected = len([a for a in applications if a.status == "rejected"])

    response_rate = round((interviews / total) * 100, 2) if total else 0
    offer_rate = round((offers / total) * 100, 2) if total else 0

    return {
        "total_applications": total,
        "interviews": interviews,
        "offers": offers,
        "rejected": rejected,
        "response_rate": response_rate,
        "offer_rate": offer_rate,
    }


@router.get("/status-distribution")
def get_status_distribution(
    current_user: User = Depends(get_current_user_from_token),
    db: Session = Depends(get_db),
):
    applications = (
        db.query(Application)
        .filter(Application.user_id == current_user.id)
        .all()
    )

    counts = Counter(a.status for a in applications)

    return [
        {"status": status, "count": count}
        for status, count in counts.items()
    ]


@router.get("/recent-applications")
def get_recent_applications(
    current_user: User = Depends(get_current_user_from_token),
    db: Session = Depends(get_db),
):
    applications = (
        db.query(Application)
        .filter(Application.user_id == current_user.id)
        .order_by(Application.created_at.desc())
        .limit(5)
        .all()
    )

    return [
        {
            "id": str(a.id),
            "company_name": a.company_name,
            "role_title": a.role_title,
            "status": a.status,
            "location": a.location,
            "created_at": a.created_at,
        }
        for a in applications
    ]