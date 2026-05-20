# Suivi de Progression du Projet Kofert App

Ce document trace l'avancement global du développement selon la feuille de route établie dans `PROJET.md`.

## 🟢 PHASE 1 — Backend fondations (Semaines 1-3) : **COMPLÉTÉ (100%)**
- [x] 1. Setup FastAPI + MySQL + SQLAlchemy + Alembic
- [x] 2. Créer tous les modèles SQLAlchemy (toutes les tables du schéma)
- [x] 3. Faire les migrations Alembic (Base de données `kofert_db` créée)
- [x] 4. Authentification JWT avec 3 rôles (admin, superviseur, technicien)
- [x] 5. Routes CRUD de base (Auth, Fiches, Inspections, Anomalies, Admin)
- [x] 6. **Script seed.py** : Insertion des 3 vraies fiches avec tous leurs points
- [x] 7. Tester via Swagger UI (http://localhost:8000/docs)

---

## 🟢 PHASE 2 — Backend métier (Semaines 4-5) : **COMPLÉTÉ (100%)**
- [x] 1. Route soumission inspection → création auto anomalies si non-conformité
- [x] 2. Alerte email superviseur (FastAPI-Mail)
- [x] 3. Génération PDF automatique (ReportLab)
- [x] 4. Routes calendrier et historique
- [x] 5. Journal d'audit sur chaque action importante

---

## 🟢 PHASE 3 — Frontend Web React (Semaines 6-8) : **COMPLÉTÉ (100%)**
- [x] 1. Setup React + Tailwind + React Router + Axios
- [x] 2. Login + gestion JWT localStorage
- [x] 3. Page d'accueil : 3 fiches du jour avec statut
- [x] 4. Page fiche : check-list ✓/✗ + champs numériques + remarques + progression
- [x] 5. Calendrier mensuel couleurs + navigation
- [x] 6. Vue détail jour → fiche en lecture seule
- [x] 7. Interface superviseur : fiches reçues + anomalies
- [x] 8. Dashboard admin (KPIs globaux)
- [x] 9. Gestion Utilisateurs (CRUD + Désactivation)
- [x] 10. Gestion Équipements (Configuration parc)
- [x] 11. Journal d'Audit (Traçabilité système)

---

## 🟢 CONFIGURATION ADMINISTRATEUR — **COMPLÉTÉ (100%)**
- [x] 1. Backend : API CRUD Utilisateurs & Équipements
- [x] 2. Backend : Agrégation KPIs pour Dashboard global
- [x] 3. Frontend : Interface de gestion des comptes
- [x] 4. Frontend : Interface de gestion du parc machines
- [x] 5. Frontend : Consultation sécurisée des logs d'audit
- [x] 6. Sécurité : Restriction stricte des accès Admin (RBAC)

---

## ⚪ PHASE 4 — Mobile React Native Android (Semaines 9-12) : **À FAIRE**
- [ ] 1. Setup React Native + React Navigation + Axios + AsyncStorage
- [ ] 2. Login screen
- [ ] 3. Home screen : liste fiches
- [ ] 4. Fiche screen : check-list tactile avec champs numériques
- [ ] 5. Mode hors-ligne : stocker résultats en AsyncStorage si pas de réseau
- [ ] 6. Sync queue : envoyer dès retour réseau
- [ ] 7. Calendrier + historique mobile
- [ ] 8. Tests sur vrai appareil Android

---

## ⚪ PHASE 5 — Tests & déploiement (Semaine 13) : **À FAIRE**
- [ ] 1. Tests complets terrain
- [ ] 2. Corrections bugs
- [ ] 3. Déploiement backend Railway (dev) → VPS OVH (prod)
- [ ] 4. Déploiement frontend Vercel/Netlify
- [ ] 5. QR codes pour chaque local d'équipement
- [ ] 6. Formation techniciens et superviseurs


## 📋 SPÉCIFICATIONS DES RÔLES

### 👷 Technicien
L'agent de terrain. Il fait la ronde quotidienne des équipements, remplit les fiches d'inspection sur son téléphone Android, et envoie les résultats à son superviseur. Il ne voit que ce qui concerne ses propres inspections.

- **Accès** : Mobile Android + Web
- **Visibilité** : Ses propres fiches uniquement
- **Hors-ligne** : Oui — sync auto au retour réseau
- **Alertes reçues** : Aucune — il envoie, il ne reçoit pas

#### ✅ Ce qu'il peut faire
- **Fiches d'inspection**
  - Voir la liste des 3 fiches du jour assignées à son équipement (Transformateur élévateur, Chargeurs batteries, Transformateur abaisseur).
  - Remplir chaque point : ✓ Conforme ou ✗ Non-conforme, point par point, dans l'ordre des sections.
  - Saisir les mesures numériques (kV, A, °C, bar, MW, coups) sur les points qui nécessitent une valeur numérique.
  - Ajouter une remarque optionnelle sur chaque point (champ texte libre, pas obligatoire).
  - Envoyer la fiche complète au superviseur concerné (bouton bloqué tant que tous les points ne sont pas remplis). L'envoi déclenche un email automatique instantané vers le superviseur contenant le rapport complet et l'heure exacte de soumission.
  - Sauvegarder en brouillon et reprendre plus tard (même sans réseau grâce au mode hors-ligne).
- **Historique personnel**
  - Consulter le calendrier mensuel de SES inspections (Couleurs : vert conforme, orange anomalie, rouge manquant).
  - Revoir une fiche passée en lecture seule (Tous les détails : résultats, mesures, remarques).

#### ❌ Ce qu'il ne peut PAS faire
- Modifier une fiche déjà soumise.
- Voir les fiches des autres techniciens.
- Gérer les anomalies (les ouvrir, les clôturer).
- Accéder au tableau de bord ou aux statistiques globales.
- Créer ou modifier des utilisateurs ou des équipements.
- Télécharger les rapports PDF ou Excel globaux.

### 🕵️ Superviseur
Le responsable de terrain. Il reçoit toutes les fiches soumises par les techniciens de son périmètre, gère les anomalies, et décide des actions correctives. Il reçoit une alerte email automatique dès qu'une non-conformité est détectée.

- **Accès** : Web (bureau ou tablette)
- **Visibilité** : Toutes les fiches de son périmètre
- **Alertes reçues** : Email automatique si anomalie
- **Périmètres** : Sup. Local HT ou Sup. Salle Batteries

#### ✅ Ce qu'il peut faire
- **Réception et consultation des fiches**
  - Recevoir un email automatique complet de soumission d'inspection dès qu'elle est validée par le technicien (l'email contient : technicien, date et heure précise de soumission, équipement, statut global conforme/non-conforme, et le tableau récapitulatif complet de tous les points inspectés avec leurs relevés de mesures et remarques).
  - Recevoir une alerte email automatique supplémentaire si des anomalies ou non-conformités sont détectées.
  - Voir toutes les fiches soumises par les techniciens de son périmètre (Superviseur Local HT → fiches 1 et 3 / Superviseur Salle Batteries → fiche 2).
  - Consulter le détail complet de chaque fiche en lecture seule (Résultats, mesures numériques, remarques).
  - Consulter le calendrier de son périmètre avec l'historique.
  - Télécharger les rapports PDF des fiches de son périmètre.
- **Gestion des anomalies**
  - Voir toutes les fiches d'anomalies ouvertes de son périmètre (Créées automatiquement lors de la soumission si non-conformité).
  - Changer le statut d'une anomalie : Ouverte → En cours → Clôturée.
  - Assigner une anomalie à un responsable (Technicien ou autre membre de l'équipe).
  - Documenter les actions correctives réalisées (Champ texte libre pour décrire ce qui a été fait).

#### ❌ Ce qu'il ne peut PAS faire
- Voir les fiches des équipements hors de son périmètre.
- Modifier une fiche soumise par un technicien.
- Créer ou modifier des utilisateurs.
- Modifier la configuration des check-lists.
- Accéder au tableau de bord global (toute l'usine).
- Accéder au journal d'audit complet.
