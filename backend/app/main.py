from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import Base, engine
from app.models import User, Application
from app.routers.auth import router as auth_router
from app.routers.applications import router as applications_router
from app.routers.analytics import router as analytics_router
from app.routers.documents import router as documents_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="ApplyTrack API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(applications_router)
app.include_router(analytics_router)
app.include_router(documents_router)


@app.get("/")
def read_root():
    return {"message": "ApplyTrack backend is running"}


@app.get("/health")
def health_check():
    return {"status": "ok"}