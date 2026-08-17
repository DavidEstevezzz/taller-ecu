#!/bin/bash
set -euo pipefail
umask 077

PROJECT_DIR="/opt/taller-ecu"
BACKUP_DIR="$PROJECT_DIR/backups/postgres"

cd "$PROJECT_DIR"

set -a
source "$PROJECT_DIR/.env"
set +a

DATE="$(date +'%Y-%m-%d_%H-%M-%S')"

BUSINESS_FILE="$BACKUP_DIR/taller_ecu_$DATE.sql.gz"
N8N_FILE="$BACKUP_DIR/n8n_$DATE.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "Creando backup de taller_ecu..."

docker compose exec -T postgres \
  pg_dump \
  -U "$POSTGRES_USER" \
  -d "$POSTGRES_DB" \
  --no-owner \
  --no-acl \
  | gzip > "$BUSINESS_FILE"

echo "Creando backup de n8n..."

docker compose exec -T postgres \
  pg_dump \
  -U "$N8N_DB_USER" \
  -d "$N8N_DB_NAME" \
  --no-owner \
  --no-acl \
  | gzip > "$N8N_FILE"

gzip -t "$BUSINESS_FILE"
gzip -t "$N8N_FILE"

find "$BACKUP_DIR" \
  -type f \
  \( -name 'taller_ecu_*.sql.gz' -o -name 'n8n_*.sql.gz' \) \
  -mtime +14 \
  -delete

echo "Backup taller_ecu: $BUSINESS_FILE"
echo "Backup n8n:       $N8N_FILE"
