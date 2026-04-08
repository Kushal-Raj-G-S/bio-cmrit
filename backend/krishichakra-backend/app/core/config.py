from __future__ import annotations

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    env: str = "dev"
    api_prefix: str = "/api"
    openai_base_url: str | None = None
    nvidia_api_key: str | None = None
    vector_db_url: str | None = None
    qdrant_url: str | None = None
    log_level: str = "INFO"
    api_key: str | None = Field(default=None, description="Optional API key for internal auth checks")


settings = Settings()
