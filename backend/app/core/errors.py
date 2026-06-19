class InvalidYouTubeUrlError(ValueError):
    """Raised when a YouTube URL or video ID cannot be understood."""


class TranscriptUnavailableError(RuntimeError):
    """Raised when a transcript cannot be retrieved from YouTube."""


class RunNotFoundError(LookupError):
    """Raised when a requested analysis run does not exist."""


class RunStorageError(RuntimeError):
    """Raised when run files cannot be read or written."""


class SummaryGenerationError(RuntimeError):
    """Raised when the AI report cannot be generated."""


class VectorIndexError(RuntimeError):
    """Raised when transcript vectors cannot be created or queried."""


class ChatGenerationError(RuntimeError):
    """Raised when a grounded chat answer cannot be generated."""    

class VideoMetadataError(RuntimeError):
    """Raised when YouTube video metadata cannot be retrieved."""    