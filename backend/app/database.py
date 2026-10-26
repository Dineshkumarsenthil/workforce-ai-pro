import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Set DATABASE_URL for MySQL, e.g. mysql+pymysql://user:password@localhost/workforce_ai
# Falls back to SQLite so the project runs without any setup.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./workforce.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {})
SessionLocal = sessionmaker(bind=engine, autoflush=False)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
