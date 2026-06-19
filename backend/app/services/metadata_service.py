import json
from dataclasses import dataclass
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from backend.app.core.errors import VideoMetadataError


@dataclass(frozen=True, slots=True)
class VideoMetadata:
    title: str
    channel_name: str | None
    thumbnail_url: str


def fetch_video_metadata(
    video_id: str,
) -> VideoMetadata:
    video_url = (
        f"https://www.youtube.com/watch?v={video_id}"
    )

    query = urlencode(
        {
            "url": video_url,
            "format": "json",
        }
    )

    endpoint = (
        f"https://www.youtube.com/oembed?{query}"
    )

    request = Request(
        endpoint,
        headers={
            "User-Agent": "TubeIntel/1.0",
            "Accept": "application/json",
        },
    )

    try:
        with urlopen(
            request,
            timeout=10,
        ) as response:
            payload = json.loads(
                response.read().decode("utf-8")
            )

    except (
        HTTPError,
        URLError,
        TimeoutError,
        json.JSONDecodeError,
    ) as error:
        raise VideoMetadataError(
            "YouTube video metadata could not be retrieved."
        ) from error

    title = str(
        payload.get("title", "")
    ).strip()

    channel_name = str(
        payload.get("author_name", "")
    ).strip()

    thumbnail_url = str(
        payload.get("thumbnail_url", "")
    ).strip()

    if not title:
        raise VideoMetadataError(
            "YouTube did not return a video title."
        )

    return VideoMetadata(
        title=title,
        channel_name=channel_name or None,
        thumbnail_url=(
            thumbnail_url
            or (
                "https://img.youtube.com/vi/"
                f"{video_id}/hqdefault.jpg"
            )
        ),
    )