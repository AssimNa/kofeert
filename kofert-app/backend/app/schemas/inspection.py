from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime
from app.models.inspection import StatutInspectionEnum
from app.models.resultat import ResultatEnum

class MesureCreate(BaseModel):
    item_mesure_id: int
    valeur: float

class ResultatCreate(BaseModel):
    item_id: int
    resultat: ResultatEnum
    remarque: Optional[str] = None
    mesures: Optional[List[MesureCreate]] = []

class InspectionCreate(BaseModel):
    fiche_template_id: int

class InspectionUpdate(BaseModel):
    resultats: List[ResultatCreate]

class MesureOut(BaseModel):
    item_mesure_id: int
    valeur: float
    class Config:
        from_attributes = True

class ResultatOut(BaseModel):
    item_id: int
    resultat: ResultatEnum
    remarque: Optional[str] = None
    mesures_valeurs: List[MesureOut] = []
    class Config:
        from_attributes = True

class InspectionOut(BaseModel):
    id: int
    fiche_template_id: int
    technicien_id: int
    date_inspection: date
    statut: StatutInspectionEnum
    soumis_le: Optional[datetime] = None
    resultats: List[ResultatOut] = []

    class Config:
        from_attributes = True

class CalendarDayOut(BaseModel):
    statut: str
    fiches_soumises: int
    fiches_total: int
    anomalies: int
