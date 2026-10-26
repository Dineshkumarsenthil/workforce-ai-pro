from typing import Optional
from pydantic import BaseModel


class LoginIn(BaseModel):
    username: str
    password: str


class EmployeeIn(BaseModel):
    name: str
    department: str
    salary: float
    years_at_company: float
    satisfaction: float
    overtime_hours: float
    years_since_promotion: float
    performance: float


class ActivityUpdate(BaseModel):
    salary: Optional[float] = None
    satisfaction: Optional[float] = None
    overtime_hours: Optional[float] = None
    years_since_promotion: Optional[float] = None
    performance: Optional[float] = None


class PredictIn(BaseModel):
    salary: float
    years_at_company: float
    satisfaction: float
    overtime_hours: float
    years_since_promotion: float
    performance: float


class InterventionIn(BaseModel):
    action: str
