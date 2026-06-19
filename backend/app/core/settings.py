from functools import lru_cache
from pathlib import Path

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
        populate_by_name=True,
    )

    app_name: str = "TubeIntel AI"
    app_version: str = "1.0.0"
    api_prefix: str = "/api"

    openai_api_key: str = Field(
        default="",
        validation_alias=AliasChoices(
            "OPENAI_API_KEY",
            "openai_api_key",
        ),
    )

    openai_model: str = Field(
        default="gpt-4o-mini",
        validation_alias=AliasChoices(
            "OPENAI_MODEL",
            "openai_model",
        ),
    )

    embedding_model: str = Field(
        default="text-embedding-3-small",
        validation_alias=AliasChoices(
            "EMBEDDING_MODEL",
            "embedding_model",
        ),
    )

    allowed_origins_raw: str = Field(
        default="http://localhost:3000,http://127.0.0.1:3000",
        validation_alias=AliasChoices(
            "ALLOWED_ORIGINS",
            "FRONTEND_ORIGINS",
            "allowed_origins",
        ),
    )

    runs_directory: Path = BASE_DIR / "backend" / "data" / "runs"
    vectors_directory: Path = BASE_DIR / "backend" / "data" / "vectors"

    @property
    def allowed_origins(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.allowed_origins_raw.split(",")
            if origin.strip()
        ]


@lru_cache
def get_settings() -> Settings:
    settings = Settings()

    settings.runs_directory.mkdir(
        parents=True,
        exist_ok=True,
    )

    settings.vectors_directory.mkdir(
        parents=True,
        exist_ok=True,
    )

    return settings
