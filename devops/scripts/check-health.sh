#!/usr/bin/env bash
set -euo pipefail

URL="${1:-http://localhost:8000/api/v1/health}"
MAX_RETRIES="${2:-5}"
RETRY_INTERVAL="${3:-2}"

echo "==> Probing system health endpoint: $URL"
echo "==> Max retries: $MAX_RETRIES | Interval: ${RETRY_INTERVAL}s"

response=""

for ((i=1; i<=MAX_RETRIES; i++)); do
  # Probe diagnostic endpoint and verify top-level .status == "healthy" via jq
  if response=$(curl -fsSL "$URL" 2>/dev/null) && echo "$response" | jq -e '.status == "healthy"' >/dev/null 2>&1; then
    echo "==> [SUCCESS] Health check passed on attempt $i/$MAX_RETRIES!"
    echo "==> Diagnostic payload:"
    echo "$response" | jq .
    exit 0
  fi

  if [ "$i" -lt "$MAX_RETRIES" ]; then
    echo "==> [WAIT] Endpoint not ready or degraded (attempt $i/$MAX_RETRIES). Retrying in ${RETRY_INTERVAL}s..."
    sleep "$RETRY_INTERVAL"
  fi
done

echo "==> [ERROR] Health check failed after $MAX_RETRIES attempts against $URL!"
if [ -n "$response" ]; then
  echo "==> Last received response:"
  echo "$response" | jq . 2>/dev/null || echo "$response"
fi
exit 1
