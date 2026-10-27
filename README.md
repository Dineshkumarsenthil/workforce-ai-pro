# WorkForce AI Pro

An AI-powered HR platform that predicts employee attrition risk. When an employee's activity changes, the system recalculates their risk score, raises alerts and interventions for high-risk employees, and shows the results on a live dashboard.

**Repository:** https://github.com/Dineshkumarsenthil/workforce-ai-pro

---

## Features

- Employee attrition risk prediction using a scikit-learn model
- Activity tracking that updates risk scores automatically
- Automatic alerts and interventions for high-risk employees
- Full audit trail of every step in `activity_logs`
- Dashboard that refreshes every 10 seconds
- Admin login with JWT authentication

## Tech Stack

**Backend:** Python, FastAPI, SQLAlchemy, MySQL, Pydantic, JWT, Pandas, scikit-learn

**Frontend:** React, Vite, Tailwind CSS, Axios, Recharts / Chart.js

## How It Works

```
Activity update (PUT /employees/{id}/activity)
        │
        ▼
Model recalculates risk score
        │
        ▼
High risk? ──► Creates an alert and an intervention
        │
        ▼
Every step is written to activity_logs
        │
        ▼
Dashboard refreshes every 10 seconds
```

## Prerequisites

- Python 3.9+
- Node.js 18+ and npm
- MySQL 8+ (optional; SQLite can be used for local testing if configured)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Dineshkumarsenthil/workforce-ai-pro.git
cd workforce-ai-pro
```

### 2. Set up the backend

```bash
cd backend
pip install -r requirements.txt
python seed.py
uvicorn app.main:app --reload
```

`seed.py` trains the model, creates the default admin account, and adds 30 sample employees.

**Default admin login:** `admin` / `admin123` (change this before any real use)

**API docs:** http://localhost:8000/docs

#### Using MySQL

Create the database first, then set the connection string:

```bash
mysql -u root -p -e "CREATE DATABASE workforce_ai;"
```

```bash
# Linux / macOS
export DATABASE_URL=mysql+pymysql://user:password@localhost/workforce_ai

# Windows PowerShell
$env:DATABASE_URL="mysql+pymysql://user:password@localhost/workforce_ai"
```

### 3. Set up the frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The dashboard runs at the local address shown in the terminal (usually http://localhost:5173).

## Project Structure

```
workforce-ai-pro/
├── backend/        # FastAPI app, model training, seed script
├── frontend/       # React + Vite dashboard
└── docs/           # Project documentation and evidence
```

## API Overview

| Method | Endpoint | Purpose |
|--------|----------|---------|
| PUT | `/employees/{id}/activity` | Update an employee's activity and recalculate risk |

Full, interactive documentation is available at http://localhost:8000/docs.

## Troubleshooting

- **`DATABASE_URL` not picked up:** set it in the same terminal where you run `uvicorn`.
- **MySQL connection refused:** check that MySQL is running and the database exists.
- **Dashboard shows no data:** make sure the backend is running and `seed.py` has been run.

## Author

**Dineshkumar S**
