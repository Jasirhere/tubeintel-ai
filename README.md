@'
# TubeIntel AI

TubeIntel AI is a full-stack YouTube video analysis application. It extracts transcripts, generates structured AI summaries, creates downloadable reports, and provides transcript-grounded question answering.

## Features

- YouTube transcript extraction
- Real-time processing progress
- Multiple summary styles
- Complete timestamped transcript
- Structured Markdown report
- PDF report generation
- Video title and channel metadata
- ChromaDB vector indexing
- Transcript-grounded Ask AI
- Downloadable transcript, summary, and PDF files

## Technology Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend

- FastAPI
- OpenAI Responses API
- OpenAI Embeddings API
- ChromaDB
- YouTube Transcript API
- ReportLab
- Pydantic

## Project Structure

```text
TubeIntel-AI-Working-App/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── services/
│   │   ├── storage/
│   │   └── utilities/
│   └── data/
│       ├── runs/
│       └── vectors/
├── frontend/
├── .env.example
├── .gitignore
├── requirements.txt
└── README.md