FICHE_1 = {
    "nom": "Transformateur élévateur 622AEC03",
    "reference": "4-3:230 / 16KV-4704-6",
    "sections": [
        {
            "titre": "SECTION 1 : Local HT et local transformateur",
            "items": [
                {"label": "Éclairage", "desc": "Contrôler l'état d'éclairage et de la propreté du local", "type": "binaire"},
                {"label": "Local — isolation hydraulique", "desc": "Vérifier l'absence d'infiltration d'eau", "type": "binaire"},
                {"label": "Extracteur d'air", "desc": "Contrôler le fonctionnement des extracteurs d'air", "type": "binaire"},
                {"label": "Équipements de protection incendie", "desc": "Contrôler l'état des équipements de protection incendie (Armoire DI, extincteurs)", "type": "binaire"},
                {"label": "Climatiseur", "desc": "Contrôler le bon fonctionnement des climatiseurs installés dans le local", "type": "binaire"},
                {"label": "Équipements de protection personnel (EPI)", "desc": "Contrôler l'état des équipements de protection personnelle disponibles dans le local", "type": "binaire"},
            ]
        },
        {
            "titre": "SECTION 2 : Transformateur élévateur",
            "items": [
                {"label": "Transformateur — contrôle visuel", "desc": "Faire un contrôle visuel du transformateur, vérifier l'absence de bruit, d'odeur et d'échauffement anormaux", "type": "binaire"},
                {"label": "Transformateur — fuites d'huile", "desc": "Vérifier l'absence de fuites d'huile sur n'importe quelle partie du transformateur", "type": "binaire"},
                {"label": "Déshydratateur du silicagel", "desc": "Contrôler l'état du silicagel dans les déshydratateurs", "type": "binaire"},
                {"label": "Ventilateur de refroidissement", "desc": "Contrôler le fonctionnement des ventilateurs de refroidissement du transformateur", "type": "binaire"},
                {"label": "Relais de protection — mesures primaire/secondaire", "desc": "Enregistrer la tension, le courant et la puissance active au primaire et au secondaire", "type": "numerique", "mesures": [
                    {"label": "Tension primaire", "unite": "kV"}, {"label": "Courant primaire", "unite": "A"}, {"label": "Puissance active", "unite": "MW"}, {"label": "Tension secondaire", "unite": "kV"}, {"label": "Courant secondaire", "unite": "A"}
                ]},
                {"label": "Transformateur 16KV-4704-6 — températures", "desc": "Enregistrer la tension, le courant et les températures : huile, enroulements et ambiant", "type": "numerique", "mesures": [
                    {"label": "Tension", "unite": "kV"}, {"label": "Courant", "unite": "A"}, {"label": "Temp. huile", "unite": "°C"}, {"label": "Temp. enroulements", "unite": "°C"}, {"label": "Temp. ambiante", "unite": "°C"}
                ]},
                {"label": "Indicateur de niveau d'huile", "desc": "Contrôler le niveau d'huile, vérifier l'absence de fuites du transformateur", "type": "binaire"},
                {"label": "Cuve transformateur", "desc": "Faire un contrôle visuel de la cuve/enveloppe du transformateur, nettoyer", "type": "binaire"},
                {"label": "Transformateur — état peinture", "desc": "Contrôler l'état de la peinture, surtout sur les soudures et les joints", "type": "binaire"},
                {"label": "Mise à la terre", "desc": "Contrôle visuel de l'état et la continuité de la mise à la terre", "type": "binaire"},
                {"label": "Câble de puissance", "desc": "Contrôle visuel de l'état des terminaisons (têtes, cosses) de câbles, traces d'échauffement et d'arcs électriques", "type": "binaire"},
                {"label": "Isolateurs HT & MT", "desc": "Contrôler l'état des isolateurs, vérifier l'absence de fissures", "type": "binaire"},
                {"label": "Tuyauterie du transformateur", "desc": "Contrôler l'état de la tuyauterie, rechercher toute éventuelle présence de fuite d'huile", "type": "binaire"},
                {"label": "Boîtes à câbles", "desc": "Contrôler l'état des boîtes, vérifier l'absence de fuite d'huile", "type": "binaire"},
                {"label": "Analyseur d'huile en ligne — enveloppe", "desc": "Contrôler l'état de l'enveloppe et de l'extérieur de l'analyseur", "type": "binaire"},
                {"label": "Analyseur d'huile en ligne — lampes", "desc": "Contrôler l'état de toutes les lampes de signalisation", "type": "binaire"},
                {"label": "Analyseur d'huile en ligne — câbles/bornes", "desc": "Examiner l'état des câbles, des bornes et des presse-étoupes", "type": "binaire"},
                {"label": "Fosse de récupération d'huile", "desc": "Faire un contrôle visuel de l'état de la fosse de récupération d'huile, vérifier le bon état", "type": "binaire"},
            ]
        },
        {
            "titre": "SECTION 3 : Traversée HT",
            "items": [
                {"label": "Traversées HT", "desc": "Inspection des connexions, rechercher les traces d'échauffement", "type": "binaire"},
            ]
        },
        {
            "titre": "SECTION 4 : Disjoncteur de ligne HT",
            "items": [
                {"label": "Densimètre SF6", "desc": "Contrôler le niveau de pression du gaz SF6 (lire sur densimètre), signaler chaque décalage", "type": "numerique", "mesures": [{"label": "Pression SF6", "unite": "bar"}]},
                {"label": "Relais de protection", "desc": "Faire un contrôle visuel des alarmes (distant) du disjoncteur", "type": "binaire"},
                {"label": "Mise à la terre", "desc": "Contrôle visuel de l'état de tous les points de la mise à la terre", "type": "binaire"},
                {"label": "Isolateurs", "desc": "Faire un contrôle visuel de l'état des isolateurs du disjoncteur", "type": "binaire"},
            ]
        },
        {
            "titre": "SECTION 5 : Sectionneur de ligne HT",
            "items": [
                {"label": "Sectionneur HT", "desc": "Faire un contrôle visuel de l'état du sectionneur de ligne HT", "type": "binaire"},
                {"label": "Contacts principaux", "desc": "Contrôler l'état des contacts principaux", "type": "binaire"},
                {"label": "Connexions primaires", "desc": "Contrôler l'état des connexions primaires", "type": "binaire"},
                {"label": "Isolateurs", "desc": "Contrôler l'état des isolateurs du sectionneur", "type": "binaire"},
                {"label": "Mise à la terre", "desc": "Contrôle visuel de l'état de tous les points de la mise à la terre, resserrer si nécessaire", "type": "binaire"},
            ]
        },
        {
            "titre": "SECTION 6 : Transformateur combiné de mesure",
            "items": [
                {"label": "Transformateur combiné de mesure", "desc": "Faire un contrôle visuel de l'état de la combiné de mesure", "type": "binaire"},
                {"label": "Connexions primaires", "desc": "Contrôler l'état des connexions primaires", "type": "binaire"},
                {"label": "Connexions secondaires", "desc": "Contrôler l'état des connexions secondaires", "type": "binaire"},
                {"label": "Indicateur de niveau d'huile", "desc": "Contrôler le niveau d'huile, vérifier l'absence de fuites", "type": "binaire"},
                {"label": "Mise à la terre", "desc": "Contrôle visuel de l'état de tous les points de la mise à la terre", "type": "binaire"},
            ]
        },
        {
            "titre": "SECTION 7 : Armoire tranche arrivée GSU (4-3:230)",
            "items": [
                {"label": "Armoire", "desc": "Faire un contrôle visuel à l'extérieur de l'armoire, vérifier l'absence de bruit, d'échauffement et d'odeur anormaux", "type": "binaire"},
                {"label": "Relais de protection", "desc": "Enregistrer/lire sur le relais de protection la valeur des grandeurs électriques mesurées, signaler chaque incohérence", "type": "binaire"},
                {"label": "Mise à la terre", "desc": "Contrôle visuel de l'état de tous les points de mise à la terre", "type": "binaire"},
            ]
        }
    ]
}

FICHE_2 = {
    "nom": "Chargeurs batteries & onduleur",
    "reference": "W.JEJA",
    "sections": [
        {
            "titre": "SECTION 1 : Local chargeurs batteries et onduleurs — généralités",
            "items": [
                {"label": "Propreté", "desc": "S'assurer de la propreté de la salle", "type": "binaire"},
                {"label": "Éclairage", "desc": "Contrôler l'état d'éclairage", "type": "binaire"},
                {"label": "Température", "desc": "Contrôler le bon fonctionnement du climatiseur et s'assurer qu'il maintient une température adéquate dans la salle", "type": "numerique", "mesures": [{"label": "Température salle", "unite": "°C"}]},
            ]
        },
        {
            "titre": "SECTION 2 : Onduleurs + Stabilisateur",
            "items": [
                {"label": "Alarmes afficheur onduleur", "desc": "Contrôler les alarmes sur l'afficheur, vérifier l'absence de défaut", "type": "binaire"},
                {"label": "Communication armoire onduleur", "desc": "Contrôler l'état de communication de l'armoire onduleur, vérifier le bon fonctionnement", "type": "binaire"},
                {"label": "Partage de charge entre onduleurs", "desc": "Contrôler le partage de la charge entre onduleurs N°1 et N°2, vérifier la symétrie (I1=I2 ± 5%)", "type": "numerique", "mesures": [{"label": "Courant onduleur N°1", "unite": "A"}, {"label": "Courant onduleur N°2", "unite": "A"}]},
                {"label": "Voltmètre / ampèremètre onduleur", "desc": "Contrôler l'état du voltmètre et de l'ampèremètre, comparer les valeurs indiquées avec celles assignées", "type": "numerique", "mesures": [{"label": "Tension", "unite": "V"}, {"label": "Courant", "unite": "A"}]},
                {"label": "Ventilateurs de refroidissement", "desc": "Faire un contrôle visuel de tous les ventilateurs de refroidissement", "type": "binaire"},
                {"label": "Armoire stabilisateur et distribution", "desc": "Faire un contrôle visuel de l'armoire stabilisateur et de l'armoire de distribution, vérifier l'absence de traces de corrosion", "type": "binaire"},
                {"label": "Portes des armoires", "desc": "Contrôler l'état des portes des armoires, vérifier leur bon état", "type": "binaire"},
                {"label": "Armoire bypass / enveloppe onduleur", "desc": "Faire un contrôle visuel de l'armoire bypass et de l'enveloppe onduleur et de l'intérieur d'armoire, vérifier l'absence de traces de corrosion", "type": "binaire"},
                {"label": "Mises à la terre onduleurs", "desc": "Contrôle visuel des mises à la terre", "type": "binaire"},
            ]
        },
        {
            "titre": "SECTION 3 : Chargeurs batteries",
            "items": [
                {"label": "Alarmes afficheur chargeur", "desc": "Contrôler les alarmes sur l'afficheur, vérifier l'absence de défaut", "type": "binaire"},
                {"label": "Communication armoire chargeur", "desc": "Contrôler l'état de communication de l'armoire chargeur batterie, vérifier le bon fonctionnement", "type": "binaire"},
                {"label": "Voltmètre / ampèremètre chargeur", "desc": "Contrôler l'état du voltmètre et de l'ampèremètre, comparer les valeurs indiquées avec celles assignées", "type": "numerique", "mesures": [{"label": "Tension chargeur", "unite": "V"}, {"label": "Courant chargeur", "unite": "A"}]},
                {"label": "Lampes de signalisation", "desc": "Contrôler l'état de toutes les lampes de signalisation du chargeur", "type": "binaire"},
                {"label": "Composants installés — échauffement", "desc": "Faire un contrôle visuel de tous les composants installés du chargeur, vérifier l'absence de traces d'échauffement", "type": "binaire"},
                {"label": "Compartiment de distribution", "desc": "Faire un contrôle visuel du compartiment de distribution, vérifier l'absence de traces d'échauffement", "type": "binaire"},
                {"label": "Ventilateurs refroidissement chargeur", "desc": "Vérifier le bon fonctionnement des ventilateurs de refroidissement des chargeurs", "type": "binaire"},
                {"label": "Portes chargeur", "desc": "Contrôler l'état des portes, vérifier leur bon état", "type": "binaire"},
                {"label": "Connexions chargeur", "desc": "Faire un contrôle visuel de toutes les connexions du chargeur, vérifier l'absence de traces d'échauffement", "type": "binaire"},
            ]
        },
        {
            "titre": "SECTION 4 : Salle batteries — bloc batteries",
            "items": [
                {"label": "Propreté salle batteries", "desc": "S'assurer de la propreté de la salle et vérifier qu'il n'y a pas de liquides renversés ou d'acide", "type": "binaire"},
                {"label": "Ventilation salle batteries", "desc": "Vérifier le bon fonctionnement des systèmes de ventilation", "type": "binaire"},
                {"label": "Éclairages salle batteries", "desc": "Assurer le bon fonctionnement des luminaires et signaler tout luminaire défectueux ou présentant un éclairage insuffisant", "type": "binaire"},
                {"label": "Bloc batterie — contrôle visuel", "desc": "Faire un contrôle visuel du bloc batterie, vérifier le bon état et l'absence de fuite", "type": "binaire"},
                {"label": "Cellules batteries", "desc": "Vérifier l'absence de fissures ou de dommages sur les cellules des batteries", "type": "binaire"},
                {"label": "Niveau électrolyte", "desc": "Contrôler le niveau de l'électrolyte des cellules, si nécessaire rajouter de l'eau distillée", "type": "binaire"},
                {"label": "Sulfate sur bornes et cales", "desc": "Vérifier l'absence de sulfate sur les bornes et les cales des batteries, nettoyer les surfaces si nécessaire", "type": "binaire"},
                {"label": "État des bornes", "desc": "Vérifier que les bornes sont propres et exemptes de corrosion ou d'oxydation", "type": "binaire"},
                {"label": "Fixation batteries", "desc": "S'assurer que les batteries sont bien fixées dans leurs supports", "type": "binaire"},
            ]
        }
    ]
}

FICHE_3 = {
    "nom": "Transformateur abaisseur 622AEC01",
    "reference": "4-3:m (Jorf Fertilizers Company 3)",
    "sections": [
        {
            "titre": "SECTION 1 : Local HT et local transformateur",
            "items": [
                {"label": "Éclairage", "desc": "Contrôler l'état d'éclairage et de la propreté du local", "type": "binaire"},
                {"label": "Local — isolation hydraulique", "desc": "Vérifier l'absence d'infiltration d'eau", "type": "binaire"},
                {"label": "Extracteur d'air", "desc": "Contrôler le fonctionnement des extracteurs d'air", "type": "binaire"},
                {"label": "Équipements de protection incendie", "desc": "Contrôler l'état des équipements de protection incendie (Armoire DI, extincteurs)", "type": "binaire"},
                {"label": "Climatiseur", "desc": "Contrôler le bon fonctionnement des climatiseurs installés dans le local", "type": "binaire"},
                {"label": "Équipements de protection personnel (EPI)", "desc": "Contrôler l'état des équipements de protection personnelle disponibles dans le local", "type": "binaire"},
            ]
        },
        {
            "titre": "SECTION 2 : Transformateur abaisseur",
            "items": [
                {"label": "Transformateur — contrôle visuel", "desc": "Faire un contrôle visuel du transformateur, vérifier l'absence de bruit, d'odeur et d'échauffement anormaux", "type": "binaire"},
                {"label": "Transformateur — fuites d'huile", "desc": "Vérifier l'absence de fuites d'huile sur n'importe quelle partie du transformateur", "type": "binaire"},
                {"label": "Déshydratateur du silicagel", "desc": "Contrôler l'état du silicagel dans les déshydratateurs", "type": "binaire"},
                {"label": "Ventilateur de refroidissement", "desc": "Contrôler le fonctionnement des ventilateurs de refroidissement du transformateur", "type": "binaire"},
                {"label": "Transformateur — températures et mesures", "desc": "Enregistrer la tension, le courant et les températures : huile, enroulements et ambiant", "type": "numerique", "mesures": [
                    {"label": "Tension", "unite": "kV"}, {"label": "Courant", "unite": "A"}, {"label": "Temp. huile", "unite": "°C"}, {"label": "Temp. enroulements", "unite": "°C"}, {"label": "Temp. ambiante", "unite": "°C"}
                ]},
                {"label": "Indicateur de niveau d'huile", "desc": "Contrôler le niveau d'huile, vérifier l'absence de fuites du transformateur", "type": "binaire"},
                {"label": "Cuve transformateur", "desc": "Faire un contrôle visuel de la cuve/enveloppe du transformateur", "type": "binaire"},
                {"label": "Transformateur — état peinture", "desc": "Contrôler l'état de la peinture, surtout sur les soudures et les joints", "type": "binaire"},
                {"label": "Mise à la terre", "desc": "Contrôle visuel de la mise à la terre", "type": "binaire"},
                {"label": "Câble de puissance", "desc": "Contrôle visuel de l'état des terminaisons (têtes, cosses) de câbles, traces d'échauffement et d'arcs électriques", "type": "binaire"},
                {"label": "Isolateurs HT & MT", "desc": "Contrôle visuel de l'état des isolateurs, vérifier l'absence de fissures", "type": "binaire"},
                {"label": "Tuyauterie du transformateur", "desc": "Contrôler l'état de la tuyauterie, rechercher toute éventuelle présence de fuite d'huile", "type": "binaire"},
                {"label": "Régulateur de tension", "desc": "Contrôler l'état du régulateur de tension, vérifier le bon état", "type": "binaire"},
                {"label": "Fosse de récupération d'huile", "desc": "Faire un contrôle visuel de l'état de la fosse de récupération d'huile, vérifier le bon état", "type": "binaire"},
            ]
        },
        {
            "titre": "SECTION 3 : Traversée HT",
            "items": [
                {"label": "Traversées HT", "desc": "Examiner les connexions, rechercher les traces d'échauffement", "type": "binaire"},
            ]
        },
        {
            "titre": "SECTION 4 : Transformateur de source auxiliaire (TSA)",
            "items": [
                {"label": "Transformateur de source auxiliaire", "desc": "Faire un contrôle visuel du transformateur, vérifier l'absence de bruit, d'odeur, d'échauffement anormaux", "type": "binaire"},
                {"label": "Relais de protection TSA — températures", "desc": "Enregistrer/lire sur le relais la valeur des températures des enroulements, signaler chaque incohérence", "type": "numerique", "mesures": [
                    {"label": "Temp. enroulement 1", "unite": "°C"}, {"label": "Temp. enroulement 2", "unite": "°C"}
                ]},
                {"label": "Enveloppe transformateur TSA", "desc": "Faire un contrôle visuel de l'enveloppe du transformateur", "type": "binaire"},
                {"label": "Mise à la terre TSA", "desc": "Contrôle visuel de l'état et la continuité de la mise à la terre", "type": "binaire"},
                {"label": "Câbles TSA", "desc": "Faire un contrôle visuel de tous les câbles du transformateur, rechercher la présence de détérioration/endommagement", "type": "binaire"},
                {"label": "Bornes de connexion TSA", "desc": "Examiner l'état des terminaisons (têtes, cosses) de câbles, rechercher des traces d'échauffement", "type": "binaire"},
                {"label": "Fusibles MT TSA", "desc": "Contrôle visuel de l'état des fusibles MT du transformateur TSA", "type": "binaire"},
            ]
        },
        {
            "titre": "SECTION 5 : Disjoncteur de ligne HT",
            "items": [
                {"label": "Densimètre SF6", "desc": "Contrôler le niveau de pression du gaz SF6 (lire sur densimètre), signaler chaque décalage", "type": "numerique", "mesures": [{"label": "Pression SF6", "unite": "bar"}]},
                {"label": "Relais de protection", "desc": "Faire un contrôle visuel des alarmes (distant) du disjoncteur", "type": "binaire"},
                {"label": "Mise à la terre", "desc": "Contrôle visuel de l'état de tous les points de la mise à la terre", "type": "binaire"},
                {"label": "Isolateurs", "desc": "Faire un contrôle visuel de l'état des isolateurs du disjoncteur", "type": "binaire"},
            ]
        },
        {
            "titre": "SECTION 6 : Sectionneur de ligne HT",
            "items": [
                {"label": "Sectionneur HT", "desc": "Faire un contrôle visuel de l'état du sectionneur de ligne HT", "type": "binaire"},
                {"label": "Contacts principaux", "desc": "Contrôle visuel de l'état des contacts principaux", "type": "binaire"},
                {"label": "Connexions primaires", "desc": "Contrôle visuel de l'état des connexions primaires", "type": "binaire"},
                {"label": "Isolateurs", "desc": "Contrôle visuel de l'état des isolateurs du sectionneur", "type": "binaire"},
                {"label": "Mise à la terre", "desc": "Contrôle visuel de l'état de tous les points de la mise à la terre", "type": "binaire"},
            ]
        },
        {
            "titre": "SECTION 7 : Transformateur combiné de mesure",
            "items": [
                {"label": "Transformateur combiné de mesure", "desc": "Faire un contrôle visuel de l'état de la combiné de mesure", "type": "binaire"},
                {"label": "Connexions primaires", "desc": "Contrôler l'état des connexions primaires", "type": "binaire"},
                {"label": "Connexions secondaires", "desc": "Contrôler l'état des connexions secondaires", "type": "binaire"},
                {"label": "Indicateur de niveau d'huile", "desc": "Contrôler le niveau d'huile", "type": "binaire"},
                {"label": "Mise à la terre", "desc": "Contrôle visuel de l'état de tous les points de la mise à la terre", "type": "binaire"},
            ]
        },
        {
            "titre": "SECTION 8 : Limiteur de surtension",
            "items": [
                {"label": "Limiteur de surtension — contrôle visuel", "desc": "Faire un contrôle visuel de l'état du limiteur de surtension", "type": "binaire"},
                {"label": "Compteur de décharges", "desc": "Noter le nombre de décharges du compteur de décharges", "type": "numerique", "mesures": [{"label": "Nb. décharges", "unite": "coups"}]},
                {"label": "Limiteur de surtension — 2ème", "desc": "Faire un contrôle visuel de l'état du limiteur de surtension", "type": "binaire"},
                {"label": "Connexions primaires limiteur", "desc": "Contrôler l'état des connexions primaires", "type": "binaire"},
                {"label": "Compteur de décharges — connexions", "desc": "Contrôler l'état des compteurs de décharges et de ces connexions", "type": "binaire"},
                {"label": "Isolateurs limiteur", "desc": "Contrôler l'état des isolateurs, vérifier le bon état", "type": "binaire"},
                {"label": "Mise à la terre limiteur", "desc": "Contrôle visuel de l'état de tous les points de la mise à la terre", "type": "binaire"},
            ]
        },
        {
            "titre": "SECTION 9 : Armoire tranche départ transformateur",
            "items": [
                {"label": "Armoire", "desc": "Faire un contrôle visuel à l'extérieur de l'armoire, vérifier l'absence de bruit, d'échauffement et d'odeur anormaux", "type": "binaire"},
                {"label": "Relais de protection", "desc": "Enregistrer/lire sur le relais de protection la valeur des grandeurs électriques mesurées, signaler chaque incohérence", "type": "binaire"},
            ]
        }
    ]
}

ALL_FICHES = [
    {"code": "622AEC03", "data": FICHE_1},
    {"code": "BATT_OND", "data": FICHE_2},
    {"code": "622AEC01", "data": FICHE_3},
]
