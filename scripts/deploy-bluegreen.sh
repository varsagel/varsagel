#!/usr/bin/env bash
set -euo pipefail

APP_NAME="varsagel"
BASE_DIR="/var/www"
BLUE_DIR="${BASE_DIR}/${APP_NAME}-blue"
GREEN_DIR="${BASE_DIR}/${APP_NAME}-green"
UPSTREAM_INC="/etc/nginx/conf.d/varsagel-upstream.inc"
ECOSYSTEM_FILE="${BASE_DIR}/${APP_NAME}-blue/ecosystem.bluegreen.config.js"

PORT_BLUE="3004"
PORT_GREEN="3005"

ACTIVE=""
if [[ -f "${UPSTREAM_INC}" ]]; then
  if grep -q "${PORT_BLUE}" "${UPSTREAM_INC}"; then ACTIVE="blue"; fi
  if grep -q "${PORT_GREEN}" "${UPSTREAM_INC}"; then ACTIVE="green"; fi
fi

if [[ "${ACTIVE}" == "blue" ]]; then
  TARGET="green"
  TARGET_DIR="${GREEN_DIR}"
  TARGET_PORT="${PORT_GREEN}"
elif [[ "${ACTIVE}" == "green" ]]; then
  TARGET="blue"
  TARGET_DIR="${BLUE_DIR}"
  TARGET_PORT="${PORT_BLUE}"
else
  TARGET="green"
  TARGET_DIR="${GREEN_DIR}"
  TARGET_PORT="${PORT_GREEN}"
fi

echo "Active: ${ACTIVE:-unknown}. Deploying to: ${TARGET} (${TARGET_DIR} -> ${TARGET_PORT})"

cd "${TARGET_DIR}"
git pull --rebase
npm ci
npm run build

if [[ -f "${TARGET_DIR}/ecosystem.bluegreen.config.js" ]]; then
  pm2 start "${TARGET_DIR}/ecosystem.bluegreen.config.js" --only "${APP_NAME}-${TARGET}" --update-env || \
    pm2 restart "${APP_NAME}-${TARGET}" --update-env
elif [[ -f "${ECOSYSTEM_FILE}" ]]; then
  pm2 start "${ECOSYSTEM_FILE}" --only "${APP_NAME}-${TARGET}" --update-env || \
    pm2 restart "${APP_NAME}-${TARGET}" --update-env
else
  pm2 start "${TARGET_DIR}/server.js" --name "${APP_NAME}-${TARGET}" --cwd "${TARGET_DIR}" --time --update-env || \
    pm2 restart "${APP_NAME}-${TARGET}" --update-env
fi

for i in {1..30}; do
  if curl -fsS "http://127.0.0.1:${TARGET_PORT}/api/health" >/dev/null; then
    echo "Health OK on ${TARGET_PORT}"
    break
  fi
  sleep 1
done

echo "server 127.0.0.1:${TARGET_PORT};" | sudo tee "${UPSTREAM_INC}" >/dev/null
sudo nginx -t
sudo systemctl reload nginx

echo "Switched upstream to ${TARGET} (${TARGET_PORT})"
echo "Keep old app running for a few minutes to avoid chunk/cache issues, then stop it:"
echo "  pm2 stop ${APP_NAME}-${ACTIVE:-blue}"
