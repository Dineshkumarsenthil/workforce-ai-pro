from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func
from sqlalchemy.orm import Session

from . import models, schemas
from .database import Base, engine, get_db
from .security import hash_password, verify_password, create_token, current_user
from .ml import predict_risk, risk_level, FEATURES

Base.metadata.create_all(bind=engine)
app = FastAPI(title="WorkForce AI Pro")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


def to_dict(row):
    """Turn a SQLAlchemy row into a plain dict so FastAPI can return it as JSON."""
    return {c.name: getattr(row, c.name) for c in row.__table__.columns}


def employee_features(emp):
    return {f: getattr(emp, f) for f in FEATURES}


def log(db, employee_id, event):
    db.add(models.ActivityLog(employee_id=employee_id, event=event))


def recalculate(db: Session, emp: models.Employee):
    """Core flow: recalc risk -> alert if high -> start intervention -> write log."""
    emp.risk_score = predict_risk(employee_features(emp))
    emp.risk_level = risk_level(emp.risk_score)
    log(db, emp.id, f"Risk recalculated: {emp.risk_score:.2f} ({emp.risk_level})")

    if emp.risk_level == "High":
        already_open = db.query(models.Alert).filter_by(employee_id=emp.id, status="Open").first()
        if not already_open:
            alert = models.Alert(employee_id=emp.id, message=f"{emp.name} is at high attrition risk ({emp.risk_score:.0%})")
            db.add(alert)
            db.flush()
            db.add(models.Intervention(alert_id=alert.id, action="Schedule 1-on-1 with manager"))
            log(db, emp.id, "HR alert raised and intervention workflow started")


# ---------- Auth ----------
@app.post("/auth/register")
def register(data: schemas.LoginIn, db: Session = Depends(get_db)):
    if db.query(models.User).filter_by(username=data.username).first():
        raise HTTPException(400, "Username already exists")
    db.add(models.User(username=data.username, password_hash=hash_password(data.password)))
    db.commit()
    return {"message": "User created"}


@app.post("/auth/login")
def login(data: schemas.LoginIn, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(username=data.username).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(401, "Wrong username or password")
    return {"access_token": create_token(user.username), "token_type": "bearer"}


# ---------- Employees ----------
@app.get("/employees")
def list_employees(db: Session = Depends(get_db), _: str = Depends(current_user)):
    return [to_dict(e) for e in db.query(models.Employee).order_by(models.Employee.risk_score.desc()).all()]


@app.post("/employees")
def add_employee(data: schemas.EmployeeIn, db: Session = Depends(get_db), _: str = Depends(current_user)):
    emp = models.Employee(**data.dict())
    db.add(emp)
    db.flush()
    recalculate(db, emp)
    db.commit()
    return to_dict(emp)


@app.put("/employees/{emp_id}/activity")
def update_activity(emp_id: int, data: schemas.ActivityUpdate, db: Session = Depends(get_db), _: str = Depends(current_user)):
    emp = db.get(models.Employee, emp_id)
    if not emp:
        raise HTTPException(404, "Employee not found")
    for field, value in data.dict(exclude_none=True).items():
        setattr(emp, field, value)
    log(db, emp.id, "Employee activity updated")
    recalculate(db, emp)
    db.commit()
    return to_dict(emp)


# ---------- AI prediction ----------
@app.post("/predict")
def predict(data: schemas.PredictIn, _: str = Depends(current_user)):
    score = predict_risk(data.dict())
    return {"risk_score": round(score, 3), "risk_level": risk_level(score)}


# ---------- Alerts and interventions ----------
@app.get("/alerts")
def list_alerts(db: Session = Depends(get_db), _: str = Depends(current_user)):
    return [to_dict(a) for a in db.query(models.Alert).order_by(models.Alert.created_at.desc()).all()]


@app.post("/alerts/{alert_id}/intervene")
def add_intervention(alert_id: int, data: schemas.InterventionIn, db: Session = Depends(get_db), _: str = Depends(current_user)):
    alert = db.get(models.Alert, alert_id)
    if not alert:
        raise HTTPException(404, "Alert not found")
    alert.status = "In Progress"
    db.add(models.Intervention(alert_id=alert_id, action=data.action))
    log(db, alert.employee_id, f"Intervention added: {data.action}")
    db.commit()
    return {"message": "Intervention started"}


@app.post("/alerts/{alert_id}/close")
def close_alert(alert_id: int, db: Session = Depends(get_db), _: str = Depends(current_user)):
    alert = db.get(models.Alert, alert_id)
    if not alert:
        raise HTTPException(404, "Alert not found")
    alert.status = "Closed"
    log(db, alert.employee_id, "Alert closed")
    db.commit()
    return {"message": "Alert closed"}


@app.get("/logs")
def list_logs(db: Session = Depends(get_db), _: str = Depends(current_user)):
    return [to_dict(l) for l in db.query(models.ActivityLog).order_by(models.ActivityLog.created_at.desc()).limit(50).all()]


# ---------- Analytics ----------
@app.get("/analytics/summary")
def summary(db: Session = Depends(get_db), _: str = Depends(current_user)):
    risk_counts = dict(db.query(models.Employee.risk_level, func.count()).group_by(models.Employee.risk_level).all())
    dept = db.query(models.Employee.department, func.avg(models.Employee.risk_score)).group_by(models.Employee.department).all()
    return {
        "total_employees": db.query(models.Employee).count(),
        "open_alerts": db.query(models.Alert).filter_by(status="Open").count(),
        "risk_distribution": [{"level": k, "count": v} for k, v in risk_counts.items()],
        "department_risk": [{"department": d, "avg_risk": round(float(r or 0), 3)} for d, r in dept],
    }
