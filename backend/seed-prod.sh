#!/bin/bash
# ============================================================
# RECOVERY.UZ — Заполнение справочников на боевом сервере
#
# Запуск С ЛОКАЛЬНОЙ МАШИНЫ (через VPN):
#   sudo wg-quick up wg0
#   bash backend/seed-prod.sh
#
# Или прямо НА СЕРВЕРЕ:
#   cd /home/yoyo/RECOVERY_UZ
#   sudo docker exec -i recovery_postgres \
#     psql -U hdd_fixer -d hdd_fixer_db < backend/seed-catalogs-prod.sql
# ============================================================

set -e

SERVER="172.16.252.32"
SSH_PASS="01200120"
SSH_USER="yoyo"
REMOTE_DIR="/home/yoyo/RECOVERY_UZ"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SQL_FILE="$SCRIPT_DIR/seed-catalogs-prod.sql"

if [ ! -f "$SQL_FILE" ]; then
  echo "❌ Не найден файл: $SQL_FILE"
  exit 1
fi

echo "🔍 Проверяю VPN-соединение..."
if ! ping -c 1 -W 2 "$SERVER" &>/dev/null; then
  echo "⚠️  Сервер $SERVER недоступен. Поднимаю WireGuard..."
  sudo wg-quick up wg0 2>/dev/null || true
  sleep 2
  if ! ping -c 1 -W 2 "$SERVER" &>/dev/null; then
    echo "❌ Не удалось подключиться к серверу $SERVER"
    echo "   Попробуйте вручную: sudo wg-quick up wg0"
    exit 1
  fi
fi
echo "✅ VPN подключён"

echo ""
echo "📤 Копирую SQL-скрипт на сервер..."
sshpass -p "$SSH_PASS" scp "$SQL_FILE" "$SSH_USER@$SERVER:$REMOTE_DIR/backend/"

echo "🗄  Выполняю SQL на production БД..."
sshpass -p "$SSH_PASS" ssh "$SSH_USER@$SERVER" \
  "cd $REMOTE_DIR && sudo docker exec -i recovery_postgres psql -U hdd_fixer -d hdd_fixer_db < backend/seed-catalogs-prod.sql"

echo ""
echo "✅ Справочники успешно заполнены!"
echo ""
echo "🔗 Проверьте: https://hddfix.uz"
echo "   → Создать заявку → должны появиться типы оборудования и неисправностей"
