from fastapi import APIRouter, HTTPException, status

from backend.app.core.errors import (
    InvalidYouTubeUrlError,
    TranscriptUnavailableError,
)
from backend.app.models.transcript import (
    TranscriptPreviewRequest,
    TranscriptPreviewResponse,
    TranscriptSegmentResponse,
)
from backend.app.services.transcript_service import (
    fetch_transcript,
)


router = APIRouter(
    prefix="/transcripts",
    tags=["Transcripts"],
)


@router.post(
    "/preview",
    response_model=TranscriptPreviewResponse,
)
def preview_transcript(
    payload: TranscriptPreviewRequest,
) -> TranscriptPreviewResponse:
    try:
        document = fetch_transcript(
            youtube_url=payload.youtube_url,
            preferred_languages=payload.preferred_languages,
        )

    except InvalidYouTubeUrlError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(error),
        ) from error

    except TranscriptUnavailableError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error

    sample_segments = [
        TranscriptSegmentResponse(
            position=segment.position,
            timestamp=segment.timestamp,
            start_seconds=segment.start_seconds,
            duration_seconds=segment.duration_seconds,
            text=segment.text,
        )
        for segment in document.segments[:8]
    ]

    return TranscriptPreviewResponse(
        video_id=document.video_id,
        language=document.language,
        language_code=document.language_code,
        is_generated=document.is_generated,
        segment_count=len(document.segments),
        character_count=len(document.full_text),
        thumbnail_url=document.thumbnail_url,
        preview=document.preview,
        sample_segments=sample_segments,
    )
