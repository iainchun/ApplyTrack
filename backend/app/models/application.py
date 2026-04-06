import uuid
from sqlalchemy import Column, String, Date, DateTime, ForeignKey, Text, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base


class Application(Base):
    __tablename__ = "applications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    company_name = Column(String(255), nullable=False)
    role_title = Column(String(255), nullable=False)
    status = Column(String(50), nullable=False, default="planned")
    location = Column(String(255), nullable=True)
    work_mode = Column(String(50), nullable=True)
    source = Column(String(100), nullable=True)
    job_url = Column(Text, nullable=True)
    salary_min = Column(Integer, nullable=True)
    salary_max = Column(Integer, nullable=True)
    application_date = Column(Date, nullable=True)
    deadline_date = Column(Date, nullable=True)
    response_date = Column(Date, nullable=True)
    jd_text = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="applications")
    document_links = relationship(
        "ApplicationDocument",
        back_populates="application",
        cascade="all, delete-orphan",
    )