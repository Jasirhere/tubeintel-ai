from datetime import datetime, timezone

from fastapi import APIRouter

from backend.app.core.settings import get_settings


router = APIRouter(tags=["System"])


@router.get("/health")
def health_check() -> dict[str, str]:
    settings = get_settings()

    return {
        "status": "ok",
        "service": settings.app_name,
        "version": settings.app_version,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
