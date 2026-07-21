#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="${APP_DIR:-/home/deploy/apps/naminiel-art}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
ENV_FILE="${ENV_FILE:-laravel/.env.production}"
APP_CONTAINER="${APP_CONTAINER:-naminiel-art}"
APP_URL="${APP_URL:-http://naminiel-art.217.160.191.251.sslip.io}"
LOG_DIR="${LOG_DIR:-/home/deploy/jobs/naminiel-art/logs}"
TIMEZONE="${TIMEZONE:-Europe/Rome}"

mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/deploy-$(TZ="$TIMEZONE" date +%Y%m%d-%H%M%S).log"

exec > >(tee -a "$LOG_FILE") 2>&1

log() {
    printf '[%s] %s\n' "$(TZ="$TIMEZONE" date '+%Y-%m-%d %H:%M:%S %Z')" "$*"
}

require_file() {
    if [ ! -f "$1" ]; then
        log "Missing required file: $1"
        exit 1
    fi
}

log "Starting production deploy"
cd "$APP_DIR"

require_file "$COMPOSE_FILE"
require_file "$ENV_FILE"

log "Updating git source"
git fetch origin main
git checkout main
git pull --ff-only origin main

SOURCE_COMMIT="$(git rev-parse HEAD)"
BUILD_DATE="$(TZ="$TIMEZONE" date '+%Y-%m-%dT%H:%M:%S%z')"
TODAY="$(TZ="$TIMEZONE" date '+%Y-%m-%d')"

export SOURCE_COMMIT BUILD_DATE

log "Building image for commit ${SOURCE_COMMIT}"
sudo --preserve-env=SOURCE_COMMIT,BUILD_DATE docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" build app

log "Restarting container"
sudo --preserve-env=SOURCE_COMMIT,BUILD_DATE docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d app

log "Verifying container is running"
sudo docker ps --filter "name=${APP_CONTAINER}" --filter "status=running" --format '{{.Names}}' | grep -qx "$APP_CONTAINER"

RUNNING_COMMIT="$(sudo docker exec "$APP_CONTAINER" printenv SOURCE_COMMIT)"
RUNNING_BUILD_DATE="$(sudo docker exec "$APP_CONTAINER" printenv BUILD_DATE)"

if [ "$RUNNING_COMMIT" != "$SOURCE_COMMIT" ]; then
    log "Commit mismatch: container=${RUNNING_COMMIT} source=${SOURCE_COMMIT}"
    exit 1
fi

case "$RUNNING_BUILD_DATE" in
    "$TODAY"*) ;;
    *)
        log "Build date mismatch: container=${RUNNING_BUILD_DATE} expected_prefix=${TODAY}"
        exit 1
        ;;
esac

log "Running Laravel health checks"
sudo docker exec "$APP_CONTAINER" php artisan migrate:status --no-interaction >/dev/null

log "Checking HTTP response"
curl -fsSIL --max-time 20 "$APP_URL" >/dev/null
curl -fsSL --max-time 20 "$APP_URL/build-info.json" | grep -F "\"source_commit\":\"$SOURCE_COMMIT\"" >/dev/null
curl -fsSL --max-time 20 "$APP_URL/build-info.json" | grep -F "\"build_date\":\"$TODAY" >/dev/null

log "Deploy completed: commit=${SOURCE_COMMIT} build_date=${RUNNING_BUILD_DATE} url=${APP_URL}"
