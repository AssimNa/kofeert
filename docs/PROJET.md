# PROMPT PROJET — Application de Gestion des Inspections Industrielles KOFERT

---

## CONTEXTE DU PROJET

Tu es un expert développeur full-stack. Tu vas m'aider à développer une application complète de gestion et suivi des inspections industrielles pour l'entreprise **Kofert**, sur le site **Jorf Fertilizers Company 3** au Maroc.

Actuellement, les techniciens réalisent leurs inspections quotidiennes des équipements électriques **sur papier**. L'objectif est de numériser complètement ce processus via une application web (React) et mobile (React Native Android).

---

## STACK TECHNOLOGIQUE — NON NÉGOCIABLE

| Couche | Technologie |
|--------|------------|
| Backend | FastAPI (Python) |
| Base de données | MySQL |
| ORM | SQLAlchemy + Alembic (migrations) |
| Authentification | JWT (JSON Web Token) |
| Frontend Web | React.js + Tailwind CSS |
| Mobile | React Native (Android en priorité) |
| Communication API | Axios → FastAPI REST |
| Génération PDF | WeasyPrint ou ReportLab |
| Alertes email | FastAPI-Mail |
| Mode hors-ligne mobile | AsyncStorage + sync queue |

---

## LES 3 RÔLES UTILISATEURS

### Technicien
- Remplit les fiches d'inspection terrain sur mobile Android
- Saisit ✓ Conforme / ✗ Non-conforme pour chaque point
- Saisit les mesures numériques (kV, A, °C, bar, MW, coups)
- Ajoute des remarques optionnelles sur chaque point
- Travaille hors-ligne, sync auto au retour du réseau
- Consulte son historique personnel via calendrier

### Superviseur
- Reçoit toutes les fiches soumises de son périmètre
- Reçoit une alerte email automatique si anomalie détectée
- Valide les fiches ou ouvre une fiche anomalie
- Assigne les anomalies à un responsable
- Gère les statuts : Ouverte → En cours → Clôturée
- Documente les actions correctives

### Administrateur
- Tableau de bord global (KPIs, taux de conformité, anomalies actives)
- Gère utilisateurs, rôles, équipements, check-lists
- Exporte rapports PDF et Excel
- Accès au journal d'audit complet

---

## LES 3 FICHES D'INSPECTION — DONNÉES COMPLÈTES ET EXACTES

> Ces données doivent être seedées EXACTEMENT telles quelles dans la base de données.
> Chaque point a un type : ✓/✗ (binaire) ou NUMÉRIQUE (avec champs de mesure).
> Les remarques sont OPTIONNELLES sur tous les points.

---

### ═══════════════════════════════════════════
### FICHE 1 — Transformateur élévateur 622AEC03
### ═══════════════════════════════════════════
**Superviseur** : Superviseur Local HT
**Référence** : 4-3:230 / 16KV-4704-6
**Total points** : 37

#### SECTION 1 : Local HT et local transformateur

| # | Équipement | Contrôle / Inspection | Type |
|---|-----------|----------------------|------|
| 1 | Éclairage | Contrôler l'état d'éclairage et de la propreté du local | ✓/✗ |
| 2 | Local — isolation hydraulique | Vérifier l'absence d'infiltration d'eau | ✓/✗ |
| 3 | Extracteur d'air | Contrôler le fonctionnement des extracteurs d'air | ✓/✗ |
| 4 | Équipements de protection incendie | Contrôler l'état des équipements de protection incendie (Armoire DI, extincteurs) | ✓/✗ |
| 5 | Climatiseur | Contrôler le bon fonctionnement des climatiseurs installés dans le local | ✓/✗ |
| 6 | Équipements de protection personnel (EPI) | Contrôler l'état des équipements de protection personnelle disponibles dans le local | ✓/✗ |

#### SECTION 2 : Transformateur élévateur

| # | Équipement | Contrôle / Inspection | Type |
|---|-----------|----------------------|------|
| 7 | Transformateur — contrôle visuel | Faire un contrôle visuel du transformateur, vérifier l'absence de bruit, d'odeur et d'échauffement anormaux | ✓/✗ |
| 8 | Transformateur — fuites d'huile | Vérifier l'absence de fuites d'huile sur n'importe quelle partie du transformateur | ✓/✗ |
| 9 | Déshydratateur du silicagel | Contrôler l'état du silicagel dans les déshydratateurs | ✓/✗ |
| 10 | Ventilateur de refroidissement | Contrôler le fonctionnement des ventilateurs de refroidissement du transformateur | ✓/✗ |
| 11 | Relais de protection — mesures primaire/secondaire | Enregistrer la tension, le courant et la puissance active au primaire et au secondaire | **NUMÉRIQUE** → Tension primaire (kV) · Courant primaire (A) · Puissance active (MW) · Tension secondaire (kV) · Courant secondaire (A) |
| 12 | Transformateur 16KV-4704-6 — températures | Enregistrer la tension, le courant et les températures : huile, enroulements et ambiant | **NUMÉRIQUE** → Tension (kV) · Courant (A) · Temp. huile (°C) · Temp. enroulements (°C) · Temp. ambiante (°C) |
| 13 | Indicateur de niveau d'huile | Contrôler le niveau d'huile, vérifier l'absence de fuites du transformateur | ✓/✗ |
| 14 | Cuve transformateur | Faire un contrôle visuel de la cuve/enveloppe du transformateur, nettoyer | ✓/✗ |
| 15 | Transformateur — état peinture | Contrôler l'état de la peinture, surtout sur les soudures et les joints | ✓/✗ |
| 16 | Mise à la terre | Contrôle visuel de l'état et la continuité de la mise à la terre | ✓/✗ |
| 17 | Câble de puissance | Contrôle visuel de l'état des terminaisons (têtes, cosses) de câbles, traces d'échauffement et d'arcs électriques | ✓/✗ |
| 18 | Isolateurs HT & MT | Contrôler l'état des isolateurs, vérifier l'absence de fissures | ✓/✗ |
| 19 | Tuyauterie du transformateur | Contrôler l'état de la tuyauterie, rechercher toute éventuelle présence de fuite d'huile | ✓/✗ |
| 20 | Boîtes à câbles | Contrôler l'état des boîtes, vérifier l'absence de fuite d'huile | ✓/✗ |
| 21 | Analyseur d'huile en ligne — enveloppe | Contrôler l'état de l'enveloppe et de l'extérieur de l'analyseur | ✓/✗ |
| 22 | Analyseur d'huile en ligne — lampes | Contrôler l'état de toutes les lampes de signalisation | ✓/✗ |
| 23 | Analyseur d'huile en ligne — câbles/bornes | Examiner l'état des câbles, des bornes et des presse-étoupes | ✓/✗ |
| 24 | Fosse de récupération d'huile | Faire un contrôle visuel de l'état de la fosse de récupération d'huile, vérifier le bon état | ✓/✗ |

#### SECTION 3 : Traversée HT

| # | Équipement | Contrôle / Inspection | Type |
|---|-----------|----------------------|------|
| 25 | Traversées HT | Inspection des connexions, rechercher les traces d'échauffement | ✓/✗ |

#### SECTION 4 : Disjoncteur de ligne HT

| # | Équipement | Contrôle / Inspection | Type |
|---|-----------|----------------------|------|
| 26 | Densimètre SF6 | Contrôler le niveau de pression du gaz SF6 (lire sur densimètre), signaler chaque décalage | **NUMÉRIQUE** → Pression SF6 (bar) |
| 27 | Relais de protection | Faire un contrôle visuel des alarmes (distant) du disjoncteur | ✓/✗ |
| 28 | Mise à la terre | Contrôle visuel de l'état de tous les points de la mise à la terre | ✓/✗ |
| 29 | Isolateurs | Faire un contrôle visuel de l'état des isolateurs du disjoncteur | ✓/✗ |

#### SECTION 5 : Sectionneur de ligne HT

| # | Équipement | Contrôle / Inspection | Type |
|---|-----------|----------------------|------|
| 30 | Sectionneur HT | Faire un contrôle visuel de l'état du sectionneur de ligne HT | ✓/✗ |
| 31 | Contacts principaux | Contrôler l'état des contacts principaux | ✓/✗ |
| 32 | Connexions primaires | Contrôler l'état des connexions primaires | ✓/✗ |
| 33 | Isolateurs | Contrôler l'état des isolateurs du sectionneur | ✓/✗ |
| 34 | Mise à la terre | Contrôle visuel de l'état de tous les points de la mise à la terre, resserrer si nécessaire | ✓/✗ |

#### SECTION 6 : Transformateur combiné de mesure

| # | Équipement | Contrôle / Inspection | Type |
|---|-----------|----------------------|------|
| 35 | Transformateur combiné de mesure | Faire un contrôle visuel de l'état de la combiné de mesure | ✓/✗ |
| 36 | Connexions primaires | Contrôler l'état des connexions primaires | ✓/✗ |
| 37 | Connexions secondaires | Contrôler l'état des connexions secondaires | ✓/✗ |
| 38 | Indicateur de niveau d'huile | Contrôler le niveau d'huile, vérifier l'absence de fuites | ✓/✗ |
| 39 | Mise à la terre | Contrôle visuel de l'état de tous les points de la mise à la terre | ✓/✗ |

#### SECTION 7 : Armoire tranche arrivée GSU (4-3:230)

| # | Équipement | Contrôle / Inspection | Type |
|---|-----------|----------------------|------|
| 40 | Armoire | Faire un contrôle visuel à l'extérieur de l'armoire, vérifier l'absence de bruit, d'échauffement et d'odeur anormaux | ✓/✗ |
| 41 | Relais de protection | Enregistrer/lire sur le relais de protection la valeur des grandeurs électriques mesurées, signaler chaque incohérence | ✓/✗ |
| 42 | Mise à la terre | Contrôle visuel de l'état de tous les points de mise à la terre | ✓/✗ |

---

### ═══════════════════════════════════════════
### FICHE 2 — Chargeurs batteries & onduleur
### ═══════════════════════════════════════════
**Superviseur** : Superviseur Salle Batteries
**Référence** : W.JEJA
**Total points** : 30

#### SECTION 1 : Local chargeurs batteries et onduleurs — généralités

| # | Équipement | Contrôle / Inspection | Type |
|---|-----------|----------------------|------|
| 1 | Propreté | S'assurer de la propreté de la salle | ✓/✗ |
| 2 | Éclairage | Contrôler l'état d'éclairage | ✓/✗ |
| 3 | Température | Contrôler le bon fonctionnement du climatiseur et s'assurer qu'il maintient une température adéquate dans la salle | **NUMÉRIQUE** → Température salle (°C) |

#### SECTION 2 : Onduleurs + Stabilisateur

| # | Équipement | Contrôle / Inspection | Type |
|---|-----------|----------------------|------|
| 4 | Alarmes afficheur onduleur | Contrôler les alarmes sur l'afficheur, vérifier l'absence de défaut | ✓/✗ |
| 5 | Communication armoire onduleur | Contrôler l'état de communication de l'armoire onduleur, vérifier le bon fonctionnement | ✓/✗ |
| 6 | Partage de charge entre onduleurs | Contrôler le partage de la charge entre onduleurs N°1 et N°2, vérifier la symétrie (I1=I2 ± 5%) | **NUMÉRIQUE** → Courant onduleur N°1 (A) · Courant onduleur N°2 (A) |
| 7 | Voltmètre / ampèremètre onduleur | Contrôler l'état du voltmètre et de l'ampèremètre, comparer les valeurs indiquées avec celles assignées | **NUMÉRIQUE** → Tension (V) · Courant (A) |
| 8 | Ventilateurs de refroidissement | Faire un contrôle visuel de tous les ventilateurs de refroidissement | ✓/✗ |
| 9 | Armoire stabilisateur et distribution | Faire un contrôle visuel de l'armoire stabilisateur et de l'armoire de distribution, vérifier l'absence de traces de corrosion | ✓/✗ |
| 10 | Portes des armoires | Contrôler l'état des portes des armoires, vérifier leur bon état | ✓/✗ |
| 11 | Armoire bypass / enveloppe onduleur | Faire un contrôle visuel de l'armoire bypass et de l'enveloppe onduleur et de l'intérieur d'armoire, vérifier l'absence de traces de corrosion | ✓/✗ |
| 12 | Mises à la terre onduleurs | Contrôle visuel des mises à la terre | ✓/✗ |

#### SECTION 3 : Chargeurs batteries

| # | Équipement | Contrôle / Inspection | Type |
|---|-----------|----------------------|------|
| 13 | Alarmes afficheur chargeur | Contrôler les alarmes sur l'afficheur, vérifier l'absence de défaut | ✓/✗ |
| 14 | Communication armoire chargeur | Contrôler l'état de communication de l'armoire chargeur batterie, vérifier le bon fonctionnement | ✓/✗ |
| 15 | Voltmètre / ampèremètre chargeur | Contrôler l'état du voltmètre et de l'ampèremètre, comparer les valeurs indiquées avec celles assignées | **NUMÉRIQUE** → Tension chargeur (V) · Courant chargeur (A) |
| 16 | Lampes de signalisation | Contrôler l'état de toutes les lampes de signalisation du chargeur | ✓/✗ |
| 17 | Composants installés — échauffement | Faire un contrôle visuel de tous les composants installés du chargeur, vérifier l'absence de traces d'échauffement | ✓/✗ |
| 18 | Compartiment de distribution | Faire un contrôle visuel du compartiment de distribution, vérifier l'absence de traces d'échauffement | ✓/✗ |
| 19 | Ventilateurs refroidissement chargeur | Vérifier le bon fonctionnement des ventilateurs de refroidissement des chargeurs | ✓/✗ |
| 20 | Portes chargeur | Contrôler l'état des portes, vérifier leur bon état | ✓/✗ |
| 21 | Connexions chargeur | Faire un contrôle visuel de toutes les connexions du chargeur, vérifier l'absence de traces d'échauffement | ✓/✗ |

#### SECTION 4 : Salle batteries — bloc batteries

| # | Équipement | Contrôle / Inspection | Type |
|---|-----------|----------------------|------|
| 22 | Propreté salle batteries | S'assurer de la propreté de la salle et vérifier qu'il n'y a pas de liquides renversés ou d'acide | ✓/✗ |
| 23 | Ventilation salle batteries | Vérifier le bon fonctionnement des systèmes de ventilation | ✓/✗ |
| 24 | Éclairages salle batteries | Assurer le bon fonctionnement des luminaires et signaler tout luminaire défectueux ou présentant un éclairage insuffisant | ✓/✗ |
| 25 | Bloc batterie — contrôle visuel | Faire un contrôle visuel du bloc batterie, vérifier le bon état et l'absence de fuite | ✓/✗ |
| 26 | Cellules batteries | Vérifier l'absence de fissures ou de dommages sur les cellules des batteries | ✓/✗ |
| 27 | Niveau électrolyte | Contrôler le niveau de l'électrolyte des cellules, si nécessaire rajouter de l'eau distillée | ✓/✗ |
| 28 | Sulfate sur bornes et cales | Vérifier l'absence de sulfate sur les bornes et les cales des batteries, nettoyer les surfaces si nécessaire pour éviter les accumulations | ✓/✗ |
| 29 | État des bornes | Vérifier que les bornes sont propres et exemptes de corrosion ou d'oxydation | ✓/✗ |
| 30 | Fixation batteries | S'assurer que les batteries sont bien fixées dans leurs supports | ✓/✗ |

---

### ═══════════════════════════════════════════
### FICHE 3 — Transformateur abaisseur 622AEC01
### ═══════════════════════════════════════════
**Superviseur** : Superviseur Local HT
**Référence** : 4-3:m (Jorf Fertilizers Company 3)
**Total points** : 50

#### SECTION 1 : Local HT et local transformateur

| # | Équipement | Contrôle / Inspection | Type |
|---|-----------|----------------------|------|
| 1 | Éclairage | Contrôler l'état d'éclairage et de la propreté du local | ✓/✗ |
| 2 | Local — isolation hydraulique | Vérifier l'absence d'infiltration d'eau | ✓/✗ |
| 3 | Extracteur d'air | Contrôler le fonctionnement des extracteurs d'air | ✓/✗ |
| 4 | Équipements de protection incendie | Contrôler l'état des équipements de protection incendie (Armoire DI, extincteurs) | ✓/✗ |
| 5 | Climatiseur | Contrôler le bon fonctionnement des climatiseurs installés dans le local | ✓/✗ |
| 6 | Équipements de protection personnel (EPI) | Contrôler l'état des équipements de protection personnelle disponibles dans le local | ✓/✗ |

#### SECTION 2 : Transformateur abaisseur

| # | Équipement | Contrôle / Inspection | Type |
|---|-----------|----------------------|------|
| 7 | Transformateur — contrôle visuel | Faire un contrôle visuel du transformateur, vérifier l'absence de bruit, d'odeur et d'échauffement anormaux | ✓/✗ |
| 8 | Transformateur — fuites d'huile | Vérifier l'absence de fuites d'huile sur n'importe quelle partie du transformateur | ✓/✗ |
| 9 | Déshydratateur du silicagel | Contrôler l'état du silicagel dans les déshydratateurs | ✓/✗ |
| 10 | Ventilateur de refroidissement | Contrôler le fonctionnement des ventilateurs de refroidissement du transformateur | ✓/✗ |
| 11 | Transformateur — températures et mesures | Enregistrer la tension, le courant et les températures : huile, enroulements et ambiant | **NUMÉRIQUE** → Tension (kV) · Courant (A) · Temp. huile (°C) · Temp. enroulements (°C) · Temp. ambiante (°C) |
| 12 | Indicateur de niveau d'huile | Contrôler le niveau d'huile, vérifier l'absence de fuites du transformateur | ✓/✗ |
| 13 | Cuve transformateur | Faire un contrôle visuel de la cuve/enveloppe du transformateur | ✓/✗ |
| 14 | Transformateur — état peinture | Contrôler l'état de la peinture, surtout sur les soudures et les joints | ✓/✗ |
| 15 | Mise à la terre | Contrôle visuel de la mise à la terre | ✓/✗ |
| 16 | Câble de puissance | Contrôle visuel de l'état des terminaisons (têtes, cosses) de câbles, traces d'échauffement et d'arcs électriques | ✓/✗ |
| 17 | Isolateurs HT & MT | Contrôle visuel de l'état des isolateurs, vérifier l'absence de fissures | ✓/✗ |
| 18 | Tuyauterie du transformateur | Contrôler l'état de la tuyauterie, rechercher toute éventuelle présence de fuite d'huile | ✓/✗ |
| 19 | Régulateur de tension | Contrôler l'état du régulateur de tension, vérifier le bon état | ✓/✗ |
| 20 | Fosse de récupération d'huile | Faire un contrôle visuel de l'état de la fosse de récupération d'huile, vérifier le bon état | ✓/✗ |

#### SECTION 3 : Traversée HT

| # | Équipement | Contrôle / Inspection | Type |
|---|-----------|----------------------|------|
| 21 | Traversées HT | Examiner les connexions, rechercher les traces d'échauffement | ✓/✗ |

#### SECTION 4 : Transformateur de source auxiliaire (TSA)

| # | Équipement | Contrôle / Inspection | Type |
|---|-----------|----------------------|------|
| 22 | Transformateur de source auxiliaire | Faire un contrôle visuel du transformateur, vérifier l'absence de bruit, d'odeur, d'échauffement anormaux | ✓/✗ |
| 23 | Relais de protection TSA — températures | Enregistrer/lire sur le relais la valeur des températures des enroulements, signaler chaque incohérence | **NUMÉRIQUE** → Temp. enroulement 1 (°C) · Temp. enroulement 2 (°C) |
| 24 | Enveloppe transformateur TSA | Faire un contrôle visuel de l'enveloppe du transformateur | ✓/✗ |
| 25 | Mise à la terre TSA | Contrôle visuel de l'état et la continuité de la mise à la terre | ✓/✗ |
| 26 | Câbles TSA | Faire un contrôle visuel de tous les câbles du transformateur, rechercher la présence de détérioration/endommagement | ✓/✗ |
| 27 | Bornes de connexion TSA | Examiner l'état des terminaisons (têtes, cosses) de câbles, rechercher des traces d'échauffement | ✓/✗ |
| 28 | Fusibles MT TSA | Contrôle visuel de l'état des fusibles MT du transformateur TSA | ✓/✗ |

#### SECTION 5 : Disjoncteur de ligne HT

| # | Équipement | Contrôle / Inspection | Type |
|---|-----------|----------------------|------|
| 29 | Densimètre SF6 | Contrôler le niveau de pression du gaz SF6 (lire sur densimètre), signaler chaque décalage | **NUMÉRIQUE** → Pression SF6 (bar) |
| 30 | Relais de protection | Faire un contrôle visuel des alarmes (distant) du disjoncteur | ✓/✗ |
| 31 | Mise à la terre | Contrôle visuel de l'état de tous les points de la mise à la terre | ✓/✗ |
| 32 | Isolateurs | Faire un contrôle visuel de l'état des isolateurs du disjoncteur | ✓/✗ |

#### SECTION 6 : Sectionneur de ligne HT

| # | Équipement | Contrôle / Inspection | Type |
|---|-----------|----------------------|------|
| 33 | Sectionneur HT | Faire un contrôle visuel de l'état du sectionneur de ligne HT | ✓/✗ |
| 34 | Contacts principaux | Contrôle visuel de l'état des contacts principaux | ✓/✗ |
| 35 | Connexions primaires | Contrôle visuel de l'état des connexions primaires | ✓/✗ |
| 36 | Isolateurs | Contrôle visuel de l'état des isolateurs du sectionneur | ✓/✗ |
| 37 | Mise à la terre | Contrôle visuel de l'état de tous les points de la mise à la terre | ✓/✗ |

#### SECTION 7 : Transformateur combiné de mesure

| # | Équipement | Contrôle / Inspection | Type |
|---|-----------|----------------------|------|
| 38 | Transformateur combiné de mesure | Faire un contrôle visuel de l'état de la combiné de mesure | ✓/✗ |
| 39 | Connexions primaires | Contrôler l'état des connexions primaires | ✓/✗ |
| 40 | Connexions secondaires | Contrôler l'état des connexions secondaires | ✓/✗ |
| 41 | Indicateur de niveau d'huile | Contrôler le niveau d'huile | ✓/✗ |
| 42 | Mise à la terre | Contrôle visuel de l'état de tous les points de la mise à la terre | ✓/✗ |

#### SECTION 8 : Limiteur de surtension

| # | Équipement | Contrôle / Inspection | Type |
|---|-----------|----------------------|------|
| 43 | Limiteur de surtension — contrôle visuel | Faire un contrôle visuel de l'état du limiteur de surtension | ✓/✗ |
| 44 | Compteur de décharges | Noter le nombre de décharges du compteur de décharges | **NUMÉRIQUE** → Nb. décharges (coups) |
| 45 | Limiteur de surtension — 2ème | Faire un contrôle visuel de l'état du limiteur de surtension | ✓/✗ |
| 46 | Connexions primaires limiteur | Contrôler l'état des connexions primaires | ✓/✗ |
| 47 | Compteur de décharges — connexions | Contrôler l'état des compteurs de décharges et de ces connexions | ✓/✗ |
| 48 | Isolateurs limiteur | Contrôler l'état des isolateurs, vérifier le bon état | ✓/✗ |
| 49 | Mise à la terre limiteur | Contrôle visuel de l'état de tous les points de la mise à la terre | ✓/✗ |

#### SECTION 9 : Armoire tranche départ transformateur

| # | Équipement | Contrôle / Inspection | Type |
|---|-----------|----------------------|------|
| 50 | Armoire | Faire un contrôle visuel à l'extérieur de l'armoire, vérifier l'absence de bruit, d'échauffement et d'odeur anormaux | ✓/✗ |
| 51 | Relais de protection | Enregistrer/lire sur le relais de protection la valeur des grandeurs électriques mesurées, signaler chaque incohérence | ✓/✗ |

---

## RÉSUMÉ DES FICHES

| Fiche | Équipement | Superviseur | Sections | Points totaux |
|-------|-----------|-------------|----------|---------------|
| 1 | Transformateur élévateur 622AEC03 | Superviseur Local HT | 7 | 42 |
| 2 | Chargeurs batteries & onduleur | Superviseur Salle Batteries | 4 | 30 |
| 3 | Transformateur abaisseur 622AEC01 | Superviseur Local HT | 9 | 51 |

**Points avec saisie numérique :**
- Fiche 1 : points #11 (5 mesures), #12 (5 mesures), #26 (1 mesure) = 11 valeurs numériques
- Fiche 2 : points #3 (1 mesure), #6 (2 mesures), #7 (2 mesures), #15 (2 mesures) = 7 valeurs numériques
- Fiche 3 : points #11 (5 mesures), #23 (2 mesures), #29 (1 mesure), #44 (1 mesure) = 9 valeurs numériques

---

## FONCTIONNALITÉS V1 — OBLIGATOIRES

### Inspection terrain
- Sélection de la fiche du jour selon l'équipement/local
- Check-list : ✓ Conforme / ✗ Non-conforme sur chaque point
- Champs numériques avec unité sur les points NUMÉRIQUE
- Remarque texte optionnelle sur chaque point
- Barre de progression (X / Total points vérifiés)
- Bouton "Envoyer au superviseur" bloqué tant que tous les points ne sont pas remplis
- Avertissement visuel si non-conformité avant envoi
- Une fiche soumise est **IMMUABLE** (lecture seule dans l'historique)

### Calendrier & historique — DÉTAIL COMPLET

#### Écran 1 : Vue calendrier mensuel
- Affichage grille 7 colonnes (Lun → Dim)
- Navigation mois précédent / mois suivant
- En-tête : "Inspections du jour — Kofert · Jorf Fertilizers Company 3"
- Chaque case jour affiche :
  - Le numéro du jour
  - Un ou plusieurs indicateurs couleur selon le statut des fiches ce jour-là

**Règles de couleur par jour (priorité dans cet ordre) :**

| Couleur | Condition | Affichage |
|---------|-----------|-----------|
| 🟢 Vert (#1D9E75) | Toutes les fiches soumises ET toutes conformes | Barre verte sous le numéro |
| 🟠 Orange (#EF9F27) | Au moins une fiche avec anomalie détectée | Barre orange sous le numéro |
| 🔴 Rouge (#E24B4A) | Au moins une fiche non soumise (jour passé ouvrable) | Barre rouge sous le numéro |
| 🔵 Bleu (#85B7EB) | Fiches partiellement soumises (pas toutes) | Barre bleue sous le numéro |
| Aucun | Jour futur ou weekend | Case vide, jour grisé non cliquable |
| Cercle vert | Aujourd'hui | Numéro du jour dans un cercle vert |

**Comportement :**
- Les jours passés avec données sont **cliquables**
- Les jours futurs et weekends sont **non cliquables**
- Les jours sans aucune fiche soumise (jours ouvrables passés) affichent la barre rouge

#### Écran 2 : Vue détail d'un jour (après clic sur un jour)
- En-tête : date complète (ex: "1 Mai 2026") + bouton retour calendrier
- **Barre de résumé 3 métriques** :
  - Total fiches soumises ce jour
  - Nombre de fiches conformes (en vert)
  - Nombre de fiches avec anomalie (en orange)
- **Bandeau statut global** :
  - Si anomalie → bandeau rouge : "X anomalie(s) détectée(s) ce jour — alertes envoyées aux superviseurs"
  - Si tout conforme → bandeau vert : "Toutes les fiches sont conformes. Rapports PDF générés et transmis."
- **Liste des fiches du jour** (cartes cliquables) :
  - Nom de la fiche (ex: "Transformateur élévateur 622AEC03")
  - Méta : "X/Y points · Superviseur concerné"
  - Badge statut :
    - Badge vert "Conforme" si aucune anomalie
    - Badge orange "X anomalie(s)" si non-conformités
    - Badge rouge "Non soumis" si fiche manquante
  - Chevron "›" à droite pour indiquer que c'est cliquable

#### Écran 3 : Détail d'une fiche passée (lecture seule)
- En-tête : nom de la fiche + superviseur + "X/Y points" + bouton retour
- **Bandeau résumé** :
  - Vert si conforme : "Fiche conforme — rapport PDF transmis au superviseur"
  - Rouge si anomalie : "X non-conformité(s) — alerte envoyée au superviseur"
- **Affichage par section** (même structure que lors de la saisie) :
  - Titre de section en header gris
  - Pour chaque point :
    - ✓ vert si conforme, ✗ rouge si non-conforme
    - Nom de l'équipement (gras)
    - Description du contrôle (gris, plus petit)
    - Si mesures numériques : chips bleues avec valeur + unité (ex: "Temp. huile : 62 °C")
    - Si remarque : encadré orange avec le texte de la remarque
- **IMPORTANT** : ce détail est en LECTURE SEULE — aucun champ modifiable

#### Accès au calendrier selon les rôles

| Rôle | Ce qu'il voit dans le calendrier |
|------|----------------------------------|
| Technicien | Uniquement SES propres fiches soumises |
| Superviseur | Toutes les fiches de son périmètre d'équipement |
| Admin | Toutes les fiches de tous les équipements |

#### Route API calendrier (FastAPI)

```python
# Retourne pour chaque jour du mois le statut global
GET /api/inspections/calendar?mois=5&annee=2026

# Réponse attendue
{
  "2026-05-01": {
    "statut": "conforme",       # conforme | anomalie | partiel | manquant
    "fiches_soumises": 3,
    "fiches_total": 3,
    "anomalies": 0
  },
  "2026-05-02": {
    "statut": "anomalie",
    "fiches_soumises": 3,
    "fiches_total": 3,
    "anomalies": 2
  },
  "2026-05-03": {
    "statut": "manquant",
    "fiches_soumises": 0,
    "fiches_total": 3,
    "anomalies": 0
  }
}

# Détail des fiches d'un jour spécifique
GET /api/inspections/jour?date=2026-05-01

# Détail complet d'une fiche soumise (lecture seule)
GET /api/inspections/{inspection_id}
```

#### Composants React / React Native à créer

**Web (React) :**
```
CalendrierPage.jsx       ← grille mensuelle + navigation mois
  └── CalendarDay.jsx    ← case individuelle avec couleur + clic
DetailJourPage.jsx       ← liste fiches du jour + résumé
DetailFichePage.jsx      ← fiche complète lecture seule
  └── SectionDetail.jsx  ← une section avec ses items
  └── ItemDetail.jsx     ← un point : icône ✓/✗ + mesures + remarque
```

**Mobile (React Native) :**
```
CalendrierScreen.js      ← même logique, adapté tactile
DetailJourScreen.js
DetailFicheScreen.js
```

### Gestion des anomalies
- Création automatique fiche anomalie si point Non-conforme à la soumission
- Statuts : Ouverte → En cours → Clôturée
- Assignation à un responsable
- Documentation des actions correctives

### Alertes
- Email automatique au superviseur concerné dès soumission avec anomalie
- Contenu : technicien, date, équipement, points non-conformes, mesures, remarques

### Rapports
- PDF automatique après chaque soumission
- Export Excel de l'historique

### Administration
- CRUD utilisateurs (créer, modifier, désactiver)
- CRUD équipements par site/local
- Configuration dynamique des check-lists
- Tableau de bord KPIs globaux
- Journal d'audit (qui, quoi, quand)

---

## FONCTIONNALITÉS V2 — OPTIONNELLES

- Signature électronique tactile avant soumission
- Notifications push Android
- Publication Google Play Store
- Graphiques d'évolution des mesures par équipement
- Application iOS
- Comparaison historique des mesures

---

## BESOINS NON FONCTIONNELS

| Critère | Exigence |
|---------|---------|
| Sécurité | JWT obligatoire, HTTPS, journal d'audit |
| Performance | Affichage < 2 secondes, 50 utilisateurs simultanés |
| Hors-ligne | Mobile fonctionne sans réseau, sync automatique au retour |
| Interface | Tactile, optimisée téléphone Android et tablette |
| Sauvegarde | Quotidienne automatique MySQL |
| Immuabilité | Fiche soumise = lecture seule, jamais modifiable |

---

## SCHÉMA BASE DE DONNÉES MySQL

```sql
-- Utilisateurs
users (
  id INT PK AUTO_INCREMENT,
  nom VARCHAR(100),
  prenom VARCHAR(100),
  email VARCHAR(150) UNIQUE,
  password_hash VARCHAR(255),
  role ENUM('admin', 'superviseur', 'technicien'),
  actif BOOLEAN DEFAULT TRUE,
  created_at DATETIME
)

-- Équipements / locaux
equipements (
  id INT PK AUTO_INCREMENT,
  nom VARCHAR(200),
  code VARCHAR(50),
  site VARCHAR(100),
  local VARCHAR(100),
  superviseur_id INT FK → users.id,
  actif BOOLEAN DEFAULT TRUE
)

-- Templates de fiches (check-lists)
fiches_template (
  id INT PK AUTO_INCREMENT,
  equipement_id INT FK → equipements.id,
  nom VARCHAR(200),
  reference VARCHAR(100),
  version INT DEFAULT 1,
  actif BOOLEAN DEFAULT TRUE,
  created_at DATETIME
)

-- Sections d'une fiche
sections (
  id INT PK AUTO_INCREMENT,
  fiche_template_id INT FK → fiches_template.id,
  titre VARCHAR(200),
  ordre INT
)

-- Points d'inspection
items (
  id INT PK AUTO_INCREMENT,
  section_id INT FK → sections.id,
  equipement_label VARCHAR(200),
  controle_description TEXT,
  type ENUM('binaire', 'numerique'),
  ordre INT,
  actif BOOLEAN DEFAULT TRUE
)

-- Champs numériques d'un item (plusieurs par item possible)
item_mesures (
  id INT PK AUTO_INCREMENT,
  item_id INT FK → items.id,
  label VARCHAR(100),
  unite VARCHAR(20),
  obligatoire BOOLEAN DEFAULT TRUE,
  ordre INT
)

-- Sessions d'inspection (une fiche remplie un jour J)
inspections (
  id INT PK AUTO_INCREMENT,
  fiche_template_id INT FK → fiches_template.id,
  technicien_id INT FK → users.id,
  date_inspection DATE,
  statut ENUM('brouillon', 'soumise') DEFAULT 'brouillon',
  soumis_le DATETIME NULL,
  synced BOOLEAN DEFAULT FALSE,
  created_at DATETIME
)

-- Résultats par point d'inspection
resultats (
  id INT PK AUTO_INCREMENT,
  inspection_id INT FK → inspections.id,
  item_id INT FK → items.id,
  resultat ENUM('conforme', 'non_conforme'),
  remarque TEXT NULL
)

-- Valeurs numériques saisies
mesures_valeurs (
  id INT PK AUTO_INCREMENT,
  resultat_id INT FK → resultats.id,
  item_mesure_id INT FK → item_mesures.id,
  valeur DECIMAL(10,3)
)

-- Anomalies détectées
anomalies (
  id INT PK AUTO_INCREMENT,
  inspection_id INT FK → inspections.id,
  item_id INT FK → items.id,
  resultat_id INT FK → resultats.id,
  statut ENUM('ouverte', 'en_cours', 'cloturee') DEFAULT 'ouverte',
  assigne_a INT FK → users.id NULL,
  description_action TEXT NULL,
  created_at DATETIME,
  closed_at DATETIME NULL
)

-- Journal d'audit
audit_log (
  id INT PK AUTO_INCREMENT,
  user_id INT FK → users.id,
  action VARCHAR(100),
  table_cible VARCHAR(100),
  record_id INT,
  details_json JSON,
  timestamp DATETIME
)
```

---

## STRUCTURE DU PROJET

```
kofert-app/
├── backend/                        ← FastAPI Python
│   ├── app/
│   │   ├── main.py                 ← Point d'entrée + CORS
│   │   ├── config.py               ← Variables .env
│   │   ├── database.py             ← Connexion MySQL + SQLAlchemy session
│   │   ├── models/                 ← Modèles SQLAlchemy
│   │   │   ├── user.py
│   │   │   ├── equipement.py
│   │   │   ├── fiche.py
│   │   │   ├── section.py
│   │   │   ├── item.py
│   │   │   ├── inspection.py
│   │   │   ├── resultat.py
│   │   │   ├── anomalie.py
│   │   │   └── audit.py
│   │   ├── schemas/                ← Schémas Pydantic (validation)
│   │   ├── routers/                ← Routes API
│   │   │   ├── auth.py
│   │   │   ├── fiches.py
│   │   │   ├── inspections.py
│   │   │   ├── anomalies.py
│   │   │   ├── rapports.py
│   │   │   └── admin.py
│   │   ├── services/               ← Logique métier
│   │   │   ├── pdf_service.py
│   │   │   ├── email_service.py
│   │   │   └── audit_service.py
│   │   └── middlewares/
│   │       └── auth.py             ← Vérification JWT + rôle
│   ├── alembic/                    ← Migrations
│   ├── seed.py                     ← Script de seed des 3 fiches réelles
│   ├── requirements.txt
│   └── .env
│
├── frontend-web/                   ← React.js
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── HomePage.jsx        ← Liste fiches du jour
│   │   │   ├── FichePage.jsx       ← Check-list avec mesures
│   │   │   ├── CalendrierPage.jsx
│   │   │   ├── DetailJourPage.jsx
│   │   │   ├── AnomaliesPage.jsx
│   │   │   └── AdminPage.jsx
│   │   ├── components/
│   │   │   ├── ChecklistItem.jsx   ← Un point : ✓/✗ + mesures + remarque
│   │   │   ├── MesureInput.jsx     ← Champ numérique avec unité
│   │   │   ├── CalendarDay.jsx
│   │   │   ├── ProgressBar.jsx
│   │   │   └── AnomalyBadge.jsx
│   │   ├── services/
│   │   │   └── api.js              ← Axios baseURL + intercepteurs JWT
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   └── hooks/
│   │       ├── useInspection.js
│   │       └── useCalendar.js
│   └── package.json
│
└── mobile/                         ← React Native Android
    ├── src/
    │   ├── screens/
    │   │   ├── LoginScreen.js
    │   │   ├── HomeScreen.js
    │   │   ├── FicheScreen.js      ← Check-list mobile tactile
    │   │   ├── CalendrierScreen.js
    │   │   └── DetailJourScreen.js
    │   ├── components/
    │   │   ├── ChecklistItem.js
    │   │   ├── MesureInput.js
    │   │   └── ProgressBar.js
    │   ├── services/
    │   │   ├── api.js
    │   │   └── syncQueue.js        ← File d'attente hors-ligne
    │   ├── storage/
    │   │   └── offlineStorage.js   ← AsyncStorage
    │   └── navigation/
    │       └── AppNavigator.js
    └── package.json
```

---

## ROUTES API FASTAPI

```
AUTH
POST   /api/auth/login                    → email + password → JWT token + rôle

FICHES
GET    /api/fiches                        → liste des fiches (selon rôle technicien)
GET    /api/fiches/{id}                   → détail fiche + sections + items + mesures

INSPECTIONS
POST   /api/inspections                   → créer session inspection (brouillon)
PUT    /api/inspections/{id}              → sauvegarder résultats en cours
POST   /api/inspections/{id}/submit       → soumettre → déclenche email + PDF + anomalies auto
GET    /api/inspections/calendar?mois=&annee=  → données calendrier (statut par jour)
GET    /api/inspections/history           → historique filtrable date/equipement
GET    /api/inspections/{id}              → détail inspection soumise (lecture seule)

ANOMALIES
GET    /api/anomalies                     → liste anomalies (superviseur/admin)
PUT    /api/anomalies/{id}/status         → changer statut
PUT    /api/anomalies/{id}/action         → documenter action corrective

RAPPORTS
GET    /api/rapports/{inspection_id}/pdf  → télécharger PDF
GET    /api/rapports/export-excel         → export Excel historique

ADMIN
GET/POST/PUT/DELETE  /api/admin/users
GET/POST/PUT/DELETE  /api/admin/equipements
GET/POST/PUT/DELETE  /api/admin/fiches
GET/POST/PUT/DELETE  /api/admin/items
GET    /api/admin/dashboard               → KPIs globaux
GET    /api/admin/audit-log               → journal d'audit
```

---

## ROADMAP — 5 PHASES

### PHASE 1 — Backend fondations (Semaines 1-3)
1. Setup FastAPI + MySQL + SQLAlchemy + Alembic
2. Créer tous les modèles SQLAlchemy (toutes les tables du schéma)
3. Faire les migrations Alembic
4. Authentification JWT avec 3 rôles (admin, superviseur, technicien)
5. Routes CRUD de base
6. **Script seed.py** : insérer les 3 vraies fiches avec tous leurs points exactement comme défini ci-dessus
7. Tester via Swagger UI http://localhost:8000/docs

### PHASE 2 — Backend métier (Semaines 4-5)
1. Route soumission inspection → création auto anomalies si non-conformité
2. Alerte email superviseur (FastAPI-Mail)
3. Génération PDF automatique (WeasyPrint)
4. Routes calendrier et historique
5. Journal d'audit sur chaque action importante

### PHASE 3 — Frontend Web React (Semaines 6-8)
1. Setup React + Tailwind + React Router + Axios
2. Login + gestion JWT localStorage
3. Page d'accueil : 3 fiches du jour avec statut
4. Page fiche : check-list ✓/✗ + champs numériques + remarques + progression
5. Calendrier mensuel couleurs + navigation
6. Vue détail jour → fiche en lecture seule
7. Interface superviseur : fiches reçues + anomalies
8. Dashboard admin

### PHASE 4 — Mobile React Native Android (Semaines 9-12)
1. Setup React Native + React Navigation + Axios + AsyncStorage
2. Login screen
3. Home screen : liste fiches
4. Fiche screen : check-list tactile avec champs numériques
5. Mode hors-ligne : stocker résultats en AsyncStorage si pas de réseau
6. Sync queue : envoyer dès retour réseau
7. Calendrier + historique mobile
8. Tests sur vrai appareil Android

### PHASE 5 — Tests & déploiement (Semaine 13)
1. Tests complets terrain
2. Corrections bugs
3. Déploiement backend Railway (dev) → VPS OVH (prod)
4. Déploiement frontend Vercel/Netlify
5. QR codes pour chaque local d'équipement
6. Formation techniciens et superviseurs

---

## RÈGLES ABSOLUES DE DÉVELOPPEMENT

1. **Back-end d'abord** : valider toutes les routes Swagger avant de toucher React
2. **Feature complète** : finir back + front + test d'une feature avant la suivante
3. **Fiche soumise = immuable** : aucune modification possible après soumission
4. **Chaque fiche → son superviseur** : alerte email au bon superviseur uniquement
5. **Bouton envoi bloqué** : tant que tous les points ne sont pas remplis
6. **Remarques optionnelles** : jamais bloquantes pour la soumission
7. **Mesures numériques obligatoires** : sur les points marqués NUMÉRIQUE
8. **JWT sur chaque route** : vérifier token ET rôle avant de répondre
9. **Hors-ligne priorité mobile** : AsyncStorage + sync queue sont non-négociables

---

## COMMANDES DE DÉMARRAGE

```bash
# ── BACKEND ──
cd backend
pip install fastapi uvicorn sqlalchemy pymysql alembic python-jose passlib[bcrypt] fastapi-mail weasyprint python-dotenv

# Lancer
uvicorn app.main:app --reload --port 8000
# Swagger : http://localhost:8000/docs

# Migrations
alembic init alembic
alembic revision --autogenerate -m "init"
alembic upgrade head

# Seed des 3 fiches
python seed.py

# ── FRONTEND WEB ──
cd frontend-web
npx create-react-app kofert-web
npm install tailwindcss axios react-router-dom

# ── MOBILE ──
cd mobile
npx react-native init KofertMobile
npm install @react-navigation/native @react-navigation/stack axios @react-native-async-storage/async-storage
```

---

## INSTRUCTION FINALE

Tu disposes de TOUTES les informations nécessaires pour développer ce projet.
Commence maintenant par la **PHASE 1** :

1. Crée la structure complète du projet FastAPI
2. Crée tous les modèles SQLAlchemy selon le schéma ci-dessus
3. Implémente l'authentification JWT avec les 3 rôles
4. Crée le script `seed.py` qui insère les **3 fiches complètes** avec **toutes leurs sections et tous leurs points** exactement comme listés dans ce document
5. Crée les routes de base et teste via Swagger UI

Ne commence pas React ni React Native avant que le backend soit validé.