from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from app.config import settings
from typing import List

conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_STARTTLS=settings.MAIL_STARTTLS,
    MAIL_SSL_TLS=settings.MAIL_SSL_TLS,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True,
    SUPPRESS_SEND=settings.MAIL_SUPPRESS_SEND
)

fm = FastMail(conf)

async def send_anomaly_alert(
    supervisor_email: str,
    inspection_id: int,
    technician_name: str,
    submission_time: str,
    equipment_asset_id: str,
    failed_items: List[dict],
):
    body = f"""
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #e0e0e0; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); background-color: #ffffff;">
        <h2 style="color: #e53e3e; border-bottom: 2px solid #fed7d7; padding-bottom: 12px; margin-top: 0; font-size: 22px; font-weight: 700;">🚨 Alerte Non-Conformité - Kofert</h2>
        <p style="color: #4a5568; font-size: 15px; line-height: 1.6;">Une anomalie critique a été détectée lors de la soumission de l'inspection <strong>#{inspection_id}</strong>.</p>
        
        <table style="width: 100%; border-collapse: separate; border-spacing: 0; margin-top: 15px; margin-bottom: 25px; border-radius: 8px; overflow: hidden; border: 1px solid #edf2f7;">
            <tr style="background-color: #f7fafc;">
                <td style="padding: 10px 12px; font-weight: 600; font-size: 14px; color: #4a5568; border-bottom: 1px solid #edf2f7; width: 40%;">Nom du Technicien</td>
                <td style="padding: 10px 12px; font-size: 14px; color: #2d3748; border-bottom: 1px solid #edf2f7;">{technician_name}</td>
            </tr>
            <tr>
                <td style="padding: 10px 12px; font-weight: 600; font-size: 14px; color: #4a5568; border-bottom: 1px solid #edf2f7;">Date & Heure de Soumission</td>
                <td style="padding: 10px 12px; font-size: 14px; color: #2d3748; border-bottom: 1px solid #edf2f7;">{submission_time}</td>
            </tr>
            <tr style="background-color: #f7fafc;">
                <td style="padding: 10px 12px; font-weight: 600; font-size: 14px; color: #4a5568;">Équipement Concerné (Asset)</td>
                <td style="padding: 10px 12px; font-size: 14px; color: #2d3748;">{equipment_asset_id}</td>
            </tr>
        </table>
        
        <h3 style="color: #2d3748; font-size: 16px; font-weight: 700; margin-bottom: 12px; margin-top: 20px;">Détails des Points Non-Conformes</h3>
        <div style="border: 1px solid #fed7d7; border-radius: 12px; padding: 16px; background-color: #fff5f5;">
    """
    for item in failed_items:
        body += f"""
        <div style="margin-bottom: 16px; border-bottom: 1px solid #feb2b2; padding-bottom: 12px; last-child: border-bottom: none;">
            <p style="margin: 0; font-weight: 700; color: #c53030; font-size: 14px;">❌ Point : {item['label']}</p>
            <p style="margin: 6px 0 0 15px; font-size: 13.5px; color: #4a5568;"><strong>Notes terrain / Remarques :</strong> {item['remarque']}</p>
        """
        if item.get("mesures"):
            body += f"""
            <p style="margin: 6px 0 0 15px; font-size: 13.5px; color: #4a5568;"><strong>Mesures Numériques Associées :</strong></p>
            <ul style="margin: 4px 0 0 25px; padding: 0; font-size: 13px; color: #2d3748; font-family: monospace;">
            """
            for m in item["mesures"]:
                body += f"<li style='margin-bottom: 2px;'>{m}</li>"
            body += "</ul>"
        body += "</div>"
        
    body += """
        </div>
        <p style="font-size: 11px; color: #a0aec0; margin-top: 30px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 12px;">
            Ceci est une notification automatique générée par l'application Kofert Industrial Inspection. Merci de ne pas y répondre directement.
        </p>
    </div>
    """

    message = MessageSchema(
        subject=f"⚠️ ALERTE NON-CONFORMITÉ - Inspection #{inspection_id}",
        recipients=[supervisor_email],
        body=body,
        subtype=MessageType.html
    )

    try:
        await fm.send_message(message)
        print(f"Email sent successfully to {supervisor_email}")
        print("\n" + "="*20 + " [DEVELOPMENT EMAIL LOG] " + "="*20)
        print(f"To: {supervisor_email}")
        try:
            print(f"Subject: {message.subject}")
            print("HTML Body:\n", body)
        except UnicodeEncodeError:
            print(f"Subject: {message.subject.encode('ascii', 'replace').decode('ascii')}")
            print("HTML Body:\n", body.encode('ascii', 'replace').decode('ascii'))
        print("="*65 + "\n")
    except Exception as e:
        print(f"Error sending email: {e}")


async def send_inspection_submission_email(
    supervisor_email: str,
    inspection_id: int,
    technician_name: str,
    submission_time: str,
    equipment_asset_id: str,
    status_global: str,
    items: List[dict],
):
    is_conforme = status_global.lower() == "conforme"
    primary_color = "#10B981" if is_conforme else "#EF4444"
    bg_light = "#ECFDF5" if is_conforme else "#FEF2F2"
    border_color = "#A7F3D0" if is_conforme else "#FCA5A5"
    text_color = "#047857" if is_conforme else "#B91C1C"
    
    status_badge_html = f"""
    <span style="display: inline-block; padding: 6px 14px; font-size: 13px; font-weight: 700; border-radius: 9999px; background-color: {bg_light}; color: {text_color}; border: 1px solid {border_color}; text-transform: uppercase; letter-spacing: 0.5px;">
        {status_global}
    </span>
    """

    body = f"""
    <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 650px; margin: auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); background-color: #ffffff;">
        <!-- Header -->
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #edf2f7; margin-bottom: 20px;">
            <div style="font-size: 28px; font-weight: 800; color: #1a202c; letter-spacing: -0.5px; margin-bottom: 4px;">KOFERT</div>
            <div style="font-size: 14px; font-weight: 600; color: #718096; text-transform: uppercase; letter-spacing: 1px;">Rapport d'Inspection Quotidien</div>
        </div>

        <p style="color: #4a5568; font-size: 15px; line-height: 1.6;">
            Bonjour,<br/>
            Un technicien a soumis une nouvelle fiche d'inspection sur son équipement. Voici les détails et le rapport complet :
        </p>
        
        <!-- Summary Card -->
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 25px;">
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 6px 0; font-size: 13.5px; color: #64748b; font-weight: 600; width: 45%;">ID Inspection</td>
                    <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 700;">#{inspection_id}</td>
                </tr>
                <tr>
                    <td style="padding: 6px 0; font-size: 13.5px; color: #64748b; font-weight: 600;">Technicien de terrain</td>
                    <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 600;">{technician_name}</td>
                </tr>
                <tr>
                    <td style="padding: 6px 0; font-size: 13.5px; color: #64748b; font-weight: 600;">Équipement (Asset)</td>
                    <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 600;">{equipment_asset_id}</td>
                </tr>
                <tr>
                    <td style="padding: 6px 0; font-size: 13.5px; color: #64748b; font-weight: 600;">Date & Heure de Soumission</td>
                    <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 600; font-family: monospace;">{submission_time}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0 4px 0; font-size: 13.5px; color: #64748b; font-weight: 600; vertical-align: middle;">Statut Global</td>
                    <td style="padding: 8px 0 4px 0; vertical-align: middle;">{status_badge_html}</td>
                </tr>
            </table>
        </div>
        
        <!-- Checklist Detail Header -->
        <h3 style="color: #1e293b; font-size: 16px; font-weight: 700; margin-bottom: 12px; border-left: 4px solid {primary_color}; padding-left: 10px;">
            Détail des Points Inspectés
        </h3>
        
        <!-- Checklist Table -->
        <div style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 25px;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13.5px;">
                <thead>
                    <tr style="background-color: #f1f5f9; border-bottom: 1px solid #e2e8f0;">
                        <th style="padding: 12px 16px; font-weight: 700; color: #334155; width: 45%;">Point d'Inspection</th>
                        <th style="padding: 12px 16px; font-weight: 700; color: #334155; width: 25%; text-align: center;">Statut</th>
                        <th style="padding: 12px 16px; font-weight: 700; color: #334155; width: 30%;">Détails & Mesures</th>
                    </tr>
                </thead>
                <tbody>
    """
    
    for item in items:
        item_is_conforme = item['resultat'].lower() == "conforme"
        badge_style = "background-color: #d1fae5; color: #065f46; border: 1px solid #a7f3d0;" if item_is_conforme else "background-color: #fee2e2; color: #991b1b; border: 1px solid #fca5a5;"
        icon = "✓ Conforme" if item_is_conforme else "✗ Non Conforme"
        
        # Format details
        details_html = ""
        if item.get("mesures"):
            details_html += "<div style='font-family: monospace; font-size: 12px; color: #475569; margin-bottom: 4px;'>"
            for m in item["mesures"]:
                details_html += f"📍 {m}<br/>"
            details_html += "</div>"
            
        if item.get("remarque") and item["remarque"] != "Aucune remarque":
            details_html += f"<div style='font-style: italic; font-size: 12px; color: #64748b; border-left: 2px solid #cbd5e1; padding-left: 6px; margin-top: 4px;'>📝 {item['remarque']}</div>"
            
        if not details_html:
            details_html = "<span style='color: #94a3b8; font-style: italic;'>Aucun</span>"
            
        bg_row = "#ffffff" if item_is_conforme else "#fef2f2"
        border_row = "border-bottom: 1px solid #e2e8f0;"
        
        body += f"""
                    <tr style="background-color: {bg_row}; {border_row}">
                        <td style="padding: 12px 16px; font-weight: 600; color: #1e293b;">{item['label']}</td>
                        <td style="padding: 12px 16px; text-align: center; vertical-align: middle;">
                            <span style="display: inline-block; padding: 4px 10px; font-size: 11.5px; font-weight: 700; border-radius: 6px; {badge_style}">
                                {icon}
                            </span>
                        </td>
                        <td style="padding: 12px 16px; vertical-align: middle;">{details_html}</td>
                    </tr>
        """
        
    body += """
                </tbody>
            </table>
        </div>
        
        <p style="font-size: 11.5px; color: #94a3b8; margin-top: 30px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 15px; line-height: 1.5;">
            Ceci est un rapport automatique généré en temps réel lors de la soumission de la check-list par l'application Kofert Industrial Inspection.
        </p>
    </div>
    """

    message = MessageSchema(
        subject=f"📝 RAPPORT D'INSPECTION #{inspection_id} ({status_global}) - {equipment_asset_id}",
        recipients=[supervisor_email],
        body=body,
        subtype=MessageType.html
    )

    try:
        await fm.send_message(message)
        print(f"Email sent successfully to {supervisor_email}")
        print("\n" + "="*20 + " [DEVELOPMENT EMAIL LOG] " + "="*20)
        print(f"To: {supervisor_email}")
        try:
            print(f"Subject: {message.subject}")
            print("HTML Body:\n", body)
        except UnicodeEncodeError:
            print(f"Subject: {message.subject.encode('ascii', 'replace').decode('ascii')}")
            print("HTML Body:\n", body.encode('ascii', 'replace').decode('ascii'))
        print("="*65 + "\n")
    except Exception as e:
        print(f"Error sending email: {e}")

