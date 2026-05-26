# RECOVERY.UZ — Полный отчёт по деплою и текущему состоянию

> Документ для передачи другому AI-агенту или разработчику.
> Дата: 26 мая 2026

---

## 1. Контекст проекта

**Что это:** CRM-система сервисного центра по восстановлению данных (HDD/SSD).

**Замена старого проекта:** `/home/mrnurali/nodir_hdd_fixer` (NestJS + Next.js, тяжёлый, клиенту не понравился) → **RECOVERY_UZ** (React + Vite + Express, упрощённый).

**Роли:** admin, operator, master, client.

---

## 2. Репозиторий

- **GitHub:** https://github.com/SNurali/RECOVERY_UZ
- **Локальный:** `/home/mrnurali/RECOVERY_UZ`

---

## 3. Сервер

- **IP:** `195.158.24.137`
- **Внутренний IP (через WireGuard VPN):** `172.16.252.32`
- **Домен:** `hddfix.uz` (DNS A-запись на `195.158.24.137`)
- **Cloudflare:** **НЕТ** (проверено `dig` — DNS прямой, без CDN). HTTPS терминируется на сервере self-signed сертификатом.
- **SSH:** `yoyo@172.16.252.32:22`, пароль `01200120` (`sshpass -p 01200120 ssh yoyo@172.16.252.32`)
- **SSH через публичный IP не работает** — только через WireGuard VPN

### WireGuard VPN клиент (для SSH-доступа)
```ini
[Interface]
MTU = 1420
ListenPort = 13213
PrivateKey = ECN3qEPNQEPxypIml7e2eSks8yusLmDtdCOd2ISEImw=
Address = 10.23.23.4/24

[Peer]
PublicKey = Wh3BdouyA9oPC9h46YZLO16sjvTxPgFeiNZttZJMI3o=
Endpoint = 195.158.24.137:13231
AllowedIPs = 172.16.252.0/24
PersistentKeepalive = 10
```
Файл: `/etc/wireguard/wg0.conf`. Поднять: `sudo wg-quick up wg0`.

---

## 4. Архитектура развёрнутой системы

### Стек
- **Frontend:** React 19 + Vite 8 + TypeScript, собирается в `dist/`, раздаётся через `serve`
- **Backend:** Express + PostgreSQL (production server `server-prod.js`) или mock (`server.js`)
- **БД:** PostgreSQL 16 в Docker, volume `nodir_hdd_fixer_pgdata_prod` (со старыми данными)
- **Auth:** JWT (Bearer токен в localStorage)
- **Telegram:** есть интеграция (бот рассылает уведомления о заказах)
- **Process manager:** PM2

### Порты
| Сервис | Порт | Описание |
|---|---|---|
| Nginx HTTP | 80 | Проксирует hddfix.uz → 3003 (web) и `/v1` → 3004 (api) |
| Nginx HTTPS | 443 | Self-signed SSL, проксирует так же |
| Frontend (`serve`) | 3003 | Раздаёт `/home/yoyo/RECOVERY_UZ/dist` |
| Backend API | 3004 | `server-prod.js` с PostgreSQL |
| PostgreSQL | 5436 | Docker контейнер `recovery_postgres` |

### Что запущено на сервере
```bash
# PM2
pm2 list
# - recovery-api (server-prod.js, port 3004)
# - recovery-web (serve dist на 3003)

# Docker
sudo docker ps | grep recovery_postgres
# - recovery_postgres (Postgres 16, port 5436, volume nodir_hdd_fixer_pgdata_prod)
```

### Расположение на сервере
- Проект: `/home/yoyo/RECOVERY_UZ`
- Старый проект (остановлен): `/home/yoyo/nodir_hdd_fixer`
- Nginx config: `/etc/nginx/sites-enabled/hddfix` и `/etc/nginx/sites-enabled/smartwash`
- SSL self-signed: `/etc/nginx/ssl/selfsigned.{crt,key}`

---

## 5. Креды и токены

### Telegram бот
```
TELEGRAM_BOT_TOKEN=8759863943:AAHncy4_UyPHiidyTTLp5e2F9bFJCRTYqfI
TELEGRAM_CHAT_ID=-1003765182373
```

### PostgreSQL
```
DB_HOST=localhost
DB_PORT=5436
DB_USER=hdd_fixer
DB_PASSWORD=hdd_fixer_secret
DB_NAME=hdd_fixer_db
```

### JWT
```
JWT_SECRET=recovery-uz-prod-jwt-secret-2026-very-secure
```

### Тестовые пользователи (из реальной БД старого проекта)
Все пароли: **`admin123`**

| Роль | Email | Phone |
|---|---|---|
| admin | admin@test.uz | +998901111111 |
| admin | admin@hdd-fixer.uz | +998900000001 |
| operator | operator@test.uz | +998902222222 |
| master | master@test.uz | +998903333333 |
| client | client@test.uz | +998904444444 |

### Файл `/home/yoyo/RECOVERY_UZ/.env` (создан)
```env
TELEGRAM_BOT_TOKEN=8759863943:AAHncy4_UyPHiidyTTLp5e2F9bFJCRTYqfI
TELEGRAM_CHAT_ID=-1003765182373
JWT_SECRET=recovery-uz-prod-jwt-secret-2026-very-secure
DB_HOST=localhost
DB_PORT=5436
DB_USER=hdd_fixer
DB_PASSWORD=hdd_fixer_secret
DB_NAME=hdd_fixer_db
NODE_ENV=production
PORT=3004
```

### Файл `/home/yoyo/RECOVERY_UZ/.env.production` (для Vite build)
```env
VITE_API_URL=/v1
```

---

## 6. Текущая проблема (НЕ РЕШЕНА)

### Симптом
Открываешь `https://hddfix.uz/` в браузере → попадаешь на `https://hddfix.uz/staff` (панель сотрудника), которая показывает:
```
Заказы: 0
Активные заказы: 0
Завершённые заказы: 0
```

**Должно быть:** при открытии `/` показывается гостевая страница (GuestView с логотипом RECOVERY.UZ, кнопками «Создать заявку», «Отследить заказ», «Войти»).

### Что я уже сделал (не помогло)
1. Убрал чтение `localStorage.auth_user` при инициализации (`src/contexts/AuthContext.tsx`)
2. Изменил `HomePage` в `src/App.tsx` — теперь всегда возвращает `<GuestView />`
3. Добавил JWT request interceptor (`src/lib/api.ts`)
4. Настроил `VITE_API_URL=/v1` в `.env.production`
5. Настроил Nginx для проксирования `/v1` на 3004 (HTTP и HTTPS)
6. Добавил `serve.json` с no-cache для index.html
7. Перезапустил `pm2 restart recovery-web` многократно

### Что точно работает (проверено через curl на сервере)
```bash
# На сервере (172.16.252.32):
curl -sk https://localhost/v1/equipments -H 'Host: hddfix.uz'
# → возвращает JSON с данными ✓

curl -s http://localhost:3004/v1/health
# → {"status":"ok","db":"connected"} ✓

curl -s -X POST http://localhost:3004/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"login":"admin@test.uz","password":"admin123"}'
# → {"data":{"user":{...,"role":"admin"},"token":"eyJ..."}}  ✓
```

### Гипотезы что не так
1. **Browser cache** — старый JS-бандл из mock-сервера всё ещё в кэше (но user сказал что в инкогнито то же самое)
2. **Cloudflare кэш** — возможно есть прокси (хотя DNS прямой)
3. **Nginx правила** — конфликт между `hddfix` и `smartwash` (default_server)
4. **Сборка Vite** — возможно `VITE_API_URL` не подставился при последнем `npm run build`

### Что нужно проверить новому агенту
1. Открыть `https://hddfix.uz/` в инкогнито с DevTools → Network → посмотреть какие запросы идут и куда
2. Проверить что в текущем `dist/assets/index-*.js` baseURL = `/v1` (не `localhost:3004`)
3. Проверить `pm2 logs recovery-api` — приходят ли запросы от браузера
4. Проверить `sudo tail -f /var/log/nginx/access.log` — попадают ли запросы в правильный server block

---

## 7. Структура проекта (важные файлы)

```
/home/yoyo/RECOVERY_UZ/
├── server-prod.js          # Production backend (Express + PostgreSQL + JWT)
├── server.js               # Mock backend (для локальной разработки)
├── package.json            # Скрипты: npm run server:prod, npm run build
├── .env                    # Переменные для backend
├── .env.production         # VITE_API_URL для frontend build
├── dist/                   # Собранный frontend (сюда смотрит serve)
│   ├── index.html
│   ├── serve.json          # Конфиг serve (no-cache для html)
│   └── assets/
├── src/
│   ├── App.tsx             # Главная маршрутизация (HomePage → GuestView)
│   ├── contexts/AuthContext.tsx    # JWT auth (login/logout/me)
│   ├── lib/api.ts          # Axios + JWT interceptor
│   ├── components/GuestView.tsx    # Гостевая страница
│   ├── components/AnimatedLogo.tsx # Анимированный логотип
│   ├── pages/LoginPage.tsx
│   ├── pages/staff/...     # Dashboard, Orders, Users, Catalog, Clients
│   ├── pages/client/...    # Home, NewOrder, OrderDetail
│   └── pages/TrackOrderPage.tsx
└── backend/
    └── src/telegram/bot.js  # Telegram уведомления
```

---

## 8. Команды для деплоя/обновления

### Подключение
```bash
# С локальной машины (нужен WireGuard up)
sudo wg-quick up wg0
sshpass -p 01200120 ssh yoyo@172.16.252.32
```

### Обновление кода
```bash
cd /home/yoyo/RECOVERY_UZ
git fetch origin
git reset --hard origin/main
npm install
npm run build
pm2 restart all
```

### Проверка
```bash
pm2 list
pm2 logs recovery-api --lines 20
pm2 logs recovery-web --lines 20

# API health
curl http://localhost:3004/v1/health

# БД
sudo docker exec recovery_postgres psql -U hdd_fixer -d hdd_fixer_db -c '\dt'

# Nginx
sudo nginx -t
sudo systemctl reload nginx
sudo tail -f /var/log/nginx/access.log
```

### Если БД упала
```bash
sudo docker start recovery_postgres
# Если контейнера нет — пересоздать:
sudo docker run -d --name recovery_postgres --restart unless-stopped \
  -e POSTGRES_USER=hdd_fixer \
  -e POSTGRES_PASSWORD=hdd_fixer_secret \
  -e POSTGRES_DB=hdd_fixer_db \
  -v nodir_hdd_fixer_pgdata_prod:/var/lib/postgresql/data \
  -p 5436:5432 \
  postgres:16-alpine
```

---

## 9. Реализованный функционал

### Frontend
- ✅ Гостевая страница (логотип, hero, статистика, фичи)
- ✅ Логин/Регистрация с JWT
- ✅ Tracking заказа без авторизации
- ✅ Multi-language: ru, uz-lat, uz-cyr, en
- ✅ Tёмная тема + glassmorphism для клиентского UI
- ✅ Dashboard для сотрудников с кликабельными карточками
- ✅ Список заказов (таблица, сортировка)
- ✅ Детали заказа (для staff и client)
- ✅ Согласование цены клиентом
- ✅ Управление мастерами, статусами
- ✅ CRUD каталога (услуги, оборудование, неисправности)
- ✅ Управление пользователями (с изменением ролей)
- ✅ Анимированный логотип (Framer Motion)

### Backend (`server-prod.js`)
- ✅ POST /v1/auth/login
- ✅ POST /v1/auth/register
- ✅ POST /v1/auth/logout
- ✅ GET /v1/users/me
- ✅ GET /v1/users (admin/operator)
- ✅ GET /v1/users/masters
- ✅ POST /v1/users (admin)
- ✅ PATCH /v1/users/:id (изменение роли)
- ✅ GET /v1/clients, POST /v1/clients
- ✅ CRUD /v1/equipments, /v1/issues, /v1/services
- ✅ GET /v1/orders/list (с фильтром по client_id для роли client)
- ✅ GET /v1/orders/stats
- ✅ GET /v1/orders/:id
- ✅ POST /v1/orders
- ✅ GET /v1/orders/:id/allowed-transitions
- ✅ PATCH /v1/orders/:id (смена статуса)
- ✅ POST /v1/orders/:id/details/:detailId/assign (мастер)
- ✅ POST /v1/orders/:id/set-price, /update-price
- ✅ POST /v1/orders/:id/approve-price (клиент)
- ✅ POST /v1/orders/:id/reject-price
- ✅ POST /v1/orders/:id/close
- ✅ GET /v1/orders/track/:token (публичный)
- ✅ POST /v1/telegram/webhook
- ✅ GET /v1/health

### Telegram уведомления (в админ-чат)
- ✅ Новый заказ
- ✅ Смена статуса
- ✅ Назначение мастера
- ✅ Установка цены / одобрение / отклонение
- ✅ Заказ готов / выдан

---

## 10. Что нужно сделать новому агенту

### Срочно (баг)
1. **Понять почему `/` редиректит на `/staff`** в браузере, хотя в коде `HomePage` всегда возвращает `<GuestView />`. Скорее всего:
   - Старый JS-бандл закэширован (даже в инкогнито)
   - Или browser кэширует service worker
   - Или Vite hash в имени файла не меняется
   
2. **Способы диагностики:**
   - Открыть DevTools → Network → загрузить страницу → посмотреть какой `index-*.js` грузится и сравнить с актуальным в `/home/yoyo/RECOVERY_UZ/dist/assets/`
   - Console: `localStorage` — проверить что там
   - Console: `window.location.href` после загрузки

### Желательно
- Настроить реальный SSL (Let's Encrypt вместо self-signed)
- Создать systemd сервис для PostgreSQL контейнера (auto-restart)
- Backup БД скрипт (cron)
- HSTS, security headers в Nginx

---

## 11. История изменений (последние коммиты)

```
0fc1880 feat: always show GuestView on /, add user-aware nav button
df12654 fix: add JWT request interceptor for production auth
dc3da00 feat: add production server with PostgreSQL backend
24dcbec fix: open CORS for all origins + add request logging
bd912d1 fix: don't redirect from localStorage before API confirms auth
d86172a fix: remove unused imports in GuestOrderPage
ec23560 fix: remove unused variables for production build
eb8033f docs: add deployment guide for production server
8c893d7 feat: RECOVERY.UZ v2 - full UI redesign with Telegram bot integration
```

---

## 12. Контакты

- Владелец репозитория: SNurali (GitHub)
- Сервер админ: yoyo@172.16.252.32
- Telegram группа уведомлений: -1003765182373
