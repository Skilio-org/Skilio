#!/bin/bash
uv sync
uv run bash scripts/prestart.sh
# uv run fastapi dev
uv run uvicorn app.main:app --reload --ws-max-size 1048576
