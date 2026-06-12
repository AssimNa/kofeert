from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import os
from datetime import datetime

def generate_inspection_pdf(inspection_id: int, date_inspection: str, technicien_nom: str, equipement_nom: str, status: str, items_data: list):
    pdf_dir = "pdfs"
    if not os.path.exists(pdf_dir):
        os.makedirs(pdf_dir)
        
    filename = f"{pdf_dir}/inspection_{inspection_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}.pdf"
    
    c = canvas.Canvas(filename, pagesize=letter)
    width, height = letter

    # Title
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, height - 50, f"Rapport d'Inspection #{inspection_id}")
    
    # Meta
    c.setFont("Helvetica", 12)
    c.drawString(50, height - 80, f"Date: {date_inspection}")
    c.drawString(50, height - 100, f"Technicien: {technicien_nom}")
    c.drawString(50, height - 120, f"Équipement: {equipement_nom}")
    c.drawString(50, height - 140, f"Statut Global: {status}")
    
    # Items
    y = height - 180
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, "Points d'inspection :")
    y -= 20
    
    c.setFont("Helvetica", 10)
    for item in items_data:
        if y < 50:
            c.showPage()
            y = height - 50
        
        status_text = "Conforme" if item['resultat'] == 'conforme' else "Non Conforme"
        c.drawString(50, y, f"- {item['label']} : {status_text}")
        if item.get('remarque'):
            y -= 15
            c.drawString(70, y, f"Remarque: {item['remarque']}")
            
        if item.get('photo_url'):
            photo_path = item['photo_url'].lstrip('/')
            if os.path.exists(photo_path):
                y -= 120
                if y < 50:
                    c.showPage()
                    y = height - 150
                try:
                    c.drawImage(photo_path, 70, y, width=150, height=100, preserveAspectRatio=True)
                except Exception as e:
                    print("Error drawing image in PDF:", e)
                    c.drawString(70, y + 80, "[Erreur: Image indisponible]")

        y -= 20
        
    c.save()
    return filename

def generate_daily_report_pdf(date_str: str, inspections_data: list):
    pdf_dir = "pdfs/reports"
    if not os.path.exists(pdf_dir):
        os.makedirs(pdf_dir)
        
    filename = f"{pdf_dir}/rapport_journalier_{date_str}.pdf"
    
    c = canvas.Canvas(filename, pagesize=letter)
    width, height = letter

    # Header
    c.setFont("Helvetica-Bold", 18)
    c.setFillColorRGB(0.11, 0.62, 0.46) # Kofert Green
    c.drawString(50, height - 50, "KOFERT - RAPPORT DE MAINTENANCE")
    
    c.setFont("Helvetica", 12)
    c.setFillColorRGB(0, 0, 0)
    c.drawString(50, height - 70, f"Date du rapport : {date_str}")
    c.line(50, height - 80, width - 50, height - 80)
    
    y = height - 120
    
    if not inspections_data:
        c.setFont("Helvetica-Oblique", 12)
        c.drawString(50, y, "Aucune inspection réalisée ce jour.")
    else:
        for ins in inspections_data:
            if y < 150:
                c.showPage()
                y = height - 50
            
            # Inspection Box
            c.setFont("Helvetica-Bold", 14)
            c.drawString(50, y, f"Inspection #{ins['id']} - {ins['equipement']}")
            y -= 20
            c.setFont("Helvetica", 10)
            c.drawString(50, y, f"Technicien: {ins['technicien']} | Statut: {ins['statut']}")
            y -= 15
            
            c.setFont("Helvetica-Bold", 10)
            c.drawString(70, y, "Points d'anomalies :")
            y -= 15
            
            c.setFont("Helvetica", 9)
            anomalies = [it for it in ins['items'] if it['resultat'] != 'conforme']
            if not anomalies:
                c.drawString(90, y, "Aucune anomalie détectée.")
                y -= 15
            else:
                for anom in anomalies:
                    c.setFillColorRGB(0.88, 0.29, 0.29) # Red
                    c.drawString(90, y, f"• {anom['label']} : NON CONFORME")
                    c.setFillColorRGB(0, 0, 0)
                    if anom.get('remarque'):
                        y -= 12
                        c.setFont("Helvetica-Oblique", 8)
                        c.drawString(100, y, f"Remarque: {anom['remarque']}")
                        c.setFont("Helvetica", 9)
                    y -= 15
            
            y -= 10
            c.line(70, y, width - 70, y)
            y -= 30

    c.save()
    return filename
