from pydantic import BaseModel
from typing import List, Optional
from app.models.item import ItemTypeEnum

class ItemCreate(BaseModel):
    equipement_label: str
    controle_description: str
    type: ItemTypeEnum
    ordre: int

class SectionCreate(BaseModel):
    titre: str
    ordre: int
    items: List[ItemCreate] = []

class FicheCreate(BaseModel):
    equipement_id: int
    nom: str
    reference: str
    sections: List[SectionCreate] = []

class ItemMesureOut(BaseModel):
    id: int
    label: str
    unite: str
    ordre: int

    class Config:
        from_attributes = True

class ItemOut(BaseModel):
    id: int
    equipement_label: str
    controle_description: str
    type: ItemTypeEnum
    ordre: int
    mesures: List[ItemMesureOut] = []

    class Config:
        from_attributes = True

class SectionOut(BaseModel):
    id: int
    titre: str
    ordre: int
    items: List[ItemOut] = []

    class Config:
        from_attributes = True

class FicheOut(BaseModel):
    id: int
    nom: str
    reference: str
    sections: List[SectionOut] = []

    class Config:
        from_attributes = True
