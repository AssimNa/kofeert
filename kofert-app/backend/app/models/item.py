from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class ItemTypeEnum(str, enum.Enum):
    binaire = "binaire"
    numerique = "numerique"

class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    section_id = Column(Integer, ForeignKey("sections.id"))
    equipement_label = Column(String(200))
    controle_description = Column(Text)
    type = Column(Enum(ItemTypeEnum), nullable=False)
    ordre = Column(Integer)
    actif = Column(Boolean, default=True)

    section = relationship("Section", back_populates="items")
    mesures = relationship("ItemMesure", back_populates="item")

class ItemMesure(Base):
    __tablename__ = "item_mesures"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("items.id"))
    label = Column(String(100))
    unite = Column(String(20))
    obligatoire = Column(Boolean, default=True)
    ordre = Column(Integer)

    item = relationship("Item", back_populates="mesures")
