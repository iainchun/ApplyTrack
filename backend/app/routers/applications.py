from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.application import Application
from app.models.user import User
from app.schemas.application import (
    ApplicationCreate,
    ApplicationResponse,
    ApplicationUpdate,
)

router = APIRouter(prefix="/applications", tags=["applications"])
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


def get_user_application_or_404(
    application_id: UUID,
    current_user: User,
    db: Session,
) -> Application:
    application = (
        db.query(Application)
        .filter(
            Application.id == application_id,
            Application.user_id == current_user.id,
        )
        .first()
    )

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    return application


@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_application(
    application_data: ApplicationCreate,
    current_user: User = Depends(get_current_user_from_token),
    db: Session = Depends(get_db),
):
    new_application = Application(
        user_id=current_user.id,
        company_name=application_data.company_name,
        role_title=application_data.role_title,
        status=application_data.status,
        location=application_data.location,
        work_mode=application_data.work_mode,
        source=application_data.source,
        job_url=str(application_data.job_url) if application_data.job_url else None,
        salary_min=application_data.salary_min,
        salary_max=application_data.salary_max,
        application_date=application_data.application_date,
        deadline_date=application_data.deadline_date,
        response_date=application_data.response_date,
        jd_text=application_data.jd_text,
        notes=application_data.notes,
    )

    db.add(new_application)
    db.commit()
    db.refresh(new_application)

    return new_application


@router.get("", response_model=list[ApplicationResponse])
def list_applications(
    status_filter: str | None = Query(default=None, alias="status"),
    current_user: User = Depends(get_current_user_from_token),
    db: Session = Depends(get_db),
):
    query = db.query(Application).filter(Application.user_id == current_user.id)

    if status_filter:
        query = query.filter(Application.status == status_filter)

    applications = query.order_by(Application.created_at.desc()).all()
    return applications


@router.get("/{application_id}", response_model=ApplicationResponse)
def get_application(
    application_id: UUID,
    current_user: User = Depends(get_current_user_from_token),
    db: Session = Depends(get_db),
):
    application = get_user_application_or_404(application_id, current_user, db)
    return application


@router.put("/{application_id}", response_model=ApplicationResponse)
def update_application(
    application_id: UUID,
    application_data: ApplicationUpdate,
    current_user: User = Depends(get_current_user_from_token),
    db: Session = Depends(get_db),
):
    application = get_user_application_or_404(application_id, current_user, db)

    update_data = application_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        if field == "job_url" and value is not None:
            setattr(application, field, str(value))
        else:
            setattr(application, field, value)

    db.commit()
    db.refresh(application)

    return application


@router.delete("/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_application(
    application_id: UUID,
    current_user: User = Depends(get_current_user_from_token),
    db: Session = Depends(get_db),
):
    application = get_user_application_or_404(application_id, current_user, db)

    db.delete(application)
    db.commit()

    return None