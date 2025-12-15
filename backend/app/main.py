from contextlib import asynccontextmanager

import uvicorn
import logging
from alembic import command
from alembic.config import Config
from fastapi import FastAPI
from api.routes.router import router as api_router
from core.settings import app_settings

log = logging.getLogger(__name__)


def run_migrations():
    alembic_cfg = Config("alembic.ini")
    command.upgrade(alembic_cfg, "head")


@asynccontextmanager
async def lifespan(app_: FastAPI):
    log.info("Starting up...")
    log.info("run alembic upgrade head...")
    run_migrations()
    print("s")
    yield


app = FastAPI(title="async-fastapi-sqlalchemy")
app.include_router(api_router, prefix=app_settings.openapi_prefix)
# uvicorn.run(app, host="0.0.0.0", port=8000)