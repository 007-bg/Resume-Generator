# Backend Setup & Run Instructions

## Prerequisites
- Python 3.11
- Pipenv (`pip install pipenv`)

## 1. Install Dependencies
If you haven't already:
```bash
pipenv install
```

## 2. Activate Virtual Environment
Enter the virtual shell:
```bash
pipenv shell
```

## 3. Environment Configuration
Ensure you have a `.env` file in the `backend` directory. You can copy the example:
```bash
cp .env.example .env
```
(On Windows: `copy .env.example .env`)

## 4. Run Migrations
Initialize the database:
```bash
python manage.py migrate
```

## 5. Create Superuser (Admin)
Create an account to access the Django Admin:
```bash
python manage.py createsuperuser
```

## 6. Run Development Server
Start the backend server:
```bash
python manage.py runserver
```
The API will be available at `http://localhost:8000`.

## 7. Background Tasks (Redis & Celery)
The "Agents" and "Critique" features require background processing.

### A. Start Redis

**Option 1: Using Docker (Recommended for Windows)**
```bash
docker run -d -p 6379:6379 --name redis-resume redis
```

**Option 2: Native Installation**
- **Windows:** Install [Memurai](https://www.memurai.com/) (Developer Edition is free) or use WSL.
- **Mac/Linux:** `brew install redis` or `sudo apt-get install redis-server`.
- Start the service: `redis-server`

### B. Start Celery Worker
Open a **new terminal** and run these commands to start the background worker:

```bash
cd backend
pipenv shell

# Windows (Critical: use --pool=solo)
cd backend
pipenv shell
celery -A core worker -l info --pool=solo
```

*Note: Keep this terminal open to process background jobs (AI generation).*
