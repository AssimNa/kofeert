import sys
import os

sys.path.append(r"c:\Users\ASSIM\Documents\kofeeeeeert\kofert-app\backend")
from app.database import SessionLocal
from app.models.user import User, RoleEnum
from app.models.equipement import Equipement

db = SessionLocal()
superviseur = db.query(User).filter(User.role == RoleEnum.superviseur, User.actif == True).first()

if not superviseur:
    print("No active supervisor found.")
else:
    equipements = db.query(Equipement).all()
    updated = 0
    for eq in equipements:
        if eq.superviseur_id != superviseur.id:
            eq.superviseur_id = superviseur.id
            updated += 1
    db.commit()
    print(f"Assigned {updated} equipments to supervisor {superviseur.prenom} {superviseur.nom} (ID: {superviseur.id})")
