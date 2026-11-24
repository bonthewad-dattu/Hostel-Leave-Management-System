# Hostel Leave Management API

Django REST Framework API for the React HostelEase application.

## Requirements and startup

- Python 3.10 or newer
- Copy `.env.example` to `.env` and set `DJANGO_SECRET_KEY`.
- Install dependencies and initialize the Django database:

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python manage.py migrate
```

Set `SEED_ADMIN_NAME`, `SEED_ADMIN_EMAIL`, and `SEED_ADMIN_PASSWORD` in the
real `.env` file, then create the initial administrator:

```powershell
python manage.py seed_admin
```

`SEED_ADMIN_PASSWORD` is only used when creating the first admin account. After
that, login uses the password stored for that account in Django's database.
Changing the seed password in `.env` does not change an existing account; use
`python manage.py changepassword <email>` instead. `.env.example` is only a
template and is not loaded by Django.

Start the API:

```powershell
python manage.py runserver
```

The API listens on port `8000`; all API endpoints are prefixed with `/api`.
The new Django database is `backend/db.sqlite3`. The previous Node API database
in `backend/data/` is kept untouched and is not automatically imported.

## Render demo deployment

This project uses SQLite only. On Render's free web service, the SQLite file is
temporary and may be reset when the service spins down, restarts, or redeploys.
There are no pre-seeded demo accounts; register a new student account to test.
User-entered changes can be lost when the service resets.

Create a Render Web Service with `backend` as its root directory, then use:

- Build command: `pip install -r requirements.txt`
- Start command: `python manage.py migrate && gunicorn config.wsgi:application --bind 0.0.0.0:$PORT`
- Health check path: `/api/health`

Set `DEBUG=False`, `DJANGO_SECRET_KEY`, `ALLOWED_HOSTS` to the backend's exact
`onrender.com` hostname (without `https://`), `CLIENT_ORIGIN` to the frontend's
`https://` URL. To test admin features, optionally create an initial admin
using `SEED_ADMIN_NAME`, `SEED_ADMIN_EMAIL`, and `SEED_ADMIN_PASSWORD`, then
run `python manage.py seed_admin`.

Create a Render Static Site with `frontend` as its root directory, build command
`npm ci && npm run build`, and publish directory `dist`. Set
`VITE_API_URL` to `https://<backend-hostname>/api` and add a rewrite from `/*`
to `/index.html` for React Router routes. The app uses SQLite; no
`DATABASE_URL` is needed.

## API

| Method | Endpoint | Access |
| --- | --- | --- |
| `GET` | `/api/health` | Public |
| `POST` | `/api/auth/register` | Public, student only |
| `POST` | `/api/auth/login` | Public |
| `GET` | `/api/auth/me` | Authenticated |
| `GET`, `POST` | `/api/leaves` | Authenticated; create is student-only |
| `GET`, `PUT`, `DELETE` | `/api/leaves/<id>` | Owner, assigned warden, or admin |
| `GET`, `POST` | `/api/leaves/<id>/comments` | Read: authorized user; write: warden/admin |
| `GET` | `/api/leaves/<id>/history` | Owner, assigned warden, or admin |
| `GET` | `/api/dashboard/summary` | Authenticated |
| `GET`, `POST` | `/api/users` | Admin |
| `PUT`, `DELETE` | `/api/users/<id>` | Admin |
| `GET`, `POST` | `/api/hostels` | Admin |
| `PUT`, `DELETE` | `/api/hostels/<id>` | Admin |

Protected endpoints accept `Authorization: Bearer <access-token>`. List endpoints
return `{ items, pagination }`; leave filters include `status`, `search`,
`hostelBlock`, `studentName`, `fromDate`, `toDate`, and (for admins) `wardenId`.

Run the API tests with:

```powershell
python manage.py test
```
