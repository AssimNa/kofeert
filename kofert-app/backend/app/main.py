from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, fiches, inspections, anomalies, admin

from fastapi.staticfiles import StaticFiles
import os

app = FastAPI(title="Kofert API", description="API pour l'application d'inspection Kofert", version="1.0.0")

# Mount uploads directory
os.makedirs("uploads/profiles", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
        "http://localhost:8081",
        "http://127.0.0.1:8081",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(fiches.router)
app.include_router(inspections.router)
app.include_router(anomalies.router)
app.include_router(admin.router)

@app.get("/")
def read_root():
    return {"message": "Bienvenue sur l'API Kofert"}
