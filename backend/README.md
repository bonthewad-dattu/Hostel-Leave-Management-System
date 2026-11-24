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
