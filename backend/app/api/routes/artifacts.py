from pathlib import Path

from fastapi import (
    APIRouter,
    HTTPException,
    status,
)
from fastapi.responses import FileResponse

from backend.app.core.errors import (
    RunNotFoundError,
    RunStorageError,
)
from backend.app.storage.run_repository import (
    RunRepository,
)


router = APIRouter(
    prefix="/runs",
    tags=["Artifacts"],
)


def find_artifact(
    run_id: str,
    filename: str,
) -> Path:
    repository = RunRepository()

    try:
        artifact = repository.get_artifact_path(
            run_id,
            filename,
        )

    except RunNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error

    except RunStorageError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error

    if not artifact.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                "The requested artifact has not been "
                "generated for this run."
            ),
        )

    return artifact


@router.get("/{run_id}/transcript")
def download_transcript(
    run_id: str,
) -> FileResponse:
    artifact = find_artifact(
        run_id,
        "transcript.md",
    )

    return FileResponse(
        path=artifact,
        media_type="text/markdown",
        filename=f"tubeintel-{run_id}-transcript.md",
    )


@router.get("/{run_id}/summary")
def download_summary(
    run_id: str,
) -> FileResponse:
    artifact = find_artifact(
        run_id,
        "summary.md",
    )

    return FileResponse(
        path=artifact,
        media_type="text/markdown",
        filename=f"tubeintel-{run_id}-summary.md",
    )


@router.get("/{run_id}/pdf")
def download_pdf(
    run_id: str,
) -> FileResponse:
    artifact = find_artifact(
        run_id,
        "summary.pdf",
    )

    return FileResponse(
        path=artifact,
        media_type="application/pdf",
        filename=f"tubeintel-{run_id}-report.pdf",
    )
