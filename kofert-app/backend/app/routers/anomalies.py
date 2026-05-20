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
    
    if current_user.role == RoleEnum.superviseur:
        query = query.join(Inspection).join(FicheTemplate).join(Equipement).filter(
            Equipement.superviseur_id == current_user.id
        )
    
    anomalies = query.all()
    
    return [{
        "id": a.id,
        "date": str(a.inspection.date_inspection),
        "equipement": a.inspection.fiche_template.equipement.nom,
        "item": a.item.equipement_label,
        "statut": a.statut.value,
        "technicien": f"{a.inspection.technicien.prenom} {a.inspection.technicien.nom}" if a.inspection.technicien else "N/A",
        "description_action": a.description_action,
        "assigne_a": f"{a.assigne_a_user.prenom} {a.assigne_a_user.nom}" if a.assigne_a_user else "Non assigné",
        "assigne_a_id": a.assigne_a
    } for a in anomalies]

@router.get("/users")
def get_assignees(db: Session = Depends(get_db), current_user: User = Depends(require_role([RoleEnum.superviseur, RoleEnum.admin]))):
    # Retrieve active technicians, supervisors, and admins
    users = db.query(User).filter(User.actif == True).all()
    return [{"id": u.id, "nom": u.nom, "prenom": u.prenom, "role": u.role.value} for u in users]

@router.put("/{anomalie_id}/status")
def update_anomalie_status(anomalie_id: int, data: AnomalieStatusUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_role([RoleEnum.superviseur, RoleEnum.admin]))):
    anomalie = db.query(Anomalie).filter(Anomalie.id == anomalie_id).first()
    if not anomalie:
        raise HTTPException(status_code=404, detail="Anomalie non trouvée")
    
    # Check perimeter access for supervisor
    if current_user.role == RoleEnum.superviseur:
        if anomalie.inspection.fiche_template.equipement.superviseur_id != current_user.id:
            raise HTTPException(status_code=403, detail="Accès refusé - Cette anomalie n'est pas dans votre périmètre")
            
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
    
    # Check perimeter access for supervisor
    if current_user.role == RoleEnum.superviseur:
        if anomalie.inspection.fiche_template.equipement.superviseur_id != current_user.id:
            raise HTTPException(status_code=403, detail="Accès refusé - Cette anomalie n'est pas dans votre périmètre")
            
    anomalie.description_action = data.description_action
    db.commit()
    return {"message": "Action documentée"}

@router.put("/{anomalie_id}/assign")
def assign_anomalie(anomalie_id: int, user_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_role([RoleEnum.superviseur, RoleEnum.admin]))):
    anomalie = db.query(Anomalie).filter(Anomalie.id == anomalie_id).first()
    if not anomalie:
        raise HTTPException(status_code=404, detail="Anomalie non trouvée")
    
    # Check perimeter access for supervisor
    if current_user.role == RoleEnum.superviseur:
        if anomalie.inspection.fiche_template.equipement.superviseur_id != current_user.id:
            raise HTTPException(status_code=403, detail="Accès refusé - Cette anomalie n'est pas dans votre périmètre")
            
    # Check if target user exists
    target_user = db.query(User).filter(User.id == user_id, User.actif == True).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Utilisateur assigné non trouvé ou inactif")

    anomalie.assigne_a = user_id
    db.commit()
    return {"message": f"Anomalie assignée à l'utilisateur {target_user.prenom} {target_user.nom}"}
