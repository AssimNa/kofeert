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
    allow_origins=["*"],
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
