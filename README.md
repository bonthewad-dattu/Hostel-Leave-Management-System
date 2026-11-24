# Hostel Leave Management System

A full-stack hostel leave portal with a React frontend, Django REST Framework
API, and SQLite database.

## Features

- Student registration, login, leave applications, request history, and pending-request edits/cancellations.
- Student profiles show admission roll number, canonical hostel block, assigned warden, and a student-managed mobile number.
- Warden review queues, comments, approval/rejection, and status history.
- Admin management of users and hostels, leave reports, dashboard metrics, and request filters.
- Role-protected API endpoints, server-side validation, and paginated leave lists.

## Requirements

- Python 3.10 or newer
- Node.js and npm

## Run locally

### Django API

In PowerShell:

```powershell
cd backend
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `backend/.env` and set `DJANGO_SECRET_KEY`, `SEED_ADMIN_EMAIL`, and
`SEED_ADMIN_PASSWORD`. Then initialize the database and create an administrator:

```powershell
python manage.py migrate
python manage.py seed_admin
python manage.py runserver
```

The API runs at `http://localhost:8000/api`. The API-specific setup and endpoint
reference is in [`backend/README.md`](./backend/README.md).

### React frontend

Open a second PowerShell terminal:

```powershell
cd frontend
npm install
npm run dev
```

The frontend runs at the URL printed by Vite (normally
`http://localhost:5173`). It uses `http://localhost:8000/api` by default. To use
a different API address, set `VITE_API_URL` in the frontend environment.

## Tests and checks

From `backend`:

```powershell
python manage.py test
```

From `frontend`:

```powershell
npm run lint
npm run build
```

## Deployment and submission

Set a production `DJANGO_SECRET_KEY`, `DEBUG=False`, `ALLOWED_HOSTS`, and
`CLIENT_ORIGIN` in the backend environment. For a demo deployment, the backend
uses SQLite and Render's free service may reset its data after sleeping,
restarting, or redeploying. The backend startup command reseeds fake demo data;
user-entered changes are temporary. Configure `VITE_API_URL` to the deployed
API URL when building the frontend. See [`backend/README.md`](./backend/README.md)
for Render setup details. Add the published application URL and any required
demo or video links here when they are available; none are included yet.
