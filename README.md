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
- Python 3.11 (Required for dependencies)
- Node.js 18+
- Docker (for Redis)
- Pipenv (`pip install pipenv`)

### Backend Setup

1. **Install Dependencies**
   ```bash
   cd backend
   pipenv install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Update .env with your API keys (OpenAI/HuggingFace)
   ```

3. **Database & Admin**
   ```bash
   pipenv shell
   python manage.py migrate
   python manage.py createsuperuser
   ```

4. **Run Server**
   ```bash
   python manage.py runserver
   ```

### Background Services (Required for Agents)

1. **Start Redis**

   **Option 1: Docker (Recommended)**
   ```bash
   docker run -d -p 6379:6379 --name redis-resume redis
   ```

   **Option 2: Native Installation**
   - **Windows:** Install [Memurai](https://www.memurai.com/) (Developer Edition) or run Redis via WSL.
   - **Mac/Linux:** `brew install redis` or `sudo apt-get install redis-server`.
   - Start the service: `redis-server`

2. **Start Celery Worker**
   Open a new terminal in `backend`:
   ```bash
   pipenv shell
   # Windows (Critical: use --pool=solo)
   celery -A core worker -l info --pool=solo
   
   # Linux/Mac
   # celery -A core worker -l info
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
