#!/usr/bin/env bash
set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${CYAN}▶ $1${NC}"; }
ok()   { echo -e "${GREEN}✔ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠ $1${NC}"; }
err()  { echo -e "${RED}✖ $1${NC}"; exit 1; }

export DOCKER_HOST=unix:///Users/selim/.docker/run/docker.sock

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ─── 1. Arrêter proprement les containers existants ───────────────────────────
log "Nettoyage des containers existants..."
docker compose down --remove-orphans >/dev/null 2>&1 || true
if docker ps -a --format '{{.Names}}' 2>/dev/null | grep -q '^escal_mysql$'; then
  warn "Container escal_mysql résiduel — suppression forcée..."
  docker rm -f escal_mysql >/dev/null 2>&1 || true
fi
ok "Containers nettoyés"

# ─── 2. Attendre que le port 3306 soit libéré ────────────────────────────────
log "Vérification du port 3306..."
port_3306_blocker() {
  docker ps --format '{{.Names}}' --filter publish=3306 2>/dev/null | head -1
}

MAX_WAIT=10
COUNT=0
while lsof -ti :3306 >/dev/null 2>&1; do
  COUNT=$((COUNT + 1))
  if [ $COUNT -ge $MAX_WAIT ]; then
    BLOCKER=$(port_3306_blocker)
    if [ -n "$BLOCKER" ] && [ "$BLOCKER" != "escal_mysql" ]; then
      err "Port 3306 occupé par le container « $BLOCKER » (autre projet Docker).
  → Arrêter ce container : docker stop $BLOCKER
  → Puis relancer : ./start-escal.sh"
    fi
    err "Port 3306 toujours occupé après ${MAX_WAIT}s — vérifiez : lsof -i :3306"
  fi
  warn "Port 3306 encore occupé, attente... ($COUNT/${MAX_WAIT})"
  sleep 1
done
ok "Port 3306 disponible"

# ─── 3. Lancer MySQL via Docker Compose (attend le healthcheck) ───────────────
log "Démarrage de MySQL (Docker)..."
if docker compose up -d --wait 2>/dev/null; then
  ok "MySQL prêt"
else
  docker compose up -d
  log "Attente de MySQL..."
  MAX=30
  COUNT=0
  until [ "$(docker inspect --format='{{.State.Health.Status}}' escal_mysql 2>/dev/null)" = "healthy" ]; do
    COUNT=$((COUNT + 1))
    if [ $COUNT -ge $MAX ]; then
      err "MySQL n'a pas démarré après ${MAX}s — vérifiez : docker logs escal_mysql"
    fi
    printf '.'
    sleep 1
  done
  echo ""
  ok "MySQL prêt"
fi

# ─── 4b. Appliquer le schéma SQL (idempotent — IF NOT EXISTS) ────────────────
log "Application du schéma SQL..."
SCHEMA_ERR=$(mktemp)
if docker exec -i escal_mysql mysql -uescal -pescal_dev escal_concept \
    < "$SCRIPT_DIR/admin-escal/schema.sql" 2>"$SCHEMA_ERR"; then
  ok "Schéma appliqué"
else
  cat "$SCHEMA_ERR" >&2
  rm -f "$SCHEMA_ERR"
  err "Échec de l'application du schéma — vérifiez : docker logs escal_mysql"
fi
rm -f "$SCHEMA_ERR"

# ─── 5. Lancer admin-escal (port 3001) ────────────────────────────────────────
log "Démarrage admin-escal (port 3001)..."
PIDS_3001=$(lsof -ti :3001 2>/dev/null || true)
[ -n "$PIDS_3001" ] && echo "$PIDS_3001" | xargs kill -9 2>/dev/null || true

cd "$SCRIPT_DIR/admin-escal"
PORT=3001 npm run dev > "$SCRIPT_DIR/logs/admin-escal.log" 2>&1 &
ADMIN_PID=$!
echo $ADMIN_PID > "$SCRIPT_DIR/logs/admin-escal.pid"
ok "admin-escal lancé (PID $ADMIN_PID) → http://localhost:3001"

# ─── 6. Lancer modul-escal (port 3000) ────────────────────────────────────────
log "Démarrage modul-escal (port 3000)..."
PIDS_3000=$(lsof -ti :3000 2>/dev/null || true)
[ -n "$PIDS_3000" ] && echo "$PIDS_3000" | xargs kill -9 2>/dev/null || true

cd "$SCRIPT_DIR/modul-escal"
PORT=3000 npm run dev > "$SCRIPT_DIR/logs/modul-escal.log" 2>&1 &
MODUL_PID=$!
echo $MODUL_PID > "$SCRIPT_DIR/logs/modul-escal.pid"
ok "modul-escal lancé (PID $MODUL_PID) → http://localhost:3000"

# ─── 7. Résumé ────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  ✔ Escal Concept — tout est lancé !${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  Configurateur  →  ${CYAN}http://localhost:3000${NC}"
echo -e "  Dashboard      →  ${CYAN}http://localhost:3001${NC}"
echo -e "  MySQL          →  ${CYAN}localhost:3306${NC}  (escal / escal_dev)"
echo ""
echo -e "  Logs  →  ${SCRIPT_DIR}/logs/"
echo -e "  Stop  →  ${YELLOW}./stop-escal.sh${NC}"
echo ""

# Garder le script actif pour voir les logs en live (Ctrl+C pour quitter)
trap 'echo -e "\n${YELLOW}Interruption reçue. Les serveurs continuent en arrière-plan.${NC}\nPour tout arrêter : ./stop-escal.sh"; exit 0' INT

tail -f "$SCRIPT_DIR/logs/admin-escal.log" "$SCRIPT_DIR/logs/modul-escal.log"
