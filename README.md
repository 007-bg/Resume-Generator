# Resume Generator Agent

A full-stack AI-powered resume generation and job application tracking system with multi-agent architecture using LangChain and LangGraph.

## ✨ Features

### Multi-Agent Resume Generation
- **Generator Agent** - Creates tailored resumes from your career data
- **Reviewer Agent** - Quality checks and ATS optimization
- **Analyzer Agent** - Job matching with hybrid NLP scoring

### Job Application Tracker
- Track applications through 10 status stages (Saved → Applied → Interviewing → Offer → Accepted)
- List and Kanban board views
- Statistics dashboard

### User Management
- JWT authentication with token refresh
- OAuth login (Google, GitHub)
- User profiles with "ground truth" career data (JSONB)

### Frontend
- React 18 with Redux Toolkit for state management
- Client-side PDF generation with jsPDF
- Modern dark theme UI

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Backend** | Django 4.2, DRF, Celery, LangChain, LangGraph |
| **Frontend** | React 18, Redux Toolkit, Vite, jsPDF |
| **Auth** | django-allauth, SimpleJWT |
| **NLP** | spaCy, sentence-transformers, Hugging Face Inference |
| **Infrastructure** | Docker, Supervisor, Redis, PostgreSQL |

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Redis

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm

cp .env.example .env  # Edit with your keys
python manage.py migrate
python manage.py runserver
```

### Celery Worker

```bash
# Terminal 1: Redis
redis-server

# Terminal 2: Celery
cd backend && celery -A core worker -l info
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit http://localhost:5173

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DJANGO_SECRET_KEY` | Django secret key |
| `DATABASE_URL` | PostgreSQL URL (optional, defaults to SQLite) |
| `REDIS_URL` | Redis URL |
| `LLM_PROVIDER` | `huggingface` or `openai` |
| `HUGGINGFACE_API_KEY` | HF API key for agents |
| `GOOGLE_CLIENT_ID/SECRET` | Google OAuth |
| `GITHUB_CLIENT_ID/SECRET` | GitHub OAuth |

## Project Structure

```
├── backend/
│   ├── accounts/      # User auth & profiles
│   ├── agents/        # LangGraph multi-agent system
│   ├── api/           # Models, views, serializers
│   └── critique/      # NLP analysis engine
├── frontend/
│   ├── src/
│   │   ├── store/     # Redux slices
│   │   ├── components/
│   │   └── lib/       # PDF generator
└── Dockerfile
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/register/` | User registration |
| `POST /api/auth/token/` | JWT login |
| `GET /api/auth/me/` | Current user |
| `PATCH /api/auth/profile/ground-truth/` | Update career data |
| `POST /api/agents/generate/` | Generate resume |
| `GET /api/applications/` | Job applications CRUD |
| `GET /api/applications/stats/` | Application stats |

## Deployment

### Docker

```bash
docker build -t resume-agent .
docker run -p 7860:7860 resume-agent
```

### Hugging Face Spaces

1. Create Space with Docker SDK
2. Set secrets: `HF_TOKEN`, `HF_USERNAME`, `HF_SPACE_NAME`
3. Push to main branch

## License

MIT
