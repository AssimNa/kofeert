from sqlalchemy import Column, Integer, ForeignKey, Text, Enum, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum

class StatutAnomalieEnum(str, enum.Enum):
    ouverte = "ouverte"
    en_cours = "en_cours"
    cloturee = "cloturee"

class Anomalie(Base):
    __tablename__ = "anomalies"

    id = Column(Integer, primary_key=True, index=True)
    inspection_id = Column(Integer, ForeignKey("inspections.id"))
    item_id = Column(Integer, ForeignKey("items.id"))
    resultat_id = Column(Integer, ForeignKey("resultats.id"))
    statut = Column(Enum(StatutAnomalieEnum), default=StatutAnomalieEnum.ouverte)
    assigne_a = Column(Integer, ForeignKey("users.id"), nullable=True)
    description_action = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    closed_at = Column(DateTime(timezone=True), nullable=True)

    inspection = relationship("Inspection")
    item = relationship("Item")
    assigne_a_user = relationship("User", foreign_keys=[assigne_a])
