# Purpose: App config
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Locofinder API"
    VERSION: str = "0.1.0"
    REDIS_URL: str = "redis://localhost:6379"
    
    # Optional fields for market research
    GOOGLE_MAPS_API_KEY: Optional[str] = None
    CENSUS_API_KEY: Optional[str] = None
    DATABASE_URL: Optional[str] = None
    ENVIRONMENT: Optional[str] = None
    LOG_LEVEL: Optional[str] = None
    PLACES_API_TIMEOUT: Optional[int] = None
    PLACES_API_MAX_RESULTS: Optional[int] = None
    CENSUS_API_TIMEOUT: Optional[int] = None
    CENSUS_API_YEAR: Optional[int] = None
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"  # THIS IS THE KEY LINE - allows extra env vars
    )

settings = Settings()# Purpose: App config
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Locofinder API"
    VERSION: str = "0.1.0"
    REDIS_URL: str = "redis://localhost:6379"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True
    )

settings = Settings()
