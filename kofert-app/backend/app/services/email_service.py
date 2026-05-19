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

async def send_inspection_report(
    supervisor_email: str,
    inspection_id: int,
    technician_name: str,
    submission_time: str,
    equipment_asset_id: str,
    all_items: List[dict],
):
    body = f"""
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #e0e0e0; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); background-color: #ffffff;">
        <h2 style="color: #2b6cb0; border-bottom: 2px solid #bee3f8; padding-bottom: 12px; margin-top: 0; font-size: 22px; font-weight: 700;">📋 Rapport d'Inspection - Kofert</h2>
        <p style="color: #4a5568; font-size: 15px; line-height: 1.6;">Une nouvelle inspection a été soumise (Inspection <strong>#{inspection_id}</strong>).</p>
        
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
        
        <h3 style="color: #2d3748; font-size: 16px; font-weight: 700; margin-bottom: 12px; margin-top: 20px;">Détails des Points Inspectés</h3>
        <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; background-color: #f7fafc;">
    """
    for item in all_items:
        icon = "❌" if item.get('resultat') == 'non_conforme' else "✅"
        color = "#c53030" if item.get('resultat') == 'non_conforme' else "#2f855a"
        body += f"""
        <div style="margin-bottom: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; last-child: border-bottom: none;">
            <p style="margin: 0; font-weight: 700; color: {color}; font-size: 14px;">{icon} Point : {item['label']}</p>
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
        subject=f"📋 RAPPORT D'INSPECTION - #{inspection_id}",
        recipients=[supervisor_email],
        body=body,
        subtype=MessageType.html
    )

    try:
        await fm.send_message(message)
        print(f"Email sent successfully to {supervisor_email}")
        print("\n" + "="*20 + " [DEVELOPMENT EMAIL LOG] " + "="*20)
        print(f"To: {supervisor_email}")
        print(f"Subject: {message.subject}")
        print("HTML Body:\n", body)
        print("="*65 + "\n")
    except Exception as e:
        print(f"Error sending email: {e}")
