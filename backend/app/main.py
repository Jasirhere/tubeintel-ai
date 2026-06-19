from fastapi import FastAPI, Response
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
        allow_origins=[
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ],
        allow_credentials=True,
        allow_methods=[
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS",
        ],
        allow_headers=["*"],
    )

    @application.options("/{full_path:path}")
    def options_handler(full_path: str) -> Response:
        return Response(status_code=204)

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