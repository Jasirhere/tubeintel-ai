from fastapi import (
    APIRouter,
    BackgroundTasks,
    HTTPException,
    status,
)

from backend.app.core.errors import (
    RunNotFoundError,
    RunStorageError,
)
from backend.app.models.run import (
    CreateRunRequest,
    CreateRunResponse,
    RunStatusResponse,
)
from backend.app.services.workflow_service import (
    process_analysis_run,
)
from backend.app.storage.run_repository import (
    RunRepository,
)


router = APIRouter(
    prefix="/runs",
    tags=["Runs"],
)


@router.post(
    "",
    response_model=CreateRunResponse,
    status_code=status.HTTP_202_ACCEPTED,
)
def create_run(
    payload: CreateRunRequest,
    background_tasks: BackgroundTasks,
) -> CreateRunResponse:
    repository = RunRepository()

    try:
        run_data = repository.create_run(
            youtube_url=payload.youtube_url,
            preferred_languages=payload.preferred_languages,
            summary_style=payload.summary_style,
            optional_notes=payload.optional_notes,
        )

    except RunStorageError as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(error),
        ) from error

    background_tasks.add_task(
        process_analysis_run,
        run_data["run_id"],
        payload.youtube_url,
        payload.preferred_languages,
        payload.summary_style,
        payload.optional_notes,
    )

    return CreateRunResponse(
        run_id=run_data["run_id"],
        status=run_data["status"],
        progress=run_data["progress"],
        message=run_data["message"],
        status_url=f"/api/runs/{run_data['run_id']}",
    )


@router.get(
    "/{run_id}",
    response_model=RunStatusResponse,
)
def get_run_status(
    run_id: str,
) -> RunStatusResponse:
    repository = RunRepository()

    try:
        run_data = repository.get_run(run_id)

    except RunNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error

    except RunStorageError as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(error),
        ) from error

    return RunStatusResponse.model_validate(run_data)
