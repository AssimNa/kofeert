from sqlalchemy import Column, Integer, ForeignKey, Text, Enum, Numeric
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class ResultatEnum(str, enum.Enum):
    conforme = "conforme"
    non_conforme = "non_conforme"

class Resultat(Base):
    __tablename__ = "resultats"

    id = Column(Integer, primary_key=True, index=True)
    inspection_id = Column(Integer, ForeignKey("inspections.id"))
    item_id = Column(Integer, ForeignKey("items.id"))
    resultat = Column(Enum(ResultatEnum))
    remarque = Column(Text, nullable=True)

    inspection = relationship("Inspection", back_populates="resultats")
    item = relationship("Item")
    mesures_valeurs = relationship("MesureValeur", back_populates="resultat")

class MesureValeur(Base):
    __tablename__ = "mesures_valeurs"

    id = Column(Integer, primary_key=True, index=True)
    resultat_id = Column(Integer, ForeignKey("resultats.id"))
    item_mesure_id = Column(Integer, ForeignKey("item_mesures.id"))
    valeur = Column(Numeric(10, 3))

    resultat = relationship("Resultat", back_populates="mesures_valeurs")
    item_mesure = relationship("ItemMesure")
