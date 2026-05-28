# RECOVERY.UZ — Handoff для новой сессии

> Дата: 28 мая 2026. Всё задеплоено и работает.

---

## 1. Что это

CRM-система сервисного центра по восстановлению данных (HDD/SSD/Flash).
Роли: admin, operator, master, client + гостевой доступ (заявка без регистрации).

**Сайт:** https://hddfix.uz/
**Репозиторий:** https://github.com/SNurali/RECOVERY_UZ
**Локальный путь:** `/home/mrnurali/RECOVERY_UZ`

---

## 2. Архитектура (простая)

Один процесс `server.js` на порту **3003** — раздаёт и фронт (dist/) и API (/v1/*).

```
[Браузер] → https://hddfix.uz/ → [Главный nginx наставника на 195.158.24.137]
    → http://172.16.252.32:3003 → [server.js = Express + PostgreSQL + статика]
```

| Компонент | Технология | Порт |
|---|---|---|
| Frontend | React 19 + Vite 8 + TypeScript | раздаётся из dist/ через Express |
| Backend API | Express 5 + JWT + bcrypt | 3003 (тот же процесс) |
| Database | PostgreSQL 16 (Docker) | 5436 |
| Process Manager | PM2 | — |
| Telegram Bot | fetch → api.telegram.org | — |

**Nginx на сервере УДАЛЁН и отключен.** Главный nginx стоит на роутере наставника (195.158.24.137) — он проксирует `hddfix.uz` → `http://172.16.252.32:3003`.

---

## 3. Сервер

- **IP (через WireGuard VPN):** `172.16.252.32`
- **SSH:** `sshpass -p 01200120 ssh yoyo@172.16.252.32`
- **WireGuard:** конфиг в `/etc/wireguard/wg0.conf`, поднять: `sudo wg-quick up wg0`
- **Проект на сервере:** `/home/yoyo/RECOVERY_UZ`

---

## 4. База данных

```
DB_HOST=localhost
DB_PORT=5436
DB_USER=hdd_fixer
DB_PASSWORD=hdd_fixer_secret
DB_NAME=recovery_uz
```

Docker контейнер: `recovery_postgres`
Volume: `nodir_hdd_fixer_pgdata_prod`

Схема: `backend/init.sql` (users, equipments, issues, services, orders, order_details)
Сид: `node backend/seed.js`

---

## 5. Учётки (боевые)

| Роль | Логин | Пароль |
|---|---|---|
| Админ | `admin@recovery.uz` | `Admin2026!` |
| Оператор | `operator@recovery.uz` | `Operator2026!` |
| Мастер | `master@recovery.uz` | `Master2026!` |

Тестовые (из seed):

| Роль | Логин | Пароль |
|---|---|---|
| Админ | `admin@hdd-fixer.uz` | `admin123` |
| Оператор | `operator@test.uz` | `operator123` |
| Мастер | `master1@test.uz` | `master123` |
| Клиент | `client@test.uz` | `client123` |

---

## 6. Telegram

```
TELEGRAM_BOT_TOKEN=8759863943:AAHncy4_UyPHiidyTTLp5e2F9bFJCRTYqfI
TELEGRAM_CHAT_ID=-1003765182373
```

Уведомления идут в админ-группу при: новый заказ, смена статуса, назначение мастера, установка/одобрение/отклонение цены, выдача.

---

## 7. Деплой (обновление)

```bash
# С локальной машины:
cd /home/mrnurali/RECOVERY_UZ
git add -A && git commit -m "описание" && git push origin main

# На сервере (автоматом через SSH):
sshpass -p 01200120 ssh yoyo@172.16.252.32 \
  'cd /home/yoyo/RECOVERY_UZ && git fetch origin && git reset --hard origin/main && npm run build && pm2 restart recovery'
```

Или одной командой с локалки:
```bash
npm run deploy  # если добавишь скрипт
```

---

## 8. Локальная разработка

```bash
cd /home/mrnurali/RECOVERY_UZ

# 1. Поднять БД
npm run db:up

# 2. Засидить (первый раз)
npm run db:seed

# 3. Запустить
npm run server   # API + статика на :3004 (локально)
npm run dev      # Vite HMR на :5173

# Открыть http://localhost:5173/
```

`.env` локальный:
```
PORT=3004
JWT_SECRET=local-dev-jwt-secret-2026-recovery-uz-change-on-prod
DB_HOST=localhost
DB_PORT=5436
DB_USER=recovery_admin
DB_PASSWORD=recovery_secret
DB_NAME=recovery_uz
VITE_API_URL=http://localhost:3004/v1
```

---

## 9. Ключевые файлы

```
server.js                    — Единый бэкенд (API + статика dist/)
backend/init.sql             — Схема БД
backend/seed.js              — Сид тестовых данных
src/App.tsx                  — Роутинг (public/staff/client)
src/contexts/AuthContext.tsx  — JWT авторизация
src/lib/api.ts               — Axios + interceptors
src/pages/GuestOrderPage.tsx — Гостевая заявка (мульти-устройства)
src/pages/client/NewOrder.tsx— Клиентская заявка (мульти-устройства)
src/pages/staff/OrderDetail.tsx — Детали заказа (статусы, цены, мастера, удаление)
src/i18n/*.json              — Локализация (ru, en, uz-lat, uz-cyr)
```

---

## 10. Реализованный функционал

- ✅ Гостевая страница с анимацией
- ✅ Гостевая заявка без регистрации (мульти-устройства, неограниченно)
- ✅ Регистрация / Логин (JWT)
- ✅ Клиентский кабинет (мои заказы, новый заказ с мульти-устройствами)
- ✅ Панель сотрудника (dashboard, заказы, клиенты, каталог, пользователи)
- ✅ Детали заказа: смена статуса, назначение мастера, установка цены
- ✅ Админ может одобрить цену за клиента
- ✅ Админ может удалить ошибочный заказ
- ✅ Отслеживание заказа по токену (без авторизации)
- ✅ CRUD каталога (оборудование, неисправности, услуги)
- ✅ Управление пользователями (создание, смена роли, удаление)
- ✅ Telegram уведомления (админ-группа + личные клиенту)
- ✅ 4 языка (ru, en, uz-lat, uz-cyr)
- ✅ Тёмная тема, glassmorphism UI

---

## 11. Что может понадобиться дальше

- Let's Encrypt сертификат (сейчас SSL на стороне наставника)
- Backup БД по cron
- Фильтры/поиск в списке заказов
- Экспорт в Excel
- SMS-уведомления
- Печать квитанции
