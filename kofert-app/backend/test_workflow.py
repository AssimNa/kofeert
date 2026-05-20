import requests
import json
from datetime import date

BASE_URL = "http://127.0.0.1:8001/api"

def print_step(msg):
    print(f"\n[{'='*50}]")
    print(f"> {msg}")
    print(f"[{'='*50}]\n")

def run_test():
    print_step("1. Login as Technicien (tech@kofert.com)")
    res = requests.post(f"{BASE_URL}/auth/login", data={"username": "tech@kofert.com", "password": "password123"})
    if res.status_code != 200:
        print("Login failed!", res.text)
        return
    tech_token = res.json()["access_token"]
    tech_headers = {"Authorization": f"Bearer {tech_token}"}
    print("[OK] Logged in successfully. Token acquired.")

    print_step("2. Fetch active Fiches Templates")
    res = requests.get(f"{BASE_URL}/fiches/", headers=tech_headers)
    fiches = res.json()
    fiche = fiches[0]
    fiche_id = fiche["id"]
    print(f"[OK] Found {len(fiches)} fiches. Selecting Fiche ID {fiche_id} ('{fiche['nom']}').")

    print_step("3. Create an Inspection Draft (Brouillon)")
    res = requests.post(f"{BASE_URL}/inspections/", json={"fiche_template_id": fiche_id}, headers=tech_headers)
    if res.status_code != 200:
        print("Failed to create inspection!", res.text)
        return
    inspection_id = res.json()["id"]
    print(f"[OK] Inspection #{inspection_id} created as Brouillon.")

    print_step("4. Saving Results to Draft")
    resultats = []
    # Fill out all items so it can be submitted
    for section in fiche["sections"]:
        for item in section["items"]:
            # Let's make the second item we see "non_conforme" to trigger an anomaly
            res_status = "non_conforme" if len(resultats) == 1 else "conforme"
            
            res_dict = {
                "item_id": item["id"],
                "resultat": res_status,
                "remarque": "Fuite detectee" if res_status == "non_conforme" else "",
                "mesures": []
            }
            # Fill out measures if any exist
            if item.get("mesures"):
                for mes in item["mesures"]:
                    res_dict["mesures"].append({
                        "item_mesure_id": mes["id"],
                        "valeur": 42.5
                    })
            resultats.append(res_dict)

    print(f"Prepared {len(resultats)} results. Sending PUT request...")
    res = requests.put(f"{BASE_URL}/inspections/{inspection_id}", json={"resultats": resultats}, headers=tech_headers)
    if res.status_code != 200:
        print("Failed to save draft!", res.text)
        return
    print("[OK] Draft saved successfully.")

    print_step("5. Submit Inspection")
    res = requests.post(f"{BASE_URL}/inspections/{inspection_id}/submit", headers=tech_headers)
    if res.status_code != 200:
        print("Failed to submit inspection!", res.text)
        return
    submit_data = res.json()
    print(f"[OK] Inspection submitted successfully! Anomalies created: {submit_data.get('anomalies_crees')}")

    print_step("6. Login as Consolidated Superviseur (assim3188@gmail.com)")
    res = requests.post(f"{BASE_URL}/auth/login", data={"username": "assim3188@gmail.com", "password": "password123"})
    sup_token = res.json()["access_token"]
    sup_headers = {"Authorization": f"Bearer {sup_token}"}
    print("[OK] Logged in successfully. Token acquired.")

    print_step("7. Test Calendar API as Superviseur")
    today = date.today()
    res = requests.get(f"{BASE_URL}/inspections/calendar?mois={today.month}&annee={today.year}", headers=sup_headers)
    if res.status_code != 200:
        print("Failed to get calendar!", res.text)
        return
    
    cal_data = res.json()
    today_str = str(today)
    print(f"[OK] Calendar data retrieved successfully! Status for today ({today_str}):")
    print(json.dumps(cal_data.get(today_str, {}), indent=2))

    print_step("ALL TESTS PASSED!")

if __name__ == "__main__":
    run_test()
