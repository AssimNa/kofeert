from pydantic import BaseModel, EmailStr
from typing import List, Optional, Any
from app.models.user import RoleEnum

class UserCreate(BaseModel):
    nom: str
    prenom: str
    email: EmailStr
    password: str
    role: RoleEnum

class UserUpdate(BaseModel):
    nom: Optional[str] = None
    prenom: Optional[str] = None
    role: Optional[RoleEnum] = None
    actif: Optional[bool] = None

class UserOut(BaseModel):
    id: int
    nom: str
    prenom: str
    email: EmailStr
    photo_profil: Optional[str] = None
    role: RoleEnum
    actif: bool

    class Config:
        from_attributes = True

class EquipementCreate(BaseModel):
    nom: str
    code: str
    site: str
    local: str
    superviseur_id: int

class EquipementUpdate(BaseModel):
    nom: Optional[str] = None
    code: Optional[str] = None
    site: Optional[str] = None
    local: Optional[str] = None
    superviseur_id: Optional[int] = None

class EquipementOut(BaseModel):
    id: int
    nom: str
    code: str
    site: str
    local: str
    superviseur_id: int

    class Config:
        from_attributes = True

class DashboardKPIs(BaseModel):
    total_users: int
    total_equipements: int
    total_inspections: int
    conformity_rate: float
    active_anomalies: int

class AuditLogOut(BaseModel):
    id: int
    user_id: int
    action: str
    table_cible: str
    record_id: Optional[int]
    details_json: Optional[Any] = None
    timestamp: str

    class Config:
        from_attributes = True
