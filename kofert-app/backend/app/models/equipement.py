from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Equipement(Base):
    __tablename__ = "equipements"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(200))
    code = Column(String(50), unique=True, index=True)
    site = Column(String(100))
    local = Column(String(100))
    superviseur_id = Column(Integer, ForeignKey("users.id"))
    actif = Column(Boolean, default=True)

    superviseur = relationship("User", back_populates="equipements")
    fiches = relationship("FicheTemplate", back_populates="equipement")
