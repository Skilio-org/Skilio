# Stage 1: Build Frontend
FROM oven/bun:1 AS frontend-build

WORKDIR /app
COPY package.json bun.lock /app/
COPY frontend/package.json /app/frontend/

WORKDIR /app/frontend
RUN bun install

COPY ./frontend /app/frontend
RUN bun run build


# Stage 2: Production Backend
FROM python:3.14

# Production Python & UV configurations
ENV PYTHONUNBUFFERED=1 \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    PATH="/app/.venv/bin:$PATH"

# Install UV
COPY --from=ghcr.io/astral-sh/uv:0.9.26 /uv /bin/

WORKDIR /app

# Install dependencies
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-install-workspace --package app

# 2. Copy backend source code & compiled frontend from Stage 1
COPY ./backend/scripts /app/backend/scripts
COPY ./backend/pyproject.toml ./backend/alembic.ini /app/backend/
COPY ./backend/app /app/backend/app
COPY --from=frontend-build /app/backend/app/frontend /app/backend/app/frontend

# 3. Install local app package
RUN uv sync --frozen --package app

WORKDIR /app/backend

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4", "--ws-max-size", "1048576", "--proxy-headers"]
