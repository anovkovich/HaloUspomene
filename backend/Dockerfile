FROM python:3.14-slim

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

COPY . /

WORKDIR /app
COPY ./alembic /app/alembic
COPY alembic.ini /app/alembic.ini
RUN uv sync --frozen --no-cache