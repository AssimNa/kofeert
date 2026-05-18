from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON
from sqlalchemy.sql import func
from app.database import Base

class AuditLog(Base):
    __tablename__ = "audit_log"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String(100))
    table_cible = Column(String(100))
    record_id = Column(Integer)
    details_json = Column(JSON)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
