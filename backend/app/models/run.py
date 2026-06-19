from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


RunStatus = Literal[
    "queued",
    "extracting_transcript",
    "transcript_ready",
    "indexing_transcript",
    "rag_ready",
    "summarizing_chunks",
    "composing_report",
    "summary_ready",
    "generating_pdf",
    "completed",
    "failed",
]

SummaryStyle = Literal[
    "Bullet Notes",
    "Professional",
    "Academic",
    "Executive Brief",
]


class CreateRunRequest(BaseModel):
    youtube_url: str = Field(
        min_length=5,
        max_length=500,
    )

    preferred_languages: list[str] = Field(
        default_factory=lambda: ["en"],
        min_length=1,
        max_length=5,
    )

    summary_style: SummaryStyle = "Professional"

    optional_notes: str = Field(
        default="",
        max_length=2000,
    )


class CreateRunResponse(BaseModel):
    run_id: str
    status: RunStatus
    progress: int
    message: str
    status_url: str


class RunStatusResponse(BaseModel):
    run_id: str
    status: RunStatus
    progress: int
    message: str

    youtube_url: str
    video_id: str | None = None
    video_title: str | None = None
    channel_name: str | None = None

    summary_style: SummaryStyle
    optional_notes: str = ""

    language: str | None = None
    language_code: str | None = None
    is_generated: bool | None = None

    segment_count: int | None = None
    character_count: int | None = None
    thumbnail_url: str | None = None
    transcript_preview: str | None = None

    chunk_count: int | None = None
    completed_chunks: int | None = None
    summary_preview: str | None = None
    summary_file: str | None = None
    transcript_file: str | None = None
    pdf_file: str | None = None
    error: str | None = None

    created_at: datetime
    updated_at: datetime
    vector_chunk_count: int | None = None