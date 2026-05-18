from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.anomalie import StatutAnomalieEnum

class AnomalieOut(BaseModel):
    id: int
    inspection_id: int
    item_id: int
    statut: StatutAnomalieEnum
    assigne_a: Optional[int] = None
    description_action: Optional[str] = None
    created_at: datetime
    closed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class AnomalieStatusUpdate(BaseModel):
    statut: StatutAnomalieEnum

class AnomalieActionUpdate(BaseModel):
    description_action: str
