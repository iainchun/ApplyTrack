from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, HttpUrl


class ApplicationCreate(BaseModel):
    company_name: str
    role_title: str
    status: str = "planned"
    location: Optional[str] = None
    work_mode: Optional[str] = None
    source: Optional[str] = None
    job_url: Optional[HttpUrl] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    application_date: Optional[date] = None
    deadline_date: Optional[date] = None
    response_date: Optional[date] = None
    jd_text: Optional[str] = None
    notes: Optional[str] = None


class ApplicationUpdate(BaseModel):
    company_name: Optional[str] = None
    role_title: Optional[str] = None
    status: Optional[str] = None
    location: Optional[str] = None
    work_mode: Optional[str] = None
    source: Optional[str] = None
    job_url: Optional[HttpUrl] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    application_date: Optional[date] = None
    deadline_date: Optional[date] = None
    response_date: Optional[date] = None
    jd_text: Optional[str] = None
    notes: Optional[str] = None


class ApplicationResponse(BaseModel):
    id: UUID
    user_id: UUID
    company_name: str
    role_title: str
    status: str
    location: Optional[str] = None
    work_mode: Optional[str] = None
    source: Optional[str] = None
    job_url: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    application_date: Optional[date] = None
    deadline_date: Optional[date] = None
    response_date: Optional[date] = None
    jd_text: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {
        "from_attributes": True
    }