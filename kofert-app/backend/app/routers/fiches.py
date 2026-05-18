from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.fiche import FicheTemplate
from app.models.section import Section
from app.models.item import Item
from app.middlewares.auth import get_current_user
from app.models.user import User
from typing import List
from app.schemas.fiche import FicheOut

router = APIRouter(prefix="/api/fiches", tags=["fiches"])

@router.get("/", response_model=List[FicheOut])
def get_fiches(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    fiches = db.query(FicheTemplate).options(
        joinedload(FicheTemplate.sections).joinedload(Section.items).joinedload(Item.mesures)
    ).filter(FicheTemplate.actif == True).all()
    return fiches

@router.get("/{fiche_id}", response_model=FicheOut)
def get_fiche_detail(fiche_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    fiche = db.query(FicheTemplate).options(
        joinedload(FicheTemplate.sections).joinedload(Section.items).joinedload(Item.mesures)
    ).filter(FicheTemplate.id == fiche_id).first()
    return fiche
