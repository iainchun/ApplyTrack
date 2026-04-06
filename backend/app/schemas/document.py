from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class DocumentCreate(BaseModel):
    document_type: str
    version_name: str
    file_url: Optional[str] = None
    tags: Optional[str] = None


class DocumentUpdate(BaseModel):
    document_type: Optional[str] = None
    version_name: Optional[str] = None
    file_url: Optional[str] = None
    tags: Optional[str] = None


class DocumentResponse(BaseModel):
    id: UUID
    user_id: UUID
    document_type: str
    version_name: str
    file_url: Optional[str] = None
    tags: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = {
        "from_attributes": True
    }


class DocumentLinkRequest(BaseModel):
    document_version_ids: list[UUID]