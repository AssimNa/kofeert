import os
import sys
from dotenv import load_dotenv

sys.path.insert(0, os.path.dirname(__file__))
load_dotenv()

from app.database import SessionLocal, engine, Base
from app.models.user import User, RoleEnum
from app.models.equipement import Equipement
from app.models.fiche import FicheTemplate
from app.models.section import Section
from app.models.item import Item, ItemMesure, ItemTypeEnum
from app.middlewares.auth import get_password_hash

def seed_db():
    print("Starting database seeding...")
    db = SessionLocal()

    # Create Users
    users_data = [
        {"nom": "Admin", "prenom": "Super", "email": "admin@kofert.com", "role": RoleEnum.admin},
        {"nom": "Global", "prenom": "Superviseur", "email": "assim3188@gmail.com", "role": RoleEnum.superviseur},
        {"nom": "Tech", "prenom": "Terrain", "email": "tech@kofert.com", "role": RoleEnum.technicien},
    ]

    users = {}
    for ud in users_data:
        user = db.query(User).filter(User.email == ud["email"]).first()
        if not user:
            user = User(
                nom=ud["nom"],
                prenom=ud["prenom"],
                email=ud["email"],
                password_hash=get_password_hash("password123"),
                role=ud["role"]
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"Created user: {user.email}")
        users[ud["role"].value + "_" + ud["nom"]] = user

    superviseur = db.query(User).filter(User.email == "assim3188@gmail.com").first()

    # Create Equipements
    eqs_data = [
        {"nom": "Transformateur élévateur 622AEC03", "code": "622AEC03", "site": "Jorf Fertilizers Company 3", "local": "Local HT", "superviseur_id": superviseur.id},
        {"nom": "Chargeurs batteries & onduleur", "code": "BATT_OND", "site": "Jorf Fertilizers Company 3", "local": "Salle Batteries", "superviseur_id": superviseur.id},
        {"nom": "Transformateur abaisseur 622AEC01", "code": "622AEC01", "site": "Jorf Fertilizers Company 3", "local": "Local HT", "superviseur_id": superviseur.id},
    ]

    eqs = {}
    for ed in eqs_data:
        eq = db.query(Equipement).filter(Equipement.code == ed["code"]).first()
        if not eq:
            eq = Equipement(**ed)
            db.add(eq)
            db.commit()
            db.refresh(eq)
            print(f"Created equipement: {eq.nom}")
        eqs[ed["code"]] = eq

    from seed_data import ALL_FICHES

    for f_data in ALL_FICHES:
        eq = eqs[f_data["code"]]
        data = f_data["data"]
        
        # Check if Fiche already exists
        fiche = db.query(FicheTemplate).filter(FicheTemplate.reference == data["reference"]).first()
        if not fiche:
            fiche = FicheTemplate(
                equipement_id=eq.id,
                nom=data["nom"],
                reference=data["reference"]
            )
            db.add(fiche)
            db.commit()
            db.refresh(fiche)
            print(f"Created Fiche: {fiche.nom}")

            # Create Sections and Items
            for s_idx, section_data in enumerate(data["sections"]):
                section = Section(
                    fiche_template_id=fiche.id,
                    titre=section_data["titre"],
                    ordre=s_idx + 1
                )
                db.add(section)
                db.commit()
                db.refresh(section)

                for i_idx, item_data in enumerate(section_data["items"]):
                    item = Item(
                        section_id=section.id,
                        equipement_label=item_data["label"],
                        controle_description=item_data["desc"],
                        type=ItemTypeEnum(item_data["type"]),
                        ordre=i_idx + 1
                    )
                    db.add(item)
                    db.commit()
                    db.refresh(item)

                    if item_data["type"] == "numerique" and "mesures" in item_data:
                        for m_idx, mesure_data in enumerate(item_data["mesures"]):
                            mesure = ItemMesure(
                                item_id=item.id,
                                label=mesure_data["label"],
                                unite=mesure_data["unite"],
                                ordre=m_idx + 1
                            )
                            db.add(mesure)
                        db.commit()

    print("Database seeding completed successfully.")

if __name__ == "__main__":
    seed_db()
