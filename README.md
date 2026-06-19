# TubeIntel AI — YouTube Video Analysis Platform

TubeIntel AI is a full-stack YouTube video analysis application where users can submit a YouTube video link, extract the transcript, generate structured AI summaries, download reports, and ask transcript-grounded questions about the video.

Built with Next.js, FastAPI, OpenAI, ChromaDB, ReportLab, YouTube Transcript API, and Docker Compose — demonstrating an end-to-end AI-powered video intelligence workflow.

## Features

### YouTube Video Input

Users can submit a YouTube video URL directly from the frontend.

The backend validates the URL, extracts the video ID, retrieves available transcript data, and fetches video metadata such as the title, channel name, and thumbnail.

### Transcript Extraction

The application extracts YouTube transcripts using the YouTube Transcript API.

The transcript is processed into a clean readable format and stored as a downloadable text artifact.

### AI Summary Generation

The backend uses OpenAI to generate structured summaries from the video transcript.

The generated report is written in Markdown format and includes a clear summary of the video content.

### Multiple Summary Styles

Users can choose different summary styles depending on the required output.

The application supports flexible summary generation for different use cases, such as concise overviews, detailed reports, and study-style notes.

### Real-Time Processing Flow

The frontend displays the analysis workflow as the backend processes the video.

The user can see the progress from transcript extraction to vector indexing, report generation, and PDF creation.

### PDF Report Generation

The application generates a downloadable PDF report using ReportLab.

The PDF includes the actual YouTube video title and the generated AI summary.

### Downloadable Artifacts

Each analysis run produces downloadable files:

* Full transcript
* Markdown summary
* PDF report

### Transcript-Grounded Ask AI

After analysis is completed, users can ask questions about the video.

The backend retrieves relevant transcript chunks from ChromaDB and generates answers based only on the video content.

### Vector Search

The transcript is split into chunks and indexed using ChromaDB.

This allows the Ask AI feature to retrieve the most relevant parts of the transcript before answering user questions.

### Docker Support

The frontend and backend are Dockerized.

The full application can be started with Docker Compose using one command.

## Tech Stack

| Layer        | Technology                                          |
| ------------ | --------------------------------------------------- |
| Frontend     | Next.js, React, TypeScript, Tailwind CSS            |
| Backend      | Python, FastAPI, Pydantic, Uvicorn                  |
| AI           | OpenAI Responses API, OpenAI Embeddings API         |
| Transcript   | YouTube Transcript API                              |
| Vector Store | ChromaDB                                            |
| Reports      | Markdown, ReportLab PDF                             |
| Storage      | Local file storage for runs and generated artifacts |
| DevOps       | Docker, Docker Compose                              |

## Architecture

```text
Next.js Frontend
    ↓ HTTP API
FastAPI Backend
    ↓
YouTube Transcript Extraction
    ↓
Transcript Chunking
    ↓
ChromaDB Vector Index
    ↓
OpenAI Summary Generation
    ↓
Markdown + PDF Report
    ↓
Transcript-Grounded Ask AI
```

Docker Compose runs two services:

```text
frontend   →  Next.js application
backend    →  FastAPI API server
```

Generated run data is stored locally inside:

```text
backend/data/runs
backend/data/vectors
```

## Project Structure

```text
tubeintel-ai/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   └── router.py
│   │   ├── core/
│   │   ├── models/
│   │   ├── services/
│   │   ├── storage/
│   │   └── utilities/
│   ├── data/
│   │   ├── runs/
│   │   └── vectors/
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── lib/
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
│
├── .env.example
├── .dockerignore
├── docker-compose.yml
├── requirements.txt
└── README.md
```

## Getting Started

## Prerequisites

* Git
* Python 3.11+
* Node.js 20+
* Docker Desktop
* OpenAI API key

Docker Desktop must be running before using Docker Compose.

## 1. Clone the Repository

```bash
git clone https://github.com/Jasirhere/tubeintel-ai.git
cd tubeintel-ai
```

## 2. Configure Environment Variables

Real `.env` files are intentionally not committed.

Create a root `.env` file from `.env.example`.

### Windows

```powershell
copy .env.example .env
```

### Mac / Linux

```bash
cp .env.example .env
```

## 3. Backend Environment

`.env.example`

```env
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini
EMBEDDING_MODEL=text-embedding-3-small
FRONTEND_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

Replace `your_openai_api_key` with a valid OpenAI API key.

Do not commit your real `.env` file.

## 4. Frontend Environment

For local non-Docker development, create:

```text
frontend/.env.local
```

Example:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8090
```

This tells the frontend where the backend API is running.

## 5. Start the Application with Docker

Build and start the full application:

```bash
docker compose up --build
```

This starts the backend and frontend together.

## 6. Open the App

| Service      | URL                        |
| ------------ | -------------------------- |
| Frontend     | http://127.0.0.1:3000      |
| Backend API  | http://127.0.0.1:8090      |
| Swagger Docs | http://127.0.0.1:8090/docs |

## 7. Stop the Application

```bash
docker compose down
```

## Local Development Without Docker

### Backend

Create and activate a virtual environment.

### Windows

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### Mac / Linux

```bash
python -m venv venv
source venv/bin/activate
```

Install backend dependencies:

```bash
pip install -r requirements.txt
```

Start the backend:

```bash
python -m uvicorn backend.app.main:app --reload --port 8090
```

Backend docs:

```text
http://127.0.0.1:8090/docs
```

### Frontend

Enter the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Frontend:

```text
http://127.0.0.1:3000
```

## User Flow

1. User opens the TubeIntel AI frontend
2. User enters a YouTube video URL
3. Backend validates the URL and extracts the video ID
4. Video title, channel name, and thumbnail are retrieved
5. Transcript is extracted from YouTube
6. Transcript is chunked into smaller sections
7. Chunks are indexed into ChromaDB
8. OpenAI generates a structured video summary
9. PDF report is generated
10. User can download transcript, summary, and PDF
11. User can ask questions about the video using Ask AI

## Generated Files

Each analysis run creates generated files inside:

```text
backend/data/runs
backend/data/vectors
```

These files are ignored by Git because they are generated at runtime.

Typical generated artifacts include:

| Artifact       | Description                            |
| -------------- | -------------------------------------- |
| transcript.txt | Full transcript extracted from YouTube |
| summary.md     | AI-generated Markdown summary          |
| report.pdf     | Downloadable PDF report                |
| run.json       | Stored run metadata and status         |
| vector data    | ChromaDB transcript index              |

## Docker Commands

| Action                      | Command                         |
| --------------------------- | ------------------------------- |
| Build and start the project | `docker compose up --build`     |
| Start existing containers   | `docker compose up`             |
| Start in background         | `docker compose up -d`          |
| Stop the project            | `docker compose down`           |
| Check running containers    | `docker compose ps`             |
| View backend logs           | `docker compose logs backend`   |
| View frontend logs          | `docker compose logs frontend`  |
| Rebuild backend only        | `docker compose build backend`  |
| Rebuild frontend only       | `docker compose build frontend` |

## Important Docker Note

The backend uses port `8090`.

If Docker fails to start because port `8090` is already in use, check the process using the port.

### Windows

```powershell
netstat -ano | findstr :8090
```

Then stop the process if required:

```powershell
Stop-Process -Id <PID> -Force
```

After freeing the port, start Docker again:

```bash
docker compose up
```

## API Overview

| Endpoint                            | Description                         |
| ----------------------------------- | ----------------------------------- |
| `GET /`                             | Backend root health message         |
| `GET /docs`                         | FastAPI Swagger documentation       |
| `POST /api/transcripts/preview`     | Preview transcript availability     |
| `POST /api/runs`                    | Start a new video analysis run      |
| `GET /api/runs/{run_id}`            | Get run status and metadata         |
| `GET /api/runs/{run_id}/transcript` | Download transcript                 |
| `GET /api/runs/{run_id}/summary`    | Download Markdown summary           |
| `GET /api/runs/{run_id}/pdf`        | Download PDF report                 |
| `POST /api/runs/{run_id}/chat`      | Ask a question about the transcript |

## Security Notes

* Real `.env` files are Git-ignored
* Never commit OpenAI API keys
* Never commit generated run files
* Never commit ChromaDB vector files
* Use `.env.example` only to document required variables
* Rotate API keys immediately if they are accidentally committed
* Keep Docker images free from hardcoded secrets

## Roadmap

* User accounts and saved history
* Cloud deployment
* Background job queue
* More summary styles
* Export to DOCX
* Export to slides
* Shareable report links
* Video playlist analysis
* Improved transcript language selection
* Admin dashboard
* Production file storage
* Better error handling for videos without transcripts

## Author

Jasir Khan
