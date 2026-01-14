# Resume Critique Agent

A production-ready AI-powered resume analysis system that evaluates resumes against job descriptions using NLP and semantic similarity.

## Features

- **Job Dashboard**: Manage job postings and track candidate pipelines
- **Resume Analysis**: Hybrid scoring using keyword matching and semantic similarity
- **Detailed Feedback**: Strengths, weaknesses, and recommendations for each resume
- **Async Processing**: Background analysis with real-time status updates
- **Zero-Cost Hosting**: Designed for deployment on Hugging Face Spaces

## Tech Stack

- **Backend**: Django 4.2, Django REST Framework, Celery
- **Frontend**: React 18, Vite, React Router
- **NLP**: spaCy, sentence-transformers
- **Infrastructure**: Docker, Supervisor, Redis

## Local Development

### Prerequisites

- Python 3.10+
- Node.js 18+
- Redis (or Docker)

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm

# Copy environment template
cp .env.example .env

# Run migrations
python manage.py migrate

# Start Django server
python manage.py runserver
```

### Start Redis & Celery

```bash
# Terminal 1: Redis
redis-server

# Terminal 2: Celery worker
cd backend
celery -A core worker -l info
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Visit http://localhost:5173

## Docker Build

```bash
docker build -t critique-agent .
docker run -p 7860:7860 critique-agent
```

## Deployment to Hugging Face Spaces

1. Create a new Space with Docker SDK
2. Add secrets in GitHub repository:
   - `HF_TOKEN`: Your Hugging Face access token
   - `HF_USERNAME`: Your Hugging Face username
   - `HF_SPACE_NAME`: Name of your Space
3. Push to main branch to trigger deployment

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DEBUG` | Enable debug mode | `False` |
| `DJANGO_SECRET_KEY` | Django secret key | Required |
| `DATABASE_URL` | PostgreSQL connection URL | SQLite |
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379/0` |
| `ALLOWED_HOSTS` | Comma-separated hosts | `localhost,127.0.0.1` |

## License

MIT
