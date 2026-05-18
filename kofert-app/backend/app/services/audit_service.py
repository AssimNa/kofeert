from sqlalchemy.orm import Session
from app.models.audit import AuditLog
from app.models.user import User

def log_action(db: Session, user: User, action: str, table_cible: str, record_id: int, details_json: dict = None):
    audit_entry = AuditLog(
        user_id=user.id,
        action=action,
        table_cible=table_cible,
        record_id=record_id,
        details_json=details_json or {}
    )
    db.add(audit_entry)
    db.commit()
    db.refresh(audit_entry)
    return audit_entry
