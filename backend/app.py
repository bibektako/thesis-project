from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from config import ALLOWED_ORIGINS
from db import connect_db, close_db
from routers import auth, challenges, submissions, admin, leaderboard, trek_sessions

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_db()
    yield
    # Shutdown
    await close_db()

app = FastAPI(
    title="Trek Challenge Verification System",
    description="Local-only OCR, GPS & AI verification system",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(challenges.router)
app.include_router(submissions.router)
app.include_router(admin.router)
app.include_router(leaderboard.router)
app.include_router(trek_sessions.router)

@app.get("/")
async def root():
    return {"message": "Trek Challenge Verification API", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

