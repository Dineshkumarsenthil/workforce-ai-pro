from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from .database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="hr")


class Employee(Base):
    __tablename__ = "employees"
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    department = Column(String(50))
    salary = Column(Float, default=0)
    years_at_company = Column(Float, default=0)
    satisfaction = Column(Float, default=3)        # 1 (low) to 5 (high)
    overtime_hours = Column(Float, default=0)      # per month
    years_since_promotion = Column(Float, default=0)
    performance = Column(Float, default=3)         # 1 to 5
    risk_score = Column(Float, default=0)          # 0 to 1
    risk_level = Column(String(10), default="Low")


class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    message = Column(String(255))
    status = Column(String(20), default="Open")    # Open / In Progress / Closed
    created_at = Column(DateTime, default=datetime.utcnow)


class Intervention(Base):
    __tablename__ = "interventions"
    id = Column(Integer, primary_key=True)
    alert_id = Column(Integer, ForeignKey("alerts.id"))
    action = Column(String(255))
    status = Column(String(20), default="Planned")
    created_at = Column(DateTime, default=datetime.utcnow)


class ActivityLog(Base):
    __tablename__ = "activity_logs"
    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    event = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
