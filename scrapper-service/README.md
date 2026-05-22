# SMART PUBLIC SENTIMENT DASHBOARD (AI-DRIVEN)

AI-powered public sentiment monitoring system for Indonesia using:

- Real-time scraping
- AI sentiment analysis
- RAG (Retrieval-Augmented Generation)
- Distributed workers
- Geospatial visualization
- Voice-controlled dashboard

---

# 📌 Project Overview

Smart Public Sentiment Dashboard adalah platform monitoring sentimen publik berbasis AI yang dirancang untuk membantu instansi, pemerintah, maupun organisasi dalam memantau opini dan keluhan masyarakat secara real-time.

Sistem melakukan pengambilan data dari berbagai platform publik seperti media sosial dan portal berita, kemudian memproses data menggunakan AI dan RAG (Retrieval-Augmented Generation) untuk menghasilkan insight berbasis regulasi pemerintah.

Output akhir divisualisasikan ke dalam dashboard interaktif berbasis peta Indonesia dengan update real-time dan kontrol suara.

---

# 🏗️ High-Level Architecture

```text
                 ┌─────────────────┐
                 │ Scheduler       │
                 │ Job Dispatcher  │
                 └────────┬────────┘
                          │
                          ▼
                ┌──────────────────┐
                │ Redis Queue      │
                └────────┬─────────┘
                         │
      ┌──────────────────┼──────────────────┐
      ▼                  ▼                  ▼
┌────────────┐    ┌────────────┐    ┌────────────┐
│ Twitter    │    │ News       │    │ TikTok     │
│ Worker     │    │ Worker     │    │ Worker     │
└─────┬──────┘    └─────┬──────┘    └─────┬──────┘
      │                 │                 │
      └─────────────────┼─────────────────┘
                        ▼
              ┌──────────────────┐
              │ AI Queue         │
              └────────┬─────────┘
                       ▼
              ┌──────────────────┐
              │ AI Engine        │
              │ FastAPI + RAG    │
              └────────┬─────────┘
                       ▼
            ┌──────────────────────┐
            │ MongoDB + PostgreSQL │
            └──────────────────────┘
```

---

# 📂 Monorepo Structure

```text
smart-gov-dashboard/
├── scraper-service/
├── ai-engine/
├── core-backend/
└── dashboard-client/
```

---

# 🚀 STEP 1 — Scraper Service

## 🎯 Objective

Membangun distributed scraping system yang:

- berjalan otomatis setiap interval tertentu
- melakukan scraping berdasarkan keyword
- menghindari duplicate processing
- mendukung queue-based processing
- scalable secara horizontal
- mengirim data ke AI processing queue

---

# 🧠 Features

✅ Async scraping using Playwright  
✅ APScheduler job scheduler  
✅ Distributed worker architecture  
✅ Redis Queue integration  
✅ Browser pooling  
✅ Proxy-ready infrastructure  
✅ AI processing queue  
✅ Duplicate prevention system  
✅ Docker-ready deployment  
✅ Production-ready scaling architecture  

---

# 📁 Folder Structure

```text
scraper-service/
├── main.py
│
├── scraper/
│   ├── twitter_scraper.py
│   ├── news_scraper.py
│   └── base_scraper.py
│
├── services/
│   ├── deduplicator.py
│   ├── sender.py
│   ├── scheduler.py
│   ├── keywords.py
│   ├── queue_service.py
│   ├── browser_pool.py
│   ├── ai_worker.py
│   └── worker_manager.py
│
├── utils/
│   ├── user_agents.py
│   ├── proxy_handler.py
│   ├── logger.py
│   └── config.py
│
├── storage/
│   ├── seen_posts.json
│   └── session_state.json
│
├── logs/
│   └── scraper.log
│
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
├── .env
└── .env.example
```

---

# ⚙️ Installation

## 1. Clone Repository

```bash
git clone https://github.com/yourusername/smart-gov-dashboard.git

cd smart-gov-dashboard/scraper-service
```

---

## 2. Create Virtual Environment

### Windows

```bash
python -m venv venv

venv\Scripts\activate
```

### Linux / Mac

```bash
python3 -m venv venv

source venv/bin/activate
```

---

## 3. Install Dependencies

```bash
pip install -r requirements.txt
```

---

## 4. Install Playwright Browser

```bash
playwright install
```

---

# 🔐 Environment Variables

Copy environment file:

```bash
cp .env.example .env
```

---

## Example `.env`

```env
AI_ENGINE_URL=http://localhost:8000/analyze

SCRAPE_INTERVAL=10

KEYWORDS=banjir,jalan rusak,macet,sampah,longsor

ENABLE_PROXY=false

REDIS_HOST=localhost
REDIS_PORT=6379
```

---

# ▶️ Running The Service

## Local Development

```bash
python main.py
```

Expected output:

```bash
Scheduler started...
Running scraper job...
Queued AI job: banjir
```

---

# 🐳 Docker Deployment

## Start Services

```bash
docker compose up --build
```

---

## Scale Scraper Workers

```bash
docker compose up --scale scraper=5
```

---

# 📄 Example JSON Payload

```json
{
  "source": "twitter",
  "keyword": "banjir",
  "content": "Banjir besar di Manado sejak pagi..."
}
```

---

# 🔄 Distributed Scraping Flow

```text
Scheduler Trigger
        ↓
Keyword Dispatcher
        ↓
Redis Queue
        ↓
Distributed Scraper Workers
        ↓
Deduplication
        ↓
AI Processing Queue
        ↓
AI Worker
        ↓
AI Engine API
```

---

# 🧹 Deduplication System

Untuk mencegah duplicate processing:

- setiap post di-hash menggunakan MD5
- hash disimpan di:

```text
storage/seen_posts.json
```

Jika hash sudah ada:
- data tidak akan diproses ulang

---

## Production Recommendation

Untuk production-scale system disarankan menggunakan:

- Redis
- MongoDB
- Bloom Filters

karena file-based deduplication tidak ideal untuk distributed workers.

---

# ⚡ Production Scaling Architecture

## Queue-Based Processing

System menggunakan Redis Queue untuk memisahkan:

- scraping workers
- AI processing
- database ingestion

Benefits:

- async processing
- retry mechanism
- buffering
- horizontal scaling
- fault tolerance

---

## Distributed Workers

Setiap platform dapat berjalan secara independen:

```text
Worker 1 → Twitter
Worker 2 → TikTok
Worker 3 → News Portal
Worker 4 → Facebook
```

---

## Browser Pooling

Playwright browser di-reuse menggunakan browser pooling untuk:

- mengurangi penggunaan RAM
- mempercepat scraping
- mengurangi browser startup overhead

---

## AI Queue Layer

Scraped content tidak dikirim langsung ke AI Engine.

Flow:

```text
Scraper → Redis Queue → AI Worker → AI Engine
```

Hal ini mencegah:

- AI overload
- timeout bottlenecks
- LLM rate-limit spikes

---

## Proxy Rotation

Production scraper support:

- rotating proxies
- proxy pools
- session persistence

Recommended providers:

- BrightData
- Oxylabs
- ScrapeOps

---

# 🚨 Important Notes

Modern social media platforms memiliki:

- anti-bot systems
- rate limiting
- captcha protection
- login walls

Project ini ditujukan untuk:

- educational use
- research
- portfolio
- internal monitoring

Selalu patuhi Terms of Service masing-masing platform.

---

# 🛠️ Tech Stack

## Scraper Service

- Python
- Playwright
- APScheduler
- HTTPX
- Redis
- AsyncIO
- Docker

---

## AI Engine

- FastAPI
- LangChain
- Gemini API
- Groq API
- FAISS

---

## Backend

- Node.js
- Express
- Socket.io
- Supabase
- MongoDB

---

## Frontend

- Next.js
- TailwindCSS
- Mapbox GL JS
- Recharts
- Web Speech API

---

# 🧠 Future Features

- Real-time streaming
- TikTok scraping
- Instagram integration
- AI summarization
- Trend prediction
- Heatmap analytics
- Voice-controlled dashboard
- Multi-region scaling
- Kubernetes orchestration

---

# 📌 Development Roadmap

## ✅ STEP 1

Scraper Service

- Distributed scraping
- Queue architecture
- Browser pooling
- AI queue integration

---

## ⏳ STEP 2

AI Engine (FastAPI + LangChain + RAG)

- sentiment analysis
- urgency scoring
- recommendation engine
- geocoding
- vector database

---

## ⏳ STEP 3

Core Backend (Socket.io + Database)

- realtime broadcasting
- Supabase integration
- MongoDB backup
- websocket gateway

---

## ⏳ STEP 4

Dashboard Client (Next.js + Mapbox)

- realtime dashboard
- geospatial visualization
- realtime charts
- speech recognition
- voice-controlled map

---

# 👨‍💻 Author

Built for:
AI-Driven Public Monitoring & Smart Government Dashboard Project.

---

# 📄 License

MIT License