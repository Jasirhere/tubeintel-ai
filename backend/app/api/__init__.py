from fastapi import APIRouter

from backend.app.api.routes.artifacts import (
    router as artifacts_router,
)
from backend.app.api.routes.chat import (
    router as chat_router,
)
from backend.app.api.routes.runs import (
    router as runs_router,
)
from backend.app.api.routes.system import (
    router as system_router,
)
from backend.app.api.routes.transcripts import (
    router as transcripts_router,
)


api_router = APIRouter()

api_router.include_router(system_router)
api_router.include_router(transcripts_router)
api_router.include_router(runs_router)
api_router.include_router(artifacts_router)
api_router.include_router(chat_router)
