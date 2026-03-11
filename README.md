# 🏥 MediChain SRM — AI Health Council

> **Multi-LLM, Hash-Ledger-Secured AI Medical Assistant**  
> 254,000+ Indian Medicine Database • Zero-Downtime AI Council • Production-Ready

[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-purple)](https://vitejs.dev/)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🤖 **MediBot Chat** | Multi-LLM chatbot (Gemini → g4f → Ollama → Hardcoded fallback) |
| 🩺 **Symptom Analyzer** | Structured clinical assessment with urgency classification (🟢🟡🔴) |
| ⚗️ **Drug Interaction Checker** | AI analysis of dangerous medicine combinations |
| 📋 **Report Reader** | Blood test, X-ray, urine analysis interpretation |
| 💊 **Medicine Verifier** | Instant lookup in 254,022 verified Indian medicines |
| 🔗 **Hash Ledger** | SHA-256 + AES-256-GCM tamper-evident record chain |

---

## 🚀 Quick Start (Development)

### Prerequisites
- **Node.js** 18+
- **Python** 3.11+
- **pip** (Python package manager)

### 1. Clone & Setup Environment

```bash
git clone https://github.com/your-username/medichain-srm.git
cd medichain-srm
```

**Backend:**
```bash
cp backend/.env.example backend/.env
# Edit backend/.env and add your GEMINI_API_KEY
```

**Frontend:**
```bash
cp frontend/.env.example frontend/.env.local
# Edit frontend/.env.local — VITE_API_URL defaults to http://localhost:8000
```

### 2. Start Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Backend runs at: **http://localhost:8000**  
API docs: **http://localhost:8000/docs**

### 3. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:5000**

---

## 🐳 Production Deployment (Docker Compose)

### Prerequisites
- Docker + Docker Compose
- Your `GEMINI_API_KEY`

```bash
# Set your API key as an environment variable
export GEMINI_API_KEY=your_key_here

# Build and launch
docker-compose up --build -d

# Check status
docker-compose ps
docker-compose logs backend
```

- **Frontend:** http://localhost (port 80)
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `GEMINI_API_KEY` | *(required)* | Google Gemini API key |
| `ALLOWED_ORIGINS` | `http://localhost:5000,...` | CORS allowed origins |
| `RATE_LIMIT_PER_MINUTE` | `15` | Max AI requests per IP per minute |
| `OLLAMA_URL` | `http://localhost:11434` | Ollama local LLM endpoint |

### Frontend (`frontend/.env.local`)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:8000` | Backend API base URL |
| `VITE_GOOGLE_CLIENT_ID` | *(optional)* | Google OAuth Client ID |

---

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/api/chat` | MediBot chat (rate-limited: 15/min) |
| `POST` | `/api/analyze-symptoms` | Symptom analysis |
| `POST` | `/api/analyze-report` | Medical report interpretation |
| `POST` | `/api/drug-interactions` | Drug interaction checker |
| `GET` | `/api/medicines/search?q=` | Search medicines database |
| `GET` | `/api/medicines/verify?name=` | Verify specific medicine |
| `GET` | `/api/medicines/stats` | Database statistics |
| `GET` | `/api/llm/status` | Check LLM provider status |

---

## 🏗️ Architecture

```
Frontend (React + Vite + TailwindCSS)
    │── Hash Ledger Service (AES-256-GCM + SHA-256)
    └── REST API ──▶ FastAPI Backend
                        ├── LLM Council (Gemini → g4f → Ollama → Fallback)
                        └── Medicine DB (254k+ records, pandas CSV)
```

---

## ⚠️ Disclaimer

MediChain SRM is an **AI-assisted** medical information tool built as a university capstone project. It is **not a substitute** for professional medical advice, diagnosis, or treatment. Always consult a qualified doctor before taking any medication.

---

*Built by SRM University CSE Students — AI Health Council v3.0*
