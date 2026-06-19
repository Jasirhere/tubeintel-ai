from fastapi import (
    APIRouter,
    HTTPException,
    status,
)

from backend.app.core.errors import (
    ChatGenerationError,
    RunNotFoundError,
    RunStorageError,
    VectorIndexError,
)
from backend.app.models.chat import (
    ChatRequest,
    ChatResponse,
)
from backend.app.services.chat_service import ChatService
from backend.app.storage.run_repository import RunRepository


router = APIRouter(
    prefix="/runs",
    tags=["Chat"],
)


@router.post(
    "/{run_id}/chat",
    response_model=ChatResponse,
)
def ask_about_run(
    run_id: str,
    payload: ChatRequest,
) -> ChatResponse:
    repository = RunRepository()

    try:
        run_data = repository.get_run(run_id)

        if run_data["status"] != "completed":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "The run must be completed before chat is available."
                ),
            )

        return ChatService().answer_question(
            run_id=run_id,
            question=payload.question,
        )

    except HTTPException:
        raise

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

    except VectorIndexError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error

    except ChatGenerationError as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(error),
        ) from error
