from pydantic import BaseModel, Field


class TranscriptPreviewRequest(BaseModel):
    youtube_url: str = Field(
        min_length=5,
        max_length=500,
    )

    preferred_languages: list[str] = Field(
        default_factory=lambda: ["en"],
        min_length=1,
        max_length=5,
    )


class TranscriptSegmentResponse(BaseModel):
    position: int
    timestamp: str
    start_seconds: float
    duration_seconds: float
    text: str


class TranscriptPreviewResponse(BaseModel):
    video_id: str
    language: str
    language_code: str
    is_generated: bool
    segment_count: int
    character_count: int
    thumbnail_url: str
    preview: str
    sample_segments: list[TranscriptSegmentResponse]