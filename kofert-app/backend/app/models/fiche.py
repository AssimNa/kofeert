from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class FicheTemplate(Base):
    __tablename__ = "fiches_template"

    id = Column(Integer, primary_key=True, index=True)
    equipement_id = Column(Integer, ForeignKey("equipements.id"))
    nom = Column(String(200))
    reference = Column(String(100))
    version = Column(Integer, default=1)
    actif = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    sections = relationship("Section", back_populates="fiche")
    equipement = relationship("Equipement", back_populates="fiches")
    inspections = relationship("Inspection", back_populates="fiche_template")
