from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.api.router import api_router
from backend.app.core.settings import get_settings


def create_application() -> FastAPI:
    settings = get_settings()

    application = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description=(
            "API for extracting YouTube transcripts, generating reports "
            "and answering questions about video content."
        ),
    )

    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    application.include_router(
        api_router,
        prefix=settings.api_prefix,
    )

    @application.get("/", tags=["System"])
    def root() -> dict[str, str]:
        return {
            "message": f"{settings.app_name} is running",
            "documentation": "/docs",
        }

    return application


app = create_application()
