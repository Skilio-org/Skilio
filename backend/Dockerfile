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

# Install UV binary from official image
COPY --from=ghcr.io/astral-sh/uv:0.9.26 /uv /uvx /bin/

WORKDIR /app

# 1. Cache third-party Python dependencies (Layer Caching)
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --frozen --no-install-workspace --package app

# 2. Copy backend source code & compiled frontend from Stage 1
COPY ./backend/scripts /app/backend/scripts
COPY ./backend/pyproject.toml ./backend/alembic.ini /app/backend/
COPY ./backend/app /app/backend/app
COPY --from=frontend-build /app/backend/app/frontend /app/backend/app/frontend

# 3. Install local app package
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --frozen --package app

WORKDIR /app/backend

CMD ["fastapi", "run", "--workers", "4"]
