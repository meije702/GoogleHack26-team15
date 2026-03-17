# Marketing AI Agency — Cloud Run Deployment

AI-powered marketing platform with **3 specialized agents** built on Google Agent Development Kit (ADK) and Gemini 2.5 Flash.

## 🤖 Agents

### 🤝 Onboarding Agent
Conversational business intake that collects company details through natural dialogue.
- Gathers business name, location, products, target audience, budget, and goals
- Supports both text chat and voice interaction (Gemini Live API)
- Automated legal compliance screening (GDPR, CAN-SPAM, TCPA, FTC)

### ✍️ Content Creator Agent
Generates platform-optimized marketing content across 6 channels.
- **Platforms:** Instagram, LinkedIn, Twitter, Blog, Email, YouTube
- Tone control (professional, casual, humorous, inspirational, educational)
- Content calendar generation with optimal posting schedules
- Cross-platform content adaptation

### 📊 Interaction Analysis Agent
Monitors engagement and provides data-driven optimization recommendations.
- Real-time engagement metrics tracking
- Post performance analysis and ranking
- Automated community comment responses
- Competitor intelligence via Google Search grounding
- Actionable recommendations to improve reach and conversions

## 🏗️ Architecture

```
┌──────────────┐     ┌──────────────┐     ┌─────────────────────┐
│   Frontend   │────▶│   Backend    │────▶│    Vertex AI         │
│  (Cloud Run) │     │  (Cloud Run) │     │  Gemini 2.5 Flash    │
│  Next.js 15  │     │   FastAPI    │     └─────────────────────┘
└──────────────┘     │  Google ADK  │              │
                     └──────┬───────┘     ┌────────┴────────┐
                            │             │  Google Search   │
                   ┌────────┼────────┐    │  (Grounding)     │
                   │        │        │    └─────────────────┘
              ┌────▼───┐┌───▼───┐┌───▼────┐
              │Onboard-││Content││Interact-│
              │  ing   ││Creator││ Analysis│
              │ Agent  ││ Agent ││  Agent  │
              └────────┘└───────┘└─────────┘
```

## 📋 Inputs

| Variable | Description | Default |
|----------|-------------|---------|
| `project_id` | GCP Project ID | *(required)* |
| `region` | GCP region | `us-central1` |

## 📤 Outputs

| Output | Description |
|--------|-------------|
| `backend_url` | Cloud Run backend service URL |
| `frontend_url` | Cloud Run frontend service URL |
| `artifact_registry` | Artifact Registry repository path |

## 🚀 Deploy

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your project ID
terraform init
terraform apply
```

## Required APIs

- Cloud Run (`run.googleapis.com`)
- Artifact Registry (`artifactregistry.googleapis.com`)
- Vertex AI (`aiplatform.googleapis.com`)
- Cloud Build (`cloudbuild.googleapis.com`)
