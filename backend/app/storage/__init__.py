import json
from datetime import datetime, timezone
from pathlib import Path
from threading import Lock
from typing import Any
from uuid import UUID, uuid4

from backend.app.core.errors import (
    RunNotFoundError,
    RunStorageError,
)
from backend.app.core.settings import get_settings
from backend.app.services.transcript_service import (
    TranscriptDocument,
)


_FILE_LOCK = Lock()


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


class RunRepository:
    def __init__(self) -> None:
        settings = get_settings()
        self._runs_directory = settings.runs_directory

    def create_run(
        self,
        youtube_url: str,
        preferred_languages: list[str],
        summary_style: str,
        optional_notes: str,
    ) -> dict[str, Any]:
        run_id = str(uuid4())
        timestamp = utc_now()

        run_data: dict[str, Any] = {
            "run_id": run_id,
            "status": "queued",
            "progress": 0,
            "message": "Run created and waiting to start.",
            "youtube_url": youtube_url,
            "preferred_languages": preferred_languages,
            "summary_style": summary_style,
            "optional_notes": optional_notes,
            "video_id": None,
            "language": None,
            "language_code": None,
            "is_generated": None,
            "segment_count": None,
            "character_count": None,
            "thumbnail_url": None,
            "transcript_preview": None,
            "chunk_count": None,
            "vector_chunk_count": None,
            "completed_chunks": None,
            "summary_preview": None,
            "transcript_file": None,
            "summary_file": None,
            "pdf_file": None,
            "error": None,
            "created_at": timestamp,
            "updated_at": timestamp,
        }

        run_directory = self._run_directory(run_id)
        run_directory.mkdir(
            parents=True,
            exist_ok=False,
        )

        self._write_json(
            run_directory / "run.json",
            run_data,
        )

        return run_data

    def get_run(self, run_id: str) -> dict[str, Any]:
        run_file = self._run_directory(run_id) / "run.json"

        if not run_file.exists():
            raise RunNotFoundError(
                f"Run '{run_id}' was not found."
            )

        try:
            with _FILE_LOCK:
                return json.loads(
                    run_file.read_text(encoding="utf-8")
                )

        except (OSError, json.JSONDecodeError) as error:
            raise RunStorageError(
                f"Run '{run_id}' could not be read."
            ) from error

    def update_run(
        self,
        run_id: str,
        **changes: Any,
    ) -> dict[str, Any]:
        run_data = self.get_run(run_id)

        run_data.update(changes)
        run_data["updated_at"] = utc_now()

        self._write_json(
            self._run_directory(run_id) / "run.json",
            run_data,
        )

        return run_data

    def save_transcript(
        self,
        run_id: str,
        document: TranscriptDocument,
    ) -> None:
        run_directory = self._run_directory(run_id)
        run_directory.mkdir(
            parents=True,
            exist_ok=True,
        )

        transcript_metadata = {
            "video_id": document.video_id,
            "language": document.language,
            "language_code": document.language_code,
            "is_generated": document.is_generated,
            "segment_count": len(document.segments),
            "character_count": len(document.full_text),
            "thumbnail_url": document.thumbnail_url,
        }

        try:
            with _FILE_LOCK:
                (
                    run_directory / "transcript.txt"
                ).write_text(
                    document.full_text,
                    encoding="utf-8",
                )

                (
                    run_directory / "transcript.md"
                ).write_text(
                    document.markdown,
                    encoding="utf-8",
                )

                (
                    run_directory / "transcript_metadata.json"
                ).write_text(
                    json.dumps(
                        transcript_metadata,
                        indent=2,
                        ensure_ascii=False,
                    ),
                    encoding="utf-8",
                )

        except OSError as error:
            raise RunStorageError(
                f"Transcript files for run '{run_id}' "
                "could not be saved."
            ) from error

    def read_transcript_markdown(
        self,
        run_id: str,
    ) -> str:
        transcript_file = (
            self._run_directory(run_id) / "transcript.md"
        )

        if not transcript_file.exists():
            raise RunStorageError(
                f"Transcript for run '{run_id}' does not exist."
            )

        try:
            return transcript_file.read_text(
                encoding="utf-8"
            )

        except OSError as error:
            raise RunStorageError(
                f"Transcript for run '{run_id}' "
                "could not be read."
            ) from error

    def save_summary(
        self,
        run_id: str,
        summary_markdown: str,
        chunk_summaries: list[str],
    ) -> None:
        run_directory = self._run_directory(run_id)

        chunk_data = [
            {
                "chunk_number": index,
                "summary": summary,
            }
            for index, summary in enumerate(
                chunk_summaries,
                start=1,
            )
        ]

        try:
            with _FILE_LOCK:
                (
                    run_directory / "summary.md"
                ).write_text(
                    summary_markdown,
                    encoding="utf-8",
                )

                (
                    run_directory / "chunk_summaries.json"
                ).write_text(
                    json.dumps(
                        chunk_data,
                        indent=2,
                        ensure_ascii=False,
                    ),
                    encoding="utf-8",
                )

        except OSError as error:
            raise RunStorageError(
                f"Summary files for run '{run_id}' "
                "could not be saved."
            ) from error

    def _run_directory(self, run_id: str) -> Path:
        try:
            validated_id = str(UUID(run_id))

        except ValueError as error:
            raise RunNotFoundError(
                "The run ID is invalid."
            ) from error

        return self._runs_directory / validated_id

    @staticmethod
    def _write_json(
        destination: Path,
        data: dict[str, Any],
    ) -> None:
        temporary_file = destination.with_suffix(".tmp")

        try:
            serialized_data = json.dumps(
                data,
                indent=2,
                ensure_ascii=False,
            )

            with _FILE_LOCK:
                temporary_file.write_text(
                    serialized_data,
                    encoding="utf-8",
                )

                temporary_file.replace(destination)

        except OSError as error:
            raise RunStorageError(
                f"Could not write '{destination.name}'."
            ) from error
        

    def read_summary_markdown(
        self,
        run_id: str,
    ) -> str:
        summary_file = self.get_artifact_path(
            run_id,
            "summary.md",
        )

        if not summary_file.exists():
            raise RunStorageError(
                f"Summary for run '{run_id}' does not exist."
            )

        try:
            return summary_file.read_text(encoding="utf-8")

        except OSError as error:
            raise RunStorageError(
                f"Summary for run '{run_id}' could not be read."
            ) from error

    def get_artifact_path(
        self,
        run_id: str,
        filename: str,
    ) -> Path:
        allowed_filenames = {
            "transcript.txt",
            "transcript.md",
            "summary.md",
            "summary.pdf",
            "run.json",
            "transcript_metadata.json",
            "chunk_summaries.json",
        }

        if filename not in allowed_filenames:
            raise RunStorageError(
                f"Artifact '{filename}' is not allowed."
            )

        return self._run_directory(run_id) / filename        
