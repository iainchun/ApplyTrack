from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.application import Application
from app.models.document import ApplicationDocument, DocumentVersion
from app.models.user import User
from app.schemas.document import (
    DocumentCreate,
    DocumentLinkRequest,
    DocumentResponse,
    DocumentUpdate,
)

router = APIRouter(tags=["documents"])
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


@router.post("/documents", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
def create_document(
    document_data: DocumentCreate,
    current_user: User = Depends(get_current_user_from_token),
    db: Session = Depends(get_db),
):
    new_document = DocumentVersion(
        user_id=current_user.id,
        document_type=document_data.document_type,
        version_name=document_data.version_name,
        file_url=document_data.file_url,
        tags=document_data.tags,
    )

    db.add(new_document)
    db.commit()
    db.refresh(new_document)

    return new_document


@router.get("/documents", response_model=list[DocumentResponse])
def list_documents(
    current_user: User = Depends(get_current_user_from_token),
    db: Session = Depends(get_db),
):
    documents = (
        db.query(DocumentVersion)
        .filter(DocumentVersion.user_id == current_user.id)
        .order_by(DocumentVersion.created_at.desc())
        .all()
    )
    return documents


@router.get("/documents/{document_id}", response_model=DocumentResponse)
def get_document(
    document_id: UUID,
    current_user: User = Depends(get_current_user_from_token),
    db: Session = Depends(get_db),
):
    document = (
        db.query(DocumentVersion)
        .filter(
            DocumentVersion.id == document_id,
            DocumentVersion.user_id == current_user.id,
        )
        .first()
    )

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )

    return document


@router.put("/documents/{document_id}", response_model=DocumentResponse)
def update_document(
    document_id: UUID,
    document_data: DocumentUpdate,
    current_user: User = Depends(get_current_user_from_token),
    db: Session = Depends(get_db),
):
    document = (
        db.query(DocumentVersion)
        .filter(
            DocumentVersion.id == document_id,
            DocumentVersion.user_id == current_user.id,
        )
        .first()
    )

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )

    update_data = document_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(document, field, value)

    db.commit()
    db.refresh(document)

    return document


@router.delete("/documents/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    document_id: UUID,
    current_user: User = Depends(get_current_user_from_token),
    db: Session = Depends(get_db),
):
    document = (
        db.query(DocumentVersion)
        .filter(
            DocumentVersion.id == document_id,
            DocumentVersion.user_id == current_user.id,
        )
        .first()
    )

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )

    db.delete(document)
    db.commit()

    return None


@router.post("/applications/{application_id}/documents", status_code=status.HTTP_201_CREATED)
def link_documents_to_application(
    application_id: UUID,
    payload: DocumentLinkRequest,
    current_user: User = Depends(get_current_user_from_token),
    db: Session = Depends(get_db),
):
    application = get_user_application_or_404(application_id, current_user, db)

    existing_links = (
        db.query(ApplicationDocument)
        .filter(ApplicationDocument.application_id == application.id)
        .all()
    )

    for link in existing_links:
        db.delete(link)

    documents = (
        db.query(DocumentVersion)
        .filter(
            DocumentVersion.user_id == current_user.id,
            DocumentVersion.id.in_(payload.document_version_ids),
        )
        .all()
    )

    if len(documents) != len(payload.document_version_ids):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="One or more documents are invalid",
        )

    for document in documents:
        new_link = ApplicationDocument(
            application_id=application.id,
            document_version_id=document.id,
        )
        db.add(new_link)

    db.commit()

    return {"message": "Documents linked successfully"}


@router.get("/applications/{application_id}/documents", response_model=list[DocumentResponse])
def get_application_documents(
    application_id: UUID,
    current_user: User = Depends(get_current_user_from_token),
    db: Session = Depends(get_db),
):
    application = get_user_application_or_404(application_id, current_user, db)

    linked_documents = (
        db.query(DocumentVersion)
        .join(ApplicationDocument, ApplicationDocument.document_version_id == DocumentVersion.id)
        .filter(ApplicationDocument.application_id == application.id)
        .order_by(DocumentVersion.created_at.desc())
        .all()
    )

    return linked_documents