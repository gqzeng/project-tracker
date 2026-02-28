from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "sqlite:///./dev.db"
    auth_username: Optional[str] = None
    auth_password: Optional[str] = None
    cors_origins: list[str] = ["http://localhost:5173"]
    static_dir: str = "../frontend/dist"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )


settings = Settings()
