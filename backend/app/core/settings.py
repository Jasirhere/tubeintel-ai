from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


PROJECT_ROOT = Path(__file__).resolve().parents[3]


class AppSettings(BaseSettings):
    app_name: str = "TubeIntel Analysis API"
    app_version: str = "2.0.0"
    api_prefix: str = "/api"

    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    embedding_model: str = "text-embedding-3-small"

    frontend_origins: str = (
        "http://localhost:3000,"
        "http://127.0.0.1:3000"
    )

    model_config = SettingsConfigDict(
        env_file=PROJECT_ROOT / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def allowed_origins(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.frontend_origins.split(",")
            if origin.strip()
        ]

    @property
    def data_directory(self) -> Path:
        return PROJECT_ROOT / "backend" / "data"

    @property
    def runs_directory(self) -> Path:
        return self.data_directory / "runs"

    @property
    def vectors_directory(self) -> Path:
        return self.data_directory / "vectors"

    def create_data_directories(self) -> None:
        self.runs_directory.mkdir(parents=True, exist_ok=True)
        self.vectors_directory.mkdir(parents=True, exist_ok=True)


@lru_cache
def get_settings() -> AppSettings:
    settings = AppSettings()
    settings.create_data_directories()
    return settings
