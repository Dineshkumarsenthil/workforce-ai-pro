"""Run once: python seed.py  -> trains the model, creates admin user and sample employees."""
import random
from app.database import Base, engine, SessionLocal
from app import models
from app.ml import train_model
from app.security import hash_password
from app.main import recalculate

Base.metadata.create_all(bind=engine)
print("Model accuracy:", round(train_model(), 3))

db = SessionLocal()
if not db.query(models.User).filter_by(username="admin").first():
    db.add(models.User(username="admin", password_hash=hash_password("admin123")))
    db.commit()

random.seed(1)
departments = ["Engineering", "Sales", "HR", "Finance", "Support"]
for i in range(1, 31):
    emp = models.Employee(
        name=f"Employee {i}", department=random.choice(departments),
        salary=random.randint(30000, 120000), years_at_company=round(random.uniform(0.5, 12), 1),
        satisfaction=round(random.uniform(1, 5), 1), overtime_hours=random.randint(0, 55),
        years_since_promotion=round(random.uniform(0, 7), 1), performance=round(random.uniform(1, 5), 1),
    )
    db.add(emp)
    db.flush()
    recalculate(db, emp)
db.commit()
print("Seeded. Login: admin / admin123")
