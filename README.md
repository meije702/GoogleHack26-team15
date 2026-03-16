# Marketing AI Agency

> **Google Cloud Hackathon 2026 — Team 15**

An AI-powered marketing agency that automates business onboarding, strategy creation, content generation, and social media management. Built with **Google ADK** (Agent Development Kit), **Gemini Live Native Audio** for real-time voice conversations, and **Vertex AI** on Google Cloud.

## Demo

| Page | Description |
|------|-------------|
| **Voice Onboarding** | Real-time voice conversation with an AI agent using Gemini Live Native Audio. Collects business info hands-free. |
| **Marketing Strategy** | AI-generated marketing strategy with SWOT analysis, channel recommendations, and KPIs. |
| **Content Studio** | Content calendar with AI-powered creation for blog, Instagram, Twitter, and LinkedIn. |
| **Instagram** | Full Instagram mock UI with AI-driven post creation, research, and engagement tracking. |

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                 Next.js Frontend                     │
│         React 19 · TypeScript · Tailwind CSS        │
│              http://localhost:3000                   │
└────────────────────┬────────────────────────────────┘
                     │ REST + WebSocket
┌────────────────────▼────────────────────────────────┐
│               FastAPI Backend                        │
│              http://localhost:8000                   │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │  Onboarding  │  │   Strategy   │  │  Content   │ │
│  │    Agent     │  │    Agent     │  │   Agent    │ │
│  │  (Voice AI)  │  │ (Search/SWOT)│  │ (Calendar) │ │
│  └──────────────┘  └──────────────┘  └────────────┘ │
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │           Instagram Multi-Agent                  ││
│  │  Research · Posting · Engagement                 ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  Voice: gemini-live-2.5-flash-native-audio           │
│  Text:  gemini-2.5-flash (Vertex AI)                 │
└─────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| AI Framework | Google ADK (Agent Development Kit) |
| Voice Model | Gemini Live 2.5 Flash Native Audio |
| Text Model | Gemini 2.5 Flash via Vertex AI |
| Backend | Python 3.12 · FastAPI · WebSockets |
| Frontend | Next.js 15 · React 19 · TypeScript · Tailwind CSS |
| Auth | GCP Service Account · Vertex AI |
| Infra | Docker Compose · Google Cloud |

## Key Features

- **Real-time Voice AI** — Bidirectional audio streaming via Gemini Live API with native audio (no STT/TTS pipeline)
- **Multi-Agent System** — Specialized agents for onboarding, strategy, content, and Instagram management
- **Google Search Grounding** — Strategy agent uses live web data for market research
- **Legal Compliance Check** — Onboarding agent validates marketing regulations by country
- **Mock Instagram** — Full Instagram-style UI for demo with AI-powered content creation

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 20+
- Google Cloud project with Vertex AI API enabled
- `gcloud` CLI installed and authenticated

### Setup

```bash
# Clone
git clone https://github.com/meije702/GoogleHack26-team15.git
cd GoogleHack26-team15

# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -e .
cp .env.example .env   # Edit with your GCP project details
cd ..

# Frontend
cd frontend
npm install
cd ..
```

### GCP Authentication

```bash
# Option 1: Application Default Credentials
gcloud auth application-default login

# Option 2: Service Account (recommended for deployment)
# Place service-account.json in backend/ and set in .env:
# GOOGLE_APPLICATION_CREDENTIALS=service-account.json
```

### Run

```bash
# Terminal 1 — Backend
cd backend && source venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Open **http://localhost:3000**

### Docker

```bash
docker compose up --build
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/chat/{agent}` | Text chat with any agent |
| `WS` | `/api/voice/{agent}` | Voice streaming (Gemini Live) |
| `GET` | `/api/instagram/posts` | List mock Instagram posts |
| `POST` | `/api/instagram/posts` | Create a mock post |
| `GET` | `/api/instagram/metrics` | Engagement metrics |
| `GET` | `/api/businesses` | List onboarded businesses |
| `GET` | `/api/agents` | List all available agents |

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── agents/
│   │   │   ├── onboarding_agent.py   # Voice onboarding (Gemini Live)
│   │   │   ├── strategy_agent.py     # Marketing strategy + Google Search
│   │   │   ├── content_agent.py      # Content calendar + multi-platform
│   │   │   ├── instagram_agent.py    # Research + posting + engagement
│   │   │   └── root_agent.py         # Orchestrator
│   │   ├── services/
│   │   │   ├── instagram_mock.py     # Mock Instagram API
│   │   │   └── memory_service.py     # ADK session management
│   │   └── main.py                   # FastAPI + WebSocket server
│   ├── pyproject.toml
│   └── Dockerfile
├── frontend/
│   ├── src/app/
│   │   ├── page.tsx                  # Dashboard
│   │   ├── onboarding/page.tsx       # Voice onboarding UI
│   │   ├── strategy/page.tsx         # Strategy chat
│   │   ├── content/page.tsx          # Content studio
│   │   └── instagram/page.tsx        # Instagram mock
│   ├── src/components/               # Shared components
│   ├── src/lib/                      # API client + utilities
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## Team

**Team 15** — Google Cloud Hackathon, March 16, 2026

## License

MIT
