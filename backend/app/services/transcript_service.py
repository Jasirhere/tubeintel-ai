from dataclasses import dataclass
from html import unescape

from youtube_transcript_api import (
    AgeRestricted,
    CouldNotRetrieveTranscript,
    InvalidVideoId,
    IpBlocked,
    NoTranscriptFound,
    RequestBlocked,
    TranscriptsDisabled,
    VideoUnavailable,
    YouTubeTranscriptApi,
    YouTubeTranscriptApiException,
)

from backend.app.core.errors import (
    InvalidYouTubeUrlError,
    TranscriptUnavailableError,
)
from backend.app.utilities.youtube import (
    extract_video_id,
    format_timestamp,
)


@dataclass(frozen=True, slots=True)
class TranscriptSegment:
    position: int
    text: str
    start_seconds: float
    duration_seconds: float

    @property
    def timestamp(self) -> str:
        return format_timestamp(self.start_seconds)


@dataclass(frozen=True, slots=True)
class TranscriptDocument:
    video_id: str
    language: str
    language_code: str
    is_generated: bool
    segments: tuple[TranscriptSegment, ...]
    full_text: str
    markdown: str
    preview: str

    @property
    def thumbnail_url(self) -> str:
        return (
            f"https://img.youtube.com/vi/"
            f"{self.video_id}/hqdefault.jpg"
        )


def clean_transcript_text(text: str) -> str:
    decoded_text = unescape(text)

    return " ".join(decoded_text.split()).strip()


def fetch_transcript(
    youtube_url: str,
    preferred_languages: list[str] | None = None,
) -> TranscriptDocument:
    languages = preferred_languages or ["en"]

    try:
        video_id = extract_video_id(youtube_url)

        transcript_api = YouTubeTranscriptApi()

        fetched_transcript = transcript_api.fetch(
            video_id,
            languages=languages,
        )

        segments: list[TranscriptSegment] = []

        for position, snippet in enumerate(
            fetched_transcript,
            start=1,
        ):
            text = clean_transcript_text(snippet.text)

            if not text:
                continue

            segments.append(
                TranscriptSegment(
                    position=position,
                    text=text,
                    start_seconds=float(snippet.start),
                    duration_seconds=float(snippet.duration),
                )
            )

        if not segments:
            raise TranscriptUnavailableError(
                "YouTube returned an empty transcript."
            )

        full_text = " ".join(
            segment.text
            for segment in segments
        )

        markdown = "\n".join(
            f"[{segment.timestamp}] {segment.text}"
            for segment in segments
        )

        preview_lines = [
            f"[{segment.timestamp}] {segment.text}"
            for segment in segments[:12]
        ]

        preview = "\n".join(preview_lines)

        return TranscriptDocument(
            video_id=video_id,
            language=fetched_transcript.language,
            language_code=fetched_transcript.language_code,
            is_generated=fetched_transcript.is_generated,
            segments=tuple(segments),
            full_text=full_text,
            markdown=markdown,
            preview=preview,
        )

    except InvalidYouTubeUrlError:
        raise

    except InvalidVideoId as error:
        raise InvalidYouTubeUrlError(
            "The YouTube video ID is invalid."
        ) from error

    except TranscriptsDisabled as error:
        raise TranscriptUnavailableError(
            "Subtitles are disabled for this video."
        ) from error

    except NoTranscriptFound as error:
        raise TranscriptUnavailableError(
            "No transcript was found in the requested language."
        ) from error

    except VideoUnavailable as error:
        raise TranscriptUnavailableError(
            "This YouTube video is unavailable."
        ) from error

    except AgeRestricted as error:
        raise TranscriptUnavailableError(
            "This age-restricted video cannot be accessed."
        ) from error

    except (RequestBlocked, IpBlocked) as error:
        raise TranscriptUnavailableError(
            "YouTube temporarily blocked the transcript request."
        ) from error

    except CouldNotRetrieveTranscript as error:
        raise TranscriptUnavailableError(
            "The transcript could not be retrieved."
        ) from error

    except YouTubeTranscriptApiException as error:
        raise TranscriptUnavailableError(
            "YouTube rejected the transcript request."
        ) from error
