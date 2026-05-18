from sqlalchemy import Column, Integer, Boolean, ForeignKey, DateTime, Enum, Date
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
