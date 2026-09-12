#!/bin/bash
uv sync
uv run bash scripts/prestart.sh
uv run fastapi dev
