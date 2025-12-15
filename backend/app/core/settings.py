from typing import List

from pydantic import AnyHttpUrl
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []
    openapi_prefix: str = ""


    model_config = SettingsConfigDict(env_file=".env")

app_settings = Settings()
