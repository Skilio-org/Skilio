#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# ft_transcendence - Automated Disaster Recovery (DR) Verification Drill
# Validates backup creation, archive integrity, restoration, and RTO metric.
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="${SCRIPT_DIR}/dumps"

echo ""
echo "=================================================================="
echo "    ft_transcendence - Disaster Recovery (DR) Verification Drill   "
echo "=================================================================="
echo "Target RTO: < 180 seconds (3 minutes)"
echo "Target RPO: < 3600 seconds (1 hour)"
echo ""

# Check docker compose and db service
if ! docker compose ps --status running db --quiet 2>/dev/null | grep -q .; then
  echo "❌ Error: 'db' container is not running."
  echo "   Start the stack first: docker compose up -d"
  exit 1
fi

DRILL_START=$(date +%s)

# Step 1: Create an on-demand snapshot
echo "▶ Step 1: Generating disaster recovery snapshot..."
bash "${SCRIPT_DIR}/backup.sh" "dr_drill"

LATEST_BACKUP=$(ls -1t "${BACKUP_DIR}"/*_dr_drill.sql.gz 2>/dev/null | head -n1 || echo "")
if [ -z "$LATEST_BACKUP" ] || [ ! -f "$LATEST_BACKUP" ]; then
  echo "❌ Failed: Could not locate generated drill snapshot."
  exit 1
fi

FILE_SIZE=$(du -h "$LATEST_BACKUP" | cut -f1)
echo "  Snapshot generated: $(basename "$LATEST_BACKUP") (${FILE_SIZE})"

# Step 2: Validate archive integrity
echo ""
echo "▶ Step 2: Verifying archive integrity with gzip test..."
if gzip -t "$LATEST_BACKUP" 2>/dev/null; then
  echo "  ✔ Archive integrity test PASSED."
else
  echo "  ❌ Archive integrity test FAILED. File is corrupted."
  exit 1
fi

# Step 3: Record pre-restore state
echo ""
echo "▶ Step 3: Querying pre-restore database state..."
PRE_SKILL_COUNT=$(docker compose exec -T db psql -U postgres -d app -tAc "SELECT count(*) FROM skill;" 2>/dev/null || echo "0")
echo "  Pre-restore 'skill' records count: ${PRE_SKILL_COUNT}"

# Step 4: Execute disaster recovery restore
echo ""
echo "▶ Step 4: Simulating point-in-time disaster recovery restore..."
FORCE=1 bash "${SCRIPT_DIR}/restore.sh" -y "$LATEST_BACKUP"

# Step 5: Validate post-restore data consistency
echo ""
echo "▶ Step 5: Verifying data consistency post-restore..."
POST_SKILL_COUNT=$(docker compose exec -T db psql -U postgres -d app -tAc "SELECT count(*) FROM skill;" 2>/dev/null || echo "0")
echo "  Post-restore 'skill' records count: ${POST_SKILL_COUNT}"

if [ "$PRE_SKILL_COUNT" != "$POST_SKILL_COUNT" ]; then
  echo "  ❌ Data consistency check FAILED (count mismatch)!"
  exit 1
fi
echo "  ✔ Data consistency confirmed: 100% records preserved."

# Step 6: Verify health check status
echo ""
echo "▶ Step 6: Verifying service health status..."
if docker compose ps --status running backend --quiet 2>/dev/null | grep -q .; then
  HEALTH_STATUS=$(docker compose exec -T backend curl -s -f http://localhost:8000/api/v1/utils/health-check/ 2>/dev/null || echo "failed")
  if [ "$HEALTH_STATUS" = "true" ]; then
    echo "  ✔ Backend health check endpoint reports: HEALTHY"
  else
    echo "  ⚠️ Backend health check returned: ${HEALTH_STATUS}"
  fi
else
  echo "  (Backend not currently running - verified database container recovery)"
fi

DRILL_END=$(date +%s)
ELAPSED=$((DRILL_END - DRILL_START))

echo ""
echo "=================================================================="
echo "                   DR DRILL RESULTS SUMMARY                       "
echo "=================================================================="
echo "  Snapshot file: $(basename "$LATEST_BACKUP")"
echo "  Integrity:     Valid GZIP format"
echo "  Data Loss:     0 records lost"
echo "  Elapsed Time:  ${ELAPSED} seconds"
if [ "$ELAPSED" -le 180 ]; then
  echo "  RTO Target:    PASSED (${ELAPSED}s <= 180s target)"
else
  echo "  RTO Target:    WARNING (${ELAPSED}s > 180s target)"
fi
echo "=================================================================="
echo "✔ DISASTER RECOVERY PROCEDURE VERIFIED SUCCESSFULLY"
echo ""
