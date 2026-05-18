from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Section(Base):
    __tablename__ = "sections"

    id = Column(Integer, primary_key=True, index=True)
    fiche_template_id = Column(Integer, ForeignKey("fiches_template.id"))
    titre = Column(String(200))
    ordre = Column(Integer)

    fiche = relationship("FicheTemplate", back_populates="sections")
    items = relationship("Item", back_populates="section")
