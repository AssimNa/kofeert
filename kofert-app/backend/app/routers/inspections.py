from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, datetime
import calendar
from typing import List, Dict

from app.database import get_db
from app.middlewares.auth import get_current_user, require_role
from app.models.user import User, RoleEnum
from app.models.inspection import Inspection, StatutInspectionEnum
from app.models.fiche import FicheTemplate
from app.models.equipement import Equipement
from app.models.resultat import Resultat, ResultatEnum, MesureValeur
from app.models.item import Item, ItemTypeEnum
from app.models.anomalie import Anomalie, StatutAnomalieEnum
from app.schemas.inspection import InspectionCreate, InspectionUpdate, InspectionOut, CalendarDayOut
from app.services.audit_service import log_action
from app.services.email_service import send_inspection_report
from app.services.pdf_service import generate_inspection_pdf

router = APIRouter(prefix="/api/inspections", tags=["inspections"])

@router.post("/", response_model=InspectionOut)
def create_inspection(data: InspectionCreate, db: Session = Depends(get_db), current_user: User = Depends(require_role([RoleEnum.technicien]))):
    # Check if a draft already exists for today
    existing = db.query(Inspection).filter(
        Inspection.fiche_template_id == data.fiche_template_id,
        Inspection.technicien_id == current_user.id,
        Inspection.date_inspection == date.today()
    ).first()
    
    if existing:
        return existing

    inspection = Inspection(
        fiche_template_id=data.fiche_template_id,
        technicien_id=current_user.id,
        date_inspection=date.today(),
        statut=StatutInspectionEnum.brouillon
    )
    db.add(inspection)
    db.commit()
    db.refresh(inspection)
    
    log_action(db, current_user, "CREATE_INSPECTION", "inspections", inspection.id)
    return inspection

@router.put("/{inspection_id}")
def save_inspection(inspection_id: int, data: InspectionUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_role([RoleEnum.technicien]))):
    inspection = db.query(Inspection).filter(Inspection.id == inspection_id, Inspection.technicien_id == current_user.id).first()
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection non trouvée")
    
    if inspection.statut != StatutInspectionEnum.brouillon:
        raise HTTPException(status_code=400, detail="Une inspection soumise ne peut plus être modifiée")

    # Find results to delete to avoid foreign key constraint errors with mesures_valeurs
    resultat_ids = [r.id for r in db.query(Resultat.id).filter(Resultat.inspection_id == inspection_id).all()]
    if resultat_ids:
        db.query(MesureValeur).filter(MesureValeur.resultat_id.in_(resultat_ids)).delete(synchronize_session=False)

    # Delete existing results to replace them (simple way to update)
    db.query(Resultat).filter(Resultat.inspection_id == inspection_id).delete(synchronize_session=False)
    db.commit()

    for res_data in data.resultats:
        res = Resultat(
            inspection_id=inspection_id,
            item_id=res_data.item_id,
            resultat=res_data.resultat,
            remarque=res_data.remarque
        )
        db.add(res)
        db.flush() # To get res.id

        if res_data.mesures:
            for mes in res_data.mesures:
                mv = MesureValeur(
                    resultat_id=res.id,
                    item_mesure_id=mes.item_mesure_id,
                    valeur=mes.valeur
                )
                db.add(mv)
    db.commit()
    log_action(db, current_user, "SAVE_DRAFT", "inspections", inspection.id)
    return {"message": "Brouillon sauvegardé"}

@router.post("/{inspection_id}/submit")
def submit_inspection(inspection_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: User = Depends(require_role([RoleEnum.technicien]))):
    inspection = db.query(Inspection).filter(Inspection.id == inspection_id, Inspection.technicien_id == current_user.id).first()
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection non trouvée")
    
    if inspection.statut == StatutInspectionEnum.soumise:
        raise HTTPException(status_code=400, detail="Déjà soumise")

    # 1. Vérifier si tous les points de la fiche ont été répondus
    fiche = db.query(FicheTemplate).filter(FicheTemplate.id == inspection.fiche_template_id).first()
    total_items = db.query(Item).filter(Item.section.has(fiche_template_id=fiche.id)).count()
    resultats = db.query(Resultat).filter(Resultat.inspection_id == inspection_id).all()
    
    if len(resultats) < total_items:
        raise HTTPException(status_code=400, detail=f"Check-list incomplète. Remplis: {len(resultats)}/{total_items}")

    # 2. Update status
    inspection.statut = StatutInspectionEnum.soumise
    inspection.soumis_le = datetime.utcnow()
    db.commit()

    # 3. Create anomalies and gather data for alert
    all_items_to_report = []
    items_for_pdf = []
    
    for res in resultats:
        item = db.query(Item).filter(Item.id == res.item_id).first()
        items_for_pdf.append({
            "label": item.equipement_label,
            "resultat": res.resultat.value,
            "remarque": res.remarque
        })
        
        if res.resultat == ResultatEnum.non_conforme:
            anomalie = Anomalie(
                inspection_id=inspection_id,
                item_id=res.item_id,
                statut=StatutAnomalieEnum.ouverte
            )
            db.add(anomalie)
            
        # Gather associated measures / readings
        mesures_info = []
        for mv in res.mesures_valeurs:
            mesures_info.append(f"{mv.item_mesure.label}: {mv.valeur} {mv.item_mesure.unite or ''}")
            
        all_items_to_report.append({
            "label": item.equipement_label,
            "resultat": res.resultat.value,
            "remarque": res.remarque or "Aucune remarque",
            "mesures": mesures_info
        })
    
    anomalies_crees = len([a for a in all_items_to_report if a["resultat"] == "non_conforme"])
    db.commit()

    # 4. Trigger Email Alert and PDF Generation
    eq = db.query(Equipement).filter(Equipement.id == fiche.equipement_id).first()
    # Under Single-Supervisor Model, email alert always goes to the consolidated global supervisor
    superviseur = db.query(User).filter(User.role == RoleEnum.superviseur).first()

    status_global = "Conforme" if anomalies_crees == 0 else "Non Conforme"

    # Safe values in case equipement is not linked
    equipement_nom = eq.nom if eq else "Équipement inconnu"
    equipement_asset_id = f"{eq.code} - {eq.nom}" if eq else "N/A"

    # Generate PDF in background
    background_tasks.add_task(
        generate_inspection_pdf,
        inspection_id=inspection_id,
        date_inspection=str(inspection.date_inspection),
        technicien_nom=f"{current_user.prenom} {current_user.nom}",
        equipement_nom=equipement_nom,
        status=status_global,
        items_data=items_for_pdf
    )

    if superviseur:
        background_tasks.add_task(
            send_inspection_report,
            supervisor_email=superviseur.email,
            inspection_id=inspection_id,
            technician_name=f"{current_user.prenom} {current_user.nom}",
            submission_time=inspection.soumis_le.strftime("%d/%m/%Y %H:%M:%S"),
            equipment_asset_id=equipement_asset_id,
            all_items=all_items_to_report
        )

    log_action(db, current_user, "SUBMIT_INSPECTION", "inspections", inspection.id)
    return {"message": "Inspection soumise avec succès", "anomalies_crees": anomalies_crees}

@router.get("/calendar")
def get_calendar(mois: int, annee: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Calculate days in month
    num_days = calendar.monthrange(annee, mois)[1]
    response = {}

    # Total expected fiches per day (based on active fiches in the system)
    # Ideally, we should check which fiches are assigned to the user's scope.
    # For simplicity, we just count all fiches if admin, fiches assigned to superviseur if superviseur, etc.
    # Under Single-Supervisor Model, the supervisor has global scope (all active fiches)
    if current_user.role in (RoleEnum.technicien, RoleEnum.superviseur, RoleEnum.admin):
        expected_fiches_count = db.query(FicheTemplate).filter(FicheTemplate.actif == True).count()

    for day in range(1, num_days + 1):
        d = date(annee, mois, day)
        if d > date.today():
            continue # Future date
            
        # Get inspections for this day
        query = db.query(Inspection).filter(Inspection.date_inspection == d)
        
        if current_user.role == RoleEnum.technicien:
            query = query.filter(Inspection.technicien_id == current_user.id)
        # Under Single-Supervisor Model, no perimeter filter is applied for the supervisor
            
        inspections_jour = query.all()
        
        fiches_soumises = sum(1 for i in inspections_jour if i.statut == StatutInspectionEnum.soumise)
        anomalies_jour = db.query(Anomalie).join(Inspection).filter(Inspection.id.in_([i.id for i in inspections_jour])).count() if inspections_jour else 0

        # Determine status
        if fiches_soumises == 0 and d < date.today() and d.weekday() < 5: # Assuming Mon-Fri are working days
            status = "manquant"
        elif fiches_soumises < expected_fiches_count:
            status = "partiel"
        elif anomalies_jour > 0:
            status = "anomalie"
        else:
            status = "conforme"

        response[str(d)] = {
            "statut": status,
            "fiches_soumises": fiches_soumises,
            "fiches_total": expected_fiches_count,
            "anomalies": anomalies_jour
        }

    return response

@router.get("/jour")
def get_jour(date_req: date, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(Inspection).filter(Inspection.date_inspection == date_req)
    if current_user.role == RoleEnum.technicien:
        query = query.filter(Inspection.technicien_id == current_user.id)
    # Under Single-Supervisor Model, no perimeter filter is applied for the supervisor
        
    inspections = query.all()
    # Build detailed response
    fiches_details = []
    for ins in inspections:
        fiche = db.query(FicheTemplate).filter(FicheTemplate.id == ins.fiche_template_id).first()
        anom_count = db.query(Anomalie).filter(Anomalie.inspection_id == ins.id).count()
        fiches_details.append({
            "id": ins.id,
            "fiche_nom": fiche.nom,
            "statut": ins.statut.value,
            "anomalies": anom_count
        })
        
    return fiches_details

@router.get("/{inspection_id}", response_model=InspectionOut)
def get_inspection_detail(inspection_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not inspection:
        raise HTTPException(status_code=404, detail="Not found")
    return inspection
