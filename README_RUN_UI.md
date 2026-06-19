# TubeIntel AI - Working Full Stack Version

This version adds:

- React/Vite frontend in `frontend/`
- FastAPI backend in `backend/`
- Existing CrewAI YouTube summarizer pipeline in `youtube_video_summarizer/`

## 1. Add your API key

Create `.env` in the project root:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

You can also keep `.env` inside `youtube_video_summarizer/`, but root `.env` is cleaner.

## 2. Backend setup

From the project root:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000
```

Backend health check:

```text
http://127.0.0.1:8000/api/health
```

## 3. Frontend setup

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

## 4. How it works

React sends the YouTube URL to FastAPI:

```text
POST /api/summarize
```

FastAPI runs the CrewAI script, then returns:

- `transcript.md`
- `summary.md`
- `summary.pdf`
- console logs

The UI displays the agent workflow and final result.
