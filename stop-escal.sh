#!/usr/bin/env bash

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${YELLOW}Arrêt de Escal Concept...${NC}"

# Arrêt admin-escal
if [ -f "$SCRIPT_DIR/logs/admin-escal.pid" ]; then
  PID=$(cat "$SCRIPT_DIR/logs/admin-escal.pid")
  kill "$PID" 2>/dev/null && echo -e "${GREEN}✔ admin-escal arrêté (PID $PID)${NC}" || true
  rm -f "$SCRIPT_DIR/logs/admin-escal.pid"
fi

# Arrêt modul-escal
if [ -f "$SCRIPT_DIR/logs/modul-escal.pid" ]; then
  PID=$(cat "$SCRIPT_DIR/logs/modul-escal.pid")
  kill "$PID" 2>/dev/null && echo -e "${GREEN}✔ modul-escal arrêté (PID $PID)${NC}" || true
  rm -f "$SCRIPT_DIR/logs/modul-escal.pid"
fi

# Sécurité : tuer tout ce qui reste sur 3000/3001
lsof -ti :3000 2>/dev/null | xargs kill -9 2>/dev/null || true
lsof -ti :3001 2>/dev/null | xargs kill -9 2>/dev/null || true

# Arrêt Docker MySQL
cd "$SCRIPT_DIR"
docker compose stop 2>/dev/null && echo -e "${GREEN}✔ MySQL (Docker) arrêté${NC}" || true

echo -e "${CYAN}Tout est arrêté.${NC}"
