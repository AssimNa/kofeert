from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List

from app.database import get_db
from app.middlewares.auth import get_current_user, require_role
from app.models.user import User, RoleEnum
from app.models.anomalie import Anomalie, StatutAnomalieEnum
from app.models.inspection import Inspection
from app.models.fiche import FicheTemplate
from app.models.equipement import Equipement
from app.schemas.anomalie import AnomalieOut, AnomalieStatusUpdate, AnomalieActionUpdate

router = APIRouter(prefix="/api/anomalies", tags=["anomalies"])

@router.get("/", response_model=List[dict])
def get_anomalies(db: Session = Depends(get_db), current_user: User = Depends(require_role([RoleEnum.superviseur, RoleEnum.admin]))):
    query = db.query(Anomalie)
    
    # Under the Single-Supervisor Model, the supervisor has global visibility
    # over all anomalies across all perimeters, so no filtering is applied here.
    
    anomalies = query.all()
    
    return [{
        "id": a.id,
        "date": str(a.inspection.date_inspection),
        "equipement": a.inspection.fiche_template.equipement.nom,
        "item": a.item.equipement_label,
        "statut": a.statut.value,
        "technicien": f"{a.inspection.technicien.prenom} {a.inspection.technicien.nom}",
        "description_action": a.description_action,
        "assigne_a": f"{a.assigne_a_user.prenom} {a.assigne_a_user.nom}" if a.assigne_a_user else "Non assigné",
        "assigne_a_id": a.assigne_a
    } for a in anomalies]

@router.put("/{anomalie_id}/status")
def update_anomalie_status(anomalie_id: int, data: AnomalieStatusUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_role([RoleEnum.superviseur, RoleEnum.admin]))):
    anomalie = db.query(Anomalie).filter(Anomalie.id == anomalie_id).first()
    if not anomalie:
        raise HTTPException(status_code=404, detail="Anomalie non trouvée")
    
    anomalie.statut = data.statut
    if data.statut == StatutAnomalieEnum.cloturee:
        anomalie.closed_at = datetime.utcnow()
    
    db.commit()
    return {"message": "Statut mis à jour"}

@router.put("/{anomalie_id}/action")
def update_anomalie_action(anomalie_id: int, data: AnomalieActionUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_role([RoleEnum.superviseur, RoleEnum.admin]))):
    anomalie = db.query(Anomalie).filter(Anomalie.id == anomalie_id).first()
    if not anomalie:
        raise HTTPException(status_code=404, detail="Anomalie non trouvée")
    
    anomalie.description_action = data.description_action
    db.commit()
    return {"message": "Action documentée"}

@router.put("/{anomalie_id}/assign")
def assign_anomalie(anomalie_id: int, user_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_role([RoleEnum.superviseur, RoleEnum.admin]))):
    anomalie = db.query(Anomalie).filter(Anomalie.id == anomalie_id).first()
    if not anomalie:
        raise HTTPException(status_code=404, detail="Anomalie non trouvée")
    
    anomalie.assigne_a = user_id
    db.commit()
    return {"message": f"Anomalie assignée à l'utilisateur {user_id}"}
