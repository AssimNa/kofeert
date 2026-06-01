from sqlalchemy import Column, Integer, String, Boolean, Enum, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum

class RoleEnum(str, enum.Enum):
    admin = "admin"
    superviseur = "superviseur"
    technicien = "technicien"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(100))
    prenom = Column(String(100))
    email = Column(String(150), unique=True, index=True)
    password_hash = Column(String(255))
    telephone = Column(String(50), nullable=True)
    adresse = Column(String(255), nullable=True)
    ville = Column(String(100), nullable=True)
    photo_profil = Column(String(255), nullable=True)
    role = Column(Enum(RoleEnum), nullable=False)
    actif = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    inspections = relationship("Inspection", back_populates="technicien")
    equipements = relationship("Equipement", back_populates="superviseur")
