#!/usr/bin/env bash
#
# Validación de integración del backend contra PostgreSQL 17 desechable.
#
#   ./scripts/integration-test.sh
#
# Levanta una base efímera en una red propia, aplica todas las migraciones
# desde cero, crea el primer OWNER con el CLI real y ejecuta las pruebas de
# integración. Todo se destruye al terminar, falle o no.
#
# No toca producción: usa nombres, red, credenciales y base distintos, no
# publica ningún puerto y no monta ningún volumen persistente.

set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$REPO_DIR/backend"

# ---------------------------------------------------------------------------
# Defensas: nunca ejecutar esto sobre el despliegue de producción.
# ---------------------------------------------------------------------------

case "$REPO_DIR" in
  /opt/*)
    echo "ABORTADO: no se ejecuta desde /opt (producción)." >&2
    exit 1
    ;;
esac

if [ ! -f "$BACKEND_DIR/package.json" ]; then
  echo "ABORTADO: no encuentro $BACKEND_DIR/package.json" >&2
  exit 1
fi

# ---------------------------------------------------------------------------
# Recursos efímeros. El sufijo evita colisiones con cualquier cosa existente.
# ---------------------------------------------------------------------------

SUFFIX="$$-$(date +%s)"

NETWORK="tallerecu-itest-net-$SUFFIX"
PG_CONTAINER="tallerecu-itest-pg-$SUFFIX"
RUNNER_CONTAINER="tallerecu-itest-runner-$SUFFIX"

PG_DB="tallerecu_itest"
PG_USER="itest_user"
PG_PASSWORD="itest-throwaway-$SUFFIX"

# Credenciales de un solo uso; no se guardan en ningún archivo.
OWNER_EMAIL="owner@itest.local"
OWNER_NAME="Owner de integración"
OWNER_PASSWORD="itest-$(head -c 18 /dev/urandom | base64 | tr -dc 'A-Za-z0-9')"

INTERNAL_API_KEY="itest-internal-api-key-$SUFFIX"

for name in "$NETWORK" "$PG_CONTAINER" "$RUNNER_CONTAINER"; do
  case "$name" in
    taller-network|taller-postgres|taller-backend|taller-n8n)
      echo "ABORTADO: nombre reservado de producción: $name" >&2
      exit 1
      ;;
  esac
done

if docker ps -a --format '{{.Names}}' | grep -qx "$PG_CONTAINER"; then
  echo "ABORTADO: ya existe un contenedor llamado $PG_CONTAINER" >&2
  exit 1
fi

# ---------------------------------------------------------------------------
# Limpieza incondicional.
# ---------------------------------------------------------------------------

cleanup() {
  local status=$?

  echo
  echo "--- limpieza ---"

  # dist queda con propietario root al compilar dentro del contenedor.
  docker run --rm \
    -v "$BACKEND_DIR":/app \
    node:24-alpine sh -c 'rm -rf /app/dist' >/dev/null 2>&1 || true

  docker rm -fv "$RUNNER_CONTAINER" >/dev/null 2>&1 || true
  docker rm -fv "$PG_CONTAINER" >/dev/null 2>&1 || true
  docker network rm "$NETWORK" >/dev/null 2>&1 || true

  echo "contenedores y red efímeros eliminados"

  exit "$status"
}

trap cleanup EXIT INT TERM

# ---------------------------------------------------------------------------
# 1. PostgreSQL 17 limpio, sin puertos publicados y sin volumen persistente.
# ---------------------------------------------------------------------------

echo "=== 1. Levantando PostgreSQL 17 desechable ==="

docker network create "$NETWORK" >/dev/null

docker run -d \
  --name "$PG_CONTAINER" \
  --network "$NETWORK" \
  -e POSTGRES_DB="$PG_DB" \
  -e POSTGRES_USER="$PG_USER" \
  -e POSTGRES_PASSWORD="$PG_PASSWORD" \
  --mount type=tmpfs,destination=/var/lib/postgresql/data \
  postgres:17-alpine >/dev/null

echo "contenedor: $PG_CONTAINER (sin puertos publicados, datos en tmpfs)"

# ---------------------------------------------------------------------------
# 2. Esperar a que acepte conexiones.
# ---------------------------------------------------------------------------

echo
echo "=== 2. Esperando a que PostgreSQL esté disponible ==="

for _ in $(seq 1 60); do
  if docker exec "$PG_CONTAINER" \
      pg_isready -U "$PG_USER" -d "$PG_DB" >/dev/null 2>&1; then
    echo "PostgreSQL disponible"
    break
  fi

  sleep 1
done

if ! docker exec "$PG_CONTAINER" \
    pg_isready -U "$PG_USER" -d "$PG_DB" >/dev/null 2>&1; then
  echo "ABORTADO: PostgreSQL no llegó a estar disponible" >&2
  docker logs "$PG_CONTAINER" | tail -30 >&2
  exit 1
fi

# ---------------------------------------------------------------------------
# 3-6. Migraciones, OWNER y pruebas, dentro de un runner desechable.
# ---------------------------------------------------------------------------

DATABASE_URL="postgresql://$PG_USER:$PG_PASSWORD@$PG_CONTAINER:5432/$PG_DB"

docker run --rm \
  --name "$RUNNER_CONTAINER" \
  --network "$NETWORK" \
  -e HOME=/tmp \
  -e npm_config_cache=/tmp/.npm \
  -e CI=true \
  -e NODE_ENV=test \
  -e DB_HOST="$PG_CONTAINER" \
  -e DB_PORT=5432 \
  -e DB_NAME="$PG_DB" \
  -e DB_USER="$PG_USER" \
  -e DB_PASSWORD="$PG_PASSWORD" \
  -e DATABASE_URL="$DATABASE_URL" \
  -e INTERNAL_API_KEY="$INTERNAL_API_KEY" \
  -e ITEST_OWNER_EMAIL="$OWNER_EMAIL" \
  -e ITEST_OWNER_NAME="$OWNER_NAME" \
  -e ITEST_OWNER_PASSWORD="$OWNER_PASSWORD" \
  -v "$BACKEND_DIR":/app \
  -v /app/node_modules \
  -w /app \
  node:24-alpine sh -c '
set -e

echo
echo "=== 3. Instalando dependencias y compilando ==="
npm ci --no-audit --no-fund >/dev/null
npm run build >/dev/null
echo "npm ci y npm run build completados"

echo
echo "=== 4. Aplicando todas las migraciones desde una base vacía ==="
npm run migrate:up

echo
echo "=== 5. Creando el primer OWNER con el CLI real ==="
printf "%s\n%s\n%s\n%s\n" \
  "$ITEST_OWNER_EMAIL" \
  "$ITEST_OWNER_NAME" \
  "$ITEST_OWNER_PASSWORD" \
  "$ITEST_OWNER_PASSWORD" \
  | node dist/scripts/create-owner.js

echo
echo "=== 6. Pruebas de integración contra PostgreSQL real ==="
npm run test:integration
'

echo
echo "=== Integración completada correctamente ==="
