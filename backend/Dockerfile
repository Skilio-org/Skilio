# Stage 1: Build Frontend
FROM oven/bun:1 AS frontend-build

WORKDIR /app
COPY package.json bun.lock ./
COPY frontend/package.json ./frontend/
RUN bun install

COPY frontend/ ./frontend/
RUN bun run build


# Stage 2: Production Backend
FROM python:3.14

WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PATH="/app/.venv/bin:$PATH"

# Install UV
COPY --from=ghcr.io/astral-sh/uv:0.9.26 /uv /bin/

# Copy project files & install dependencies
COPY pyproject.toml uv.lock ./
COPY backend/ ./backend/
COPY --from=frontend-build /app/backend/app/frontend ./backend/app/frontend

RUN uv sync

WORKDIR /app/backend

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4", "--ws-max-size", "1048576", "--proxy-headers"]
