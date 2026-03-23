# NeuroNex Backend (Phase 3)

FastAPI backend for elder check-ins, vitals, medications, alerts, and caretaker dashboard.

## Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

## Run

```bash
uvicorn app.main:app --reload
```

- API: http://localhost:8000  
- Docs: http://localhost:8000/docs  

## Seed data (manual via /docs or curl)

1. Create elder: `POST /api/users/` with `{"name":"Elder Name","phone":"9876543210","role":"elder","language":"hi"}`.
2. Create caregiver: `POST /api/users/` with `{"name":"Caregiver Name","phone":"9876500000","role":"caregiver"}`.
3. Link: `POST /api/users/caregiver-link` with `{"elder_id":1,"caregiver_id":2}`.
4. Check-in: `POST /api/checkins/` with `{"elder_id":1,"mood":"happy","medication_taken":true}`.
5. BP (triggers alert if high): `POST /api/vitals/bp?elder_id=1&systolic=150&diastolic=95`.

Database file: `./neuronex.db` (SQLite).
