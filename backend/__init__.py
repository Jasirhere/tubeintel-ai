import re
from urllib.parse import parse_qs, urlparse

from backend.app.core.errors import InvalidYouTubeUrlError


VIDEO_ID_PATTERN = re.compile(r"^[A-Za-z0-9_-]{11}$")


def extract_video_id(value: str) -> str:
    """
    Extract an 11-character YouTube video ID from a URL or raw video ID.

    Supported examples:
    - https://www.youtube.com/watch?v=VIDEO_ID
    - https://youtu.be/VIDEO_ID
    - https://www.youtube.com/shorts/VIDEO_ID
    - https://www.youtube.com/embed/VIDEO_ID
    - https://www.youtube.com/live/VIDEO_ID
    - VIDEO_ID
    """
    candidate = value.strip()

    if VIDEO_ID_PATTERN.fullmatch(candidate):
        return candidate

    if not candidate:
        raise InvalidYouTubeUrlError("The YouTube URL cannot be empty.")

    if "://" not in candidate:
        candidate = f"https://{candidate}"

    parsed_url = urlparse(candidate)
    hostname = (parsed_url.hostname or "").lower()

    video_id: str | None = None

    if hostname in {"youtu.be", "www.youtu.be"}:
        path_parts = [
            part
            for part in parsed_url.path.split("/")
            if part
        ]

        if path_parts:
            video_id = path_parts[0]

    elif (
        hostname == "youtube.com"
        or hostname.endswith(".youtube.com")
        or hostname == "youtube-nocookie.com"
        or hostname.endswith(".youtube-nocookie.com")
    ):
        path_parts = [
            part
            for part in parsed_url.path.split("/")
            if part
        ]

        if parsed_url.path == "/watch":
            video_id = parse_qs(parsed_url.query).get("v", [None])[0]

        elif (
            len(path_parts) >= 2
            and path_parts[0] in {"shorts", "embed", "live"}
        ):
            video_id = path_parts[1]

    if not video_id or not VIDEO_ID_PATTERN.fullmatch(video_id):
        raise InvalidYouTubeUrlError(
            "Enter a valid YouTube video URL."
        )

    return video_id


def format_timestamp(seconds: float) -> str:
    total_seconds = max(0, int(seconds))

    hours, remainder = divmod(total_seconds, 3600)
    minutes, remaining_seconds = divmod(remainder, 60)

    if hours:
        return (
            f"{hours:02d}:"
            f"{minutes:02d}:"
            f"{remaining_seconds:02d}"
        )

    return f"{minutes:02d}:{remaining_seconds:02d}"
