from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, datetime
import calendar
from typing import List, Dict

from app.database import get_db
from app.middlewares.auth import get_current_user, require_role
from app.models.user import User, RoleEnum
from app.models.inspection import Inspection, StatutInspectionEnum, InspectionHistory
from app.models.fiche import FicheTemplate
from app.models.equipement import Equipement
from app.models.resultat import Resultat, ResultatEnum, MesureValeur
from app.models.item import Item, ItemTypeEnum
from app.models.anomalie import Anomalie, StatutAnomalieEnum
from app.schemas.inspection import InspectionCreate, InspectionUpdate, InspectionOut, CalendarDayOut
from app.services.audit_service import log_action
from app.services.email_service import send_anomaly_alert, send_inspection_submission_email
from app.services.pdf_service import generate_inspection_pdf

router = APIRouter(prefix="/api/inspections", tags=["inspections"])

@router.post("/", response_model=InspectionOut)
def create_inspection(data: InspectionCreate, db: Session = Depends(get_db), current_user: User = Depends(require_role([RoleEnum.technicien]))):
    # Check if a draft already exists for today
    if not getattr(data, 'manual', False):
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

    # Delete existing results to replace them (simple way to update)
    db.query(Resultat).filter(Resultat.inspection_id == inspection_id).delete()
    db.commit()

    for res_data in data.resultats:
        res = Resultat(
            inspection_id=inspection.id,
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
def submit_inspection(inspection_id: int, data: InspectionUpdate, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: User = Depends(require_role([RoleEnum.technicien]))):
    inspection = db.query(Inspection).filter(Inspection.id == inspection_id, Inspection.technicien_id == current_user.id).first()
    if not inspection:
        # Fallback if the mobile app sends ficheId instead of inspection_id!
        inspection = db.query(Inspection).filter(Inspection.fiche_template_id == inspection_id, Inspection.technicien_id == current_user.id).order_by(Inspection.id.desc()).first()
        if not inspection:
            raise HTTPException(status_code=404, detail="Inspection non trouvée")

    if inspection.statut == StatutInspectionEnum.soumise:
        # Save history before modification
        old_resultats = []
        for r in inspection.resultats:
            mesures = [{"item_mesure_id": mv.item_mesure_id, "valeur": mv.valeur} for mv in r.mesures_valeurs]
            old_resultats.append({
                "item_id": r.item_id,
                "resultat": r.resultat.value,
                "remarque": r.remarque,
                "mesures": mesures
            })
        history = InspectionHistory(
            inspection_id=inspection.id,
            modified_by_id=current_user.id,
            resultats_data={"resultats": old_resultats}
        )
        db.add(history)
        db.commit()
        
        # Delete old open anomalies since we are re-evaluating
        db.query(Anomalie).filter(Anomalie.inspection_id == inspection.id, Anomalie.statut == StatutAnomalieEnum.ouverte).delete()

    # Save new resultats
    db.query(Resultat).filter(Resultat.inspection_id == inspection.id).delete()
    db.commit()

    for res_data in data.resultats:
        res = Resultat(
            inspection_id=inspection.id,
            item_id=res_data.item_id,
            resultat=res_data.resultat,
            remarque=res_data.remarque
        )
        db.add(res)
        db.flush()
        if res_data.mesures:
            for mes in res_data.mesures:
                mv = MesureValeur(resultat_id=res.id, item_mesure_id=mes.item_mesure_id, valeur=mes.valeur)
                db.add(mv)
    db.commit()

    # 1. Vérifier si tous les points de la fiche ont été répondus
    fiche = db.query(FicheTemplate).filter(FicheTemplate.id == inspection.fiche_template_id).first()
    total_items = db.query(Item).filter(Item.section.has(fiche_template_id=fiche.id)).count()
    resultats = db.query(Resultat).filter(Resultat.inspection_id == inspection.id).all()
    
    if len(resultats) < total_items:
        raise HTTPException(status_code=400, detail=f"Check-list incomplète. Remplis: {len(resultats)}/{total_items}")

    # 2. Update status
    inspection.statut = StatutInspectionEnum.soumise
    inspection.soumis_le = datetime.utcnow()
    db.commit()

    # 3. Create anomalies and gather data for alert
    anomalies_to_report = []
    items_for_pdf = []
    items_for_email = []
    
    for res in resultats:
        item = db.query(Item).filter(Item.id == res.item_id).first()
        items_for_pdf.append({
            "label": item.equipement_label,
            "resultat": res.resultat.value,
            "remarque": res.remarque
        })
        
        # Gather associated measures / readings
        mesures_info = []
        for mv in res.mesures_valeurs:
            mesures_info.append(f"{mv.item_mesure.label}: {mv.valeur} {mv.item_mesure.unite or ''}")
            
        items_for_email.append({
            "label": item.equipement_label,
            "resultat": res.resultat.value,
            "remarque": res.remarque or "Aucune remarque",
            "mesures": mesures_info
        })
        
        if res.resultat == ResultatEnum.non_conforme:
            anomalie = Anomalie(
                inspection_id=inspection.id,
                item_id=res.item_id,
                statut=StatutAnomalieEnum.ouverte
            )
            db.add(anomalie)
            
            anomalies_to_report.append({
                "label": item.equipement_label,
                "remarque": res.remarque or "Aucune remarque",
                "mesures": mesures_info
            })
    
    db.commit()

    # 4. Trigger Email Alert and PDF Generation
    eq = db.query(Equipement).filter(Equipement.id == fiche.equipement_id).first()
    # Email alert goes to the specific supervisor of this equipment, fallback to any supervisor
    superviseur = eq.superviseur if (eq and eq.superviseur) else db.query(User).filter(User.role == RoleEnum.superviseur).first()

    status_global = "Conforme" if not anomalies_to_report else "Non Conforme"

    # Safe values in case equipement is not linked
    equipement_nom = eq.nom if eq else "Équipement inconnu"
    equipement_asset_id = f"{eq.code} - {eq.nom}" if eq else "N/A"

    # Generate PDF in background
    background_tasks.add_task(
        generate_inspection_pdf,
        inspection_id=inspection.id,
        date_inspection=str(inspection.date_inspection),
        technicien_nom=f"{current_user.prenom} {current_user.nom}",
        equipement_nom=equipement_nom,
        status=status_global,
        items_data=items_for_pdf
    )

    if superviseur:
        background_tasks.add_task(
            send_inspection_submission_email,
            supervisor_email=superviseur.email,
            inspection_id=inspection.id,
            technician_name=f"{current_user.prenom} {current_user.nom}",
            submission_time=inspection.soumis_le.strftime("%d/%m/%Y %H:%M:%S"),
            equipment_asset_id=equipement_asset_id,
            status_global=status_global,
            items=items_for_email
        )

        if anomalies_to_report:
            background_tasks.add_task(
                send_anomaly_alert,
                supervisor_email=superviseur.email,
                inspection_id=inspection.id,
                technician_name=f"{current_user.prenom} {current_user.nom}",
                submission_time=inspection.soumis_le.strftime("%d/%m/%Y %H:%M:%S"),
                equipment_asset_id=equipement_asset_id,
                failed_items=anomalies_to_report
            )

    log_action(db, current_user, "SUBMIT_INSPECTION", "inspections", inspection.id)
    return {"message": "Inspection soumise avec succès", "anomalies_crees": len(anomalies_to_report)}

@router.get("/supervisor/dashboard")
def get_supervisor_dashboard(db: Session = Depends(get_db), current_user: User = Depends(require_role([RoleEnum.superviseur]))):
    # Get all equipment IDs for this supervisor
    eqs = db.query(Equipement).filter(Equipement.superviseur_id == current_user.id).all()
    eq_ids = [e.id for e in eqs]
    
    # Fiches templates for these equipments
    fiches = db.query(FicheTemplate).filter(FicheTemplate.equipement_id.in_(eq_ids)).all()
    fiche_ids = [f.id for f in fiches]
    
    # Inspections for today
    today = date.today()
    inspections_today = db.query(Inspection).filter(
        Inspection.fiche_template_id.in_(fiche_ids),
        Inspection.date_inspection == today
    ).all()
    
    fiches_soumises_today = sum(1 for i in inspections_today if i.statut == StatutInspectionEnum.soumise)
    
    # Active anomalies
    active_anomalies = db.query(Anomalie).join(Inspection).filter(
        Inspection.fiche_template_id.in_(fiche_ids),
        Anomalie.statut.in_([StatutAnomalieEnum.ouverte, StatutAnomalieEnum.en_cours])
    ).count()
    
    # Total historical inspections submitted
    total_submitted = db.query(Inspection).filter(
        Inspection.fiche_template_id.in_(fiche_ids),
        Inspection.statut == StatutInspectionEnum.soumise
    ).count()
    
    # Conformity rate
    conformity_rate = 100.0
    if total_submitted > 0:
        # Inspections with anomalies
        with_anomalies = db.query(Inspection).join(Anomalie).filter(
            Inspection.fiche_template_id.in_(fiche_ids),
            Inspection.statut == StatutInspectionEnum.soumise
        ).distinct().count()
        conformity_rate = round(((total_submitted - with_anomalies) / total_submitted) * 100, 1)
        
    return {
        "fiches_total_perimeter": len(fiches),
        "fiches_soumises_today": fiches_soumises_today,
        "active_anomalies": active_anomalies,
        "conformity_rate": conformity_rate,
        "recent_inspections": [{
            "id": i.id,
            "date": str(i.date_inspection),
            "equipement": i.fiche_template.nom,
            "technicien": f"{i.technicien.prenom} {i.technicien.nom}" if i.technicien else "N/A",
            "statut": i.statut.value,
            "anomalies": db.query(Anomalie).filter(Anomalie.inspection_id == i.id).count()
        } for i in inspections_today]
    }

@router.get("/calendar")
def get_calendar(mois: int, annee: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Calculate days in month
    num_days = calendar.monthrange(annee, mois)[1]
    response = {}

    # Total expected fiches per day (based on active fiches in the system)
    if current_user.role == RoleEnum.superviseur:
        expected_fiches_count = db.query(FicheTemplate).join(Equipement).filter(
            FicheTemplate.actif == True,
            Equipement.superviseur_id == current_user.id
        ).count()
    else:
        expected_fiches_count = db.query(FicheTemplate).filter(FicheTemplate.actif == True).count()

    for day in range(1, num_days + 1):
        d = date(annee, mois, day)
        if d > date.today():
            continue # Future date
            
        # Get inspections for this day
        query = db.query(Inspection).filter(Inspection.date_inspection == d)
        
        if current_user.role == RoleEnum.technicien:
            query = query.filter(Inspection.technicien_id == current_user.id)
        elif current_user.role == RoleEnum.superviseur:
            query = query.join(FicheTemplate).join(Equipement).filter(Equipement.superviseur_id == current_user.id)
            
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
    elif current_user.role == RoleEnum.superviseur:
        query = query.join(FicheTemplate).join(Equipement).filter(Equipement.superviseur_id == current_user.id)
        
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
            "anomalies": anom_count,
            "technicien": f"{ins.technicien.prenom} {ins.technicien.nom}" if ins.technicien else "N/A"
        })
        
    return fiches_details

@router.get("/{inspection_id}", response_model=InspectionOut)
def get_inspection_detail(inspection_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not inspection:
        raise HTTPException(status_code=404, detail="Not found")
        
    # Check supervisor perimeter
    if current_user.role == RoleEnum.superviseur:
        if inspection.fiche_template.equipement.superviseur_id != current_user.id:
            raise HTTPException(status_code=403, detail="Accès refusé - Cet équipement n'est pas dans votre périmètre")
            
    return inspection

@router.get("/{inspection_id}/pdf")
def export_inspection_pdf_generic(inspection_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in (RoleEnum.admin, RoleEnum.superviseur, RoleEnum.technicien):
        raise HTTPException(status_code=403, detail="Accès non autorisé")
        
    inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection non trouvée")
        
    # Check perimeter access for supervisor
    if current_user.role == RoleEnum.superviseur:
        if inspection.fiche_template.equipement.superviseur_id != current_user.id:
            raise HTTPException(status_code=403, detail="Accès refusé - Cet équipement n'est pas dans votre périmètre")
            
    # Check technician access (only own fiches)
    if current_user.role == RoleEnum.technicien:
        if inspection.technicien_id != current_user.id:
            raise HTTPException(status_code=403, detail="Accès refusé - Ce rapport n'est pas à vous")

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


@router.get("/{inspection_id}/history")
def get_inspection_history(inspection_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_role([RoleEnum.technicien, RoleEnum.superviseur, RoleEnum.admin]))):
    inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection non trouvée")
    
    if current_user.role == RoleEnum.technicien and inspection.technicien_id != current_user.id:
        raise HTTPException(status_code=403, detail="Accès refusé")

    histories = db.query(InspectionHistory).filter(InspectionHistory.inspection_id == inspection.id).order_by(InspectionHistory.modified_at.desc()).all()
    return [{"id": h.id, "modified_at": h.modified_at, "modified_by": f"{h.modifier.prenom} {h.modifier.nom}"} for h in histories]

@router.post("/{inspection_id}/revert/{history_id}")
def revert_inspection(inspection_id: int, history_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_role([RoleEnum.technicien]))):
    inspection = db.query(Inspection).filter(Inspection.id == inspection_id, Inspection.technicien_id == current_user.id).first()
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection non trouvée")
        
    history = db.query(InspectionHistory).filter(InspectionHistory.id == history_id, InspectionHistory.inspection_id == inspection.id).first()
    if not history:
        raise HTTPException(status_code=404, detail="Historique non trouvé")

    # Save current state to history before reverting
    old_resultats = []
    for r in inspection.resultats:
        mesures = [{"item_mesure_id": mv.item_mesure_id, "valeur": mv.valeur} for mv in r.mesures_valeurs]
        old_resultats.append({
            "item_id": r.item_id,
            "resultat": r.resultat.value,
            "remarque": r.remarque,
            "mesures": mesures
        })
    new_history = InspectionHistory(
        inspection_id=inspection.id,
        modified_by_id=current_user.id,
        resultats_data={"resultats": old_resultats}
    )
    db.add(new_history)

    # Revert resultats
    db.query(Resultat).filter(Resultat.inspection_id == inspection.id).delete()
    db.query(Anomalie).filter(Anomalie.inspection_id == inspection.id, Anomalie.statut == StatutAnomalieEnum.ouverte).delete()
    db.commit()

    for res_data in history.resultats_data.get("resultats", []):
        res = Resultat(
            inspection_id=inspection.id,
            item_id=res_data["item_id"],
            resultat=res_data["resultat"],
            remarque=res_data["remarque"]
        )
        db.add(res)
        db.flush()
        if "mesures" in res_data:
            for mes in res_data["mesures"]:
                mv = MesureValeur(resultat_id=res.id, item_mesure_id=mes["item_mesure_id"], valeur=mes["valeur"])
                db.add(mv)
                
        # Re-evaluate anomaly
        if res_data["resultat"] == ResultatEnum.non_conforme.value:
            anomalie = Anomalie(inspection_id=inspection.id, item_id=res_data["item_id"], statut=StatutAnomalieEnum.ouverte)
            db.add(anomalie)

    db.commit()
    log_action(db, current_user, "REVERT_INSPECTION", "inspections", inspection.id)
    return {"message": "Version restaurée avec succès"}
