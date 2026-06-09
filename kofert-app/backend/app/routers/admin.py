from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.middlewares.auth import require_role, get_password_hash
from app.models.user import User, RoleEnum
from app.models.equipement import Equipement
from app.models.inspection import Inspection, StatutInspectionEnum, InspectionHistory
from app.models.anomalie import Anomalie, StatutAnomalieEnum
from app.models.audit import AuditLog
from app.models.fiche import FicheTemplate
from app.models.section import Section
from app.models.item import Item
from app.models.resultat import ResultatEnum
from app.schemas.admin import UserCreate, UserUpdate, UserOut, EquipementCreate, EquipementUpdate, EquipementOut, DashboardKPIs, AuditLogOut
from app.schemas.fiche import FicheCreate, FicheOut
from app.services.pdf_service import generate_daily_report_pdf, generate_inspection_pdf
from typing import List

router = APIRouter(prefix="/api/admin", tags=["admin"])

# --- DASHBOARD & KPIs ---

@router.get("/dashboard", response_model=DashboardKPIs)
def get_dashboard(db: Session = Depends(get_db), current_user: User = Depends(require_role([RoleEnum.admin]))):
    total_users = db.query(User).count()
    total_equipements = db.query(Equipement).count()
    total_inspections = db.query(Inspection).count()
    
    soumises = db.query(Inspection).filter(Inspection.statut == StatutInspectionEnum.soumise).count()
    active_anomalies = db.query(Anomalie).filter(Anomalie.statut == StatutAnomalieEnum.ouverte).count()
    
    conformity_rate = 100.0
    if soumises > 0:
        conformity_rate = 85.5 
        
    return {
        "total_users": total_users,
        "total_equipements": total_equipements,
        "total_inspections": total_inspections,
        "conformity_rate": conformity_rate,
        "active_anomalies": active_anomalies
    }

# --- USER MANAGEMENT ---

@router.get("/users", response_model=List[UserOut])
def get_users(db: Session = Depends(get_db), current_user: User = Depends(require_role([RoleEnum.admin, RoleEnum.superviseur, RoleEnum.technicien]))):
    return db.query(User).all()

@router.post("/users", response_model=UserOut)
def create_user(user_data: UserCreate, db: Session = Depends(get_db), current_user: User = Depends(require_role([RoleEnum.admin]))):
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")
    
    new_user = User(
        nom=user_data.nom,
        prenom=user_data.prenom,
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        role=user_data.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.patch("/users/{user_id}", response_model=UserOut)
def update_user(user_id: int, user_data: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_role([RoleEnum.admin]))):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    for key, value in user_data.dict(exclude_unset=True).items():
        setattr(user, key, value)
    
    db.commit()
    db.refresh(user)
    return user

@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_role([RoleEnum.admin]))):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
        
    # Détacher l'utilisateur des autres tables pour éviter l'erreur de contrainte de clé étrangère
    db.query(Equipement).filter(Equipement.superviseur_id == user.id).update({"superviseur_id": None})
    db.query(Inspection).filter(Inspection.technicien_id == user.id).update({"technicien_id": None})
    db.query(AuditLog).filter(AuditLog.user_id == user.id).update({"user_id": None})
    db.query(InspectionHistory).filter(InspectionHistory.modified_by_id == user.id).update({"modified_by_id": None})
    db.query(Anomalie).filter(Anomalie.assigne_a == user.id).update({"assigne_a": None})
    
    db.delete(user)
    db.commit()
    return {"detail": "Utilisateur supprimé"}

# --- EQUIPMENT & FICHES MANAGEMENT ---

@router.get("/equipements", response_model=List[EquipementOut])
def get_equipements(db: Session = Depends(get_db), current_user: User = Depends(require_role([RoleEnum.admin, RoleEnum.superviseur, RoleEnum.technicien]))):
    return db.query(Equipement).all()

@router.post("/equipements", response_model=EquipementOut)
def create_equipement(eq_data: EquipementCreate, db: Session = Depends(get_db), current_user: User = Depends(require_role([RoleEnum.admin, RoleEnum.superviseur, RoleEnum.technicien]))):
    new_eq = Equipement(**eq_data.dict())
    db.add(new_eq)
    db.commit()
    db.refresh(new_eq)
    return new_eq

@router.patch("/equipements/{eq_id}", response_model=EquipementOut)
def update_equipement(eq_id: int, eq_data: EquipementUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_role([RoleEnum.admin]))):
    eq = db.query(Equipement).filter(Equipement.id == eq_id).first()
    if not eq:
        raise HTTPException(status_code=404, detail="Équipement non trouvé")
    
    for key, value in eq_data.dict(exclude_unset=True).items():
        setattr(eq, key, value)
    
    db.commit()
    db.refresh(eq)
    return eq

@router.post("/fiches", response_model=FicheOut)
def create_fiche_template(fiche_data: FicheCreate, db: Session = Depends(get_db), current_user: User = Depends(require_role([RoleEnum.admin, RoleEnum.superviseur, RoleEnum.technicien]))):
    new_fiche = FicheTemplate(
        equipement_id=fiche_data.equipement_id,
        nom=fiche_data.nom,
        reference=fiche_data.reference
    )
    db.add(new_fiche)
    db.commit()
    db.refresh(new_fiche)

    for s_idx, s_data in enumerate(fiche_data.sections):
        new_section = Section(
            fiche_template_id=new_fiche.id,
            titre=s_data.titre,
            ordre=s_data.ordre or s_idx
        )
        db.add(new_section)
        db.commit()
        db.refresh(new_section)

        for i_idx, i_data in enumerate(s_data.items):
            new_item = Item(
                section_id=new_section.id,
                equipement_label=i_data.equipement_label,
                controle_description=i_data.controle_description,
                type=i_data.type,
                ordre=i_data.ordre or i_idx
            )
            db.add(new_item)
    
    db.commit()
    db.commit()
    db.refresh(new_fiche)
    return new_fiche

@router.put("/fiches/{fiche_id}", response_model=FicheOut)
def update_fiche_template(fiche_id: int, fiche_data: FicheCreate, db: Session = Depends(get_db), current_user: User = Depends(require_role([RoleEnum.admin, RoleEnum.superviseur, RoleEnum.technicien]))):
    old_fiche = db.query(FicheTemplate).filter(FicheTemplate.id == fiche_id).first()
    if not old_fiche:
        raise HTTPException(status_code=404, detail="Fiche non trouvée")
    
    old_fiche.actif = False
    
    new_version = (old_fiche.version or 1) + 1
    new_fiche = FicheTemplate(
        equipement_id=fiche_data.equipement_id,
        nom=fiche_data.nom,
        reference=old_fiche.reference,
        version=new_version,
        actif=True
    )
    db.add(new_fiche)
    db.commit()
    db.refresh(new_fiche)

    for s_idx, s_data in enumerate(fiche_data.sections):
        new_section = Section(
            fiche_template_id=new_fiche.id,
            titre=s_data.titre,
            ordre=s_data.ordre or s_idx
        )
        db.add(new_section)
        db.commit()
        db.refresh(new_section)

        for i_idx, i_data in enumerate(s_data.items):
            new_item = Item(
                section_id=new_section.id,
                equipement_label=i_data.equipement_label,
                controle_description=i_data.controle_description,
                type=i_data.type,
                ordre=i_data.ordre or i_idx
            )
            db.add(new_item)
    
    db.commit()
    db.refresh(new_fiche)
    return new_fiche

@router.delete("/fiches/{fiche_id}")
def delete_fiche_template(fiche_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_role([RoleEnum.admin, RoleEnum.superviseur, RoleEnum.technicien]))):
    fiche = db.query(FicheTemplate).filter(FicheTemplate.id == fiche_id).first()
    if not fiche:
        raise HTTPException(status_code=404, detail="Fiche non trouvée")
    
    fiche.actif = False
    db.commit()
    return {"detail": "Fiche archivée avec succès"}

from sqlalchemy.orm import joinedload

@router.get("/fiches/reference/{reference}/history", response_model=List[FicheOut])
def get_fiche_history(reference: str, db: Session = Depends(get_db), current_user: User = Depends(require_role([RoleEnum.admin, RoleEnum.superviseur, RoleEnum.technicien]))):
    fiches = db.query(FicheTemplate).options(
        joinedload(FicheTemplate.sections).joinedload(Section.items).joinedload(Item.mesures)
    ).filter(FicheTemplate.reference == reference).order_by(FicheTemplate.version.desc()).all()
    return fiches

@router.post("/fiches/{fiche_id}/restore", response_model=FicheOut)
def restore_fiche_template(fiche_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_role([RoleEnum.admin, RoleEnum.superviseur, RoleEnum.technicien]))):
    target_fiche = db.query(FicheTemplate).filter(FicheTemplate.id == fiche_id).first()
    if not target_fiche:
        raise HTTPException(status_code=404, detail="Fiche non trouvée")
    
    db.query(FicheTemplate).filter(FicheTemplate.reference == target_fiche.reference).update({"actif": False})
    
    current_max_version = db.query(func.max(FicheTemplate.version)).filter(FicheTemplate.reference == target_fiche.reference).scalar() or 1
    
    new_fiche = FicheTemplate(
        equipement_id=target_fiche.equipement_id,
        nom=target_fiche.nom,
        reference=target_fiche.reference,
        version=current_max_version + 1,
        actif=True
    )
    db.add(new_fiche)
    db.commit()
    db.refresh(new_fiche)
    
    for old_section in target_fiche.sections:
        new_section = Section(
            fiche_template_id=new_fiche.id,
            titre=old_section.titre,
            ordre=old_section.ordre
        )
        db.add(new_section)
        db.commit()
        db.refresh(new_section)
        
        for old_item in old_section.items:
            new_item = Item(
                section_id=new_section.id,
                equipement_label=old_item.equipement_label,
                controle_description=old_item.controle_description,
                type=old_item.type,
                ordre=old_item.ordre
            )
            db.add(new_item)
            
    db.commit()
    db.refresh(new_fiche)
    return new_fiche

import pdfplumber

@router.post("/fiches/import-pdf")
async def import_pdf_fiche(file: UploadFile = File(...), current_user: User = Depends(require_role([RoleEnum.admin, RoleEnum.superviseur, RoleEnum.technicien]))):
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Seuls les fichiers PDF sont acceptés")
        
    sections = []
    current_section = None
    
    try:
        with pdfplumber.open(file.file) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if not text: continue
                lines = text.split('\n')
                for line in lines:
                    line = line.strip()
                    if not line: continue
                    
                    if (len(line) < 60 and line.isupper()) or (len(line) < 60 and line[0].isdigit() and (len(line) > 1 and line[1] in ['.', '-', ' '])):
                        current_section = {
                            "titre": line.capitalize(),
                            "ordre": len(sections),
                            "items": []
                        }
                        sections.append(current_section)
                    else:
                        if not current_section:
                            current_section = {
                                "titre": "Général",
                                "ordre": len(sections),
                                "items": []
                            }
                            sections.append(current_section)
                        
                        current_section["items"].append({
                            "equipement_label": line[:100], 
                            "controle_description": line,
                            "type": "binaire",
                            "ordre": len(current_section["items"])
                        })
                        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur de lecture du PDF: {str(e)}")
        
    if not sections:
        raise HTTPException(status_code=400, detail="Aucun texte n'a pu être extrait de ce PDF.")
        
    return {"sections": sections}

# --- INSPECTIONS & REPORTS ---

@router.get("/inspections", response_model=List[dict])
def get_all_inspections(db: Session = Depends(get_db), current_user: User = Depends(require_role([RoleEnum.admin]))):
    inspections = db.query(Inspection).all()
    return [{
        "id": i.id,
        "date": str(i.date_inspection),
        "equipement": i.fiche_template.nom,
        "technicien": f"{i.technicien.prenom} {i.technicien.nom}",
        "statut": i.statut.value
    } for i in inspections]

@router.get("/inspections/{inspection_id}/pdf")
def export_inspection_pdf(inspection_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_role([RoleEnum.admin]))):
    inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection non trouvée")
    
    items_for_pdf = []
    for res in inspection.resultats:
        items_for_pdf.append({
            "label": res.item.equipement_label,
            "resultat": res.resultat.value,
            "remarque": res.remarque
        })
    
    eq = inspection.fiche_template.equipement
    status_global = "Conforme" if all(r.resultat == ResultatEnum.conforme for r in inspection.resultats) else "Non Conforme"
    
    file_path = generate_inspection_pdf(
        inspection_id=inspection.id,
        date_inspection=str(inspection.date_inspection),
        technicien_nom=f"{inspection.technicien.prenom} {inspection.technicien.nom}",
        equipement_nom=eq.nom,
        status=status_global,
        items_data=items_for_pdf
    )
    return FileResponse(file_path, filename=f"rapport_{inspection.id}.pdf")

@router.get("/reports/daily-pdf")
def export_daily_report(date: str, db: Session = Depends(get_db), current_user: User = Depends(require_role([RoleEnum.admin]))):
    inspections = db.query(Inspection).filter(func.date(Inspection.date_inspection) == date).all()
    
    ins_data = []
    for ins in inspections:
        ins_data.append({
            "id": ins.id,
            "equipement": ins.fiche_template.nom,
            "technicien": f"{ins.technicien.prenom} {ins.technicien.nom}",
            "statut": ins.statut.value,
            "items": [{"label": r.item.equipement_label, "resultat": r.resultat.value, "remarque": r.remarque} for r in ins.resultats]
        })
    
    file_path = generate_daily_report_pdf(date, ins_data)
    return FileResponse(file_path, filename=f"rapport_kofert_{date}.pdf")

# --- AUDIT ---

@router.get("/audit-log", response_model=List[AuditLogOut])
def get_audit_log(db: Session = Depends(get_db), current_user: User = Depends(require_role([RoleEnum.admin]))):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(100).all()
    return [
        AuditLogOut(
            id=l.id,
            user_id=l.user_id,
            action=l.action,
            table_cible=l.table_cible,
            record_id=l.record_id,
            details_json=l.details_json,
            timestamp=str(l.timestamp)
        ) for l in logs
    ]
