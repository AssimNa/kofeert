from sqlalchemy import Column, Integer, Boolean, ForeignKey, DateTime, Enum, Date, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class StatutInspectionEnum(str, enum.Enum):
    brouillon = "brouillon"
    soumise = "soumise"

class Inspection(Base):
    __tablename__ = "inspections"

    id = Column(Integer, primary_key=True, index=True)
    fiche_template_id = Column(Integer, ForeignKey("fiches_template.id"))
    technicien_id = Column(Integer, ForeignKey("users.id"))
    date_inspection = Column(Date)
    statut = Column(Enum(StatutInspectionEnum), default=StatutInspectionEnum.brouillon)
    soumis_le = Column(DateTime(timezone=True), nullable=True)
    synced = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    fiche_template = relationship("FicheTemplate", back_populates="inspections")
    technicien = relationship("User", back_populates="inspections")
    resultats = relationship("Resultat", back_populates="inspection")
    history = relationship("InspectionHistory", back_populates="inspection")

class InspectionHistory(Base):
    __tablename__ = "inspection_history"

    id = Column(Integer, primary_key=True, index=True)
    inspection_id = Column(Integer, ForeignKey("inspections.id"))
    modified_at = Column(DateTime(timezone=True), server_default=func.now())
    modified_by_id = Column(Integer, ForeignKey("users.id"))
    data = Column(JSON) # Store a JSON snapshot of the results before modification

    inspection = relationship("Inspection", back_populates="history")
