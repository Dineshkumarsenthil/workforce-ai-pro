# WorkForce AI Pro

## Run the backend
    cd backend
    pip install -r requirements.txt
    python seed.py            # trains model, creates admin / admin123 and 30 sample employees
    uvicorn app.main:app --reload
API docs: http://localhost:8000/docs
For MySQL: set DATABASE_URL=mysql+pymysql://user:password@localhost/workforce_ai (create the database first).

## Run the frontend
    cd frontend
    npm install
    npm run dev

## Flow
Activity update (PUT /employees/{id}/activity) -> model recalculates risk -> High risk creates an alert
and an intervention -> every step is written to activity_logs -> dashboard refreshes every 10 seconds.
